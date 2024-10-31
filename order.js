const cart = JSON.parse(localStorage.getItem("cart")) || [];

// Function to render the order summary
function renderOrderSummary() {
  const orderSummaryDiv = document.getElementById("order-summary");
  orderSummaryDiv.innerHTML = ""; // Clear previous summary

  if (cart.length === 0) {
    orderSummaryDiv.textContent = "Your cart is empty.";
    return;
  }

  cart.forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.textContent = `${item.name} - $${item.price.toFixed(2)} x ${
      item.quantity
    }`;
    orderSummaryDiv.appendChild(itemDiv);
  });

  // Update total price
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  document.getElementById(
    "total-price"
  ).textContent = `Total Price: $${totalPrice.toFixed(2)}`;

  const uniqueOrderId =
    "ORD" + Date.now() + Math.random().toString(36).slice(2, 5);
  document.getElementById("orderId").textContent =
    "Order Id : " + uniqueOrderId;

  //cart alr in local storage, added total price and unique order
  //to access local storage use this command 
  //const cart = JSON.parse(localStorage.getItem("cart")) || [];
  localStorage.setItem("totalPrice", JSON.stringify(totalPrice));
  localStorage.setItem("uniqueOrderId", JSON.stringify(uniqueOrderId));
}

// Set up event listener for the back to shop button
document.getElementById("back-to-shop").addEventListener("click", () => {
  window.location.replace("index.html"); // Redirect back to the shop page
});

// Render the order summary on page load
window.onload = renderOrderSummary;
