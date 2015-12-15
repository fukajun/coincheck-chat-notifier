//
// Renderer

import React from 'react';
import ReactDom from 'react-dom';
import { ipcRenderer } from 'electron';

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = { body: [], updatedAt: '' };

    let recentlyId = 0
    ipcRenderer.on('asynchronous-reply', (event, arg)=> {
      let body = JSON.parse(arg)
      let list = body.chats.reverse()
      this.setState({ updatedAt: this.dateString() });

      if(list.length > 0 && list[0].id != recentlyId) {
        let recentlyMessage = list[0]
        this.setState({body: list})
        recentlyId = recentlyMessage.id

        this.notify('message', recentlyMessage.content);

        setTimeout(()=> {
          ipcRenderer.send('mark_unread');
        }, 1000)
      }
    });

   ipcRenderer.send('asynchronous-message', 'ping');
    setInterval(()=> {
     ipcRenderer.send('asynchronous-message', 'ping');
    }, 10000)
  }

  notify(title, message) {
    Notification.requestPermission();
    var n = new Notification(title, { body: message });
  }

  dateString() {
    let now = new Date()
    return `${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
  }

  render() {
    let list = this.state.body.map((msg)=> {
      let created_at = msg.created_at.replace(/\..+/, '')
      return (
        <li className='msg_list-item' key={msg.id}>
          <div className='msg_list-item_title'>{created_at} : {msg.name}</div>
          <div className='msg_list-item_content'>{msg.content}</div>
        </li>
      );
    });

    return (
      <div>
        <div className='app_bar'>
          <h1 className='app_bar-title'>- Message -</h1>
          <span className='app_bar-time'>{this.state.updatedAt}</span>
        </div>
        <ol className='msg_list'>
          {list}
        </ol>
      </div>
    )
  }
}

document.addEventListener("DOMContentLoaded", ()=> {
  ReactDom.render(<App />, document.getElementById('app'))
})
