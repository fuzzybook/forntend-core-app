<template>
  <q-dialog v-model="open" @hide="hide" @before-show="beforeShow">
    <q-card class="my-card" style="min-width: 450px">
      <q-card-section>
        <div class="row justify-between items-center">
          <div>
            <div class="text-h6">{{ $t('roles.edit') }}</div>
            <div class="text-subtitle2">{{ user?.email }}</div>
          </div>
          <q-space />
          <div>
            <q-btn icon="close" flat round dense v-close-popup />
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pa-md">
        <q-tree
          dense
          :nodes="content"
          node-key="role"
          children-key="roles"
          default-expand-all
        >
          <template v-slot:default-header="prop">
            <div v-if="prop.node.icon" class="row items-center">
              <q-icon
                :name="prop.node.icon"
                color="positive"
                size="sm"
                class="q-mr-sm"
              />
              <q-checkbox
                v-if="prop.node.type == 'super'"
                size="xs"
                v-model="prop.node.selected"
                @click="changeSelect(prop.node.role)"
              />

              <div class="text-weight-bold text-positive">
                {{ prop.node.role }}
              </div>
            </div>
            <div v-if="!prop.node.icon" class="row items-center">
              <div class="text-weight-bold text-black">
                <q-checkbox
                  size="xs"
                  :disable="
                    prop.node.role == system.roleRolesAdmin.toLowerCase() &&
                    !editable()
                  "
                  v-model="prop.node.selected"
                  @click="changeSelect(prop.node.role)"
                />{{ prop.node.role }}
              </div>
            </div>
          </template>
        </q-tree>
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn :disable="!editable()" color="primary" icon="save" @click="save"
          >save</q-btn
        >
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, computed, watchEffect } from 'vue';
import useSystem from 'src/modules/useSystem';
import useUser from 'src/modules/useUser';
import { AuthRolesResponse } from 'src/grapql';
import { ITableRow } from '../types';

export default defineComponent({
  name: 'RolesDialog',
  props: {
    modelValue: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    row: {
      type: Object as PropType<ITableRow>,
      required: true,
    },
    roles: {
      type: Array as PropType<string[]>,
      required: true,
    },
  },
  emits: ['update:modelValue', 'roles:saved'],
  setup(props, { emit }) {
    const { getTree, selectRole, getSelectedRoles, system } = useSystem();
    const { user } = useUser();
    const content = ref<AuthRolesResponse[]>([]);
    const opened = ref(false);

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    watchEffect(() => {});

    const open = computed({
      get: () => {
        return props.modelValue;
      },
      set: (value) => {
        emit('update:modelValue', value);
      },
    });

    const openDialog = (_roles: string[]) => {
      const t = getTree(_roles);
      content.value = [t];
      opened.value = true;
    };

    const changeSelect = (role: string) => {
      if (!editable) {
        return;
      }
      selectRole(content.value[0], role);
    };

    const editable = (): boolean => {
      if (user.value) {
        return (
          user.value.roles.includes(system.value.roleSuperadmin) ||
          user.value.roles.includes(system.value.roleRolesAdmin)
        );
      }
      return false;
    };

    const hide = () => {
      open.value = false;
    };

    const beforeShow = () => {
      openDialog(props.roles);
    };

    const save = () => {
      const roles = getSelectedRoles(content.value[0]);
      emit('roles:saved', roles);
      open.value = false;
    };

    return {
      user,
      opened,
      content,
      open,
      system,
      editable,
      hide,
      beforeShow,
      changeSelect,
      save,
    };
  },
});
</script>
