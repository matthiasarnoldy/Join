// Transform navbar when accessed from login/signup
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const from = urlParams.get("from");
    
    if (from === "login" || from === "signup") {
        const navMenu = document.querySelector(".navBar__menu");
        const isFromSignup = from === "signup";
        const previousPage = isFromSignup ? "./signup.html" : "./index.html";
        const buttonText = isFromSignup ? "Sign up" : "Log in";
        
        navMenu.innerHTML = `
            <button class="navBar__backToLogin" id="back-to-login">
                <img src="./assets/icons/desktop/login.svg" alt="${buttonText}" class="navBar__backToLogin-icon">
                <span class="navBar__backToLogin-text">${buttonText}</span>
            </button>
        `;
        
        document.getElementById("back-to-login").addEventListener("click", () => {
            location.href = previousPage;
        });
    }
});
