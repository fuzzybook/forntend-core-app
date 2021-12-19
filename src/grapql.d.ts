export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The javascript `Date` as string. Type represents date and time as the ISO Date string. */
  DateTime: Date;
  /** Roles object scalar type */
  RolesResponse: RoleResponse;
  /** Socials Data object scalar type */
  SocialData: SocialDataResponse;
  /** Socials object scalar type */
  SocialsResponse: SocialResponse;
};

export type AuthRolesResponse = {
  __typename?: 'AuthRolesResponse';
  icon?: Maybe<Scalars['String']>;
  role?: Maybe<Scalars['String']>;
  roles?: Maybe<Array<AuthRolesResponse>>;
  route?: Maybe<Scalars['Float']>;
  selected?: Maybe<Scalars['Boolean']>;
  type?: Maybe<RoleType>;
};

export type Enums = {
  __typename?: 'Enums';
  roleType: Array<Scalars['String']>;
  userStatus: Array<Scalars['String']>;
};

export type FilesDirectoryAttributeResponse = {
  __typename?: 'FilesDirectoryAttributeResponse';
  /** access date */
  atimeMs?: Maybe<Scalars['Float']>;
  /** creation date */
  birthtimeMs?: Maybe<Scalars['Float']>;
  /** update date */
  ctimeMs?: Maybe<Scalars['Float']>;
};

export type FilesDirectoryResponse = {
  __typename?: 'FilesDirectoryResponse';
  attributes: FilesDirectoryAttributeResponse;
  /** files */
  children?: Maybe<Array<FilesDirectoryResponse>>;
  /** extensions if not directory */
  extension?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  path: Scalars['String'];
  size: Scalars['Float'];
  type: Scalars['String'];
};

export type LoginResponse = {
  __typename?: 'LoginResponse';
  /** token */
  token: Scalars['String'];
  /** user data */
  user: UserResponse;
};

export type Mutation = {
  __typename?: 'Mutation';
  createUser: Scalars['String'];
  delete: Scalars['Boolean'];
  login: LoginResponse;
  logout: Scalars['Boolean'];
  recoverPassword: Scalars['String'];
  saveAvatar: Scalars['Boolean'];
  savePreferences: Scalars['Boolean'];
  saveProfile: Scalars['Boolean'];
  saveSocials: Scalars['Boolean'];
  saveUserPreferences: Scalars['Boolean'];
  saveUserProfile: Scalars['Boolean'];
  saveUserSocials: Scalars['Boolean'];
  setNewPassword: LoginResponse;
  setRoles: UserResponse;
  setUserPassword: Scalars['Boolean'];
  update: UserResponse;
  updateStatus: Scalars['Boolean'];
  userDataSetFile: Scalars['Boolean'];
  validateActivation: Scalars['Boolean'];
  validateRecover: Scalars['Boolean'];
};


export type MutationCreateUserArgs = {
  data: UserInput;
};


export type MutationDeleteArgs = {
  uuid: Scalars['String'];
};


export type MutationLoginArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationLogoutArgs = {
  uuid: Scalars['String'];
};


export type MutationRecoverPasswordArgs = {
  email: Scalars['String'];
};


export type MutationSaveAvatarArgs = {
  avatar: Scalars['String'];
  id: Scalars['String'];
};


export type MutationSavePreferencesArgs = {
  preferences: UserPreferencesInput;
};


export type MutationSaveProfileArgs = {
  profile: UserProfileInput;
};


export type MutationSaveSocialsArgs = {
  socials: Scalars['String'];
};


export type MutationSaveUserPreferencesArgs = {
  preferences: UserPreferencesInput;
  userId: Scalars['String'];
};


export type MutationSaveUserProfileArgs = {
  profile: UserProfileInput;
  userId: Scalars['String'];
};


export type MutationSaveUserSocialsArgs = {
  socials: Scalars['String'];
  userId: Scalars['String'];
};


export type MutationSetNewPasswordArgs = {
  password: Scalars['String'];
  token: Scalars['String'];
};


export type MutationSetRolesArgs = {
  data: SetRolesInput;
};


export type MutationSetUserPasswordArgs = {
  data: UpdateUserPasswordInput;
};


export type MutationUpdateArgs = {
  data: UpdateUserInput;
};


export type MutationUpdateStatusArgs = {
  data: UpdateUserStatusInput;
};


export type MutationUserDataSetFileArgs = {
  data: Scalars['String'];
  path: Scalars['String'];
};


export type MutationValidateActivationArgs = {
  token: Scalars['String'];
};


export type MutationValidateRecoverArgs = {
  token: Scalars['String'];
};

export type ProfileResponse = {
  __typename?: 'ProfileResponse';
  address1?: Maybe<Scalars['String']>;
  address2?: Maybe<Scalars['String']>;
  city?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  firstName?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  mobileNumber?: Maybe<Scalars['String']>;
  nickname?: Maybe<Scalars['String']>;
  phoneNumber?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  zip?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  alive: Scalars['Boolean'];
  avatar: Scalars['String'];
  enums: Enums;
  getTemplate: Scalars['String'];
  getTransctionalMail: Scalars['String'];
  heartbeat: Scalars['Boolean'];
  me?: Maybe<UserResponse>;
  nicknameExist?: Maybe<Scalars['Boolean']>;
  previewMJML: TemplatesParsingResponse;
  roles: Scalars['RolesResponse'];
  rolesInfo: RolesInfo;
  system: System;
  templatesTree: Scalars['String'];
  transctionalMails: Scalars['String'];
  user: UserResponse;
  userDataFilesDirectory: FilesDirectoryResponse;
  userDataGetFile: Scalars['String'];
  users: Array<UserResponse>;
};


