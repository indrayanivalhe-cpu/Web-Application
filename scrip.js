const products = [
  {
    id: 1,
    name: "Air Pro Headphones",
    category: "electronics",
    price: 129.99,
    emoji: "🎧",
    description: "Wireless noise-cancelling headphones."
  },
  {
    id: 2,
    name: "Smart Watch X",
    category: "electronics",
    price: 89.99,
    emoji: "⌚",
    description: "Fitness tracking and smart notifications."
  },
  {
    id: 3,
    name: "Minimal Sneakers",
    category: "fashion",
    price: 74.99,
    emoji: "👟",
    description: "Comfortable everyday sneakers."
  },
  {
    id: 4,
    name: "Classic Backpack",
    category: "fashion",
    price: 49.99,
    emoji: "🎒",
    description: "Stylish backpack for work and travel."
  },
  {
    id: 5,
    name: "Ceramic Coffee Set",
    category: "home",
    price: 34.99,
    emoji: "☕",
    description: "Beautiful ceramic cups for your morning."
  },
  {
    id: 6,
    name: "Modern Desk Lamp",
    category: "home",
    price: 44.99,
    emoji: "💡",
    description: "Elegant LED lamp with adjustable brightness."
  },
  {
    id: 7,
    name: "Portable Speaker",
    category: "electronics",
    price: 59.99,
    emoji: "🔊",
    description: "Compact speaker with powerful sound."
  },
  {
    id: 8,
    name: "Cotton Hoodie",
    category: "fashion",
    price: 54.99,
    emoji: "🧥",
    description: "Soft premium cotton everyday hoodie."
  }
];

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let orders = JSON.parse(localStorage.getItem("orders")) || [];
let currentCategory = "all";

function formatPrice(price) {
  return "$" + price.toFixed(2);
}

function renderProducts() {
  const grid = document.getElementById("productsGrid");
  const search = document.getElementById("searchInput").value.toLowerCase();

  const filtered = products.filter(product => {
    const categoryMatch =
      currentCategory === "all" ||
      product.category === currentCategory;

    const searchMatch =
      product.name.toLowerCase().includes(search) ||
      product.description.toLowerCase().includes(search);

    return categoryMatch && searchMatch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<p class="empty">No products found.</p>`;
    return;
  }

  grid.innerHTML = filtered.map(product => `
    <article class="product-card">
      <div class="product-image">${product.emoji}</div>

      <div class="product-info">
        <span class="product-category">${product.category}</span>

        <h3>${product.name}</h3>

        <p>${product.description}</p>

        <div class="product-bottom">
          <span class="price">${formatPrice(product.price)}</span>

          <button
            class="add-btn"
            onclick="addToCart(${product.id})"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  `).join("");
}

function filterProducts(category, button) {
  currentCategory = category;

  document.querySelectorAll(".category").forEach(btn => {
    btn.classList.remove("active");
  });

  button.classList.add("active");

  renderProducts();
}

function addToCart(productId) {
  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      id: productId,
      quantity: 1
    });
  }

  saveCart();
  updateCart();
  showToast("Product added to cart!");
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);

  saveCart();
  updateCart();
}

function changeQuantity(productId, amount) {
  const item = cart.find(item => item.id === productId);

  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  saveCart();
  updateCart();
}

function getCartTotal() {
  return cart.reduce((total, item) => {
    const product = products.find(p => p.id === item.id);
    return total + product.price * item.quantity;
  }, 0);
}

function getCartCount() {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

function updateCart() {
  const container = document.getElementById("cartItems");
  const total = getCartTotal();

  document.getElementById("cartCount").textContent = getCartCount();
  document.getElementById("cartTotal").textContent = formatPrice(total);
  document.getElementById("checkoutTotal").textContent = formatPrice(total);

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <p>Your cart is empty.</p>
        <p>Add some products to get started.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = cart.map(item => {
    const product = products.find(p => p.id === item.id);

    return `
      <div class="cart-item">
        <div class="cart-item-image">${product.emoji}</div>

        <div>
          <h4>${product.name}</h4>
          <small>${formatPrice(product.price)}</small>

          <div class="quantity">
            <button onclick="changeQuantity(${product.id}, -1)">−</button>
            <span>${item.quantity}</span>
            <button onclick="changeQuantity(${product.id}, 1)">+</button>
          </div>

          <div
            class="remove"
            onclick="removeFromCart(${product.id})"
          >
            Remove
          </div>
        </div>

        <strong>
          ${formatPrice(product.price * item.quantity)}
        </strong>
      </div>
    `;
  }).join("");
}

function openCart() {
  updateCart();
  document.getElementById("cartOverlay").classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeCart(event) {
  if (!event || event.target.id === "cartOverlay") {
    document.getElementById("cartOverlay").classList.remove("show");
    document.body.style.overflow = "";
  }
}

function openCheckout() {
  if (cart.length === 0) {
    showToast("Your cart is empty.");
    return;
  }

  document.getElementById("checkoutTotal").textContent =
    formatPrice(getCartTotal());

  document.getElementById("checkoutOverlay").classList.add("show");
}

function closeCheckout() {
  document.getElementById("checkoutOverlay").classList.remove("show");
}

function placeOrder(event) {
  event.preventDefault();

  const order = {
    id: "SE-" + Math.floor(100000 + Math.random() * 900000),
    date: new Date().toLocaleDateString(),
    customer: document.getElementById("customerName").value,
    total: getCartTotal(),
    items: getCartCount(),
    payment: document.getElementById("paymentMethod").value,
    status: "Order Confirmed"
  };

  orders.unshift(order);

  localStorage.setItem("orders", JSON.stringify(orders));

  cart = [];
  saveCart();

  document.getElementById("checkoutForm").reset();

  closeCheckout();
  closeCart();
  updateCart();
  renderOrders();

  showToast("🎉 Order placed successfully!");

  document.getElementById("orders").scrollIntoView({
    behavior: "smooth"
  });
}

function renderOrders() {
  const container = document.getElementById("ordersList");

  if (orders.length === 0) {
    container.innerHTML = `
      <p class="empty">You haven't placed any orders yet.</p>
    `;
    return;
  }

  container.innerHTML = orders.map(order => `
    <div class="order-card">
      <div>
        <strong>Order #${order.id}</strong>
        <p>${order.date} · ${order.items} item(s)</p>
        <p>${order.payment}</p>
      </div>

      <div>
        <strong>${formatPrice(order.total)}</strong>
        <p class="order-status">● ${order.status}</p>
      </div>
    </div>
  `).join("");
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function showToast(message) {
  const toast = document.getElementById("toast");

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  updateCart();
  renderOrders();
});
