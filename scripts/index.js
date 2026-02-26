document.addEventListener("DOMContentLoaded", initLogin);

function initLogin() {
    setMainOpacity();
};

function setMainOpacity() {
    const mainContent = document.getElementById('main-content');
    setTimeout(() => {
        mainContent.classList.remove('hidden');
    }, 500);
}