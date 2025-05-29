document.addEventListener("DOMContentLoaded", () => {
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

  fileInput.addEventListener("change", function () {
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
              // Remove from uploadedImages array
              uploadedImages = uploadedImages.filter((_, i) => i !== index)
            })

            previewContainer.appendChild(img)
            previewContainer.appendChild(removeBtn)
            imagePreviews.appendChild(previewContainer)

            // Store image data
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

  // Form submission
  const addProductForm = document.getElementById("add-product-form")

  addProductForm.addEventListener("submit", (e) => {
    e.preventDefault()

    // Collect form data
    const formData = {
      id: Date.now(), // Simple ID generation
      name: document.getElementById("product-name").value,
      sku: document.getElementById("product-sku").value,
      barcode: document.getElementById("product-barcode").value,
      description: document.getElementById("product-description").value,
      regularPrice: document.getElementById("regular-price").value,
      salePrice: document.getElementById("sale-price").value,
      costPrice: document.getElementById("cost-price").value,
      taxClass: document.getElementById("tax-class").value,
      status: document.getElementById("product-status").value,
      visibility: document.getElementById("visibility").value,
      images: uploadedImages.map(img => ({ data: img.data || img })),
      category: "General", // Default category
      stock: Math.floor(Math.random() * 100) + 1, // Random stock for demo
      createdAt: new Date().toISOString(),
    }

    // Validate required fields
    if (!formData.name || !formData.sku || !formData.description || !formData.regularPrice) {
      alert("Please fill in all required fields!")
      return
    }

    // Get existing products from localStorage
    const products = JSON.parse(localStorage.getItem("products")) || []

    // Check if SKU already exists
    if (products.some((product) => product.sku === formData.sku)) {
      alert("SKU already exists! Please use a different SKU.")
      return
    }

    // Add new product
    products.push(formData)

    // Save to localStorage
    localStorage.setItem("products", JSON.stringify(products))

    // Show success message
    alert("Product published successfully!")

    // Reset form
    addProductForm.reset()
    imagePreviews.innerHTML = ""
    uploadedImages = []

    // Redirect to products page
    window.location.href = "../productPage/product-page.html"
  })

  // Save draft button
  const saveDraftBtn = document.getElementById("save-draft")

  saveDraftBtn.addEventListener("click", () => {
    // Collect form data
    const formData = {
      id: Date.now(),
      name: document.getElementById("product-name").value,
      sku: document.getElementById("product-sku").value,
      barcode: document.getElementById("product-barcode").value,
      description: document.getElementById("product-description").value,
      regularPrice: document.getElementById("regular-price").value,
      salePrice: document.getElementById("sale-price").value,
      costPrice: document.getElementById("cost-price").value,
      taxClass: document.getElementById("tax-class").value,
      status: "draft", // Force draft status
      visibility: document.getElementById("visibility").value,
      images: uploadedImages,
      category: "General",
      stock: Math.floor(Math.random() * 100) + 1,
      createdAt: new Date().toISOString(),
    }

    // Validate required fields for draft
    if (!formData.name) {
      alert("Product name is required even for drafts!")
      return
    }

    // Get existing products from localStorage
    const products = JSON.parse(localStorage.getItem("products")) || []

    // Add new draft product
    products.push(formData)

    // Save to localStorage
    localStorage.setItem("products", JSON.stringify(products))

    alert("Product saved as draft!")

    // Reset form
    addProductForm.reset()
    imagePreviews.innerHTML = ""
    uploadedImages = []
  })
})
