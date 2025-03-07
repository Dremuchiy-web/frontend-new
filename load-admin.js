const API_URL = 'http://localhost:3000';

// Загрузка списка товаров
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        const productList = document.getElementById('productList');
        productList.innerHTML = products.map(product => `
            <div class="product-card">
                <h3>${product.name}</h3>
                <p>Цена: ${product.price} ₽</p>
                <p>${product.description}</p>
                <p>Категории: ${product.categoryIds.join(', ')}</p>
                <button onclick="editProduct(${product.id})">Редактировать</button>
                <button class="delete-btn" onclick="deleteProduct(${product.id})">Удалить</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Ошибка при загрузке товаров:', error);
        alert('Ошибка при загрузке товаров');
    }
}

// Загрузка списка категорий
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`);
        const categories = await response.json();
        const categoryList = document.getElementById('categoryList');
        categoryList.innerHTML = categories.map(category => `
            <div class="product-card">
            <h3>ID: ${category.id}</h3>    
            <h3>Имя категории: ${category.name}</h3>
            </div>
        `).join('');
    } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
        alert('Ошибка при загрузке категорий');
    }
}



// Добавление нового товара
document.getElementById('addProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const product = {
        name: document.getElementById('name').value,
        price: Number(document.getElementById('price').value),
        description: document.getElementById('description').value,
        categoryIds: document.getElementById('categoryIds').value
            .split(',')
            .map(id => parseInt(id.trim()))
            .filter(id => !isNaN(id))
    };

    try {
        const response = await fetch(`${API_URL}/add_product`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(product)
        });

        if (response.ok) {
            alert('Товар успешно добавлен');
            e.target.reset();
            loadProducts();
        } else {
            alert('Ошибка при добавлении товара');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при добавлении товара');
    }
});

// Удаление товара
async function deleteProduct(id) {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;

    try {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Товар успешно удален');
            loadProducts();
        } else {
            alert('Ошибка при удалении товара');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при удалении товара');
    }
}

// Редактирование товара
async function editProduct(id) {
    const newName = prompt('Введите новое название товара:');
    if (!newName) return;

    const newPrice = prompt('Введите новую цену:');
    if (!newPrice) return;

    const newDescription = prompt('Введите новое описание:');
    if (!newDescription) return;

    const newCategoryIds = prompt('Введите новые ID категорий через запятую:');
    if (!newCategoryIds) return;

    const product = {
        name: newName,
        price: Number(newPrice),
        description: newDescription,
        categoryIds: newCategoryIds.split(',').map(id => parseInt(id.trim()))
    };

    try {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(product)
        });

        if (response.ok) {
            alert('Товар успешно обновлен');
            loadProducts();
        } else {
            alert('Ошибка при обновлении товара');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при обновлении товара');
    }
}

// Загрузка товаров при открытии страницы
loadProducts();