
const Qs = require('qs');
const socket = io();

// Elements
const messageForm = document.querySelector('#message-form');
const messageFormInput = messageForm.querySelector('input');
const messageFormButton = messageForm.querySelector('button');
const messages = document.querySelector('#messages');


const messageTemplate = document.querySelector('#message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;


const { username, workspace } = Qs.parse(location.search, { ignoreQueryPrefix: true });
// const autoscroll = () => {
//     const newMessage = messages.lastElementChild;
//
//     const newMessageStyles = getComputedStyle(newMessage);
//     const newMessageMargin = parseInt(newMessageStyles.marginBottom);
//     const newMessageHeight = newMessage.offsetHeight + newMessageMargin;
//
//
//     const visibleHeight = messages.offsetHeight;
//
//
//     const containerHeight = messages.scrollHeight;
//
//
//     const scrollOffset = messages.scrollTop + visibleHeight;
//
//     if (containerHeight - newMessageHeight <= scrollOffset) {
//         messages.scrollTop = messages.scrollHeight
//     }
// };

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    messages.insertAdjacentHTML('beforeend', html);
    // autoscroll()
});

socket.on('workspaceData', ({ workspace, users }) => {
    document.querySelector('#sidebar').innerHTML = Mustache.render(sidebarTemplate, {
        workspace,
        users
    })
});

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    messageFormButton.setAttribute('disabled', 'disabled');

    const message = e.target.elements.message.value;

    socket.emit('sendMessage', message, (error) => {
        messageFormButton.removeAttribute('disabled');
        messageFormInput.value = '';
        messageFormInput.focus();

        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
});


socket.emit('join', { username, workspace }, (error) => {
    if (error) {
        alert(error);
        location.href = '/'
    }
});