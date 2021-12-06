<template>
  <q-page v-auth class="column test">
    <AvatarDialog v-model="openAvatar" @save="saveAvatar" />
    <div class="row items-center q-pa-sm">
      <div class="row items-center">
        <div class="q-mr-md" style="position: relative">
          <Avatar size="64px" />
          <q-btn
            round
            color="primary"
            size="sm"
            icon="edit"
            style="position: absolute; right: -5px; bottom: -5px"
            @click="editAvatar"
          />
        </div>
        <div class="column">
          <div class="text-bold">
            <span class="q-mx-sm">{{ user?.profile?.title }}</span>
            <span class="q-mr-sm">{{ user?.profile?.firstName }}</span>
            <span class="q-mr-sm">{{ user?.profile?.lastName }}</span>
          </div>
          <div class="q-mx-sm text-caption">{{ user?.profile?.nickname }}</div>
        </div>
      </div>
    </div>
    <q-separator />
    <q-tabs
      v-model="tab"
      dense
      class="bg-primary text-white shadow-2"
      active-color="white"
      indicator-color="white"
      inline-label
      outside-arrows
      mobile-arrows
      style="max-width: 100vw"
    >
      <q-tab name="main" label="Main" @update="updateTab" />
      <q-tab name="contacts" label="Contacts" />
      <q-tab name="social" label="Social" />
      <q-tab name="preferences" label="Preferences" />
    </q-tabs>

    <q-separator />

    <q-tab-panels keep-alive v-model="tab" animated>
      <q-tab-panel name="main">
        <MainData />
      </q-tab-panel>

      <q-tab-panel name="contacts">
        <ContactsData />
      </q-tab-panel>

      <q-tab-panel name="social">
        <SocialsData />
      </q-tab-panel>

      <q-tab-panel name="preferences">
        <PreferencesData />
      </q-tab-panel>

      <q-tab-panel name="social">
        <div class="text-h6">Social</div>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script lang="ts">
// import ExampleComponent from 'components/CompositionComponent.vue';
import { defineComponent, ref, onMounted } from 'vue';
import useUser from 'src/modules/useUser';
import useSystem from 'src/modules/useSystem';
import Avatar from 'components/Images/Avatar.vue';
import MainData from './MainData.vue';
import ContactsData from './ContactsData.vue';
import SocialsData from './SocialsData.vue';
import PreferencesData from './PreferencesData.vue';
import AvatarDialog from 'src/components/Images/AvatarDialog.vue';

export default defineComponent({
  name: 'PageIndex',
  components: {
    Avatar,
    MainData,
    ContactsData,
    SocialsData,
    PreferencesData,
    AvatarDialog,
  },
  setup() {
    const showError = ref<boolean>(false);
    const errorMessage = ref<string>('');
    const { user, setAvatar, avatar } = useUser();
    const { isIdle } = useSystem();
    const openAvatar = ref<boolean>(false);
    const av = ref<string>('');

    onMounted(async () => {
      av.value = (await avatar()) as string;
    });

    const saveAvatar = async (_avatar: string) => {
      await setAvatar(user.value?.id || '', _avatar);
      av.value = (await avatar()) as string;
      openAvatar.value = false;
    };

    const editAvatar = () => {
      openAvatar.value = true;
      console.log('editAvatar', editAvatar);
    };

    return {
      user,
      showError,
      errorMessage,
      isIdle,
      tab: ref('main'),
      av,
      openAvatar,
      saveAvatar,
      editAvatar,
      updateTab(val: string) {
        console.log(val);
      },
    };
  },
});
</script>
