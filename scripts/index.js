document.addEventListener("DOMContentLoaded", initLogin);

function initLogin() {
    setMainOpacity();
    setupSignupFormValidation();
    setupLoginButtons();
}

function setMainOpacity() {
    const mainContent = document.getElementById('main-content');
    setTimeout(() => {
        mainContent.classList.add('main-content--opacity');
    }, 500);
}

function setupSignupFormValidation() {
    const signupForm = document.querySelector(".login__formular");
    const signupSubmitButton = document.getElementById("login-button");
    const privacyCheckbox = document.getElementById("privacy-policy");

    if (!signupForm || !signupSubmitButton || !privacyCheckbox) return;
    
    const inputs = signupForm.querySelectorAll("input[type='text'], input[type='email'], input[type='password']");
    
    const updateButtonState = () => checkFormValidity(inputs, privacyCheckbox, signupSubmitButton);
    
    signupSubmitButton.disabled = true;
    inputs.forEach(input => input.addEventListener("input", updateButtonState));
    privacyCheckbox.addEventListener("change", updateButtonState);
}

function checkFormValidity(inputs, checkbox, button) {
    const allInputsFilled = Array.from(inputs).every(input => input.value.trim() !== "");
    const checkboxChecked = checkbox.checked;
    button.disabled = !(allInputsFilled && checkboxChecked);
}

function setupLoginButtons() {
    const loginButton = document.getElementById("login-button");
    const guestLoginButton = document.getElementById("guest-login-button");
    
    if (loginButton) {
        loginButton.addEventListener("click", redirectToSummary);
    }
    
    if (guestLoginButton) {
        guestLoginButton.addEventListener("click", redirectToSummary);
    }
}

function redirectToSummary() {
    location.href = "./summary.html";
}