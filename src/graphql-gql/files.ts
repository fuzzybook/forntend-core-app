import gql from 'graphql-tag';

export const FILE_TREE = gql`
  query filesTree($path: String!) {
    filesTree(path: $path)
  }
`;

export const FILE_GET = gql`
  query getFile($path: String!) {
    getFile(path: $path)
  }
`;
