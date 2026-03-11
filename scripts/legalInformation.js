// Transform navbar when accessed from login/signup
document.addEventListener("DOMContentLoaded", transformNavbarForLogin);
const IS_IN_TEMPLATES = window.location.pathname.includes("/templates/");
const ASSET_BASE_PATH = IS_IN_TEMPLATES ? "../assets/" : "./assets/";

function transformNavbarForLogin() {
    const urlParams = new URLSearchParams(window.location.search);
    const from = urlParams.get("from");
    if (from === "login" || from === "signup") {
        const isFromSignup = from === "signup";
        const previousPage = isFromSignup
            ? "./signup.html"
            : IS_IN_TEMPLATES
                ? "../index.html"
                : "./index.html";
        const buttonText = isFromSignup ? "Sign up" : "Log in";
        replaceNavMenuWithBackButton(buttonText, previousPage);
        hideHeaderElements();
        centerHeaderContent();
    }
}


function replaceNavMenuWithBackButton(buttonText, previousPage) {
    const navMenu = document.querySelector(".navBar__menu");
    navMenu.innerHTML = `
        <button class="navBar__backToLogin" id="back-to-login">
            <img src="${ASSET_BASE_PATH}icons/desktop/login.svg" alt="${buttonText}" class="navBar__backToLogin-icon">
            <span class="navBar__backToLogin-text">${buttonText}</span>
        </button>
    `;
    document.getElementById("back-to-login").addEventListener("click", () => {
        location.href = previousPage;
    });
}


function hideHeaderElements() {
    const helpIcon = document.getElementById("help");
    const userInitials = document.getElementById("login__initials");
    if (helpIcon) helpIcon.style.display = "none";
    if (userInitials) userInitials.style.display = "none";
}


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
