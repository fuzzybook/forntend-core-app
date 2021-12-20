<template>
  <q-page>
    <q-toolbar class="bg-secondary text-white shadow-2">
      <q-btn
        class="q-px-md"
        dense
        color="primary"
        :icon="
          templates && selectedTemplate
            ? templates[selectedTemplate].icon
            : 'help'
        "
        ><span class="q-px-md">{{
          selectedTemplate ? selectedTemplate : 'Select template'
        }}</span>
        <q-menu>
          <q-list v-if="templates" style="min-width: 200px">
            <q-item
              v-for="(v, k) in templates"
              :key="k"
              clickable
              v-close-popup
              @click="selectTemplate(k)"
            >
              <q-item-section
                ><div class="row">
                  <q-icon class="q-mr-md" :name="v.icon" />{{ k }}
                </div></q-item-section
              >
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
      <q-btn
        class="q-ml-md q-px-md"
        dense
        icon="save"
        color="primary"
        @click="save"
        ><span class="q-px-md">save</span></q-btn
      >
      <q-space />
    </q-toolbar>
    <q-splitter v-model="splitterModel" class="splitter">
      <template v-slot:before>
        <div v-if="selectedTemplate" class="fit container">
          <MonacoEditor
            ref="editor"
            v-model="code"
            :templateType="templates[selectedTemplate].type"
            :selectedTemplate="selectedTemplate"
          />
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
import useSystem, { TransactionalMailTemplate } from 'src/modules/useSystem';
import MonacoEditor from 'components/MonacoEditor/Editor.vue';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'PageIndex',
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  components: { MonacoEditor },
  setup() {
    const $q = useQuasar();
    const { user, isLogged } = useUser();
    const {
      isIdle,
      transctionalMails,
      getTransctionalMail,
      saveTransctionalMail,
    } = useSystem();
    const render = ref<HTMLIFrameElement>();
    let window: Window | null;
    const editor = ref(null);
    const templates = ref<TransactionalMailTemplate>({});
    const templatesOptions = ref<string[]>();
    const selectedTemplate = ref('');
    const html = ref();
    const code = ref('');

    const renderHtml = (html: string) => {
      if (window) {
        window.document.open();
        window.document.write(html);
        window.document.close();
      }
    };
    provide('renderHtml', renderHtml);

    onMounted(async () => {
      const t = await transctionalMails();
      if (typeof t !== 'string') {
        templates.value = t.templates;
        console.log(t);
        templatesOptions.value = Object.keys(t.templates);
        //selectedTemplate.value = templatesOptions.value[0];
        //code.value = await getTransctionalMail(selectedTemplate.value);
      }
      if (render.value) {
        window = render.value.contentWindow;

        if (window) {
          window.document.open();
          window.document.write(html.value);
          window.document.close();
        }
      }
    });

    const selectTemplate = async (template: string) => {
      selectedTemplate.value = template;
      code.value = await getTransctionalMail(selectedTemplate.value);
    };

    const save = async () => {
      debugger;
      if (editor.value) {
        const html = (
          editor.value as unknown as { getValue: () => string }
        ).getValue();
        console.log(html);
        const result = await saveTransctionalMail(html, selectedTemplate.value);
        if (typeof result !== 'string') {
          $q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'thumb_up_off_alt',
            message: `template ${selectedTemplate.value} saved sucessfully`,
            position: 'top-right',
            timeout: 3000,
          });
        } else {
          $q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'thumb_down_off_alt',
            message: `template ${selectedTemplate.value} save error`,
            position: 'top-right',
            timeout: 3000,
          });
        }
      }
    };

    return {
      editor,
      splitterModel: ref(50), // start at 50%,
      code,
      render,
      user,
      isLogged,
      isIdle,
      templates,
      templatesOptions,
      selectedTemplate,
      selectTemplate,
      save,
    };
  },
});
</script>
