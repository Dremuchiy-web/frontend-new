const express = require('express');
const path = require('path');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const fs = require('fs').promises;
const app = express();
const PORT = 8080;


app.use(express.static(path.join(__dirname)));

var schema = buildSchema(`
    type Product {
        id: Int!
        name: String!
        price: Int!
        description: String!
        categoryIds: [Int]!
    }
    
    type Category {
        id: Int!
        name: String!
        description: String!
    }
    
    type Query {
        products: [Product]
        categories: [Category]
        productNames: [String]
        productCards: [Product]
        productPrices: [Product]
        productDescriptions: [Product]
    }
    
  `);


  const root = {
    products: async () => {
      const data = await readData();
      return data.products;
    },
    categories: async () => {
        const data = await readData();
        return data.categories;
      },
    productNames: async () => {
      const data = await readData();
      return data.products.map(product => product.name);
    },
    productCards: async () => {
      const data = await readData();
      return data.products.map(product => ({
        name: product.name,
        price: product.price,
        description: product.description
      }));
    },
    productPrices: async () => {
      const data = await readData();
      return data.products.map(product => ({
        name: product.name,
        price: product.price
      }));
    },
    productDescriptions: async () => {
      const data = await readData();
      return data.products.map(product => ({
        name: product.name,
        description: product.description
      }));
    }
  };

  app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true 
  }));

// Функция для чтения данных из файла
async function readData() {
    const data = await fs.readFile('data.json', 'utf8');
    return JSON.parse(data);
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'shop.html'));
});




app.listen(PORT, () => {
    console.log(`Shop server is running on http://localhost:${PORT}`);
});
