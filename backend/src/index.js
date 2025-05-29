const express = require('express');
const healthRoute = require('./routes/health.route');
const userRoute = require('./routes/user.route');
const productRoute = require('./routes/product.route');
const cors = require('cors');

app.use(cors());

const app = express();

app.use(express.json());

app.use('/health', healthRoute);
app.use('/users', userRoute);
app.use('/products', productRoute);


const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})

