/**
 * // ==UserScript==
 * // @name         tm-better-hashnode
 * // @namespace    https://hashnode.com
 * // @version      0.2.1
 * // @description  Improve the Hashnode experience according to @maruru
 * // @author       Marco Alka
 * // @match        https://hashnode.com/*
 * // @source       https://github.com/minecrawler/tm-better-hashnode
 * // @updateURL    https://github.com/minecrawler/tm-better-hashnode/raw/master/dist/tm-better-hashnode.user.js
 * // @grant        GM_addStyle
 * // ==/UserScript==
 */

(function () {
  'use strict';

  GM_addStyle(`.action-nav .hiring-link{border-radius:1000px;line-height:1.5;font-size:1rem;padding:.375rem .75rem}.post-card.status-card:first-child,.widget.lets-write{display:none!important}.c-chat{position:absolute;right:0;bottom:0;margin-bottom:-250px;height:250px;width:500px;transition-timing-function:ease-in-out;transition-duration:.3s;transition-property:margin-bottom}.o-chat-visible.c-chat{margin-bottom:0}.c-chat__container{position:fixed;z-index:1000;right:0;top:0;height:100%}.c-chat__input{width:calc(100% - 100px)}.c-chat__input[disabled]{cursor:not-allowed}.c-chat__input-row{display:flex;flex-direction:row}.c-chat__submit{width:100px;height:30px;margin:0;cursor:pointer}.c-chat__submit[disabled]{cursor:not-allowed}.c-chat__messages{height:calc(100% - 30px);overflow:hidden;word-wrap:break-word;overflow-y:scroll}.c-chat__user-list{height:100%;width:200px;margin-right:-200px;transition-timing-function:ease-in-out;transition-duration:.3s;transition-property:margin-right,height}.o-chat-visible.c-chat__user-list{margin-right:0;height:calc(100% - 250px)}.o-chat-user-list__display-name{display:block}.c-chat-user-list__heading{font-size:1.5em;padding:1em 15px;margin:0}.o-chat-user-list__user{margin-bottom:5px;border-top:1px solid #777}.c-chat-user-list__users{list-style:none;padding-left:25px}.c-chat__visibility-btn{position:absolute;bottom:0;right:0;height:2em;width:100px;cursor:pointer;transition-timing-function:ease-in-out;transition-duration:.3s;transition-property:margin-bottom,margin-right,background-color}.o-chat-visible.c-chat__visibility-btn{margin-bottom:250px;margin-right:200px}.o-chat-user-list__username{display:block;font-size:.75em;margin-top:-5px;padding-left:10px}.t-light .c-chat{border-left:1px solid #000;border-top:1px solid #000;background-color:#fff;padding:6px 10px;transition-timing-function:ease-in-out;transition-duration:.3s;transition-property:margin}.t-light .c-chat__input{border:none}.t-light .c-chat__messages{border-bottom:1px solid #ccc}.t-light .c-chat__submit{border:0}.t-light .c-chat__submit{color:#fff;background-color:#28a745;transition-timing-function:ease-in-out;transition-duration:.3s;transition-property:background-color}.t-light .c-chat__submit:hover{background-color:#27a56c}.t-light .c-chat__user-list{background-color:#fff;border-left:1px solid #000}.t-light .c-chat__visibility-btn{border:none;padding:1px 6px;color:#fff;background-color:#2fc681}.t-light .c-chat__visibility-btn:hover{background-color:#1e7e34}.t-light .o-chat-user-list__username{color:#777}`);

  var Util = {
      /**
       * Call a REST endpoint with certain parameters
       *
       * @param {string} $endPoint
       * @returns {Promise.<string, {error: Error, response: string, status: number}>}
       */
      callRESTEndpoint($endPoint) {
          return new Promise((resolve, reject) => {
              const xhr = new XMLHttpRequest();

              xhr.open('GET', (
                  '/ajax' + ($endPoint.charAt(0) === '/'
                      ? $endPoint
                      : '/' + $endPoint
                  )
              ));
              xhr.onerror = err => {
                  reject({
                      error: err,
                      response: xhr.response,
                      status: xhr.status,
                  });
              };
              xhr.ontimeout = () => {
                  reject({
                      error: new Error(`Timeout exceeded`),
                      response: xhr.response,
                      status: xhr.status,
                  });
              };
              xhr.onload = () => {
                  if (xhr.status >= 200 && xhr.status < 300) {
                      resolve(xhr.response);
                  } else if (xhr.status >= 400) {
                      reject({
                          error: new Error(`HTTP Error (${xhr.status})`),
                          response: xhr.response,
                          status: xhr.status,
                      });
                  }
              };
              /*Object
                  .keys(httpHeaders)
                  .forEach(header => xhr.setRequestHeader(header, httpHeaders[header]))
              ;*/

              xhr.send(/*requestBody*/);
          });
      }
  };

  var API = {
      /**
       * Retrieve username and display name of current user
       *
       * @return {{username: string, displayName: string}}
       */
      getCurrentUser() {
          const nameEle = document.querySelector('.profile-name');

          return {
              displayName: nameEle.innerText,
              username: nameEle.href.toString().match(/\/@(.+)$/i)[1],
          };
      },

      /**
       * Retrieve user info by username
       *
       * @param {string} $username
       * @return {Promise.<Object, Object>}
       */
      getUserInfo($username) {
          return new Promise((res, rej) => {
              Util
                  .callRESTEndpoint('profile/' + $username)
                  .catch(rej)
                  .then(data => res(JSON.parse(data).profile))
              ;
          });
      },
  };

  var chatHTML = "<button class=\"c-chat__visibility-btn / js-chat__visibility-btn\">Show Chat</button> <div class=\"c-chat__user-list / js-chat__user-list\"> <p class=\"c-chat-user-list__heading\">Online Users</p> <ul class=\"c-chat-user-list__users / js-chat-user-list__users\"></ul> </div> <div class=\"c-chat / js-chat\"> <div class=\"c-chat__messages / js-chat__messages\"></div> <div class=\"c-chat__input-row\"> <input type=\"text\" maxlength=\"140\" class=\"c-chat__input / js-chat__input\" placeholder=\"Write a message\"> <button type=\"submit\" class=\"c-chat__submit / js-chat__submit\">Send</button> </div> </div> ";

  var settings = {
      server: 'localhost:1288/ws',
  };

  const bodyEle = document.querySelector('body');
  const chatEle = document.createElement('div');
  const username = API.getCurrentUser().username;

  chatEle.classList.add('c-chat__container');
  chatEle.classList.add('t-light');
  chatEle.innerHTML = chatHTML;
  bodyEle.appendChild(chatEle);

  const chatBtnEle = chatEle.querySelector('.js-chat__visibility-btn');
  const chatInputEle = chatEle.querySelector('.js-chat__input');
  const chatMessagesEle = chatEle.querySelector('.js-chat__messages');
  const chatSubmitEle = chatEle.querySelector('.js-chat__submit');

  const chatShellElements = [
      chatEle.querySelector('.js-chat'),
      chatEle.querySelector('.js-chat__user-list'),
      chatEle.querySelector('.js-chat__visibility-btn'),
  ];

  chatBtnEle.addEventListener('click', () => {
      if (!chatBtnEle.classList.contains('o-chat-visible')) {
          chatBtnEle.innerText = 'Hide Chat';
          chatShellElements.forEach(ele => ele.classList.add('o-chat-visible'));
      }
      else {
          chatBtnEle.innerText = 'Show Chat';
          chatShellElements.forEach(ele => ele.classList.remove('o-chat-visible'));
      }
  });

  const protocol = /^localhost/i.test(settings.server.toString()) ? 'ws' : 'wss';
  const socket = new WebSocket(protocol + '://' + settings.server);

  const sendCommand = (commandName, data) => {
      if (socket.readyState !== 1) {
          // queue command for later
          return;
      }

      const dataType = typeof data;

      if (!['string', 'number'].includes(dataType)) {
          data = JSON.stringify(data);
      }

      socket.send(JSON.stringify({
          command: commandName,
          data: data.toString(),
      }));
  };

  socket.addEventListener('open', eve => {
      displayChatMessage('System', 'Connected to chat server');
  });

  socket.addEventListener('message', eve => {
      const data = JSON.parse(eve.data);

      try {
          data.data = JSON.parse(data.data);
      }
      catch(err) { console.error(err); }

      // todo: interpret command correctly
      displayChatMessage(data.data.author, data.data.message);
  });

  const displayChatMessage = function displayChatMessage($author, $message) {
      chatMessagesEle.appendChild(document.createTextNode(`[${$author}]: ${$message}`));
      chatMessagesEle.appendChild(document.createElement('br'));
  };

  const sendChatMessage = function sendChatMessage($message) {
      sendCommand('chat-message', {
          author: username,
          message: $message,
      });
  };

  const showChatWorkingIndicator = function showChatWorkingIndicator() {
      chatInputEle.setAttribute('disabled', '');
      chatSubmitEle.setAttribute('disabled', '');
      chatSubmitEle.innerText = 'Working';
  };

  chatSubmitEle.addEventListener('click', () => {
      if (chatInputEle.value === '') return;

      sendChatMessage(chatInputEle.value);
      chatInputEle.value = '';
      chatInputEle.focus();
      chatMessagesEle.scrollTop = chatMessagesEle.scrollHeight;
  });

  setTimeout(() => {// todo: get rid of this workaround
      if (socket.readyState === 3) {
          showChatWorkingIndicator();
          displayChatMessage('System', 'Could not connect to chat server');
      }
  }, 2000);

  // remove ads after 5s
  setTimeout(function() {

      document
          .querySelectorAll('.community-power.widget')
          .forEach(ele => ele.parentNode.removeChild(ele))
      ;
  }, 5000);

  const username$1 = API.getCurrentUser().username;

  API
      .getUserInfo(username$1)
      .catch(err => {})
      .then(data => {
          document.querySelector(`div.score-wrap > a[href="/@${username$1}"] > p.big`).innerText = data.totalUpvotesReceived;
          document.querySelector(`div.score-wrap > a[href="/@${username$1}/followers"] > p.big`).innerText = data.numFollowers;
          document.querySelector(`div.score-wrap > a[href="/@${username$1}/following"] > p.big`).innerText = data.numFollowing;
      })
  ;

}());
