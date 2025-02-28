const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

// Serve static files from the root directory
app.use(express.static('.'));

app.listen(port, () => {
    console.log(`Web server started on port ${port}`);
});