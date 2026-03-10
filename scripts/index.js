document.addEventListener("DOMContentLoaded", initLogin);

const INDEX_IS_IN_TEMPLATES = window.location.pathname.includes("/templates/");
const ASSET_BASE_PATH = INDEX_IS_IN_TEMPLATES ? "../assets/" : "./assets/";
const INDEX_PAGE_BASE_PATH = INDEX_IS_IN_TEMPLATES ? "./" : "./templates/";
const LOGIN_ERROR_MESSAGE = "Check your email and password. Please try again.";

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
    hideLoginError();
    hideSignupError();
    setupPasswordVisibility();
    setupLoginButtons();
    bindLoginErrorHideOnInput();
}

function getAuthBaseUrl() {
    return (window.JOIN_CONFIG && window.JOIN_CONFIG.BASE_URL) || "";
}

function getLoginForm() {
    return document.querySelector(".main-content .login__formular");
}

function emptyLoginFields() {
    return { form: null, emailInput: null, passwordInput: null, errorElement: null };
}

function mapLoginFields(loginForm) {
    return {
        form: loginForm,
        emailInput: loginForm.querySelector("input[type='email']"),
        passwordInput: loginForm.querySelector("input[type='password']"),
        errorElement: loginForm.querySelector(".login__input--required"),
    };
}

function getLoginFields() {
    if (document.querySelector(".main-content--signup")) return emptyLoginFields();
    const loginForm = getLoginForm();
    if (!loginForm) return emptyLoginFields();
    return mapLoginFields(loginForm);
}

function showLoginError() {
    const { emailInput, passwordInput, errorElement } = getLoginFields();
    if (!errorElement) return;
    errorElement.textContent = LOGIN_ERROR_MESSAGE;
    errorElement.style.display = "block";
    errorElement.style.opacity = "1";
    emailInput?.classList.add("login__input--error");
    passwordInput?.classList.add("login__input--error");
}

function hideLoginError() {
    const { emailInput, passwordInput, errorElement } = getLoginFields();
    if (!errorElement) return;
    errorElement.style.display = "block";
    errorElement.style.opacity = "0";
    emailInput?.classList.remove("login__input--error");
    passwordInput?.classList.remove("login__input--error");
}

function bindLoginErrorHideOnInput() {
    const fields = getLoginFields();
    if (!areLoginFieldsReady(fields)) return;
    fields.emailInput.addEventListener("input", hideLoginError);
    fields.passwordInput.addEventListener("input", hideLoginError);
}

function getSignupForm() {
    return document.querySelector(".main-content--signup .login__formular");
}

function emptySignupFields() {
    return {
        form: null,
        nameInput: null,
        emailInput: null,
        passwordInput: null,
        confirmPasswordInput: null,
        errorElement: null,
    };
}

function mapSignupFields(signupForm) {
    return {
        form: signupForm,
        nameInput: signupForm.querySelector("input[type='text']"),
        emailInput: signupForm.querySelector("input[type='email']"),
        passwordInput: signupForm.querySelector("#password-input"),
        confirmPasswordInput: signupForm.querySelector("#confirm-password-input"),
        errorElement: signupForm.querySelector(".login__input--required"),
    };
}

function getSignupFields() {
    const signupForm = getSignupForm();
    if (!signupForm) return emptySignupFields();
    return mapSignupFields(signupForm);
}

function showSignupError(message) {
    const { errorElement } = getSignupFields();
    if (!errorElement) return;
    errorElement.textContent = message;
    errorElement.style.display = "block";
}

function hideSignupError() {
    const { errorElement } = getSignupFields();
    if (!errorElement) return;
    errorElement.style.display = "none";
}

function isValidEmailAddress(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailPattern.test(email);
}

function areSignupFieldsReady(fields) {
    return fields.nameInput && fields.emailInput && fields.passwordInput && fields.confirmPasswordInput;
}

function readSignupValues(fields) {
    return {
        name: fields.nameInput.value.trim(),
        email: fields.emailInput.value.trim().toLowerCase(),
        password: fields.passwordInput.value,
        confirmPassword: fields.confirmPasswordInput.value,
    };
}

function hasMissingSignupValues(values) {
    return !values.name || !values.email || !values.password || !values.confirmPassword;
}

function getSignupValidationError(values) {
    if (hasMissingSignupValues(values)) return "Please fill out all fields.";
    if (!isValidEmailAddress(values.email)) return "Please enter a valid email address.";
    if (values.password !== values.confirmPassword) return "Your passwords don't match. Please try again.";
    return "";
}

function areLoginFieldsReady(fields) {
    return fields.emailInput && fields.passwordInput;
}

function readLoginValues(fields) {
    return {
        email: fields.emailInput.value.trim().toLowerCase(),
        password: fields.passwordInput.value,
    };
}

function isValidLoginValues(values) {
    if (!values.email || !values.password) return false;
    return isValidEmailAddress(values.email);
}

