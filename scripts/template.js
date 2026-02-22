function setGoodMorning() {
    return `
        Good Morning,
    `;
}

function setGoodAfternoon() {
    return `
        Good Afternoon,
    `;
}

function setGoodEvening() {
    return `
        Good Evening,
    `;
}

function setGoodNight() {
    return `
        Good Night,
    `;
}

function createSubtaskHTML(subtaskText) {
   return `
      <span class="add-task__subtask-text">${subtaskText}</span>
      <div class="add-task__subtask-item-actions">
         <button type="button" class="add-task__subtask-item-button add-task__subtask-item-button--edit" data-action="edit">
            <img src="./assets/icons/desktop/subtask__pencil.svg" alt="" class="add-task__subtask-item-icon" />
         </button>
         <button type="button" class="add-task__subtask-item-button add-task__subtask-item-button--delete-edit" data-action="delete-edit" style="display: none;">
            <img src="./assets/icons/desktop/subtask__trash.svg" alt="" class="add-task__subtask-item-icon" />
         </button>
         <span class="add-task__subtask-dividingline"></span>
         <button type="button" class="add-task__subtask-item-button add-task__subtask-item-button--delete" data-action="delete">
            <img src="./assets/icons/desktop/subtask__trash.svg" alt="" class="add-task__subtask-item-icon" />
         </button>
         <button type="button" class="add-task__subtask-item-button add-task__subtask-item-button--check" data-action="check" style="display: none;">
            <img src="./assets/icons/desktop/check.svg" alt="" class="add-task__subtask-item-icon" />
         </button>
      </div>
   `;
}

function createInitialHTML(initialsText) {
    return `<span class="add-task__assigned-initial">${initialsText}</span>`;
}

function createOverflowHTML(remainingCount) {
    return `<span class="add-task__assigned-overflow">+${remainingCount}</span>`;
}

function taskCardSubtasksHTML(completedSubtasks, totalSubtasks, subtaskProgress) {
    return `
        <div class="task-card__progress">
            <div class="task-card__progress-track">
                <div class="task-card__progress-bar" style="width: ${subtaskProgress}%"></div>
            </div>
            <span class="task-card__progress-text">${completedSubtasks}/${totalSubtasks} Subtasks</span>
        </div>
    `;
}

// Avatar HTML templates are built in board.js (templates only here)

function taskCardHTML(categoryClass, categoryLabel, title, description, subtasksHTML, avatarsHTML, priorityIconSrc) {
   return `
      <span class="task-card__label ${categoryClass}">${categoryLabel}</span>
      <h3 class="task-card__title">${title}</h3>
      <p class="task-card__description">${description}</p>
      ${subtasksHTML}
      <div class="task-card__meta">
         <div class="task-card__avatars">
            ${avatarsHTML}
         </div>
         <img class="task-card__priority" src="${priorityIconSrc}" alt="Priority" />
      </div>
   `;
}