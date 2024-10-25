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
    card.classList.add("business-card", "card", "mb-4");

    // Create image element
    const img = document.createElement('img');
    img.src = `https://via.placeholder.com/250x150?text=${businessData.busName}`
    card.appendChild(img)

    // Create card body
    const cardBody = document.createElement("div")
    cardBody.classList.add("card-body");
    cardBody.style.position = "relative";
    card.appendChild(cardBody)

    // Create business name element
    const businessName = document.createElement("h3");
    businessName.innerText = businessData.busName; // Using innerText to set the business name
    businessName.classList.add("card-title", "d-inline")
    cardBody.appendChild(businessName);

    // Create Ratings and review element
    const ratingReviews = document.createElement("span");
    ratingReviews.style.position = "absolute";
    ratingReviews.style.right = "20px"
    ratingReviews.innerText = `⭐${businessData.ratings} ${businessData.reviews}`
    cardBody.appendChild(ratingReviews)

    const cardText = document.createElement('p')
    cardText.classList.add('card-text')
    cardBody.appendChild(cardText)

    // Create contact info element
    const contactInfo = document.createElement("p");
    contactInfo.innerText = `Contact: ${businessData.contactInfo}`; // Using innerText to set contact info
    cardText.appendChild(contactInfo);

    // Create location element
    const location = document.createElement("p");
    location.innerText = `Location: ${businessData.address}`; // Using innerText to set the address
    cardText.appendChild(location);

    // // Create the "View Menu" button
    // const viewMenuBtn = document.createElement("button");
    // viewMenuBtn.innerText = "View Menu"; // Using innerText to set button text
    // viewMenuBtn.classList.add("view-menu-btn", 'btn', 'btn-secondary');
    
    // Add event listener to the 'View Menu' button
    card.addEventListener("click", () => {
        // Update URL to include business ID
        history.pushState({ businessUEN, businessName: businessData.busName }, '', `?business=${businessUEN}`);
        fetchAndDisplayMenuItems(businessUEN, businessData.busName);
    });

    // // Append the button to the card
    // cardBody.appendChild(viewMenuBtn);

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
            businessContainer.innerText = "";
            fetchBusinessCards();
        });
        businessContainer.appendChild(backButton);

        window.addEventListener('popstate', () => {
            businessContainer.innerHTML = "";
            fetchBusinessCards();
        });

    } catch (error) {
        console.error("Error fetching menu items:", error);
    }
}

// Function to create a card for each menu item
function createMenuItemCard(menuItemData) {
    const businessContainer = document.getElementById("business-container");

    // Create food card
    const menuItemCard = document.createElement("div");
    menuItemCard.classList.add("menu-item-card", "card", "mb-4");
    
    // Create carousel container first
    const carouselContainer = document.createElement("div");
    carouselContainer.classList.add("carousel-container", "mb-3");
    const carouselId = `carousel-${menuItemData.itemName.replace(/\s+/g, '-').toLowerCase()}`;
    carouselContainer.id = carouselId;
    
    // Add carousel container to card
    menuItemCard.appendChild(carouselContainer);
    
    // Create card body for content
    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");
    
    // Create title
    const title = document.createElement("h4");
    title.classList.add("card-title", "mb-2");
    title.textContent = menuItemData.itemName;
    
    // Create description
    const description = document.createElement("p");
    description.classList.add("card-text", "mb-2");
    description.textContent = menuItemData.description;
    
    // Create price with proper formatting
    const price = document.createElement("p");
    price.classList.add("card-text", "fw-bold");
    price.textContent = `$${Number(menuItemData.price).toFixed(2)}`;
    
    // Assemble the card body
    cardBody.appendChild(title);
    cardBody.appendChild(description);
    cardBody.appendChild(price);
    
    // Add card body to card
    menuItemCard.appendChild(cardBody);
    
    // Add the completed card to the container
    businessContainer.appendChild(menuItemCard);
    
    // Create carousel only after the container is in the DOM
    createCarousel(carouselId, menuItemData.images);
}

function redirectToLogin() {
    window.location.href = "./login.html?mode=login";
}


function createCarousel(containerId, imageUrls) {
    const container = document.getElementById(containerId);
    
    // Create main carousel div
    const carousel = document.createElement("div");
    carousel.classList.add("carousel", "slide", "carousel-fade");
    carousel.id = `${containerId}-inner`;
    carousel.setAttribute("data-bs-ride", "carousel");
    
    // Create carousel-inner div
    const carouselInner = document.createElement("div");
    carouselInner.classList.add("carousel-inner");
    
    // Add images to carousel
    imageUrls.forEach((url, index) => {
        const item = document.createElement("div");
        item.classList.add("carousel-item");
        if (index === 0) item.classList.add("active");
        
        // Create image wrapper for consistent sizing
        const imgWrapper = document.createElement("div");
        imgWrapper.classList.add("carousel-image-wrapper");
        
        const img = document.createElement("img");
        img.classList.add("d-block", "w-100");
        img.src = url;
        img.alt = `Food image ${index + 1}`;
        
        imgWrapper.appendChild(img);
        item.appendChild(imgWrapper);
        carouselInner.appendChild(item);
    });
    
    carousel.appendChild(carouselInner);
    
    // Only add controls if there are multiple images
    if (imageUrls.length > 1) {
        // Previous button
        const prevButton = document.createElement("button");
        prevButton.classList.add("carousel-control-prev");
        prevButton.type = "button";
        prevButton.setAttribute("data-bs-target", `#${containerId}-inner`);
        prevButton.setAttribute("data-bs-slide", "prev");
        
        const prevIcon = document.createElement("span");
        prevIcon.classList.add("carousel-control-prev-icon");
        prevIcon.setAttribute("aria-hidden", "true");
        
        const prevText = document.createElement("span");
        prevText.classList.add("visually-hidden");
        prevText.textContent = "Previous";
        
        prevButton.appendChild(prevIcon);
        prevButton.appendChild(prevText);
        carousel.appendChild(prevButton);
        
        // Next button
        const nextButton = document.createElement("button");
        nextButton.classList.add("carousel-control-next");
        nextButton.type = "button";
        nextButton.setAttribute("data-bs-target", `#${containerId}-inner`);
        nextButton.setAttribute("data-bs-slide", "next");
        
        const nextIcon = document.createElement("span");
        nextIcon.classList.add("carousel-control-next-icon");
        nextIcon.setAttribute("aria-hidden", "true");
        
        const nextText = document.createElement("span");
        nextText.classList.add("visually-hidden");
        nextText.textContent = "Next";
        
        nextButton.appendChild(nextIcon);
        nextButton.appendChild(nextText);
        carousel.appendChild(nextButton);
    }
    
    container.appendChild(carousel);
}