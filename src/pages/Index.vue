<template>
  <q-page> </q-page>
</template>

<style lang="scss" scoped>
.splitter {
  height: calc(100vh - 100px);
  .q-splitter__panel {
    overflow: hidden !important;
    .container {
      overflow: hidden !important;
    }
  }
}
</style>

<script lang="ts">
// import ExampleComponent from 'components/CompositionComponent.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PageIndex',
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  components: {},
  setup() {
    return {};
  },
});
</script>