export type QueryAvatarArgs = {
  id: Scalars['String'];
};


export type QueryGetTemplateArgs = {
  path: Scalars['String'];
};


export type QueryGetTransctionalMailArgs = {
  template: Scalars['String'];
};


export type QueryNicknameExistArgs = {
  nickname: Scalars['String'];
  userId: Scalars['String'];
};


export type QueryPreviewMjmlArgs = {
  template: Scalars['String'];
};


export type QueryTemplatesTreeArgs = {
  path: Scalars['String'];
};


export type QueryUserArgs = {
  id: Scalars['String'];
};


export type QueryUserDataFilesDirectoryArgs = {
  path: Scalars['String'];
};


export type QueryUserDataGetFileArgs = {
  path: Scalars['String'];
};

export type RoleResponse = {
  __typename?: 'RoleResponse';
  description: Scalars['String'];
  icon: Scalars['String'];
  path: Scalars['String'];
  route: Scalars['Float'];
  type: RoleType;
  user: Scalars['Float'];
};

export type RoleType =
  | 'leaf'
  | 'root'
  | 'super';

export type RolesInfo = {
  __typename?: 'RolesInfo';
  ts: Scalars['String'];
};

export type SetRolesInput = {
  id: Scalars['String'];
  roles: Array<Scalars['String']>;
};

export type SocialDataResponse = {
  __typename?: 'SocialDataResponse';
  /** social address */
  address: Scalars['String'];
};

export type SocialResponse = {
  __typename?: 'SocialResponse';
  /** social mask for address input */
  addressMask: Scalars['String'];
  /** social icon */
  icon: Scalars['String'];
  /** social label */
  label: Scalars['String'];
};

export type System = {
  __typename?: 'System';
  enums: Enums;
  roleDefault: Scalars['String'];
  roleRolesAdmin: Scalars['String'];
  roleSuperadmin: Scalars['String'];
  /** type RolesResponse = { [key: string]: RoleResponse }; defined in client */
  roles: Scalars['RolesResponse'];
  rolesTree?: Maybe<AuthRolesResponse>;
  /** type SocialsResponse = { [key: string]: SocialResponse }; defined in client */
  socials: Scalars['SocialsResponse'];
};

export type TemplatesParsingResponse = {
  __typename?: 'TemplatesParsingResponse';
  errors?: Maybe<Scalars['String']>;
  text: Scalars['String'];
};

export type UpdateUserInput = {
  id: Scalars['String'];
  profile?: Maybe<UserProfileInput>;
  status?: Maybe<UserStatus>;
};

export type UpdateUserPasswordInput = {
  password: Scalars['String'];
  userId: Scalars['String'];
};

export type UpdateUserStatusInput = {
  id: Scalars['String'];
  status: Scalars['String'];
};

export type UserInput = {
  email: Scalars['String'];
  password: Scalars['String'];
  profile?: Maybe<UserProfileInput>;
  status?: Maybe<UserStatus>;
};

export type UserPreferences = {
  __typename?: 'UserPreferences';
  /** time to wait idle state */
  idleTimeout?: Maybe<Scalars['Float']>;
  /** lock screen on idle */
  useIdle?: Maybe<Scalars['Boolean']>;
  /** use pasword to recover state */
  useIdlePassword?: Maybe<Scalars['Boolean']>;
};

export type UserPreferencesInput = {
  idleTimeout?: Maybe<Scalars['Float']>;
  useIdle?: Maybe<Scalars['Boolean']>;
  useIdlePassword?: Maybe<Scalars['Boolean']>;
};

export type UserProfileInput = {
  address1?: Maybe<Scalars['String']>;
  address2?: Maybe<Scalars['String']>;
  city?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  firstName?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  mobileNumber?: Maybe<Scalars['String']>;
  nickname?: Maybe<Scalars['String']>;
  phoneNumber?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  zip?: Maybe<Scalars['String']>;
};

export type UserResponse = {
  __typename?: 'UserResponse';
  /** user roles binary */
  auth?: Maybe<Scalars['Float']>;
  /** creation date */
  created?: Maybe<Scalars['DateTime']>;
  /** user email */
  email: Scalars['String'];
  /** extra data */
  extra?: Maybe<Scalars['String']>;
  /** extra data schema */
  extraSchema?: Maybe<Scalars['String']>;
  /** postgres uuid v4 */
  id: Scalars['String'];
  /** user preferences */
  preferences?: Maybe<UserPreferences>;
  /** user profile */
  profile?: Maybe<ProfileResponse>;
  /** user roles */
  roles: Array<Scalars['String']>;
  /** user preferences */
  socials?: Maybe<Scalars['SocialData']>;
  /** user status scalar UserStatus */
  status: UserStatus;
  /** last update date */
  updated?: Maybe<Scalars['DateTime']>;
  /** user name by profile */
  username?: Maybe<Scalars['String']>;
};

export type UserStatus =
  | 'banned'
  | 'operating'
  | 'suspended'
  | 'waiting';
