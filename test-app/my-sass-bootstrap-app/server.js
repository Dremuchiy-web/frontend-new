const express = require('express');
const fs = require('fs');
const path = require('path');  // Import the path module
const app = express();
const port = 3000;

app.use(express.static('.'));  // Serve static files from the root directory

app.get('/products', (req, res) => {
  fs.readFile('products.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Ошибка при чтении данных о товарах');
    }
    const products = JSON.parse(data).products;
    res.json(products);
  });
});

app.listen(port, () => {
  console.log(`Веб-сервер запущен на порту ${port}`);
});