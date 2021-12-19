<template>
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
import useSystem, { MJMLError } from 'src/modules/useSystem';
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
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { user, isLogged } = useUser();
    const { isIdle, renderMjml } = useSystem();
    const container = ref<HTMLDivElement>();
    let editor: monaco.editor.IStandaloneCodeEditor;
    const renderHtml = inject('renderHtml') as (test: string) => void;

    const code = computed({
      get: () => {
        return props.modelValue;
      },
      set: (value) => {
        emit('update:modelValue', value);
      },
    });

    const test = (p: string) => {
      alert(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `Add your custom pasting code here ${p}`
      );
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

    onMounted(() => {
      console.log(monaco);
      const interval = setInterval(() => {
        if (container.value) {
          clearInterval(interval);
          editor = monaco.editor.create(container.value, {
            language: 'html',
            value: '',

            theme: 'vs-dark',
          });
          editor.setValue(code.value || '');
          editor.onDidChangeModelContent(async () => {
            const { html, errors } = await renderMjml(editor.getValue());
            console.log(errors);
            if (errors) {
              parseErrors(errors);
            }
            renderHtml(html);
          });
          editor.addAction({
            id: 'myPaste',
            label: '423',
            contextMenuGroupId: '9_cutcopypaste',
            run: (editor: monaco.editor.ICodeEditor) => {
              const p = editor.getPosition();
              test(p?.toString() || '?');
            },
          });
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
        editor.setValue(val);
      }
    );

    return {
      onResize,
      container,

      user,
      isLogged,
      isIdle,

      getValue,
    };
  },
});
</script>
