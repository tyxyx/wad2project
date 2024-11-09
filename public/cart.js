const cart = JSON.parse(localStorage.getItem("cart")) || [];
const businessUEN = JSON.parse(localStorage.getItem("businessId")) || [];

window.onload = function () {
  
  renderCart();
  // Update totals display
  updateTotals();
  
};

// Function to create and append a cart item element
function renderCart() {
  
  const cartDiv = document.getElementById('cart-items');
    cartDiv.innerHTML = ''; // Clear previous cart items

    cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';

     
      
      const itemContainer = document.createElement("div");
      itemContainer.className = "item-container";

      const name = document.createElement("span");
      name.textContent = `${item.name} - $${item.price.toFixed(2)}`;

      const quantityDiv = document.createElement("div");
      quantityDiv.className = "quantity-control";

        const decreaseButton = document.createElement('button');
        decreaseButton.textContent = '-';
        decreaseButton.onclick = () => changeQuantity(item.name, -1);

        const quantity = document.createElement('span');
        quantity.textContent = item.quantity;

        const increaseButton = document.createElement('button');
        increaseButton.textContent = '+';
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

    if ((item.quantity <= 0)) {
      cart.splice(itemIndex, 1);
    }

  }
      localStorage.setItem("cart", JSON.stringify(cart)); // Update localStorage
      renderCart(); // Re-render the cart
  updateTotals();
  if (cart.length == 0) {
    alert("Your cart is empty, returning you to homepage");
    window.location.replace("home.html");
  }
    
  }

  // Function to update total quantity and price
  function updateTotals() {
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

    setupOrderNowButton();
  }

  // Function to set up the Order Now button
  function setupOrderNowButton() {
    document.getElementById("order-btn").addEventListener("click", () => {
      alert("Order placed!");
      window.location.replace("order.html");
    
    });
  }