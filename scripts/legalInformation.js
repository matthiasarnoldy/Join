const isInTemplates = window.location.pathname.includes("/templates/");
const assetBasePath = isInTemplates ? "../assets/" : "./assets/";

/**
 * Initializes legal information navigation handlers.
 * @returns {void} Nothing.
 */
function initLegalInformation() {
    document.addEventListener("DOMContentLoaded", transformNavbarForLogin);
}

/**
 * Prepares the login legal navigation flow.
 * @returns {boolean} Always returns true.
 */
function prepareLoginLegalNavigation() {
    return true;
}

window.prepareLoginLegalNavigation = prepareLoginLegalNavigation;

/**
 * Transforms the navbar for login.
 * @returns {void} Nothing.
 */
function transformNavbarForLogin() {
    const urlParams = new URLSearchParams(window.location.search);
    const from = urlParams.get("from");
    if (from === "login" || from === "signup") {
        const isFromSignup = from === "signup";
        const previousPage = isFromSignup
            ? "./signup.html"
            : isInTemplates
                ? "../index.html"
                : "./index.html";
        const buttonText = isFromSignup ? "Sign up" : "Log in";
        replaceNavMenuWithBackButton(buttonText, previousPage);
        hideHeaderElements();
        centerHeaderContent();
    }
}

/**
 * Replaces the nav menu with back button.
 *
 * @param {string} buttonText - The button text.
 * @param {string} previousPage - The previous page path.
 * @returns {void} Nothing.
 */
function replaceNavMenuWithBackButton(buttonText, previousPage) {
    const navMenu = document.querySelector(".navBar__menu");
    if (!navMenu) return;

    navMenu.innerHTML = legalBackToLoginButtonHTML(assetBasePath, buttonText);

    const backButton = document.getElementById("back-to-login");
    if (!backButton) return;
    backButton.dataset.previousPage = previousPage;
    backButton.addEventListener("click", handleBackToLoginClick);
}

/**
 * Handles back-to-login click.
 *
 * @param {MouseEvent} event - The click event.
 * @returns {void} Nothing.
 */
function handleBackToLoginClick(event) {
    const target = event.currentTarget;
    if (!(target instanceof HTMLElement)) return;
    const previousPage = target.dataset.previousPage;
    if (!previousPage) return;
    location.href = previousPage;
}

/**
 * Adds the hidden class.
 *
 * @param {Element} item - The item.
 * @returns {void} Nothing.
 */
function addHiddenClass(item) {
    item.classList.add("d-none");
}

/**
 * Hides the nav buttons and user icon.
 * @returns {void} Nothing.
 */
function hideHeaderElements() {
    const navQuicklinks = document.querySelectorAll(".navBar__quicklink");
    const helpIcon = document.getElementById("help");
    const userInitials = document.getElementById("login__initials");

    navQuicklinks.forEach(addHiddenClass);
    helpIcon?.classList.add("d-none");
    userInitials?.classList.add("d-none");
}

/**
 * Centers the header content.
 * @returns {void} Nothing.
 */
function centerHeaderContent() {
    const header = document.querySelector(".header");
    const topBar = document.querySelector(".topBar");
    if (header) {
        header.style.display = "flex";
        header.style.alignItems = "center";
    }
    if (topBar) {
        topBar.style.display = "flex";
        topBar.style.justifyContent = "center";
    }
}

initLegalInformation();
