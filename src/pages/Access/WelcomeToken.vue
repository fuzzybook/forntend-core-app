<template>
  <q-page class="row fit justify-center items-center">
    <q-card
      v-bind:style="
        $q.screen.lt.sm
          ? { width: '100%', 'margin-top': '40px' }
          : { 'min-width': '380px' }
      "
      flat
    >
      <q-card-section>
        <img class="absolute-center icon-top" src="../../assets/verify.svg" />
      </q-card-section>
      <q-card-section>
        <div class="text-center q-py-md">
          <div class="col text-h5">{{ $t('login.verifywelcometoken') }}</div>
        </div>
      </q-card-section>
      <div v-if="verified">
        <div class="q-px-md">
          <q-separator size="2px" color="primary" />
        </div>
        <q-card-section> </q-card-section>

        <div class="q-px-md text-center text-bold">
          <div class="col-12">
            {{ $t('login.tokenvalid') }}
          </div>
          <div class="col-12 q-mt-md">
            <q-btn class="q-mr-md" color="primary" @click="$router.push('/')">{{
              $t('gohome')
            }}</q-btn>
            <q-btn color="primary" @click="$router.push('/user/profile')">{{
              $t('gouserprofile')
            }}</q-btn>
          </div>
        </div>

        <q-card-section> </q-card-section>
        <div class="q-px-md">
          <q-separator size="2px" color="primary" />
        </div>
      </div>
    </q-card>
  </q-page>
</template>
<style lang="sass" scoped>
.link
  color: $primary
  cursor: pointer
  font-weight: bold
.link:hover
  text-decoration: underline
.q-card
  background-color: transparent
.text-h5
  margin-bottom: 4px
.icon-top
  max-width: 80px
  top: 0px
</style>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import useUser from 'src/modules/useUser';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'WelcomeToken',
  async setup() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();
    const { isLogged, verifyAccessToken } = useUser();
    const route = useRoute();
    const router = useRouter();
    const verified = ref<boolean>(false);
    const token = ref<string>('');
    const step = ref<string>('start');
    const $q = useQuasar();

    if (isLogged.value) {
      $q.dialog({
        title: 'Error',
        message: t('login.allreadyloggedin'),
        persistent: true,
      });
    } else {
      token.value = (route.params.token as string) || '';
      $q.loading.show({
        message: t('login.tokenverify'),
        boxClass: 'bg-grey-2 text-grey-9',
        spinnerColor: 'primary',
      });
      // registrationis the right name
      const error = await verifyAccessToken(token.value);
      if (!error) {
        $q.loading.hide();
        step.value = 'verified';
        verified.value = true;
      } else {
        $q.loading.hide();
        step.value = '';
        verified.value = false;
        $q.dialog({
          title: 'Error',
          message: t(error),
          persistent: true,
        }).onOk(async () => {
          await router.push('/');
        });
      }
    }

    return { token, step, verified };
  },
});
</script>
