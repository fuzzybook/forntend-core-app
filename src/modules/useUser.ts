import { reactive, toRefs } from 'vue';
import { apolloClient, AUTH_TOKEN } from 'src/boot/graphql';
import {
  ME,
  LOGIN,
  REGISTER,
  LOGOUT,
  VERIFYACTIVATION,
  VERIFYRECOVER,
  RECOVERPASSWORD,
  RECOVERNEWPASSWORD,
  GET_AVATAR,
  SET_AVATAR,
  SET_PREFERENCES,
  NICKNAME_EXIST,
  SET_USER_PROFILE,
  ALIVE,
  HEARTBEAT,
  SET_USER_SOCIALS,
  SET_PROFILE,
  SET_SOCIALS,
  SET_USER_PREFERENCES,
} from 'src/graphql-gql/qwery&mutation';

import {
  UserPreferencesInput,
  UserResponse,
  UserProfileInput,
  ProfileResponse,
  SocialDataResponse,
} from 'src/grapql';

export type ISocialInput = { address: string };
export type ISocialsInput = { [key: string]: ISocialInput };

interface UserState {
  user: UserResponse | null;
  userAvatar: string | null;
  isLogged: boolean;
  isSuperadmin: boolean;
  error: string | null;
}

const userState = reactive<UserState>({
  user: null,
  isLogged: false,
  isSuperadmin: false,
  userAvatar: null,
  error: null,
});

interface MeResponse {
  me: UserResponse;
}

interface AvatarResponse {
  avatar: string;
}

interface LoginData {
  token: string;
  user: UserResponse;
}

interface LoginResponse {
  login: LoginData;
}

interface Register {
  createUser: string;
}

interface VerifyActivation {
  token: boolean;
}

interface RecoverPassword {
  email: string;
}

interface VerifyRecover {
  token: boolean;
}

interface PasswordResponse {
  setNewPassword: LoginData;
}

interface UserPreferenceResponse {
  saveUserPreferences?: LoginData;
}

interface PreferenceResponse {
  savePreferences?: LoginData;
}

interface NicknameResponse {
  nicknameExist?: boolean;
}

interface SaveUserProfileResponse {
  saveUserProfile?: boolean;
}

interface SaveProfileResponse {
  saveProfile?: boolean;
}

interface AliveResponse {
  alive: boolean;
}

interface HeartbeatResponse {
  heartbeat: boolean;
}

interface SaveUserSocialsResponse {
  saveUserSocials?: boolean;
}

interface SaveSocialsResponse {
  saveSocials?: boolean;
}

