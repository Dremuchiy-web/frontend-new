const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 8080;

app.use(cors());
app.use(express.json()); // Middleware для обработки JSON в теле запроса

// POST /products - добавить новый товар
app.post('/products', (req, res) => {
    const newProduct = req.body;
    fs.readFile('products.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Ошибка при чтении данных о товарах');
        }
        const productsData = JSON.parse(data);
        const products = productsData.products;
        newProduct.id = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        products.push(newProduct);
        fs.writeFile('products.json', JSON.stringify(productsData, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Ошибка при записи данных о товарах');
            }
            res.status(201).json(newProduct); // 201 Created
        });
    });
});


// PUT /products/:id - редактировать товар
app.put('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const updatedProduct = req.body;

    fs.readFile('products.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Ошибка при чтении данных о товарах');
        }

        const productsData = JSON.parse(data);
        const products = productsData.products;
        const productIndex = products.findIndex(p => p.id === productId);

        if (productIndex === -1) {
            return res.status(404).send('Товар не найден');
        }

        // Обновляем данные товара
        products[productIndex] = { ...products[productIndex], ...updatedProduct }; //  Merge обновленных данных
        fs.writeFile('products.json', JSON.stringify(productsData, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Ошибка при записи данных о товарах');
            }
            res.json(products[productIndex]); // Return the updated product
        });
    });
});


// DELETE /products/:id - удалить товар
app.delete('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);

    fs.readFile('products.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Ошибка при чтении данных о товарах');
        }

        const productsData = JSON.parse(data);
        const products = productsData.products;
        const productIndex = products.findIndex(p => p.id === productId);

        if (productIndex === -1) {
            return res.status(404).send('Товар не найден');
        }

        products.splice(productIndex, 1); // Удаляем товар

        fs.writeFile('products.json', JSON.stringify(productsData, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Ошибка при записи данных о товарах');
            }
            res.status(204).send(); // 204 No Content (успешно удалено)
        });
    });
});


app.get('/products', (req, res) => { // Получить список товаров
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
    console.log(`API server started on port ${port}`);
});