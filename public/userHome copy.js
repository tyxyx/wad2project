import { db, auth, logOut } from "./database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

let userEmail = null;
let cart = [];
let listGroup = [];
let placeId = "";
const overlay = document.createElement("div");
overlay.className = "loading-overlay";
const spinner = document.createElement("div");
spinner.className = "loading-spinner";
overlay.appendChild(spinner);
document.body.appendChild(overlay);
// Listen for authentication state changes
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const logout = document.getElementById("logout");
      logout.addEventListener("click", logOut);

      userEmail = user.email;
      const userDoc = await fetchUserName(userEmail);

      if (userDoc.exists()) {
        // Fetch and display businesses
        await fetchBusinessCards();
      } else {
        overlay.remove();
        redirectToLogin();
      }

      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
        overlay.remove();
      }, 1000);
    } catch (error) {
      console.error("Error fetching user details:", error);
      alert("Failed to load user details. Please try again later.");
      if (document.querySelector(".loading-overlay")) {
        document.querySelector(".loading-overlay").remove();
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

async function fetchBusinessCards() {
  try {
    // Clear existing cards from both containers

    const menuDish = document.getElementById("menu-dish");
    const featuredCards = document.getElementById("featured-cards");

    if (menuDish) menuDish.innerHTML = "";
    if (featuredCards) featuredCards.innerHTML = "";

    const businessQuerySnapshot = await getDocs(
      collection(db, "businessLogin")
    );

    businessQuerySnapshot.forEach((businessDoc) => {
      const businessData = businessDoc.data();

      // Create vertical card for "All businesses" section
      // console.log(businessData);
      if (
        businessData.profilePic &&
        businessData.address &&
        businessData.contactInfo
      ) {
        getAvgRating(businessData.uen, businessData.placeId);
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
async function createBusinessCard(businessUEN, businessData) {
  const menuDish = document.getElementById("menu-dish");
  if (!menuDish) {
    console.error("Menu dish container not found");
    return;
  }
  
  // Create outer column div with proper grid classes
  const colDiv = document.createElement("div");
  colDiv.classList.add("col-lg-4", "col-sm-6", "mb-4", "center-col");

  // Create card
  const card = document.createElement("div");
  card.classList.add("featured-business-card"); // Use same class as horizontal cards

  try {
    // Create image container
    const imgContainer = document.createElement("div");
    imgContainer.classList.add("featured-img-container"); // Use same class as horizontal cards

    const img = document.createElement("img");
    img.src = businessData.profilePic || "./images/mealmate-logo-zip-file/png/logo-color.png";
    img.alt = businessData.busName || "Business Image";
    img.onerror = function() {
      this.src = "./images/mealmate-logo-zip-file/png/logo-color.png";
    };
    imgContainer.appendChild(img);

    // Create content container with same classes as horizontal cards
    const content = document.createElement("div");
    content.classList.add("featured-content");

    const contentTitleAndRating = document.createElement("div");
    contentTitleAndRating.classList.add("featured-content-title-and-rating");

    const title = document.createElement("h3");
    title.classList.add("featured-title");
    if (businessData.busName.length > 20) {
      const displayTitle = businessData.busName.slice(0, 20) + " ...";
      title.innerText = displayTitle;
    } else {
      title.innerText = businessData.busName;
    }

    const locationP = document.createElement("p");
    locationP.classList.add("featured-info");
    if (businessData.address.length > 20) {
      const displayAddress = businessData.address.slice(0, 20) + " ...";
      locationP.innerText = `📍 ${displayAddress}`;
    } else {
      locationP.innerText = `📍 ${businessData.address}`;
    }

    const stars = document.createElement("p");
    stars.classList.add("featured-info-rating");
    stars.innerText = businessData.avgRating 
      ? `⭐ ${businessData.avgRating}/5.0` 
      : "⭐ Rating not available";

    // Assemble the card
    contentTitleAndRating.appendChild(title);
    contentTitleAndRating.appendChild(stars);
    content.appendChild(contentTitleAndRating);
    content.appendChild(locationP);

    card.appendChild(imgContainer);
    card.appendChild(content);

    // Add click event
    card.addEventListener("click", () => {
      history.pushState(
        { businessUEN, businessName: businessData.busName },
        "",
        `?business=${businessUEN}`
      );
      fetchAndDisplayMenuItems(businessUEN, businessData.busName);
    });

    // Append card to column div and column to container
    colDiv.appendChild(card);
    menuDish.appendChild(colDiv);

  } catch (error) {
    console.error("Error creating business card:", error);
  }

  // new all biz cards END

  // Create card element
  // const card = document.createElement("div");
  // card.classList.add("col-lg-4", "col-sm-6", "dish-box-wp", "breakfast");
  // card.style.height = "450px"; // Ensure consistent card height
  // card.setAttribute("data-cat", "breakfast");

  // Create dish-box
  // const dishBox = document.createElement("div");
  // dishBox.classList.add("dish-box", "text-center");

  // Create distImg container for image
  // const distImg = document.createElement("div");
  // distImg.classList.add("dist-img");
  //distImg.style.width = "200px"; // Ensure container is square
  //distImg.style.height = "200px"; // Ensure container is square
  //distImg.style.borderRadius = "50%"; // Make the container circular
  //distImg.style.overflow = "hidden"; // Prevent overflow
  //distImg.style.margin = "0 auto"; // Center the image in the card

  // Create image element
  // const img = document.createElement("img");
  // img.src = businessData.profilePic || "./images/default-profile.png"; // Fallback image
  // img.style.width = "100%";
  // img.style.height = "100%";
  // img.style.objectFit = "cover"; // Ensure the image covers the container
  // img.style.display = "block"; // Ensure no extra space below the image

  // distImg.appendChild(img);
  // dishBox.appendChild(distImg);

  // // Create dish title section
  // const dishTitle = document.createElement("div");
  // dishTitle.classList.add("dist-title");
  // const h3Title = document.createElement("h3");
  // h3Title.classList.add("h3-title");
  // h3Title.innerText = businessData.busName;
  // const locationP = document.createElement("p");
  // locationP.innerText = `📍 ${businessData.address}`;
  // const stars = document.createElement("p");
  // stars.innerText = businessData.avgRating
  //   ? `⭐ ${businessData.avgRating}/5.0`
  //   : "⭐ Rating not available";
  // const contactP = document.createElement("p");
  // contactP.innerText = `📞 ${businessData.contactInfo}`;
  // dishTitle.appendChild(h3Title);
  // dishTitle.appendChild(locationP);
  // dishTitle.appendChild(stars);
  // dishTitle.appendChild(contactP);
  // dishBox.appendChild(dishTitle);

  // // Create view button section
  // const viewButtonSection = document.createElement("div");
  // viewButtonSection.classList.add("dist-bottom-row");
  // const viewButton = document.createElement("button");
  // viewButton.classList.add("dish-add-btn");
  // viewButton.innerText = "View";
  // viewButtonSection.appendChild(viewButton);
  // dishBox.appendChild(viewButtonSection);

  // // Append dishBox into card
  // card.appendChild(dishBox);
  // menuDish.appendChild(card);

  // Add event listener to the card-like element
  // card.addEventListener("click", () => {
  //   // Update URL to include business ID to allow browser back
  //   history.pushState(
  //     { businessUEN, businessName: businessData.busName },
  //     "",
  //     `?business=${businessUEN}`
  //   );
  //   fetchAndDisplayMenuItems(businessUEN, businessData.busName);
  // });

  // Append the card-like elem into the container
  // menuDish.appendChild(card);
}

//new  fetchAndDisplayMenuItems
async function fetchAndDisplayMenuItems(businessUEN, businessName) {
  setTimeout(() => {
    window.dispatchEvent(new Event("resize"));
    overlay.remove();
  }, 1000);
  try {
    resetCart();
    const menuItemsSnapshot = await getDocs(
      collection(db, `businessLogin/${businessUEN}/menuItems`)
    );

    const docSnap = await getDoc(doc(db, `businessLogin/${businessUEN}`));

    if (docSnap.exists()) {
      placeId = docSnap.data().placeId;
      await fetchPlaceReviews(placeId);
    } else {
      alert("error getting reviews");
    }

    const ftb = document.getElementById("featured-businesses");
    ftb.classList.add("d-none");

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
      // Retrieve cart data from localStorage and parse it

      // Check if the cart exists and contains items
      if (cart.length > 0) {
        // Proceed with saving business info and redirecting to the cart page
        localStorage.setItem("businessId", JSON.stringify(businessUEN));
        localStorage.setItem("cart", JSON.stringify(cart)); // Ensure cart is saved
        localStorage.setItem("businessName", JSON.stringify(businessName));
        localStorage.removeItem("currentOrderId");
        localStorage.removeItem("orderCreationTime");
        window.location.href = "cart.html";
      } else {
        // If cart is empty, show an alert or notify the user
        alert(
          "Your cart is empty. Please add items to the cart before ordering."
        );
      }
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
      document.getElementById("reviews").innerHTML = "";
      const header = document.getElementById("review-subheader");
      header.firstChild.textContent = "Click on a business to discover";
      header.querySelector("span").textContent = "what others think";
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
    const targetElement = document.getElementById("displayMenu");
    const offset = 90; // Adjust this value as needed

    // Get the position of the element and scroll to slightly above it
    window.scrollTo({
      top:
        targetElement.getBoundingClientRect().top + window.pageYOffset - offset,
      behavior: "smooth",
    });
  } catch (error) {
    console.error("Error fetching menu items:", error);
  }
}

window.addEventListener("popstate", async (event) => {
  const menuDish = document.getElementById("menu-dish");
  menuDish.innerHTML = "";
  const ftb = document.getElementById("featured-businesses");
  ftb.classList.remove("d-none");
  await fetchBusinessCards();
});

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
  img.src =
    menuItemData.images && menuItemData.images.length > 0
      ? menuItemData.images[0]
      : "./images/mealmate-logo-zip-file/png/logo-color.png";
  img.onerror = () => {
    img.src = "./images/mealmate-logo-zip-file/png/logo-color.png";
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
  loadCartItems();
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
document.getElementById("logout").addEventListener("click", (event) => {
  logOut();
});

// Function to load cart items and display them
function loadCartItems() {
  listGroup.innerHTML = "";

  cart.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.classList.add("list-group-item");
    listItem.textContent = `${item.name}: ${
      item.quantity
    } @ $${item.price.toFixed(2)}`;
    listGroup.appendChild(listItem);
  });
}

//horizontal listing
function createFeaturedBusinessCard(businessUEN, businessData) {
  const featuredCards = document.getElementById("featured-cards");
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

    const img = document.createElement("img");
    img.src =
      businessData.profilePic ||
      "./images/mealmate-logo-zip-file/png/logo-color.png";
    img.alt = businessData.busName || "Business Image";
    img.onerror = function () {
      this.src = "./images/mealmate-logo-zip-file/png/logo-color.png";
      console.log(
        `Failed to load profile picture for ${businessData.busName}, using placeholder`
      );
    };
    imgContainer.appendChild(img);

    // Create view button section similar to your existing cards
    const viewButton = document.createElement("button");
    viewButton.classList.add("dish-add-btn");
    viewButton.innerText = "View";

    // Create content container
    const content = document.createElement("div");
    content.classList.add("featured-content");

    const contentTitleAndRating = document.createElement("div");
    contentTitleAndRating.classList.add("featured-content-title-and-rating");


    const title = document.createElement("h3");
    title.classList.add("featured-title");
    // check for business name length before populating horizontal cards
    if(businessData.busName.length > 20){
      const dislpayTitle = businessData.busName.slice(0, 20) + " ...";
      title.innerText = dislpayTitle || "Unnamed Business";
    }
    else{
      title.innerText = businessData.busName || "Unnamed Business";
    }
    // title.innerText = businessData.busName || "Unnamed Business";
    


    const locationP = document.createElement("p");
    locationP.classList.add("featured-info");
    // check for address length before populating horizontal cards
    if(businessData.address.length > 20){
      const dislpayAddress = businessData.address.slice(0, 20) + " ...";
      locationP.innerText = dislpayAddress
      ? `📍 ${dislpayAddress}`
      : "📍 Address not available";
    }
    else{
      locationP.innerText = businessData.address
      ? `📍 ${businessData.address}`
      : "📍 Address not available";
    }

    // ori
    // locationP.innerText = businessData.address
    //   ? `📍 ${businessData.address}`
    //   : "📍 Address not available";

    const stars = document.createElement("p");
    stars.classList.add("featured-info-rating");
    stars.innerText = businessData.avgRating
      ? `⭐ ${businessData.avgRating}/5.0`
      : "⭐ Rating not available";


    const contactP = document.createElement("p");
    contactP.classList.add("featured-info");
    contactP.innerText = businessData.contactInfo
      ? `📞 ${businessData.contactInfo}`
      : "📞 Contact not available";

    contentTitleAndRating.appendChild(title);
    contentTitleAndRating.appendChild(stars);
    // Assemble the card
    // content.appendChild(stars);
    content.appendChild(contentTitleAndRating)
    // content.appendChild(title); this

    content.appendChild(locationP);
    // content.appendChild(stars);
    // content.appendChild(contactP);
    // content.appendChild(viewButton);

    // content.appendChild(stars); this

    card.appendChild(imgContainer);
    card.appendChild(content);

    // Add click event
    card.addEventListener("click", () => {
      history.pushState(
        { businessUEN, businessName: businessData.busName },
        "",
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
  const scrollWrapper = document.querySelector(".business-scroll-wrapper");
  const container = document.querySelector(".horizontal-scroll-container");
  if (!scrollWrapper || !container) return;

  // Create arrows if they don't exist
  let prevButton = container.querySelector(".prev-arrow");
  let nextButton = container.querySelector(".next-arrow");

  if (!prevButton) {
    prevButton = document.createElement("button");
    prevButton.className = "scroll-arrow prev-arrow";
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    container.insertBefore(prevButton, scrollWrapper);
  }

  if (!nextButton) {
    nextButton = document.createElement("button");
    nextButton.className = "scroll-arrow next-arrow";
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    container.appendChild(nextButton);
  }

  // Calculate the scroll amount based on card width + gap
  const scrollAmount = 330; // 300px card width + 30px gap

  // Remove existing event listeners (if any) to prevent duplicates
  prevButton.replaceWith(prevButton.cloneNode(true));
  nextButton.replaceWith(nextButton.cloneNode(true));

  // Get the fresh references after replacing
  prevButton = container.querySelector(".prev-arrow");
  nextButton = container.querySelector(".next-arrow");

  // Add click event listeners
  prevButton.addEventListener("click", () => {
    scrollWrapper.scrollBy({
      left: -scrollAmount,
      behavior: "smooth",
    });
  });

  nextButton.addEventListener("click", () => {
    scrollWrapper.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  });

  // Function to update arrow visibility
  const updateArrowVisibility = () => {
    const isAtStart = scrollWrapper.scrollLeft <= 0;
    const isAtEnd =
      scrollWrapper.scrollLeft >=
      scrollWrapper.scrollWidth - scrollWrapper.clientWidth - 10;

    prevButton.style.display = isAtStart ? "none" : "flex";
    nextButton.style.display = isAtEnd ? "none" : "flex";
  };

  // Add scroll event listener
  scrollWrapper.addEventListener("scroll", updateArrowVisibility);

  // Add resize event listener to handle window resizing
  window.addEventListener("resize", updateArrowVisibility);

  // Initial visibility check
  // Wait for a short moment to ensure content is loaded
  setTimeout(() => {
    updateArrowVisibility();
  }, 100);
}

async function fetchPlaceReviews(placeId) {
  const url = `../api/reviews?placeId=${placeId}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.log(response);
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data = await response.json();
    const reviews = data.reviews;

    displayReviews(reviews);
  } catch (error) {
    console.error("Error fetching place reviews:", error);
  }
}

async function getAvgRating(businessUEN, placeId) {
  const url = `../api/reviews?placeId=${placeId}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.log(response);
      throw new Error("Network response was not ok " + response.statusText);
    }

    const data = await response.json();
    const avgRating = data.rating;

    setAvgRating(businessUEN, avgRating);
  } catch (error) {
    console.error("Error fetching place reviews:", error);
  }
}

async function setAvgRating(businessUEN, rating) {
  try {
    await setDoc(
      doc(db, "businessLogin", businessUEN),
      {
        avgRating: rating,
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error updating avg rating:", error);
  }
}

function generateStars(rating) {
  let stars = "";
  for (let i = 0; i < 5; i++) {
    stars += i < rating ? "⭐" : "☆";
  }
  return stars;
}

function displayReviews(reviews) {
  const header = document.getElementById("review-subheader");
  header.firstChild.textContent = "Check out what";
  header.querySelector("span").textContent = "others think";

  const reviewsList = document.getElementById("reviews");
  reviewsList.innerHTML = "";
  reviews.forEach((review) => {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card", "mb-3");

    const cardBodyDiv = document.createElement("div");
    cardBodyDiv.classList.add("card-body");

    const headerDiv = document.createElement("div");
    headerDiv.classList.add("d-flex", "justify-content-between");

    const authorName = document.createElement("h5");
    authorName.classList.add("card-title");
    authorName.textContent = review.author_name;

    const ratingDiv = document.createElement("div");
    ratingDiv.classList.add("d-flex", "align-items-center");
    const ratingLabel = document.createElement("span");
    ratingLabel.classList.add("me-2");
    ratingLabel.textContent = "Rating:";
    const ratingBadge = document.createElement("span");
    ratingBadge.classList.add("badge", "bg-warning", "text-dark");
    ratingBadge.textContent = generateStars(review.rating);

    ratingDiv.appendChild(ratingLabel);
    ratingDiv.appendChild(ratingBadge);

    headerDiv.appendChild(authorName);
    headerDiv.appendChild(ratingDiv);

    const timeParagraph = document.createElement("p");
    timeParagraph.classList.add("text-muted");
    timeParagraph.textContent = `Posted ${review.relative_time_description}`;

    const reviewTextParagraph = document.createElement("p");
    reviewTextParagraph.classList.add("card-text");
    reviewTextParagraph.textContent = review.text;

    cardBodyDiv.appendChild(headerDiv);
    cardBodyDiv.appendChild(timeParagraph);
    cardBodyDiv.appendChild(reviewTextParagraph);

    cardDiv.appendChild(cardBodyDiv);

    reviewsList.appendChild(cardDiv);
  });
}