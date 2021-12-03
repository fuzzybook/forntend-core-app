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
} from 'src/graphql-gql/qwery&mutation';

import {
  ProfileResponse,
  UserPreferencesInput,
  UserResponse,
  UserProfileInput,
} from 'src/grapql';

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
  savePreferences?: LoginData;
}

interface NicknameResponse {
  nicknameExist?: boolean;
}

interface UserProfileResponse {
  saveProfile?: boolean;
}

interface AliveResponse {
  alive: boolean;
}

interface HeartbeatResponse {
  heartbeat: boolean;
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

  async function getAvatar(id: string): Promise<string | boolean> {
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
      return false;
    } catch (error) {
      console.log(error);
      return false;
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
    preferences: UserPreferencesInput
  ): Promise<boolean | string> {
    try {
      const { data } = await apolloClient.mutate<UserPreferenceResponse>({
        mutation: SET_PREFERENCES,
        variables: {
          preferences: preferences,
        },
      });

      if (data?.savePreferences && userState.user) {
        userState.user.preferences = preferences;
      }
      return true;
    } catch (error) {
      return error as string;
    }
  }

  async function saveUserMainData(
    nickname: string,
    title: string,
    firstName: string,
    lastName: string
  ): Promise<boolean | string> {
    try {
      if (userState.user && userState.user.profile) {
        userState.user.profile.nickname = nickname;
        userState.user.profile.title = title;
        userState.user.profile.firstName = firstName;
        userState.user.profile.lastName = lastName;
      } else if (userState.user) {
        userState.user.profile = <ProfileResponse>{
          nickname,
          title,
          firstName,
          lastName,
        };
      }

      const profile: UserProfileInput = <UserProfileInput>(
        userState.user?.profile
      );
      delete (profile as unknown as { [key: string]: string }).__typename;

      const { data } = await apolloClient.mutate<UserProfileResponse>({
        mutation: SET_USER_PROFILE,
        variables: {
          profile,
        },
      });
      console.log(data);

      return true;
    } catch (error) {
      return error as string;
    }
  }

  async function saveUserContacts(
    phoneNumber: string,
    mobileNumber: string,
    address1: string,
    address2: string,
    zip: string,
    city: string,
    country: string
  ): Promise<boolean | string> {
    try {
      if (userState.user && userState.user.profile) {
        userState.user.profile.phoneNumber = phoneNumber;
        userState.user.profile.mobileNumber = mobileNumber;
        userState.user.profile.address1 = address1;
        userState.user.profile.address2 = address2;
        userState.user.profile.zip = zip;
        userState.user.profile.city = city;
        userState.user.profile.country = country;
      } else if (userState.user) {
        userState.user.profile = <ProfileResponse>{
          phoneNumber,
          mobileNumber,
          address1,
          address2,
          zip,
          city,
          country,
        };
      }

      const profile: UserProfileInput = <UserProfileInput>(
        userState.user?.profile
      );
      delete (profile as unknown as { [key: string]: string }).__typename;

      const { data } = await apolloClient.mutate<UserProfileResponse>({
        mutation: SET_USER_PROFILE,
        variables: {
          profile,
        },
      });
      console.log(data);

      return true;
    } catch (error) {
      return error as string;
    }
  }

  async function nicknameExist(nickname: string): Promise<string | boolean> {
    try {
      const { data } = await apolloClient.query<NicknameResponse>({
        query: NICKNAME_EXIST,
        fetchPolicy: 'network-only',
        variables: {
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

  async function saveSocials(socials: string): Promise<boolean | string> {
    try {
      const { data } = await apolloClient.mutate<UserPreferenceResponse>({
        mutation: SET_USER_SOCIALS,
        variables: {
          socials: socials,
        },
      });

      console.log(data);
      return true;
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
    saveUserMainData,
    saveUserContacts,
    saveSocials,
    nicknameExist,
  };
}
