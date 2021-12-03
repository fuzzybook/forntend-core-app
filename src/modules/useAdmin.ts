import { reactive, toRefs } from 'vue';
import { UserResponse, UserStatus } from 'src/grapql';
import { apolloClient, parseGqlError } from 'src/boot/graphql';
import {
  GET_USERS,
  SET_ROLES,
  SET_STATUS,
} from 'src/graphql-gql/qwery&mutation';

interface AdminState {
  users: UserResponse[];
  error: string | null;
}

const adminState = reactive<AdminState>({
  users: [],
  error: null,
});

type AllUsersResponse = {
  users: UserResponse[];
};

export default function useAdmin() {
  async function getAllUsers(): Promise<string | null> {
    try {
      const { data } = await apolloClient.query<AllUsersResponse>({
        query: GET_USERS,
        fetchPolicy: 'no-cache',
      });
      if (data.users) {
        adminState.users = data.users;
        adminState.error = null;
        return null;
      } else {
        adminState.error = 'response.error.error';
        adminState.users = [];
      }
      return null;
    } catch (error) {
      return parseGqlError(error as Error);
    }
  }

  async function setStatus(
    id: string,
    status: UserStatus
  ): Promise<string | null> {
    const user = adminState.users.find((user) => user.id === id);
    if (!user) {
      return 'usernotfound';
    }
    if (user.status === status) {
      return 'samestatus';
    }
    try {
      const { data } = await apolloClient.mutate<boolean>({
        mutation: SET_STATUS,
        variables: {
          data: {
            id: id,
            status: status,
          },
        },
      });
      if (data) {
        user.status = status;
      }
      return null;
    } catch (error) {
      return parseGqlError(error as Error);
    }
  }

  const setRoles = async (
    userId: string,
    roles: string[]
  ): Promise<string | null> => {
    const user = adminState.users.find((user) => user.id === userId);
    if (!user) {
      return 'usernotfound';
    }
    try {
      const { data } = await apolloClient.mutate<UserResponse>({
        mutation: SET_ROLES,
        variables: {
          data: {
            id: userId,
            roles: roles,
          },
        },
      });
      if (data) {
        user.roles = roles;
      }

      return null;
    } catch (error) {
      return parseGqlError(error as Error);
    }
  };

  return {
    ...toRefs(adminState),
    getAllUsers,
    setStatus,
    setRoles,
  };
}
