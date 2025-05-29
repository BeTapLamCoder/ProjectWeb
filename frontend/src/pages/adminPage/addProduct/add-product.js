document.addEventListener("DOMContentLoaded", () => {
  console.log("Add product page loaded")

  // Toggle sidebar
  const sidebarToggle = document.getElementById("sidebar-toggle")
  const adminContainer = document.querySelector(".admin-container")

  if (sidebarToggle && adminContainer) {
    sidebarToggle.addEventListener("click", () => {
      adminContainer.classList.toggle("sidebar-collapsed")
    })
  }

  // Image upload preview
  const fileInput = document.getElementById("product-images")
  const imagePreviews = document.getElementById("image-previews")
  let uploadedImages = []

  if (fileInput && imagePreviews) {
    fileInput.addEventListener("change", function () {
      console.log("File input changed")
      imagePreviews.innerHTML = ""
      uploadedImages = []

      if (this.files) {
        Array.from(this.files).forEach((file, index) => {
          if (file.type.match("image.*")) {
            const reader = new FileReader()

            reader.onload = (e) => {
              const previewContainer = document.createElement("div")
              previewContainer.className = "image-preview"
              previewContainer.style.cssText = `
                position: relative;
                display: inline-block;
                margin: 10px;
                border: 1px solid #ddd;
                border-radius: 8px;
                overflow: hidden;
              `

              const img = document.createElement("img")
              img.src = e.target.result
              img.alt = file.name
              img.style.cssText = `
                width: 100px;
                height: 100px;
                object-fit: cover;
                display: block;
              `

              const removeBtn = document.createElement("button")
              removeBtn.className = "remove-image"
              removeBtn.innerHTML = '<span class="material-symbols-outlined">close</span>'
              removeBtn.style.cssText = `
                position: absolute;
                top: 5px;
                right: 5px;
                background: rgba(255, 255, 255, 0.8);
                border: none;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
              `

              removeBtn.addEventListener("click", (e) => {
                e.preventDefault()
                previewContainer.remove()
                uploadedImages = uploadedImages.filter((_, i) => i !== index)
              })

              previewContainer.appendChild(img)
              previewContainer.appendChild(removeBtn)
              imagePreviews.appendChild(previewContainer)

              uploadedImages.push({
                name: file.name,
                data: e.target.result,
              })
            }

            reader.readAsDataURL(file)
          }
        })
      }
    })
  }

  // Auto-generate SKU from product name
  const productNameInput = document.getElementById("product-name")
  const productSkuInput = document.getElementById("product-sku")

  if (productNameInput && productSkuInput) {
    productNameInput.addEventListener("input", function () {
      if (!productSkuInput.value) {
        // Auto-generate SKU from product name
        const sku =
          this.value
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "")
            .substring(0, 8) + Date.now().toString().slice(-3)
        productSkuInput.value = sku
      }
    })
  }

  // Form submission
  const addProductForm = document.getElementById("add-product-form")

  if (addProductForm) {
    console.log("Form found, adding submit event listener")

    addProductForm.addEventListener("submit", (e) => {
      e.preventDefault()
      console.log("Form submitted")

      // Get required fields
      const name = document.getElementById("product-name").value
      const sku = document.getElementById("product-sku").value
      const description = document.getElementById("product-description").value
      const category = document.getElementById("product-category").value
      const regularPrice = document.getElementById("regular-price").value
      const stock = document.getElementById("product-stock").value

      // Validate required fields
      if (!name || !sku || !description || !category || !regularPrice || !stock) {
        alert("Please fill in all required fields!")
        console.log("Missing required fields")
        return
      }

      // Create product object
      const product = {
        id: Date.now(),
        name: name,
        sku: sku,
        description: description,
        category: category,
        regularPrice: regularPrice,
        stock: Number.parseInt(stock),
        status: document.getElementById("product-status").value,
        visibility: document.getElementById("visibility").value,
        featured: document.getElementById("featured-product").checked,
        trackQuantity: document.getElementById("track-quantity").checked,
        lowStockThreshold: Number.parseInt(document.getElementById("low-stock-threshold").value) || 10,
        salePrice: document.getElementById("sale-price").value || "",
        costPrice: document.getElementById("cost-price").value || "",
        taxClass: document.getElementById("tax-class").value,
        images: uploadedImages,
        createdAt: new Date().toISOString(),
      }

      console.log("Product data:", product)

      // Get existing products from localStorage
      let products = []
      try {
        const storedProducts = localStorage.getItem("products")
        if (storedProducts) {
          products = JSON.parse(storedProducts)
        }
      } catch (error) {
        console.error("Error parsing stored products:", error)
      }

      // Check for duplicate SKU
      if (products.some((p) => p.sku === product.sku)) {
        alert("A product with this SKU already exists!")
        return
      }

      // Add new product
      products.push(product)

      // Save to localStorage
      try {
        localStorage.setItem("products", JSON.stringify(products))
        console.log("Product saved to localStorage")

        // Show success message
        alert("Product published successfully!")

        // Reset form
        addProductForm.reset()
        imagePreviews.innerHTML = ""
        uploadedImages = []

        // Redirect to products page
        window.location.href = "../productPage/product-page.html"
      } catch (error) {
        console.error("Error saving to localStorage:", error)
        alert("Error saving product. Please try again.")
      }
    })
  } else {
    console.error("Form not found!")
  }

  // Save draft button
  const saveDraftBtn = document.getElementById("save-draft")

  if (saveDraftBtn) {
    saveDraftBtn.addEventListener("click", () => {
      console.log("Save draft clicked")

      // Get product name (minimum required field)
      const name = document.getElementById("product-name").value
      if (!name) {
        alert("Product name is required even for drafts!")
        return
      }

      // Create draft product object
      const product = {
        id: Date.now(),
        name: name,
        sku: document.getElementById("product-sku").value || "DRAFT-" + Date.now(),
        description: document.getElementById("product-description").value || "",
        category: document.getElementById("product-category").value || "General",
        regularPrice: document.getElementById("regular-price").value || "0",
        stock: Number.parseInt(document.getElementById("product-stock").value) || 0,
        status: "draft",
        images: uploadedImages,
        createdAt: new Date().toISOString(),
      }

      console.log("Draft product data:", product)

      // Get existing products
      let products = []
      try {
        const storedProducts = localStorage.getItem("products")
        if (storedProducts) {
          products = JSON.parse(storedProducts)
        }
      } catch (error) {
        console.error("Error parsing stored products:", error)
      }

      // Add draft product
      products.push(product)

      // Save to localStorage
      try {
        localStorage.setItem("products", JSON.stringify(products))
        console.log("Draft saved to localStorage")

        // Show success message
        alert("Product saved as draft!")

        // Reset form
        addProductForm.reset()
        imagePreviews.innerHTML = ""
        uploadedImages = []
      } catch (error) {
        console.error("Error saving draft:", error)
        alert("Error saving draft. Please try again.")
      }
    })
  }
})
