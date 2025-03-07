let socket;

function initChat() {
  const chatContainer = document.createElement('div');
  chatContainer.className = 'chat-container';
  chatContainer.innerHTML = `
    <div class="chat-header">Чат с поддержкой</div>
    <div id="chat-messages" class="chat-messages"></div>
    <div class="chat-input">
      <input type="text" id="message-input" placeholder="Введите сообщение...">
      <button id="send-button">Отправить</button>
    </div>
  `;
  document.body.appendChild(chatContainer);
  
  const style = document.createElement('style');
  document.head.appendChild(style);
  
  socket = new WebSocket('ws://localhost:7070');
  
  socket.onopen = () => {
    console.log('Подключено к серверу');
    socket.send(JSON.stringify({ type: 'user' }));
    
    document.getElementById('send-button').addEventListener('click', sendMessage);
    document.getElementById('message-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  };
  
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Получено сообщение:', data);
    
    if (data.type === 'system') {
      addMessage(data.message, 'system');
    } else if (data.type === 'message') {
      addMessage(data.text, 'admin');
    }
  };
  
  socket.onclose = () => {
    console.log('Соединение закрыто');
    addMessage('Соединение с сервером потеряно', 'system');
  };
}

function sendMessage() {
  const input = document.getElementById('message-input');
  const message = input.value.trim();
  
  if (message && socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'message',
      text: message
    }));
    
    addMessage(message, 'user');
    
    input.value = '';
  }
}

function addMessage(text, type) {
  const messagesContainer = document.getElementById('chat-messages');
  const messageElement = document.createElement('div');
  
  if (type === 'system') {
    messageElement.className = 'message system-message';
    messageElement.textContent = text;
  } else if (type === 'admin') {
    messageElement.className = 'message admin-message';
    messageElement.textContent = 'Поддержка: ' + text;
  } else {
    messageElement.className = 'message user-message';
    messageElement.textContent = 'Вы: ' + text;
  }
  
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

document.addEventListener('DOMContentLoaded', initChat);
