const express = require('express');
const healthRoute = require('./routes/health.route');
const userRoute = require('./routes/user.route');
const productRoute = require('./routes/product.route');
const cartDetailRoute = require('./routes/cartDetail.route');
const orderRoute = require('./routes/order.route');
const orderDetailRoute = require('./routes/orderDetail.route');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());

app.use(express.json());
app.use('/health', healthRoute);
app.use('/users', userRoute);
app.use('/products', productRoute);
app.use('/cart-details', cartDetailRoute);
app.use('/orders', orderRoute);
app.use('/order-details', orderDetailRoute);
const PORT = process.env.PORT || 8080;

if(process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;

