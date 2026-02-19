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

function filterTasks(searchTerm) {
   const allCards = document.querySelectorAll(".task-card");
   const lowerSearchTerm = searchTerm.toLowerCase().trim();
   
   if (lowerSearchTerm === "") {
      // Alle Tasks anzeigen wenn Suche leer ist
      allCards.forEach(card => {
         card.style.display = "";
      });
      updatePlaceholders();
      return;
   }
   
   // Tasks filtern basierend auf Titel
   allCards.forEach(card => {
      const title = card.querySelector(".task-card__title")?.textContent.toLowerCase() || "";
      
      if (title.includes(lowerSearchTerm)) {
         card.style.display = "";
      } else {
         card.style.display = "none";
      }
   });
   
   updatePlaceholders();
}

function updatePlaceholders() {
   const columns = document.querySelectorAll(".board-task-column");
   
   columns.forEach(column => {
      const visibleCards = Array.from(column.querySelectorAll(".task-card")).filter(
         card => card.style.display !== "none"
      );
      
      let placeholder = column.querySelector(".board-task-placeholder");
      
      if (visibleCards.length === 0) {
         // Placeholder anzeigen wenn keine sichtbaren Tasks
         if (!placeholder) {
            placeholder = document.createElement("div");
            placeholder.className = "board-task-placeholder";
            placeholder.textContent = "No tasks found";
            column.insertBefore(placeholder, column.firstChild);
         }
         placeholder.style.display = "";
      } else {
         // Placeholder verstecken wenn Tasks vorhanden
         if (placeholder) {
            placeholder.style.display = "none";
         }
      }
   });
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
      urgent: "./assets/icons/desktop/Priority rot.svg",
      medium: "./assets/icons/desktop/Priority orange.svg",
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

function createTaskCard(taskData) {
   const card = document.createElement("article");
   card.className = "task-card";
   card.dataset.taskId = taskData.id;
   
   const categoryClass = taskData.category === "technical" ? "task-card__label--teal" : "";
   const hasSubtasks = taskData.subtasks.length > 0;
   const completedSubtasks = taskData.subtasks.filter(s => s.completed).length;
   const subtaskProgress = hasSubtasks ? (completedSubtasks / taskData.subtasks.length) * 100 : 0;
   
   let avatarsHTML = "";
   if (taskData.assigned && taskData.assigned.length > 0) {
      // Calculate how many avatars fit based on available width
      // Avatar width: 32px, overlap: -8px
      // Available width: 220px
      // First avatar: 32px, each additional: 24px (32px - 8px overlap)
      const avatarWidth = 32;
      const overlapWidth = 8;
      const availableWidth = 220;
      
      // Calculate max avatars that fit
      // Formula: 32 + (n-1) * 24 <= 220
      // If overflow indicator needed, reserve space: 32 + (n-1) * 24 + 24 <= 220
      const maxAvatars = Math.floor((availableWidth - avatarWidth) / (avatarWidth - overlapWidth)) + 1;
      
      const totalContacts = taskData.assigned.length;
      const displayCount = totalContacts > maxAvatars ? maxAvatars - 1 : totalContacts;
      
      // Display avatars that fit
      for (let i = 0; i < displayCount; i++) {
         const contact = taskData.assigned[i];
         const colors = ["orange", "teal", "purple"];
         const color = colors[i % colors.length];
         avatarsHTML += `<span class="avatar avatar--${color}">${contact.initials}</span>`;
      }
      
      // Add overflow indicator if there are more contacts
      if (totalContacts > displayCount) {
         const remaining = totalContacts - displayCount;
         avatarsHTML += `<span class="avatar avatar--overflow">+${remaining}</span>`;
      }
   }
   
   let subtasksHTML = "";
   if (hasSubtasks) {
      subtasksHTML = `
         <div class="task-card__progress">
            <div class="task-card__progress-track">
               <div class="task-card__progress-bar" style="width: ${subtaskProgress}%"></div>
            </div>
            <span class="task-card__progress-text">${completedSubtasks}/${taskData.subtasks.length} Subtasks</span>
         </div>
      `;
   }
   
   card.innerHTML = `
      <span class="task-card__label ${categoryClass}">${getCategoryLabel(taskData.category)}</span>
      <h3 class="task-card__title">${taskData.title}</h3>
      <p class="task-card__description">${taskData.description}</p>
      ${subtasksHTML}
      <div class="task-card__meta">
         <div class="task-card__avatars">
            ${avatarsHTML}
         </div>
         <img class="task-card__priority" src="${getPriorityIcon(taskData.priority)}" alt="Priority" />
      </div>
   `;
   
   return card;
}

function loadTasksFromSession() {
   const tasks = JSON.parse(sessionStorage.getItem("tasks") || "[]");
   
   if (tasks.length === 0) return;
   
   const columns = {
      "todo": document.getElementById("column-todo"),
      "in-progress": document.getElementById("column-in-progress"),
      "await-feedback": document.getElementById("column-await-feedback"),
      "done": document.getElementById("column-done")
   };
   
   // Tasks zu den entsprechenden Spalten hinzufügen
   tasks.forEach(taskData => {
      // Sicherstellen dass category ein String ist
      if (taskData.category && typeof taskData.category !== 'string') {
         taskData.category = String(taskData.category);
      }
      
      const column = columns[taskData.status];
      if (column) {
         // Placeholder entfernen falls vorhanden
         const placeholder = column.querySelector(".board-task-placeholder");
         if (placeholder) {
            placeholder.remove();
         }
         
         const card = createTaskCard(taskData);
         column.appendChild(card);
      }
   });
}

// Tasks beim Laden der Seite anzeigen
document.addEventListener("DOMContentLoaded", () => {
   loadTasksFromSession();
   setupColumnAddButtons();
   setupTaskSearch();
});