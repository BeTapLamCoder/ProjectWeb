// addToCart.js (hoặc scripts.js)

document.addEventListener('DOMContentLoaded', function() {
    // Biến để lưu trữ dữ liệu sản phẩm sau khi lấy từ API
    let currentProductData = null;

    // API Endpoint để lấy chi tiết sản phẩm
    // Bạn cần xác định productId, có thể từ URL params hoặc một nguồn khác
    // Ví dụ: const urlParams = new URLSearchParams(window.location.search);
    // Ví dụ: const productIdFromUrl = urlParams.get('id');
    const productId = 'product-123'; // << THAY THẾ BẰNG ID SẢN PHẨM ĐỘNG HOẶC LẤY TỪ URL
    const productDetailEndpoint = `/api/products/${productId}`; // << THAY THẾ BẰNG ENDPOINT THỰC TẾ CỦA BẠN

    // --- Hàm lấy chi tiết sản phẩm từ API ---
    function fetchProductDetails() {
        // Hiển thị trạng thái loading (tùy chọn)
        // Ví dụ: document.getElementById('product-details-container').innerHTML = '<p>Đang tải dữ liệu sản phẩm...</p>';
        showNotification('Đang tải dữ liệu sản phẩm...', 'info');


        return fetch(productDetailEndpoint, { /* Thêm headers nếu cần, ví dụ xác thực */ })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errData => {
                        throw new Error(errData.message || `Lỗi server: ${response.status} khi lấy chi tiết sản phẩm.`);
                    }).catch(() => {
                        throw new Error(`Lỗi server: ${response.status} khi lấy chi tiết sản phẩm.`);
                    });
                }
                return response.json();
            })
            .then(data => {
                currentProductData = data; // Lưu dữ liệu sản phẩm đã lấy được
                // Giả sử API trả về priceValue dạng số, nếu không, cần thêm vào đây
                if (data.price && typeof data.priceValue === 'undefined') {
                    currentProductData.priceValue = parseFloat(data.price.replace(/[^0-9.-]+/g,"")) || 0;
                }
                updateProductUI(currentProductData);
                attachAddToCartEventListener(); // Gắn sự kiện cho nút Add to Cart SAU KHI có dữ liệu
                // Xóa thông báo loading
                const loadingNotification = document.querySelector('.notification.info.show');
                if (loadingNotification) {
                    loadingNotification.classList.remove('show');
                }
            })
            .catch(error => {
                console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
                showNotification(error.message || 'Không thể tải dữ liệu sản phẩm.', 'error');
                // Có thể hiển thị thông báo lỗi trên UI
                const productDetailsContainer = document.querySelector('.product-details'); // Hoặc container chính
                if (productDetailsContainer) {
                  productDetailsContainer.innerHTML = `<p style="color: red;">Lỗi: ${error.message || 'Không thể tải dữ liệu sản phẩm.'}</p>`;
                }
            });
    }


    // --- Hàm cập nhật số lượng hiển thị trên icon giỏ hàng (GỌI API) ---
    function updateCartCountDisplayFromServer() {
        const cartCountBadge = document.getElementById('cart-count-badge');
        if (!cartCountBadge) {
            console.warn('Phần tử #cart-count-badge không tìm thấy.');
            return;
        }
        const cartSummaryEndpoint = '/api/cart/summary'; // << THAY THẾ BẰNG ENDPOINT THỰC TẾ

        fetch(cartSummaryEndpoint, { /* ... headers ... */ })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        console.warn(`Lỗi xác thực (${response.status}) khi lấy tóm tắt giỏ hàng.`);
                        cartCountBadge.textContent = '0';
                        return;
                    }
                    return response.json().then(errData => { throw new Error(errData.message || `Lỗi server: ${response.status}`); })
                                       .catch(() => { throw new Error(`Lỗi server: ${response.status} khi lấy tóm tắt giỏ hàng.`); });
                }
                return response.json();
            })
            .then(data => {
                const totalItems = data.totalItems !== undefined ? data.totalItems : (data.count !== undefined ? data.count : 0);
                cartCountBadge.textContent = totalItems;
            })
            .catch(error => {
                console.error('Lỗi khi lấy số lượng giỏ hàng từ server:', error);
                cartCountBadge.textContent = '0';
            });
    }

    // --- Hàm để cập nhật UI từ dữ liệu sản phẩm ---
    function updateProductUI(data) {
        // Kiểm tra xem dữ liệu có hợp lệ không
        if (!data || typeof data !== 'object' || !data.id) {
            console.error('Dữ liệu sản phẩm không hợp lệ để cập nhật UI:', data);
            showNotification('Không thể hiển thị chi tiết sản phẩm do dữ liệu không hợp lệ.', 'error');
            return;
        }

        const productTitleEl = document.getElementById('product-title');
        const productPriceEl = document.getElementById('product-price');
        const productTaxEl = document.getElementById('product-tax');
        const productDescriptionEl = document.getElementById('product-description');
        const mainProductImageEl = document.getElementById('main-product-image');

        const thumbnailsContainerEl = document.querySelector('.thumbnail-gallery');
        const colorsContainerEl = document.querySelector('.color-selector');
        const sizesContainerEl = document.querySelector('.size-selector');

        if (productTitleEl) productTitleEl.textContent = data.title || "Không có tiêu đề";
        if (productPriceEl) productPriceEl.textContent = data.price || "$0.00";
        if (productTaxEl) productTaxEl.textContent = data.tax_info || "";
        if (productDescriptionEl) productDescriptionEl.innerHTML = `<p>${data.description || "Không có mô tả."}</p>`;

        if (mainProductImageEl && data.images && data.images.length > 0) {
            mainProductImageEl.src = data.images[0];
            mainProductImageEl.alt = data.title || "Hình ảnh sản phẩm";
        } else if (mainProductImageEl) {
            mainProductImageEl.src = 'placeholder.svg?height=600&width=450&text=No+Image'; // Ảnh mặc định
            mainProductImageEl.alt = "Không có hình ảnh";
        }

        if (thumbnailsContainerEl && data.images && Array.isArray(data.images)) {
            thumbnailsContainerEl.innerHTML = '';
            data.images.forEach((imgSrc, index) => {
                const thumbDiv = document.createElement('div');
                thumbDiv.className = 'thumbnail me-2 mb-2';
                if (index === 0) thumbDiv.classList.add('active');
                thumbDiv.setAttribute('data-image', imgSrc);

                const thumbImg = document.createElement('img');
                thumbImg.src = imgSrc;
                thumbImg.alt = `${data.title || 'Sản phẩm'} - view ${index + 1}`;
                thumbDiv.appendChild(thumbImg);
                thumbnailsContainerEl.appendChild(thumbDiv);
            });
            addThumbnailEventListeners();
        }

        if (colorsContainerEl && data.colors && Array.isArray(data.colors)) {
            colorsContainerEl.innerHTML = '';
            data.colors.forEach((colorValue, index) => {
                const colorOption = document.createElement('button');
                colorOption.className = 'color-option me-2 mb-2';
                colorOption.style.backgroundColor = colorValue;
                if (index === 0) colorOption.classList.add('active');
                colorOption.setAttribute('data-color', colorValue);
                colorsContainerEl.appendChild(colorOption);
            });
            addColorEventListeners();
        }

        if (sizesContainerEl && data.sizes && Array.isArray(data.sizes)) {
            sizesContainerEl.innerHTML = '';
            data.sizes.forEach((sizeValue, index) => {
                const sizeOption = document.createElement('button');
                sizeOption.className = 'size-option btn btn-outline-secondary me-2 mb-2';
                sizeOption.textContent = sizeValue;
                if (index === 0) sizeOption.classList.add('active');
                sizeOption.setAttribute('data-size', sizeValue);
                sizesContainerEl.appendChild(sizeOption);
            });
            addSizeEventListeners();
        }
    }

    // --- Hàm hiển thị thông báo ---
    function showNotification(message, type = 'success') {
        let notification = document.querySelector('.notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'notification';
            document.body.appendChild(notification);
        }
        notification.textContent = message;
        notification.classList.remove('success', 'error', 'info');
        notification.classList.add(type);
        notification.classList.add('show');

        // Không tự động ẩn thông báo 'info' (loading)
        if (type !== 'info') {
            setTimeout(() => {
                // Kiểm tra lại xem thông báo có còn class 'show' không trước khi xóa
                // để tránh lỗi nếu nó đã bị xóa bởi một thao tác khác
                if (notification.classList.contains('show')) {
                    notification.classList.remove('show');
                }
            }, 3000);
        }
    }


    // --- Xử lý sự kiện cho các thành phần UI ---
    function addThumbnailEventListeners() {
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.addEventListener('click', function() {
                document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                const imageSrc = this.getAttribute('data-image');
                const mainImg = document.getElementById('main-product-image');
                if (mainImg) mainImg.src = imageSrc;
            });
        });
    }

    function addColorEventListeners() {
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', function() {
                document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    function addSizeEventListeners() {
        document.querySelectorAll('.size-option').forEach(option => {
            option.addEventListener('click', function() {
                document.querySelectorAll('.size-option').forEach(o => o.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    // --- Hàm gắn sự kiện cho nút "ADD" (ID: add-to-cart) ---
    // Hàm này sẽ được gọi SAU KHI currentProductData có dữ liệu
    function attachAddToCartEventListener() {
        const addToCartButton = document.getElementById('add-to-cart');
        if (!addToCartButton) {
            console.warn('Nút #add-to-cart không tìm thấy.');
            return;
        }

        // Xóa listener cũ nếu có để tránh gắn nhiều lần (quan trọng nếu hàm này được gọi lại)
        const newButton = addToCartButton.cloneNode(true);
        addToCartButton.parentNode.replaceChild(newButton, addToCartButton);


        newButton.addEventListener('click', function() {
            if (!currentProductData || !currentProductData.id) {
                showNotification('Lỗi: Dữ liệu sản phẩm không có sẵn hoặc không hợp lệ.', 'error');
                return;
            }

            const selectedColorEl = document.querySelector('.color-option.active');
            const selectedSizeEl = document.querySelector('.size-option.active');

            if (!selectedColorEl) {
                showNotification('Vui lòng chọn màu sắc.', 'error');
                return;
            }
            if (!selectedSizeEl) {
                showNotification('Vui lòng chọn kích thước.', 'error');
                return;
            }

            const selectedColor = selectedColorEl.getAttribute('data-color');
            const selectedSize = selectedSizeEl.getAttribute('data-size');
            const quantityInput = document.getElementById('quantity-input');
            const quantity = quantityInput ? parseInt(quantityInput.value, 10) : 1;

            if (isNaN(quantity) || quantity < 1) {
                showNotification('Số lượng không hợp lệ.', 'error');
                return;
            }

            const itemPayload = {
                productId: currentProductData.id,
                color: selectedColor,
                size: selectedSize,
                quantity: quantity
            };

            const addToCartEndpoint = '/api/cart/add'; // << THAY THẾ BẰNG ENDPOINT THỰC TẾ
            const originalButtonText = newButton.textContent;
            newButton.disabled = true;
            newButton.textContent = 'ĐANG XỬ LÝ...';

            fetch(addToCartEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', /* ... other headers ... */ },
                body: JSON.stringify(itemPayload)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errorData => {
                        throw new Error(errorData.message || response.statusText || `Lỗi server: ${response.status}`);
                    }).catch(() => {
                        throw new Error(`Lỗi không xác định từ server: ${response.status}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                showNotification(data.message || `Đã thêm "${currentProductData.title}" vào giỏ hàng!`, 'success');
                updateCartCountDisplayFromServer();
            })
            .catch(error => {
                showNotification(error.message || 'Không thể thêm sản phẩm vào giỏ hàng.', 'error');
            })
            .finally(() => {
                newButton.disabled = false;
                newButton.textContent = originalButtonText;
            });
        });
    }

    // --- Khởi tạo khi tải trang ---
    fetchProductDetails(); // Lấy dữ liệu sản phẩm chi tiết từ API trước
    updateCartCountDisplayFromServer(); // Lấy và hiển thị số lượng giỏ hàng từ server
});
