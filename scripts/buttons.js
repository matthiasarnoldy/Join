// This file contains the JavaScript code for handling button clicks in the navigation
// bar of the Join application. Each button redirects the user to a different page when clicked.

// Get references to the navigation buttons

const navSummary = document.getElementById("nav-summary");
const navAddTask = document.getElementById("nav-add-task");
const navBoard = document.getElementById("nav-board");
const navContacts = document.getElementById("nav-contacts");
const navPrivacyPolicy = document.getElementById("navPrivacyPolicy");
const navLegalNotice = document.getElementById("navLegalNotice");

// Add event listeners to the buttons to handle clicks and redirect to the appropriate pages

if (navSummary) {
   navSummary.addEventListener("click", () => {
      location.href = "./summary.html";
   });
}

if (navAddTask) {
   navAddTask.addEventListener("click", () => {
      location.href = "./add-task.html";
   });
}

if (navBoard) {
   navBoard.addEventListener("click", () => {
      location.href = "./board.html";
   });
}

if (navContacts) {
   navContacts.addEventListener("click", () => {
      location.href = "./contacts.html";
   });
}

if (navPrivacyPolicy) {
   navContacts.addEventListener("click", () => {
      location.href = "./privacy-policy.html";
   });
}

if (navLegalNotice) {
   navContacts.addEventListener("click", () => {
      location.href = "./legal-notice.html";
   });
}

// new code
