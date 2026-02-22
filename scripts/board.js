function openDialog(status = "todo") {
    const dialog = document.getElementById("addTaskDialog");
    if (dialog) {
        // Status im Dialog speichern für späteren Abruf
        dialog.dataset.taskStatus = status;
        dialog.showModal();
    }
}

window.addEventListener("click", (event) => {
    const dialog = document.getElementById("addTaskDialog");
    if (dialog && event.target === dialog) {
        dialog.close();
    }
});

function closeDialog() {
    const dialog = document.getElementById("addTaskDialog");
    if (dialog) {
        dialog.close();
        // Status zurücksetzen
        delete dialog.dataset.taskStatus;
    }
}

// Event-Listener für Plus-Buttons in den Spalten
function setupColumnAddButtons() {
    const addButtons = document.querySelectorAll(".board-column__add");
    addButtons.forEach(button => {
        button.addEventListener("click", () => {
            const status = button.dataset.status || "todo";
            openDialog(status);
        });
    });
}

// ===== TASK SUCHE =====

function setCardVisibility(card, shouldShow) {
   card.style.display = shouldShow ? "" : "none";
}

function filterTasks(searchTerm) {
   const allCards = document.querySelectorAll(".task-card");
   const lowerSearchTerm = String(searchTerm || "").toLowerCase().trim();
   if (lowerSearchTerm === "") {
      allCards.forEach(card => setCardVisibility(card, true));
      updatePlaceholders();
      return;
   }
   allCards.forEach(card => {
      const title = card.querySelector(".task-card__title")?.textContent.toLowerCase() || "";
      setCardVisibility(card, title.includes(lowerSearchTerm));
   });
   updatePlaceholders();
}

function ensurePlaceholderExists(column) {
   let placeholder = column.querySelector(".board-task-placeholder");
   if (!placeholder) {
      placeholder = document.createElement("div");
      placeholder.className = "board-task-placeholder";
      placeholder.textContent = "No tasks found";
      column.insertBefore(placeholder, column.firstChild);
   }
   return placeholder;
}

function processColumnPlaceholder(column) {
   const visibleCards = Array.from(column.querySelectorAll(".task-card")).filter(card => card.style.display !== "none");
   if (visibleCards.length === 0) {
      const placeholder = ensurePlaceholderExists(column);
      placeholder.style.display = "";
   } else {
      const placeholder = column.querySelector(".board-task-placeholder");
      if (placeholder) placeholder.style.display = "none";
   }
}

function updatePlaceholders() {
   const columns = document.querySelectorAll(".board-task-column");
   columns.forEach(processColumnPlaceholder);
}

function setupTaskSearch() {
   const searchInput = document.getElementById("findTaskInput");
   
   if (searchInput) {
      searchInput.addEventListener("input", (e) => {
         filterTasks(e.target.value);
      });
   }
}

// ===== TASK CARDS GENERIEREN =====

function getPriorityIcon(priority) {
   const icons = {
      urgent: "./assets/icons/desktop/Priority orange.svg",
      medium: "./assets/icons/desktop/Priority gleich.svg",
      low: "./assets/icons/desktop/Priority green.svg"
   };
   return icons[priority] || icons.medium;
}

function getCategoryLabel(category) {
   const categoryStr = String(category || "");
   const labels = {
      "technical": "Technical Task",
      "user-story": "User Story"
   };
   return labels[categoryStr] || categoryStr;
}

function buildAvatarsHTML(taskData) {
   if (!taskData.assigned || taskData.assigned.length === 0) return "";
   const avatarWidth = 32, overlap = 8, available = 220;
   const maxAvatars = Math.floor((available - avatarWidth) / (avatarWidth - overlap)) + 1;
   const total = taskData.assigned.length;
   const displayCount = total > maxAvatars ? maxAvatars - 1 : total;
   const colors = ["orange", "teal", "purple"];
   let html = "";
   for (let i = 0; i < displayCount; i++) {
      const color = colors[i % colors.length];
      html += `<span class="avatar avatar--${color}">${taskData.assigned[i].initials}</span>`;
   }
   const remaining = total - displayCount;
   if (remaining > 0) html += `<span class="avatar avatar--overflow">+${remaining}</span>`;
   return html;
}

// Subtask and card HTML are provided by template.js (pure HTML, no logic)

function createTaskCard(taskData) {
   const card = document.createElement("article");
   card.className = "task-card";
   card.dataset.taskId = taskData.id;
   const categoryClass = taskData.category === "technical" ? "task-card__label--teal" : "";
   const completedSubtasks = (taskData.subtasks || []).filter(s => s.completed).length;
   const subtaskProgress = (taskData.subtasks && taskData.subtasks.length) ? (completedSubtasks / taskData.subtasks.length) * 100 : 0;
   const avatarsHTML = buildAvatarsHTML(taskData);
   const subtasksHTML = (typeof taskCardSubtasksHTML === 'function' && taskData.subtasks && taskData.subtasks.length) ? taskCardSubtasksHTML(completedSubtasks, taskData.subtasks.length, subtaskProgress) : "";
   const priorityIcon = getPriorityIcon(taskData.priority);
   const categoryLabel = getCategoryLabel(taskData.category);
   const useTemplate = typeof taskCardHTML === 'function';
   card.innerHTML = useTemplate ? taskCardHTML(categoryClass, categoryLabel, taskData.title, taskData.description, subtasksHTML, avatarsHTML, priorityIcon) : `<span class="task-card__label ${categoryClass}">${categoryLabel}</span><h3 class="task-card__title">${taskData.title}</h3><p class="task-card__description">${taskData.description}</p>${subtasksHTML}<div class="task-card__meta"><div class="task-card__avatars">${avatarsHTML}</div><img class="task-card__priority" src="${priorityIcon}" alt="Priority" /></div>`;
   return card;
}

function addTaskToColumn(taskData, columns) {
   if (taskData.category && typeof taskData.category !== 'string') taskData.category = String(taskData.category);
   const column = columns[taskData.status];
   if (!column) return;
   const placeholder = column.querySelector(".board-task-placeholder");
   if (placeholder) placeholder.remove();
   const card = createTaskCard(taskData);
   column.appendChild(card);
}

function loadTasksFromSession() {
   const tasks = JSON.parse(sessionStorage.getItem("tasks") || "[]");
   if (!tasks || tasks.length === 0) return;
   const columns = {
      "todo": document.getElementById("column-todo"),
      "in-progress": document.getElementById("column-in-progress"),
      "await-feedback": document.getElementById("column-await-feedback"),
      "done": document.getElementById("column-done")
   };
   tasks.forEach(taskData => addTaskToColumn(taskData, columns));
}

// Tasks beim Laden der Seite anzeigen
document.addEventListener("DOMContentLoaded", () => {
   loadTasksFromSession();
   setupColumnAddButtons();
   setupTaskSearch();

   const shouldShowSuccess = sessionStorage.getItem("showTaskSuccess");
   if (shouldShowSuccess === "true") {
      sessionStorage.removeItem("showTaskSuccess");
      if (typeof showSuccessMessage === "function") {
         showSuccessMessage();
      }
   }
});