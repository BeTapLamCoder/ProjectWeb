document.addEventListener("DOMContentLoaded", () => {
  console.log("Product page loaded")

  // Toggle sidebar
  const sidebarToggle = document.getElementById("sidebar-toggle")
  const adminContainer = document.querySelector(".admin-container")

  if (sidebarToggle && adminContainer) {
    sidebarToggle.addEventListener("click", () => {
      adminContainer.classList.toggle("sidebar-collapsed")
    })
  }

  // Load products from localStorage
  function loadProducts() {
    console.log("Loading products from localStorage...")

    // Always try to get from localStorage first
    let products = []
    const storedData = localStorage.getItem("products")

    if (storedData) {
      try {
        products = JSON.parse(storedData)
        console.log("Found products in localStorage:", products)
      } catch (error) {
        console.error("Error parsing localStorage data:", error)
        products = []
      }
    }

    // Only add sample data if localStorage is completely empty
    if (!storedData || products.length === 0) {
      console.log("No products found, adding sample data")
      products = [
        {
          id: 1,
          name: "Classic White T-Shirt",
          sku: "CWT001",
          category: "Shirts",
          regularPrice: "29.99",
          stock: 150,
          status: "published",
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          name: "Blue Denim Jeans",
          sku: "BDJ002",
          category: "Pants",
          regularPrice: "79.99",
          stock: 75,
          status: "published",
          createdAt: new Date().toISOString(),
        },
        {
          id: 3,
          name: "Running Sneakers",
          sku: "RS003",
          category: "Shoes",
          regularPrice: "129.99",
          stock: 25,
          status: "published",
          createdAt: new Date().toISOString(),
        },
      ]
      // Save sample data to localStorage
      localStorage.setItem("products", JSON.stringify(products))
    }

    return products
  }

  // Render products table
  function renderProducts(productsToRender = null) {

    // If no specific products provided, load from localStorage
    const products = productsToRender || loadProducts()

    const tbody = document.querySelector("#product-table-body")
    if (!tbody) {
      console.error("Table body not found!")
      return
    }

    tbody.innerHTML = ""

    if (products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center">No products found</td></tr>'
      return
    }

    products.forEach((product, index) => {
      const tr = document.createElement("tr")

      // Determine status badge
      let statusBadge = ""
      switch (product.status) {
        case "published":
          statusBadge = '<span class="badge bg-success">Published</span>'
          break
        case "draft":
          statusBadge = '<span class="badge bg-warning">Draft</span>'
          break
        case "pending":
          statusBadge = '<span class="badge bg-info">Pending</span>'
          break
        default:
          statusBadge = '<span class="badge bg-secondary">Unknown</span>'
      }

      // Determine stock status
      let stockStatus = ""
      if (product.stock > 50) {
        stockStatus = "text-success"
      } else if (product.stock > 10) {
        stockStatus = "text-warning"
      } else {
        stockStatus = "text-danger"
      }

      tr.innerHTML = `
                <td><input type="checkbox" class="row-checkbox" data-product-id="${product.id}"></td>
                <td>${index + 1}</td>
                <td>
                    <div class="d-flex align-items-center">
                        ${
                          product.images && product.images.length > 0
                            ? `<img src="${product.images[0].data}" alt="${product.name}" style="width: 40px; height: 40px; object-fit: cover; margin-right: 10px; border-radius: 4px;">`
                            : '<div style="width: 40px; height: 40px; background: #f8f9fa; margin-right: 10px; border-radius: 4px; display: flex; align-items: center; justify-content: center;"><span class="material-symbols-outlined text-muted">image</span></div>'
                        }
                        <div>
                            <div class="fw-bold">${product.name}</div>
                            <small class="text-muted">${statusBadge}</small>
                        </div>
                    </div>
                </td>
                <td><code>${product.sku}</code></td>
                <td><span class="badge bg-light text-dark">${product.category}</span></td>
                <td>
                    <div class="fw-bold">$${product.regularPrice}</div>
                    ${product.salePrice ? `<small class="text-muted">Sale: $${product.salePrice}</small>` : ""}
                </td>
                <td><span class="${stockStatus}">${product.stock} units</span></td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary view-btn" data-product-id="${product.id}" title="View">
                            <span class="material-symbols-outlined">visibility</span>
                        </button>
                        <button class="btn btn-sm btn-outline-warning edit-btn" data-product-id="${product.id}" title="Edit">
                            <span class="material-symbols-outlined">edit</span>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-btn" data-product-id="${product.id}" title="Delete">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                </td>
            `
      tbody.appendChild(tr)
    })

    initializeActionButtons()
    console.log("Products rendered successfully")
  }

  // Initialize action buttons
  function initializeActionButtons() {
    // View buttons
    const viewButtons = document.querySelectorAll(".view-btn")
    viewButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const productId = Number.parseInt(this.dataset.productId)
        const products = loadProducts()
        const product = products.find((p) => p.id === productId)

        if (product) {
          showProductDetails(product)
        }
      })
    })

    // Edit buttons
    const editButtons = document.querySelectorAll(".edit-btn")
    editButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const productId = Number.parseInt(this.dataset.productId)
        // Redirect to edit page with product ID
        window.location.href = `../addProduct/add-product.html?edit=${productId}`
      })
    })

    // Delete buttons
    const deleteButtons = document.querySelectorAll(".delete-btn")
    deleteButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const productId = Number.parseInt(this.dataset.productId)
        if (confirm("Are you sure you want to delete this product?")) {
          deleteProduct(productId)
        }
      })
    })
  }

  // Show product details in modal
  function showProductDetails(product) {
    const modalHtml = `
            <div class="modal fade" id="productDetailModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Product Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    ${
                                      product.images && product.images.length > 0
                                        ? `<img src="${product.images[0].data}" alt="${product.name}" class="img-fluid rounded mb-3">`
                                        : '<div class="bg-light rounded mb-3 d-flex align-items-center justify-content-center" style="height: 200px;"><span class="material-symbols-outlined text-muted" style="font-size: 48px;">image</span></div>'
                                    }
                                </div>
                                <div class="col-md-6">
                                    <h4>${product.name}</h4>
                                    <p class="text-muted">${product.description || "No description available"}</p>
                                    <hr>
                                    <div class="row">
                                        <div class="col-6"><strong>SKU:</strong></div>
                                        <div class="col-6">${product.sku}</div>
                                        <div class="col-6"><strong>Category:</strong></div>
                                        <div class="col-6">${product.category}</div>
                                        <div class="col-6"><strong>Price:</strong></div>
                                        <div class="col-6">$${product.regularPrice}</div>
                                        <div class="col-6"><strong>Stock:</strong></div>
                                        <div class="col-6">${product.stock} units</div>
                                        <div class="col-6"><strong>Status:</strong></div>
                                        <div class="col-6">${product.status}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" onclick="window.location.href='../addProduct/add-product.html?edit=${product.id}'">Edit Product</button>
                        </div>
                    </div>
                </div>
            </div>
        `

    // Remove existing modal if any
    const existingModal = document.getElementById("productDetailModal")
    if (existingModal) {
      existingModal.remove()
    }


    document.body.insertAdjacentHTML("beforeend", modalHtml)


    const modal = new bootstrap.Modal(document.getElementById("productDetailModal"))
    modal.show()
  }

  // Delete product
  function deleteProduct(productId) {
    let products = loadProducts()
    products = products.filter((p) => p.id !== productId)
    localStorage.setItem("products", JSON.stringify(products))
    renderProducts(products)

    // Show success message
    const alert = document.createElement("div")
    alert.className = "alert alert-success alert-dismissible fade show"
    alert.innerHTML = `
            Product deleted successfully!
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `
    document.querySelector("main").insertBefore(alert, document.querySelector("main").firstChild)

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      if (alert.parentNode) {
        alert.remove()
      }
    }, 3000)
  }

  // Bulk actions
  const selectAll = document.getElementById("select-all")
  const bulkActions = document.getElementById("bulk-actions")

  if (selectAll) {
    selectAll.addEventListener("change", function () {
      document.querySelectorAll(".row-checkbox").forEach((cb) => {
        cb.checked = this.checked
      })
      updateBulkActions()
    })
  }

  // Update bulk actions visibility
  function updateBulkActions() {
    const checked = document.querySelectorAll(".row-checkbox:checked")
    if (bulkActions) {
      if (checked.length > 0) {
        bulkActions.style.display = "block"
        bulkActions.querySelector(".selected-count").textContent = checked.length
      } else {
        bulkActions.style.display = "none"
        if (selectAll) selectAll.checked = false
      }
    }
  }

  // Listen for checkbox changes
  document.addEventListener("change", (e) => {
    if (e.target.classList.contains("row-checkbox")) {
      updateBulkActions()
    }
  })

  // Filter functionality
  const applyFiltersBtn = document.getElementById("apply-filters")
  const clearFiltersBtn = document.getElementById("clear-filters")

  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener("click", () => {
      const category = document.getElementById("category-filter").value
      const status = document.getElementById("status-filter").value
      const priceRange = document.getElementById("price-filter").value
      const sortBy = document.getElementById("sort-by").value

      let products = loadProducts()

      if (category) {
        products = products.filter((p) => p.category.toLowerCase() === category)
      }

      if (status) {
        if (status === "in-stock") {
          products = products.filter((p) => p.stock > 0)
        } else if (status === "out-of-stock") {
          products = products.filter((p) => p.stock === 0)
        } else if (status === "low-stock") {
          products = products.filter((p) => p.stock > 0 && p.stock <= 10)
        }
      }

      if (priceRange) {
        const [min, max] = priceRange.split("-").map((p) => p.replace("+", ""))
        products = products.filter((p) => {
          const price = Number.parseFloat(p.regularPrice)
          if (max) {
            return price >= Number.parseFloat(min) && price <= Number.parseFloat(max)
          } else {
            return price >= Number.parseFloat(min)
          }
        })
      }

      if (sortBy) {
        const [field, order] = sortBy.split("-")
        products.sort((a, b) => {
          let aVal, bVal

          switch (field) {
            case "name":
              aVal = a.name.toLowerCase()
              bVal = b.name.toLowerCase()
              break
            case "price":
              aVal = Number.parseFloat(a.regularPrice)
              bVal = Number.parseFloat(b.regularPrice)
              break
            case "stock":
              aVal = a.stock
              bVal = b.stock
              break
            default:
              return 0
          }

          if (order === "asc") {
            return aVal > bVal ? 1 : -1
          } else {
            return aVal < bVal ? 1 : -1
          }
        })
      }

      renderProducts(products)
    })
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", () => {
      document.getElementById("category-filter").value = ""
      document.getElementById("status-filter").value = ""
      document.getElementById("price-filter").value = ""
      document.getElementById("sort-by").value = "name-asc"
      renderProducts()
    })
  }

  // Search functionality
  const searchInput = document.querySelector('input[placeholder="Search products..."]')
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase()
      const products = loadProducts()

      if (searchTerm) {
        const filteredProducts = products.filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.sku.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm),
        )
        renderProducts(filteredProducts)
      } else {
        renderProducts(products)
      }
    })
  }

  // Handle page visibility change (when user comes back from add-product page)
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      renderProducts()
    }
  })

  // Handle window focus (alternative to visibilitychange)
  window.addEventListener("focus", () => {
    console.log("Window focused - reloading products")
    renderProducts()
  })

  renderProducts()
})
