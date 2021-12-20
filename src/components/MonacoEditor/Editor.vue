<template>
  <q-dialog v-model="dialogCostants" persistent>
    <q-card style="min-width: 450px">
      <q-card-section class="row items-center">
        <span class="q-ml-sm text-h6">Insert Constants</span>
      </q-card-section>

      <q-card-section class="row items-center">
        <q-list>
          <q-item
            v-for="(v, k) in constants"
            :key="k"
            clickable
            v-close-popup
            @click="insertThisConstant(k.toString())"
          >
            <q-item-section
              ><div class="row">{{ k }}: {{ v }}</div></q-item-section
            >
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="dialogVars" persistent>
    <q-card style="min-width: 450px">
      <q-card-section class="row items-center">
        <span class="q-ml-sm text-h6">Insert Vars</span>
      </q-card-section>

      <q-card-section class="row items-center">
        <q-list v-if="vars">
          <q-item
            v-for="(v, k) in vars"
            :key="k"
            clickable
            v-close-popup
            @click="insertThisConstant(v.var)"
          >
            <q-item-section
              ><div class="row">
                <b>{{ v.var }}:</b
                ><span class="q-pl-md"
                  ><i>{{ v.description }}</i></span
                >
              </div></q-item-section
            >
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <div class="fit">
    <div ref="container" class="fit"></div>
    <q-resize-observer @resize="onResize" />
  </div>
</template>

<script lang="ts">
// import ExampleComponent from 'components/CompositionComponent.vue';
import {
  defineComponent,
  ref,
  onMounted,
  onUnmounted,
  watch,
  inject,
  PropType,
  computed,
} from 'vue';
import useUser from 'src/modules/useUser';
import useSystem, {
  MJMLError,
  TransactionalMailTemplateVar,
} from 'src/modules/useSystem';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export default defineComponent({
  name: 'MonacoEditor',
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  components: {},
  props: {
    modelValue: {
      type: String as PropType<string>,
      required: true,
    },
    templateType: {
      type: String as PropType<string>,
      required: true,
    },
    selectedTemplate: {
      type: String as PropType<string>,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const dialogCostants = ref(false);
    const dialogVars = ref(false);
    const { user, isLogged } = useUser();
    const { isIdle, renderMjml, transctionalMails } = useSystem();
    const container = ref<HTMLDivElement>();
    let editor: monaco.editor.IStandaloneCodeEditor;
    const renderHtml = inject('renderHtml') as (test: string) => void;
    const constants = ref();
    const vars = ref<TransactionalMailTemplateVar[]>();

    const code = computed({
      get: () => {
        return props.modelValue;
      },
      set: (value) => {
        emit('update:modelValue', value);
      },
    });

    const insertVar = () => {
      dialogVars.value = true;
    };

    const insertThisVar = (c: string) => {
      console.log(c);
      //editor.trigger('keyboard', 'type', { text: c });

      var selection = editor.getSelection();
      var id = { major: 1, minor: 1 };
      var op = <monaco.editor.IIdentifiedSingleEditOperation>{
        identifier: id,
        range: selection,
        text: `<%= constant:${c} %>`,
        forceMoveMarkers: true,
      };
      editor.executeEdits('my-source', [op]);
    };

    const insertConstant = () => {
      dialogCostants.value = true;
    };

    const insertThisConstant = (c: string) => {
      console.log(c);
      //editor.trigger('keyboard', 'type', { text: c });

      var selection = editor.getSelection();
      var id = { major: 1, minor: 1 };
      var op = <monaco.editor.IIdentifiedSingleEditOperation>{
        identifier: id,
        range: selection,
        text: `<%= var:${c} %>`,
        forceMoveMarkers: true,
      };
      editor.executeEdits('my-source', [op]);
    };

    /*

    find next tag end

    const findTagEnd = (
      line: number,
      start: number,
      model: monaco.editor.ITextModel
    ): { endPos: number; endLine: number } => {
      let myLine = line;
      let myStart = start;
      const find = (myLine: number, myStart: number) => {
        var text = model.getLineContent(myLine);
        let nextPos = text.substr(myStart).indexOf('>');
        if (nextPos === -1) {
          console.log('not found coser tag');
          return false;
        } else {
          return nextPos;
        }
      };
      let p: number | false = false;
      let maxLoops = 0;
      do {
        p = find(myLine, myStart);
        if (!p) {
          myLine++;
          myStart = 0;
          if (maxLoops > 10) p = 255;
        }
      } while (!p);
      return { endPos: p ? p : 255, endLine: myLine };
    }; */

    const parseErrors = (errors: MJMLError[]) => {
      const model = editor.getModel();
      const markers: monaco.editor.IMarkerData[] = [];
      if (model) {
        errors.map((e) => {
          var line = model.getLineContent(parseInt(e.line));
          e.startLine = parseInt(e.line);
          e.startPos = line.indexOf(e.tagName) + 1;
          // const next = findTagEnd(e.startLine, e.startPos, model);
          e.endPos = e.startPos + e.tagName.length;
          e.endLine = e.startLine;

          markers.push({
            severity: monaco.MarkerSeverity.Error,
            startLineNumber: e.startLine,
            startColumn: e.startPos,
            endLineNumber: e.endLine,
            endColumn: e.endPos,
            message: e.message,
          });
        });
        monaco.editor.setModelMarkers(model, 'mySpecialLanguage', markers);
      }
      console.log(errors);
    };

    const getValue = () => {
      return editor.getValue();
    };

    const doRenderMjml = async (html: string, type: string) => {
      const result = await renderMjml(html, type);
      if (result.errors) {
        parseErrors(result.errors);
      }
      renderHtml(result.html);
      return result;
    };

    onMounted(async () => {
      const t = await transctionalMails();
      if (typeof t !== 'string') {
        constants.value = t.constants;
        vars.value = t.templates[props.selectedTemplate].vars;
      }
      const interval = setInterval(() => {
        if (container.value) {
          clearInterval(interval);
          editor = monaco.editor.create(container.value, {
            language: 'html',
            value: '',
            theme: 'vs-dark',
          });

          editor.onDidChangeModelContent(async () => {
            await doRenderMjml(editor.getValue(), props.templateType);
          });

          editor.addAction({
            id: 'myInsertConstant',
            label: 'Insert Constant',
            contextMenuGroupId: '9_cutcopypaste',
            run: () => {
              insertConstant();
            },
          });

          editor.addAction({
            id: 'myInsertVars',
            label: 'Insert Variable',
            contextMenuGroupId: '9_cutcopypaste',
            run: () => {
              insertVar();
            },
          });

          editor.setValue(code.value || '');
        }
      }, 50);
    });

    onUnmounted(() => {
      editor?.dispose();
    });

    const onResize = () => {
      if (editor) editor.layout();
    };

    watch(
      () => code.value,
      (val) => {
        if (editor) {
          editor.setValue(val);
        }
      }
    );

    return {
      onResize,
      container,
      dialogCostants,
      dialogVars,
      user,
      isLogged,
      isIdle,
      constants,
      vars,
      getValue,
      insertThisConstant,
      insertThisVar,
    };
  },
});
</script>
