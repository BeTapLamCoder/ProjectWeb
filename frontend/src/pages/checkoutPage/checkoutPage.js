document.addEventListener('DOMContentLoaded', function () {
    // Lấy thông tin giỏ hàng
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Hiển thị tổng quan đơn hàng
    function displayOrderSummary() {
        const orderList = document.querySelector('.order-list');
        const orderCount = document.querySelector('.order-summary-header span');

        if (!orderList) return;

        // Xóa nội dung mẫu
        orderList.innerHTML = '';

        // Kiểm tra giỏ hàng trống
        if (cart.length === 0) {
            window.location.href = '../cartPage/cartPage.html';
            return;
        }

        // Cập nhật số lượng sản phẩm
        orderCount.textContent = `(${cart.length})`;

        // Hiển thị từng sản phẩm
        cart.forEach(item => {
            const itemHTML = `
                <div class="order-item">
                    <img class="order-item-img" src="${item.image}" alt="${item.name}">
                    <div class="order-item-info">
                        <div class="order-item-title">${item.type || ''}</div>
                        <div class="order-item-name">${item.name}</div>
                        <div class="order-item-desc">${item.color || 'N/A'} / ${item.size || 'N/A'}</div>
                        <div class="order-item-qty">(${item.quantity})</div>
                    </div>
                    <div class="order-item-price">${item.price}</div>
                </div>
            `;
            orderList.insertAdjacentHTML('beforeend', itemHTML);
        });

        // Tính toán tổng tiền
        let subtotal = 0;
        cart.forEach(item => {
            const price = parseFloat(item.price.replace(/[^0-9.-]+/g, ''));
            subtotal += price * item.quantity;
        });

        const shipping = 10;
        const total = subtotal + shipping;

        // Cập nhật hiển thị tổng tiền
        document.querySelector('.order-summary-totals .order-summary-row:first-child span:last-child')
            .textContent = `$${subtotal.toFixed(2)}`;
        document.querySelector('.order-summary-totals .order-summary-row:last-child span:last-child')
            .textContent = `$${total.toFixed(2)}`;
    }

    // Validate form và chuyển hướng
    const form = document.querySelector('.checkout-form');
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Kiểm tra giỏ hàng
        if (cart.length === 0) {
            alert('Cart is empty. Please add items to your cart before proceeding.');
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

    // Xử lý nút back
    document.querySelector('.back-arrow').addEventListener('click', function () {
        window.location.href = '../cartPage/cartPage.html';
    });

    // Khởi tạo trang
    displayOrderSummary();
});