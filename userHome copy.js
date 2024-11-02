import { db, auth, logOut } from "./database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
    collection,
    doc,
    getDoc,
    getDocs,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

let userEmail = null; 
let cart = [];
let listGroup = [];
const overlay = document.createElement('div');
overlay.className = 'loading-overlay';
const spinner = document.createElement('div');
spinner.className = 'loading-spinner';
overlay.appendChild(spinner);
document.body.appendChild(overlay);
// Listen for authentication state changes
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {

            userEmail = user.email;
            const userDoc = await fetchUserName(userEmail);

            if (userDoc.exists()) {
                
                // Fetch and display businesses
                await fetchBusinessCards();
            } else {
                overlay.remove()
                redirectToLogin();
            }

            setTimeout(() => {
              window.dispatchEvent(new Event('resize'));
              overlay.remove();
          }, 1000);
        } catch (error) {
            console.error("Error fetching user details:", error);
            alert("Failed to load user details. Please try again later.");
            if (document.querySelector('.loading-overlay')) {
              document.querySelector('.loading-overlay').remove();
          }
            redirectToLogin();
        }
    } else {
        redirectToLogin();
    }
});

function redirectToLogin() {
  window.location.href = "./login.html?mode=login";
}

// Function to fetch user details
async function fetchUserName(userEmail) {
    return await getDoc(doc(db, "userLogin", userEmail));
}

// Function to fetch businesses and display them as cards
// async function fetchBusinessCards() {
//     try {
//         const businessQuerySnapshot = await getDocs(collection(db, "businessLogin"));
        
//         businessQuerySnapshot.forEach((businessDoc) => {
//             const businessData = businessDoc.data();
            

//             // Create a card for each business
//             createBusinessCard(businessDoc.id, businessData);
//         });
//     } catch (error) {
//         console.error("Error fetching businesses:", error);
//     }
// }

// Update your existing fetchBusinessCards function #1
// async function fetchBusinessCards() {
//   try {
//       const businessQuerySnapshot = await getDocs(collection(db, "businessLogin"));
      
//       businessQuerySnapshot.forEach((businessDoc) => {
//           const businessData = businessDoc.data();
          
//           // Create vertical card for "All businesses" section
//           createBusinessCard(businessDoc.id, businessData);
          
//           // Create horizontal card for "Featured businesses" section
//           createFeaturedBusinessCard(businessDoc.id, businessData);
//       });

//       // Initialize horizontal scroll functionality
//       initializeHorizontalScroll();
//   } catch (error) {
//       console.error("Error fetching businesses:", error);
//   }
// }

// Update your fetchBusinessCards function to clear containers first
async function fetchBusinessCards() {
  try {
    // Clear existing cards from both containers
    
      const menuDish = document.getElementById("menu-dish");
      const featuredCards = document.getElementById("featured-cards");
      
      if (menuDish) menuDish.innerHTML = "";
      if (featuredCards) featuredCards.innerHTML = "";
      
      const businessQuerySnapshot = await getDocs(collection(db, "businessLogin"));
      
      businessQuerySnapshot.forEach((businessDoc) => {
          const businessData = businessDoc.data();
          
          // Create vertical card for "All businesses" section
          console.log(businessData)
          if (businessData.profilePic && businessData.address && businessData.contactInfo) {
            createBusinessCard(businessDoc.id, businessData);
            createFeaturedBusinessCard(businessDoc.id, businessData);
          }

          
          // Create horizontal card for "Featured businesses" section

      });

      // Initialize horizontal scroll functionality
      initializeHorizontalScroll();
  } catch (error) {
      console.error("Error fetching businesses:", error);
  }
}

