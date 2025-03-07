let socket;

function initAdminChat() {
  const chatContainer = document.createElement('div');
  chatContainer.className = 'admin-chat-container';
  chatContainer.innerHTML = `
    <div class="chat-header">Чат с пользователем</div>
    <div id="chat-status" class="chat-status">Ожидание подключения...</div>
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
    socket.send(JSON.stringify({ type: 'admin' }));
    
    document.getElementById('send-button').addEventListener('click', sendMessage);
    document.getElementById('message-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  };
  
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Получено сообщение:', data);
    
    if (data.type === 'system') {
      updateStatus(data.message);
      addMessage(data.message, 'system');
    } else if (data.type === 'message') {
      addMessage(data.text, 'user');
    }
  };
  
  socket.onclose = () => {
    console.log('Соединение закрыто');
    updateStatus('Соединение с сервером потеряно');
    addMessage('Соединение с сервером потеряно', 'system');
    document.getElementById('send-button').disabled = true;
    document.getElementById('message-input').disabled = true;
  };
}

function updateStatus(status) {
  const statusElement = document.getElementById('chat-status');
  statusElement.textContent = status;
}

function sendMessage() {
  const input = document.getElementById('message-input');
  const message = input.value.trim();
  
  if (message && socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'message',
      text: message
    }));
    
    addMessage(message, 'admin');
    
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
    messageElement.textContent = 'Вы: ' + text;
  } else {
    messageElement.className = 'message user-message';
    messageElement.textContent = 'Пользователь: ' + text;
  }
  
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

document.addEventListener('DOMContentLoaded', initAdminChat);