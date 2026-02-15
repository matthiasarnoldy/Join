// This file contains the JavaScript code for handling button clicks in the navigation
// bar of the Join application. Each button redirects the user to a different page when clicked.

// Get references to the navigation buttons

const navSummary = document.getElementById("nav-summary");
const navAddTask = document.getElementById("nav-add-task");
const navBoard = document.getElementById("nav-board");
const navContacts = document.getElementById("nav-contacts");
const navPrivacyPolicy = document.getElementById("nav-Privacy-Policy");
const navLegalNotice = document.getElementById("nav-Legal-Notice");
const help = document.getElementById("help");
const loginInitials = document.getElementById("login__initials");
const dropdownHelp = document.getElementById("dropdownHelp");
const dropdownPrivacyPolicy = document.getElementById("dropdownPrivacyPolicy");
const dropdownLegalNotice = document.getElementById("dropdownLegalNotice");
const dropdownLog = document.getElementById("dropdownLog");
const arrowBack = document.getElementById("help__arrowBack");

// Function to set the active navigation item based on the clicked button
function setActiveNav(clickedItem) {
   document
      .querySelectorAll(".navBar__quicklink, .legalInformation")
      .forEach((item) => item.classList.remove("navBar__quicklink--active"));
   if (clickedItem) {
      clickedItem.classList.add("navBar__quicklink--active");
   }
}

// Add event listeners to the buttons to handle clicks and redirect to the appropriate pages

if (navSummary) {
   navSummary.addEventListener("click", () => {
      setActiveNav(navSummary);
      location.href = "./summary.html";
   });
}

if (navAddTask) {
   navAddTask.addEventListener("click", () => {
      setActiveNav(navAddTask);
      location.href = "./add-task.html";
   });
}

if (navBoard) {
   navBoard.addEventListener("click", () => {
      setActiveNav(navBoard);
      location.href = "./board.html";
   });
}

if (navContacts) {
   navContacts.addEventListener("click", () => {
      setActiveNav(navContacts);
      location.href = "./contacts.html";
   });
}

if (navPrivacyPolicy) {
   navPrivacyPolicy.addEventListener("click", () => {
      setActiveNav(navPrivacyPolicy);
      location.href = "./privacy-Policy.html";
   });
}

if (navLegalNotice) {
   navLegalNotice.addEventListener("click", () => {
      setActiveNav(navLegalNotice);
      location.href = "./legalnotice.html";
   });
}

if (help) {
   help.addEventListener("click", () => {
      document
         .querySelectorAll(".navBar__quicklink, .legalInformation")
         .forEach((item) => item.classList.remove("navBar__quicklink--active"));
      location.href = "./help.html";
   });
}

if (dropdownHelp) {  
   dropdownHelp.addEventListener("click", () => {
      document
         .querySelectorAll(".navBar__quicklink, .legalInformation")
         .forEach((item) => item.classList.remove("navBar__quicklink--active"));
      location.href = "./help.html";
   });
}

if (dropdownPrivacyPolicy) {
   dropdownPrivacyPolicy.addEventListener("click", () => {
      setActiveNav(navPrivacyPolicy);
      location.href = "./privacy-Policy.html";
   });
}

if (dropdownLegalNotice) {
   dropdownLegalNotice.addEventListener("click", () => {
      setActiveNav(navLegalNotice);
      location.href = "./legalnotice.html";
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

// new code