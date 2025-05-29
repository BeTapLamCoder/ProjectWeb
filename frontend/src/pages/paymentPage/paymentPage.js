document.addEventListener('DOMContentLoaded', function () {
    // Lấy thông tin checkout và giỏ hàng
    const checkoutInfo = JSON.parse(localStorage.getItem('checkoutInfo')) || {};
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Kiểm tra và chuyển hướng nếu không có thông tin
    if (!checkoutInfo.fullName || cart.length === 0) {
        window.location.href = '../cartPage/cartPage.html';
        return;
    }

    // Hiển thị danh sách sản phẩm trong đơn hàng
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
                        <div class="order-item-qty text-muted small">Qty: ${item.quantity}</div>
                    </div>
                    <div class="order-item-price fw-semibold">$${parseFloat(item.price.replace(/[^0-9.]/g, '')).toFixed(2)}</div>
                </div>
            `;
            orderList.insertAdjacentHTML('beforeend', itemHTML);
        });
    }

    // Tính và hiển thị tổng tiền
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
    }

    // Submit payment và hoàn tất đơn hàng
    document.getElementById('paymentForm').addEventListener('submit', function (e) {
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
            // Tạo đơn hàng
            const order = {
                orderNumber: 'ORD' + Date.now(),
                items: cart,
                shipping: checkoutInfo,
                payment: selectedPayment.value,
                status: 'pending',
                date: new Date().toISOString(),
                total: parseFloat(document.querySelector('.order-summary-total').textContent.replace(/[^0-9.]/g, '')),
                tracking: [
                    { title: 'Order Placed', date: new Date().toLocaleString(), completed: true },
                    { title: 'Order Confirmed', date: '', completed: false },
                    { title: 'Preparing Order', date: '', completed: false },
                    { title: 'Shipped', date: '', completed: false },
                    { title: 'Delivered Successfully', date: '', completed: false }
                ]
            };
            // Lưu đơn hàng vào localStorage
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            orders.push(order);
            localStorage.setItem('orders', JSON.stringify(orders));

            // Xóa giỏ hàng và thông tin checkout
            localStorage.removeItem('cart');
            localStorage.removeItem('checkoutInfo');

            // Hiển thị loading animation
            submitBtn.innerHTML = 'Processing... <span class="spinner-border spinner-border-sm ms-2"></span>';

            // Delay chuyển trang để người dùng thấy trạng thái xử lý
            setTimeout(() => {
                window.location.href = `../successPage/successPage.html?order=${order.orderNumber}`;
            }, 1500);

        } catch (error) {
            console.error('Error processing order:', error);
            showNotification('An error occurred. Please try again!', 'danger');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Pay Now <span class="ms-2" style="font-size:1.3em;">&#8594;</span>';
        }
    });

    // Thông báo Bootstrap
    function showNotification(message, type = 'info') {
        document.querySelectorAll('.notification').forEach(n => n.remove());
        const notification = document.createElement('div');
        notification.className = `notification alert alert-${type} position-fixed top-0 end-0 m-4`;
        notification.style.zIndex = 9999;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // Khởi tạo trang
    renderOrderList();
    updateOrderTotal();
});