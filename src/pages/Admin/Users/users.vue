<template>
  <q-page class="row">
    <DataTable
      :key="tableKey"
      v-if="ready"
      :data="users"
      :schema="schema"
      @search="search"
      @action="action"
    />
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import useAdmin from 'src/modules/useAdmin';
import { useRouter } from 'vue-router';
import DataTable from 'components/DataTable/Table.vue';
import { usersSchema } from './usersSchema';
import { ITableSchema, IAction } from 'src/components/DataTable/types';
import { UserStatus } from 'src/grapql';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { getErrorUrl } from 'src/boot/graphql';

export default defineComponent({
  name: 'UsersPage',
  components: {
    DataTable,
  },
  props: {
    title: {
      type: String,
      required: false,
    },
  },

  setup() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();
    const $q = useQuasar();
    const router = useRouter();
    const { getAllUsers, setStatus, setRoles, users } = useAdmin();
    const schema = ref<ITableSchema>(usersSchema as ITableSchema);
    const ready = ref(false);
    let tableKey = 0;

    onMounted(async () => {
      console.log('mount users');
      const error = await getAllUsers();
      if (error) {
        const url = getErrorUrl(error);
        if (url) {
          await router.push(url);
        }
      } else {
        ready.value = true;
      }
    });

    const search = (args: unknown) => {
      console.log(args);
    };

    const action = async (args: IAction) => {
      console.log('action', args);
      const { action, row, data } = args;
      switch (action) {
        case 'status':
          const status = data as string;
          const result = await setStatus(row.id, status as UserStatus);
          if (result) {
            $q.dialog({
              title: t('error'),
              message: t(result),
              persistent: true,
            });
          } else {
            $q.notify({
              color: 'positive',
              textColor: 'white',
              icon: 'thumb_up_off_alt',
              message: 'status updated successfully!',
              position: 'top-right',
              timeout: 3000,
            });
          }
          break;
        case 'roles':
          const roles = data as string[];
          const rolesResult = await setRoles(row.id, roles);
          if (rolesResult) {
            $q.dialog({
              title: t('error'),
              message: t(rolesResult),
              persistent: true,
            });
          } else {
            $q.notify({
              color: 'positive',
              textColor: 'white',
              icon: 'thumb_up_off_alt',
              message: 'roles updated successfully!',
              position: 'top-right',
              timeout: 3000,
            });
          }
          break;
      }
    };
    return { users, schema, ready, search, action, tableKey };
  },
});
</script>