// Function to create a business card CHANGE THE DATA HERE FOR THE OUTPUT
function createBusinessCard(businessUEN, businessData) {
    // const businessContainer = document.getElementById("business-container")
    // if (!businessContainer) {
    //     console.error("Business container not found");
    //     return;
  // }
    
  const menuDish = document.getElementById("menu-dish");
  if (!menuDish) {
      console.error("Menu dish container not found");
      return;
  }

  // Create card element
  const card = document.createElement("div");
  card.classList.add("col-lg-4", "col-sm-6", "dish-box-wp", "breakfast");
  card.style.height = "450px"; // Ensure consistent card height
  card.setAttribute("data-cat", "breakfast");

  // Create dish-box
  const dishBox = document.createElement("div");
  dishBox.classList.add("dish-box", "text-center");

  // Create distImg container for image
  const distImg = document.createElement("div");
  distImg.classList.add("dist-img");
  distImg.style.width = "200px"; // Ensure container is square
  distImg.style.height = "200px"; // Ensure container is square
  distImg.style.borderRadius = "50%"; // Make the container circular
  distImg.style.overflow = "hidden"; // Prevent overflow
  distImg.style.margin = "0 auto"; // Center the image in the card

  // Create image element
  const img = document.createElement('img');
  img.src = businessData.profilePic || './images/default-profile.png'; // Fallback image
  img.style.width = "100%";
  img.style.height = "100%";
  img.style.objectFit = "cover"; // Ensure the image covers the container
  img.style.display = "block"; // Ensure no extra space below the image

  distImg.appendChild(img);
  dishBox.appendChild(distImg);

  // Create dish title section
  const dishTitle = document.createElement("div");
  dishTitle.classList.add("dist-title");
  const h3Title = document.createElement("h3");
  h3Title.classList.add("h3-title");
  h3Title.innerText = businessData.busName;
  const locationP = document.createElement("p");
  locationP.innerText = `📍 ${businessData.address}`;
  const contactP = document.createElement("p");
  contactP.innerText = `📞 ${businessData.contactInfo}`;
  dishTitle.appendChild(h3Title);
  dishTitle.appendChild(locationP);
  dishTitle.appendChild(contactP);
  dishBox.appendChild(dishTitle);

  // Create view button section
  const viewButtonSection = document.createElement("div");
  viewButtonSection.classList.add("dist-bottom-row");
  const viewButton = document.createElement("button");
  viewButton.classList.add("dish-add-btn");
  viewButton.innerText = "View";
  viewButtonSection.appendChild(viewButton);
  dishBox.appendChild(viewButtonSection);

  // Append dishBox into card
  card.appendChild(dishBox);
  menuDish.appendChild(card);

    // Create card body
    // const cardBody = document.createElement("div")
    // cardBody.classList.add("card-body");
    // cardBody.style.position = "relative";
    // card.appendChild(cardBody)

    // Create business name element
    // const businessName = document.createElement("h3");
    // businessName.innerText = businessData.busName; // Using innerText to set the business name
    // businessName.classList.add("card-title", "d-inline")
    // cardBody.appendChild(businessName);

    // Create Ratings and review element
    // const ratingReviews = document.createElement("span");
    // ratingReviews.style.position = "absolute";
    // ratingReviews.style.right = "20px"
    // ratingReviews.innerText = `⭐${businessData.ratings} ${businessData.reviews}`
    // cardBody.appendChild(ratingReviews)

    // const cardText = document.createElement('p')
    // cardText.classList.add('card-text')
    // cardBody.appendChild(cardText)

    // Create contact info element
    // const contactInfo = document.createElement("p");
    // contactInfo.innerText = `Contact: ${businessData.contactInfo}`; // Using innerText to set contact info
    // cardText.appendChild(contactInfo);

    // Create location element
    // const location = document.createElement("p");
    // location.innerText = `Location: ${businessData.address}`; // Using innerText to set the address
    // cardText.appendChild(location);

    
    // Add event listener to the card
    // card.addEventListener("click", () => {
    //     // Update URL to include business ID to allow browser back
    //     history.pushState({ businessUEN, businessName: businessData.busName }, '', `?business=${businessUEN}`);
    //     fetchAndDisplayMenuItems(businessUEN, businessData.busName);
    // });

    // Add event listener to the card-like element
    card.addEventListener("click", () => {
        // Update URL to include business ID to allow browser back
        history.pushState({ businessUEN, businessName: businessData.busName }, '', `?business=${businessUEN}`);
      fetchAndDisplayMenuItems(businessUEN, businessData.busName);
    });;

    // Append the card to the container
    // businessContainer.appendChild(card);
    
    // Append the card-like elem into the container
    menuDish.appendChild(card);
}

