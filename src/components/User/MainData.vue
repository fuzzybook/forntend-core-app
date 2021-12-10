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
import { defineComponent, ref, onMounted, PropType } from 'vue';
import useUser from 'src/modules/useUser';
import { QInput, QForm, QSelect, useQuasar } from 'quasar';
import { UserResponse } from 'src/grapql';

export default defineComponent({
  name: 'MainData',
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
    const { user, saveMainData, saveUserMainData, nicknameExist } = useUser();
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

    const userData = ref<UserResponse>();

    onMounted(() => {
      if (!props.userRow) {
        userData.value = user.value as UserResponse;
      } else {
        userData.value = props.userRow;
      }
      reset();
    });

    const reset = () => {
      if (userData.value?.profile) {
        nickname.value = userData?.value?.profile?.nickname || '';
        title.value = userData?.value?.profile?.title || '';
        firstname.value = userData?.value?.profile?.firstName || '';
        lastname.value = userData?.value?.profile?.lastName || '';
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

      let result;

      if (props.userRow) {
        result = await saveUserMainData(
          userData.value?.id || '',
          nickname.value,
          _title,
          firstname.value,
          lastname.value
        );
      } else {
        result = await saveMainData(
          nickname.value,
          _title,
          firstname.value,
          lastname.value
        );
      }

      if (typeof result !== 'string') {
        emit('update', result);
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
      const id = userData.value?.id;
      return nicknameExist(val, id || '');
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
