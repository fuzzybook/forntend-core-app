<template>
  <div v-if="menu.children.length == 0 && auth(menu.auth)">
    <!-- no children -->
    <q-item dense clickable v-ripple :inset-level="level" @click="exec">
      <q-item-section v-if="menu.icon" avatar>
        <q-icon :name="menu.icon" />
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ menu.title }}</q-item-label>
        <q-item-label caption>
          {{ menu.caption }}
        </q-item-label>
      </q-item-section>
    </q-item>
  </div>
  <div v-else>
    <!-- children -->
    <div v-if="menu.children.length > 0 && auth(menu.auth)">
      <q-expansion-item
        dense
        expand-separator
        :icon="menu.icon"
        :label="menu.title"
        :caption="menu.caption"
        :header-inset-level="level"
      >
        <UserMenuItem
          v-for="menu in menu.children"
          :key="menu"
          :menu="menu"
          :level="level + 1"
        >
        </UserMenuItem>
      </q-expansion-item>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, inject } from 'vue';
import { Command } from './DrawerMenu.vue';
import useSystem from 'src/modules/useSystem';
import { DrawerMenu } from 'src/config/drawerMenu';

export default defineComponent({
  name: 'UserMenuItem',
  props: {
    menu: {
      type: Object as PropType<DrawerMenu>,
      required: true,
    },
    level: {
      type: Number as PropType<number>,
      default: 0,
    },
  },
  setup(props) {
    const { getRoleAutorization } = useSystem();
    const doCommand = inject('doCommand') as (command: Command) => void;

    const exec = () => {
      doCommand({ to: props.menu.to, command: props.menu.command });
    };

    const auth = (roles: string[] | undefined): boolean => {
      if (!roles) return true;
      return getRoleAutorization(roles || []);
    };

    return {
      data: props.menu,
      exec,
      auth,
    };
  },
});
</script>