// Function to fetch and display menu items for a specific business CHANGE HERE TO DISPLAY MENU
// async function fetchAndDisplayMenuItems(businessUEN, businessName) {
//   try {
//     const menuItemsSnapshot = await getDocs(
//       collection(db, `businessLogin/${businessUEN}/menuItems`)
//     );

//     // Clear existing cards to display menu
//     const menuDish = document.getElementById("menu-dish");
//     menuDish.innerHTML = `<h2>Menu for ${businessName}</h2>`;

//     menuItemsSnapshot.forEach((menuItemDoc) => {
//       const menuItemData = menuItemDoc.data();

//       createMenuItemCard(menuItemData);
//     });

//     // Create a container for cart items
//     const cartContainer = document.createElement("div");
//     cartContainer.classList.add("card", "mt-4");
//     cartContainer.style.width = "18rem";

//     // Create the card header
//     const cardHeader = document.createElement("div");
//     cardHeader.classList.add("card-header");
//     cardHeader.innerText = "Your Cart";

//     // Create the list group
//     listGroup = document.createElement("ul");
//     listGroup.classList.add("list-group", "list-group-flush");

//     // Append the header and list group to the cart container
//     cartContainer.appendChild(cardHeader);
//     cartContainer.appendChild(listGroup);

//     // Create Order Now button
//     const orderNowButton = document.createElement("button");
//     orderNowButton.textContent = "Order Now";
//     orderNowButton.classList.add("btn", "btn-success");
//       orderNowButton.addEventListener("click", () => {
//         window.location.href = "cart.html";
//     });

//     // Add a back button to go back to the business list
//     const backButton = document.createElement("button");
//     backButton.textContent = "Back to Businesses";
//     backButton.addEventListener("click", () => {
//       // Clear the menu and show the business cards again
//       menuDish.innerText = "";
//       fetchBusinessCards();
//     });
//     // Append buttons to the menu dish
//     menuDish.appendChild(cartContainer);
//     menuDish.appendChild(orderNowButton);
//       menuDish.appendChild(backButton);
//       loadCartItems(listGroup);
      
//   } catch (error) {
//     console.error("Error fetching menu items:", error);
//   }
// } 

// updated fetchAndDisplayMenuItems
// Update the back button event listener in fetchAndDisplayMenuItems
// async function fetchAndDisplayMenuItems(businessUEN, businessName) {
//   setTimeout(() => {
//     window.dispatchEvent(new Event('resize'));
//     overlay.remove();
//   }, 1000);
//   try {
//     resetCart();
//     const menuItemsSnapshot = await getDocs(
//       collection(db, `businessLogin/${businessUEN}/menuItems`)
//     );

//     // Clear existing cards to display menu
//     const menuDish = document.getElementById("menu-dish");
//     menuDish.innerHTML = `<h2>Menu for ${businessName}</h2>`;

//     menuItemsSnapshot.forEach((menuItemDoc) => {
//       const menuItemData = menuItemDoc.data();
//       createMenuItemCard(menuItemData);
//     });

//     // Create a container for cart items
//     const cartContainer = document.createElement("div");
//     cartContainer.classList.add("card", "mt-4");
//     cartContainer.style.width = "18rem";

//     // Create the card header
//     const cardHeader = document.createElement("div");
//     cardHeader.classList.add("card-header");
//     cardHeader.innerText = "Your Cart";

//     // Create the list group
//     listGroup = document.createElement("ul");
//     listGroup.classList.add("list-group", "list-group-flush");
//     listGroup.setAttribute("id","cartItems")

//     // Append the header and list group to the cart container
//     cartContainer.appendChild(cardHeader);
//     cartContainer.appendChild(listGroup);

//     // Create Order Now button
//     const orderNowButton = document.createElement("button");
//     orderNowButton.textContent = "Order Now";
//     orderNowButton.classList.add("btn", "btn-success");
//     orderNowButton.addEventListener("click", () => {
//       localStorage.setItem("businessId", JSON.stringify(businessUEN));
//       localStorage.setItem("cart", JSON.stringify(cart));
//         window.location.href = "cart.html";
//     });

