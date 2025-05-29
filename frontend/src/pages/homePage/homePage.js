// Homepage JavaScript - FIXED CAROUSEL
document.addEventListener("DOMContentLoaded", async () => {
  initMobileMenu()
  initHeroCarousel()
  await fetchAndRenderProducts() // Fetch products from server
  initAddToCart()
  initCollectionFilters()
  initLoadMore()
  initPagination()
  initUserDropdown()
})

// Mobile Menu Toggle
function initMobileMenu() {
  const menuToggle = document.querySelector(".menu-toggle")
  const mainNav = document.querySelector(".main-nav")

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", function () {
      this.classList.toggle("active")
      mainNav.classList.toggle("active")
      document.body.classList.toggle("menu-open")
    })

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!menuToggle.contains(e.target) && !mainNav.contains(e.target)) {
        menuToggle.classList.remove("active")
        mainNav.classList.remove("active")
        document.body.classList.remove("menu-open")
      }
    })
  }
}

// Hero Carousel (Bootstrap)
function initHeroCarousel() {
  // Bootstrap carousel đã tự động, chỉ cần xử lý nút custom nếu có
  const prevBtn = document.querySelector(".prev-arrow")
  const nextBtn = document.querySelector(".next-arrow")
  const carousel = document.querySelector("#heroProductCarousel")

  if (!carousel) return

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      const bsCarousel = bootstrap.Carousel.getOrCreateInstance(carousel)
      bsCarousel.prev()
    })
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      const bsCarousel = bootstrap.Carousel.getOrCreateInstance(carousel)
      bsCarousel.next()
    })
  }
  // Shop button chuyển trang
  const shopButton = document.querySelector(".shop-button")
  if (shopButton) {
    shopButton.addEventListener("click", (e) => {
      e.preventDefault()
      window.location.href = "./pages/filterAndSearch/filterAndSearch.html"
    })
  }
}

// Add to Cart Functionality
function initAddToCart() {
  const productContainer = document.body;

  productContainer.addEventListener('click', function (e) {
    const addToCartBtn = e.target.closest('.add-to-cart-overlay');

    if (!addToCartBtn) return;

    e.preventDefault();
    e.stopPropagation();

    const card = addToCartBtn.closest('.card.h-100');
    if (!card) {
      console.error("Không tìm thấy card sản phẩm cho nút:", addToCartBtn);
      return;
    }

    const productNameElement = card.querySelector('.card-title a');
    const productPriceElement = card.querySelector('.card-text.fw-bold');
    const productTypeElement = card.querySelector('.card-text.text-muted.small');
    const productImageElement = card.querySelector('.card-img-top');

    const productData = {
      id: card.dataset.productId || `product_${Date.now()}`,
      name: productNameElement ? productNameElement.textContent.trim() : 'Sản phẩm không tên',
      price: productPriceElement ? productPriceElement.textContent.trim() : '$0',
      type: productTypeElement ? (productTypeElement.childNodes[0]?.textContent?.trim() || productTypeElement.textContent.trim()) : 'Chưa phân loại',
      image: productImageElement ? productImageElement.src : 'placeholder.svg'
    };
    localStorage.setItem('selectedProduct', JSON.stringify(productData));

    const pathParts = window.location.pathname.split('/');
    const srcIndex = pathParts.indexOf('src');
    let baseURL = '';
    if (window.location.pathname.includes('/frontend/src/')) {

      baseURL = './';
    } else if (srcIndex !== -1) {
      baseURL = pathParts.slice(0, srcIndex + 1).join('/') + '/';
    } else {
      baseURL = '/';
    }

    window.location.href = baseURL + 'pages/addToCart/addToCart.html';
  });
}

// Collection Filters
function initCollectionFilters() {
  // Đúng selector cho các tab filter
  const filterTabs = document.querySelectorAll(".filter-tabs .nav-link")
  if (!filterTabs.length) return

  filterTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      filterTabs.forEach((t) => t.classList.remove("active"))
      this.classList.add("active")
      const filter = this.getAttribute("data-filter")
      applyFilter(filter)
    })
  })

  // Khởi tạo lần đầu: chọn tab đang active hoặc tab đầu tiên
  const activeTab = document.querySelector(".filter-tabs .nav-link.active") || filterTabs[0]
  if (activeTab) {
    const filter = activeTab.getAttribute("data-filter")
    applyFilter(filter)
  }
}

