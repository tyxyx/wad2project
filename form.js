import { loginUser, loginBusinessWithUEN, createUser, createUserWithUEN, saveBusinessDetails } from '../wad2project/database.js';

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
                    alert('Login successful! Welcome ' + user.email);
                })
                .catch(error => {
                    alert('Login failed: ' + error.message);
                });
        } else {
            loginBusinessWithUEN(emailOrUEN, password)
                .then(user => {
                    alert('Login successful! Welcome ' + user.email);
                })
                .catch(error => {
                    alert('Login failed: ' + error.message);
                });
        }
    } else {
        const name = document.getElementById('name').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        if (currentType === 'individual') {
            createUser(name, emailOrUEN, password)
                .then(user => {
                    alert('Registration successful! Welcome ' + user.email);
                })
                .catch(error => {
                    alert('Registration failed: ' + error.message);
                });
        } else {
            createUserWithUEN(name, emailOrUEN, password)
            .then(business => {
                alert('Registration successful! Welcome ' + name);
                // After successful registration, save business details
                return saveBusinessDetails(emailOrUEN, business.uid);
            })
            .then(() => {
                console.log('Business details saved successfully');
            })
            .catch(error => {
                if (error.message.includes('Business details')) {
                    console.error('Failed to save business details:', error);
                    alert('Registration successful, but there was an issue saving business details. Please contact support.');
                } else {
                    alert('Registration failed: ' + error.message);
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