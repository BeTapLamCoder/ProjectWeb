document.addEventListener('DOMContentLoaded', function () {
    fetchAndRenderProducts();
    // Toggle filter groups
    const filterHeaders = document.querySelectorAll('.filter-header');

    filterHeaders.forEach(header => {
        header.addEventListener('click', function () {
            const filterGroup = this.parentElement;
            const filterOptions = filterGroup.querySelector('.filter-options');
            const toggleIcon = this.querySelector('.toggle-icon');

            if (filterOptions) {
                filterOptions.style.display = filterOptions.style.display === 'none' ? 'block' : 'none';
                toggleIcon.textContent = filterOptions.style.display === 'none' ? '▶' : '▼';
            }
        });
    });

    // Size buttons selection
    const sizeButtons = document.querySelectorAll('.size-btn');

    sizeButtons.forEach(button => {
        button.addEventListener('click', function () {
            this.classList.toggle('selected');
            if (this.classList.contains('selected')) {
                this.style.backgroundColor = '#333';
                this.style.color = 'white';
            } else {
                this.style.backgroundColor = 'white';
                this.style.color = '#333';
            }
        });
    });

    // Category buttons selection
    const categoryButtons = document.querySelectorAll('.category-btn');

    categoryButtons.forEach(button => {
        button.addEventListener('click', function () {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function () {
            navLinks.classList.toggle('active');
        });
    }

    // Mobile filters toggle
    const filtersSidebar = document.querySelector('.filters-sidebar');
    const filtersTitle = filtersSidebar ? filtersSidebar.querySelector('h2') : null;

    if (filtersTitle) {
        filtersTitle.addEventListener('click', function () {
            if (window.innerWidth <= 480) {
                filtersSidebar.classList.toggle('collapsed');
            }
        });
    }

    // Initialize filters as collapsed on mobile
    function initMobileView() {
        if (window.innerWidth <= 480 && filtersSidebar) {
            filtersSidebar.classList.add('collapsed');
        } else if (filtersSidebar) {
            filtersSidebar.classList.remove('collapsed');
        }
    }

    // Run on load and resize
    initMobileView();
    window.addEventListener('resize', initMobileView);

    // Simulate loading product images
    const productImages = document.querySelectorAll('.product-image img');

    // Replace placeholder with actual product images
    // This is just a simulation - in a real app you'd load actual product images
    let productDatabase = [];

    async function fetchAndRenderProducts() {
        try {
            const response = await fetch('http://localhost:8080/products');
            const data = await response.json();
            productDatabase = data.map(item => ({
                id: item.product_id,
                name: item.product_name,
                category: item.category_id || "all",
                price: item.price,
                image: item.image_url,
                description: item.description || ""
            }));
            renderProducts(productDatabase);
        } catch (error) {
            console.error('Không thể tải sản phẩm từ server!', error);
        }
    }

    function renderProducts(products) {
        const productsGrid = document.querySelector('.row.row-cols-1.row-cols-sm-2.row-cols-md-3.row-cols-lg-4.g-4');
        if (!productsGrid) return;
        productsGrid.innerHTML = '';
        products.forEach(product => {
            const col = document.createElement('div');
            col.className = 'col';
            col.innerHTML = `
            <div class="card h-100 shadow-sm" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" class="card-img-top" alt="${product.name}">
                </div>
                <div class="card-body d-flex flex-column">
                    <p class="card-text text-muted small">${product.description}</p>
                    <h5 class="card-title product-name">${product.name}</h5>
                    <p class="card-text fw-bold mt-auto product-price">${product.price} đ</p>
                </div>
                <div class="card-footer bg-transparent border-top-0">
                    <button class="btn btn-outline-primary w-100">Add to Cart</button>
                </div>
            </div>
        `;
            productsGrid.appendChild(col);
        });

        // Gắn lại sự kiện cho nút Add to Cart
        const productCards = productsGrid.querySelectorAll('.card.h-100');
        productCards.forEach(card => {
            const addToCartBtn = card.querySelector('.card-footer .btn');
            if (addToCartBtn) {
                addToCartBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const productData = {
                        id: card.dataset.productId || 'default-id',
                        name: card.querySelector('.product-name')?.textContent || '',
                        price: card.querySelector('.product-price')?.textContent || '',
                        image: card.querySelector('.card-img-top')?.src || '',
                        description: card.querySelector('.card-text.text-muted.small')?.textContent || ''
                    };
                    localStorage.setItem('selectedProduct', JSON.stringify(productData));
                    // Xác định base path tới thư mục chứa "src"
                    const pathParts = window.location.pathname.split('/');
                    const srcIndex = pathParts.indexOf('src');
                    const baseURL = srcIndex !== -1 ? pathParts.slice(0, srcIndex + 1).join('/') + '/' : '/';
                    window.location.href = baseURL + 'pages/addToCart/addToCart.html';
                });
            }
        });
    }

    // Add to Cart button click: chỉ khi bấm nút mới chuyển trang
    const productCards = document.querySelectorAll('.card.h-100');
    productCards.forEach(card => {
        const addToCartBtn = card.querySelector('.card-footer .btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                // Lấy thông tin sản phẩm
                const productData = {
                    id: card.dataset.productId || 'default-id',
                    name: card.querySelector('.card-title')?.textContent || '',
                    price: card.querySelector('.card-text.fw-bold')?.textContent || '',
                    type: card.querySelector('.card-text.text-muted.small')?.childNodes[0]?.textContent?.trim() || '',
                    image: card.querySelector('.card-img-top')?.src || ''
                };

                // Lưu vào localStorage
                localStorage.setItem('selectedProduct', JSON.stringify(productData));

                // Xác định base path tới thư mục chứa "src"
                const pathParts = window.location.pathname.split('/');
                const srcIndex = pathParts.indexOf('src');
                const baseURL = srcIndex !== -1 ? pathParts.slice(0, srcIndex + 1).join('/') + '/' : '/';

                // Chuyển sang trang addToCart
                window.location.href = baseURL + 'pages/addToCart/addToCart.html';
            });
        }
    });

    // Navigation to home page
    const homeButton = document.querySelector('.nav-links a.active, .breadcrumb a');
    if (homeButton) {
        homeButton.addEventListener('click', function (e) {
            e.preventDefault();
            console.log('Home button clicked');
            // Xác định base path tới thư mục chứa "src"
            const pathParts = window.location.pathname.split('/');
            const srcIndex = pathParts.indexOf('src');
            const baseURL = srcIndex !== -1 ? pathParts.slice(0, srcIndex + 1).join('/') + '/' : '/';
            window.location.href = baseURL + 'index.html';

        });
    }

    // Xử lý lướt ngang cho category filters
    const categoryFilters = document.querySelector('.category-filters');

    // Chỉ kiểm tra sự tồn tại của categoryFilters
    if (categoryFilters) {
        // Kiểm tra xem có thể cuộn không và cập nhật trạng thái
        function updateScrollIndicators() {
            const scrollLeft = categoryFilters.scrollLeft;
            const scrollWidth = categoryFilters.scrollWidth;
            const clientWidth = categoryFilters.clientWidth;
            const maxScrollLeft = scrollWidth - clientWidth;

            // Cập nhật class để hiển thị gradient (nếu có CSS tương ứng)
            if (scrollLeft > 0) {
                categoryFilters.classList.add('can-scroll-left');
            } else {
                categoryFilters.classList.remove('can-scroll-left');
            }

            if (scrollLeft < maxScrollLeft - 5) { // Trừ 5px để tránh vấn đề làm tròn
                categoryFilters.classList.add('can-scroll-right');
            } else {
                categoryFilters.classList.remove('can-scroll-right');
            }
        }

        // Xử lý sự kiện cuộn
        categoryFilters.addEventListener('scroll', updateScrollIndicators);

        // Xử lý sự kiện resize
        window.addEventListener('resize', updateScrollIndicators);

        // Khởi tạo trạng thái ban đầu
        updateScrollIndicators();

        // Thêm hỗ trợ cuộn ngang bằng chuột (wheel)
        categoryFilters.addEventListener('wheel', function (e) {
            if (e.deltaY !== 0) {
                e.preventDefault();
                categoryFilters.scrollBy({
                    left: e.deltaY > 0 ? 100 : -100,
                    behavior: 'smooth'
                });
            }
        }, { passive: false });

        // Thêm hỗ trợ cuộn ngang bằng cảm ứng (touch)
        let touchStartX = 0;
        let touchEndX = 0;

        categoryFilters.addEventListener('touchstart', function (e) {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        categoryFilters.addEventListener('touchmove', function (e) {
            touchEndX = e.touches[0].clientX;
        }, { passive: true });

        categoryFilters.addEventListener('touchend', function () {
            const touchDiff = touchStartX - touchEndX;
            if (Math.abs(touchDiff) > 50) {
                if (touchDiff > 0) {
                    // Vuốt sang trái
                    categoryFilters.scrollBy({
                        left: 100,
                        behavior: 'smooth'
                    });
                } else {
                    // Vuốt sang phải
                    categoryFilters.scrollBy({
                        left: -100,
                        behavior: 'smooth'
                    });
                }
            }
        }, { passive: true });

        // Thêm hỗ trợ kéo thả bằng chuột (drag)
        let isMouseDown = false;
        let startX, scrollLeft;

        categoryFilters.addEventListener('mousedown', function (e) {
            isMouseDown = true;
            startX = e.pageX - categoryFilters.offsetLeft;
            scrollLeft = categoryFilters.scrollLeft;
            categoryFilters.style.cursor = 'grabbing';
        });

        categoryFilters.addEventListener('mouseleave', function () {
            isMouseDown = false;
            categoryFilters.style.cursor = 'grab';
        });

        categoryFilters.addEventListener('mouseup', function () {
            isMouseDown = false;
            categoryFilters.style.cursor = 'grab';
        });

        categoryFilters.addEventListener('mousemove', function (e) {
            if (!isMouseDown) return;
            e.preventDefault();
            const x = e.pageX - categoryFilters.offsetLeft;
            const walk = (x - startX) * 2; // Tốc độ cuộn
            categoryFilters.scrollLeft = scrollLeft - walk;
        });

        // Thêm cursor grab để gợi ý có thể kéo
        categoryFilters.style.cursor = 'grab';

        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            card.addEventListener('click', function () {
                // Lấy thông tin sản phẩm
                const productData = {
                    id: this.dataset.productId || 'default-id',
                    name: this.querySelector('.product-name').textContent,
                    price: this.querySelector('.product-price').textContent,
                    type: this.querySelector('.product-type').textContent,
                    image: this.querySelector('.product-image img').src
                };

                // Lưu thông tin sản phẩm vào localStorage
                localStorage.setItem('selectedProduct', JSON.stringify(productData));

                // Xác định base path tới thư mục chứa "src"
                const pathParts = window.location.pathname.split('/');
                const srcIndex = pathParts.indexOf('src');
                const baseURL = srcIndex !== -1 ? pathParts.slice(0, srcIndex + 1).join('/') + '/' : '/';

                // Chuyển hướng đến trang addToCart
                window.location.href = baseURL + 'pages/addToCart/addToCart.html';
            });
        });
    }
});