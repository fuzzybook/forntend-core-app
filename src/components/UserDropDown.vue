<template>
  <q-btn-dropdown
    outline
    split
    size="sm"
    class=""
    :label="user?.username ? user?.username : user?.email"
  >
    <q-list>
      <q-item clickable v-close-popup>
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
      <q-item clickable v-close-popup @click="doLogOut">
        <q-item-section avatar>
          <q-icon color="primary" name="logout" />
        </q-item-section>

        <q-item-section>
          <q-item-label>Logout</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import useUser from 'src/modules/useUser';
import { date } from 'quasar';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'UserdDropDown',
  components: {},
  props: {
    title: {
      type: String,
      required: false,
    },
  },
  setup() {
    const { isLogged, user, avatar } = useUser();
    const a = ref<string>('');
    const d = ref<string>('');
    const open = ref<boolean>(false);
    const router = useRouter();

    onMounted(async () => {
      a.value = (await avatar()) as string;
      d.value = date.formatDate(user.value?.created as Date, 'DD-MM-YYYY');
    });

    const doLogOut = async () => {
      //await logout();
      await router.push('/logout');
    };

    return {
      user,
      isLogged,
      avatar: a,
      d,
      open,
      doLogOut,
    };
  },
});
</script>
