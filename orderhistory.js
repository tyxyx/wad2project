import { auth,db } from "./database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";


let email = "";
let ordersData = [];
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
  .addEventListener("click", () => showOrders("pending"));
document
  .getElementById("finishedTab")
  .addEventListener("click", () => showOrders("finished"));
  
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
    showOrders('pending')
}

function showOrders(status) {
    
   const ordersContainer = document.getElementById("ordersContainer");
   ordersContainer.innerHTML = ""; // Clear previous orders
   const filteredOrders = ordersData.filter((order) => order.status === status);

   filteredOrders.forEach((order) => {
     const orderItem = document.createElement("a");
     orderItem.className = "list-group-item list-group-item-action";
     orderItem.textContent = `Order ID: ${order.orderId}', Total Cost: $${order.amount}`;
     orderItem.onclick = () => showOrderDetails(order);
     ordersContainer.appendChild(orderItem);
   });
    clearOrderDetails();
    
 }

 function showOrderDetails(order) {
   const orderDetails = document.getElementById("orderDetails");
   const orderDetailsContent = document.getElementById("orderDetailsContent");
   orderDetailsContent.innerHTML = `
                <h5>Order ID: ${order.orderId}</h5>
                <p>Status: ${order.status}</p>
                <h6>Items Purchased:</h6>
                <ul>
                    ${order.items
                      .map(
                        (item) =>
                          `<li>${item.name} - Price: $${item.price}, Quantity: ${item.quantity}</li>`
                      )
                      .join("")}
                </ul>
                <p>Total Amount: $${order.amount}</p>
            `;
   orderDetails.style.display = "block"; // Show order details
 }

function clearOrderDetails() {
  const orderDetailsContent = document.getElementById("orderDetailsContent");
  orderDetailsContent.innerHTML = ""; // Clear the content
  const orderDetails = document.getElementById("orderDetails");
  orderDetails.style.display = "none"; // Hide the order details section
}
