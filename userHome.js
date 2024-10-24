import { db, auth } from "../wad2project/database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
  } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";


let currentUserDetails = null;
let userEmail = null; 

// Listen for authentication state changes
onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        userEmail = user.email
        const userDoc = await fetchUserName(userEmail);
        console.log(userDoc)
  
        if (userDoc.exists()) {
            console.log("hello")
        } else {
          redirectToLogin();
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        alert("Failed to load user details. Please try again later.");
        redirectToLogin()
      }
    } else {
      redirectToLogin();
    }
  });

  
async function fetchUserName(userEmail) {
    return await getDoc(doc(db, "userLogin", userEmail));
}

function redirectToLogin() {
    window.location.href = "./login.html?mode=login";
  }

  console.log(collection(db, 'businessLogin'))