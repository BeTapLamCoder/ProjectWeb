window.initNavbar = function () {
    const userBtn = document.getElementById('userBtn');
    if (!userBtn) return;

    // Tạo dropdown động
    const dropdown = document.createElement('div');
    dropdown.className = 'user-dropdown';

    // Kiểm tra trạng thái đăng nhập
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    function updateDropdownContent() {
        if (isLoggedIn) {
            dropdown.innerHTML = `
                <div class="user-info">
                    <div class="user-avatar">
                        <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/>
                            <circle cx="12" cy="9" r="3"/>
                            <path d="M6.168 18.849A4 4 0 0 1 10 16h4a4 4 0 0 1 3.832 2.849"/>
                        </svg>
                    </div>
                    <div style="color: #333;">
                        <div style="font-weight: 500;">Người dùng</div>
                        <div style="font-size: 0.9em; color: #666;">user@example.com</div>
                    </div>
                </div>
                <ul class="dropdown-menu">
                    <li>
                        <a href="../manageOrder/manageOrder.html" class="dropdown-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                                <line x1="3" y1="6" x2="21" y2="6"/>
                                <path d="M16 10a4 4 0 0 1-8 0"/>
                            </svg>
                            Đơn hàng của tôi
                        </a>
                    </li>
                    <li>
                        <a href="#" class="dropdown-item" id="logoutBtn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                <polyline points="16 17 21 12 16 7"/>
                                <line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                            Đăng xuất
                        </a>
                    </li>
                </ul>
            `;
        } else {
            dropdown.innerHTML = `
                <div class="dropdown-menu">
                    <a href="../loginAndRegist/loginAndRegist.html" class="dropdown-item" id="loginBtn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                            <polyline points="10 17 15 12 10 7"/>
                            <line x1="15" y1="12" x2="3" y2="12"/>
                        </svg>
                        Đăng nhập
                    </a>
                </div>
            `;
        }

        // Gắn sự kiện cho các nút mới
        const loginBtn = dropdown.querySelector('#loginBtn');
        const logoutBtn = dropdown.querySelector('#logoutBtn');

        if (loginBtn) {
            loginBtn.onclick = function (e) {
                e.preventDefault();
                localStorage.setItem('isLoggedIn', 'true');
                updateDropdownContent();
                dropdown.classList.remove('show');
                alert('Đăng nhập thành công!');
            };
        }

        if (logoutBtn) {
            logoutBtn.onclick = function (e) {
                e.preventDefault();
                localStorage.setItem('isLoggedIn', 'false');
                updateDropdownContent();
                dropdown.classList.remove('show');
                alert('Đăng xuất thành công!');
            };
        }
    }

    // Khởi tạo nội dung dropdown
    updateDropdownContent();

    // Thêm dropdown vào DOM
    userBtn.parentNode.appendChild(dropdown);

    // Xử lý sự kiện click
    userBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });

    // Đóng dropdown khi click ra ngoài
    document.addEventListener('click', function (e) {
        if (!dropdown.contains(e.target) && !userBtn.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
};