function applyFilter(filter) {
  // Đúng selector cho các sản phẩm
  const allCards = document.querySelectorAll(".collection-item")
  if (!allCards.length) return

  allCards.forEach((card) => {
    const category = card.getAttribute("data-category")
    if (filter === "all" || category === filter) {
      card.style.display = "block"
      card.style.opacity = "1"
    } else {
      card.style.display = "none"
      card.style.opacity = "0"
    }
  })
}

// Load More Functionality
let loadedProductIndex = 0
function initLoadMore() {
  const loadMoreBtn = document.querySelector(".load-more-btn")
  if (!loadMoreBtn) return

  loadMoreBtn.addEventListener("click", function () {
    this.innerHTML = 'Loading... <div class="spinner"></div>'
    this.disabled = true

    setTimeout(() => {
      // Sửa selector lấy tab filter đang active
      const activeFilter = document.querySelector(".filter-tabs .nav-link.active")?.getAttribute("data-filter") || "all"
      loadMoreProducts(activeFilter)
      this.innerHTML =
        'More <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>'
      this.disabled = false
    }, 1200)
  })
}

function loadMoreProducts(activeFilter = "all") {
  const collectionsGrid = document.querySelector(".collections-grid")
  const productsPerLoad = 3
  let filteredProducts = productDatabase
  if (activeFilter !== "all") {
    filteredProducts = productDatabase.filter((product) => product.category === activeFilter)
  }
  const nextProducts = filteredProducts.slice(loadedProductIndex, loadedProductIndex + productsPerLoad)

  if (nextProducts.length === 0) {
    // Nếu hết sản phẩm, reset về đầu
    loadedProductIndex = 0
    const resetProducts = filteredProducts.slice(0, productsPerLoad)
    addProductsToGrid(resetProducts, collectionsGrid)
    loadedProductIndex = productsPerLoad
  } else {
    addProductsToGrid(nextProducts, collectionsGrid)
    loadedProductIndex += productsPerLoad
  }
}

function addProductsToGrid(products, container) {
  products.forEach((product, index) => {
    setTimeout(() => {
      const col = document.createElement("div");
      col.className = "col collection-item";
      col.setAttribute("data-category", product.category);

      // Badge ngẫu nhiên
      const hasBadge = Math.random() > 0.7;
      const badgeNumber = Math.floor(Math.random() * 5) + 2;
      const badgeHtml = hasBadge ? `<span class="badge bg-light text-dark border ms-1">+${badgeNumber}</span>` : "";

      col.innerHTML = `
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-img-top-wrapper">
            <img src="${product.image}" alt="${product.name}" class="card-img-top">
            <button class="add-to-cart-overlay">+</button>
          </div>
          <div class="card-body text-center">
            <p class="card-text text-muted small mb-1">${product.categoryDisplay} ${badgeHtml}</p>
            <h5 class="card-title fs-6"><a href="#" class="text-dark text-decoration-none">${product.name}</a></h5>
            <p class="card-text fw-bold">${product.price}</p>
          </div>
        </div>
      `;
      container.appendChild(col);
      col.style.animation = "fadeInUp 0.5s ease forwards";
    }, index * 100);
  });
}

function createProductCard(product) {
  const card = document.createElement("div")
  card.className = "collection-card col"
  card.setAttribute("data-category", product.category)

  // Thêm badge ngẫu nhiên cho một số sản phẩm
  const hasBadge = Math.random() > 0.7
  const badgeNumber = Math.floor(Math.random() * 5) + 2
  const badgeHtml = hasBadge ? `<span class="badge">+${badgeNumber}</span>` : ""

  card.innerHTML = `
        <div class="collection-image-container">
            <img src="${product.image}" alt="${product.name}" class="collection-image">
            <button class="add-to-cart">+</button>
        </div>
        <div class="collection-info">
            <span class="collection-category">${product.categoryDisplay} ${badgeHtml}</span>
            <h3 class="collection-name">${product.name}</h3>
            <span class="collection-price">${product.price}</span>
        </div>
    `
  return card
}

// Pagination
function initPagination() {
  const paginationBtns = document.querySelectorAll(".pagination-btn")

  paginationBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const isNext = this.classList.contains("next")
      const productGrid = document.querySelector(".products-grid")
      if (!productGrid) return
      productGrid.style.opacity = "0.5"
      setTimeout(() => {
        productGrid.style.opacity = "1"
        showNotification(`Moved to ${isNext ? "next" : "previous"} page`, "info")
      }, 500)
    })
  })
}

