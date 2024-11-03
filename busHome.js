import { db, auth } from "./database.js";
import {
    collection,
    doc,
    setDoc,
    getDoc,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

import { mapsApi } from "./configure";
let apiKey = mapsApi.mapsApi;
let map;
let autocomplete;
let marker;
let selectedAddress;
let businessUEN = null;
let currentProfilePic = '';
let oldProfilePicRef = null;
let place_id = '';

// Listen for authentication state changes
onAuthStateChanged(auth, async(user) => {
    if (user) {
        businessUEN = user.email.split("@")[0].toUpperCase();
        const businessDoc = await fetchBusinessName(businessUEN);

        if (businessDoc.exists()) {
            const businessFields = businessDoc.data();

            if (!(businessFields.contactInfo && businessFields.profilePic && businessFields.address)) {
                const myModal = document.getElementById('staticBackdrop');
                const bsModal = new bootstrap.Modal(myModal);
                bsModal.show();
                setupFormHandlers();
            } else {
                currentProfilePic = businessFields.profilePic
                oldProfilePicRef = ref(getStorage(), businessFields.profilePic)
                document.getElementById('businessName').innerText = businessFields.busName;
                document.getElementById('addressDisplay').innerText = businessFields.address
                document.getElementById('contactDisplay').innerText = businessFields.contactInfo
                const profileContainer = document.getElementById('profilePicContainer')
                const img = document.createElement('img')
                profileContainer.appendChild(img)
                img.src = businessFields.profilePic
            }
            
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);

        } else {
            redirectToLogin();
        }
    } else {
        redirectToLogin();
    }
});

function redirectToLogin() {
    window.location.href = "./login.html?mode=login";
}

async function fetchBusinessName(businessUEN) {
    return await getDoc(doc(db, "businessLogin", businessUEN));
}

function setupFormHandlers() {
    // Profile picture click handler
    const profilePicWrapper = document.querySelector('.profile-pic-wrapper');
    const profilePicInput = document.querySelector('.profile-pic-input');
    
    profilePicWrapper.addEventListener('click', () => {
        profilePicInput.click();
    });

    // Profile picture preview handler
    profilePicInput.addEventListener('change', handleImagePreview);

    // Form submission handler
    const form = document.getElementById('onboardingForm');
    form.addEventListener('submit', handleOnboardingSubmit);
}

function handleImagePreview(e) {
    const file = e.target.files[0];
    const profilePicCircle = document.querySelector('.profile-pic-circle');
    
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-danger mt-2';
            alertDiv.setAttribute('role', 'alert');
            alertDiv.textContent = 'File size must be less than 5MB';
            
            const existingAlert = profilePicCircle.parentElement.querySelector('.alert');
            if (existingAlert) {
                existingAlert.remove();
            }
            
            profilePicCircle.parentElement.appendChild(alertDiv);
            e.target.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            // Clear existing content
            profilePicCircle.textContent = '';
            
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            
            profilePicCircle.appendChild(img);
            
            const existingAlert = profilePicCircle.parentElement.querySelector('.alert');
            if (existingAlert) {
                existingAlert.remove();
            }
        }
        reader.readAsDataURL(file);
    }
}

