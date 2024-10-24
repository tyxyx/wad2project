import { db, auth } from "../wad2project/database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
    collection,
    doc,
    getDoc,
    getDocs,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

let userEmail = null; 

// Listen for authentication state changes
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            userEmail = user.email;
            const userDoc = await fetchUserName(userEmail);

            if (userDoc.exists()) {
                console.log("User found:", userDoc.data());
                // Fetch and display businesses
                await fetchBusinessCards();
            } else {
                redirectToLogin();
            }
        } catch (error) {
            console.error("Error fetching user details:", error);
            alert("Failed to load user details. Please try again later.");
            redirectToLogin();
        }
    } else {
        redirectToLogin();
    }
});

// Function to fetch user details
async function fetchUserName(userEmail) {
    return await getDoc(doc(db, "userLogin", userEmail));
}

// Function to fetch businesses and display them as cards
async function fetchBusinessCards() {
    try {
        const businessQuerySnapshot = await getDocs(collection(db, "businessLogin"));
        
        businessQuerySnapshot.forEach((businessDoc) => {
            const businessData = businessDoc.data();
            console.log("Business:", businessData);

            // Create a card for each business
            createBusinessCard(businessDoc.id, businessData);
        });
    } catch (error) {
        console.error("Error fetching businesses:", error);
    }
}

// Function to create a business card CHANGE THE DATA HERE FOR THE OUTPUT
function createBusinessCard(businessUEN, businessData) {
    const businessContainer = document.getElementById("business-container")
    if (!businessContainer) {
        console.error("Business container not found");
        return;
    }

    // Create card element
    const card = document.createElement("div");
    card.classList.add("business-card");

    // Create business name element
    const businessName = document.createElement("h3");
    businessName.innerText = businessData.busName; // Using innerText to set the business name
    card.appendChild(businessName);

    // Create contact info element
    const contactInfo = document.createElement("p");
    contactInfo.innerText = `Contact: ${businessData.contactInfo}`; // Using innerText to set contact info
    card.appendChild(contactInfo);

    // Create location element
    const location = document.createElement("p");
    location.innerText = `Location: ${businessData.address}`; // Using innerText to set the address
    card.appendChild(location);

    // Create the "View Menu" button
    const viewMenuBtn = document.createElement("button");
    viewMenuBtn.innerText = "View Menu"; // Using innerText to set button text
    viewMenuBtn.classList.add("view-menu-btn");
    
    // Add event listener to the 'View Menu' button
    viewMenuBtn.addEventListener("click", () => {
        fetchAndDisplayMenuItems(businessUEN, businessData.businessName);
    });

    // Append the button to the card
    card.appendChild(viewMenuBtn);

    // Append the card to the container
    businessContainer.appendChild(card);
}


// Function to fetch and display menu items for a specific business CHANGE HERE TO DISPLAY MENU
async function fetchAndDisplayMenuItems(businessUEN, businessName) {
    try {
        const menuItemsSnapshot = await getDocs(collection(db, `businessLogin/${businessUEN}/menuItems`));
        
        // Clear existing cards to display menu
        const businessContainer = document.getElementById("business-container");
        businessContainer.innerHTML = `<h2>Menu for ${businessName}</h2>`;

        menuItemsSnapshot.forEach((menuItemDoc) => {
            const menuItemData = menuItemDoc.data();
            console.log("Menu Item:", menuItemData);
            createMenuItemCard(menuItemData);
        });

        // Add a back button to go back to the business list
        const backButton = document.createElement("button");
        backButton.textContent = "Back to Businesses";
        backButton.addEventListener("click", () => {
            // Clear the menu and show the business cards again
            businessContainer.innerHTML = "";
            fetchBusinessCards();
        });
        businessContainer.appendChild(backButton);

    } catch (error) {
        console.error("Error fetching menu items:", error);
    }
}

// Function to create a card for each menu item
function createMenuItemCard(menuItemData) {
    const businessContainer = document.getElementById("business-container");

    const menuItemCard = document.createElement("div");
    menuItemCard.classList.add("menu-item-card");
    menuItemCard.innerHTML = `
        <h3>${menuItemData.itemName}</h3>
        <p>Description: ${menuItemData.description}</p>
        <p>Price: $${menuItemData.price}</p>
        <img src="${menuItemData.imageURL}" alt="${menuItemData.itemName}" style="width:100px;height:100px;">
    `;
    businessContainer.appendChild(menuItemCard);
}

function redirectToLogin() {
    window.location.href = "./login.html?mode=login";
}
