const cart = JSON.parse(localStorage.getItem("cart")) || [];
const businessUEN = JSON.parse(localStorage.getItem("businessId")) || [];

window.onload = function () {
  renderCart();
  updateTotals();
};

// Function to create and append a cart item element
function renderCart() {
  // Desktop cart items
  renderCartItems("cart-items");
  // Mobile cart items
  renderCartItems("mobile-cart-items");
}

function renderCartItems(containerId) {
  const cartDiv = document.getElementById(containerId);
  if (!cartDiv) return; // Skip if element doesn't exist

  cartDiv.innerHTML = ""; // Clear previous cart items

  cart.forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "cart-item";

    const itemContainer = document.createElement("div");
    itemContainer.className = "item-container";

    const name = document.createElement("span");
    name.textContent = `${item.name} - $${item.price.toFixed(2)}`;

    const quantityDiv = document.createElement("div");
    quantityDiv.className = "quantity-control";

    const decreaseButton = document.createElement("button");
    decreaseButton.textContent = "-";
    decreaseButton.className = "quantity-btn minus-btn";
    decreaseButton.onclick = () => changeQuantity(item.name, -1);

    const quantity = document.createElement("span");
    quantity.textContent = item.quantity;

    const increaseButton = document.createElement("button");
    increaseButton.textContent = "+";
    increaseButton.className = "quantity-btn plus-btn";
    increaseButton.onclick = () => changeQuantity(item.name, 1);

    quantityDiv.appendChild(decreaseButton);
    quantityDiv.appendChild(quantity);
    quantityDiv.appendChild(increaseButton);

    itemContainer.appendChild(name);
    itemContainer.appendChild(quantityDiv);
    itemDiv.appendChild(itemContainer);
    cartDiv.appendChild(itemDiv);
  });
}

function changeQuantity(name, delta) {
  const item = cart.find((item) => item.name === name);
  const itemIndex = cart.findIndex((item) => item.name === name);
  if (item) {
    item.quantity += delta;

    if (item.quantity <= 0) {
      cart.splice(itemIndex, 1);
    }
  }

  localStorage.setItem("cart", JSON.stringify(cart)); // Update localStorage
  renderCart(); // Re-render the cart
  updateTotals();

  if (cart.length === 0) {
    showStatusPopup("Your cart is empty, returning you to homepage", false);
    setTimeout(() => {
      window.location.replace("home.html");
    }, 3000)
  }
}

// Function to update total quantity and price
function updateTotals() {
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  // Update desktop totals
  updateElementText("total-quantity", `Total Items in Cart: ${totalQuantity}`);
  updateElementText("total-price", `Total Price: $${totalPrice.toFixed(2)}`);

  // Update mobile totals
  updateElementText(
    "mobile-total-quantity",
    `Total Items in Cart: ${totalQuantity}`
  );
  updateElementText(
    "mobile-total-price",
    `Total Price: $${totalPrice.toFixed(2)}`
  );

  setupOrderNowButtons();
}

// Helper function to safely update element text
function updateElementText(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = text;
  }
}

// Function to set up the Order Now buttons
function setupOrderNowButtons() {
  // Set up click handlers for both desktop and mobile checkout buttons
  const checkoutButtons = document.querySelectorAll(".cart-btn");
  checkoutButtons.forEach((button) => {
    if (!button.classList.contains("secondary")) {
      // Only add to primary checkout buttons
      button.addEventListener("click", (e) => {
        e.preventDefault()
        // Check if there are items in the cart (stored in localStorage)
        const cart = JSON.parse(localStorage.getItem("cart"));

        if (cart && cart.length > 0) {
          // Proceed with placing the order if there are items in the cart
          showStatusPopup("Order placed!", true);
          setTimeout(() => {
            window.location.replace("order.html");
          }, 3000)
          
        } else {
          // Notify the user if the cart is empty
          showStatusPopup("Your cart is empty. Please add items to the cart first.", false)
          setTimeout(() => {
            window.location.replace("home.html");
          }, 3000)
        }
      });
    }
  });
}

function showStatusPopup(message, isSuccess = true) {
  // Remove any existing popup
  const existingPopup = document.querySelector('.status-popup');
  if (existingPopup) {
    existingPopup.remove();
  }

  // Create new popup element
  const popup = document.createElement('div');
  popup.className = `status-popup ${isSuccess ? 'success' : 'error'}`;
  popup.textContent = message;

  // Add popup to the document
  document.body.appendChild(popup);

  // Trigger reflow to ensure transition works
  popup.offsetHeight;

  // Show the popup
  setTimeout(() => {
    popup.classList.add('show');
  }, 10);

  // Hide the popup after 3 seconds
  setTimeout(() => {
    popup.classList.remove('show');
    setTimeout(() => {
      popup.remove();
    }, 300); // Wait for fade out transition to complete
  }, 3000);
}