function buildLoginPayload() {
    const fields = getLoginFields();
    if (!areLoginFieldsReady(fields)) return showLoginError(), null;
    const values = readLoginValues(fields);
    if (!isValidLoginValues(values)) return showLoginError(), null;
    hideLoginError();
    return values;
}

function buildSignupPayload() {
    const fields = getSignupFields();
    if (!areSignupFieldsReady(fields)) {
        showSignupError("Signup form is incomplete.");
        return null;
    }
    const values = readSignupValues(fields);
    const validationError = getSignupValidationError(values);
    if (validationError) return showSignupError(validationError), null;
    hideSignupError();
    return { name: values.name, email: values.email, password: values.password };
}

async function getUsersFromDatabase() {
    const response = await fetch(`${getAuthBaseUrl()}users.json`);
    if (!response.ok) throw new Error(`Failed loading users: HTTP ${response.status}`);
    return (await response.json()) || {};
}

function isEmailAlreadyRegistered(usersObject, email) {
    return Object.values(usersObject).some((user) => {
        return user && typeof user.email === "string" && user.email.toLowerCase() === email;
    });
}

function generateInitialFromName(name) {
    const trimmedName = name.trim();
    if (!trimmedName) return "?";
    const nameParts = trimmedName.split(/\s+/).filter(Boolean);
    const firstInitial = nameParts[0].charAt(0).toUpperCase();
    const secondLetter = nameParts[0].charAt(1).toUpperCase();
    const lastInitial =
        nameParts.length > 1
            ? nameParts[nameParts.length - 1].charAt(0).toUpperCase()
            : secondLetter || firstInitial;
    return `${firstInitial}${lastInitial}`;
}

function padToTwoDigits(value) {
    return String(value).padStart(2, "0");
}

function formatGermanTimestamp(date) {
    const day = padToTwoDigits(date.getDate());
    const month = padToTwoDigits(date.getMonth() + 1);
    const year = String(date.getFullYear());
    const hour = padToTwoDigits(date.getHours());
    const minute = padToTwoDigits(date.getMinutes());
    const second = padToTwoDigits(date.getSeconds());
    return `${day}${month}${year}${hour}${minute}${second}`;
}

function buildUserPayload(newUser) {
    return {
        name: newUser.name,
        email: newUser.email,
        initial: generateInitialFromName(newUser.name),
        password: newUser.password,
        createdAt: formatGermanTimestamp(new Date()),
    };
}