// User Dropdown Menu
function initUserDropdown() {
  const userIcon = document.querySelector(".icon-button.account")
  if (!userIcon) return

  const dropdown = document.createElement("div")
  dropdown.className = "user-dropdown"
  dropdown.innerHTML = `
    <div class="user-info">
      <div class="user-avatar">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
      </div>
      <div class="user-details">
        <span class="user-name">John Doe</span>
        <span class="user-email">john@example.com</span>
      </div>
    </div>
    <div class="dropdown-divider"></div>
    <ul class="dropdown-menu">
      <li><a href="#" class="dropdown-item" data-action="orders">Quản lý đơn hàng</a></li>
      <li class="dropdown-divider"></li>
      <li><a href="#" class="dropdown-item logout" data-action="logout">Đăng xuất</a></li>
    </ul>
  `
  userIcon.parentNode.insertBefore(dropdown, userIcon.nextSibling)

  userIcon.addEventListener("mouseenter", () => dropdown.classList.add("show"))
  userIcon.addEventListener("mouseleave", () => setTimeout(() => {
    if (!dropdown.matches(":hover")) dropdown.classList.remove("show")
  }, 100))
  dropdown.addEventListener("mouseenter", () => dropdown.classList.add("show"))
  dropdown.addEventListener("mouseleave", () => dropdown.classList.remove("show"))

  dropdown.querySelectorAll(".dropdown-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault()
      const action = item.dataset.action
      if (action === "orders") handleOrdersClick()
      if (action === "logout") handleLogoutClick()
      dropdown.classList.remove("show")
    })
  })
}

function handleOrdersClick() {
  setTimeout(() => {
    window.location.href = "./pages/manageOrder/manageOrder.html"
  }, 500)
}

function handleLogoutClick() {
  if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
    showNotification("Đang đăng xuất...", "info")

    localStorage.removeItem("fashionCart")
    localStorage.removeItem("userToken")

    setTimeout(() => {
      showNotification("Đã đăng xuất thành công!", "success")
      window.location.reload()
    }, 1000)
  }
}

function handleProfileClick() {
  showNotification("Chức năng đang phát triển!", "info")
}

// Utility Functions
function updateCartCount() {
  const cartBtn = document.querySelector(".icon-button.cart")
  if (!cartBtn) return
  const currentCount = Number.parseInt(cartBtn.dataset.count || "0")
  const newCount = currentCount + 1
  cartBtn.dataset.count = newCount
  let countBadge = cartBtn.querySelector(".cart-count")
  if (!countBadge) {
    countBadge = document.createElement("span")
    countBadge.className = "cart-count"
    cartBtn.appendChild(countBadge)
  }
  countBadge.textContent = newCount
}

function addToCartStorage(product) {
  const cart = JSON.parse(localStorage.getItem("fashionCart") || "[]")
  cart.push(product)
  localStorage.setItem("fashionCart", JSON.stringify(cart))
}

function showNotification(message, type = "info") {
  const existingNotifications = document.querySelectorAll(".notification")
  existingNotifications.forEach((notif) => notif.remove())

  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.textContent = message

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 4px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideInRight 0.3s ease-out;
  `

  const colors = {
    success: "#28a745",
    error: "#dc3545",
    warning: "#ffc107",
    info: "#17a2b8",
  }
  notification.style.backgroundColor = colors[type] || colors.info

  document.body.appendChild(notification)

  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = "slideOutRight 0.3s ease-out"
      setTimeout(() => {
        notification.remove()
      }, 300)
    }
  }, 2500)

  notification.addEventListener("click", () => {
    notification.remove()
  })
}

// Product Database (giữ nguyên như cũ)
let productDatabase = [];

// Hàm fetch sản phẩm từ API và render ra trang
async function fetchAndRenderProducts() {
  try {
    const response = await fetch('http://localhost:8080/products'); // Đổi URL nếu cần
    const data = await response.json();
    productDatabase = data.map(item => ({
      id: item.product_id,
      name: item.product_name,
      category: item.category_id || "all",
      categoryDisplay: item.category_name || "All",
      price: item.price,
      image: item.image_url
    }));

    renderInitialProducts(productDatabase);
  } catch (error) {
    showNotification('Không thể tải sản phẩm từ server!', 'error');
    console.error(error);
  }
}

// Render sản phẩm ra grid (hiển thị 9 sản phẩm đầu)
function renderInitialProducts(products) {
  const collectionsGrid = document.querySelector('.collections-grid');
  if (!collectionsGrid) return;
  collectionsGrid.innerHTML = '';
  loadedProductIndex = 0;
  addProductsToGrid(products.slice(0, 9), collectionsGrid);
  loadedProductIndex = 9;
}
