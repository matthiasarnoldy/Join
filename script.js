// Navigation and header interactions shared across pages.

function setActiveNav(clickedItem) {
   document
      .querySelectorAll(".navBar__quicklink, .legalInformation")
      .forEach((item) => item.classList.remove("navBar__quicklink--active"));
   if (clickedItem) clickedItem.classList.add("navBar__quicklink--active");
}

function clearActiveNav() {
   document
      .querySelectorAll(".navBar__quicklink, .legalInformation")
      .forEach((item) => item.classList.remove("navBar__quicklink--active"));
}

function initGlobalUi() {
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
   const arrowBack = document.getElementById("help__arrowBack");

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
         clearActiveNav();
         location.href = "./help.html";
      });
   }

   if (dropdownHelp) {
      dropdownHelp.addEventListener("click", () => {
         clearActiveNav();
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

   if (loginInitials) {
      loginInitials.addEventListener("click", () => {
         const dropdownMenu = document.getElementById("dropdownMenu");
         if (!dropdownMenu) return;
         dropdownMenu.classList.toggle("header__dropdown--opened");
         loginInitials.classList.toggle("login__initials--opened");
      });
   }

   window.addEventListener("click", (event) => {
      const dropdownMenu = document.getElementById("dropdownMenu");
      if (!dropdownMenu || !loginInitials) return;

      if (
         !dropdownMenu.contains(event.target) &&
         event.target !== loginInitials
      ) {
         dropdownMenu.classList.remove("header__dropdown--opened");
         loginInitials.classList.remove("login__initials--opened");
      }
   });

   if (arrowBack) {
      arrowBack.addEventListener("click", () => {
         window.history.back();
      });
   }

   document.addEventListener("click", (event) => {
      if (event.target.closest(".summary__card")) {
         location.href = "./board.html";
      }
   });
}

if (document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initGlobalUi);
} else {
   initGlobalUi();
}
