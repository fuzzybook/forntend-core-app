<template>
  <q-dialog
    class="preferences-edit"
    :maximized="$q.platform.is.mobile"
    v-model="open"
    @hide="hide"
    @show="afterShow"
    transition-show="slide-down"
    transition-hide="slide-up"
  >
    <q-card
      v-if="ready"
      :class="{
        'preferences-card': true,
        'preferences-card-max': $q.platform.is.mobile,
        'preferences-card-min': !$q.platform.is.mobile,
      }"
    >
      <DialogToolbar title="preferences.edit" />

      <q-card-actions align="right" class="q-mx-sm q-mb-sm">
        <q-btn @click="save" color="primary">save</q-btn>
      </q-card-actions>
      <q-separator />
      <q-card-section>
        <div class="text-h6">{{ $t('preferences.idletitle') }}</div>
        <div class="column">
          <q-toggle
            v-model="idleenabled"
            icon="alarm"
            :label="$t('preferences.idleenabled')"
          />

          <q-toggle
            :disable="!idleenabled"
            v-model="useIdlePassword"
            icon="key"
            :label="$t('preferences.useidlepassword')"
          />

          <q-select
            class="q-mx-sm"
            :disable="!idleenabled"
            v-model="idletimeout"
            :options="idleOptions"
            :label="$t('preferences.idletimeout')"
          />
        </div>
      </q-card-section>
      <q-separator />
    </q-card>
  </q-dialog>
</template>

<style lang="sass" scoped>
.preferences-edit
  overflow: hidden
  .preferences-card
    overflow: hidden
    .container
      overflow: hidden
    &.preferences-card-max
      width: 100%
      height: 100vh
    &.preferences-card-min
      min-width: 450px
      max-height: 80vh
</style>

<script lang="ts">
import { defineComponent, ref, PropType, computed, onMounted } from 'vue';

import DialogToolbar from 'components/DialogToolbar.vue';
import useUser from 'src/modules/useUser';
import { UserPreferencesInput } from 'src/grapql';
import { useQuasar } from 'quasar';

interface idleTimeoutOption {
  label: string;
  value: number;
}

export default defineComponent({
  name: 'PreferencesDialog',
  components: {
    DialogToolbar,
  },
  props: {
    modelValue: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    avatar: {
      type: String as PropType<string>,
      required: false,
    },
  },
  emits: ['update:modelValue', 'save'],
  setup(props, { emit }) {
    const $q = useQuasar();
    const { user, savePreferences } = useUser();
    let userPreferences: UserPreferencesInput = <UserPreferencesInput>{};
    const ready = ref(false);
    const idleenabled = ref(false);
    const idleOptions: idleTimeoutOption[] = <idleTimeoutOption[]>[
      {
        label: '10 seconds',
        value: 10,
      },
      {
        label: '30 seconds',
        value: 30,
      },
      {
        label: '1 minute',
        value: 60,
      },
      {
        label: '5 minutes',
        value: 300,
      },
      {
        label: '10 minutes',
        value: 600,
      },
      ,
      {
        label: '30 minutes',
        value: 1800,
      },
    ];
    const idletimeout = ref<idleTimeoutOption>(idleOptions[0]);
    const useIdlePassword = ref<boolean>(false);

    const open = computed({
      get: () => {
        return props.modelValue;
      },
      set: (value) => {
        emit('update:modelValue', value);
      },
    });

    onMounted(() => {
      if (user.value?.preferences) {
        userPreferences = user.value?.preferences;
        delete (userPreferences as unknown as { [key: string]: string })
          .__typename;

        idleenabled.value = userPreferences.useIdle as boolean;

        idleOptions.map((o) => {
          if (o.value == userPreferences.idleTimeout) {
            idletimeout.value = o;
          }
        });

        useIdlePassword.value = userPreferences.useIdlePassword as boolean;
      }
    });

    const hide = () => {
      open.value = false;
    };

    const save = async () => {
      userPreferences.useIdle = idleenabled.value;
      userPreferences.idleTimeout = idletimeout.value.value;
      userPreferences.useIdlePassword = useIdlePassword.value;
      const result = await savePreferences(userPreferences);
      if (result === true) {
        $q.notify({
          color: 'positive',
          textColor: 'white',
          icon: 'thumb_up_off_alt',
          message: 'preferences updated successfully!',
          position: 'top-right',
          timeout: 3000,
        });
        open.value = false;
      } else {
        $q.notify({
          color: 'negative',
          textColor: 'white',
          icon: 'thumb_down_off_alt',
          message: 'preferences update error',
          position: 'top-right',
          timeout: 3000,
        });
      }
    };

    const afterShow = () => {
      ready.value = true;
    };

    return {
      ready,
      open,
      idleenabled,
      idletimeout,
      idleOptions,
      useIdlePassword,
      afterShow,
      hide,
      save,
    };
  },
});
</script>
