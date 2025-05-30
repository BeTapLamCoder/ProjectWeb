const serverBaseURL =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:8080"
        : "https://server-project-web.vercel.app";
document.addEventListener("DOMContentLoaded", () => {
  console.log("Add product page loaded");

  // Toggle sidebar
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const adminContainer = document.querySelector(".admin-container");

  if (sidebarToggle && adminContainer) {
    sidebarToggle.addEventListener("click", () => {
      adminContainer.classList.toggle("sidebar-collapsed");
    });
  }

  // Image upload preview
  const fileInput = document.getElementById("product-images");
  const imagePreviews = document.getElementById("image-previews");
  let uploadedImages = [];

  if (fileInput && imagePreviews) {
    fileInput.addEventListener("change", function () {
      console.log("File input changed");
      imagePreviews.innerHTML = "";
      uploadedImages = [];

      if (this.files) {
        Array.from(this.files).forEach((file, index) => {
          if (file.type.match("image.*")) {
            const reader = new FileReader();

            reader.onload = (e) => {
              const previewContainer = document.createElement("div");
              previewContainer.className = "image-preview";
              previewContainer.style.cssText = `
                position: relative;
                display: inline-block;
                margin: 10px;
                border: 1px solid #ddd;
                border-radius: 8px;
                overflow: hidden;
              `;

              const img = document.createElement("img");
              img.src = e.target.result;
              img.alt = file.name;
              img.style.cssText = `
                width: 100px;
                height: 100px;
                object-fit: cover;
                display: block;
              `;

              const removeBtn = document.createElement("button");
              removeBtn.className = "remove-image";
              removeBtn.innerHTML = '<span class="material-symbols-outlined">close</span>';
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
              `;

              removeBtn.addEventListener("click", (e) => {
                e.preventDefault();
                previewContainer.remove();
                uploadedImages = uploadedImages.filter((_, i) => i !== index);
              });

              previewContainer.appendChild(img);
              previewContainer.appendChild(removeBtn);
              imagePreviews.appendChild(previewContainer);

              uploadedImages.push({
                name: file.name,
                data: e.target.result,
              });
            };

            reader.readAsDataURL(file);
          }
        });
      }
    });
  }

  // Form submission
  const addProductForm = document.getElementById("add-product-form");

  if (addProductForm) {
    console.log("Form found, adding submit event listener");

    addProductForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Lấy dữ liệu từ form
      const name = document.getElementById("product-name").value;
      const description = document.getElementById("product-description").value;
      const category = document.getElementById("product-category").value;
      const price = document.getElementById("regular-price").value;
      const isActive = document.getElementById("product-status").value === "true";

      // Validate
      if (!name || !description || !category || !price) {
        alert("Please fill in all required fields!");
        return;
      }

      // Chuẩn bị FormData để gửi file
      const formData = new FormData();
      formData.append("product_name", name);
      formData.append("description", description);
      formData.append("category_id", category);
      formData.append("price", price);
      formData.append("is_active", isActive);

      // Lấy file ảnh đầu tiên (nếu có)
      const fileInput = document.getElementById("product-images");
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        formData.append("image", fileInput.files[0]);
      } else {
        alert("Please select an image for the product!");
        return;
      }

      try {
        const response = await fetch(`${serverBaseURL}/products`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to create product");
        }

        alert("Product published successfully!");
        addProductForm.reset();
        imagePreviews.innerHTML = "";
        uploadedImages = [];
        window.location.href = "../productPage/product-page.html";
      } catch (error) {
        console.error("Error creating product:", error);
        alert("Error creating product: " + error.message);
      }
    });
  } else {
    console.error("Form not found!");
  }

  // Save draft button
  const saveDraftBtn = document.getElementById("save-draft");

  if (saveDraftBtn) {
    saveDraftBtn.addEventListener("click", () => {
      console.log("Save draft clicked");

      // Get product name (minimum required field)
      const name = document.getElementById("product-name").value;
      if (!name) {
        alert("Product name is required even for drafts!");
        return;
      }

      // Create draft product object (KHÔNG CẦN SKU)
      const product = {
        id: Date.now(),
        name: name,
        description: document.getElementById("product-description").value || "",
        category: document.getElementById("product-category").value || "General",
        regularPrice: document.getElementById("regular-price").value || "0",
        stock: Number.parseInt(document.getElementById("product-stock").value) || 0,
        status: "draft",
        images: uploadedImages,
        createdAt: new Date().toISOString(),
      };

      console.log("Draft product data:", product);

      // Get existing products
      let products = [];
      try {
        const storedProducts = localStorage.getItem("products");
        if (storedProducts) {
          products = JSON.parse(storedProducts);
        }
      } catch (error) {
        console.error("Error parsing stored products:", error);
      }

      // Add draft product
      products.push(product);

      // Save to localStorage
      try {
        localStorage.setItem("products", JSON.stringify(products));
        console.log("Draft saved to localStorage");

        // Show success message
        alert("Product saved as draft!");

        // Reset form
        addProductForm.reset();
        imagePreviews.innerHTML = "";
        uploadedImages = [];
      } catch (error) {
        console.error("Error saving draft:", error);
        alert("Error saving draft. Please try again.");
      }
    });
  }
});
