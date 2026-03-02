document.addEventListener("DOMContentLoaded", initLogin);

function initLogin() {
    setMainOpacity();
    setupSignupFormValidation();
    setupPasswordVisibility();
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

function setupPasswordVisibility() {
    const passwordFields = getPasswordFields();
    passwordFields.forEach(field => setupPasswordField(field));
}

function getPasswordFields() {
    const fields = [];
    const passwordIcon = document.getElementById("password-icon");
    const confirmIcon = document.getElementById("confirm-password-icon");
    if (passwordIcon) {
        const input = passwordIcon.closest(".login__input-field").querySelector(".login__input--password");
        if (input) fields.push({ input, icon: passwordIcon });
    }
    if (confirmIcon) {
        const input = confirmIcon.closest(".login__input-field").querySelector(".login__input--password");
        if (input) fields.push({ input, icon: confirmIcon });
    }
    return fields;
}

function setupPasswordField(field) {
    field.input.addEventListener("focus", () => showVisibilityIcon(field));
    field.input.addEventListener("blur", () => hideVisibilityIcon(field));
    field.icon.addEventListener("mousedown", (e) => e.preventDefault());
    field.icon.addEventListener("click", () => togglePasswordVisibility(field));
}

function showVisibilityIcon(field) {
    if (field.input.type === "password") {
        field.icon.src = "./assets/icons/desktop/visibility_off.svg";
        field.icon.style.cursor = "pointer";
    }
}

function hideVisibilityIcon(field) {
    field.input.type = "password";
    field.icon.src = "./assets/icons/desktop/lock.svg";
    field.icon.style.cursor = "default";
}

function togglePasswordVisibility(field) {
    const isLockIcon = field.icon.src.includes("lock.svg");
    if (isLockIcon) return;
    if (field.input.type === "password") {
        field.input.type = "text";
        field.icon.src = "./assets/icons/desktop/visibility.svg";
    } else {
        field.input.type = "password";
        field.icon.src = "./assets/icons/desktop/visibility_off.svg";
    }
    field.input.focus();
}

// Vorübergehened

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