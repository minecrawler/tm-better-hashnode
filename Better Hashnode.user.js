// ==UserScript==
// @name         Better Hashnode
// @namespace    https://hashnode.com
// @version      0.2
// @description  try to take over the world!
// @author       Marco Alka
// @match        https://hashnode.com/*
// @grant        GM_addStyle
// ==/UserScript==

/**
 * Changelog
 *
 * 0.1
 *   - remove ads
 *
 * 0.2
 *   - add simple chat
 */

const bodyEle = document.querySelector('body');


// get stats
const userName = document.querySelector('.profile-name').innerText;


// remove ads after a grace period
setTimeout(function() {
    'use strict';

    document
        .querySelectorAll('.community-power.widget')
        .forEach(ele => ele.parentNode.removeChild(ele))
    ;
}, 5000);

// inject styles
const style =
`
.c-chat {
  position: fixed;
  z-index: 1000;
  right: 0;
  bottom: 0;
  margin-bottom: -250px;
  height: 250px;
  width: 500px;
}

.c-chat--visible {
  margin-bottom: 0;
}

.c-chat__input {
  width: calc(100% - 100px);
}

.c-chat__input-row {
  display: flex;
  flex-direction: row;
}

.c-chat__submit {
  width: 100px;
  height: 30px;
  margin: 0;
}

.c-chat__messages {
  height: calc(100% - 30px);
  overflow: hidden;
  word-wrap: break-word;
  overflow-y: scroll;
}

.c-chat__visibility-btn {
  position: absolute;
  top: calc(-2em - 2px);
  right: 0;
  height: 2em;
  width: 100px;
  cursor: pointer;
}


/* L:Theme */

.t-light.c-chat {
  border: 1px solid black;
  background-color: white;
  padding: 6px 10px;

  transition-property: margin;
  transition-duration: .3s;
  transition-timing-function: ease-in-out;
}

.t-light .c-chat__input {
  border: none;
}

.t-light .c-chat__messages {
  border-bottom: 1px solid #ccc;
}

.c-chat__submit {
  border: 0;
}

.t-light .c-chat__submit {
  color: #fff;
  background-color: #28a745;

  transition-property: background-color;
  transition-duration: .3s;
  transition-timing-function: ease-in-out;
}

.t-light .c-chat__submit:hover {
  background-color: #27a56c;
}

.t-light .c-chat__visibility-btn {
  border: none;
  padding: 1px 6px;
  color: white;
  background-color: #2fc681;

  transition-property: background-color;
  transition-duration: .3s;
  transition-timing-function: ease-in-out;
}

.t-light .c-chat__visibility-btn:hover {
  background-color: #1e7e34;
}
`;

GM_addStyle(style);


// inject chat
const chatEle = document.createElement('div');

chatEle.classList.add('c-chat');
chatEle.classList.add('t-light');
chatEle.innerHTML =
`
<button class="c-chat__visibility-btn / js-chat__visibility-btn">Show Chat</button>
<div class="c-chat__messages / js-chat__messages"></div>
<div class="c-chat__input-row">
  <input type=text maxlength="140" class="c-chat__input / js-chat__input" placeholder="Write a message">
  <button type=submit class="c-chat__submit / js-chat__submit">Send</button>
</div>
`;

const chatBtnEle = chatEle.querySelector('.js-chat__visibility-btn');
const chatInputEle = chatEle.querySelector('.js-chat__input');
const chatMessagesEle = chatEle.querySelector('.js-chat__messages');
const chatSubmitEle = chatEle.querySelector('.js-chat__submit');

bodyEle.appendChild(chatEle);
chatBtnEle.addEventListener('click', () => {
    chatEle.classList.toggle('c-chat--visible');
    if (chatEle.classList.contains('c-chat--visible')) {
        chatBtnEle.innerText = 'Hide Chat';
    }
    else {
        chatBtnEle.innerText = 'Show Chat';
    }
});

chatSubmitEle.addEventListener('click', () => {
    if (chatInputEle.value === '') return;

    chatMessagesEle.innerText += `[${userName}]: ${chatInputEle.value}`;
    chatMessagesEle.innerHTML += '<br>';
    chatInputEle.value = '';
    chatInputEle.focus();

    chatMessagesEle.scrollTop = chatMessagesEle.scrollHeight;
});


























