<template>
  <div class="column">
    <div class="text-h6">Main Data</div>
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

      <q-input
        ref="nicknameRef"
        v-model="nickname"
        label="Nickname"
        :disable="!onEdit"
        debounce="500"
        stack-label
        :rules="[
          (val) => val.length >= 2 || 'Minimum length is 2 characters',
          requiredRule,
        ]"
        lazy-rules
        :dense="!$q.platform.is.desktop"
        hide-bottom-space
      />
      <div class="q-pl-md row full-width">
        <div style="min-width: 100px">
          <q-select
            class="q-pr-md"
            ref="titleSelectRef"
            v-model="titleSelect"
            :options="titleOptions"
            :disable="!onEdit"
            label="Title"
            stack-label
            :rules="[(val) => !!val || 'Field is required']"
            lazy-rules
            @change="selected"
            :dense="!$q.platform.is.desktop"
            hide-bottom-space
          />
        </div>
        <div style="flex: 1">
          <q-input
            v-if="titleSelect == 'Other'"
            ref="titleRef"
            v-model="title"
            autofocus
            label="Other title"
            stack-label
            :disable="!onEdit"
            :rules="[(val) => !!val || 'Field is required']"
            lazy-rules
            :dense="!$q.platform.is.desktop"
            hide-bottom-space
          />
        </div>
      </div>
      <q-input
        ref="firstnameRef"
        v-model="firstname"
        label="Firstname"
        :disable="!onEdit"
        stack-label
        :rules="[(val) => !!val || 'Field is required']"
        lazy-rules
        :dense="!$q.platform.is.desktop"
        hide-bottom-space
      />
      <q-input
        ref="lastnameRef"
        v-model="lastname"
        label="Lastname"
        :disable="!onEdit"
        stack-label
        :rules="[(val) => !!val || 'Field is required']"
        lazy-rules
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

export default defineComponent({
  name: 'MainData',
  components: { QForm },
  setup() {
    const $q = useQuasar();
    const showError = ref<boolean>(false);
    const errorMessage = ref<string>('');
    const { user, saveUserMainData, nicknameExist } = useUser();
    const text = ref('');
    const onEdit = ref(false);
    const nicknameRef = ref<QInput>();
    const titleSelectRef = ref<QSelect>();
    const titleRef = ref<QInput>();
    const firstnameRef = ref<QInput>();
    const lastnameRef = ref<QInput>();

    const nickname = ref('');
    const title = ref('');
    const firstname = ref('');
    const lastname = ref('');
    const titleSelect = ref('');
    const titleOptions = ref(['Mr', 'Mrs', 'Ms', 'Miss', 'Other']);

    onMounted(() => {
      reset();
    });

    const reset = () => {
      if (user.value?.profile) {
        nickname.value = user?.value?.profile?.nickname || '';
        title.value = user?.value?.profile?.title || '';
        firstname.value = user?.value?.profile?.firstName || '';
        lastname.value = user?.value?.profile?.lastName || '';
        if (titleOptions.value.includes(title.value) || !title.value) {
          titleSelect.value = title.value;
        } else {
          titleSelect.value = 'Other';
        }
      }
      nicknameRef.value?.resetValidation();
      titleRef.value?.resetValidation();
      titleSelectRef.value?.resetValidation();
      firstnameRef.value?.resetValidation();
      lastnameRef.value?.resetValidation();
      onEdit.value = false;
    };

    const onSave = async () => {
      if (!(await nicknameRef.value?.validate())) return;
      if (!(await titleSelectRef.value?.validate())) return;

      let _title = titleSelect.value;
      if (titleSelect.value == 'Other') {
        if (!(await titleRef.value?.validate())) return;
        _title = title.value;
      }

      if (!(await lastnameRef.value?.validate())) return;

      const result = await saveUserMainData(
        nickname.value,
        _title,
        firstname.value,
        lastname.value
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

    const requiredRule = (val: string) => {
      return nicknameExist(val);
    };

    return {
      user,
      showError,
      errorMessage,
      requiredRule,
      text,
      onEdit,
      nicknameRef,
      titleSelectRef,
      titleRef,
      firstnameRef,
      lastnameRef,
      titleSelect,
      titleOptions,
      nickname,
      title,
      firstname,
      lastname,

      tab: ref('mails'),

      reset,
      onSave,
      selected() {
        if (titleSelect.value === 'Other') {
          setTimeout(() => {
            titleRef?.value?.focus();
          }, 200);
        }
      },
      start() {
        setTimeout(() => {
          nicknameRef?.value?.focus();
        }, 20);
      },
    };
  },
});
</script>
