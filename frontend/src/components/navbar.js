window.initNavbar = function () {
    const currentPath = window.location.pathname;
    // Đảm bảo currentFolder luôn kết thúc bằng dấu '/'
    let currentFolder = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
    if (currentPath.lastIndexOf('/') === -1 && currentPath.includes('.html')) { // Trường hợp file HTML ở root và không có /
        currentFolder = './'; // Hoặc để trống '' nếu logic countFolders xử lý được
    }


    function countFolders(path) {
        // Xử lý trường hợp path là './' hoặc '' (root)
        if (path === './' || path === '') return 0;

        const srcIndex = path.indexOf('/src/');
        if (srcIndex === -1) {
            // Nếu không có /src/, đếm từ thư mục gốc của path
            // Loại bỏ './' ở đầu nếu có
            const relativePath = path.startsWith('./') ? path.substring(2) : path;
            const trimmed = relativePath.endsWith('/') ? relativePath.slice(0, -1) : relativePath;
            if (!trimmed) return 0;
            return trimmed.split('/').length;
        }
        const subPath = path.substring(srcIndex + (path.startsWith('/src/') ? 4 : 5)); // +4 nếu /src/ là gốc, +5 nếu có gì đó trước /src/
        const trimmed = subPath.endsWith('/') ? subPath.slice(0, -1) : subPath;
        if (!trimmed) return 0;
        return trimmed.split('/').length;
    }

    const upStepsCount = countFolders(currentFolder);
    const upPath = '../'.repeat(upStepsCount);

    // Cập nhật href cho các icon chính
    const searchIconLink = document.getElementById('searchIconLink');
    if (searchIconLink) {
        searchIconLink.href = `${upPath}pages/filterAndSearch/filterAndSearch.html`;
    }

    const cartIconLink = document.getElementById('cartIconLink');
    if (cartIconLink) {
        cartIconLink.href = `${upPath}pages/cartPage/cartPage.html`;
    }

    // Gán click logo về trang homePage
    const shopLogo = document.getElementById('shopLogo');
    if (shopLogo) {
        shopLogo.addEventListener('click', (event) => {
            event.preventDefault(); // Ngăn hành động mặc định của thẻ <a>
            console.log('Logo clicked, redirecting to home page');
            window.location.href = `${upPath}index.html`; // Hoặc trang chủ cụ thể
        });
    }

    // User Dropdown
    const userDropdownToggle = document.getElementById('userDropdownToggle');
    const userDropdownMenu = document.getElementById('userDropdownMenu');

    if (!userDropdownToggle || !userDropdownMenu) {
        console.warn('User dropdown elements not found. Ensure userDropdownToggle and userDropdownMenu IDs are correct.');
        return;
    }

    function updateDropdownContent() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        let dropdownHtml = '';

        if (isLoggedIn && currentUser) {
            dropdownHtml = `
                <li>
                    <div class="px-3 py-2">
                        <div class="d-flex align-items-center">
                            <div class="me-2">
                                <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                                    <circle cx="12" cy="7" r="4"></circle>
                                    <path d="M5.5 21v-2a4 4 0 0 1 4-4h5a4 4 0 0 1 4 4v2"></path>
                                </svg>
                            </div>
                            <div>
                                <div class="fw-bold">${currentUser.firstName} ${currentUser.lastName}</div>
                                <div class="text-muted small">${currentUser.email}</div>
                            </div>
                        </div>
                    </div>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                    <a href="${upPath}pages/manageOrder/manageOrder.html" class="dropdown-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-2">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                            <line x1="3" y1="6" x2="21" y2="6"/>
                            <path d="M16 10a4 4 0 0 1-8 0"/>
                        </svg>
                        Đơn hàng
                    </a>
                </li>
                <li>
                    <a href="#" class="dropdown-item" id="logoutBtn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Log Out
                    </a>
                </li>
            `;
        } else {
            dropdownHtml = `
                <li>
                    <a href="${upPath}pages/loginAndRegist/loginAndRegist.html" class="dropdown-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-2">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                            <polyline points="10 17 15 12 10 7"/>
                            <line x1="15" y1="12" x2="3" y2="12"/>
                        </svg>
                        Đăng nhập
                    </a>
                </li>
                <li>
                    <a href="${upPath}pages/loginAndRegist/loginAndRegist.html#register-form" class="dropdown-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-2">
                            <path d="M12 20v-6"/>
                            <path d="M9 17l3-3 3 3"/>
                            <rect x="3" y="4" width="18" height="18" rx="2"/>
                        </svg>
                        Đăng ký
                    </a>
                </li>
            `;
        }
        userDropdownMenu.innerHTML = dropdownHtml;

        // Handle logout
        const logoutBtn = userDropdownMenu.querySelector('#logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function (e) {
                e.preventDefault();
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('currentUser');
                updateDropdownContent();
                setTimeout(() => {
                    window.location.href = `${upPath}pages/loginAndRegist/loginAndRegist.html`;
                }, 100);
            });
        }
    }

    // Initialize dropdown content on load
    updateDropdownContent();
};

// Gọi hàm initNavbar sau khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', function() {
    window.initNavbar();
});
