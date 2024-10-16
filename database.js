
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
  import { getFirestore, collection, getDocs, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
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
    appId: "1:154785765446:web:f028407e8bf71f508b5247"
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