//     // Add a back button to go back to the business list
//     const backButton = document.createElement("button");
//     backButton.textContent = "Back to Businesses";
//     backButton.classList.add("btn", "btn-secondary", "m-2");
//     backButton.addEventListener("click", async () => {
//       // Clear the menu
//       menuDish.innerHTML = "";
//       // Re-fetch and display business cards
//       await fetchBusinessCards();

//     });

//     // Append buttons to the menu dish
//     menuDish.appendChild(cartContainer);
//     menuDish.appendChild(orderNowButton);
//     menuDish.appendChild(backButton);
//     loadCartItems();
      
//   } catch (error) {
//     console.error("Error fetching menu items:", error);
//   }
// }

//new  fetchAndDisplayMenuItems
async function fetchAndDisplayMenuItems(businessUEN, businessName) {
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
    overlay.remove();
  }, 1000);
  try {
    resetCart();
    const menuItemsSnapshot = await getDocs(
      collection(db, `businessLogin/${businessUEN}/menuItems`)
    );

    const ftb = document.getElementById("featured-businesses")
    ftb.classList.add('d-none')

    // Clear existing cards to display menu
    const menuDish = document.getElementById("menu-dish");
    menuDish.innerHTML = `
      <div class="col-lg-12">
        <div class="sec-title text-center mb-5">
          <h2 class="h2-title" id='displayMenu'>${businessName}'s Menu</h2>
          <div class="sec-title-shape mb-4">
            <img src="assets/images/title-shape.svg">
          </div>
        </div>
      </div>
    `;

    // Create a row for menu items
    const menuRow = document.createElement("div");
    menuRow.classList.add("row", "g-xxl-5");
    menuDish.appendChild(menuRow);

    menuItemsSnapshot.forEach((menuItemDoc) => {
      const menuItemData = menuItemDoc.data();
      createMenuItemCard(menuItemData, menuRow);
    });

    // Create cart section with same styling
    const cartSection = document.createElement("div");
    cartSection.classList.add("col-lg-12", "mt-5");
    
    const cartBox = document.createElement("div");
    cartBox.classList.add("dish-box");
    cartBox.style.maxWidth = "500px";
    cartBox.style.margin = "0 auto";
    
    const cartTitle = document.createElement("div");
    cartTitle.classList.add("dist-title", "text-center");
    cartTitle.innerHTML = `
      <h3 class="h3-title">Your Cart</h3>
    `;
    
    // Create cart list
    listGroup = document.createElement("ul");
    listGroup.classList.add("list-group", "list-group-flush");
    listGroup.setAttribute("id", "cartItems");
    listGroup.style.padding = "20px";

    // Create buttons container
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("dist-bottom-row", "mt-4");
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "center";
    buttonContainer.style.gap = "15px";

    // Create Order Now button
    const orderNowButton = document.createElement("button");
    orderNowButton.textContent = "Order Now";
    orderNowButton.classList.add("dish-add-btn");
    orderNowButton.style.width = "auto";
    orderNowButton.style.padding = "0 20px";
    orderNowButton.addEventListener("click", () => {
      localStorage.setItem("businessId", JSON.stringify(businessUEN));
      localStorage.setItem("cart", JSON.stringify(cart));
      window.location.href = "cart.html";
    });

    // Create Back button
    const backButton = document.createElement("button");
    backButton.textContent = "Back to Businesses";
    backButton.classList.add("dish-add-btn");
    backButton.style.width = "auto";
    backButton.style.padding = "0 20px";
    backButton.style.background = "linear-gradient(145deg, #e26a2c, #ff8243)";
    backButton.addEventListener("click", async () => {
      menuDish.innerHTML = "";
      await fetchBusinessCards();
    });

    // Assemble cart section
    buttonContainer.appendChild(orderNowButton);
    buttonContainer.appendChild(backButton);
    cartBox.appendChild(cartTitle);
    cartBox.appendChild(listGroup);
    cartBox.appendChild(buttonContainer);
    cartSection.appendChild(cartBox);
    menuDish.appendChild(cartSection);

    loadCartItems();
    const targetElement = document.getElementById('displayMenu');
    const offset = 90; // Adjust this value as needed
    
    // Get the position of the element and scroll to slightly above it
    window.scrollTo({
        top: targetElement.getBoundingClientRect().top + window.pageYOffset - offset,
        behavior: 'smooth'
    });

      
  } catch (error) {
    console.error("Error fetching menu items:", error);
  }
}

