const serverBaseURL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8080"
    : "https://server-project-web.vercel.app";


document.addEventListener("DOMContentLoaded", async function () {
  const cartItemsContainer = document.querySelector(".cart-items");
  if (!cartItemsContainer) return;

  function getCartId() {
    const token = localStorage.getItem("accessToken");
    if (!token) return localStorage.getItem("cartId");

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.cartId || payload.cid || payload.cart_id || localStorage.getItem("cartId");
    } catch (e) {
      return localStorage.getItem("cartId");
    }
  }

  async function fetchCartItems() {
    const cartId = getCartId();
    if (!cartId) return renderEmptyCart();

    const continueBtn = document.querySelector(".summary-btn");
    if (continueBtn) {
      continueBtn.addEventListener("click", function (e) {
        e.preventDefault();
        // Kiểm tra đã đồng ý điều khoản chưa
        const agree = document.getElementById("agree");
        if (!agree || !agree.checked) {
          alert("Bạn cần đồng ý với điều khoản trước khi tiếp tục!");
          return;
        }
        const pathParts = window.location.pathname.split('/');
        const srcIndex = pathParts.indexOf('src');
        const baseURL = srcIndex !== -1 ? pathParts.slice(0, srcIndex + 1).join('/') + '/' : '/';
        window.location.href = baseURL + "pages/checkoutPage/checkoutPage.html";
      });
    }

    try {
      const response = await fetch(`${serverBaseURL}/cart-details/${cartId}`, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
        }
      });

      if (!response.ok) throw new Error("Failed to fetch cart");
      const items = await response.json();
      renderCart(items);
    } catch (err) {
      console.error("Error fetching cart:", err);
      renderEmptyCart();
    }
  }

  function renderEmptyCart() {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <p>Cart is empty</p>
        <a href="../filterAndSearch/filterAndSearch.html" class="continue-shopping">
          Continue Shopping
        </a>
      </div>
    `;
  }

  function renderCart(cart) {
    cartItemsContainer.innerHTML = "";
    if (!cart || cart.length === 0) return renderEmptyCart();

    cart.forEach((item, index) => {
      const cartItemHTML = `
        <div class="cart-item mb-3 d-flex align-items-start gap-3 border-bottom pb-3" 
             data-index="${index}"
             data-product-id="${item.product_id}"
             data-size="${item.size}"
             data-color="${item.color}">

          <img class="cart-item-img" src="${item.image_url}" alt="${item.name || 'Product'}">
          <div class="cart-item-info">
            <div class="cart-item-title text-muted small mb-1">${item.type || ""}</div>
            <div class="cart-item-name fw-semibold mb-2">${item.product_name || item.name || "Unnamed Product"}</div>
            <div class="cart-item-options mb-2">
              <span class="cart-item-size badge bg-light text-dark border">${item.size || ""}</span>
              ${item.color ? `<span class="cart-item-color ms-2" style="background:${item.color};"></span>` : ""}
            </div>
            <div class="cart-item-qty d-flex align-items-center gap-2 mb-2">
              <button class="minus-btn btn btn-outline-secondary btn-sm px-2">-</button>
              <input type="text" value="${item.quantity}" readonly class="form-control form-control-sm text-center" style="width:40px;">
              <button class="plus-btn btn btn-outline-secondary btn-sm px-2">+</button>
            </div>
            <div class="cart-item-price fw-bold fs-6">$${item.price}</div>
          </div>
          <button class="cart-item-remove btn btn-link text-danger fs-4 ms-2" title="Remove">&times;</button>
        </div>`;
      cartItemsContainer.insertAdjacentHTML("beforeend", cartItemHTML);
    });

    setupEventListeners(cart);
    updateSummary(cart);
  }

  function setupEventListeners(cart) {
    document.querySelectorAll(".cart-item").forEach(function (itemEl, idx) {
      const minusBtn = itemEl.querySelector(".minus-btn");
      const plusBtn = itemEl.querySelector(".plus-btn");
      const qtyInput = itemEl.querySelector("input");
      const removeBtn = itemEl.querySelector(".cart-item-remove");

      const item = cart[idx];

      minusBtn.addEventListener("click", async function () {
        let val = parseInt(qtyInput.value);
        if (val > 1) {
          await updateCartItemQuantity(item, val - 1);
          fetchCartItems();
        }
      });

      plusBtn.addEventListener("click", async function () {
        let val = parseInt(qtyInput.value);
        await updateCartItemQuantity(item, val + 1);
        fetchCartItems();
      });

      removeBtn.addEventListener("click", async function () {
        const cartId = getCartId();
        const productId = itemEl.dataset.productId;
        const size = itemEl.dataset.size;
        const color = itemEl.dataset.color;

        await removeCartItem(cartId, productId, size, color);
        fetchCartItems();
      });
    });
  }

  async function updateCartItemQuantity(item, newQty) {
    const cartId = getCartId();
    if (!cartId) return;
    try {
      const response = await fetch(
        `http://localhost:8080/cart-details/${cartId}/${item.product_id}/${item.size}/${item.color}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
          },
          body: JSON.stringify({ quantity: newQty })
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to update quantity:", errorData);
      }
    } catch (err) {
      console.error("Failed to update quantity", err);
    }
  }

  async function removeCartItem(cartId, productId, size, color) {
    if (!cartId) {
      console.error("No cartId found");
      return;
    }
    try {
      const res = await fetch(`http://localhost:8080/cart-details/${cartId}/${productId}/${size}/${color}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
        }
      });
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Failed to remove item:", errorData);
      } else {
        console.log("Item removed successfully");
      }
    } catch (err) {
      console.error("Failed to remove item", err);
    }
  }


  function updateSummary(cart) {
    let subtotal = 0;
    cart.forEach(item => subtotal += item.quantity * item.price);

    const shipping = subtotal > 0 ? 10 : 0;
    const total = subtotal + shipping;

    document.querySelector(".summary-row span:last-child").textContent = `$${subtotal}`;
    document.querySelectorAll(".summary-row span")[3].textContent = `$${shipping}`;
    document.querySelector(".summary-total span:last-child").textContent = `$${total}`;

    const continueBtn = document.querySelector(".summary-btn");
    if (continueBtn) continueBtn.disabled = subtotal === 0;
  }

  fetchCartItems();
});