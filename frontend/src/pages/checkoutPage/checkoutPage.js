document.addEventListener('DOMContentLoaded', function () {
    // Lấy thông tin giỏ hàng
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Hiển thị tổng quan đơn hàng
    function displayOrderSummary() {
        const orderList = document.querySelector('.order-list');
        const orderCount = document.querySelector('.order-summary-count');
        if (!orderList) return;

        // Xóa nội dung mẫu
        orderList.innerHTML = '';

        // Kiểm tra giỏ hàng trống
        if (cart.length === 0) {
            window.location.href = '../cartPage/cartPage.html';
            return;
        }

        // Cập nhật số lượng sản phẩm
        if (orderCount) orderCount.textContent = `(${cart.length})`;

        // Hiển thị từng sản phẩm
        cart.forEach(item => {
            const itemHTML = `
                <div class="order-item d-flex gap-3 align-items-start mb-2">
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

        // Tính toán tổng tiền
        let subtotal = 0;
        cart.forEach(item => {
            const price = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
            subtotal += price * (item.quantity || 1);
        });

        const shipping = 10;
        const total = subtotal + shipping;

        // Cập nhật hiển thị tổng tiền
        document.querySelector('.order-summary-subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.querySelector('.order-summary-shipping').textContent = `$${shipping.toFixed(2)}`;
        document.querySelector('.order-summary-total').textContent = `$${total.toFixed(2)}`;
    }

    // Validate form và chuyển hướng
    const form = document.querySelector('.checkout-form');
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Bootstrap validation
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        // Kiểm tra giỏ hàng
        if (cart.length === 0) {
            showNotification('Cart is empty. Please add items to your cart before proceeding.', 'danger');
            return;
        }

        // Thu thập thông tin form
        const checkoutInfo = {
            fullName: `${form.querySelector('[name="firstName"]').value} ${form.querySelector('[name="lastName"]').value}`,
            email: form.querySelector('[name="email"]').value,
            phone: form.querySelector('[name="phone"]').value,
            address: form.querySelector('[name="address"]').value,
            city: form.querySelector('[name="city"]').value,
            state: form.querySelector('[name="state"]').value,
            country: form.querySelector('[name="country"]').value,
            postalCode: form.querySelector('[name="postalCode"]').value
        };

        // Lưu thông tin vào localStorage
        localStorage.setItem('checkoutInfo', JSON.stringify(checkoutInfo));

        // Chuyển đến trang payment
        window.location.href = '../paymentPage/paymentPage.html';
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
    displayOrderSummary();
});