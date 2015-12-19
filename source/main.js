//
// MainProcess
'use strict';

import menubar from 'menubar';
import { app, ipcMain } from 'electron';

const request = require('request');
const mb = menubar({ icon: __dirname + '/images/read.png' });

const switchIconUnread = ()=> {
  mb.tray.setImage(__dirname + '/images/unread.png')
}
const switchIconRead = ()=> {
  mb.tray.setImage(__dirname + '/images/read.png')
}
mb.on('ready', function ready () {

  ipcMain.on('asynchronous-message', function(event, arg) {
    request('https://coincheck.jp/chats/list', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        event.sender.send('asynchronous-reply', body);
      }
    })
  });

  ipcMain.on('mark_unread', (event, arg)=> {
    switchIconUnread();
  });

  ipcMain.on('quit', (event, arg)=> {
    app.quit();
  });

  mb.on('show', ()=> {
    setTimeout(()=> {
      switchIconRead();
    }, 1000);
  })

  mb.on('hide', ()=> {
    switchIconRead();
  })

  mb.showWindow();
  mb.hideWindow();
  switchIconUnread();
})
