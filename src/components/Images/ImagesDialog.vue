<template>
  <q-dialog v-model="openDialog" persistent>
    <q-card style="min-width: 600px !important">
      <q-card-section class="row items-center">
        <span class="q-ml-sm text-h5">Insert Images</span>
        <q-space />
        <q-btn class="q-ml-sm" color="primary" icon="add" @click="getFile"
          ><span class="q-px-sm">Add image</span></q-btn
        >
        <q-file
          ref="fileInput"
          style="display: none"
          v-model="new_file"
          outlined
          label="select avatar"
          accept=".jpg, image/*"
          @update:model-value="update"
        />
      </q-card-section>
      <q-separator />
      <div
        style="
          height: calc(100vh - 200px);
          max-height: 476px;
          overflow-y: scroll;
          overflow-x: hidden;
        "
      >
        <q-card-section v-if="file" class="column justify-center items-center">
          <div class="row q-mb-sm">
            <q-btn
              class="q-ml-sm"
              size="sm"
              color="primary"
              icon="save"
              @click="saveFile"
              ><span class="q-px-sm">Save image</span></q-btn
            >
            <q-btn
              class="q-ml-sm"
              size="sm"
              color="primary"
              icon="crop"
              @click="openCropper = true"
              ><span class="q-px-sm">Crop</span></q-btn
            >

            <q-btn
              class="q-ml-sm"
              size="sm"
              color="primary"
              icon="close"
              @click="file = ''"
              ><span class="q-px-sm">Cancel</span></q-btn
            >
          </div>
          <div>
            <img :src="file" style="max-width: 100%" />
          </div>
        </q-card-section>

        <q-card-section v-if="!file">
          <div class="row">
            <div
              class="row justify-center items-center cursor-pointer"
              v-for="(v, k) in thumbs"
              :key="k"
              style="
                overflow: hidden;
                height: 106px;
                width: 106px;
                margin: 2px;
                padding: 2px;
                border: 1px solid #ccc;
              "
              @click="selectImage(v)"
            >
              <img :src="v" />
            </div>
          </div>
        </q-card-section>
      </div>
      <q-separator />
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <CropperDialog v-model="openCropper" :file="file" @cropped="cropped" />
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  computed,
  shallowRef,
  ref,
  watch,
} from 'vue';
import { QInput } from 'quasar';
import CropperDialog from 'components/Images/CropperDialog.vue';
import useSystem from 'src/modules/useSystem';

export default defineComponent({
  name: 'ImagesDialog',
  components: {
    CropperDialog,
  },
  props: {
    modelValue: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  emits: ['update:modelValue', 'selected'],
  setup(props, { emit }) {
    const { saveTransctionalImage, getTransctionalThumbs } = useSystem();
    const new_file = shallowRef<File>();
    const fileInput = ref<QInput>();
    const file = shallowRef<string>();
    const reader = new FileReader();
    const openCropper = ref(false);
    const thumbs = ref<string[]>([]);
    const openDialog = computed({
      get: () => {
        return props.modelValue;
      },
      set: (value) => {
        emit('update:modelValue', value);
      },
    });

    watch(
      () => props.modelValue,
      async (val) => {
        if (val) {
          const result = await getTransctionalThumbs();
          if (result instanceof Error) {
            // process error
          } else {
            thumbs.value = result;
          }
        }
      }
    );

    const getFile = () => {
      file.value = '';
      if (fileInput.value) {
        const el = fileInput.value.$el as HTMLInputElement;
        el.click();
      }
    };

    reader.addEventListener(
      'load',
      function () {
        // convert image file to base64 string
        file.value = reader.result as string;
        new_file.value = undefined;
      },
      false
    );

    const update = () => {
      reader.readAsDataURL(new_file.value as Blob);
    };

    const cropped = (image: string) => {
      file.value = image;
    };

    const saveFile = async () => {
      if (file.value) {
        await saveTransctionalImage(file.value, '');
        file.value = '';
        const result = await getTransctionalThumbs();
        if (result instanceof Error) {
          // process error
        } else {
          thumbs.value = result;
        }
      }
    };

    const selectImage = (src: string) => {
      emit('selected', src);
      openDialog.value = false;
    };

    return {
      openDialog,
      openCropper,
      new_file,
      fileInput,
      file,
      thumbs,
      getFile,
      update,
      cropped,
      saveFile,
      selectImage,
    };
  },
});
</script>
