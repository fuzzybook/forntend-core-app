<template>
  <q-page>
    <q-splitter v-model="splitterModel" style="height: calc(100vh - 50px)">
      <template v-slot:before>
        <div class="fit">
          <MonacoEditor />
        </div>
      </template>

      <template v-slot:after>
        <div class="q-pa-md">
          <div class="text-h4 q-mb-md">After</div>
          <div v-for="n in 20" :key="n" class="q-my-md">
            {{ n }}. Lorem ipsum dolor sit, amet consectetur adipisicing elit.
            Quis praesentium cumque magnam odio iure quidem, quod illum numquam
            possimus obcaecati commodi minima assumenda consectetur culpa fuga
            nulla ullam. In, libero.
          </div>
        </div>
      </template>
    </q-splitter>
  </q-page>
</template>

<script lang="ts">
// import ExampleComponent from 'components/CompositionComponent.vue';
import { defineComponent, ref, onMounted } from 'vue';
import useUser from 'src/modules/useUser';
import useSystem from 'src/modules/useSystem';
import MonacoEditor from 'components/MonacoEditor/Editor.vue';

export default defineComponent({
  name: 'PageIndex',
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  components: { MonacoEditor },
  setup() {
    const { user, isLogged } = useUser();
    const { isIdle } = useSystem();

    onMounted(() => {
      //
    });

    return {
      splitterModel: ref(50), // start at 50%,
      user,
      isLogged,
      isIdle,
    };
  },
});
</script>
