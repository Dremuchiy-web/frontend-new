const WebSocket = require('ws');
const http = require('http');
const server = http.createServer();
const wss = new WebSocket.Server({ server });

// соединения
let admin = null;
let user = null;

wss.on('connection', (ws) => {
  console.log('Новое соединение');
  
  // Проверка на статус юзера
  ws.once('message', (message) => {
    try {
        const data = JSON.parse(message);
        
        if (data.type === 'admin') {
          admin = ws;
          console.log('Администратор подключился');
          
          admin.send(JSON.stringify({
            type: 'system',
            message: 'Вы подключены как администратор'
          }));
          
          if (user) {
            admin.send(JSON.stringify({
              type: 'system',
              message: 'Пользователь в сети'
            }));
          }
        } else {
          user = ws;
          console.log('Пользователь подключился');
          
          user.send(JSON.stringify({
            type: 'system',
            message: 'Вы подключены к чату поддержки'
          }));
          
          if (admin) {
            admin.send(JSON.stringify({
              type: 'system',
              message: 'Пользователь в сети'
            }));
          }
        }
        
        ws.on('message', (message) => {
          try {
            const data = JSON.parse(message);
            
            if (ws === admin && user) {
              user.send(JSON.stringify({
              type: 'message',
              from: 'admin',
              text: data.text
            }));
          
        } else if (ws === user && admin) {
            admin.send(JSON.stringify({
              type: 'message',
              from: 'user',
              text: data.text
            }));
        }
        } catch (error) {
        console.error('Ошибка при обработке сообщения:', error);
        }
        });
        } catch (error) {
        console.error('Ошибка при обработке первого сообщения:', error);
        }
        });

  ws.on('close', () => {
    if (ws === admin) {
      admin = null;
      console.log('Администратор отключился');

      if (user) {
        user.send(JSON.stringify({
          type: 'system',
          message: 'Администратор отключился'
        }));
      }
        } else if (ws === user) {
        user = null;
        console.log('Пользователь отключился');
      
      if (admin) {
        admin.send(JSON.stringify({
          type: 'system',
          message: `Пользователь отключился`
        }));
      }
    }
  });
});

const PORT = 7070;
server.listen(PORT, () => {
  console.log(`WebSocket сервер запущен на порту ${PORT}`);
}); 