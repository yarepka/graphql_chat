import React, { Component } from 'react';
import { addMessage, getMessages, onMessageAdded } from './graphql/queries';
import MessageInput from './MessageInput';
import MessageList from './MessageList';

class Chat extends Component {
  state = { messages: [] };
  subscription = null;

  async componentDidMount() {
    const messages = await getMessages();
    this.setState({ messages });
    // subscribe/listen for an MESSAGE_ADDED event, the first argument is the function which should be called whenever got the MESSAGE_ADDED event
    this.subscription = onMessageAdded((message) => {
      this.setState({ messages: this.state.messages.concat(message) });
    });
  }

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  async handleSend(text) {
    await addMessage(text);
  }

  render() {
    const { user } = this.props;
    const { messages } = this.state;
    return (
      <section className='section'>
        <div className='container'>
          <h1 className='title'>Chatting as {user}</h1>
          <MessageList user={user} messages={messages} />
          <MessageInput onSend={this.handleSend.bind(this)} />
        </div>
      </section>
    );
  }
}

export default Chat;
