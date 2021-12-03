<template>
  <div class="column">
    <div class="text-h6">Contacts</div>
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
      <div class="q-mb-md">
        <q-input
          ref="phoneNumberRef"
          v-model="phoneNumber"
          label="Phone Number"
          :disable="!onEdit"
          debounce="500"
          lazy-rules
          stack-label
          :dense="!$q.platform.is.desktop"
        />
      </div>
      <div class="q-mb-md">
        <q-input
          ref="mobileNumberRef"
          v-model="mobileNumber"
          label="Mobile Number"
          :disable="!onEdit"
          lazy-rules
          stack-label
          :dense="!$q.platform.is.desktop"
        />
      </div>

      <q-input
        ref="address1Ref"
        v-model="address1"
        label="Address"
        :disable="!onEdit"
        stack-label
        :rules="[(val) => !!val || 'Field is required']"
        lazy-rules
        :dense="!$q.platform.is.desktop"
        hide-bottom-space
      />

      <q-input
        ref="address2Ref"
        v-model="address2"
        label="Address"
        :disable="!onEdit"
        stack-label
        :rules="[(val) => !!val || 'Field is required']"
        lazy-rules
        :dense="!$q.platform.is.desktop"
        hide-bottom-space
      />

      <q-input
        ref="zipRef"
        v-model="zip"
        label="Zip Code"
        :disable="!onEdit"
        stack-label
        :rules="[(val) => !!val || 'Field is required']"
        lazy-rules
        :dense="!$q.platform.is.desktop"
        hide-bottom-space
      />

      <q-input
        ref="cityRef"
        v-model="city"
        label="City"
        :disable="!onEdit"
        stack-label
        :rules="[(val) => !!val || 'Field is required']"
        lazy-rules
        :dense="!$q.platform.is.desktop"
        hide-bottom-space
      />

      <q-select
        ref="countryRef"
        v-model="country"
        :disable="!onEdit"
        label="Country"
        stack-label
        :rules="[(val) => !!val || 'Field is required']"
        lazy-rules
        use-input
        hide-selected
        fill-input
        input-debounce="0"
        :options="countyOptions"
        @filter="filterFn"
        :dense="!$q.platform.is.desktop"
        hide-bottom-space
      />
    </q-form>
  </div>
</template>

<script lang="ts">
// import ExampleComponent from 'components/CompositionComponent.vue';
import { defineComponent, ref, onMounted } from 'vue';
import useUser from 'src/modules/useUser';
import { QInput, QForm, QSelect, useQuasar } from 'quasar';

import { countries } from 'src/config/countries';

type Callback = () => void;
interface CountryOption {
  value: string;
  label: string;
}

export default defineComponent({
  name: 'ContactsData',
  components: { QForm },
  setup() {
    const $q = useQuasar();
    const showError = ref<boolean>(false);
    const errorMessage = ref<string>('');
    const { user, saveUserContacts } = useUser();

    const onEdit = ref(false);

    const phoneNumberRef = ref<QInput>();
    const mobileNumberRef = ref<QInput>();
    const address1Ref = ref<QInput>();
    const address2Ref = ref<QInput>();
    const zipRef = ref<QInput>();
    const cityRef = ref<QInput>();
    const countryRef = ref<QSelect>();

    const phoneNumber = ref('');
    const mobileNumber = ref('');
    const address1 = ref('');
    const address2 = ref('');
    const zip = ref('');
    const city = ref('');
    const country = ref<CountryOption>();

    const countyOptions = ref<CountryOption[]>(countries);

    onMounted(() => {
      reset();
    });

    const getOption = (country: string): CountryOption | undefined => {
      const found = countries.find((element) => element.value == country);
      return found;
    };

    const reset = () => {
      if (user.value?.profile) {
        phoneNumber.value = user?.value?.profile?.phoneNumber || '';
        mobileNumber.value = user?.value?.profile?.mobileNumber || '';
        address1.value = user?.value?.profile?.address1 || '';
        address2.value = user?.value?.profile?.address2 || '';
        zip.value = user?.value?.profile?.zip || '';
        city.value = user?.value?.profile?.city || '';
        country.value = getOption(user?.value?.profile?.country || '');
      }
      phoneNumberRef.value?.resetValidation();
      mobileNumberRef.value?.resetValidation();
      address1Ref.value?.resetValidation();
      address2Ref.value?.resetValidation();
      zipRef.value?.resetValidation();
      cityRef.value?.resetValidation();
      countryRef.value?.resetValidation();
      onEdit.value = false;
    };

    const onSave = async () => {
      if (!(await address1Ref.value?.validate())) return;
      if (!(await zipRef.value?.validate())) return;
      if (!(await cityRef.value?.validate())) return;
      if (!(await countryRef.value?.validate())) return;

      const result = await saveUserContacts(
        phoneNumber.value,
        mobileNumber.value,
        address1.value,
        address2.value,
        zip.value,
        city.value,
        country.value?.value || ''
      );
      if (result === true) {
        $q.notify({
          color: 'positive',
          textColor: 'white',
          icon: 'thumb_up_off_alt',
          message: 'main data updated successfully!',
          position: 'top-right',
          timeout: 3000,
        });
        onEdit.value = false;
      } else {
        $q.notify({
          color: 'negative',
          textColor: 'white',
          icon: 'thumb_down_off_alt',
          message: 'main data update error',
          position: 'top-right',
          timeout: 3000,
        });
      }
    };

    return {
      user,
      showError,
      errorMessage,
      onEdit,

      phoneNumberRef,
      mobileNumberRef,
      address1Ref,
      address2Ref,
      zipRef,
      cityRef,
      countryRef,

      phoneNumber,
      mobileNumber,
      address1,
      address2,
      zip,
      city,
      country,

      countyOptions,

      tab: ref('mails'),

      reset,
      onSave,

      start() {
        setTimeout(() => {
          phoneNumberRef?.value?.focus();
        }, 20);
      },
      filterFn(val: string, update: (p: Callback) => void, abort: () => void) {
        if (val.length < 2) {
          abort();
          return;
        }

        update(() => {
          const needle = val.toLowerCase();
          countyOptions.value = countries.filter(
            (v) => v.label.toLowerCase().indexOf(needle) > -1
          );
        });
      },
    };
  },
});
</script>
