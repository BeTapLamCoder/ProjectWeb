const serverBaseURL =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:8080"
        : "https://server-project-web.vercel.app";
let editProductModal;
document.addEventListener("DOMContentLoaded", () => {
    // Initialize Bootstrap modal
    editProductModal = new bootstrap.Modal(document.getElementById('editProductModal'));

    async function loadProducts() {
        try {
            const response = await fetch(`${serverBaseURL}/products`);
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const data = await response.json();
            console.log('API Response:', data);
            return data;
        } catch (error) {
            console.error("Error loading products:", error);
            return [];
        }
    }

    async function renderProducts(productsToRender = null) {
    const tbody = document.querySelector("#product-table-body");
    if (!tbody) {
        console.error("Table body not found!");
        return;
    }

    try {
        const products = productsToRender || await loadProducts();
        console.log('Products to render:', products);

        tbody.innerHTML = "";

        if (!products || products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No products found</td></tr>';
            return;
        }

        products.forEach((product, index) => {
            const tr = document.createElement("tr");
            
            const statusBadge = product.is_active 
                ? '<span class="badge bg-success">Active</span>'
                : '<span class="badge bg-danger">Inactive</span>';

            tr.innerHTML = `
                <td><input type="checkbox" class="row-checkbox" data-product-id="${product.product_id}"></td>
                <td>${product.product_id}</td>
                <td>
                    ${product.image_url 
                        ? `<img src="${product.image_url}" alt="${product.product_name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">`
                        : '<div style="width: 40px; height: 40px; background: #f8f9fa; border-radius: 4px; display: flex; align-items: center; justify-content: center;"><span class="material-symbols-outlined text-muted">image</span></div>'
                    }
                </td>
                <td>
                    <div class="fw-bold">${product.product_name}</div>
                </td>
                <td>$${product.price || 0}</td>
                <td>${product.category_name || 'N/A'}</td>
                <td>${statusBadge}</td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-warning edit-btn" data-product-id="${product.product_id}" title="Edit">
                            <span class="material-symbols-outlined">edit</span>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-btn" data-product-id="${product.product_id}" title="Delete">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        initializeActionButtons();
        console.log("Products rendered successfully");
    } catch (error) {
        console.error("Error rendering products:", error);
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Error loading products</td></tr>';
    }
}

  async function deleteProduct(productId) {
    try {
        // Log để debug
        console.log('Deleting product:', productId);

        const response = await fetch(`${serverBaseURL}/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete product');
        }

        // Sau khi xóa thành công, render lại danh sách
        await renderProducts();

        // Hiển thị thông báo thành công
        const alert = document.createElement("div");
        alert.className = "alert alert-success alert-dismissible fade show";
        alert.innerHTML = `
            Product deleted successfully!
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.querySelector("main").insertBefore(alert, document.querySelector("main").firstChild);

        setTimeout(() => {
            if (alert.parentNode) alert.remove();
        }, 3000);

    } catch (error) {
        console.error("Error deleting product:", error);
        const alert = document.createElement("div");
        alert.className = "alert alert-danger alert-dismissible fade show";
        alert.innerHTML = `
            Error deleting product: ${error.message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.querySelector("main").insertBefore(alert, document.querySelector("main").firstChild);
    }
}

  const sidebarToggle = document.getElementById("sidebar-toggle")
  const adminContainer = document.querySelector(".admin-container")

  if (sidebarToggle && adminContainer) {
    sidebarToggle.addEventListener("click", () => {
      adminContainer.classList.toggle("sidebar-collapsed")
    })
  }

  function initializeActionButtons() {
    // Update edit buttons handler
    const editButtons = document.querySelectorAll(".edit-btn");
    editButtons.forEach((button) => {
        button.addEventListener("click", async function() {
            const productId = this.dataset.productId;
            await loadProductForEdit(productId);
        });
    });

    const deleteButtons = document.querySelectorAll(".delete-btn");
    deleteButtons.forEach((button) => {
        button.addEventListener("click", async function() {
            const productId = this.dataset.productId;
            console.log('Delete button clicked for product:', productId);
            
            if (confirm("Are you sure you want to delete this product?")) {
                await deleteProduct(productId);
            }
        });
    });
}

    // Add new function to load product data into modal
    async function loadProductForEdit(productId) {
        try {
            const response = await fetch(`${serverBaseURL}/products/${productId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch product details');
            }
            
            const product = await response.json();
            console.log('Product to edit:', product);

            // Fill form fields with product data
            document.getElementById('edit-product-id').value = product.product_id;
            document.getElementById('edit-product-name').value = product.product_name;
            document.getElementById('edit-product-description').value = product.description;
            document.getElementById('edit-product-price').value = product.price;
            document.getElementById('edit-product-category').value = product.category_id;
            document.getElementById('edit-product-status').value = product.is_active.toString();

            // Show current product image
            const imgContainer = document.getElementById('edit-product-image');
            const img = imgContainer.querySelector('img');
            img.src = product.image_url;
            img.alt = product.product_name;

            // Show modal
            editProductModal.show();
        } catch (error) {
            console.error('Error loading product:', error);
            alert('Error loading product details');
        }
    }

    // Add function to update product
    async function updateProduct(productId, productData) {
        try {
            const response = await fetch(`${serverBaseURL}/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update product');
            }

            // Hide modal after successful update
            editProductModal.hide();

            // Refresh products list
            await renderProducts();

            // Show success message
            const alert = document.createElement("div");
            alert.className = "alert alert-success alert-dismissible fade show";
            alert.innerHTML = `
                Product updated successfully!
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            document.querySelector("main").insertBefore(alert, document.querySelector("main").firstChild);

            setTimeout(() => {
                if (alert.parentNode) alert.remove();
            }, 3000);

        } catch (error) {
            console.error('Error updating product:', error);
            alert('Error updating product: ' + error.message);
        }
    }

    // Add event listener for Save Changes button
    document.getElementById('saveEditButton').addEventListener('click', async () => {
        const productId = document.getElementById('edit-product-id').value;
        
        const productData = {
            product_name: document.getElementById('edit-product-name').value,
            description: document.getElementById('edit-product-description').value,
            price: parseFloat(document.getElementById('edit-product-price').value),
            category_id: document.getElementById('edit-product-category').value,
            is_active: document.getElementById('edit-product-status').value === 'true'
        };

        await updateProduct(productId, productData);
    });

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

  document.addEventListener("change", (e) => {
    if (e.target.classList.contains("row-checkbox")) {
      updateBulkActions()
    }
  })

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

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      renderProducts()
    }
  })

  window.addEventListener("focus", () => {
    console.log("Window focused - reloading products")
    renderProducts()
  })

  renderProducts();
});
