document.addEventListener('DOMContentLoaded', function () {
    // Xử lý nút tăng/giảm số lượng
    document.querySelectorAll('.cart-item').forEach(function (item) {
        const minusBtn = item.querySelector('.cart-item-qty button:first-child');
        const plusBtn = item.querySelector('.cart-item-qty button:last-child');
        const qtyInput = item.querySelector('.cart-item-qty input');

        minusBtn.addEventListener('click', function () {
            let value = parseInt(qtyInput.value, 10);
            if (value > 1) {
                qtyInput.value = value - 1;
                updateSummary();
            }
        });

        plusBtn.addEventListener('click', function () {
            let value = parseInt(qtyInput.value, 10);
            qtyInput.value = value + 1;
            updateSummary();
        });
    });

    // Xử lý nút xóa sản phẩm
    document.querySelectorAll('.cart-item-remove').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const cartItem = btn.closest('.cart-item');
            cartItem.remove();
            updateSummary();
        });
    });

    // Cập nhật tổng tiền
    function updateSummary() {
        let subtotal = 0;
        document.querySelectorAll('.cart-item').forEach(function (item) {
            const qty = parseInt(item.querySelector('.cart-item-qty input').value, 10);
            const priceText = item.querySelector('.cart-item-price').textContent.replace(/[^0-9]/g, '');
            const price = parseInt(priceText, 10);
            subtotal += qty * price;
        });
        document.querySelector('.summary-row span:last-child').textContent = `$${subtotal}`;
        const shipping = 10;
        document.querySelectorAll('.summary-row span')[3].textContent = `$${shipping}`;
        document.querySelector('.summary-total span:last-child').textContent = `$${subtotal + shipping}`;
    }
    const continueBtn = document.querySelector('.summary-btn');
    if (continueBtn) {
        continueBtn.addEventListener('click', function () {
            window.location.href = '../checkoutPage/checkoutPage.html';
        });
    }
});