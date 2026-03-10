document.addEventListener("DOMContentLoaded", initLogin);
const INDEX_IS_IN_TEMPLATES = window.location.pathname.includes("/templates/");
const ASSET_BASE_PATH = INDEX_IS_IN_TEMPLATES ? "../assets/" : "./assets/";
const INDEX_PAGE_BASE_PATH = INDEX_IS_IN_TEMPLATES ? "./" : "./templates/";

function assetPath(relativePath) {
    return `${ASSET_BASE_PATH}${relativePath}`;
}

function pagePath(pageFile) {
    return `${INDEX_PAGE_BASE_PATH}${pageFile}`;
}

function initLogin() {
    setSplashLogoByViewport();
    setMobileSplashBackground();
    setMainOpacity();
    setupSignupFormValidation();
    setupPasswordVisibility();
    setupLoginButtons();
}

function setSplashLogoByViewport() {
    const splashLogo = document.querySelector(".splash__logo--image");
    if (!splashLogo) return;
    const isMobile = window.matchMedia("(max-width: 600px)").matches;
    splashLogo.src = isMobile
        ? assetPath("icons/desktop/logo.svg")
        : assetPath("icons/desktop/Dark_Logo.svg");
}

function setMobileSplashBackground() {
    const splash = document.querySelector(".splash__logo");
    const splashLogo = document.querySelector(".splash__logo--image");
    if (!splash || !window.matchMedia("(max-width: 600px)").matches) return;
    const originalBg = getComputedStyle(document.body).backgroundColor;
    document.body.style.backgroundColor = "#2a3647";
    const resetBg = () => {
        document.body.style.backgroundColor = originalBg;
        if (splashLogo) splashLogo.src = assetPath("icons/desktop/Dark_Logo.svg");
    };
    splash.addEventListener("animationend", resetBg, { once: true });
    setTimeout(resetBg, 700);
}

function setMainOpacity() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    setTimeout(() => {
        mainContent.classList.add('main-content--opacity');
    }, 700);
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
        field.icon.src = assetPath("icons/desktop/visibility_off.svg");
        field.icon.style.cursor = "pointer";
    }
}

function hideVisibilityIcon(field) {
    field.input.type = "password";
    field.icon.src = assetPath("icons/desktop/lock.svg");
    field.icon.style.cursor = "default";
}

function togglePasswordVisibility(field) {
    const isLockIcon = field.icon.src.includes("lock.svg");
    if (isLockIcon) return;
    if (field.input.type === "password") {
        field.input.type = "text";
        field.icon.src = assetPath("icons/desktop/visibility.svg");
    } else {
        field.input.type = "password";
        field.icon.src = assetPath("icons/desktop/visibility_off.svg");
    }
    field.input.focus();
}

// Vorübergehened

function setupLoginButtons() {
    const loginButton = document.getElementById("login-button");
    const guestLoginButton = document.getElementById("guest-login-button");
    const isSignupPage = document.querySelector(".main-content--signup");
    if (loginButton) {
        if (isSignupPage) {
            loginButton.addEventListener("click", handleSignup);
        } else {
            loginButton.addEventListener("click", redirectToSummary);
        }
    }
    if (guestLoginButton) {
        guestLoginButton.addEventListener("click", redirectToSummary);
    }
}

function handleSignup() {
    showSignupSuccess();
    setTimeout(redirectToSummary, 1000);
}

function redirectToSummary() {
    location.href = pagePath("summary.html");
}

function createSignupMessage() {
    const messageDiv = document.createElement("div");
    messageDiv.className = "signup-success-message";
    const messageText = document.createElement("span");
    messageText.textContent = "You signed up successfully";
    messageDiv.appendChild(messageText);
    return messageDiv;
}

function showSignupSuccess() {
    const message = createSignupMessage();
    document.body.appendChild(message);
    requestAnimationFrame(() => {
        message.classList.add("signup-success-message--visible");
    });
    setTimeout(() => message.remove(), 1000);
}
