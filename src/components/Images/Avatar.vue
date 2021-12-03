<template>
  <q-avatar :size="size">
    <img :src="avatar" />
  </q-avatar>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import useUser from 'src/modules/useUser';

export default defineComponent({
  name: 'Avatar',
  props: {
    size: {
      type: String,
      default: '128px',
    },
  },
  setup() {
    const { userAvatar } = useUser();
    const avatar = computed(() => userAvatar.value as string);
    return {
      avatar,
    };

    return {};
  },
});
</script>
