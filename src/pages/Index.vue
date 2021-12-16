<template>
  <q-page>
    <q-toolbar class="bg-secondary text-white shadow-2">
      <q-btn flat round dense icon="menu" class="q-mr-sm" />

      <q-space />
    </q-toolbar>
    <q-splitter v-model="splitterModel" class="splitter">
      <template v-slot:before>
        <div class="fit container">
          <MonacoEditor />
        </div>
      </template>

      <template v-slot:after>
        <div class="fit container">
          <iframe ref="render" width="100%" height="100%" frameborder="0">
          </iframe>
        </div>
      </template>
    </q-splitter>
  </q-page>
</template>

<style lang="scss" scoped>
.splitter {
  height: calc(100vh - 100px);
  .q-splitter__panel {
    overflow: hidden !important;
    .container {
      overflow: hidden !important;
    }
  }
}
</style>

<script lang="ts">
// import ExampleComponent from 'components/CompositionComponent.vue';
import { defineComponent, ref, onMounted, provide } from 'vue';
import useUser from 'src/modules/useUser';
import useSystem from 'src/modules/useSystem';
import MonacoEditor from 'components/MonacoEditor/Editor.vue';

export default defineComponent({
  name: 'PageIndex',
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  components: { MonacoEditor },
  setup() {
    const { user, isLogged } = useUser();
    const { isIdle } = useSystem();
    const render = ref<HTMLIFrameElement>();
    let window: Window | null;
    const html = ref(`
        <head>
    <title>Quasar App</title>
    <meta charset="utf-8">
    <meta name="description" content="A Quasar Framework app">
    <meta name="format-detection" content="telephone=no">
    <meta name="msapplication-tap-highlight" content="no">
    <meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width">
    </head>
        <body><div id="foo"><b>bar</b></div></body>`);

    const doTest = (html: string) => {
      if (window) {
        window.document.open();
        window.document.write(html);
        window.document.close();
      }
    };
    provide('doTest', doTest);

    onMounted(() => {
      if (render.value) {
        window = render.value.contentWindow;

        if (window) {
          window.document.open();
          window.document.write(html.value);
          window.document.close();
        }
      }
    });

    return {
      splitterModel: ref(50), // start at 50%,
      render,
      user,
      isLogged,
      isIdle,
    };
  },
});
</script>
