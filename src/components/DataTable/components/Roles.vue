<template>
  <div class="container row justify-start q-py-xs">
    <q-btn
      flat
      dense
      :disabled="!editable()"
      @click="
        tooltip?.hide();
        openDialog();
      "
    >
      <div v-for="(v, k) in types" :key="k">
        <div>
          <q-icon class="q-mx-sm" size="sm" :name="k"> </q-icon>
        </div>
      </div>
    </q-btn>
    <q-tooltip ref="tooltip" class="roles-tooltip shadow-4">
      <div v-html="tree" class="text-white roles-tooltip-content" />
    </q-tooltip>
    <roles-dialog
      v-model="open"
      :roles="roles"
      :row="row"
      @roles:saved="saved"
    />
  </div>
</template>

<style lang="sass" scoped>
.container
  width: 100%
</style>

<style lang="sass">
.roles-tooltip
  background: var(--q-primary)
  min-width: 160px
  .roles-tooltip-content
    padding: 0
    ul
      list-style-type: none
      padding: 0
      margin: 0
      li.selected
        color: var(--q-warning)
        font-weight: bold
        font-size: 110%
      li.selected
        span.item-text::before
          content: "*"
</style>

<script lang="ts">
import { defineComponent, ref, PropType, watch } from 'vue';
import useSystem from 'src/modules/useSystem';
import useUser from 'src/modules/useUser';
import { QTooltip } from 'quasar';
import { ITableRow } from '../types';
import RolesDialog from './RolesDialog.vue';

export default defineComponent({
  name: 'TableSearchRoles',
  components: {
    RolesDialog,
  },
  props: {
    data: {
      type: Array as PropType<string[]>,
      required: true,
    },
    row: {
      type: Object as PropType<ITableRow>,
      required: true,
    },
    dense: {
      type: Boolean as PropType<boolean>,
      required: false,
    },
  },
  setup(props, { emit }) {
    const { getRoleRoots, getHTMLRolesTree, system } = useSystem();
    const { user } = useUser();
    const tooltip = ref<QTooltip | null>(null);
    const roles = ref<string[]>(props.data);
    const types = ref<{ [key: string]: boolean }>(getRoleRoots(props.data));
    const tree = ref<string>('');
    const open = ref<boolean>(false);

    const html = getHTMLRolesTree(roles.value);
    tree.value = html;

    watch(
      () => props.data,
      (data) => {
        roles.value = data;
        types.value = getRoleRoots(data);
        const html = getHTMLRolesTree(roles.value);
        tree.value = html;
      }
    );

    const openDialog = () => {
      open.value = true;
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

    const saved = (roles: string[]) => {
      emit('action', {
        action: 'roles',
        row: props.row,
        data: roles,
      });
    };

    return {
      roles,
      types,
      tree,
      tooltip,
      saved,
      editable,
      openDialog,
      open,
    };
  },
});
</script>
