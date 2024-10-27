window.onload = function () {
  loadCartItems();
  setupOrderNowButton();
};

// Function to load cart items and display them
function loadCartItems() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartContainer = document.getElementById("cart-items");

  // Clear previous items
  cartContainer.innerHTML = "";

  cart.forEach((item) => {
    createCartItemElement(item, cartContainer);
  });

  // Update totals display
  updateTotals(cart);
}

// Function to create and append a cart item element
function createCartItemElement(item, cartContainer) {
  const itemElement = document.createElement("div");
  itemElement.classList.add("cart-item");

  // Item name and price
  const itemInfo = document.createElement("span");
  itemInfo.textContent = `${item.name}: $${item.price.toFixed(2)}`;

  // Quantity input
  const quantityInput = document.createElement("input");
  quantityInput.type = "number";
  quantityInput.value = item.quantity;
  quantityInput.min = 0;
  quantityInput.classList.add("quantity-input", "me-2");

  // Update quantity event listener
  quantityInput.addEventListener("change", () => {
    const newQuantity = parseInt(quantityInput.value);
    if (newQuantity >= 0) {
      item.quantity = newQuantity;
      localStorage.setItem("cart", JSON.stringify(cart)); // Update cart in localStorage
      updateTotals(cart); // Update totals after changing quantity
    }
  });

  // Append elements to item element
  itemElement.appendChild(itemInfo);
  itemElement.appendChild(quantityInput);
  cartContainer.appendChild(itemElement);
}

// Function to update total quantity and price
function updateTotals(cart) {
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  document.getElementById(
    "total-quantity"
  ).textContent = `Total Items in Cart: ${totalQuantity}`;
  document.getElementById(
    "total-price"
  ).textContent = `Total Price: $${totalPrice.toFixed(2)}`;
}

// Function to set up the Order Now button
function setupOrderNowButton() {
  document.getElementById("order-now").addEventListener("click", () => {
    // Logic for ordering can go here (e.g., redirecting to checkout page)
    alert("Order placed!");
  });
}