// This is for browser back button, root level to prevent duplicates
// window.addEventListener('popstate', (event) => {
//     const menuDish = document.getElementById("menu-dish");
//     menuDish.innerHTML = "";
//     fetchBusinessCards();
// });
// updated popstate
// Also update the popstate event handler
window.addEventListener('popstate', async (event) => {
  const menuDish = document.getElementById("menu-dish");
  menuDish.innerHTML = "";
  const ftb = document.getElementById("featured-businesses")
  ftb.classList.remove("d-none")
  await fetchBusinessCards();
  
});

// Function to create a card for each menu item
// function createMenuItemCard(menuItemData) {
//   const menuDish = document.getElementById("menu-dish");

//   // Create food card
//   const menuItemCard = document.createElement("div");
//   menuItemCard.classList.add("menu-item-card", "card", "mb-4");

//   // Create carousel container first
//   const carouselContainer = document.createElement("div");
//   carouselContainer.classList.add("carousel-container", "mb-3");
//   const carouselId = `carousel-${menuItemData.itemName
//     .replace(/\s+/g, "-")
//     .toLowerCase()}`;
//   carouselContainer.id = carouselId;

//   // Add carousel container to card
//   menuItemCard.appendChild(carouselContainer);

//   // Create card body for content
//   const cardBody = document.createElement("div");
//   cardBody.classList.add("card-body");

//   // Create title
//   const title = document.createElement("h4");
//   title.classList.add("card-title", "mb-2");
//   title.textContent = menuItemData.itemName;

//   // Create description
//   const description = document.createElement("p");
//   description.classList.add("card-text", "mb-2");
//   description.textContent = menuItemData.description;

//   // Create price with proper formatting
//   const price = document.createElement("p");
//   price.classList.add("card-text", "fw-bold");
//   price.textContent = `$${Number(menuItemData.price).toFixed(2)}`;

//   // Create quantity counter
//   const quantityContainer = document.createElement("div");
//   quantityContainer.classList.add("quantity-container", "mb-2");

//   const quantityInput = document.createElement("input");
//   quantityInput.type = "number";
//   quantityInput.value = 0; // Starting quantity
//   quantityInput.min = 0; // Prevent negative numbers
//   quantityInput.classList.add("quantity-input", "form-control", "me-2");

//   const addToCartButton = document.createElement("button");
//   addToCartButton.textContent = "Add to Cart";
//   addToCartButton.classList.add("btn", "btn-primary");

//   // Add event listener to update cart on button click
//   addToCartButton.addEventListener("click", () => {
//     const quantity = parseInt(quantityInput.value);
//     if (quantity > 0) {
//       // Add item to cart logic here
//       addToCart(menuItemData.itemName, quantity, menuItemData.price);
//       alert(`${quantity} ${menuItemData.itemName}(s) added to cart!`);
//       quantityInput.value = 0; // Reset counter to 0
//     } else {
//       alert("Please select a quantity to add to the cart.");
//     }
//   });

//   // Append input and button to the quantity container
//   quantityContainer.appendChild(quantityInput);
//   quantityContainer.appendChild(addToCartButton);

//   // Assemble the card body
//   cardBody.appendChild(title);
//   cardBody.appendChild(description);
//   cardBody.appendChild(price);
//   cardBody.appendChild(quantityContainer);

//   // Add card body to card
//   menuItemCard.appendChild(cardBody);

//   // Add the completed card to the container
//   menuDish.appendChild(menuItemCard);

//   // Create carousel only after the container is in the DOM
//   createCarousel(carouselId, menuItemData.images);
// }