export default function useUser() {
  async function heartbeat(): Promise<string | boolean> {
    try {
      const {
        data: { heartbeat },
      } = await apolloClient.query<HeartbeatResponse>({
        query: HEARTBEAT,
        fetchPolicy: 'network-only',
      });
      if (heartbeat) {
        return true;
      } else {
        userState.user = null;
        userState.isLogged = false;
        return false;
      }
    } catch (error) {
      userState.user = null;
      userState.isLogged = false;
      userState.error = error as string;
      return error as string;
    }
  }

  async function me(): Promise<string | boolean> {
    try {
      const {
        data: { me },
      } = await apolloClient.query<MeResponse>({
        query: ME,
        fetchPolicy: 'network-only',
      });
      if (me) {
        userState.user = me;
        userState.isLogged = true;
        userState.error = null;
        userState.user.roles = userState.user.roles.map((name) =>
          name.toLowerCase()
        );
        userState.isSuperadmin = userState.user.roles.includes('superadmin');
        await avatar();
        return true;
      } else {
        userState.user = null;
        userState.isLogged = false;
        userState.isSuperadmin = false;
        return false;
      }
    } catch (error) {
      userState.user = null;
      userState.isLogged = false;
      userState.isSuperadmin = false;
      userState.error = error as string;
      return error as string;
    }
  }

  async function alive(): Promise<string | boolean> {
    try {
      const { data } = await apolloClient.query<AliveResponse>({
        query: ALIVE,
        fetchPolicy: 'network-only',
      });
      if (!data.alive) {
        userState.user = null;
        userState.isLogged = false;
      }
      return data.alive;
    } catch (error) {
      return error as string;
    }
  }

  async function avatar(): Promise<string | boolean> {
    try {
      if (!userState.user) return true;
      const {
        data: { avatar },
      } = await apolloClient.query<AvatarResponse>({
        query: GET_AVATAR,
        variables: {
          id: userState.user?.id || 'unknown',
        },
        fetchPolicy: 'network-only',
      });
      if (avatar) {
        userState.userAvatar = avatar;
        return avatar;
      }
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async function getAvatar(id: string): Promise<string> {
    try {
      const {
        data: { avatar },
      } = await apolloClient.query<AvatarResponse>({
        query: GET_AVATAR,
        variables: {
          id: id,
        },
        fetchPolicy: 'network-only',
      });
      if (avatar) {
        return avatar;
      }
      return '';
    } catch (error) {
      console.log(error);
      return '';
    }
  }

  async function setAvatar(id: string, avatar: string): Promise<string | null> {
    try {
      await apolloClient.mutate<boolean>({
        mutation: SET_AVATAR,
        variables: {
          id: id,
          avatar: avatar,
        },
      });
      userState.userAvatar = avatar;
      return null;
    } catch (error) {
      return parseGqlError(error as Error);
    }
  }

  async function sleep(ms: number): Promise<void> {
    return new Promise((res) => setTimeout(() => res(), ms));
  }

  async function login(
    email: string,
    password: string
  ): Promise<string | null> {
    localStorage.removeItem(AUTH_TOKEN);
    userState.user = null;
    userState.isLogged = false;
    userState.isSuperadmin = false;
    userState.isLogged = false;
    try {
      const { data } = await apolloClient.mutate<LoginResponse>({
        mutation: LOGIN,
        variables: {
          email: email,
          password: password,
        },
      });
      const token = data?.login.token;
      if (!token) return 'login.notvalidtoken';
      const user = data?.login.user;
      if (!user) return 'login.notvaliduser';
      localStorage.setItem(AUTH_TOKEN, token);
      await me();
      return null;
    } catch (error) {
      return parseGqlError(error as Error);
    }
  }

  async function logout(): Promise<string | null> {
    userState.isLogged = false;
    try {
      let uuid = '';
      if (userState.user) {
        uuid = (userState.user as UserResponse).id;
      }
      await apolloClient.mutate<boolean>({
        mutation: LOGOUT,
        variables: {
          uuid: uuid,
        },
      });
      localStorage.removeItem(AUTH_TOKEN);
      userState.error = null;
      userState.user = null;
      userState.isLogged = false;
      return null;
    } catch (error) {
      return parseGqlError(error as Error);
    }
  }

  async function register(
    email: string,
    password: string
  ): Promise<string | undefined> {
    try {
      const { data } = await apolloClient.mutate<Register>({
        mutation: REGISTER,
        variables: {
          data: {
            email: email,
            password: password,
          },
        },
      });
      return data?.createUser;
    } catch (error) {
      return parseGqlError(error as Error);
    }
  }

  async function verifyAccessToken(token: string): Promise<string | void> {
    try {
      await apolloClient.mutate<VerifyActivation>({
        mutation: VERIFYACTIVATION,
        variables: {
          token: token,
        },
      });
      return;
    } catch (error) {
      return parseGqlError(error as Error);
    }
  }

  async function recoverPassword(email: string): Promise<string | void> {
    try {
      await apolloClient.mutate<RecoverPassword>({
        mutation: RECOVERPASSWORD,
        variables: {
          email: email,
        },
      });
      return;
    } catch (error) {
      return parseGqlError(error as Error);
    }
  }

  async function recoverNewPassword(
    password: string,
    token: string
  ): Promise<string | void> {
    try {
      const { data } = await apolloClient.mutate<PasswordResponse>({
        mutation: RECOVERNEWPASSWORD,
        variables: {
          password: password,
          token: token,
        },
      });
      const tk = data?.setNewPassword?.token || '';
      if (!tk) return 'login.notvalidtoken';
      const user = data?.setNewPassword.user;
      if (!user) return 'login.notvaliduser';
      userState.user = user;
      userState.isLogged = true;
      userState.error = null;
      localStorage.setItem(AUTH_TOKEN, tk);
      await sleep(500);
      return;
    } catch (error) {
      userState.user = null;
      userState.isLogged = false;
      userState.error = error as string;
      return error as string;
    }
  }

  async function verifyRecoverToken(token: string): Promise<string | void> {
    try {
      await apolloClient.mutate<VerifyRecover>({
        mutation: VERIFYRECOVER,
        variables: {
          token: token,
        },
      });
      return;
    } catch (error) {
      return parseGqlError(error as Error);
    }
  }

  function parseGqlError(error: Error): string {
    const message =
      typeof error.message == 'string' ? error.message : 'gql.nuknownerror';
    const a = message.split(':');
    if (a.length == 2 && typeof a[1] == 'string') {
      return a[1].trim();
    } else {
      return message;
    }
  }

  async function savePreferences(
    userId: string | null,
    preferences: UserPreferencesInput
  ): Promise<UserPreferencesInput | string> {
    try {
      if (userId) {
        const { data } = await apolloClient.mutate<UserPreferenceResponse>({
          mutation: SET_USER_PREFERENCES,
          variables: {
            userId,
            preferences: preferences,
          },
        });
        if (
          data?.saveUserPreferences &&
          userState.user &&
          userState.user.id == userId
        ) {
          userState.user.preferences = preferences;
        }
        return preferences;
      } else {
        const { data } = await apolloClient.mutate<PreferenceResponse>({
          mutation: SET_PREFERENCES,
          variables: {
            preferences: preferences,
          },
        });
        if (data?.savePreferences && userState.user) {
          userState.user.preferences = preferences;
        }
        return preferences;
      }
      return 'error.savepreferences';
    } catch (error) {
      return error as string;
    }
  }

  function updateUserMainData(profile: UserProfileInput) {
    if (userState.user && userState.user.profile) {
      userState.user.profile.nickname = profile.nickname;
      userState.user.profile.title = profile.title;
      userState.user.profile.firstName = profile.firstName;
      userState.user.profile.lastName = profile.lastName;
    } else if (userState.user) {
      userState.user.profile = profile;
    }
  }

  async function saveMainData(
    nickname: string,
    title: string,
    firstName: string,
    lastName: string
  ): Promise<UserProfileInput | string> {
    try {
      const profile = <ProfileResponse>{
        nickname,
        title,
        firstName,
        lastName,
      };
      const { data } = await apolloClient.mutate<SaveProfileResponse>({
        mutation: SET_PROFILE,
        variables: {
          profile,
        },
      });
      if (data?.saveProfile) {
        updateUserMainData(profile);
        return profile;
      }

      return 'error.savemaindata';
    } catch (error) {
      return error as string;
    }
  }

  async function saveUserMainData(
    userId: string,
    nickname: string,
    title: string,
    firstName: string,
    lastName: string
  ): Promise<UserProfileInput | string> {
    try {
      const profile = <ProfileResponse>{
        nickname,
        title,
        firstName,
        lastName,
      };

      const { data } = await apolloClient.mutate<SaveUserProfileResponse>({
        mutation: SET_USER_PROFILE,
        variables: {
          userId,
          profile,
        },
      });
      if (data?.saveUserProfile) {
        if (userState.user?.id === userId) {
          updateUserMainData(profile);
        }
        return profile;
      }

      return 'error.savemaindata';
    } catch (error) {
      return error as string;
    }
  }

  function updateUserProfile(profile: UserProfileInput) {
    if (userState.user && userState.user.profile) {
      userState.user.profile.phoneNumber = profile.phoneNumber;
      userState.user.profile.mobileNumber = profile.mobileNumber;
      userState.user.profile.address1 = profile.address1;
      userState.user.profile.address2 = profile.address2;
      userState.user.profile.zip = profile.zip;
      userState.user.profile.city = profile.city;
      userState.user.profile.country = profile.country;
    } else if (userState.user) {
      userState.user.profile = profile;
    }
  }

  async function saveUserContacts(
    userId: string | null,
    phoneNumber: string,
    mobileNumber: string,
    address1: string,
    address2: string,
    zip: string,
    city: string,
    country: string
  ): Promise<ProfileResponse | string> {
    try {
      const profile = <ProfileResponse>{
        phoneNumber,
        mobileNumber,
        address1,
        address2,
        zip,
        city,
        country,
      };

      if (userId) {
        const { data } = await apolloClient.mutate<SaveUserProfileResponse>({
          mutation: SET_USER_PROFILE,
          variables: {
            userId,
            profile,
          },
        });
        if (data?.saveUserProfile) {
          if (userState.user?.id === userId) {
            updateUserProfile(profile);
          }
          return profile;
        }
        return 'profile.saveerror';
      } else {
        const { data } = await apolloClient.mutate<SaveProfileResponse>({
          mutation: SET_PROFILE,
          variables: {
            profile,
          },
        });
        if (data?.saveProfile) {
          updateUserProfile(profile);
          return profile;
        }
        return 'profile.saveerror';
      }
    } catch (error) {
      return error as string;
    }
  }

  async function nicknameExist(
    nickname: string,
    userId: string
  ): Promise<string | boolean> {
    try {
      const { data } = await apolloClient.query<NicknameResponse>({
        query: NICKNAME_EXIST,
        fetchPolicy: 'network-only',
        variables: {
          userId,
          nickname,
        },
      });
      if (data.nicknameExist) {
        return 'nickname.inuse';
      } else {
        return true;
      }
    } catch (error) {
      return error as string;
    }
  }

  async function saveUserSocials(
    userId: string,
    socials: ISocialsInput
  ): Promise<ISocialsInput | string> {
    try {
      const { data } = await apolloClient.mutate<SaveUserSocialsResponse>({
        mutation: SET_USER_SOCIALS,
        variables: {
          userId,
          socials: JSON.stringify(socials),
        },
      });
      if (data?.saveUserSocials) {
        if (userState.user?.id === userId) {
          updateSocials(socials as unknown as SocialDataResponse);
        }
        return socials;
      }
      return 'error.savesocials';
    } catch (error) {
      return error as string;
    }
  }

  function updateSocials(socials: SocialDataResponse) {
    if (userState.user) {
      userState.user.socials = socials;
    }
  }

  async function saveSocials(
    socials: ISocialsInput
  ): Promise<ISocialsInput | string> {
    try {
      const { data } = await apolloClient.mutate<SaveSocialsResponse>({
        mutation: SET_SOCIALS,
        variables: {
          socials: JSON.stringify(socials),
        },
      });
      if (data?.saveSocials) {
        updateSocials(socials as unknown as SocialDataResponse);
        return socials;
      }
      return 'error.savesocials';
    } catch (error) {
      return error as string;
    }
  }

  return {
    ...toRefs(userState),
    sleep,
    heartbeat,
    me,
    alive,
    login,
    logout,
    register,
    verifyAccessToken,
    verifyRecoverToken,
    recoverPassword,
    recoverNewPassword,
    avatar,
    setAvatar,
    getAvatar,
    savePreferences,
    saveMainData,
    saveUserContacts,
    saveSocials,
    saveUserSocials,

    saveUserMainData,
    nicknameExist,
  };
}
