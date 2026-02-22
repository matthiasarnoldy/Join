// ===== TASK SPEICHERN =====

function getSelectedContacts() {
   const selectedOptions = document.querySelectorAll(`.${ASSIGNED_SELECTED_CLASS}`);
   const contacts = [];
   selectedOptions.forEach((option) => {
      const initialsElement = option.querySelector(".add-task__option-initials");
      const contactName = option.textContent.trim();
      const contactValue = option.dataset.value || "";
      const contactInitials = initialsElement?.textContent || "";
      contacts.push({
         name: contactName,
         initials: contactInitials,
         value: contactValue
      });
   });
   return contacts;
}

function getSubtasksList() {
   const subtaskItems = document.querySelectorAll(".add-task__subtask-item");
   const subtasks = [];
   subtaskItems.forEach((item) => {
      const textElement = item.querySelector(".add-task__subtask-text");
      const subtaskText = textElement?.textContent || "";
      if (subtaskText) {
         subtasks.push({
            text: subtaskText,
            completed: false
         });
      }
   });
   return subtasks;
}

function getDialogStatus() {
   const dialog = document.getElementById("addTaskDialog");
   return dialog?.dataset.taskStatus || "todo";
}

function getBasicInputs() {
   const title = document.querySelector("#addTaskTitle")?.value || "";
   const description = document.querySelector("#addTaskDescription")?.value || "";
   const date = document.querySelector("#addTaskDate")?.value || "";
   const activeButton = document.querySelector(".add-task__priority-option--active");
   let priority = "medium";
   if (activeButton) {
      if (activeButton.classList.contains("add-task__priority-option--urgent")) {
         priority = "urgent";
      } else if (activeButton.classList.contains("add-task__priority-option--medium")) {
         priority = "medium";
      } else if (activeButton.classList.contains("add-task__priority-option--low")) {
         priority = "low";
      }
   }
   const category = document.getElementById("addTaskCategoryInput")?.value?.trim() || "";
   return { title, description, date, priority, category };
}

function createTaskData() {
   const status = getDialogStatus();
   const { title, description, date, priority, category } = getBasicInputs();
   return {
      id: Date.now(),
      title,
      description,
      date,
      priority,
      category,
      assigned: getSelectedContacts(),
      subtasks: getSubtasksList(),
      status
   };
}

function loadTasksFromStorage() {
   const tasksJson = sessionStorage.getItem("tasks") || "[]";
   return JSON.parse(tasksJson);
}

function saveTasksToStorage(tasks) {
   const tasksJson = JSON.stringify(tasks);
   sessionStorage.setItem("tasks", tasksJson);
}

function addTaskToStorage(taskData) {
   const allTasks = loadTasksFromStorage();
   allTasks.push(taskData);
   saveTasksToStorage(allTasks);
}

function isInDialog() {
   const dialog = document.getElementById("addTaskDialog");
   return dialog && dialog.open;
}

function createSuccessMessage() {
   const messageDiv = document.createElement("div");
   messageDiv.className = "task-success-message";
   const messageText = document.createElement("span");
   messageText.className = "task-success-message__text";
   messageText.textContent = "Task added to board";
   const messageIcon = document.createElement("img");
   messageIcon.className = "task-success-message__icon";
   messageIcon.src = "./assets/icons/desktop/board.svg";
   messageIcon.alt = "Board";
   messageDiv.append(messageText, messageIcon);
   return messageDiv;
}

function showSuccessMessage() {
   const message = createSuccessMessage();
   document.body.appendChild(message);
   requestAnimationFrame(() => {
      message.classList.add("task-success-message--visible");
   });
   setTimeout(() => {
      message.remove();
   }, 1000);
}

function redirectAfterSave() {
   if (isInDialog()) {
      window.location.reload();
   } else {
      window.location.href = "./board.html";
   }
}

function saveTaskToBoard() {
   const taskData = createTaskData();
   addTaskToStorage(taskData);
   if (isInDialog()) {
      sessionStorage.setItem("showTaskSuccess", "true");
      redirectAfterSave();
      return;
   }
   showSuccessMessage();
   setTimeout(() => {
      redirectAfterSave();
   }, 1000);
}