// new createMenuItemCard
function createMenuItemCard(menuItemData, container) {
  // Create column for the card
  const col = document.createElement("div");
  col.classList.add("col-lg-4", "col-sm-6", "dish-box-wp");

  // Create dish box
  const dishBox = document.createElement("div");
  dishBox.classList.add("dish-box", "text-center");

  // Create image section
  const distImg = document.createElement("div");
  distImg.classList.add("dist-img");
 
  // Use first image from array or fallback
  const img = document.createElement("img");
  img.src = menuItemData.images && menuItemData.images.length > 0 
    ? menuItemData.images[0] 
    : './images/mealmate-logo-zip-file/png/logo-color.png';
  img.onerror = () => {
    img.src = './images/mealmate-logo-zip-file/png/logo-color.png';
  };
  
  distImg.appendChild(img);
  dishBox.appendChild(distImg);

  // Create title section
  const dishTitle = document.createElement("div");
  dishTitle.classList.add("dist-title");
  
  const title = document.createElement("h3");
  title.classList.add("h3-title");
  title.textContent = menuItemData.itemName;
  
  const description = document.createElement("p");
  description.textContent = menuItemData.description;
  
  const price = document.createElement("p");
  price.classList.add("price");
  price.style.fontSize = "1.2em";
  price.style.fontWeight = "bold";
  price.style.color = "#ff8243";
  price.textContent = `$${Number(menuItemData.price).toFixed(2)}`;
  
  dishTitle.appendChild(title);
  dishTitle.appendChild(description);
  dishTitle.appendChild(price);
  dishBox.appendChild(dishTitle);

  // Create quantity and add to cart section
  const bottomRow = document.createElement("div");
  bottomRow.classList.add("dist-bottom-row");

  // Create quantity input
  const quantityDiv = document.createElement("div");
  quantityDiv.style.display = "flex";
  quantityDiv.style.gap = "10px";
  quantityDiv.style.alignItems = "center";
  quantityDiv.style.justifyContent = "center";
  quantityDiv.style.marginBottom = "20px";

  const quantityInput = document.createElement("input");
  quantityInput.type = "number";
  quantityInput.value = 0;
  quantityInput.min = 0;
  quantityInput.classList.add("form-input");
  quantityInput.style.width = "80px";
  quantityInput.style.height = "40px";
  quantityInput.style.textAlign = "center";

  // Add to cart button
  const addToCartButton = document.createElement("button");
  addToCartButton.textContent = "Add to Cart";
  addToCartButton.classList.add("dish-add-btn");
  addToCartButton.style.width = "auto";
  addToCartButton.style.padding = "0 20px";

  addToCartButton.addEventListener("click", () => {
    const quantity = parseInt(quantityInput.value);
    if (quantity > 0) {
      addToCart(menuItemData.itemName, quantity, menuItemData.price);
      alert(`${quantity} ${menuItemData.itemName}(s) added to cart!`);
      quantityInput.value = 0;
    } else {
      alert("Please select a quantity to add to the cart.");
    }
  });

  quantityDiv.appendChild(quantityInput);
  quantityDiv.appendChild(addToCartButton);
  bottomRow.appendChild(quantityDiv);
  dishBox.appendChild(bottomRow);

  // Assemble the card
  col.appendChild(dishBox);
  container.appendChild(col);
}

