/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { boot } from 'quasar/wrappers';
import ApolloClient from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink, from } from 'apollo-link';
import { onError } from 'apollo-link-error';

import { Dialog } from 'quasar';
import useUsers from 'src/modules/useUser';
import useSystem from 'src/modules/useSystem';

import { setContext } from 'apollo-link-context';
import { siteConfig } from 'src/APPLICATION/condfig/site';

export const getErrorUrl = (error: string): string => {
  const message = parseGqlErrorMessage(error);
  let url = '';
  // TODO move hardcoded to config
  switch (message) {
    case 'notaurhorized':
      url = '/401';
  }
  return url;
};

export const gqlErrorAlert = (
  title: string,
  error: string
): Promise<string> => {
  return new Promise((resolve) => {
    const message = parseGqlErrorMessage(error);
    let url = '';
    // TODO move hardcoded to config
    switch (message) {
      case 'notaurhorized':
        url = '/401';
    }
    Dialog.create({
      title: title,
      message: message,
      html: true,
      persistent: true,
    }).onOk(() => {
      resolve(url);
    });
  });
};

export const AUTH_TOKEN = 'AUTH_TOKEN';

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(AUTH_TOKEN) || null;
  return {
    headers: {
      ...headers,
      authorization: token,
    },
  };
});

const httpLink = new HttpLink({ uri: siteConfig.graphQlUrl });

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.log(
        `[GraphQL error]: Message: ${message}, Location: %s, Path: %s`,
        locations,
        path
      );
    });
  if (networkError) console.log('[Network error]: %s', networkError);
});

const afterwareLink = new ApolloLink((operation, forward) => {
  return forward(operation).map((response) => {
    /* eslint-disable */
    const context = operation.getContext();
    const {
      response: { headers },
    } = context;

    if (headers) {
      const refreshToken = headers.get('refreshToken');
      if (refreshToken) {
        console.log('AUTH_TOKEN', refreshToken);
        localStorage.setItem(AUTH_TOKEN, refreshToken);
      }
    }
    return response;
    /* eslint-enable */
  });
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, afterwareLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});

export const parseGqlError = (error: Error): string => {
  const message =
    typeof error.message == 'string' ? error.message : 'gql.nuknownerror';
  const a = message.split(':');
  if (a.length == 2 && typeof a[1] == 'string') {
    return a[1].trim();
  } else {
    return message;
  }
};

export const parseGqlErrorMessage = (message: string): string => {
  const a = message.split(':');
  if (a.length == 2 && typeof a[1] == 'string') {
    return a[1].trim();
  } else {
    return message;
  }
};

export default boot(async ({}) => {
  const { me, user, isLogged } = useUsers();
  const { getSystem, system } = useSystem();

  let result;
  do {
    result = await getSystem();
    // TODO route to error 501
    if (!result) await gqlErrorAlert('System Error', "Can't load system data!");
  } while (!result);
  console.log('SYSTEM: ', JSON.parse(JSON.stringify(system.value)));
  await me();
  console.log('ISLOGGED: ', isLogged.value);
  console.log('USER: ', JSON.parse(JSON.stringify(user.value)));
});
