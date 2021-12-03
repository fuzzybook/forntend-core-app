<template>
  <div>
    <UserMenuItem :menu="menu" />
  </div>
</template>

<script lang="ts">
import { defineComponent, provide } from 'vue';
import useConfig from 'src/config/useConfig';
import UserMenuItem from './DrawerMenuItem.vue';
import { useRouter } from 'vue-router';

export interface Command {
  to?: string;
  command?: string;
}

export default defineComponent({
  name: 'UserMenu',
  components: {
    UserMenuItem,
  },
  setup() {
    const router = useRouter();

    const doCommand = async (command: Command) => {
      if (command.to) {
        await router.push(command.to);
      } else if (command.command) {
        switch (command.command) {
        }
      }
    };
    provide('doCommand', doCommand);
    const { userMenu } = useConfig();

    return {
      menu: userMenu,
    };
  },
});
</script>
