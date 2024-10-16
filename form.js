function generateLoginFormIndiv() {
    // Create the form element
    const form = document.createElement('form');

    // Email input group
    const emailGroup = document.createElement('div');
    emailGroup.classList.add('mb-3');

    const emailLabel = document.createElement('label');
    emailLabel.setAttribute('for', 'exampleInputEmail1');
    emailLabel.classList.add('form-label');
    const emailStrong = document.createElement("strong")
    emailLabel.appendChild(emailStrong)
    emailStrong.innerText = "Email"

    const emailInput = document.createElement('input');
    emailInput.setAttribute('type', 'text');
    emailInput.classList.add('form-control');
    emailInput.setAttribute('id', 'exampleInputEmail1');
    emailInput.setAttribute('aria-describedby', 'emailHelp');

    emailGroup.appendChild(emailLabel);
    emailGroup.appendChild(emailInput);

    // Password input group
    const passwordGroup = document.createElement('div');
    passwordGroup.classList.add('mb-3');

    const passwordLabel = document.createElement('label');
    passwordLabel.setAttribute('for', 'exampleInputPassword1');
    passwordLabel.classList.add('form-label');
    const passStrong = document.createElement("strong")
    passwordLabel.appendChild(passStrong)
    passStrong.innerText = "Password"
    

    const passwordInput = document.createElement('input');
    passwordInput.setAttribute('type', 'password');
    passwordInput.classList.add('form-control');
    passwordInput.setAttribute('id', 'exampleInputPassword1');

    passwordGroup.appendChild(passwordLabel);
    passwordGroup.appendChild(passwordInput);

    // Forget Password link
    const forgetPasswordDiv = document.createElement('div');
    forgetPasswordDiv.classList.add('mb-2', 'text-center');

    const forgetPasswordLink = document.createElement('a');
    forgetPasswordLink.setAttribute('href', '#');
    forgetPasswordLink.classList.add('link-underline-secondary');
    forgetPasswordLink.style.color = 'gray';
    forgetPasswordLink.textContent = 'Forget Password';

    forgetPasswordDiv.appendChild(forgetPasswordLink);

    // Submit button
    const submitButtonDiv = document.createElement('div');
    submitButtonDiv.classList.add('text-center');

    const submitButton = document.createElement('button');
    submitButton.setAttribute('type', 'submit');
    submitButton.classList.add('btn', 'btn-primary');
    submitButton.textContent = 'Submit';

    submitButtonDiv.appendChild(submitButton);

    // Append all elements to the form
    form.appendChild(emailGroup);
    form.appendChild(passwordGroup);
    form.appendChild(forgetPasswordDiv);
    form.appendChild(submitButtonDiv);

    // Append the form to a container
    const container = document.getElementById('loginForm')

    while (container.hasChildNodes()) {
        container.removeChild(container.firstChild);
      }
    container.appendChild(form)

    let indivOption = document.getElementById("indiv")
    let busOption = document.getElementById("business")
    indivOption.style.color = "blue"
    busOption.style.color = "black"

}


function generateLoginFormBusiness() {
        // Create the form element
        const form = document.createElement('form');

        // Email input group
        const emailGroup = document.createElement('div');
        emailGroup.classList.add('mb-3');
    
        const emailLabel = document.createElement('label');
        emailLabel.setAttribute('for', 'exampleInputEmail1');
        emailLabel.classList.add('form-label');
        const emailStrong = document.createElement("strong")
        emailLabel.appendChild(emailStrong)
        emailStrong.innerText = "UEN"
        
    
        const emailInput = document.createElement('input');
        emailInput.setAttribute('type', 'email');
        emailInput.classList.add('form-control');
        emailInput.setAttribute('id', 'exampleInputEmail1');
        emailInput.setAttribute('aria-describedby', 'emailHelp');
    
        emailGroup.appendChild(emailLabel);
        emailGroup.appendChild(emailInput);
    
        // Password input group
        const passwordGroup = document.createElement('div');
        passwordGroup.classList.add('mb-3');
    
        const passwordLabel = document.createElement('label');
        passwordLabel.setAttribute('for', 'exampleInputPassword1');
        passwordLabel.classList.add('form-label');
        const passStrong = document.createElement("strong")
        passwordLabel.appendChild(passStrong)
        passStrong.innerText = "Password"
        
    
        const passwordInput = document.createElement('input');
        passwordInput.setAttribute('type', 'password');
        passwordInput.classList.add('form-control');
        passwordInput.setAttribute('id', 'exampleInputPassword1');
    
        passwordGroup.appendChild(passwordLabel);
        passwordGroup.appendChild(passwordInput);
    
        // Forget Password link
        const forgetPasswordDiv = document.createElement('div');
        forgetPasswordDiv.classList.add('mb-2', 'text-center');
    
        const forgetPasswordLink = document.createElement('a');
        forgetPasswordLink.setAttribute('href', '#');
        forgetPasswordLink.classList.add('link-underline-secondary');
        forgetPasswordLink.style.color = 'gray';
        forgetPasswordLink.textContent = 'Forget Password';
    
        forgetPasswordDiv.appendChild(forgetPasswordLink);
    
        // Submit button
        const submitButtonDiv = document.createElement('div');
        submitButtonDiv.classList.add('text-center');
    
        const submitButton = document.createElement('button');
        submitButton.setAttribute('type', 'submit');
        submitButton.classList.add('btn', 'btn-primary');
        submitButton.textContent = 'Submit';
    
        submitButtonDiv.appendChild(submitButton);
    
        // Append all elements to the form
        form.appendChild(emailGroup);
        form.appendChild(passwordGroup);
        form.appendChild(forgetPasswordDiv);
        form.appendChild(submitButtonDiv);
    
        // Append the form to a container
        const container = document.getElementById('loginForm')
    
        while (container.hasChildNodes()) {
            container.removeChild(container.firstChild);
          }
        container.appendChild(form)

        let indivOption = document.getElementById("indiv")
        let busOption = document.getElementById("business")
        indivOption.style.color = "black"
        busOption.style.color = "blue"

}

document.addEventListener("DOMContentLoaded", function() {
    // Get the query parameter from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const userType = urlParams.get('type'); // 'individual' or 'business'

    // Show the appropriate form based on the userType
    if (userType === 'individual') {
        // Call a function to display the form for Individuals
        generateLoginFormIndiv();
    } else if (userType === 'business') {
        // Call a function to display the form for Businesses
        generateLoginFormBusiness();
    }
});

