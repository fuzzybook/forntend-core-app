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

      <div class="row items-center q-pa-sm" v-for="(v, k) in socials" :key="k">
        <div class="col-12">
          <q-icon><img :src="`${siteConfig.url}icons/${v.icon}`" /></q-icon>
          <span class="q-mx-md">{{ v.label }}</span>
        </div>
        <div class="col-12 socials-mask">
          <q-input
            :ref="(el) => setItemRef(el)"
            bottom-slots
            type="text"
            v-model="socialsData[k].address"
            :disable="!onEdit"
            @update:model-value="(v) => updateField(v, k)"
          >
            <template v-slot:hint
              ><span class="mask text-blue-grey-7">{{
                `${v.addressMask}${socialsData[k].address}`
              }}</span></template
            >
          </q-input>
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
import { defineComponent, ref, onMounted, onBeforeUpdate, PropType } from 'vue';
import useUser, { ISocialsInput } from 'src/modules/useUser';
import { QForm, QInput, useQuasar } from 'quasar';
import useSystem, { ISocials } from 'src/modules/useSystem';
import { siteConfig } from 'src/APPLICATION/config/site';
import { UserResponse } from 'src/grapql';

export default defineComponent({
  name: 'SocialsData',
  components: { QForm },
  props: {
    userRow: {
      type: Object as PropType<UserResponse>,
      required: false,
      default: null,
    },
  },
  emits: ['update'],
  setup(props, { emit }) {
    const $q = useQuasar();
    const showError = ref<boolean>(false);
    const errorMessage = ref<string>('');
    const { user, saveSocials, saveUserSocials } = useUser();
    const { getSocials } = useSystem();
    const socials = ref<ISocials>({});
    const socialsData = ref<ISocialsInput>({});

    const first = ref<QInput | null>();

    const onEdit = ref(false);
    const userData = ref<UserResponse>(<UserResponse>{});

    const setItemRef = (el: QInput) => {
      if (el && !first.value) {
        first.value = el;
      }
    };

    onBeforeUpdate(() => {
      first.value = null;
    });

    onMounted(() => {
      if (!props.userRow) {
        userData.value = user.value as UserResponse;
      } else {
        userData.value = props.userRow;
      }
      reset();
    });

    const reset = () => {
      socials.value = getSocials() as ISocials;

      if (userData.value?.socials) {
        const s = userData.value.socials as unknown as ISocialsInput;
        for (const i in socials.value) {
          socialsData.value[i] = s[i];
        }
      } else {
        for (const i in socials.value) {
          socialsData.value[i] = { address: '' };
        }
      }
      onEdit.value = false;
    };

    const onSave = async () => {
      let result;

      if (props.userRow) {
        const id: string = userData.value?.id || '';
        result = await saveUserSocials(id, socialsData.value);
      } else {
        result = await saveSocials(socialsData.value);
      }

      if (typeof result !== 'string') {
        emit('update', result);
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

    const updateField = (v: string, index: string) => {
      socialsData.value[index].address = v;
    };

    return {
      first,
      userData,
      showError,
      errorMessage,
      onEdit,
      socials,
      siteConfig,
      socialsData,
      updateField,
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
