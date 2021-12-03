<template>
  <q-page class="flex bg-image flex-center">
    <q-card
      v-if="isLogged"
      v-bind:style="
        $q.screen.lt.sm ? { width: '100%' } : { 'min-width': '380px' }
      "
      flat
    >
      <q-card-section>
        <AuthBanner />
      </q-card-section>

      <q-card-section>
        <q-btn
          class="full-width q-mb-sm"
          unelevated
          label="Logout"
          type="button"
          color="blue-7"
          @click="doLogOut"
        />
        <q-separator size="2px" color="blue-7" />
        <q-btn
          class="full-width q-mt-sm"
          unelevated
          label="Home"
          type="button"
          color="blue-7"
          @click="$router.push('/')"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<style lang="sass" scoped>
/* unvisited link */
a:link
  color: $blue-7
/* visited link */
a:visited
  color: $blue-7
/* mouse over link */
a:hover
  color: $blue-5
/* selected link */
a:active
  color: $blue-7
.icon-top
  max-width: 80px
  top: 0px
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import useUser from 'src/modules/useUser';
import { useRouter } from 'vue-router';
import AuthBanner from 'src/APPLICATION/config/authBanner.vue';

export default defineComponent({
  name: 'logout',
  components: {
    AuthBanner,
  },
  setup() {
    const { isLogged, logout } = useUser();
    const router = useRouter();

    const doLogOut = async () => {
      await logout();
      await router.push('/');
    };
    return {
      isLogged,
      doLogOut,
    };
  },
});
</script>
