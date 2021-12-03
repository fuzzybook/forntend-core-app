<template>
  <q-page class="row items-center justify-evenly">
    <div>logged {{ isLogged }}</div>
    <div>idle {{ isIdle }}</div>
    <div v-if="user">
      <Avatar />
      <pre>{{ user }}</pre>
    </div>
    <div v-else>Welcome</div>
  </q-page>
</template>

<script lang="ts">
// import ExampleComponent from 'components/CompositionComponent.vue';
import { defineComponent, ref } from 'vue';
import useUser from 'src/modules/useUser';
import useSystem from 'src/modules/useSystem';
import Avatar from 'components/Images/Avatar.vue';

export default defineComponent({
  name: 'PageIndex',
  components: { Avatar },
  setup() {
    const showError = ref<boolean>(false);
    const errorMessage = ref<string>('');
    const { user, isLogged } = useUser();
    const { isIdle } = useSystem();

    return {
      user,
      isLogged,
      showError,
      errorMessage,
      isIdle,
    };
  },
});
</script>
