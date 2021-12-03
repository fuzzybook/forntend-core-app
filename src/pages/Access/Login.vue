<template>
  <q-card
    key="1"
    v-bind:style="
      $q.screen.lt.sm
        ? { width: '100%', 'margin-top': '40px' }
        : { 'min-width': '380px' }
    "
    flat
  >
    <q-card-section>
      <img class="absolute-center icon-top" src="../../assets/padlock.svg" />
      {{ isLogged }}
    </q-card-section>
    <q-card-section class="q-pb-none">
      <div class="row full-width items-end">
        <div class="col row text-h5">{{ $t('login.login') }}</div>
      </div>
      <div>
        <q-separator size="2px" color="primary" />
        <div class="col q-mt-sm">{{ $t('login.useemail') }}</div>
      </div>
    </q-card-section>
    <q-card-section>
      <q-form class="q-gutter-md">
        <q-input
          autofocus
          label-color="primary"
          outlined
          v-model="email"
          :label="$t('login.emaillabel')"
          lazy-rules
        />
        <q-input
          label-color="primary"
          outlined
          v-model="password"
          type="password"
          :label="$t('login.passwordlabel')"
          lazy-rules
          autocomplete="off"
        />
        <div>
          <q-btn
            class="full-width"
            unelevated
            label="Login"
            type="submit"
            color="primary"
            @click="doLogin"
          />
        </div>
      </q-form>
    </q-card-section>
    <q-card-section class="q-pt-none">
      <q-separator class="q-mb-sm" size="2px" color="primary" />
      <div class="text-center">
        <div class="row justify-center col q-mb-sm">
          {{ $t('login.noaccount') }}
          <div class="q-ml-sm link" @click="goToSignup()">
            {{ $t('login.signup') }}
          </div>
        </div>
        <div class="q-ml-sm link" @click="goToForgotPassword()">
          {{ $t('login.forgotpassword') }}
        </div>
      </div>
    </q-card-section>
  </q-card>
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
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import useUser from 'src/modules/useUser';

export default defineComponent({
  name: 'LoginPage',
  emits: ['cmd', 'error'],
  setup(_, { emit }) {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();
    const $q = useQuasar();
    const { login, user, isLogged } = useUser();
    const router = useRouter();
    const email = ref<string>('admin@prada.ch');
    const password = ref<string>('Password!');

    const goToSignup = () => {
      emit('cmd', 'register');
    };

    const goToForgotPassword = () => {
      emit('cmd', 'forgotPassword');
    };

    const doLogin = async () => {
      $q.loading.show({
        delay: 100, // ms
      });
      const error = await login(email.value, password.value);
      if (!error) {
        $q.loading.hide();
        await router.push('/');
        return;
      }
      $q.loading.hide();
      $q.dialog({
        title: 'Error',
        message: t(error),
        persistent: true,
      });
    };

    return {
      user,
      email,
      password,
      goToSignup,
      goToForgotPassword,
      doLogin,
      isLogged,
    };
  },
});
</script>
