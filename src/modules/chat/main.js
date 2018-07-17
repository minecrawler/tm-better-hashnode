import { default as API } from '../../HashnodeAPI.js';
import chatHTML from './html/chat.html';
import { default as settings } from './settings.js';

const bodyEle = document.querySelector('body');
const chatEle = document.createElement('div');
const username = API.getCurrentUser().username;

chatEle.classList.add('c-chat');
chatEle.classList.add('t-light');
chatEle.innerHTML = chatHTML;

const chatBtnEle = chatEle.querySelector('.js-chat__visibility-btn');
const chatInputEle = chatEle.querySelector('.js-chat__input');
const chatMessagesEle = chatEle.querySelector('.js-chat__messages');
const chatSubmitEle = chatEle.querySelector('.js-chat__submit');
const socket = new WebSocket('wss://' + settings.server);

socket.addEventListener('open', eve => {
    displayChatMessage('System', 'Connected to chat server');
});

socket.addEventListener('message', eve => {
    const data = JSON.parse(eve.data);
    displayChatMessage(data.author, data.message);
});

const displayChatMessage = function displayChatMessage($author, $message) {
    chatMessagesEle.appendChild(document.createTextNode(`[${$author}]: ${$message}`));
    chatMessagesEle.appendChild(document.createElement('br'));
};

const hideChatWorkingIndicator = function hideChatWorkingIndicator() {
    chatInputEle.removeAttribute('disabled');
    chatSubmitEle.removeAttribute('disabled');
    chatSubmitEle.innerText = 'Send';
};

const sendChatMessage = function sendChatMessage($message) {
    socket.readyState > 3 && socket.send(`{"author":"${username}","message":"${$message}"}`);
};

const showChatWorkingIndicator = function showChatWorkingIndicator() {
    chatInputEle.setAttribute('disabled', '');
    chatSubmitEle.setAttribute('disabled', '');
    chatSubmitEle.innerText = 'Working';
};

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
