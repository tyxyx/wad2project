import { auth, db } from "./database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { mapsApi } from "./configure.js";
let apiKey = mapsApi.mapsApi;
let businessUEN = null;
let businessFields = null;
let place_id = null; 
// Check authentication state
onAuthStateChanged(auth, async (user) => {
  if (user) {
    businessUEN = user.email.split("@")[0].toUpperCase();
    const businessDoc = await getDoc(doc(db, "businessLogin", businessUEN));
    if (businessDoc.exists()) {
      businessFields = businessDoc.data();
      place_id = businessFields.placeId;
      console.log(place_id);

      await fetchPlaceReviews();
    } else {
      alert("error fetching details")
      window.location.href = "./login.html?mode=login";
    }
  } else {
    window.location.href = "./login.html?mode=login";
  }
});

async function fetchPlaceReviews() {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${apiKey}`;

  console.log(url)
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data = await response.json();
    const reviews = data.result.reviews; // Access the reviews array
    console.log(reviews); // Log reviews to the console
    // Store reviews in a variable
    return reviews; // Return the reviews array
  } catch (error) {
    console.error("Error fetching place reviews:", error);
  }
}



