document.addEventListener("DOMContentLoaded", initLogin);

const INDEX_IS_IN_TEMPLATES = window.location.pathname.includes("/templates/");
const ASSET_BASE_PATH = INDEX_IS_IN_TEMPLATES ? "../assets/" : "./assets/";
const INDEX_PAGE_BASE_PATH = INDEX_IS_IN_TEMPLATES ? "./" : "./templates/";
const AUTH_USER_QUERY_KEY = "uid";

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


function isValidEmailAddress(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailPattern.test(email);
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


function setButtonDisabled(button, disabled) {
    if (!button) return;
    button.disabled = disabled;
}


function buildSummaryPathWithUserId(userId) {
    if (!userId) return pagePath("summary.html");
    const query = `${AUTH_USER_QUERY_KEY}=${encodeURIComponent(userId)}`;
    return `${pagePath("summary.html")}?${query}`;
}


function redirectToSummary(userId = "") {
    location.href = buildSummaryPathWithUserId(userId);
}
