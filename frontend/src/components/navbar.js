window.initNavbar = function () {
    const currentPath = window.location.pathname;
    const currentFolder = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);

    function countFolders(path) {
        const srcIndex = path.indexOf('/src/');
        if (srcIndex === -1) return 0;
        const subPath = path.substring(srcIndex + 5);
        const trimmed = subPath.endsWith('/') ? subPath.slice(0, -1) : subPath;
        if (!trimmed) return 0;
        return trimmed.split('/').length;
    }

    const upStepsCount = countFolders(currentFolder);

    const upPath = '../'.repeat(upStepsCount);

    const componentsPath = upPath + 'components/';

    document.querySelector('.navbar-icon.search').href = componentsPath + '../pages/filterAndSearch/filterAndSearch.html';
    document.querySelector('.navbar-icon.cart').href = componentsPath + '../pages/cartPage/cartPage.html';

    // Gán click logo về trang homePage
    document.getElementById('shopLogo').addEventListener('click', () => {
        console.log('Logo clicked, redirecting to home page');
        window.location.href = componentsPath + '../index.html';
    });

    const userBtn = document.getElementById('userBtn');
    if (!userBtn) return;

    // Create dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'user-dropdown';

    // Check login status
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    function updateDropdownContent() {
        if (isLoggedIn && currentUser) {
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
                        <div style="font-weight: 500;">${currentUser.firstName} ${currentUser.lastName}</div>
                        <div style="font-size: 0.9em; color: #666;">${currentUser.email}</div>
                    </div>
                </div>
                <ul class="dropdown-menu">
                    <li>
                        <a href="${componentsPath}../manageOrder/manageOrder.html" class="dropdown-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                                <line x1="3" y1="6" x2="21" y2="6"/>
                                <path d="M16 10a4 4 0 0 1-8 0"/>
                            </svg>
                            Manage Orders
                        </a>
                    </li>
                    <li>
                        <a href="#" class="dropdown-item" id="logoutBtn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                <polyline points="16 17 21 12 16 7"/>
                                <line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                            Logout
                        </a>
                    </li>
                </ul>
            `;
        } else {
            dropdown.innerHTML = `
                <div class="dropdown-menu">
                    <a href="${componentsPath}../loginAndRegist/loginAndRegist.html" class="dropdown-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                            <polyline points="10 17 15 12 10 7"/>
                            <line x1="15" y1="12" x2="3" y2="12"/>
                        </svg>
                        Login / Register
                    </a>
                </div>
            `;
        }

        // Handle logout
        const logoutBtn = dropdown.querySelector('#logoutBtn');
        if (logoutBtn) {
            logoutBtn.onclick = function (e) {
                e.preventDefault();
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('currentUser');
                updateDropdownContent();
                dropdown.classList.remove('show');
                window.location.href = componentsPath + '../loginAndRegist/loginAndRegist.html';
            };
        }
    }

    // Initialize dropdown content
    updateDropdownContent();

    // Add dropdown to DOM
    userBtn.parentNode.appendChild(dropdown);

    // Handle click events
    userBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (!dropdown.contains(e.target) && !userBtn.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });

};
