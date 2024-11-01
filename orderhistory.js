import { auth,db } from "./database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";


let email = "";
let ordersData = [];
let current = false;
onAuthStateChanged(auth, async (user) => {
    if (user) {
        email = user.email;    
        fetchOrderHistory();  
        
  } else {
    redirectToLogin();
  }
});
document
  .getElementById("pendingTab")
  .addEventListener(
    "click", () =>{
      showOrders(false);
      current = false;
      }
    );

document
  .getElementById("finishedTab")
  .addEventListener("click", () => {
    showOrders(true);
    current = true;
  });
  
async function fetchOrderHistory() {
    const userPath = `userLogin/${email}/orderHistory/`;
    
    const ordersRef = collection(db, userPath);
    const querySnapshot = await getDocs(ordersRef);
    
     
    querySnapshot.forEach((doc) => {
        const order = doc.data(); // Get the order data
        const orderId = doc.id; // Get the document ID (order ID)

        // Add the order data to the ordersData array
        ordersData.push({
          orderId,
          items: order.items, // Array of items
          status: order.status,
          amount: order.amount, // Total cost
        });
      
    });
    showOrders(false)
}

function showOrders(status) {
    
   const ordersContainer = document.getElementById("ordersContainer");
   ordersContainer.innerHTML = ""; // Clear previous orders
   const filteredOrders = ordersData.filter((order) => order.status == status);
  
   filteredOrders.forEach((order) => {
     const orderItem = document.createElement("a");
     orderItem.className = "list-group-item list-group-item-action";
     orderItem.textContent = `Order ID: ${order.orderId}', Total Price: $${order.amount}`;
     orderItem.onclick = () => showOrderDetails(order);
     ordersContainer.appendChild(orderItem);
   });
    clearOrderDetails();
    
 }

function showOrderDetails(order) {
  const ordersContainer = document.getElementById("ordersContainer");
  ordersContainer.innerHTML = ""; // Clear previous orders

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
  if (order.status == false) {
    statusElement.textContent = `Status: Pending`;
  } else {
    statusElement.textContent = `Status: Finished`;
  }
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

  const showOrdersButton = document.createElement("button");
  showOrdersButton.id="showOrdersButton"
  showOrdersButton.textContent = "Back to History";
  orderDetailsContent.appendChild(showOrdersButton);
  document.getElementById("showOrdersButton").addEventListener("click", () => {
    showOrders(current);
  });

  // Show order details
  orderDetails.style.display = "block";
}

function clearOrderDetails() {
  const orderDetailsContent = document.getElementById("orderDetailsContent");
  orderDetailsContent.innerHTML = ""; // Clear the content
  const orderDetails = document.getElementById("orderDetails");
  orderDetails.style.display = "none"; // Hide the order details section
}
