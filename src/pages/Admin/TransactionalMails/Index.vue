<template>
  <q-page style="background-color: #1f2227">
    <q-splitter v-model="splitterModel" class="splitter">
      <template v-slot:before>
        <q-toolbar
          class="text-white shadow-2"
          style="background-color: #1f2227"
        >
          <q-btn
            class="q-px-md"
            size="sm"
            outline
            color="white"
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
            size="sm"
            outline
            color="white"
            icon="save"
            @click="save"
            ><span class="q-px-md">save</span></q-btn
          >
          <q-space />
        </q-toolbar>
        <div v-if="selectedTemplate" class="fit container">
          <MonacoEditor
            class="editor"
            ref="editor"
            v-model="code"
            :templateType="templates[selectedTemplate].type"
            :selectedTemplate="selectedTemplate"
          />
        </div>
      </template>

      <template v-slot:after>
        <div class="fit preview">
          <iframe ref="render" width="100%" height="100%" frameborder="0">
          </iframe>
        </div>
      </template>
    </q-splitter>

    <q-dialog v-model="dialogVars" persistent>
      <q-card style="min-width: 450px">
        <q-card-section class="row items-center">
          <span class="q-ml-sm text-h5">Test Inserted Vars</span>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section class="row items-center">
          <q-list v-if="varsErrors">
            <q-item
              v-for="(v, k) in varsErrors"
              :key="k"
              clickable
              v-close-popup
            >
              <q-item-section>
                <div class="row items-center">
                  <span class="q-mr-md" :style="{ color: v ? 'green' : 'red' }"
                    ><b>{{ k }}</b></span
                  >
                  <q-icon
                    name="done"
                    :color="v ? 'green' : 'red'"
                    style="font-size: 1.5rem"
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
          <div class="q-mt-md fit row justify-center">
            <b>Some variables are not inserted!</b>
          </div>
          <div class="q-mt-md fit row justify-center">
            <b>Please correct before save template</b>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style lang="scss" scoped>
.splitter {
  height: calc(100vh - 50px);
  .q-splitter__panel {
    overflow: hidden !important;
    .container {
      overflow: hidden !important;
      max-height: calc(100vh - 100px);
    }
    .preview {
      overflow: hidden !important;
      max-height: calc(100vh - 50px);
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
  name: 'PageTransactionalMails',
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
    const html = ref('');
    const code = ref('');
    const preview = ref(false);
    const dialogVars = ref(false);
    const varsError = ref(false);
    const varsErrors = ref<{ [key: string]: boolean }>({});

    const renderHtml = (html: string) => {
      if (window) {
        window.document.open();
        window.document.write(html || '');
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
          window.document.write(html.value || '');
          window.document.close();
        }
      }
    });

    const selectTemplate = async (template: string) => {
      selectedTemplate.value = template;
      code.value = await getTransctionalMail(selectedTemplate.value);
    };

    const save = async () => {
      if (editor.value) {
        const html = (
          editor.value as unknown as { getValue: () => string }
        ).getValue();

        const test = (
          editor.value as unknown as {
            testVars: () => {
              error: boolean;
              vars: { [key: string]: boolean };
            };
          }
        ).testVars();

        varsError.value = false;
        varsErrors.value = {};
        if (test.error) {
          varsError.value = test.error;
          varsErrors.value = test.vars;
          dialogVars.value = true;
          return;
        }

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
      preview,
      varsErrors,
      varsError,
      dialogVars,
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
