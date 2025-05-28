// Homepage JavaScript - FIXED CAROUSEL
document.addEventListener("DOMContentLoaded", () => {
  // Initialize all functionality
  initMobileMenu()
  initProductCarousel()
  initSearch() // Declare initSearch function here
  initAddToCart()
  initCollectionFilters()
  initLoadMore()
  initPagination()
  initGalleryEffects()
  initSmoothScrolling()
  initHeaderScroll()
  initLazyLoading()
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

// FIXED Product Carousel
function initProductCarousel() {
  const carousel = document.querySelector(".product-carousel")
  const prevBtn = document.querySelector(".prev-arrow")
  const nextBtn = document.querySelector(".next-arrow")
  const slides = document.querySelectorAll(".product-slide")

  if (!carousel || slides.length === 0) return

  let currentSlide = 0
  const totalSlides = slides.length

  // Initialize slides positioning
  slides.forEach((slide, index) => {
    slide.style.transform = `translateX(${index * 100}%)`
    if (index === 0) {
      slide.classList.add("active")
    }
  })

  // Auto-play carousel
  let autoPlayInterval = setInterval(nextSlide, 5000)

  function showSlide(index) {
    // Remove active class from all slides
    slides.forEach((slide) => slide.classList.remove("active"))

    // Update slide positions
    slides.forEach((slide, i) => {
      const position = (i - index) * 100
      slide.style.transform = `translateX(${position}%)`

      // Add active class to current slide
      if (i === index) {
        slide.classList.add("active")
      }
    })
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides
    showSlide(currentSlide)
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides
    showSlide(currentSlide)
  }

  // Event listeners
  if (nextBtn) {
    nextBtn.addEventListener("click", (e) => {
      e.preventDefault()
      nextSlide()
      resetAutoPlay()
    })
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", (e) => {
      e.preventDefault()
      prevSlide()
      resetAutoPlay()
    })
  }

  // Pause auto-play on hover
  carousel.addEventListener("mouseenter", () => {
    clearInterval(autoPlayInterval)
  })

  carousel.addEventListener("mouseleave", () => {
    autoPlayInterval = setInterval(nextSlide, 5000)
  })

  function resetAutoPlay() {
    clearInterval(autoPlayInterval)
    autoPlayInterval = setInterval(nextSlide, 5000)
  }

  // Touch/swipe support
  let startX = 0
  let endX = 0

  carousel.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX
  })

  carousel.addEventListener("touchend", (e) => {
    endX = e.changedTouches[0].clientX
    handleSwipe()
  })

  function handleSwipe() {
    const swipeThreshold = 50
    const diff = startX - endX

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        nextSlide()
      } else {
        prevSlide()
      }
      resetAutoPlay()
    }
  }

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
  const addToCartBtns = document.querySelectorAll(".add-to-cart")

  addToCartBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault()
      e.stopPropagation()

      const productCard = this.closest(".product-card, .collection-card")
      const productName = productCard?.querySelector(".product-name, .collection-name")?.textContent
      const productPrice = productCard?.querySelector(".product-price, .collection-price")?.textContent

      // Add animation
      this.style.transform = "scale(0.8)"
      this.style.backgroundColor = "#28a745"
      this.innerHTML = "✓"

      setTimeout(() => {
        this.style.transform = "scale(1)"
        this.style.backgroundColor = "#fff"
        this.innerHTML = "+"
      }, 1000)

      // Update cart count
      updateCartCount()

      // Show notification
      showNotification(`Added "${productName}" to cart`, "success")

      // Store in localStorage
      addToCartStorage({
        name: productName,
        price: productPrice,
        timestamp: Date.now(),
      })
    })
  })
}

