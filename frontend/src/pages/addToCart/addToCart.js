document.addEventListener('DOMContentLoaded', function () {
    // Lấy thông tin sản phẩm từ localStorage
    const selectedProduct = JSON.parse(localStorage.getItem('selectedProduct')) || null;

    if (!selectedProduct) {
        // Xác định base path tới thư mục chứa "src"
        const pathParts = window.location.pathname.split('/');
        const srcIndex = pathParts.indexOf('src');
        const baseURL = srcIndex !== -1 ? pathParts.slice(0, srcIndex + 1).join('/') + '/' : '/';
        window.location.href = baseURL + 'pages/filterAndSearch/filterAndSearch.html';
        return;
    }

    // Cập nhật UI với thông tin sản phẩm
    document.getElementById('product-title').textContent = selectedProduct.name;
    document.getElementById('product-price').textContent = selectedProduct.price;
    document.getElementById('main-product-image').src = selectedProduct.image;

    // Cập nhật thumbnails với cùng một ảnh
    document.querySelectorAll('.thumbnail img').forEach(thumb => {
        thumb.src = selectedProduct.image;
    });

    // Xử lý sự kiện cho thumbnails
    document.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.addEventListener('click', function () {
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const imageSrc = this.getAttribute('data-image');
            document.getElementById('main-product-image').src = imageSrc;
        });
    });

    // Xử lý sự kiện cho tùy chọn màu sắc
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function () {
            document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Xử lý sự kiện cho tùy chọn kích thước
    document.querySelectorAll('.size-option').forEach(option => {
        option.addEventListener('click', function () {
            document.querySelectorAll('.size-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Xử lý nút Add to Cart
    document.getElementById('add-to-cart').addEventListener('click', function () {
        const selectedColor = document.querySelector('.color-option.active');
        const selectedSize = document.querySelector('.size-option.active');

        if (!selectedColor || !selectedSize) {
            showNotification('Vui lòng chọn màu sắc và kích thước', 'warning');
            return;
        }

        // Tạo đối tượng sản phẩm với thông tin đầy đủ
        const cartItem = {
            ...selectedProduct,
            color: selectedColor.getAttribute('data-color'),
            size: selectedSize.getAttribute('data-size'),
            quantity: 1
        };

        // Lấy giỏ hàng hiện tại từ localStorage
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        // Thêm sản phẩm vào giỏ hàng
        cart.push(cartItem);

        // Lưu giỏ hàng vào localStorage
        localStorage.setItem('cart', JSON.stringify(cart));

        // Hiển thị thông báo
        showNotification('Đã thêm sản phẩm vào giỏ hàng', 'success');

        // Chuyển hướng đến trang giỏ hàng sau 1 giây
        setTimeout(() => {
            window.location.href = '../cartPage/cartPage.html';
        }, 1000);
    });

    // Hàm hiển thị thông báo Bootstrap style
    function showNotification(message, type = 'info') {
        let notification = document.querySelector('.notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'notification';
            document.body.appendChild(notification);
        }
        notification.textContent = message;

        // Màu theo Bootstrap
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