<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          v-if="isLogged"
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
        <q-toolbar-title> {{ appTitle }}</q-toolbar-title>
        <UserDropDown v-if="user" />
        <q-btn v-else dense outline @click="doLogIn" icon="login"
          ><span class="q-px-md">login</span></q-btn
        >
      </q-toolbar>
    </q-header>

    <q-drawer
      v-if="isLogged"
      v-model="leftDrawerOpen"
      bordered
      class="bg-grey-1"
    >
      <q-list>
        <q-item>
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white">
              <img :src="avatar" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{
              user?.username ? user?.username : user?.email
            }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator />
        <q-separator />
        <UserMenu />
        <q-separator />
        <q-separator />
        <AdminMenu />
        <q-separator />
        <q-separator />
      </q-list>
    </q-drawer>

    <q-page-container>
      <suspense>
        <router-view />
      </suspense>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import UserMenu from 'src/components/DrawerMenu.vue';
import AdminMenu from 'components/AdminMenu.vue';
import UserDropDown from 'components/UserDropDown.vue';
import useConfig from 'src/config/useConfig';
import { defineComponent, ref, onMounted } from 'vue';
import useUser from 'src/modules/useUser';
import useSystem from 'src/modules/useSystem';
import { useRouter } from 'vue-router';
import { date } from 'quasar';

export default defineComponent({
  name: 'MainLayout',

  components: {
    UserMenu,
    AdminMenu,
    UserDropDown,
  },

  setup() {
    const { isLogged, user, avatar } = useUser();
    const { leftDrawerOpen, toggleLeftDrawer } = useSystem();
    const router = useRouter();
    const { appTitle } = useConfig();
    const a = ref<string>('');
    const d = ref<string>('');

    const doLogOut = async () => {
      await router.push('/logout');
    };

    const doLogIn = async () => {
      await router.push('/access');
    };

    onMounted(async () => {
      a.value = (await avatar()) as string;
      d.value = date.formatDate(user.value?.created as Date, 'DD-MM-YYYY');
    });

    return {
      user,
      isLogged,
      doLogOut,
      doLogIn,
      leftDrawerOpen,
      toggleLeftDrawer,
      avatar: a,
      d,
      appTitle,
    };
  },
});
</script>