async function createUserInDatabase(newUser) {
    const response = await fetch(`${getAuthBaseUrl()}users.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildUserPayload(newUser)),
    });
    if (!response.ok) throw new Error(`Failed creating user: HTTP ${response.status}`);
}

function getSplashLogoElement() {
    return document.querySelector(".splash__logo--image");
}

function isMobileViewport() {
    return window.matchMedia("(max-width: 600px)").matches;
}

function setSplashLogoByViewport() {
    const splashLogo = getSplashLogoElement();
    if (!splashLogo) return;
    splashLogo.src = isMobileViewport()
        ? assetPath("icons/desktop/logo.svg")
        : assetPath("icons/desktop/Dark_Logo.svg");
}

function getMobileSplashElements() {
    return {
        splash: document.querySelector(".splash__logo"),
        splashLogo: getSplashLogoElement(),
    };
}

function shouldApplyMobileSplash(splash) {
    return Boolean(splash) && isMobileViewport();
}

function buildSplashBackgroundReset(originalBg, splashLogo) {
    return () => {
        document.body.style.backgroundColor = originalBg;
        if (splashLogo) splashLogo.src = assetPath("icons/desktop/Dark_Logo.svg");
    };
}

function setMobileSplashBackground() {
    const { splash, splashLogo } = getMobileSplashElements();
    if (!shouldApplyMobileSplash(splash)) return;
    const originalBg = getComputedStyle(document.body).backgroundColor;
    const resetBg = buildSplashBackgroundReset(originalBg, splashLogo);
    document.body.style.backgroundColor = "#2a3647";
    splash.addEventListener("animationend", resetBg, { once: true });
    setTimeout(resetBg, 700);
}

function setMainOpacity() {
    const mainContent = document.getElementById("main-content");
    if (!mainContent) return;
    setTimeout(() => {
        mainContent.classList.add("main-content--opacity");
    }, 700);
}

function getSignupValidationElements() {
    return {
        signupForm: document.querySelector(".login__formular"),
        signupSubmitButton: document.getElementById("login-button"),
        privacyCheckbox: document.getElementById("privacy-policy"),
    };
}

function areSignupValidationElementsReady(elements) {
    return elements.signupForm && elements.signupSubmitButton && elements.privacyCheckbox;
}

function bindSignupValidation(inputs, privacyCheckbox, signupSubmitButton) {
    const updateButtonState = () => checkFormValidity(inputs, privacyCheckbox, signupSubmitButton);
    signupSubmitButton.disabled = true;
    inputs.forEach((input) => input.addEventListener("input", updateButtonState));
    privacyCheckbox.addEventListener("change", updateButtonState);
}

function setupSignupFormValidation() {
    const elements = getSignupValidationElements();
    if (!areSignupValidationElementsReady(elements)) return;
    const inputs = elements.signupForm.querySelectorAll("input[type='text'], input[type='email'], input[type='password']");
    bindSignupValidation(inputs, elements.privacyCheckbox, elements.signupSubmitButton);
}

function checkFormValidity(inputs, checkbox, button) {
    const allInputsFilled = Array.from(inputs).every((input) => input.value.trim() !== "");
    button.disabled = !(allInputsFilled && checkbox.checked);
}

function setupPasswordVisibility() {
    const passwordFields = getPasswordFields();
    passwordFields.forEach((field) => setupPasswordField(field));
}

function getPasswordFieldByIconId(iconId) {
    const icon = document.getElementById(iconId);
    if (!icon) return null;
    const input = icon.closest(".login__input-field")?.querySelector(".login__input--password");
    return input ? { input, icon } : null;
}

function getPasswordFields() {
    const passwordField = getPasswordFieldByIconId("password-icon");
    const confirmField = getPasswordFieldByIconId("confirm-password-icon");
    return [passwordField, confirmField].filter(Boolean);
}

function setupPasswordField(field) {
    field.input.addEventListener("focus", () => showVisibilityIcon(field));
    field.input.addEventListener("blur", () => hideVisibilityIcon(field));
    field.icon.addEventListener("mousedown", (event) => event.preventDefault());
    field.icon.addEventListener("click", () => togglePasswordVisibility(field));
}

function showVisibilityIcon(field) {
    if (field.input.type !== "password") return;
    field.icon.src = assetPath("icons/desktop/visibility_off.svg");
    field.icon.style.cursor = "pointer";
}

function hideVisibilityIcon(field) {
    field.input.type = "password";
    field.icon.src = assetPath("icons/desktop/lock.svg");
    field.icon.style.cursor = "default";
}

function isLockIcon(field) {
    return field.icon.src.includes("lock.svg");
}

function showPassword(field) {
    field.input.type = "text";
    field.icon.src = assetPath("icons/desktop/visibility.svg");
}

function hidePassword(field) {
    field.input.type = "password";
    field.icon.src = assetPath("icons/desktop/visibility_off.svg");
}

function togglePasswordVisibility(field) {
    if (isLockIcon(field)) return;
    if (field.input.type === "password") showPassword(field);
    else hidePassword(field);
    field.input.focus();
}

function setupLoginButtons() {
    bindMainLoginButton();
    bindGuestLoginButton();
}

function bindMainLoginButton() {
    const loginButton = document.getElementById("login-button");
    if (!loginButton) return;
    if (document.querySelector(".main-content--signup")) return bindSignupButton(loginButton);
    loginButton.addEventListener("click", () => handleLogin(loginButton));
}

function bindSignupButton(loginButton) {
    loginButton.addEventListener("click", (event) => {
        event.preventDefault();
        handleSignup(loginButton);
    });
}

function bindGuestLoginButton() {
    const guestLoginButton = document.getElementById("guest-login-button");
    if (!guestLoginButton) return;
    guestLoginButton.addEventListener("click", redirectToSummary);
}

function setButtonDisabled(button, disabled) {
    if (!button) return;
    button.disabled = disabled;
}

function scheduleSummaryRedirect() {
    setTimeout(redirectToSummary, 1000);
}

async function registerSignupUser(payload) {
    const users = await getUsersFromDatabase();
    if (isEmailAlreadyRegistered(users, payload.email)) {
        showSignupError("This email is already registered.");
        return false;
    }
    await createUserInDatabase(payload);
    return true;
}

function isMatchingUser(user, payload) {
    if (!user || typeof user !== "object") return false;
    const userEmail = String(user.email || "").toLowerCase();
    return userEmail === payload.email && String(user.password || "") === payload.password;
}

function hasMatchingLogin(users, payload) {
    return Object.values(users).some((user) => isMatchingUser(user, payload));
}

async function handleLogin(loginButton) {
    const payload = buildLoginPayload();
    if (!payload) return;
    try {
        setButtonDisabled(loginButton, true);
        const users = await getUsersFromDatabase();
        if (!hasMatchingLogin(users, payload)) return showLoginError();
        redirectToSummary();
    } catch (error) {
        console.error("Login failed:", error);
        showLoginError();
    } finally {
        setButtonDisabled(loginButton, false);
    }
}

async function handleSignup(signupButton) {
    const payload = buildSignupPayload();
    if (!payload) return;
    try {
        setButtonDisabled(signupButton, true);
        const wasRegistered = await registerSignupUser(payload);
        if (!wasRegistered) return;
        showSignupSuccess();
        scheduleSummaryRedirect();
    } catch (error) {
        console.error("Signup failed:", error);
        showSignupError("Signup failed. Please try again.");
    } finally {
        setButtonDisabled(signupButton, false);
    }
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
