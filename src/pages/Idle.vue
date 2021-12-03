<template>
  <q-page class="row items-center justify-evenly">
    <img
      v-if="isIdle"
      class="absolute-center icon-top"
      src="../assets/IdleSleep.svg"
      style="height: 128px"
    />
    <q-card
      v-if="!isIdle && user?.preferences?.useIdlePassword"
      class="idle-card"
      style="min-width: 320px"
    >
      <q-card-section v-if="user?.preferences?.useIdlePassword">
        <q-input v-model="password" autofocus label="Password" stack-label />
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn color="primary" @click="home">home</q-btn>
        <q-btn color="primary" @click="go">resume</q-btn>
      </q-card-actions>
    </q-card>
    <div v-if="!isIdle && !user?.preferences?.useIdlePassword">
      <q-btn class="q-mx-md" color="primary" @click="home">home</q-btn>
      <q-btn class="q-mx-md" color="primary" @click="go">resume</q-btn>
    </div>
  </q-page>
</template>

<script lang="ts">
// import ExampleComponent from 'components/CompositionComponent.vue';
import { defineComponent, ref } from 'vue';
import useUser from 'src/modules/useUser';
import useSystem from 'src/modules/useSystem';
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router';

export default defineComponent({
  name: 'PageIdle',
  setup() {
    const { user } = useUser();
    const { isIdle } = useSystem();
    const router = useRouter();
    const route = useRoute();
    const from = ref();
    const password = ref('');

    if (route.params.from != '/idle') {
      from.value = route.params.from;
    }
    console.log(route.params);

    onBeforeRouteUpdate((to, from) => {
      // only fetch the user if the id changed as maybe only the query or the hash changed
      console.log(from, to);
    });

    const go = async () => {
      await router.push(from.value);
    };

    const home = async () => {
      await router.push('/');
    };

    return {
      user,
      isIdle,
      from,
      password,
      home,
      go,
    };
  },
});
</script>
