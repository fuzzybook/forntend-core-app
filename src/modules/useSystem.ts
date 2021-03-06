import { reactive, toRefs } from 'vue';
import { apolloClient } from 'src/boot/graphql';
import {
  System,
  AuthRolesResponse,
  RoleResponse,
  SocialResponse,
  TemplatesParsingResponse,
} from 'src/grapql';
import {
  GET_SYSTEM,
  GET_TRANSACTIONAL_MAIL,
  GET_TRANSACTIONAL_THUMBS,
  PREVIEW_MJML,
  SAVE_TRANSACTIONAL_IMAGE,
  SAVE_TRANSACTIONAL_MAIL,
  TRANSACTIONAL_MAILS,
} from 'src/graphql-gql/qwery&mutation';
import { Idle } from 'src/libs/idle/idle';
import useUser from 'src/modules/useUser';

export type IRoles = { [key: string]: RoleResponse };
export type ISocials = { [key: string]: SocialResponse };

interface ISystem extends Omit<System, 'roles' | 'socials'> {
  roles: IRoles;
  socials: ISocials;
}

interface SystemState {
  leftDrawerOpen: boolean;
  system: ISystem;
  isIdle: boolean;
}

interface ISystem {
  system: ISystem;
}

interface ITemplatesParsingResponse {
  previewMJML: TemplatesParsingResponse;
}

export interface MJMLError {
  line: string;
  tagName: string;
  message: string;
  formattedMessage: string;
  startLine?: number;
  startPos?: number;
  endLine?: number;
  endPos?: number;
}

export interface IMJMLParingData {
  html: string;
  errors: MJMLError[] | null;
}

const state = reactive<SystemState>({
  leftDrawerOpen: false,
  system: <ISystem>{},
  isIdle: false,
});

interface ITransactionalMailsResponse {
  transctionalMails: string;
}

export interface TransactionalMailTemplateVar {
  var: string;
  description?: string;
}

export interface TransactionalMailTemplate {
  [key: string]: {
    type: string;
    fileName: string;
    icon: string;
    vars?: TransactionalMailTemplateVar[];
  };
}

export interface TransactionalMailConstants {
  [key: string]: string;
}
export interface TransactionalMail {
  constants: TransactionalMailConstants;
  templates: TransactionalMailTemplate;
}

