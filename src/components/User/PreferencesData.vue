<template>
  <div class="column">
    <div class="text-h6">Preferences</div>
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
          @click="onEdit = !onEdit"
          ><span class="q-mx-sm">edit</span></q-btn
        >
        <q-btn
          v-if="onEdit"
          dense
          style="min-width: 60px"
          color="primary"
          icon="save"
          @click="save"
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
      <div class="column">
        <q-toggle
          :disable="!onEdit"
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
    </q-form>
  </div>
</template>

<script lang="ts">
// import ExampleComponent from 'components/CompositionComponent.vue';
import { defineComponent, ref, onMounted } from 'vue';
import useUser from 'src/modules/useUser';
import { QForm, useQuasar } from 'quasar';

import { UserPreferencesInput } from 'src/grapql';
interface idleTimeoutOption {
  label: string;
  value: number;
}

export default defineComponent({
  name: 'PreferencesData',
  components: { QForm },
  setup() {
    const $q = useQuasar();
    const { user, savePreferences } = useUser();
    const onEdit = ref(false);
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
    let userPreferences: UserPreferencesInput = <UserPreferencesInput>{};

    onMounted(() => {
      reset();
    });

    const reset = () => {
      if (user.value?.preferences) {
        userPreferences = user.value.preferences;
        delete (userPreferences as unknown as { [key: string]: string })
          .__typename;

        idleenabled.value = userPreferences.useIdle || false;

        idleOptions.map((o) => {
          if (o.value == userPreferences.idleTimeout) {
            idletimeout.value = o;
          }
        });
        useIdlePassword.value = userPreferences.useIdlePassword || false;
      }
      onEdit.value = false;
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
        onEdit.value = false;
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

    return {
      onEdit,
      idleenabled,
      idletimeout,
      idleOptions,
      useIdlePassword,
      reset,
      save,
    };
  },
});
</script>
