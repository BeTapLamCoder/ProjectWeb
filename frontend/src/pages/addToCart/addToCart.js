document.addEventListener('DOMContentLoaded', function () {

    const selectedProduct = JSON.parse(localStorage.getItem('selectedProduct')) || null;

    if (!selectedProduct) {
        window.location.href = '../filterAndSearch/filterAndSearch.html';
        return;
    }

    // Cập nhật UI với thông tin sản phẩm
    document.getElementById('product-title').textContent = selectedProduct.name;
    document.getElementById('product-price').textContent = selectedProduct.price;
    document.getElementById('main-product-image').src = selectedProduct.image;

    // Xử lý sự kiện cho tùy chọn màu sắc
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function () {
            document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');
        });
    });
    document.querySelectorAll('.size-option').forEach(option => {
        option.addEventListener('click', function () {
            document.querySelectorAll('.size-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');
        });
    });

    function getCartIdFromAccessToken() {
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
            console.warn('Access token not found in localStorage. Cannot retrieve cart ID from token.');
            return null;
        }

        const parts = accessToken.split('.');
        if (parts.length !== 3) {
            console.error('Invalid access token format. Expected 3 parts separated by dots.');
            return null;
        }

        const payloadBase64 = parts[1];

        try {
            const decodedPayloadString = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
            const payload = JSON.parse(decodedPayloadString);

            console.log('Decoded JWT Payload:', payload);
            const cartId = payload.cartId || payload.cid || payload.userCartId || payload.cart_id;

            if (cartId) {
                console.log('Cart ID retrieved from token:', cartId);
                return cartId;
            } else {
                console.warn('Cart ID (or equivalent key) not found in token payload.');
                return null;
            }

        } catch (e) {
            console.error('Error decoding or parsing JWT payload for cart ID:', e);
            return null;
        }
    }
 
    document.getElementById('add-to-cart').addEventListener('click', async function () {
        const selectedColor = document.querySelector('.color-option.active');
        const selectedSize = document.querySelector('.size-option.active');

        if (!selectedColor || !selectedSize) {
            showNotification('Please choose color and size', 'warning');
            return;
        }

        let currentCartId = getCartIdFromAccessToken();

        if (!currentCartId) {
            currentCartId = localStorage.getItem('cartId') || null;
        }
         
        const cartItem = ({
            cart_id: currentCartId,
            product_id: selectedProduct.id || selectedProduct.productId,
            color: selectedColor.getAttribute('data-color'),
            size: selectedSize.getAttribute('data-size'),
            quantity: 1,
            image_url: selectedProduct.image_url
        });
        console.log('cartItem:', cartItem);

        try {
            const response = await fetch('http://localhost:8080/cart-details', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
                },
                body: JSON.stringify(cartItem)
            });

            const result = await response.json();
            console.log('API response:', result);

            if (response.ok) {
                showNotification('Add product to cart successfully', 'success');
                if (result.cartId && result.cartId !== localStorage.getItem('cartId')) {
                    localStorage.setItem('cartId', result.cartId);
                }
                setTimeout(() => {
                    window.location.href = '../cartPage/cartPage.html';
                }, 1000);
            } else {
                showNotification(result.message || 'Failed to add product to cart', 'error');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            showNotification('An error occurred. Please try again.', 'error');
        }
    });

    function showNotification(message, type = 'info') {
        let notification = document.querySelector('.notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'notification';
            document.body.appendChild(notification);
        }
        notification.textContent = message;

        const colors = {
            success: "#28a745",
            error: "#dc3545",
            warning: "#ffc107",
            info: "#17a2b8"
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        notification.style.color = (type === 'warning') ? '#222' : '#fff';

        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2500);
    }
});