// Collection Filters - FIXED VERSION
function initCollectionFilters() {
  const filterTabs = document.querySelectorAll(".filter-tab")
  const collectionCards = document.querySelectorAll(".collection-card")

  console.log("Filter tabs found:", filterTabs.length) // Debug
  console.log("Collection cards found:", collectionCards.length) // Debug

  filterTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      console.log("Tab clicked:", this.textContent) // Debug

      // Remove active class from all tabs
      filterTabs.forEach((t) => t.classList.remove("active"))
      // Add active class to clicked tab
      this.classList.add("active")

      // Get filter value from data-filter attribute
      const filter = this.getAttribute("data-filter")
      console.log("Filter value:", filter) // Debug

      // Get ALL collection cards (including newly added ones)
      const allCollectionCards = document.querySelectorAll(".collection-card")
      console.log("Cards to filter:", allCollectionCards.length) // Debug

      // Reset loaded product index when changing filters
      loadedProductIndex = 0;

      // Group cards by category
      const cardsByCategory = {
        men: [],
        women: [],
        kid: []
      };

      // Categorize all cards
      allCollectionCards.forEach(card => {
        const category = card.getAttribute("data-category");
        if (category && cardsByCategory[category]) {
          cardsByCategory[category].push(card);
        }
      });

      // Hide all cards first
      allCollectionCards.forEach(card => {
        card.style.display = "none";
        card.style.opacity = "0";
      });

      // Show only the first 3 cards of the selected category or all categories
      if (filter === "all") {
        // For "all" filter, show 3 cards from each category if available
        Object.keys(cardsByCategory).forEach(category => {
          const cards = cardsByCategory[category].slice(0, 3);
          showCards(cards);
        });
      } else {
        // For specific category, show only first 3 cards
        const cards = cardsByCategory[filter].slice(0, 3);
        showCards(cards);
      }
    })
  })

  // Helper function to show cards with animation
  function showCards(cards) {
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.style.display = "block";
        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";

        setTimeout(() => {
          card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
          card.style.opacity = "1";
          card.style.transform = "translateY(0)";
        }, 50);
      }, index * 50);
    });
  }
}

// Load More Functionality
function initLoadMore() {
  const loadMoreBtn = document.querySelector(".load-more-btn")

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", function () {
      this.innerHTML = 'Loading... <div class="spinner"></div>'
      this.disabled = true

      setTimeout(() => {
        // Get the active filter
        const activeFilter = document.querySelector(".filter-tab.active").getAttribute("data-filter");
        
        // Load more products based on the active filter
        loadMoreProducts(activeFilter);
        
        this.innerHTML =
          'More <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>'
        this.disabled = false
      }, 2000)
    })
  }
}

let loadedProductIndex = 0

function loadMoreProducts(activeFilter = "all") {
  const collectionsGrid = document.querySelector(".collections-grid")
  const productsPerLoad = 3

  // Filter products based on active filter
  let filteredProducts = productDatabase;
  if (activeFilter !== "all") {
    filteredProducts = productDatabase.filter(product => product.category === activeFilter);
  }

  // Lấy 3 sản phẩm tiếp theo từ database đã lọc
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

// Thêm function này để thêm sản phẩm vào grid
// Thêm function này để thêm sản phẩm vào grid
function addProductsToGrid(products, container) {
  products.forEach((product, index) => {
    setTimeout(() => {
      const productCard = createProductCard(product)
      container.appendChild(productCard)
      productCard.style.animation = "fadeInUp 0.5s ease forwards"
    }, index * 200)
  })
}

function applyCurrentFilter() {
  const activeTab = document.querySelector(".filter-tab.active")
  if (activeTab) {
    activeTab.click() // Trigger filter lại
  }
}

function createProductCard(product) {
  const card = document.createElement("div")
  card.className = "collection-card"
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

  const addToCartBtn = card.querySelector(".add-to-cart")
  addToCartBtn.addEventListener("click", function (e) {
    e.preventDefault()
    e.stopPropagation()

    this.style.transform = "scale(0.8)"
    this.style.backgroundColor = "#28a745"
    this.innerHTML = "✓"

    setTimeout(() => {
      this.style.transform = "scale(1)"
      this.style.backgroundColor = "#fff"
      this.innerHTML = "+"
    }, 1000)

    updateCartCount()
    showNotification(`Added "${product.name}" to cart`, "success")

    // Store in localStorage
    addToCartStorage({
      name: product.name,
      price: product.price,
      category: product.category,
      timestamp: Date.now(),
    })
  })

  return card
}

// Pagination
function initPagination() {
  const paginationBtns = document.querySelectorAll(".pagination-btn")

  paginationBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const isNext = this.classList.contains("next")
      const productGrid = document.querySelector(".products-grid")

      productGrid.style.opacity = "0.5"

      setTimeout(() => {
        productGrid.style.opacity = "1"
        showNotification(`Moved to ${isNext ? "next" : "previous"} page`, "info")
      }, 500)
    })
  })
}

// Gallery Effects
function initGalleryEffects() {
  const galleryItems = document.querySelectorAll(".gallery-item")

  galleryItems.forEach((item) => {
    item.addEventListener("mouseenter", function () {
      this.style.transform = "scale(1.02)"
      this.style.zIndex = "10"
    })

    item.addEventListener("mouseleave", function () {
      this.style.transform = "scale(1)"
      this.style.zIndex = "1"
    })
  })
}

// Smooth Scrolling
function initSmoothScrolling() {
  const links = document.querySelectorAll('a[href^="#"]')

  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()
      const targetId = this.getAttribute("href")
      const targetElement = document.querySelector(targetId)

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })
}

