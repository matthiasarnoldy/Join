// This file contains the JavaScript code for handling button clicks in the navigation
// bar of the Join application. Each button redirects the user to a different page when clicked.

// Get references to the navigation buttons

const navSummary = document.getElementById("nav-summary");
const navAddTask = document.getElementById("nav-add-task");
const navBoard = document.getElementById("nav-board");
const navContacts = document.getElementById("nav-contacts");
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

document.addEventListener("DOMContentLoaded", () => {
   setActiveNavByPath();
});

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

// new code
