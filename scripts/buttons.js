const navSummary = document.getElementById("nav-summary");
const navAddTask = document.getElementById("nav-add-task");
const navBoard = document.getElementById("nav-board");
const navContacts = document.getElementById("nav-contacts");

if (navSummary) {
   navSummary.addEventListener("click", () => {
      location.href = "./summary.html";
   });
}

if (navAddTask) {
   navAddTask.addEventListener("click", () => {
      location.href = "HIERLINKEINTIPPEN";
   });
}

if (navBoard) {
   navBoard.addEventListener("click", () => {
      location.href = "./board.html";
   });
}

if (navContacts) {
   navContacts.addEventListener("click", () => {
      location.href = "HIERLINKEINTIPPEN";
   });
}
