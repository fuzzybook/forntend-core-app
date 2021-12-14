<template>
  <div class="fit">
    <div ref="container" class="fit" style="border: 1px solid red"></div>
    <q-resize-observer @resize="onResize" />
  </div>
</template>

<script lang="ts">
// import ExampleComponent from 'components/CompositionComponent.vue';
import { defineComponent, ref, onMounted, onUnmounted, watch } from 'vue';
import useUser from 'src/modules/useUser';
import useSystem from 'src/modules/useSystem';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export default defineComponent({
  name: 'MonacoEditor',
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  components: {},
  setup() {
    const { user, isLogged } = useUser();
    const { isIdle } = useSystem();
    const code = ref('const noop = () => {}');
    const container = ref<HTMLDivElement>();
    let editor: monaco.editor.IStandaloneCodeEditor;

    onMounted(() => {
      console.log(monaco);
      const interval = setInterval(() => {
        if (container.value) {
          console.log(container.value);
          // VueComponent{}
          editor = monaco.editor.create(container.value, {
            language: 'html',
            value: '',

            theme: 'vs-dark',
          });
          editor.setValue(code.value);
          editor.onDidChangeModelContent(function (e) {
            console.log(e);
          });
          clearInterval(interval);
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