// Header Scroll Effect
function initHeaderScroll() {
  const header = document.querySelector("header")
  let lastScrollY = window.scrollY

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY

    if (currentScrollY > 100) {
      header.classList.add("scrolled")
    } else {
      header.classList.remove("scrolled")
    }

    if (currentScrollY > lastScrollY && currentScrollY > 200) {
      header.style.transform = "translateY(-100%)"
    } else {
      header.style.transform = "translateY(0)"
    }

    lastScrollY = currentScrollY
  })
}

// Lazy Loading for Images
function initLazyLoading() {
  const images = document.querySelectorAll('img[src*="placeholder"]')

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target
        setTimeout(() => {
          img.style.filter = "blur(0)"
        }, 500)
        observer.unobserve(img)
      }
    })
  })

  images.forEach((img) => {
    img.style.filter = "blur(5px)"
    img.style.transition = "filter 0.5s ease"
    imageObserver.observe(img)
  })
}

// Utility Functions
function updateCartCount() {
  const cartBtn = document.querySelector(".icon-button.cart")
  const currentCount = Number.parseInt(cartBtn.dataset.count || "0")
  const newCount = currentCount + 1

  cartBtn.dataset.count = newCount

  // Add visual indicator
  if (!cartBtn.querySelector(".cart-count")) {
    const countBadge = document.createElement("span")
    countBadge.className = "cart-count"
    countBadge.textContent = newCount
    cartBtn.appendChild(countBadge)
  } else {
    cartBtn.querySelector(".cart-count").textContent = newCount
  }
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
  }, 3000)

  notification.addEventListener("click", () => {
    notification.remove()
  })
}

