<template>
  <router-view />
</template>
<script lang="ts">
import { defineComponent, watch } from 'vue';
import { useQuasar } from 'quasar';
import useUser from 'src/modules/useUser';
import { useRouter } from 'vue-router';
import useSystem from 'src/modules/useSystem';
import { useRoute } from 'vue-router';
import 'regenerator-runtime';

export default defineComponent({
  name: 'App',
  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const { isLogged, user, heartbeat } = useUser();
    const { isIdle } = useSystem();
    const route = useRoute();

    watch(isIdle, async (val) => {
      // if logged go to page idle and wait unlock screen lockscreen save from router
      // else nothing
      if (val && isLogged.value && user.value?.preferences?.useIdle) {
        console.log(route);
        await router.push('/idle');
      }
    });

    watch(
      () => $q.appVisible,
      async (val) => {
        if (val) {
          // test if actual route need permissions
          if (!isLogged.value) {
            await router.push('/');
          }
        }
        console.log(val ? 'App became visible' : 'App went in the background');
      }
    );

    setInterval(() => {
      const state = isLogged.value;
      heartbeat()
        .then((val) => {
          if (!val && state) {
            console.log('user has no session');
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }, 5000);
  },
});
</script>
