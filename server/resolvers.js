const { PubSub } = require('graphql-subscriptions');
const db = require('./db');

const MESSAGE_ADDED = 'MESSAGE_ADDED';

const pubSub = new PubSub();

function requireAuth(userId) {
  if (!userId) {
    throw new Error('Unauthorized');
  }
}

const Query = {
  messages: (_root, _args, { userId }) => {
    requireAuth(userId);
    return db.messages.list();
  },
};

const Mutation = {
  addMessage: (_root, { input }, { userId }) => {
    requireAuth(userId);
    const messageId = db.messages.create({ from: userId, text: input.text });
    const message = db.messages.get(messageId);
    // publish an event of type 'MESSAGE_ADDED'
    // {messageAdded: message}, property name should match the subscribtion name
    pubSub.publish(MESSAGE_ADDED, { messageAdded: message });
    return message;
  },
};

const Subscription = {
  messageAdded: {
    // MESSAGE_ADDED - event type
    // clien will be able to recive multiple values over time, iterator - generate multiple values
    subscribe: (_root, _args, { userId }) => {
      // remember we are passing the token to the payload of first websocket message, user should be logged in, in order to be able to listen for messages
      requireAuth(userId);
      return pubSub.asyncIterator(MESSAGE_ADDED);
    },
  },
};

module.exports = { Query, Mutation, Subscription };
