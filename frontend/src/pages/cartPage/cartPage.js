document.addEventListener('DOMContentLoaded', function () {
    // Lấy giỏ hàng từ localStorage và render
    function renderCart() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartItemsContainer = document.querySelector('.cart-items');

        if (!cartItemsContainer) return;

        // Xóa nội dung hiện tại
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <p>Cart is empty</p>
                    <a href="../filterAndSearch/filterAndSearch.html" class="continue-shopping">
                        Continue Shopping
                    </a>
                </div>
            `;
            return;
        }

        // Render từng sản phẩm
        cart.forEach((item, index) => {
            const cartItemHTML = `
                <div class="cart-item" data-index="${index}">
                    <button class="cart-item-remove">&times;</button>
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.type}</div>
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-options">
                            <span class="cart-item-size">${item.size}</span>
                            <span class="cart-item-color" style="background-color: ${item.color}"></span>
                        </div>
                        <div class="cart-item-qty">
                            <button class="minus-btn">-</button>
                            <input type="text" value="${item.quantity}" readonly>
                            <button class="plus-btn">+</button>
                        </div>
                        <div class="cart-item-bottom">
                            <div class="cart-item-price">${item.price}</div>
                        </div>
                    </div>
                </div>
            `;
            cartItemsContainer.insertAdjacentHTML('beforeend', cartItemHTML);
        });

        // Thêm event listeners cho các nút mới
        setupEventListeners();
        updateSummary();
    }

    // Thiết lập các event listeners
    function setupEventListeners() {
        // Xử lý nút tăng/giảm số lượng
        document.querySelectorAll('.cart-item').forEach(function (item) {
            const minusBtn = item.querySelector('.minus-btn');
            const plusBtn = item.querySelector('.plus-btn');
            const qtyInput = item.querySelector('.cart-item-qty input');
            const index = item.dataset.index;

            minusBtn.addEventListener('click', function () {
                let value = parseInt(qtyInput.value, 10);
                if (value > 1) {
                    qtyInput.value = value - 1;
                    updateCartItem(index, value - 1);
                    updateSummary();
                }
            });

            plusBtn.addEventListener('click', function () {
                let value = parseInt(qtyInput.value, 10);
                qtyInput.value = value + 1;
                updateCartItem(index, value + 1);
                updateSummary();
            });
        });

        // Xử lý nút xóa sản phẩm
        document.querySelectorAll('.cart-item-remove').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const cartItem = btn.closest('.cart-item');
                const index = cartItem.dataset.index;
                removeCartItem(index);
                cartItem.remove();
                updateSummary();
            });
        });
    }

    // Cập nhật số lượng sản phẩm trong localStorage
    function updateCartItem(index, quantity) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart[index]) {
            cart[index].quantity = quantity;
            localStorage.setItem('cart', JSON.stringify(cart));
        }
    }

    // Xóa sản phẩm khỏi localStorage
    function removeCartItem(index) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));

        // Nếu giỏ hàng trống, render lại
        if (cart.length === 0) {
            renderCart();
        }
    }

    // Cập nhật tổng tiền
    function updateSummary() {
        let subtotal = 0;
        document.querySelectorAll('.cart-item').forEach(function (item) {
            const qty = parseInt(item.querySelector('.cart-item-qty input').value, 10);
            const priceText = item.querySelector('.cart-item-price').textContent.replace(/[^0-9]/g, '');
            const price = parseInt(priceText, 10);
            subtotal += qty * price;
        });

        const shipping = subtotal > 0 ? 10 : 0;
        const total = subtotal + shipping;

        document.querySelector('.summary-row span:last-child').textContent = `$${subtotal}`;
        document.querySelectorAll('.summary-row span')[3].textContent = `$${shipping}`;
        document.querySelector('.summary-total span:last-child').textContent = `$${total}`;

        // Cập nhật trạng thái nút Continue
        const continueBtn = document.querySelector('.summary-btn');
        if (continueBtn) {
            continueBtn.disabled = subtotal === 0;
        }
    }

    // Xử lý nút Continue
    const continueBtn = document.querySelector('.summary-btn');
    if (continueBtn) {
        continueBtn.addEventListener('click', function () {
            // Kiểm tra checkbox đồng ý điều khoản
            const agreeCheckbox = document.getElementById('agree');
            if (!agreeCheckbox || agreeCheckbox.checked) {
                window.location.href = '../checkoutPage/checkoutPage.html';
            } else {
                alert('Vui lòng đồng ý với điều khoản và điều kiện');
            }
        });
    }

    // Khởi tạo giỏ hàng khi trang load
    renderCart();
});