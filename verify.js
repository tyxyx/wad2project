import { db, auth } from './database.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
    collection,
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

let businessUEN = null;
const urlParams = new URLSearchParams(window.location.search);
const orderID = urlParams.get('orderID');


onAuthStateChanged(auth, async(user) => {
    if (user) {
        try {
            businessUEN = user.email.split("@")[0].toUpperCase();
            console.log(`"${businessUEN}"`)

            const businessDoc = await fetchBusinessName(businessUEN);
            businessUEN = `"${businessUEN}"`

            if (!businessDoc.exists()) {
                showStatusPopup("Business not found", false);
                redirectToLogin();
                return;
            }

            // Get order details
            const orderDoc = await fetchOrderDetails(orderID);
            if (!orderDoc.exists()) {
                showStatusPopup("Order not found", false);
                return;
            }

            const orderData = orderDoc.data();
            console.log(orderData)
            
            // Get business ID from the order's first item
            if (!orderData.items || orderData.items.length === 0) {
                showStatusPopup("Invalid order data", false);
                return;
            }

            const orderBusinessId = orderData.businessRef.id
            console.log(orderBusinessId)

            // Verify business UEN matches
            if (orderBusinessId != businessUEN) {
                showStatusPopup("This order belongs to a different business", false);
                return;
            }

            // Check if order has been collected
            if (orderData.status) {
                showStatusPopup("This order has already been collected", false);
                return;
            }

            // Get customer details
            const customerEmail = orderData.customerRef.id;
            const customerDoc = await getDoc(doc(db, 'userLogin', customerEmail));

            if (!customerDoc.exists()) {
                showStatusPopup("Customer not found", false);
                return;
            }

            // If all verifications pass, update order status
            await updateOrderStatus(orderID);
            
            // Show success message
            showStatusPopup(`Order ${orderID} verified successfully for customer ${orderData.customerName}`, true);

        } catch (error) {
            console.error("Verification error:", error);
            showStatusPopup("Error verifying order: " + error.message, false);
        }
    } else {
        redirectToLogin();
    }
});

function redirectToLogin() {
    window.location.href = "./login.html?mode=login&type=business";
}

async function fetchBusinessName(businessUEN) {
    return await getDoc(doc(db, "businessLogin", businessUEN));
}

async function fetchOrderDetails(orderID) {
    return await getDoc(doc(db, 'orders', orderID));
}

async function updateOrderStatus(orderID) {
    const orderRef = doc(db, 'orders', orderID);
    await setDoc(orderRef, {
        status: true,
        verificationTime: new Date().toISOString()
    }, { merge: true });
}


function showStatusPopup(message, success = true) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '1000';

    // Create popup container
    const popup = document.createElement('div');
    popup.style.padding = '20px';
    popup.style.backgroundColor = '#fff';
    popup.style.borderRadius = '8px';
    popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    popup.style.width = '300px';
    popup.style.textAlign = 'center';

    // Set the message
    const messageText = document.createElement('p');
    messageText.textContent = message;
    messageText.style.color = success ? '#4CAF50' : '#FF0000';
    popup.appendChild(messageText);

    // Create close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.marginTop = '10px';
    closeButton.style.padding = '8px 16px';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.backgroundColor = '#333';
    closeButton.style.color = '#fff';
    closeButton.style.cursor = 'pointer';

    closeButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    popup.appendChild(closeButton);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Automatically remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
        }
    }, 5000);
}