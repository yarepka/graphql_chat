import { useQuery, useMutation, useSubscription } from '@apollo/react-hooks';
import {
  addMessageMutation,
  messageAddedSubscription,
  messagesQuery,
} from './graphql/queries';

// Custom Hook
export function useChatMessages() {
  // Query
  const { data } = useQuery(messagesQuery);
  const messages = data ? data.messages : [];

  // Subscribtion
  useSubscription(messageAddedSubscription, {
    // client - ApolloClient
    onSubscriptionData: ({ client, subscriptionData }) => {
      // whenever we write data to the cache, component will be rerendered
      client.writeData({
        data: {
          messages: messages.concat(subscriptionData.data.messageAdded),
        },
      });
    },
  });

  // Mutation
  const [addMessage] = useMutation(addMessageMutation);
  return {
    messages,
    addMessage: (text) => addMessage({ variables: { input: { text } } }),
  };
}
