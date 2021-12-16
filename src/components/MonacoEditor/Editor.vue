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
} from 'vue';
import useUser from 'src/modules/useUser';
import useSystem from 'src/modules/useSystem';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { debounce } from 'quasar';

export default defineComponent({
  name: 'MonacoEditor',
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  components: {},
  setup() {
    const { user, isLogged } = useUser();
    const { isIdle, renderMjml } = useSystem();
    const code = ref('const noop = () => {}');
    const container = ref<HTMLDivElement>();
    let editor: monaco.editor.IStandaloneCodeEditor;
    const doTest = inject('doTest') as (test: string) => void;

    const test = (p: string) => {
      alert(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `Add your custom pasting code here ${p}`
      );
    };

    onMounted(() => {
      console.log(monaco);
      const interval = setInterval(() => {
        if (container.value) {
          clearInterval(interval);
          console.log(container.value);
          // VueComponent{}
          editor = monaco.editor.create(container.value, {
            language: 'html',
            value: '',

            theme: 'vs-dark',
          });
          editor.setValue(code.value);
          editor.onDidChangeModelContent(function (e) {
            void renderMjml(editor.getValue()).then((data: string) => {
              doTest(data);
            });
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

    const onResize = (size: unknown) => {
      console.log(size);
      editor.layout();
    };

    watch(code, (value) => {
      console.log(value);
      debounce(async () => {
        await renderMjml(value);
      }, 1000);
    });

    return {
      onResize,
      container,
      code,
      user,
      isLogged,
      isIdle,
    };
  },
});
</script>
