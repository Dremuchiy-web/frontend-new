const API_URL = 'http://localhost:8080';
let allProducts = [];
let allCategories = [];
let selectedCategoryIds = [];

async function executeGraphQL(query) {
    try {
        const response = await fetch(`${API_URL}/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ошибка: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.errors) {
            throw new Error(result.errors[0].message);
        }
        
        return result.data;
    } catch (error) {
        console.error('Ошибка при выполнении GraphQL запроса:', error);
        throw error;
    }
}


async function loadProducts() {
    try {
        // Запрашиваем все необходимые поля для работы с продуктами
        const query = `{
            products {
                name
                price
                description
                categoryIds
            }
        }`;
        
        const data = await executeGraphQL(query);
        allProducts = data.products;
        
        // Отображаем продукты с учетом выбранных категорий
        filterProducts();
    } catch (error) {
        const productsContainer = document.getElementById('products');
        if (productsContainer) {
            productsContainer.innerHTML = `
                <p class="error">
                    Ошибка при загрузке продуктов: ${error.message}
                    <br>
                    Пожалуйста, проверьте работоспособность сервера
                </p>`;
        }
    }
}


async function loadCategories() {
    try {
        const query = `{
            categories {
                id
                name
            }
        }`;
        
        const data = await executeGraphQL(query);
        allCategories = data.categories;
        
        const categoriesContainer = document.getElementById('categories');
        if (!categoriesContainer) {
            throw new Error('Контейнер категорий не найден');
        }
        
        categoriesContainer.innerHTML = allCategories.map(category => `
            <label>
                <input type="checkbox" value="${category.id}" class="category-checkbox"> ${category.name}
            </label>
        `).join('');

        // Добавляем обработчики событий для чекбоксов
        const checkboxes = document.querySelectorAll('.category-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                updateSelectedCategories();
                filterProducts();
            });
        });
    } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
        const categoriesContainer = document.getElementById('categories');
        if (categoriesContainer) {
            categoriesContainer.innerHTML = `
                <p class="error">
                    Ошибка при загрузке категорий: ${error.message}
                    <br>
                    Пожалуйста, проверьте работоспособность сервера
                </p>`;
        }
    }
}


 // Обновление списка выбранных категорий
 function updateSelectedCategories() {
    selectedCategoryIds = Array.from(document.querySelectorAll('.category-checkbox:checked'))
        .map(checkbox => checkbox.value);
    console.log('Выбранные категории:', selectedCategoryIds);
}

// Фильтрация продуктов на стороне клиента
function filterProducts() {
    const filteredProducts = selectedCategoryIds.length === 0 
        ? allProducts 
        : allProducts.filter(product => 
            selectedCategoryIds.every(selectedCategoryId =>
                product.categoryIds.some(productCategoryId => 
                    productCategoryId.toString() === selectedCategoryId
                )
            )
        );
    
    console.log('Отфильтрованные продукты:', filteredProducts);
    displayProducts(filteredProducts);
}

// Отображение продуктов
function displayProducts(products) {
    const productsContainer = document.getElementById('products');
    if (!productsContainer) return;
    
    productsContainer.innerHTML = products.map(product => `
        <div class="product-card">
            <h3>${product.name}</h3>
            <p>Цена: ${product.price} ₽</p>
            <p>${product.description}</p>
        </div>
    `).join('');
}

// Загрузка данных при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadProducts();
});