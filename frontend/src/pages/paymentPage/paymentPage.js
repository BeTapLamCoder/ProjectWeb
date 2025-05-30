const serverBaseURL =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:8080"
        : "https://server-project-web.vercel.app";

document.addEventListener('DOMContentLoaded', async function () {
    // Get all necessary data from localStorage
    const checkoutInfo = JSON.parse(localStorage.getItem('checkoutInfo')) || {};
    const accessToken = localStorage.getItem('accessToken');
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    // Lấy cartId từ token
    let cartId = null;
    if (accessToken) {
        try {
            const payload = JSON.parse(atob(accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
            cartId = payload.cart_id || payload.cartId;
        } catch (e) {
            cartId = localStorage.getItem('cartId');
        }
    }

    // Debug logs
    console.log('Initial data:', {
        accessToken: accessToken ? 'Present' : 'Missing',
        isLoggedIn,
        checkoutInfo,
        cartId
    });

    // Check login status
    if (!accessToken || !isLoggedIn) {
        showNotification('Please login to continue', 'danger');
        const pathParts = window.location.pathname.split('/');
        const srcIndex = pathParts.indexOf('src');
        const baseURL = srcIndex !== -1 ? pathParts.slice(0, srcIndex + 1).join('/') + '/' : '/';
        setTimeout(() => {
            window.location.href = baseURL + 'pages/loginAndRegist/loginAndRegist.html';
        }, 1500);
        return;
    }

    // Lấy sản phẩm trong giỏ hàng từ backend
    let cart = [];
    if (cartId) {
        try {
            const response = await fetch(`${serverBaseURL}/cart-details/${cartId}`, {
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                }
            });
            if (response.ok) {
                cart = await response.json();
            }
        } catch (err) {
            console.error("Error fetching cart:", err);
        }
    }

    // Get user info from token
    try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        if (!payload.id) throw new Error('User ID not found in token');
        const userId = payload.id;

        const pathParts = window.location.pathname.split('/');
        const srcIndex = pathParts.indexOf('src');
        const baseURL = srcIndex !== -1 ? pathParts.slice(0, srcIndex + 1).join('/') + '/' : '/';
        // Check required info
        if (!checkoutInfo.fullName || cart.length === 0) {
            window.location.href = baseURL + 'pages/cartPage/cartPage.html';
            return;
        }

        // Create order via API
        async function createOrder(orderData) {
            try {
                const response = await fetch(`${serverBaseURL}/orders`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify(orderData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    if (response.status === 401) {
                        localStorage.removeItem('isLoggedIn');
                        localStorage.removeItem('accessToken');
                        throw new Error('Session expired. Please login again.');
                    }
                    throw new Error(errorData.message || 'Failed to create order');
                }

                return await response.json();
            } catch (error) {
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
                const image = item.image || item.image_url || '';
                const name = item.name || item.product_name || '';
                const priceValue = parseFloat((item.price || '').toString().replace(/[^0-9.]/g, '')) || 0;
                const itemHTML = `
                    <div class="order-item mb-2 d-flex align-items-start gap-3">
                        <img class="order-item-img" src="${image}" alt="${name}">
                        <div class="order-item-info flex-grow-1">
                            <div class="order-item-title">${name}</div>
                            <div class="order-item-desc text-muted small">${item.color || ''}${item.color && item.size ? ' / ' : ''}${item.size || ''}</div>
                            <div class="order-item-qty text-muted small">Quantity: ${item.quantity}</div>
                        </div>
                        <div class="order-item-price fw-semibold">$${priceValue.toFixed(2)}</div>
                    </div>
                `;
                orderList.insertAdjacentHTML('beforeend', itemHTML);
            });
        }

        // Calculate and display total
        function updateOrderTotal() {
            let subtotal = 0;
            cart.forEach(item => {
                const price = parseFloat((item.price || '').toString().replace(/[^0-9.]/g, '')) || 0;
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
                    user_id: userId,
                    total_amount: total,
                    shipping_address: `${checkoutInfo.address}, ${checkoutInfo.city}, ${checkoutInfo.state}, ${checkoutInfo.country}`,
                    receiver_name: checkoutInfo.fullName,
                    receiver_phone: checkoutInfo.phone,
                    payment_method: selectedPayment.value,
                    status: 'pending',
                    items: cart.map(item => ({
                        product_id: item.product_id || item.id,
                        quantity: parseInt(item.quantity),
                        price: parseFloat((item.price || '').toString().replace(/[^0-9.]/g, '')),
                        color: item.color || null,
                        size: item.size || null
                    }))
                };

                // Validate order data
                if (!orderData.user_id || !orderData.shipping_address || !orderData.receiver_name || !orderData.receiver_phone) {
                    throw new Error('Missing required order information');
                }

                const newOrder = await createOrder(orderData);

                // Clear cart and checkout info
                localStorage.removeItem('cart');
                localStorage.removeItem('checkoutInfo');
                localStorage.setItem('currentOrderId', newOrder.order_id);

                showNotification('Order placed successfully!', 'success');
                submitBtn.innerHTML = 'Processing... <span class="spinner-border spinner-border-sm ms-2"></span>';

                const pathParts = window.location.pathname.split('/');
                const srcIndex = pathParts.indexOf('src');
                const baseURL = srcIndex !== -1 ? pathParts.slice(0, srcIndex + 1).join('/') + '/' : '/';

                setTimeout(() => {
                    window.location.href = baseURL + `pages/successPage/successPage.html?order=${newOrder.order_id}`;
                }, 1500);

            } catch (error) {
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
        showNotification('Session expired. Please login again.', 'danger');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('accessToken');
        const pathParts = window.location.pathname.split('/');
        const srcIndex = pathParts.indexOf('src');
        const baseURL = srcIndex !== -1 ? pathParts.slice(0, srcIndex + 1).join('/') + '/' : '/';
        setTimeout(() => {
            window.location.href = baseURL + 'pages/loginAndRegist/loginAndRegist.html';
        }, 1500);
    }
});