// Add CSS animations
const style = document.createElement("style")
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #333;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        display: inline-block;
        margin-left: 10px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .cart-count {
        position: absolute;
        top: -8px;
        right: -8px;
        background: #dc3545;
        color: white;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        font-size: 11px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    header.scrolled {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    header {
        transition: transform 0.3s ease, background 0.3s ease;
    }
    
    .main-nav.active {
        display: block;
    }
    
    .menu-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .menu-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .menu-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
    
    .menu-toggle span {
        transition: all 0.3s ease;
    }
    
    @media (max-width: 768px) {
        .main-nav {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: white;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            z-index: 1000;
        }
        
        .main-nav ul {
            flex-direction: column;
            padding: 20px;
        }
        
        .main-nav li {
            margin-bottom: 15px;
        }
    }

    .icon-button.cart {
        position: relative;
    }
`

document.head.appendChild(style)

// User Dropdown Menu
function initUserDropdown() {
  const userIcon = document.querySelector(".icon-button.account")

  if (!userIcon) return

  // Create dropdown menu
  const dropdown = document.createElement("div")
  dropdown.className = "user-dropdown"
  dropdown.innerHTML = `
    <div class="user-info">
      <div class="user-avatar">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
      <div class="user-details">
        <span class="user-name">John Doe</span>
        <span class="user-email">john@example.com</span>
      </div>
    </div>
    <div class="dropdown-divider"></div>
    <ul class="dropdown-menu">
      <li>
        <a href="#" class="dropdown-item" data-action="profile">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          Quản lý thông tin
        </a>
      </li>
      <li>
        <a href="#" class="dropdown-item" data-action="orders">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          Quản lý đơn hàng
        </a>
      </li>
      <li class="dropdown-divider"></li>
      <li>
        <a href="#" class="dropdown-item logout" data-action="logout">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Đăng xuất
        </a>
      </li>
    </ul>
  `

  // Insert dropdown after user icon
  userIcon.parentNode.insertBefore(dropdown, userIcon.nextSibling)

  // Show/hide dropdown on hover
  userIcon.addEventListener("mouseenter", () => {
    dropdown.classList.add("show")
  })

  userIcon.addEventListener("mouseleave", () => {
    setTimeout(() => {
      if (!dropdown.matches(":hover")) {
        dropdown.classList.remove("show")
      }
    }, 100)
  })

  dropdown.addEventListener("mouseenter", () => {
    dropdown.classList.add("show")
  })

  dropdown.addEventListener("mouseleave", () => {
    dropdown.classList.remove("show")
  })

  // Handle dropdown item clicks
  const dropdownItems = dropdown.querySelectorAll(".dropdown-item")
  dropdownItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault()
      const action = item.dataset.action

      switch (action) {
        case "profile":
          handleProfileClick()
          break
        case "orders":
          handleOrdersClick()
          break
        case "logout":
          handleLogoutClick()
          break
      }

      dropdown.classList.remove("show")
    })
  })
}

function handleOrdersClick() {
  setTimeout(() => {
    window.location.href = ".pages/manageOrder/manageOrder.html"
  }, 1000)
}

function handleLogoutClick() {
  if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
    showNotification("Đang đăng xuất...", "info")

    localStorage.removeItem("fashionCart")
    localStorage.removeItem("userToken")

    setTimeout(() => {
      showNotification("Đã đăng xuất thành công!", "success")
      console.log("User logged out")
    }, 1500)
  }
}

function initSearch() {
  // Placeholder for search functionality
  console.log("Search functionality initialized")
}

function handleProfileClick() {
  // Placeholder for profile click functionality
  console.log("Profile clicked")
}

window.FashionHome = {
  showNotification,
  updateCartCount,
  addToCartStorage,
}

const productDatabase = [
  // Men Products
  {
    name: "Premium Cotton Hoodie",
    category: "men",
    price: "$299",
    categoryDisplay: "Cotton Hoodie",
    image: "https://buggy.yodycdn.com/images/product/bacf8829518f24b04db2236552e9e4c9.webp?width=987&height=1316",
  },
  {
    name: "Classic Denim Jacket",
    category: "men",
    price: "$399",
    categoryDisplay: "Denim Jacket",
    image: "https://buggy.yodycdn.com/images/product/3e41fdc02b1f7908a2974283fd7905ab.webp?width=987&height=1316",
  },
  {
    name: "Casual Polo Shirt",
    category: "men",
    price: "$159",
    categoryDisplay: "Polo Shirt",
    image: "https://buggy.yodycdn.com/images/product/b748d34111da5399e1868f073a549404.webp?width=987&height=1316",
  },
  {
    name: "Slim Fit Chinos",
    category: "men",
    price: "$229",
    categoryDisplay: "Chinos Pants",
    image: "https://buggy.yodycdn.com/images/product/427a1a554e6cb9b91fbe67d9430d8411.webp?width=987&height=1316",
  },

  // Women Products
  {
    name: "Elegant Silk Blouse",
    category: "women",
    price: "$349",
    categoryDisplay: "Silk Blouse",
    image: "https://buggy.yodycdn.com/images/product/3e279ed4c388b3be16807915f4abfbc0.webp?width=987&height=1316",
  },
  {
    name: "Floral Summer Dress",
    category: "women",
    price: "$279",
    categoryDisplay: "Summer Dress",
    image: "https://buggy.yodycdn.com/images/product/a30d2627fbb012bbe5dfffd42e3cdff3.webp?width=987&height=1316",
  },
  {
    name: "Casual Knit Sweater",
    category: "women",
    price: "$199",
    categoryDisplay: "Knit Sweater",
    image: "https://buggy.yodycdn.com/images/product/d712f0ca773a81df6c995e56c0da674e.webp?width=987&height=1316",
  },
  {
    name: "High-Waist Jeans",
    category: "women",
    price: "$259",
    categoryDisplay: "High-Waist Jeans",
    image: "https://buggy.yodycdn.com/images/product/3dd7b1ac0dc9a7c291cefc7c07c58d7a.webp?width=987&height=1316",
  },

  // Kids Products
  {
    name: "Colorful Graphic Tee",
    category: "kid",
    price: "$89",
    categoryDisplay: "Kids T-Shirt",
    image: "https://buggy.yodycdn.com/images/product/e3493ccb97b8279f07e663e0e2cba289.webp?width=987&height=1316",
  },
  {
    name: "Mini Denim Jacket",
    category: "kid",
    price: "$129",
    categoryDisplay: "Kids Jacket",
    image: "https://buggy.yodycdn.com/images/product/f0f3cc2f66f7d351226d88e0762ae594.webp?width=987&height=1316",
  },
  {
    name: "Comfortable Joggers",
    category: "kid",
    price: "$99",
    categoryDisplay: "Kids Pants",
    image: "https://buggy.yodycdn.com/images/product/b8720cd7b4a22ca3bedbe54ceb700219.webp?width=987&height=1316",
  },
  {
    name: "Cute Animal Hoodie",
    category: "kid",
    price: "$119",
    categoryDisplay: "Kids Hoodie",
    image: "https://buggy.yodycdn.com/images/product/d7e1df48b2c7a678e10b2dbb8101d3e8.webp?width=987&height=1316",
  },
  {
    name: "Rainbow Striped Dress",
    category: "kid",
    price: "$109",
    categoryDisplay: "Kids Dress",
    image: "https://buggy.yodycdn.com/images/product/3c59cf289ebe000508480b816917b297.webp?width=987&height=1316",
  },
  {
    name: "Sports Shorts Set",
    category: "kid",
    price: "$79",
    categoryDisplay: "Kids Sports Set",
    image: "https://buggy.yodycdn.com/images/product/644c4edb9c3aa32a6b6678b511655866.webp?width=987&height=1316",
  },
]