export default function useSystem() {
  const { user, isLogged, isSuperadmin } = useUser();

  function toggleLeftDrawer() {
    state.leftDrawerOpen = !state.leftDrawerOpen;
  }

  function setLeftDrawer(value: boolean) {
    state.leftDrawerOpen = value;
  }

  async function transctionalMails(): Promise<TransactionalMail | string> {
    try {
      const {
        data: { transctionalMails },
      } = await apolloClient.query<ITransactionalMailsResponse>({
        query: TRANSACTIONAL_MAILS,
      });
      return JSON.parse(transctionalMails) as TransactionalMail;
    } catch (error) {
      return (error as Error).message;
    }
  }

  async function getTransctionalMail(template: string): Promise<string> {
    try {
      const {
        data: { getTransctionalMail },
      } = await apolloClient.query<{ getTransctionalMail: string }>({
        query: GET_TRANSACTIONAL_MAIL,
        fetchPolicy: 'network-only',
        variables: {
          template,
        },
      });
      return getTransctionalMail;
    } catch (error) {
      return (error as Error).message;
    }
  }

  async function getTransctionalThumbs(): Promise<string[] | Error> {
    try {
      const {
        data: { getTransctionalImages },
      } = await apolloClient.query<{ getTransctionalImages: string[] }>({
        query: GET_TRANSACTIONAL_THUMBS,
        fetchPolicy: 'network-only',
      });
      return getTransctionalImages;
    } catch (error) {
      return error as Error;
    }
  }

  async function saveTransctionalMail(
    template: string,
    name: string
  ): Promise<boolean | string> {
    try {
      const { data } = await apolloClient.mutate<boolean>({
        mutation: SAVE_TRANSACTIONAL_MAIL,
        variables: {
          template,
          name,
        },
      });
      return data as boolean;
    } catch (error) {
      return error as string;
    }
  }

  async function saveTransctionalImage(
    image: string,
    id: string
  ): Promise<boolean | string> {
    try {
      const { data } = await apolloClient.mutate<boolean>({
        mutation: SAVE_TRANSACTIONAL_IMAGE,
        variables: {
          image,
          id,
        },
      });
      return data as boolean;
    } catch (error) {
      return error as string;
    }
  }

  function getRoles(): IRoles | string {
    try {
      if (state.system) {
        return state.system.roles as unknown as IRoles;
      } else {
        return 'system.setup.notfound';
      }
    } catch (error) {
      return (error as Error).message;
    }
  }

  function getSocials(): ISocials | string {
    try {
      if (state.system) {
        return state.system.socials as unknown as ISocials;
      } else {
        return 'system.setup.notfound';
      }
    } catch (error) {
      return (error as Error).message;
    }
  }

  async function getSystem(): Promise<boolean> {
    try {
      const {
        data: { system },
      } = await apolloClient.query<ISystem>({
        query: GET_SYSTEM,
      });
      state.system = system;
      return true;
    } catch (error) {
      return false;
    }
  }

  function getRoleAutorization(roles: string[]): boolean {
    if (!isLogged.value || !user.value) return false;
    if (isSuperadmin) return true;
    let _route = 0;
    const _user = user.value.auth || (0 as number);
    roles.forEach((r) => {
      const role = state.system.roles[r];
      if (role) _route |= role.route;
    });
    return (_route & _user) != 0;
  }

  // ROLES

  function getRoleRoots(roles: string[]): { [key: string]: boolean } {
    const roots = <{ [key: string]: boolean }>{};
    roles.forEach((r) => {
      const role = state.system.roles[r];
      if (role) {
        const ra = role.path.split('.');
        const rs = ra.slice().reverse();
        for (const x of rs) {
          const role = state.system.roles[x];
          if (role) {
            if (role.icon) {
              if (!roots.hasOwnProperty(role.icon)) {
                roots[role.icon] = true;
              }
              break;
            }
          }
        }
      }
    });
    return roots;
  }

  function getTree(roles: string[] = []): AuthRolesResponse {
    resetRolesTree(state.system.rolesTree as AuthRolesResponse, roles);
    return state.system.rolesTree as AuthRolesResponse;
  }

  const clearRolesChildren = (item: AuthRolesResponse) => {
    const select = (ro: AuthRolesResponse) => {
      if (ro.roles) {
        ro.roles.forEach((r) => {
          r.selected = false;
          select(r);
        });
      }
    };
    select(item);
  };

  const clearSuperadminRole = (item: AuthRolesResponse) => {
    const select = (ro: AuthRolesResponse) => {
      if (ro.roles) {
        ro.roles.forEach((r) => {
          if (ro.role == state.system.roleSuperadmin) ro.selected = false;
          select(r);
        });
      }
    };
    if (item.role?.toLowerCase() == state.system.roleSuperadmin)
      item.selected = false;
    select(item);
  };

  const selectRole = (role: AuthRolesResponse, value: string) => {
    const select = (
      ro: AuthRolesResponse,
      value: string,
      parent: AuthRolesResponse
    ) => {
      if (ro.role == value && ro.selected) {
        clearRolesChildren(ro);
        if (parent) parent.selected = false;
        return;
      }

      if (ro.roles) {
        ro.roles.forEach((r) => {
          select(r, value, ro);
        });
      }
    };
    if (value.toLowerCase() !== state.system.roleSuperadmin)
      clearSuperadminRole(role);
    select(role, value, <AuthRolesResponse>{});
  };

  function resetRolesTree(role: AuthRolesResponse, roles: string[] = []) {
    const resetRole = (role: AuthRolesResponse, roles: string[]) => {
      if (role.roles) {
        role.roles.forEach((r) => {
          if (r.role && roles.includes(r.role.toLowerCase())) {
            r.selected = true;
          } else {
            r.selected = false;
          }
          resetRole(r, roles);
        });
      }
    };

    roles.includes(state.system.roleSuperadmin)
      ? (role.selected = true)
      : (role.selected = false);

    resetRole(role, roles);
  }

  function getHTMLRolesTree(userRoles: string[]) {
    const level = 0;
    let html = `<ul>
    <li class="tooltip-item ${
      userRoles.includes('superadmin') ? 'selected' : ''
    }" ><span class="item-text">superadmin</span></li>`;

    const getRolesasHtml = (
      roles: AuthRolesResponse,
      level: number,
      userRoles: string[]
    ) => {
      level++;
      const _roles = Object.assign([], roles.roles);
      _roles.forEach((r) => {
        const s = (r as AuthRolesResponse).role || '';
        let l = '';
        for (let i = 0; i != level; i++) {
          l += '<span class="q-ml-sm"></span>';
        }
        html += `<li class="tooltip-item ${
          userRoles.includes(s.toLowerCase()) ? 'selected' : ''
        }">${l}<span class="item-text">${s.toLowerCase()}</span></li>`;
        getRolesasHtml(r as AuthRolesResponse, level, userRoles);
      });
    };

    getRolesasHtml(
      state.system.rolesTree as AuthRolesResponse,
      level,
      userRoles
    );
    return html + '</ul>';
  }

  const getSelectedRoles = (roles: AuthRolesResponse): string[] => {
    const result = <string[]>[];
    const select = (ro: AuthRolesResponse) => {
      if (ro.selected && ro.role) {
        result.push(ro.role?.toLowerCase());
        return;
      }
      if (ro.roles) {
        ro.roles.forEach((r) => {
          select(r);
        });
      }
    };

    select(roles);

    return result;
  };

  // end roles

  // idle management

  const onResumeFromIdle = () => {
    state.isIdle = false;
  };
  const onReportUserIsIdle = () => {
    state.isIdle = true;
  };

  const idle = new Idle({
    activityReportInSec: user.value?.preferences?.idleTimeout || 0,
  });

  idle.onReportUserIsIdle = onReportUserIsIdle.bind(idle);
  idle.onResumeFromIdle = onResumeFromIdle.bind(idle);

  // end idle

  const renderMjml = async (
    template: string,
    type: string
  ): Promise<IMJMLParingData> => {
    try {
      const { data } = await apolloClient.query<ITemplatesParsingResponse>({
        query: PREVIEW_MJML,
        fetchPolicy: 'network-only',
        variables: {
          template,
          type,
        },
      });
      if (data.previewMJML.errors) {
        const errors: MJMLError[] = JSON.parse(
          data.previewMJML.errors
        ) as MJMLError[];
        return { html: data.previewMJML.text, errors: errors };
      }
      return { html: data.previewMJML.text, errors: null };
    } catch (error) {
      return { html: (error as Error).message, errors: null };
    }
  };

  return {
    ...toRefs(state),
    //idle
    idle,
    // drawers
    toggleLeftDrawer,
    setLeftDrawer,
    // system
    getSystem,
    //socials
    getSocials,
    // roles
    getRoles,
    getRoleAutorization,
    getRoleRoots,
    getHTMLRolesTree,
    getSelectedRoles,
    clearRolesChildren,
    clearSuperadminRole,
    selectRole,
    getTree,
    resetRolesTree,
    //
    renderMjml,
    transctionalMails,
    getTransctionalMail,
    saveTransctionalMail,
    saveTransctionalImage,
    getTransctionalThumbs,
  };
}
