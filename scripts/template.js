const TEMPLATE_ASSET_BASE_PATH = window.location.pathname.includes("/templates/")
   ? "../assets/"
   : "./assets/";

/**
 * Returns the template asset path.
 *
 * @param {string} relativePath - The relative path.
 * @returns {string} The template asset path.
 */
function templateAssetPath(relativePath) {
    return `${TEMPLATE_ASSET_BASE_PATH}${relativePath}`;
}


/**
 * Sets the good morning.
 * @returns {string} The good morning.
 */
function setGoodMorning() {
    return `
        Good Morning,
    `;
}


/**
 * Sets the good afternoon.
 * @returns {string} The good afternoon.
 */
function setGoodAfternoon() {
    return `
        Good Afternoon,
    `;
}


/**
 * Sets the good evening.
 * @returns {string} The good evening.
 */
function setGoodEvening() {
    return `
        Good Evening,
    `;
}


/**
 * Sets the good night.
 * @returns {string} The good night.
 */
function setGoodNight() {
    return `
        Good Night,
    `;
}


/**
 * Creates the subtask HTML.
 *
 * @param {object} subtaskText - The subtask text object.
 * @returns {string} The subtask HTML.
 */
function createSubtaskHTML(subtaskText) {
   return `
      <span class="add-task__subtask-text">${subtaskText}</span>
      <div class="add-task__subtask-item-actions">
         <button type="button" class="add-task__subtask-item-button add-task__subtask-item-button--edit" data-action="edit">
            <img src="${templateAssetPath("icons/desktop/subtask__pencil.svg")}" alt="" class="add-task__subtask-item-icon" />
         </button>
         <button type="button" class="add-task__subtask-item-button add-task__subtask-item-button--delete-edit" data-action="delete-edit" style="display: none;">
            <img src="${templateAssetPath("icons/desktop/subtask__trash.svg")}" alt="" class="add-task__subtask-item-icon" />
         </button>
         <span class="add-task__subtask-dividingline"></span>
         <button type="button" class="add-task__subtask-item-button add-task__subtask-item-button--delete" data-action="delete">
            <img src="${templateAssetPath("icons/desktop/subtask__trash.svg")}" alt="" class="add-task__subtask-item-icon" />
         </button>
         <button type="button" class="add-task__subtask-item-button add-task__subtask-item-button--check" data-action="check" style="display: none;">
            <img src="${templateAssetPath("icons/desktop/check.svg")}" alt="" class="add-task__subtask-item-icon" />
         </button>
      </div>
   `;
}


/**
 * Creates the initial HTML.
 *
 * @param {string} initialsText - The initials text.
 * @param {string} [color="#ff7a00"] - The color. Defaults to "#ff7a00".
 * @returns {string} The initial HTML.
 */
function createInitialHTML(initialsText, color = "#ff7a00") {
    return `<span class="add-task__assigned-initial" style="background-color: ${color};">${initialsText}</span>`;
}


/**
 * Creates the overflow HTML.
 *
 * @param {number} remainingCount - The remaining count.
 * @returns {string} The overflow HTML.
 */
function createOverflowHTML(remainingCount) {
    return `<span class="add-task__assigned-overflow">+${remainingCount}</span>`;
}


/**
 * Returns the task card subtasks HTML.
 *
 * @param {Array<object>} completedSubtasks - The completed subtasks list.
 * @param {Array<object>} totalSubtasks - The total subtasks list.
 * @param {object} subtaskProgress - The subtask progress object.
 * @returns {string} The task card subtasks HTML.
 */
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


/**
 * Returns the task card avatar HTML.
 *
 * @param {string} colorClass - The color class.
 * @param {string} initialsText - The initials text.
 * @returns {string} The task card avatar HTML.
 */
function taskCardAvatarHTML(colorClass, initialsText) {
   return `<span class="avatar avatar--${colorClass}">${initialsText}</span>`;
}


/**
 * Returns the task card avatar overflow HTML.
 *
 * @param {number} remainingCount - The remaining count.
 * @returns {string} The task card avatar overflow HTML.
 */
function taskCardAvatarOverflowHTML(remainingCount) {
    return `<span class="avatar avatar--overflow">+${remainingCount}</span>`;
}


/**
 * Returns the task card HTML.
 *
 * @param {string} categoryClass - The category class.
 * @param {HTMLElement|null} categoryLabel - The category label.
 * @param {string} title - The title.
 * @param {string} description - The description.
 * @param {Array<object>} subtasksHTML - The subtasks HTML list.
 * @param {HTMLElement|null} avatarsHTML - The avatars HTML.
 * @param {HTMLElement|null} priorityIconSrc - The priority icon src.
 * @returns {string} The task card HTML.
 */
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


/**
 * Returns the task card fallback HTML.
 *
 * @param {string} categoryClass - The category class.
 * @param {HTMLElement|null} categoryLabel - The category label.
 * @param {string} title - The title.
 * @param {string} description - The description.
 * @param {Array<object>} subtasksHTML - The subtasks HTML list.
 * @param {HTMLElement|null} avatarsHTML - The avatars HTML.
 * @param {HTMLElement|null} priorityIconSrc - The priority icon src.
 * @returns {string} The task card fallback HTML.
 */
function taskCardFallbackHTML(categoryClass, categoryLabel, title, description, subtasksHTML, avatarsHTML, priorityIconSrc) {
   return `<span class="task-card__label ${categoryClass}">${categoryLabel}</span><h3 class="task-card__title">${title}</h3><p class="task-card__description">${description}</p>${subtasksHTML}<div class="task-card__meta"><div class="task-card__avatars">${avatarsHTML}</div><img class="task-card__priority" src="${priorityIconSrc}" alt="Priority" /></div>`;
}
