
document.addEventListener('DOMContentLoaded', function () {
    // Lấy thông tin checkout và giỏ hàng
    const checkoutInfo = JSON.parse(localStorage.getItem('checkoutInfo')) || {};
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Kiểm tra và chuyển hướng nếu không có thông tin
    if (!checkoutInfo.fullName || cart.length === 0) {
        window.location.href = '../cartPage/cartPage.html';
        return;
    }

    // Hiển thị thông tin đơn hàng
    function displayOrderInfo() {
        // Hiển thị shipping info
        const infoContainer = document.querySelector('.order-info');
        if (infoContainer) {
            infoContainer.innerHTML = `
                <div class="shipping-info">
                    <h3>Shipping Information</h3>
                    <p>${checkoutInfo.fullName}</p>
                    <p>${checkoutInfo.email}</p>
                    <p>${checkoutInfo.phone}</p>
                    <p>${checkoutInfo.address}, ${checkoutInfo.city}</p>
                    <p>${checkoutInfo.state}, ${checkoutInfo.country}</p>
                </div>
            `;
        }

        // Hiển thị danh sách sản phẩm
        const orderList = document.querySelector('.order-list');
        const orderCount = document.querySelector('.order-summary-header span');

        if (orderList) {
            orderList.innerHTML = '';
            orderCount.textContent = `(${cart.length})`;

            cart.forEach(item => {
                const itemHTML = `
                    <div class="order-item">
                        <img class="order-item-img" src="${item.image}" alt="${item.name}">
                        <div class="order-item-info">
                            <div class="order-item-title">${item.name}</div>
                            <div class="order-item-desc">${item.color}/${item.size}</div>
                            <div class="order-item-qty">(${item.quantity})</div>
                        </div>
                        <div class="order-item-price">${item.price}</div>
                    </div>
                `;
                orderList.insertAdjacentHTML('beforeend', itemHTML);
            });
        }

        // Cập nhật tổng tiền
        updateOrderTotal();
    }

    // Tính và hiển thị tổng tiền
    function updateOrderTotal() {
        let subtotal = 0;
        cart.forEach(item => {
            const price = parseFloat(item.price.replace(/[^0-9.-]+/g, ''));
            subtotal += price * item.quantity;
        });

        const shipping = 10;
        const total = subtotal + shipping;

        document.querySelector('.order-summary-totals .order-summary-row:nth-child(1) span:last-child')
            .textContent = `$${subtotal.toFixed(2)}`;
        document.querySelector('.order-summary-totals .order-summary-row:nth-child(2) span:last-child')
            .textContent = `$${shipping.toFixed(2)}`;
        document.querySelector('.order-summary-totals .order-summary-row:nth-child(3) span:last-child')
            .textContent = `$${total.toFixed(2)}`;
    }

    // Submit payment và hoàn tất đơn hàng
    document.getElementById('paymentForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Processing...';

        const selectedPayment = document.querySelector('.payment-method input[type="radio"]:checked');
        if (!selectedPayment) {
            alert('Vui lòng chọn phương thức thanh toán!');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Pay Now <span style="font-size:1.3em;">→</span>';
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
                total: parseFloat(document.querySelector('.order-summary-row.total span:last-child')
                    .textContent.replace(/[^0-9.-]+/g, '')),
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
            submitBtn.innerHTML = 'Processing... <div class="loader"></div>';

            // Delay chuyển trang để người dùng thấy trạng thái xử lý
            setTimeout(() => {
                window.location.href = `../successPage/successPage.html?order=${order.orderNumber}`;
            }, 1500);

        } catch (error) {
            console.error('Error processing order:', error);
            alert('Có lỗi xảy ra. Vui lòng thử lại!');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Pay Now <span style="font-size:1.3em;">→</span>';
        }
    });

    // Khởi tạo trang
    displayOrderInfo();
});