// Function to add item to cart
function addToCart(itemName, quantity, price) {
    // Check if the item is already in the cart
  
  const existingItemIndex = cart.findIndex((item) => item.name === itemName);

  if (existingItemIndex !== -1) {
    // If item exists, update the quantity
    cart[existingItemIndex].quantity += quantity;
  } else {
    // If item doesn't exist, add it to the cart
    cart.push({ name: itemName, quantity: quantity, price: price });
  }

  // Store the updated cart back to localStorage
    // localStorage.setItem("cart", JSON.stringify(cart));
    loadCartItems()
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


// Logout function
document.getElementById('logout').addEventListener('click', (event) => {
    logOut();
})


// Function to load cart items and display them
function loadCartItems() {
  
    listGroup.innerHTML = "";

    cart.forEach((item) => {
        const listItem = document.createElement("li");
        listItem.classList.add("list-group-item");
        listItem.textContent = `${item.name}: ${item.quantity} @ $${item.price.toFixed(2)}`;
        listGroup.appendChild(listItem);
    });
  }

//horizontal listing
function createFeaturedBusinessCard(businessUEN, businessData) {
  const featuredCards = document.getElementById('featured-cards');
  if (!featuredCards) {
      console.error("Featured cards container not found");
      return;
  }

  const card = document.createElement("div");
  card.classList.add("featured-business-card");

  try {
      // Create image container
      const imgContainer = document.createElement("div");
      imgContainer.classList.add("featured-img-container");
      
      const img = document.createElement('img');
      img.src = businessData.profilePic || './images/mealmate-logo-zip-file/png/logo-color.png';
      img.alt = businessData.busName || 'Business Image';
      img.onerror = function() {
          this.src = './images/mealmate-logo-zip-file/png/logo-color.png';
          console.log(`Failed to load profile picture for ${businessData.busName}, using placeholder`);
      };
      imgContainer.appendChild(img);

      // Create view button section similar to your existing cards
      const viewButton = document.createElement("button");
      viewButton.classList.add("dish-add-btn");
      viewButton.innerText = "View";
      
      // Create content container
      const content = document.createElement("div");
      content.classList.add("featured-content");
      
      const title = document.createElement("h3");
      title.classList.add("featured-title");
      title.innerText = businessData.busName || 'Unnamed Business';
      
      const locationP = document.createElement("p");
      locationP.classList.add("featured-info");
      locationP.innerText = businessData.address ? `📍 ${businessData.address}` : '📍 Address not available';
      
      const contactP = document.createElement("p");
      contactP.classList.add("featured-info");
      contactP.innerText = businessData.contactInfo ? `📞 ${businessData.contactInfo}` : '📞 Contact not available';

      // Assemble the card
      content.appendChild(title);
      content.appendChild(locationP);
      content.appendChild(contactP);
      content.appendChild(viewButton);
      card.appendChild(imgContainer);
      card.appendChild(content);

      // Add click event
      card.addEventListener("click", () => {
          history.pushState(
              { businessUEN, businessName: businessData.busName },
              '', 
              `?business=${businessUEN}`
          );
        fetchAndDisplayMenuItems(businessUEN, businessData.busName);
        
      });

      featuredCards.appendChild(card);
  } catch (error) {
      console.error("Error creating featured business card:", error);
  }
}

function resetCart() {
  cart = [];
  loadCartItems();
}

// Add horizontal scroll functionality
// Update the horizontal scroll functionality
function initializeHorizontalScroll() {
  const scrollWrapper = document.querySelector('.business-scroll-wrapper');
  const container = document.querySelector('.horizontal-scroll-container');
  if (!scrollWrapper || !container) return;

  // Create arrows if they don't exist
  let prevButton = container.querySelector('.prev-arrow');
  let nextButton = container.querySelector('.next-arrow');

  if (!prevButton) {
    prevButton = document.createElement('button');
    prevButton.className = 'scroll-arrow prev-arrow';
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    container.insertBefore(prevButton, scrollWrapper);
  }

  if (!nextButton) {
    nextButton = document.createElement('button');
    nextButton.className = 'scroll-arrow next-arrow';
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    container.appendChild(nextButton);
  }

  // Calculate the scroll amount based on card width + gap
  const scrollAmount = 330; // 300px card width + 30px gap

  // Remove existing event listeners (if any) to prevent duplicates
  prevButton.replaceWith(prevButton.cloneNode(true));
  nextButton.replaceWith(nextButton.cloneNode(true));
  
  // Get the fresh references after replacing
  prevButton = container.querySelector('.prev-arrow');
  nextButton = container.querySelector('.next-arrow');

  // Add click event listeners
  prevButton.addEventListener('click', () => {
    scrollWrapper.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    });
  });

  nextButton.addEventListener('click', () => {
    scrollWrapper.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  });

  // Function to update arrow visibility
  const updateArrowVisibility = () => {
    const isAtStart = scrollWrapper.scrollLeft <= 0;
    const isAtEnd = scrollWrapper.scrollLeft >= (scrollWrapper.scrollWidth - scrollWrapper.clientWidth - 10);
    
    prevButton.style.display = isAtStart ? 'none' : 'flex';
    nextButton.style.display = isAtEnd ? 'none' : 'flex';
  };

  // Add scroll event listener
  scrollWrapper.addEventListener('scroll', updateArrowVisibility);

  // Add resize event listener to handle window resizing
  window.addEventListener('resize', updateArrowVisibility);

  // Initial visibility check
  // Wait for a short moment to ensure content is loaded
  setTimeout(() => {
    updateArrowVisibility();
  }, 100);
}