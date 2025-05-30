document.addEventListener('DOMContentLoaded', function () {
    // Get all necessary data from localStorage
    const checkoutInfo = JSON.parse(localStorage.getItem('checkoutInfo')) || {};
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const accessToken = localStorage.getItem('accessToken');
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    // Debug logs
    console.log('Initial data:', {
        accessToken: accessToken ? 'Present' : 'Missing',
        isLoggedIn,
        checkoutInfo,
        cartItems: cart.length
    });

    // Check login status
    if (!accessToken || !isLoggedIn) {
        console.log('Login check failed:', { accessToken, isLoggedIn });
        showNotification('Please login to continue', 'danger');
        setTimeout(() => {
            window.location.href = '../loginAndRegist/loginAndRegist.html';
        }, 1500);
        return;
    }

    // Get user info from token
    try {
        // Decode token and get user info
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        console.log('Token payload:', payload);

        if (!payload.id) {
            throw new Error('User ID not found in token');
        }

        const userId = payload.id;
        console.log('Extracted userId:', userId);

        // Check required info
        if (!checkoutInfo.fullName || cart.length === 0) {
            window.location.href = '../cartPage/cartPage.html';
            return;
        }

        // Create order via API
        async function createOrder(orderData) {
            try {
                console.log('Creating order with data:', orderData);
                const response = await fetch('http://localhost:8080/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify(orderData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('API Error:', errorData);

                    if (response.status === 401) {
                        localStorage.removeItem('isLoggedIn');
                        localStorage.removeItem('accessToken');
                        throw new Error('Session expired. Please login again.');
                    }
                    throw new Error(errorData.message || 'Failed to create order');
                }

                return await response.json();
            } catch (error) {
                console.error('Order creation error:', error);
                throw error;
            }
        }

        // Display order items
        function renderOrderList() {
            const orderList = document.querySelector('.order-list');
            const orderCount = document.querySelector('.order-summary-count');
            if (!orderList) return;

            orderList.innerHTML = '';
            if (orderCount) orderCount.textContent = `(${cart.length})`;

            cart.forEach(item => {
                const itemHTML = `
                    <div class="order-item mb-2 d-flex align-items-start gap-3">
                        <img class="order-item-img" src="${item.image}" alt="${item.name}">
                        <div class="order-item-info flex-grow-1">
                            <div class="order-item-title">${item.name}</div>
                            <div class="order-item-desc text-muted small">${item.color || ''}${item.color && item.size ? ' / ' : ''}${item.size || ''}</div>
                            <div class="order-item-qty text-muted small">Quantity: ${item.quantity}</div>
                        </div>
                        <div class="order-item-price fw-semibold">$${parseFloat(item.price.replace(/[^0-9.]/g, '')).toFixed(2)}</div>
                    </div>
                `;
                orderList.insertAdjacentHTML('beforeend', itemHTML);
            });
        }

        // Calculate and display total
        function updateOrderTotal() {
            let subtotal = 0;
            cart.forEach(item => {
                const price = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
                subtotal += price * (item.quantity || 1);
            });

            const shipping = 10;
            const total = subtotal + shipping;

            document.querySelector('.order-summary-subtotal').textContent = `$${subtotal.toFixed(2)}`;
            document.querySelector('.order-summary-shipping').textContent = `$${shipping.toFixed(2)}`;
            document.querySelector('.order-summary-total').textContent = `$${total.toFixed(2)}`;

            return { subtotal, shipping, total };
        }

        // Handle payment submission
        document.getElementById('paymentForm').addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Processing...';

            const selectedPayment = document.querySelector('input[name="paymethod"]:checked');
            if (!selectedPayment) {
                showNotification('Please select a payment method!', 'danger');
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Pay Now <span class="ms-2" style="font-size:1.3em;">&#8594;</span>';
                return;
            }

            try {
                const { total } = updateOrderTotal();

                // Prepare order data
                const orderData = {
                    user_id: userId, // Using userId from token
                    total_amount: total,
                    shipping_address: `${checkoutInfo.address}, ${checkoutInfo.city}, ${checkoutInfo.state}, ${checkoutInfo.country}`,
                    receiver_name: checkoutInfo.fullName,
                    receiver_phone: checkoutInfo.phone,
                    payment_method: selectedPayment.value,
                    status: 'pending',
                    items: cart.map(item => ({
                        product_id: item.product_id || item.id,
                        quantity: parseInt(item.quantity),
                        price: parseFloat(item.price.replace(/[^0-9.]/g, '')),
                        color: item.color || null,
                        size: item.size || null
                    }))
                };

                // Validate order data
                if (!orderData.user_id || !orderData.shipping_address || !orderData.receiver_name || !orderData.receiver_phone) {
                    throw new Error('Missing required order information');
                }

                console.log('Sending order data:', orderData);

                const newOrder = await createOrder(orderData);
                console.log('Order created:', newOrder);

                // Clear cart and checkout info
                localStorage.removeItem('cart');
                localStorage.removeItem('checkoutInfo');

                // Save order ID
                localStorage.setItem('currentOrderId', newOrder.order_id);

                // Show success and redirect
                showNotification('Order placed successfully!', 'success');
                submitBtn.innerHTML = 'Processing... <span class="spinner-border spinner-border-sm ms-2"></span>';

                setTimeout(() => {
                    window.location.href = `../successPage/successPage.html?order=${newOrder.order_id}`;
                }, 1500);

            } catch (error) {
                console.error('Error creating order:', error);
                showNotification(error.message, 'danger');
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Pay Now <span class="ms-2" style="font-size:1.3em;">&#8594;</span>';
            }
        });

        function showNotification(message, type = 'info') {
            document.querySelectorAll('.notification').forEach(n => n.remove());
            const notification = document.createElement('div');
            notification.className = `notification alert alert-${type} position-fixed top-0 end-0 m-4`;
            notification.style.zIndex = 9999;
            notification.textContent = message;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
        }

        // Initialize page
        renderOrderList();
        updateOrderTotal();

    } catch (error) {
        console.error('Error processing token:', error);
        showNotification('Session expired. Please login again.', 'danger');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('accessToken');
        setTimeout(() => {
            window.location.href = '../loginAndRegist/loginAndRegist.html';
        }, 1500);
    }
});