async function handleOnboardingSubmit(e) {
    e.preventDefault();
    e.stopPropagation();

    const form = e.target;
    if (form.checkValidity()) {
        const submitButton = document.getElementById('submit');
        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Saving...';

            const address = document.getElementById('location').value;
            const contact = document.getElementById('contact').value;
            const profilePicFile = document.getElementById('profilePic').files[0];

            const storage = getStorage();
            let profilePicUrl = '';

            if (profilePicFile) {
                if (profilePicFile.size > 5 * 1024 * 1024) {
                    throw new Error('File size must be less than 5MB');
                }
                if (!profilePicFile.type.startsWith('image/')) {
                    throw new Error('File must be an image');
                }

                const timestamp = new Date().getTime();
                const fileName = `${timestamp}_${profilePicFile.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
                const storageRef = ref(storage, `businessProfiles/${businessUEN}/${fileName}`);

                await uploadBytes(storageRef, profilePicFile);
                profilePicUrl = await getDownloadURL(storageRef);
            }

            // Update Firestore document
            const businessRef = doc(db, "businessLogin", businessUEN);
            await setDoc(businessRef, {
                address: address,
                contactInfo: contact,
                profilePic: profilePicUrl,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            // Hide modal
            const myModal = document.getElementById('staticBackdrop');
            const bsModal = bootstrap.Modal.getInstance(myModal);
            bsModal.hide();

            // Show success message
            const successAlert = document.createElement('div');
            successAlert.className = 'alert alert-success alert-dismissible fade show';
            successAlert.setAttribute('role', 'alert');
            
            const successMessage = document.createElement('span');
            successMessage.textContent = 'Business information saved successfully!';
            
            const closeButton = document.createElement('button');
            closeButton.className = 'btn-close';
            closeButton.setAttribute('data-bs-dismiss', 'alert');
            closeButton.setAttribute('aria-label', 'Close');
            
            successAlert.appendChild(successMessage);
            successAlert.appendChild(closeButton);
            document.getElementById('onboard').appendChild(successAlert);

            // Reload page after success
            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (error) {
            console.error('Error saving business information:', error);
            
            const errorAlert = document.createElement('div');
            errorAlert.className = 'alert alert-danger mt-3';
            errorAlert.setAttribute('role', 'alert');
            errorAlert.textContent = `Error saving information: ${error.message}. Please try again.`;
            
            const modalBody = document.querySelector('.modal-body');
            modalBody.insertBefore(errorAlert, document.getElementById('onboardingForm'));
            
            // Reset button state
            submitButton.disabled = false;
            submitButton.textContent = 'Submit';
        }
    }

    form.classList.add('was-validated');
}

// Add to busHome.js

// Event listener for edit button
document.addEventListener('DOMContentLoaded', () => {
    const editBtn = document.getElementById('editProfileBtn');
    if (editBtn) {
        editBtn.addEventListener('click', handleEditClick);
    }

    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', handleCancelEdit);
    }

    const saveBtn = document.getElementById('saveProfileBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', handleSaveProfile);
    }

    // Set up profile picture change handler
    const profilePicContainer = document.getElementById('profilePicContainer');

    profilePicContainer.addEventListener('click', () => {
        if (document.getElementById('editMode').classList.contains('d-none')) return;
        document.getElementById('profilePicInput').click();
    });

    profilePicInput.addEventListener('change', handleProfilePicChange);

});

function handleEditClick() {
    const viewMode = document.getElementById('viewMode');
    const editMode = document.getElementById('editMode');
    const addressInput = document.getElementById('addressInput');
    const contactInput = document.getElementById('contactInput');
    
    // Get current values
    const currentAddress = document.getElementById('addressDisplay').textContent;
    const currentContact = document.getElementById('contactDisplay').textContent;

    // Set input values
    addressInput.value = currentAddress;
    contactInput.value = currentContact;

    if (profilePicContainer.querySelector('img')) {
        const img = profilePicContainer.querySelector('img');
        img.style.cursor = 'pointer';
        
        const overlay = document.createElement('div');
        overlay.className = 'profile-pic-overlay';
        overlay.id = 'overlay';
        
        const icon = document.createElement('i');
        icon.className = 'bi bi-pencil';
        
        const text = document.createElement('span');
        text.innerText = ' Change Photo';
        
        overlay.appendChild(icon);
        overlay.appendChild(text);
        profilePicContainer.appendChild(overlay);
    }

    // Switch modes
    viewMode.classList.add('d-none');
    editMode.classList.remove('d-none');

    loadGoogleMapsApi();
}

function handleCancelEdit() {
    const viewMode = document.getElementById('viewMode');
    const editMode = document.getElementById('editMode');
    const profilePicContainer = document.getElementById('profilePicContainer')
    const picEdit = document.getElementById("picEdit")
    const overlay = document.getElementById('overlay')
    profilePicContainer.removeChild(overlay)
    const profilePicInput = document.getElementById('profilePicInput');
    if (profilePicInput) {
        profilePicInput.value = '';
    }

    // Switch back to view mode
    editMode.classList.add('d-none');
    viewMode.classList.remove('d-none');
    profilePicContainer.classList.remove('d-none')
    picEdit.classList.add("d-none")
}

function handleProfilePicChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    // Preview the image
    const reader = new FileReader();
    reader.onload = (e) => {
        const profilePicContainer = document.getElementById("profilePicContainer")
        profilePicContainer.classList.add('d-none')
        const picEdit = document.getElementById('picEdit');
        picEdit.classList.remove("d-none")
        picEdit.textContent = '';
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        picEdit.appendChild(img);
    };
    reader.readAsDataURL(file);
}

async function handleSaveProfile() {
    try {
        const saveBtn = document.getElementById('saveProfileBtn');
        const addressInput = document.getElementById('addressInput');
        const contactInput = document.getElementById('contactInput');
        const profilePicInput = document.getElementById('profilePicInput');
        const profilePicContainer = document.getElementById('profilePicContainer');


        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';

        let profilePicUrl = null;
        
        // Handle profile picture upload if a new one was selected
        if (profilePicInput.files[0]) {
            const storage = getStorage();
            const timestamp = new Date().getTime();
            const fileName = `${timestamp}_${profilePicInput.files[0].name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
            const storageRef = ref(storage, `businessProfiles/${businessUEN}/${fileName}`);

            await uploadBytes(storageRef, profilePicInput.files[0]);
            profilePicUrl = await getDownloadURL(storageRef);
        }

        // Prepare update data
        const updateData = {
            address: addressInput.value,
            contactInfo: contactInput.value,
            updatedAt: new Date().toISOString(),
            placeId: place_id
        };

        // Only add profilePic to update if a new one was uploaded
        if (profilePicUrl) {
            updateData.profilePic = profilePicUrl;
            // delete old profile pic from storage
            if (oldProfilePicRef) {
                await deleteObject(oldProfilePicRef);
            }
            // Update the oldProfilePicRef for future changes
            oldProfilePicRef = ref(getStorage(), profilePicUrl);
            currentProfilePic = profilePicUrl;

            // Update the profile picture display
            if (profilePicContainer) {
                const img = profilePicContainer.querySelector('img');
                if (img) {
                    img.src = profilePicUrl;
                } else {
                    const newImg = document.createElement('img');
                    newImg.src = profilePicUrl;
                    profilePicContainer.appendChild(newImg);
                }
            }
        }

        // Update Firestore
        const businessRef = doc(db, "businessLogin", businessUEN);
        await setDoc(businessRef, updateData, { merge: true });

        // Update display
        document.getElementById('addressDisplay').textContent = addressInput.value;
        document.getElementById('contactDisplay').textContent = contactInput.value;

        // Switch back to view mode
        handleCancelEdit();

        // Show success message
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show';
        alertDiv.setAttribute('role', 'alert');
        alertDiv.textContent = 'Profile updated successfully!';
        
        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'btn-close';
        closeButton.setAttribute('data-bs-dismiss', 'alert');
        closeButton.setAttribute('aria-label', 'Close');
        
        alertDiv.appendChild(closeButton);
        
        const profileBox = document.querySelector('.profile-box');
        profileBox.parentNode.insertBefore(alertDiv, profileBox);

        // Remove alert after 3 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);

    } catch (error) {
        console.error('Error updating profile:', error);
        
        // Show error message
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show';
        alertDiv.setAttribute('role', 'alert');
        alertDiv.textContent = 'Error updating profile. Please try again.';
        
        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'btn-close';
        closeButton.setAttribute('data-bs-dismiss', 'alert');
        closeButton.setAttribute('aria-label', 'Close');
        
        alertDiv.appendChild(closeButton);
        
        const profileBox = document.querySelector('.profile-box');
        profileBox.parentNode.insertBefore(alertDiv, profileBox);

    } finally {
        // Reset save button
        const saveBtn = document.getElementById('saveProfileBtn');
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
    }
}



async function loadGoogleMapsApi() {
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.async = true;
  script.onload = initMap;
  document.head.appendChild(script);
}

async function initMap() {
  // Import the Map and Autocomplete classes
  const { Map, Autocomplete } = await google.maps.importLibrary("maps");

  // Initialize the map
  map = new Map(document.getElementById("map"), {
    center: { lat: 1.3521, lng: 103.8198 }, // Center on Singapore
    zoom: 12,
  });

  // Set up the autocomplete feature
    const input = document.getElementById("addressInput");
  autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.setComponentRestrictions({
    country: ["sg"],
  });

  autocomplete.setFields(["place_id", "name", "geometry", "formatted_address"]);
  autocomplete.bindTo("bounds", map);
  autocomplete.setTypes(["restaurant", "food"]);

  // Listen for the place changed event
  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (place.geometry) {
      map.setCenter(place.geometry.location);
      map.setZoom(20); // Zoom in on the selected place

      if (marker) {
        marker.setMap(null); // Remove the previous marker if it exists
      }
      marker = new google.maps.Marker({
        position: place.geometry.location,
        map: map,
        title: place.name,
      });

      // Save the selected address
      selectedAddress = place.formatted_address;
      console.log("Selected Address:", place); // Display the selected address in the console
        place_id = place.place_id;
      // Add a click event listener to the marker
      marker.addListener("click", () => {
        alert("Address: " + selectedAddress); // Show an alert with the address
      });
    } else {
      document.getElementById("addressInput").placeholder = "Enter a place";
    }
  });
}
