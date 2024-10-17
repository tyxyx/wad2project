
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
  import { getFirestore, collection, getDocs, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
  import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
 
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
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

  export function createUser(email, password) {
    return createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
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



