import { loginUser, loginBusinessWithUEN, createUser, createUserWithUEN, saveBusinessDetails, saveUserDetails, getFieldValue } from '../wad2project/database.js';

let currentMode = 'login';
let currentType = 'individual';

document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const userType = urlParams.get('type');
    const modeType = urlParams.get('mode');

    currentMode = modeType === 'signup' ? 'signup' : 'login';
    currentType = userType === 'business' ? 'business' : 'individual';

    updatePageTitle();
    generateForm();
    updateToggleLink();

    document.getElementById("generateFormIndiv").addEventListener('click', () => {
        currentType = 'individual';
        generateForm();
    });

    document.getElementById("generateFormBusiness").addEventListener('click', () => {
        currentType = 'business';
        generateForm();
    });

    document.getElementById("toggleMode").addEventListener('click', (e) => {
        e.preventDefault();
        currentMode = currentMode === 'login' ? 'signup' : 'login';
        updatePageTitle();
        generateForm();
        updateToggleLink();
    });
});

function updatePageTitle() {
    const pageTitle = document.getElementById('pageTitle');
    pageTitle.textContent = `${currentMode === 'login' ? 'Sign In to MealMate' : 'Sign Up for MealMate'}`;
}

function updateToggleLink() {
    const toggleLink = document.getElementById('toggleMode');
    toggleLink.textContent = currentMode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in';
}

function generateForm() {
    const formContainer = document.getElementById('formContainer');
    formContainer.innerHTML = '';

    const form = document.createElement('form');
    form.classList.add('col-12', 'col-md-6', 'mx-auto');

    if (currentMode === 'signup') {
        // Name input (for both individual and business)
        const nameGroup = createInputGroup(
            currentType === 'individual' ? 'Full Name' : 'Business Name',
            'text',
            'name'
        );
        form.appendChild(nameGroup);
    }

    // Email/UEN input
    const emailGroup = createInputGroup(
        currentType === 'individual' ? 'Email' : 'UEN',
        currentType === 'individual' ? 'email' : 'text',
        'emailOrUEN'
    );
    form.appendChild(emailGroup);

    // Password input
    const passwordGroup = createInputGroup('Password', 'password', 'password');
    form.appendChild(passwordGroup);

    // Confirm Password input (only for signup mode)
    if (currentMode === 'signup') {
        const confirmPasswordGroup = createInputGroup('Confirm Password', 'password', 'confirmPassword');
        form.appendChild(confirmPasswordGroup);
    }

    // Forget Password link (only for login mode)
    if (currentMode === 'login') {
        const forgetPasswordDiv = document.createElement('div');
        forgetPasswordDiv.classList.add('mb-2', 'text-center');
        const forgetPasswordLink = document.createElement('a');
        forgetPasswordLink.href = '#';
        forgetPasswordLink.classList.add('link-underline-secondary');
        forgetPasswordLink.style.color = 'gray';
        forgetPasswordLink.textContent = 'Forget Password';
        forgetPasswordDiv.appendChild(forgetPasswordLink);
        form.appendChild(forgetPasswordDiv);
    }

    // Submit button
    const submitButtonDiv = document.createElement('div');
    submitButtonDiv.classList.add('text-center');
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.classList.add('btn', 'btn-primary');
    submitButton.textContent = currentMode === 'login' ? 'Sign In' : 'Sign Up';
    submitButtonDiv.appendChild(submitButton);
    form.appendChild(submitButtonDiv);

    form.addEventListener('submit', handleSubmit);

    formContainer.appendChild(form);
    updateActiveType();
}

function createInputGroup(labelText, inputType, inputId) {
    const group = document.createElement('div');
    group.classList.add('mb-3');

    const label = document.createElement('label');
    label.setAttribute('for', inputId);
    label.classList.add('form-label');
    const strong = document.createElement('strong');
    strong.textContent = labelText;
    label.appendChild(strong);

    const input = document.createElement('input');
    input.type = inputType;
    input.classList.add('form-control');
    input.id = inputId;
    input.required = true;

    group.appendChild(label);
    group.appendChild(input);

    return group;
}

