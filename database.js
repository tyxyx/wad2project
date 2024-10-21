
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
  import { getFirestore, collection, getDocs, getDoc, doc, setDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
  import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
 
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCQaBzoODvEpUiqunlogkNjne8L-8UNZJk",
    authDomain: "wad2proj-f105e.firebaseapp.com",
    projectId: "wad2proj-f105e",
    storageBucket: "wad2proj-f105e.appspot.com",
    messagingSenderId: "154785765446",
    appId: "1:154785765446:web:765ccaaa71d2f5b68b5247"
  };

  // Initialize Firebase
  export const app = initializeApp(firebaseConfig);

  export const db = getFirestore(app)

  export const auth = getAuth(app)

  export const userDetailsCollection = collection(db, "userDetails")

  // To get the collection: const x = collection(db, collectionName)
  //const userLogin = collection(db, "userDetails")

  //console.log(getDoc(userLogin))

  export async function getData(collectionName) {
    const snapshot = await getDocs(collectionName);
    const dataList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()  // Spread operator to include all fields
    }));
    
    console.log(dataList); // This will output an array of document data
    return dataList
  }

  export async function getFieldValue(collectionName, docId, fieldName) {
    try {
      // Reference to the document in the Firestore collection
      const docRef = doc(db, collectionName, docId);
  
      // Get the document snapshot
      const docSnap = await getDoc(docRef);
  
      // Check if the document exists
      if (docSnap.exists()) {
        // Retrieve and return the specific field value
        return docSnap.data()[fieldName]; // Access the specific field by name
      } else {
        console.log("No such document!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      return null;
    }
  }

  export function createUser(name, email, password) {
    return createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        return user
      })
      .catch((error) => {
        throw error
      })
  }

  export function loginUser(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        return user
      })
      .catch((error) => {
        console.log(error)
        throw error
      })
  }

  function uenToEmail(uen) {
    return `${uen}@example.com`; // Append the UEN to a domain to make it a valid email
  }


  export function createUserWithUEN(uen, password) {
    const email = uenToEmail(uen);  // Convert UEN to an email format
    return createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("User created successfully:", user);
            return user;
        })
        .catch((error) => {
            console.error("Error creating user:", error);
            throw error;
        });
  }

  export function loginBusinessWithUEN(uen, password) {
    const email = uenToEmail(uen);  // Convert UEN to email format
    return signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            return user;
        })
        .catch((error) => {
            throw error;
        });
  }

  export async function saveBusinessDetails(uen, userId, name) {
    try {
      await setDoc(doc(db, "businessLogin", uen), {
        uen: uen,
        busName: name,
        createdAt: Timestamp.fromDate(new Date()),
        userId: userId,
      });
    } catch (error) {
      console.error("Error saving business details:", error);
      throw new Error("Business details could not be saved. " + error.message);
    }
  }

  export async function saveUserDetails(name, email) {
    try {
      await setDoc(doc(db, "userLogin", email), {
        fullName: name,
        email: email
      });
    } catch (error) {
      console.error("Error saving user details:", error);
      throw new Error("User details could not be saved." + error.message);
    }
  }




  


