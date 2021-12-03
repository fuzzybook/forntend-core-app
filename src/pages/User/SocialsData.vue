<template>
  <div class="column">
    <div class="text-h6">Social links</div>
    <q-separator />
    <q-form
      class="q-gutter-md"
      autocorrect="off"
      autocapitalize="off"
      autocomplete="off"
      spellcheck="false"
    >
      <div class="row q-py-sm">
        <q-btn
          v-if="!onEdit"
          class="q-mr-sm"
          dense
          style="min-width: 60px"
          color="primary"
          icon="edit"
          @click="
            onEdit = !onEdit;
            start();
          "
          ><span class="q-mx-sm">edit</span></q-btn
        >
        <q-btn
          v-if="onEdit"
          dense
          style="min-width: 60px"
          color="primary"
          icon="save"
          @click="onSave"
          ><span class="q-mx-sm">save</span></q-btn
        >

        <q-btn
          class="q-ml-md"
          v-if="onEdit"
          dense
          flat
          style="min-width: 60px"
          color="primary"
          @click="reset()"
          ><span class="q-mx-sm">reset</span></q-btn
        >
      </div>
      <div v-if="$q.platform.is.desktop">
        <div
          class="row items-center q-pa-sm"
          v-for="(v, k) in socials"
          :key="k"
        >
          <div class="col-2">
            <q-icon><img :src="`${siteConfig.url}icons/${v.icon}`" /></q-icon>
            <span class="q-mx-md">{{ v.label }}</span>
          </div>
          <div class="col-6 socials-mask">
            <q-input
              :ref="(el) => setItemRef(el)"
              type="text"
              v-model="socialsData[k].address"
              :disable="!onEdit"
            >
              <template v-slot:prepend>
                <span class="mask">{{ v.addressMask }}</span>
              </template>
            </q-input>
          </div>
        </div>
      </div>
      <div v-else>
        <div
          class="row items-center q-pa-sm"
          v-for="(v, k) in socials"
          :key="k"
        >
          <div class="col-12">
            <q-icon><img :src="`${siteConfig.url}icons/${v.icon}`" /></q-icon>
            <span class="q-mx-md">{{ v.label }}</span>
          </div>
          <div class="col-12 socials-mask">
            <q-input
              :ref="(el) => setItemRef(el)"
              type="text"
              v-model="socialsData[k].address"
              :disable="!onEdit"
              stack-label
              :label="v.addressMask"
              dense
            >
            </q-input>
          </div>
        </div>
      </div>
    </q-form>
  </div>
</template>

<style lang="sass" scoped>
.socials-mask
  .mask
    font-size: 14px
    font-weight: bold
    color: black
.q-if-label
  transform: translateY(-60%) scale(0.85)!important
  font-weight: bold!important
</style>

<script lang="ts">
// import ExampleComponent from 'components/CompositionComponent.vue';
import { defineComponent, ref, onMounted, onBeforeUpdate } from 'vue';
import useUser from 'src/modules/useUser';
import { QForm, QInput, useQuasar } from 'quasar';
import useSystem, { ISocials } from 'src/modules/useSystem';
import { siteConfig } from 'src/APPLICATION/config/site';

type ISocialInput = { address: string };
type ISocialsInput = { [key: string]: ISocialInput };

export default defineComponent({
  name: 'SocialsData',
  components: { QForm },
  setup() {
    const $q = useQuasar();
    const showError = ref<boolean>(false);
    const errorMessage = ref<string>('');
    const { user, saveSocials } = useUser();
    const { getSocials } = useSystem();
    const socials = ref<ISocials>({});
    const socialsData: ISocialsInput = {};

    const first = ref<QInput | null>();

    const onEdit = ref(false);

    const setItemRef = (el: QInput) => {
      if (el && !first.value) {
        first.value = el;
      }
    };

    onBeforeUpdate(() => {
      first.value = null;
    });

    onMounted(() => {
      reset();
    });

    const reset = () => {
      socials.value = getSocials() as ISocials;

      if (user.value?.socials) {
        const s = user.value.socials as unknown as ISocialsInput;
        for (const i in socials.value) {
          socialsData[i] = s[i];
          socialsData[i].address = i;
        }
      }
      onEdit.value = false;
    };

    const onSave = async () => {
      console.log('onSave');
      const result = await saveSocials(JSON.stringify(socialsData));
      if (result === true) {
        $q.notify({
          color: 'positive',
          textColor: 'white',
          icon: 'thumb_up_off_alt',
          message: 'socials data updated successfully!',
          position: 'top-right',
          timeout: 3000,
        });
        onEdit.value = false;
      } else {
        $q.notify({
          color: 'negative',
          textColor: 'white',
          icon: 'thumb_down_off_alt',
          message: 'socials data update error',
          position: 'top-right',
          timeout: 3000,
        });
      }
    };

    return {
      first,
      user,
      showError,
      errorMessage,
      onEdit,
      socials,
      siteConfig,
      socialsData,
      reset,
      onSave,
      setItemRef,
      start() {
        setTimeout(() => {
          console.log();
          (first.value as QInput)?.focus();
        }, 20);
      },
    };
  },
});
</script>