function handleSubmit(event) {
    event.preventDefault();
    const emailOrUEN = document.getElementById('emailOrUEN').value;
    const password = document.getElementById('password').value;

    if (currentMode === 'login') {
        if (currentType === 'individual') {
            loginUser(emailOrUEN, password)
                .then(user => {
                    getFieldValue('userLogin', emailOrUEN, 'fullName').then((fieldValue) => {
                        showStatusPopup('Login successful! Welcome ' + fieldValue)
                        // UPDATE HERE TO CHANGE LOCATION
                        setTimeout(function() {
                            window.location.href = './restaurant-profile.html'
                        }, 1000)
                    })

                })
                .catch(error => {
                    showStatusPopup('Login failed: ' + getCustomErrorMessage(error), false)
                });
        } else {
            loginBusinessWithUEN(emailOrUEN, password)
                .then(user => {
                    getFieldValue('businessLogin', emailOrUEN, 'busName').then((fieldValue) => {
                        showStatusPopup('Login successful! Welcome ' + fieldValue)
                        setTimeout(function() {
                            window.location.href = './restaurant-profile.html'
                        }, 1000)
                        
                    })
                })
                .catch(error => {
                    showStatusPopup('Login failed: ' + getCustomErrorMessage(error), false)

                });
        }
    } else { // sign up
        const name = document.getElementById('name').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            showStatusPopup("Passwords do not match", false)
            return;
        }

        if (currentType === 'individual') {
            createUser(name, emailOrUEN, password)
                .then(user => {
                    showStatusPopup('Registration successful! Welcome ' + user.email)
                    // After successful registration, save user details
                    return saveUserDetails(name, emailOrUEN);
                })
                .then(() => {
                    console.log("User details saved successfully");
                })
                .catch(error => {
                    showStatusPopup("Registration failed: " + getCustomErrorMessage(error), false)
                });
        } else {
            let uppercaseUEN = emailOrUEN.toUpperCase()
            createUserWithUEN(emailOrUEN, password)
            .then(business => {
                showStatusPopup('Registration successful! Welcome ' + name)
                // After successful registration, save business details
                return saveBusinessDetails(uppercaseUEN, business.uid, name);
            })
            .then(() => {
                console.log('Business details saved successfully');
            })
            .catch(error => {
                if (error.message.includes('Business details')) {
                    console.error('Failed to save business details:', error);
                    alert('Registration successful, but there was an issue saving business details. Please contact support.');
                } else {
                    showStatusPopup('Registration failed: ' + getCustomErrorMessage(error), false)
                    
                }
            });
    }
}
}

function updateActiveType() {
    const indivOption = document.getElementById('indiv');
    const busOption = document.getElementById('business');
    indivOption.style.color = currentType === 'individual' ? 'blue' : 'black';
    busOption.style.color = currentType === 'business' ? 'blue' : 'black';
}

function showStatusPopup(message, isSuccess = true) {
    // Remove any existing popup
    const existingPopup = document.querySelector('.status-popup');
    if (existingPopup) {
      existingPopup.remove();
    }
  
    // Create new popup element
    const popup = document.createElement('div');
    popup.className = `status-popup ${isSuccess ? 'success' : 'error'}`;
    popup.textContent = message;
  
    // Add popup to the document
    document.body.appendChild(popup);
  
    // Trigger reflow to ensure transition works
    popup.offsetHeight;
  
    // Show the popup
    setTimeout(() => {
      popup.classList.add('show');
    }, 10);
  
    // Hide the popup after 3 seconds
    setTimeout(() => {
      popup.classList.remove('show');
      setTimeout(() => {
        popup.remove();
      }, 300); // Wait for fade out transition to complete
    }, 3000);
  }

function getCustomErrorMessage(error) {
switch (error.code) {
    case 'auth/email-already-in-use':
        if (currentType === 'individual') {
            return 'This email is already registered. Please use a different email or try logging in.';
        } else if (currentType === 'business') {
            return 'This UEN is already registered. Please use a different UEN or try logging in.';
        }
    case 'auth/invalid-email':
        return 'The email address is not valid. Please check and try again.';
    case 'auth/weak-password':
        return 'The password is too weak. Please use a stronger password.';
    case 'auth/user-not-found':
        return 'No account found with this email. Please check your email or sign up.';
    case 'auth/wrong-password':
        return 'Incorrect password. Please try again or reset your password.';
    case 'auth/too-many-requests':
        return 'Too many unsuccessful attempts. Please try again later.';
    case 'auth/invalid-credential':
        return 'Invalid login credentials. Please try again later.';
    case 'auth/invalid-email':
        return 'Invalid email';
    case 'auth/password-does-not-meet-requirements':
        return "Password does not meet the following requirements:\n1. At least 1 uppercase and 1 lowercase character\n2. Require 1 numeric character"
    default:
    return 'An error occurred. Please try again later.';
}
}