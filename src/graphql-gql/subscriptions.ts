import gql from 'graphql-tag';

export const DYNAMIC_SUBSCRIPTION = gql`
  subscription SubscriptionDynamicTopic($topic: String!) {
    subscriptionDynamicTopic(topic: $topic) {
      id
      message
      date
    }
  }
`;
