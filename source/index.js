//
// Renderer

import React from 'react';
import ReactDom from 'react-dom';
import { ipcRenderer } from 'electron';
import moment from 'moment';

const FETCH_INTERVAL = 10000

class MessageList extends React.Component {
  render() {
    let list = this.props.list.map((msg)=> {
      let created_at = moment(msg.created_at).format('MM/DD HH:mm:ss');
      return (
        <li className='msg_list-item' key={msg.id}>
          <div className='msg_list-item_title'>
            <div className='msg_list-item-user'><i className="flaticon-user43"></i> {msg.name}</div>
            <div className='msg_list-item-time'>{created_at}</div>
          </div>
          <div className='msg_list-item_content'>{msg.content}</div>
        </li>
      );
    });

    return (
      <ol className='msg_list'>
        {list}
      </ol>
    )
  }
}

class Header extends React.Component {
  render() {
    return (
      <div className='app_bar'>
        <h1 className='app_bar-title'> coincheck chat </h1>
        <a className='app_bar-quit_button' onClick={this.props.onClickQuit}><i className="flaticon-powerbuttons"></i></a>
        <span className='app_bar-time'>{this.props.updated}</span>
      </div>
    )
  }
}

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      body: [],
      updatedAt: ''
    };

    let recentlyId = 0
    ipcRenderer.on('fetch_response', (event, arg)=> {
      let body    = JSON.parse(arg)
      let list    = body.chats.reverse()
      let updated = moment().format('MM/DD HH:mm:ss');
      this.setState({ updatedAt: updated });

      if(list.length > 0 && list[0].id != recentlyId) {
        let recentlyMessage = list[0]
        this.setState({body: list})
        recentlyId = recentlyMessage.id

        this.notify(`message: ${recentlyMessage.name}`, recentlyMessage.content);

        setTimeout(()=> {
          ipcRenderer.send('mark_unread');
        }, 1000)
      }
    });

   ipcRenderer.send('fetch_request');
    setInterval(()=> {
     ipcRenderer.send('fetch_request');
    }, FETCH_INTERVAL)
  }

  quit() {
    ipcRenderer.send('quit');
  }

  notify(title, message) {
    ipcRenderer.send('notify', title, message);
  }

  render() {
    return (
      <div>
        <Header updated={this.state.updatedAt} onClickQuit={this.quit} />
        <MessageList list={this.state.body}/>
      </div>
    )
  }
}

document.addEventListener("DOMContentLoaded", ()=> {
  ReactDom.render(<App />, document.getElementById('app'))
})
