import gql from 'graphql-tag';

export const HEARTBEAT = gql`
  query Query {
    heartbeat
  }
`;

export const ME = gql`
  query {
    me {
      id
      status
      email
      username
      roles
      auth
      created
      updated
      profile {
        nickname
        title
        firstName
        lastName
        phoneNumber
        mobileNumber
        address1
        address2
        zip
        city
        country
      }
      extra
      extraSchema
      preferences {
        useIdle
        idleTimeout
        useIdlePassword
      }
      socials
    }
  }
`;

export const ALIVE = gql`
  query {
    alive
  }
`;

export const GET_AVATAR = gql`
  query ($id: String!) {
    avatar(id: $id)
  }
`;

export const SET_AVATAR = gql`
  mutation saveAvatar($id: String!, $avatar: String!) {
    saveAvatar(id: $id, avatar: $avatar)
  }
`;

export const GET_USERS = gql`
  query {
    users {
      id
      status
      email
      username
      roles
      auth
      created
      updated
      profile {
        nickname
        title
        firstName
        lastName
        phoneNumber
        mobileNumber
        address1
        address2
        zip
        city
        country
      }
      extra
      extraSchema
      preferences {
        useIdle
        idleTimeout
        useIdlePassword
      }
    }
  }
`;

export const GET_SYSTEM = gql`
  fragment Roles on AuthRolesResponse {
    role
    type
    icon
    route
    selected
  }

  fragment RolesRecursive on AuthRolesResponse {
    roles {
      ...Roles
      roles {
        ...Roles
        roles {
          ...Roles
        }
      }
    }
  }

  query {
    system {
      enums {
        roleType
        userStatus
      }
      roles
      rolesTree {
        ...Roles
        ...RolesRecursive
      }
      roleDefault
      roleSuperadmin
      roleRolesAdmin
      socials
    }
  }
`;

export const GET_ROLES = gql`
  query {
    roles {
      roles {
        id
        key
        path
        route
        label
        type
        icon
      }
      superadmin
      default
      types
    }
  }
`;

export const SET_ROLES = gql`
  mutation setRoles($data: SetRolesInput!) {
    setRoles(data: $data) {
      id
      roles
    }
  }
`;

export const SET_STATUS = gql`
  mutation updateUserStatus($data: UpdateUserStatusInput!) {
    updateUserStatus(data: $data)
  }
`;

export const LOGIN = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        status
        email
        username
        roles
        auth
        created
        updated
        profile {
          nickname
          title
          firstName
          lastName
          phoneNumber
          mobileNumber
          address1
          address2
          zip
          city
          country
        }
        extra
        extraSchema
        preferences {
          useIdle
          idleTimeout
          useIdlePassword
        }
      }
    }
  }
`;

export const LOGOUT = gql`
  mutation logout($uuid: String!) {
    logout(uuid: $uuid)
  }
`;

export const REGISTER = gql`
  mutation createUser($data: UserInput!) {
    createUser(data: $data)
  }
`;

export const VERIFYACTIVATION = gql`
  mutation validateActivation($token: String!) {
    validateActivation(token: $token)
  }
`;

export const RECOVERPASSWORD = gql`
  mutation recoverPassword($email: String!) {
    recoverPassword(email: $email)
  }
`;

export const VERIFYRECOVER = gql`
  mutation validateRecover($token: String!) {
    validateRecover(token: $token)
  }
`;

export const RECOVERNEWPASSWORD = gql`
  mutation setNewPassword($password: String!, $token: String!) {
    setNewPassword(password: $password, token: $token) {
      token
      user {
        id
        status
        email
        username
        roles
        auth
        created
        updated
        profile {
          nickname
          title
          firstName
          lastName
          phoneNumber
          mobileNumber
          address1
          address2
          zip
          city
          country
        }
        extra
        extraSchema
        preferences {
          useIdle
          idleTimeout
          useIdlePassword
        }
      }
    }
  }
`;

export const SET_PREFERENCES = gql`
  mutation savePreferences($preferences: UserPreferencesInput!) {
    savePreferences(preferences: $preferences)
  }
`;

export const NICKNAME_EXIST = gql`
  query ($nickname: String!, $userId: String!) {
    nicknameExist(nickname: $nickname, userId: $userId)
  }
`;

export const SET_PROFILE = gql`
  mutation saveProfile($profile: UserProfileInput!) {
    saveProfile(profile: $profile)
  }
`;

export const SET_USER_PROFILE = gql`
  mutation saveUserProfile($userId: String!, $profile: UserProfileInput!) {
    saveUserProfile(userId: $userId, profile: $profile)
  }
`;

export const SET_USER_SOCIALS = gql`
  mutation saveSocials($socials: String!) {
    saveSocials(socials: $socials)
  }
`;

export const UPDATE_USER_PASSWORD = gql`
  mutation setUserPassword($data: UpdateUserPasswordInput!) {
    setUserPassword(data: $data)
  }
`;
