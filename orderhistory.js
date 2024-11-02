import { auth, db } from "./database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

let email = "";
let ordersData = [];
let current = false;

// Check authentication state
onAuthStateChanged(auth, async (user) => {
    if (user) {
        email = user.email;
        await fetchOrderHistory();
    } else {
        redirectToLogin();
    }
});

// Event listeners for Pending and Finished tabs
document.getElementById("pendingTab").addEventListener("click", () => {
    showOrders(false);
    current = false;
});

document.getElementById("finishedTab").addEventListener("click", () => {
    showOrders(true);
    current = true;
});

// JavaScript to toggle active state between the tabs
document.getElementById("pendingTab").addEventListener("click", () => {
  document.getElementById("pendingTab").classList.add("active");
  document.getElementById("finishedTab").classList.remove("active");
  showOrders(false); // Adjusted function to display pending orders
});

document.getElementById("finishedTab").addEventListener("click", () => {
  document.getElementById("finishedTab").classList.add("active");
  document.getElementById("pendingTab").classList.remove("active");
  showOrders(true); // Adjusted function to display finished orders
});


// Fetch order history from Firestore
async function fetchOrderHistory() {
    const userPath = `userLogin/${email}/orderHistory/`;
    const ordersRef = collection(db, userPath);
    const querySnapshot = await getDocs(ordersRef);

    // Populate ordersData array
    ordersData = querySnapshot.docs.map((doc) => ({
        orderId: doc.id,
        ...doc.data(),
    }));

    // Show pending orders by default
    showOrders(false);
}

// Show either pending or finished orders based on status
function showOrders(status) {
    const ordersContainer = document.getElementById("ordersContainer");
    const orderDetails = document.getElementById("orderDetails");

    // Reset view to show orders list and hide details
    ordersContainer.style.display = "block";
    orderDetails.style.display = "none";
    ordersContainer.innerHTML = ""; // Clear previous orders

    // Filter orders by status
    const filteredOrders = ordersData.filter((order) => order.status === status);

    // Display each order in the filtered list
    filteredOrders.forEach((order) => {
        const orderItem = document.createElement("a");
        orderItem.className = "list-group-item list-group-item-action";
        orderItem.textContent = `Order ID: ${order.orderId} - Total: $${order.amount}`;
        orderItem.onclick = () => showOrderDetails(order);
        ordersContainer.appendChild(orderItem);
    });
    
    clearOrderDetails();
}

// Show details for a specific order
function showOrderDetails(order) {
    const ordersContainer = document.getElementById("ordersContainer");
    const orderDetails = document.getElementById("orderDetails");
    const orderDetailsContent = document.getElementById("orderDetailsContent");

    // Clear existing content
    orderDetailsContent.innerHTML = "";

    // Create order ID element
    const orderIdElement = document.createElement("h5");
    orderIdElement.textContent = `Order ID: ${order.orderId}`;
    orderDetailsContent.appendChild(orderIdElement);

    // Create status element
    const statusElement = document.createElement("p");
    statusElement.textContent = `Status: ${order.status ? "Finished" : "Pending"}`;
    orderDetailsContent.appendChild(statusElement);

    // Create items purchased header
    const itemsHeader = document.createElement("h6");
    itemsHeader.textContent = "Items Purchased:";
    orderDetailsContent.appendChild(itemsHeader);

    // Create unordered list for items
    const itemsList = document.createElement("ul");
    order.items.forEach((item) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${item.name} - Price: $${item.price}, Quantity: ${item.quantity}`;
        itemsList.appendChild(listItem);
    });
    orderDetailsContent.appendChild(itemsList);

    // Create total amount element
    const totalAmountElement = document.createElement("p");
    totalAmountElement.textContent = `Total Price: $${order.amount}`;
    orderDetailsContent.appendChild(totalAmountElement);

    // Create Back to History button
    const showOrdersButton = document.createElement("button");
    showOrdersButton.id = "showOrdersButton";
    showOrdersButton.className = "btn btn-secondary mt-3";
    showOrdersButton.textContent = "Back to History";
    orderDetailsContent.appendChild(showOrdersButton);

    // Ensure orderDetails appears at the top by setting margin to 0
    ordersContainer.style.display = "none";
    orderDetails.style.display = "block";
    orderDetails.style.marginTop = "0"; // Ensures it appears directly below the buttons

    // Event listener for "Back to History" button
    showOrdersButton.addEventListener("click", () => {
        orderDetails.style.display = "none";
        ordersContainer.style.display = "block";
    });
}

// Clear order details content
function clearOrderDetails() {
    const orderDetailsContent = document.getElementById("orderDetailsContent");
    orderDetailsContent.innerHTML = ""; // Clear content
    const orderDetails = document.getElementById("orderDetails");
    orderDetails.style.display = "none"; // Hide the details section
}

// Redirect to login if user is not authenticated
function redirectToLogin() {
    window.location.href = "./login.html?mode=login";
}
