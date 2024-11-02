import { db, auth, logOut } from "./database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    serverTimestamp,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

let userEmail = null;
let userData = null; // Store user data globally

class OrderQRGenerator {
    constructor() {
        this.initializeElements();
    }

    initializeElements() {
        if (!document.querySelector('.qr-wrapper img')) {
            const qrWrapper = document.querySelector('.qr-wrapper');
            const qrImage = document.createElement('img');
            qrImage.id = 'qrCodeImage';
            qrImage.alt = 'QR Code';
            qrWrapper.appendChild(qrImage);
        }

        this.qrImage = document.getElementById('qrCodeImage');
        this.status = document.getElementById('status');
    }

    updateOrderDisplay(orderData) {
        document.getElementById('displayOrderId').innerText = orderData.orderId;
        document.getElementById('displayAmount').innerText = orderData.amount.toFixed(2);
        document.getElementById('displayCustomer').innerText = orderData.customerName;
        document.getElementById('displayCart').innerText = orderData.items.map(
            item => `${item.quantity} ${item.name}`
        ).join(', ');
        const date = new Date(Number(localStorage.getItem('orderCreationTime')))
        document.getElementById('displayTimestamp').innerText = date.toLocaleString();
        const valid = new Date(Number(localStorage.getItem('orderCreationTime')) + 7200000)
        document.getElementById('displayValidity').innerText = valid.toLocaleString()
    }

    async updateDatabase(orderData) {
      try {
          // Create an order document with a custom ID
          const orderRef = doc(db, "orders", orderData.orderId);
          const customerRef = doc(db, 'userLogin', userEmail)
          const businessRef = doc(db, 'businessLogin', localStorage.businessId)
          console.log(orderData.items)
          // Prepare the order data
          const orderDocument = {
              orderId: orderData.orderId,
              customerRef: customerRef,
              businessRef: businessRef,
              customerName: orderData.customerName,
              amount: orderData.amount,
              items: orderData.items.map(item => ({
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                  businessId: localStorage.businessId
              })),
              status: false, // Initial status
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
          };
  
          // Save the order to Firestore
          await setDoc(orderRef, orderDocument);
          
          // Also save to user's orders subcollection
          const userOrderRef = doc(db, "userLogin", userEmail, "orderHistory", orderData.orderId);
          await setDoc(userOrderRef, orderDocument);
  
          console.log("Order successfully saved to database!");
          return true;
  
      } catch (error) {
          console.error("Error saving order to database:", error);
          if (this.status) {
              this.status.innerText = "Error saving order to database";
              this.status.className = "status error";
          }
          throw error;
      }
  }

    async generateQR(orderData) {
        try {
            const baseUrl = 'http://127.0.0.1:3000/wad2project/verify.html';
            const verificationUrl = `${baseUrl}?orderID=${orderData.orderId}`;

            const response = await axios.get('https://api.qrserver.com/v1/create-qr-code/', {
                params: {
                    data: verificationUrl,
                    size: '100x100'
                },
                responseType: 'blob'
            });

            const qrCodeUrl = URL.createObjectURL(response.data);
            this.qrImage.src = qrCodeUrl;
            
            if (this.status) {
                this.status.className = 'status success';
                this.status.innerText = 'QR code generated successfully';
            }

            this.updateOrderDisplay(orderData);
            return qrCodeUrl;

        } catch (error) {
            console.error('Error generating QR code:', error);
            if (this.status) {
                this.status.className = 'status error';
                this.status.innerText = 'Error generating QR code';
            }
        }
    }
}

async function fetchUserName(userEmail) {
    try {
        const docRef = doc(db, "userLogin", userEmail);
        const docSnap = await getDoc(docRef);
        return docSnap;
    } catch (error) {
        console.error("Error fetching user data:", error);
        throw error;
    }
}

function redirectToLogin() {
    // window.location.href = "./login.html?mode=login";
}

async function renderOrderSummary() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const businessUEN = JSON.parse(localStorage.getItem("businessId")) || [];
    console.log(businessUEN)
    const orderSummaryDiv = document.getElementById("order-summary");
    orderSummaryDiv.innerText = "";

    if (cart.length === 0) {
        orderSummaryDiv.innerText = "Your cart is empty.";
        clearOrderId();
        return;
    }

    cart.forEach((item) => {
        const itemDiv = document.createElement("div");
        itemDiv.innerText = `${item.name} - $${item.price.toFixed(2)} x ${item.quantity}`;
        orderSummaryDiv.appendChild(itemDiv);
    });

    const totalPrice = cart.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
    );
    
    const uniqueOrderId = getOrderId();

    document.getElementById("total-price").innerText = 
        `Total Price: $${totalPrice.toFixed(2)}`;
    document.getElementById("orderId").innerText = 
        "Order ID: " + uniqueOrderId;

    localStorage.setItem("totalPrice", JSON.stringify(totalPrice));
    localStorage.setItem("uniqueOrderId", JSON.stringify(uniqueOrderId));

    // Only generate QR if we have user data
    if (userData) {
        const qrGenerator = new OrderQRGenerator();
        const orderData = {
            orderId: uniqueOrderId,
            amount: totalPrice,
            customerName: userData.fullName,
            items: cart.map(item => ({
              ...item,
              businessId: item.businessId
            }))
        };

        console.log(orderData.items)
        console.log(localStorage)

        await qrGenerator.generateQR(orderData);
        await qrGenerator.updateDatabase(orderData)
    }
}

// Initialize auth state listener
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            userEmail = user.email;
            const userDoc = await fetchUserName(userEmail);

            if (userDoc.exists()) {
                userData = userDoc.data(); // Store the user data
                console.log("User data loaded:", userData.fullName);
                await renderOrderSummary();
            } else {
                console.log("No user document found");
                redirectToLogin();
            }

            // Handle any layout adjustments
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 1000);
        } catch (error) {
            console.error("Error fetching user details:", error);
            redirectToLogin();
        }
    } else {
        redirectToLogin();
    }
});

function getOrderId() {
  // Check if we already have an order ID and its creation timestamp
  let existingOrderId = localStorage.getItem("currentOrderId");
  let creationTime = localStorage.getItem("orderCreationTime");
  
  // If no existing order ID, generate a new one and set creation time
  if (!existingOrderId) {
      existingOrderId = 'ORD' + Date.now() + Math.random().toString(36).slice(2, 5);
      creationTime = Date.now();
      localStorage.setItem("currentOrderId", existingOrderId);
      localStorage.setItem("orderCreationTime", creationTime);
      
      setTimeout(() => {
          clearOrderId();
          alert("Order session expired. Please place another order.");
          //location.reload();
          window.location.href = './home.html';
      }, 7200000);
  } else {
      // Check if the existing order is still valid
      const currentTime = Date.now();
      const elapsedTime = currentTime - creationTime;
      
      if (elapsedTime >= 7200000) {
          // Order has expired
          clearOrderId();
          alert("Order session expired. Please place another order.");
          window.location.href = './home.html';
          return null;
      } else {
          // Order is still valid - set timeout for remaining time
          setTimeout(() => {
              clearOrderId();
              alert("Order session expired. Please place another order.");
              window.location.href = './home.html';
          }, 7200000 - elapsedTime);
      }
  }
  
  return existingOrderId;
}

function clearOrderId() {
  localStorage.removeItem("currentOrderId");
  localStorage.removeItem("orderCreationTime");
  localStorage.removeItem("cart")
}

// Set up event listener for the back to shop button
document.getElementById("back-to-shop").addEventListener("click", () => {
    window.location.href = "home.html";
});