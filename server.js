const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = 3000;

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger документация
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Task Management API',
            version: '1.0.0',
            description: 'API для управления задачами',
        },
        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],
    },
    apis: ['openapi.yaml'], // укажите путь к файлам с аннотациями
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Функция для чтения данных из файла
async function readData() {
    const data = await fs.readFile('data.json', 'utf8');
    return JSON.parse(data);
}

// Функция для записи данных в файл
async function writeData(data) {
    await fs.writeFile('data.json', JSON.stringify(data, null, 4), 'utf8');
}

// Получить список всех товаров
app.get('/products', async (req, res) => {
    try {
        const data = await readData();
        res.json(data.products);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при чтении данных' });
    }
});

// Получить список категорий
app.get('/categories', async (req, res) => {
    try {
        const data = await readData();
        res.json(data.categories);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при чтении данных' });
    }
});

// Создать новый товар
app.post('/add_product', async (req, res) => {
    try {
        const data = await readData();
        const { name, price, description, categoryIds } = req.body;
        const newProduct = {
            id: data.products.length > 0 ? Math.max(...data.products.map(p => p.id)) + 1 : 1,
            name,
            price,
            description,
            categoryIds: categoryIds || []
        };
        data.products.push(newProduct);
        await writeData(data);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при создании товара' });
    }
});

// Создать новую категорию
app.post('/categories', (req, res) => {
    const { name } = req.body;
    const newCategory = {
        id: categories.length + 1,
        name
    };
    categories.push(newCategory);
    res.status(201).json(newCategory);
});

// Получить задачу по ID
app.get('/categories/:id', (req, res) => {
    const categoryId = parseInt(req.params.id);
    const category = categories.find(c => c.id === categoryId);
    if (category) {
        res.json(category);
    } else {
        res.status(404).json({ message: 'Category not found' });
    }
});

// Удалить категорию по ID
app.delete('/categories/:id', (req, res) => {
    const categoryId = parseInt(req.params.id);
    categories = categories.filter(c => c.id !== categoryId);
    res.status(204).send();
});

// Получить задачу по ID
app.get('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

// Обновить товар по ID
app.put('/products/:id', async (req, res) => {
    try {
        const data = await readData();
        const productId = parseInt(req.params.id);
        const productIndex = data.products.findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
            return res.status(404).json({ message: 'Товар не найден' });
        }

        const { name, price, description, categoryIds } = req.body;
        data.products[productIndex] = {
            ...data.products[productIndex],
            name: name !== undefined ? name : data.products[productIndex].name,
            price: price !== undefined ? price : data.products[productIndex].price,
            description: description !== undefined ? description : data.products[productIndex].description,
            categoryIds: categoryIds !== undefined ? categoryIds : data.products[productIndex].categoryIds
        };

        await writeData(data);
        res.json(data.products[productIndex]);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при обновлении товара' });
    }
});

// Удалить товар по ID
app.delete('/products/:id', async (req, res) => {
    try {
        const data = await readData();
        const productId = parseInt(req.params.id);
        data.products = data.products.filter(p => p.id !== productId);
        await writeData(data);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при удалении товара' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-shop.html'));
});

// Запуск сервера
app.listen(PORT, () => {
    console.log("Server is running on http://localhost:", PORT);
});