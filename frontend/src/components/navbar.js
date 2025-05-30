window.initNavbar = function () {
  // Xác định base path tới thư mục chứa "src"
  const pathParts = window.location.pathname.split('/');
  const srcIndex = pathParts.indexOf('src');
  const baseURL = srcIndex !== -1 ? pathParts.slice(0, srcIndex + 1).join('/') + '/' : '/';

  // Gán href cho các icon navbar với class đúng
  const searchIcon = document.querySelector(".navbar-icon.search")
  const cartIcon = document.querySelector(".navbar-icon.cart")

  if (searchIcon) {
    searchIcon.addEventListener("click", (e) => {
      e.preventDefault()
      window.location.href = baseURL + "pages/filterAndSearch/filterAndSearch.html"
    })
  }
  if (cartIcon) {
    cartIcon.addEventListener("click", (e) => {
      e.preventDefault()
      window.location.href = baseURL + "pages/cartPage/cartPage.html"
    })
  }

  // Gán click logo về trang homePage
  const shopLogo = document.getElementById("shopLogo")
  if (shopLogo) {
    shopLogo.addEventListener("click", (e) => {
      e.preventDefault()
      window.location.href = baseURL + "index.html"
    })
  }

  // Xử lý user dropdown - sử dụng ID đúng
  const userDropdownToggle = document.getElementById("userDropdownToggle")
  const userDropdownMenu = document.getElementById("userDropdownMenu")

  if (!userDropdownToggle || !userDropdownMenu) return

  // Check login status
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")

  function updateDropdownContent() {
    if (isLoggedIn && currentUser.email) {
      // User đã đăng nhập
      userDropdownMenu.innerHTML = `
                <li>
                    <div class="dropdown-item-text">
                        <div class="d-flex align-items-center">
                            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="me-2">
                                <circle cx="12" cy="12" r="10"/>
                                <circle cx="12" cy="9" r="3"/>
                                <path d="M6.168 18.849A4 4 0 0 1 10 16h4a4 4 0 0 1 3.832 2.849"/>
                            </svg>
                            <div>
                                <div class="fw-semibold">${currentUser.firstName || "User"} ${currentUser.lastName || ""}</div>
                                <small class="text-muted">${currentUser.email}</small>
                            </div>
                        </div>
                    </div>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                    <a class="dropdown-item" href="${baseURL}pages/manageOrder/manageOrder.html">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="me-2">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                            <line x1="3" y1="6" x2="21" y2="6"/>
                            <path d="M16 10a4 4 0 0 1-8 0"/>
                        </svg>
                        Manage Orders
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="#" id="logoutBtn">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="me-2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Logout
                    </a>
                </li>
            `

      // Xử lý logout
      const logoutBtn = document.getElementById("logoutBtn")
      if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
          e.preventDefault()
          if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
            localStorage.removeItem("isLoggedIn")
            localStorage.removeItem("currentUser")
            localStorage.removeItem("fashionCart")
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")

            // Hiển thị thông báo và chuyển hướng
            alert("Đã đăng xuất thành công!")
            window.location.href = baseURL + "index.html"
          }
        })
      }
    } else {
      // User chưa đăng nhập
      userDropdownMenu.innerHTML = `
                <li>
                    <a class="dropdown-item" href="${baseURL}pages/loginAndRegist/loginAndRegist.html">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="me-2">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                            <polyline points="10 17 15 12 10 7"/>
                            <line x1="15" y1="12" x2="3" y2="12"/>
                        </svg>
                        Đăng nhập/Đăng ký
                    </a>
                </li>
            `
    }
  }

  // Khởi tạo dropdown content
  updateDropdownContent()

  // Lắng nghe sự kiện storage để cập nhật khi user login/logout từ tab khác
  window.addEventListener("storage", (e) => {
    if (e.key === "isLoggedIn" || e.key === "currentUser") {
      updateDropdownContent()
    }
  })
}