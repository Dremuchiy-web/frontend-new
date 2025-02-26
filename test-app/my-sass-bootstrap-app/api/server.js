// api/server.js
const express = require('express');  // Подключаем библиотеку express
const fs = require('fs');        // Подключаем модуль для работы с файловой системой
const path = require('path');      // Подключаем модуль для работы с путями
const swaggerUi = require('swagger-ui-express'); // Подключаем middleware для Swagger UI
const jsYaml = require('js-yaml');  // Подключаем библиотеку для работы с YAML
const cors = require('cors');       // Подключаем middleware для обработки CORS

const app = express();            // Создаем экземпляр приложения express
const port = 8080;               // Указываем порт, на котором будет работать API-сервер

app.use(cors());               // Разрешаем CORS для всех запросов (не рекомендуется для production)
app.use(express.json());        // Подключаем middleware для обработки JSON в теле запроса

// Загрузка данных о товарах из JSON
let products = require('../products.json').products; // Читаем данные о товарах из products.json

// --- API endpoints ---

// GET /products: Получение всех товаров
app.get('/products', (req, res) => {
  res.json(products); // Отправляем клиенту массив товаров
});

// GET /products/:id: Получение товара по ID
app.get('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);  // Получаем ID товара из параметров запроса и преобразуем его в число
  const product = products.find(p => p.id === productId); // Ищем товар с указанным ID
  if (product) {
    res.json(product); // Если товар найден, отправляем его клиенту
  } else {
    res.status(404).send('Товар не найден'); // Если товар не найден, отправляем ошибку с кодом 404
  }
});

// POST /products: Добавление нового товара (или нескольких)
app.post('/products', (req, res) => {
  const newProducts = Array.isArray(req.body) ? req.body : [req.body]; // Проверяем, является ли тело запроса массивом. Если да, используем его, иначе создаем массив из одного элемента (тела запроса)
  const newProductsWithIds = newProducts.map(product => ({ ...product, id: products.length + 1 })); // Добавляем каждому товару уникальный ID
  products = products.concat(newProductsWithIds); // Добавляем новые товары в массив products

  // Сохранение изменений в products.json
  fs.writeFile('products.json', JSON.stringify({ products: products }, null, 2), (err) => { // Записываем обновленный массив товаров в файл products.json
    if (err) {
      console.error('Ошибка при сохранении в products.json:', err); // Если произошла ошибка при записи в файл, выводим ее в консоль
      return res.status(500).send('Ошибка при сохранении товара'); // И отправляем клиенту ошибку с кодом 500
    }
    res.status(201).json(newProductsWithIds); // Отправляем клиенту добавленные товары с кодом 201 (Created)
  });
});

// PUT /products/:id: Редактирование информации о товаре
app.put('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id); // Получаем ID товара из параметров запроса и преобразуем его в число
  const productIndex = products.findIndex(p => p.id === productId); // Ищем индекс товара с указанным ID
  if (productIndex !== -1) { // Если товар найден
    products[productIndex] = { ...products[productIndex], ...req.body }; // Обновляем информацию о товаре
    // Сохранение изменений в products.json
    fs.writeFile('products.json', JSON.stringify({ products: products }, null, 2), (err) => { // Записываем обновленный массив товаров в файл products.json
      if (err) {
        console.error('Ошибка при сохранении в products.json:', err); // Если произошла ошибка при записи в файл, выводим ее в консоль
        return res.status(500).send('Ошибка при обновлении товара'); // И отправляем клиенту ошибку с кодом 500
      }
      res.json(products[productIndex]); // Отправляем клиенту обновленную информацию о товаре
    });
  } else {
    res.status(404).send('Товар не найден'); // Если товар не найден, отправляем ошибку с кодом 404
  }
});

// DELETE /products/:id: Удаление товара
app.delete('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id); // Получаем ID товара из параметров запроса и преобразуем его в число
  products = products.filter(p => p.id !== productId); // Удаляем товар из массива products

  // Сохранение изменений в products.json
  fs.writeFile('products.json', JSON.stringify({ products: products }, null, 2), (err) => { // Записываем обновленный массив товаров в файл products.json
    if (err) {
      console.error('Ошибка при сохранении в products.json:', err); // Если произошла ошибка при записи в файл, выводим ее в консоль
      return res.status(500).send('Ошибка при удалении товара'); // И отправляем клиенту ошибку с кодом 500
    }
    res.status(204).send(); // Отправляем клиенту код 204 (No Content), что означает успешное удаление
  });
});

// --- API спецификация (Swagger UI) ---
// Загрузка YAML-файла
try {
  const apiDocs = jsYaml.load(fs.readFileSync('api/api-docs.yaml', 'utf8')); // Читаем файл api-docs.yaml
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(apiDocs)); // Подключаем Swagger UI
} catch (e) {
  console.error('Ошибка при загрузке API спецификации:', e); // Если произошла ошибка при чтении файла, выводим ее в консоль
}

// Запускаем сервер и начинаем слушать указанный порт
app.listen(port, () => {
  console.log(`API сервер запущен на порту ${port}`);
});