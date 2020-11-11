import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  split,
} from 'apollo-boost';
// in order to work with subscriptions
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { getAccessToken } from '../auth';

const httpUrl = 'http://localhost:9000/graphql';
const wsUrl = 'ws://localhost:9000/graphql';

const httpLink = ApolloLink.from([
  new ApolloLink((operation, forward) => {
    const token = getAccessToken();
    if (token) {
      operation.setContext({ headers: { authorization: `Bearer ${token}` } });
    }
    return forward(operation);
  }),
  new HttpLink({ uri: httpUrl }),
]);

// lazy: true - will only make websocket connection when it's needed, it happens whenever we request the graphQL subscription for the first time
// reconnect: true - if websocket connection interrupted, the client will try to reconnect
const wsLink = new WebSocketLink({
  uri: wsUrl,
  options: {
    // connectionParams - payload object of the first message. We can use this message payload to send autherntication credentials. WebSockets use ws protocol, not http, so we can't send data through the request header
    // we make it a function, to solve the problem with accessToken being null whenever first time log in, without having accessToken in localStorage
    connectionParams: () => ({
      accessToken: getAccessToken(),
    }),
    lazy: true,
    reconnect: true,
  },
});

// tells if current opearion is subscription or not
function isSubscription(operation) {
  const definition = getMainDefinition(operation.query);
  return (
    definition.kind === 'OperationDefinition' &&
    definition.operation === 'subscription'
  );
}

const client = new ApolloClient({
  cache: new InMemoryCache(),
  // if it is a subscription we want to use "wsLink", otherwise "httpLink"
  link: split(isSubscription, wsLink, httpLink),
  defaultOptions: { query: { fetchPolicy: 'no-cache' } },
});

export default client;
