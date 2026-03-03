// This file contains the JavaScript code for handling button clicks in the navigation
// bar of the Join application. Each button redirects the user to a different page when clicked.

// Get references to the navigation buttons

const navSummary = document.getElementById("nav-summary");
const navAddTask = document.getElementById("nav-add-task");
const navBoard = document.getElementById("nav-board");
const navContacts = document.getElementById("nav-contacts");
const help = document.getElementById("help");
const loginInitials = document.getElementById("login__initials");
const dropdownHelp = document.getElementById("dropdownHelp");
const dropdownPrivacyPolicy = document.getElementById("dropdownPrivacyPolicy");
const dropdownLegalNotice = document.getElementById("dropdownLegalNotice");
const dropdownLog = document.getElementById("dropdownLog");
const arrowBack = document.getElementById("help__arrowBack");
const signupButton = document.getElementById("signup-button");
const signupArrowBack = document.getElementById("signup__arrowBack");

// Legal information links
const indexPrivacyPolicy = document.getElementById("index-privacy-policy");
const indexLegalNotice = document.getElementById("index-legal-notice");
const signupPrivacyPolicy = document.getElementById("signup-privacy-policy");
const signupLegalNotice = document.getElementById("signup-legal-notice");
const navPrivacyPolicy = document.getElementById("nav-Privacy-Policy");
const navLegalNotice = document.getElementById("nav-Legal-Notice");

// Function to set the active navigation item based on the clicked button
function setActiveNav(clickedItem) {
   document
      .querySelectorAll(".navBar__quicklink, .legalInformation")
      .forEach((item) => item.classList.remove("navBar__quicklink--active"));
   if (clickedItem) {
      clickedItem.classList.add("navBar__quicklink--active");
   }
}

function isCurrentPage(targetPath) {
   const pageName = targetPath.replace("./", "").toLowerCase();
   const currentPath = window.location.pathname.toLowerCase();
   return currentPath.endsWith(pageName);
}

function navigateToPage(targetPath) {
   if (isCurrentPage(targetPath)) return;
   location.href = targetPath;
}

// Add event listeners to the buttons to handle clicks and redirect to the appropriate pages

if (navSummary) {
   navSummary.addEventListener("click", () => {
      setActiveNav(navSummary);
      navigateToPage("./summary.html");
   });
}

if (navAddTask) {
   navAddTask.addEventListener("click", () => {
      setActiveNav(navAddTask);
      navigateToPage("./add-task.html");
   });
}

if (navBoard) {
   navBoard.addEventListener("click", () => {
      setActiveNav(navBoard);
      navigateToPage("./board.html");
   });
}

if (navContacts) {
   navContacts.addEventListener("click", () => {
      setActiveNav(navContacts);
      navigateToPage("./contacts.html");
   });
}

// Legal information links from index.html
if (indexPrivacyPolicy) {
   indexPrivacyPolicy.addEventListener("click", () => {
      // Link handles navigation with query parameter
   });
}

if (indexLegalNotice) {
   indexLegalNotice.addEventListener("click", () => {
      // Link handles navigation with query parameter
   });
}

// Legal information links from privacy/legal pages (for navbar)
if (navPrivacyPolicy) {
   navPrivacyPolicy.addEventListener("click", () => {
      setActiveNav(navPrivacyPolicy);
      navigateToPage("./privacy-Policy.html");
   });
}

if (navLegalNotice) {
   navLegalNotice.addEventListener("click", () => {
      setActiveNav(navLegalNotice);
      navigateToPage("./legalnotice.html");
   });
}

// Signup page privacy policy and legal notice links
if (signupPrivacyPolicy) {
   signupPrivacyPolicy.addEventListener("click", () => {
      // Link handles navigation with query parameter
   });
}

if (signupLegalNotice) {
   signupLegalNotice.addEventListener("click", () => {
      // Link handles navigation with query parameter
   });
}

if (help) {
   help.addEventListener("click", () => {
      document
         .querySelectorAll(".navBar__quicklink, .legalInformation")
         .forEach((item) => item.classList.remove("navBar__quicklink--active"));
      navigateToPage("./help.html");
   });
}

if (dropdownHelp) {  
   dropdownHelp.addEventListener("click", () => {
      document
         .querySelectorAll(".navBar__quicklink, .legalInformation")
         .forEach((item) => item.classList.remove("navBar__quicklink--active"));
      navigateToPage("./help.html");
   });
}

if (dropdownPrivacyPolicy) {
   dropdownPrivacyPolicy.addEventListener("click", () => {
      setActiveNav(navPrivacyPolicy);
      navigateToPage("./privacy-Policy.html");
   });
}

if (dropdownLegalNotice) {
   dropdownLegalNotice.addEventListener("click", () => {
      setActiveNav(navLegalNotice);
      navigateToPage("./legalnotice.html");
   });
}

// Open the dropdown menu when clicking on the user initials
if (loginInitials) {
   loginInitials.addEventListener("click", () => {
      const dropdownMenu = document.getElementById("dropdownMenu");
      if (dropdownMenu) {
         dropdownMenu.classList.toggle("header__dropdown--opened");
         loginInitials.classList.toggle("login__initials--opened");
      }
   });
}

// Close the dropdown menu when clicking outside of it
window.addEventListener("click", (event) => {
   const dropdownMenu = document.getElementById("dropdownMenu");
   if (
      dropdownMenu &&
      !dropdownMenu.contains(event.target) &&
      event.target !== loginInitials
   ) {
      dropdownMenu.classList.remove("header__dropdown--opened");
      loginInitials.classList.remove("login__initials--opened");
   }
});

// Redirect to the last visited page or home page when clicking the arrow back button in the help page
if (arrowBack) {
   arrowBack.addEventListener("click", () => {
      window.history.back();
   });
}

// Summary cards navigation - Event delegation
document.addEventListener("click", (event) => {
   if (event.target.closest(".summary__card")) {
      location.href = "./board.html";
   }
});

// Redirect to signup page when clicking the sign up button
if (signupButton) {
   signupButton.addEventListener("click", () => {
      location.href = "./signup.html";
   });
}

// Redirect back when clicking the arrow back button in the signup page
if (signupArrowBack) {
   signupArrowBack.addEventListener("click", () => {
      location.href = "./index.html";
   });
}
