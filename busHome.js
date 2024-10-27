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
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

let businessUEN = null;

// Listen for authentication state changes
onAuthStateChanged(auth, async(user) => {
    if (user) {
        businessUEN = user.email.split("@")[0].toUpperCase();
        console.log(businessUEN)
        const businessDoc = await fetchBusinessName(businessUEN);

        if (businessDoc.exists()) {
            const businessFields = businessDoc.data();

            if (!(businessFields.contactInfo && businessFields.profilePic && businessFields.address)) {
                const myModal = document.getElementById('staticBackdrop');
                const bsModal = new bootstrap.Modal(myModal);
                bsModal.show();
                setupFormHandlers();
            } else {
                document.getElementById('businessName').innerText = businessFields.busName;
                document.getElementById('addressDisplay').innerText = businessFields.address
                document.getElementById('contactDisplay').innerText = businessFields.contactInfo
                const profileContainer = document.getElementById('profilePicContainer')
                const img = document.createElement('img')
                profileContainer.appendChild(img)
                img.src = businessFields.profilePic
            }
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

