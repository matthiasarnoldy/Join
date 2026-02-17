// ===== FORMULAR-VALIDIERUNG =====

// Alle Pflichtfelder im Container finden
function findRequiredFields(container) {
   return Array.from(container.querySelectorAll(".add-task__input-field--required"));
}

// Input-Element aus Feld holen (input, textarea oder select)
function getInputFromField(field) {
   return field.querySelector("input, textarea, select");
}

// Prüfen ob ein Feld ausgefüllt ist
function isFieldFilled(field) {
   const input = getInputFromField(field);
   if (!input) return false;
   return input.value.trim() !== ""; // Nicht leer
}

// Button aktivieren/deaktivieren
function setButtonState(button, allFieldsValid) {
   if (allFieldsValid) {
      button.classList.remove("is-disabled");
      button.setAttribute("aria-disabled", "false");
   } else {
      button.classList.add("is-disabled");
      button.setAttribute("aria-disabled", "true");
   }
}

// Fehler anzeigen bei leeren Feldern
function showErrorsOnEmptyFields(fields) {
   fields.forEach((field) => {
      if (!isFieldFilled(field)) {
         field.classList.add("add-task__input-field--error");
      }
   });
}

// Input-Handler für ein Feld
function handleFieldInput(field, fields, button) {
   field.classList.remove("add-task__input-field--error");
   const allValid = fields.every(isFieldFilled);
   setButtonState(button, allValid);
}

// Live-Validierung: Bei jeder Eingabe prüfen
function setupLiveValidation(fields, button) {
   fields.forEach((field) => {
      const input = getInputFromField(field);
      if (!input) return;
      input.addEventListener("input", () => handleFieldInput(field, fields, button));
   });
}

// Button-Click Handler
function handleCreateButtonClick(event, fields) {
   if (fields.every(isFieldFilled)) return;
   event.preventDefault();
   showErrorsOnEmptyFields(fields);
}

// Create-Button vorbereiten
function setupCreateButton(button) {
   const form = button.closest("form") || document;
   const fields = findRequiredFields(form);
   if (fields.length === 0) return;
   const allValid = fields.every(isFieldFilled);
   setButtonState(button, allValid);
   setupLiveValidation(fields, button);
   button.addEventListener("click", (event) => handleCreateButtonClick(event, fields));
}

// Alle Create-Buttons initialisieren
function initFormValidation() {
   const allCreateButtons = document.querySelectorAll(".add-task__button--create");
   allCreateButtons.forEach(setupCreateButton);
}

// ===== TEXTAREA VERGRÖSSERN/VERKLEINERN =====

// Pixel-Wert aus String extrahieren ("120px" → 120)
function extractPixels(cssValue) {
   return Number.parseFloat(cssValue) || 0;
}

// Wert zwischen Min und Max begrenzen
function limitValue(value, min, max) {
   if (value < min) return min;
   if (value > max) return max;
   return value;
}

// Min/Max-Höhe aus CSS holen
function getTextareaLimits(textarea) {
   const styles = getComputedStyle(textarea);
   const minHeight = extractPixels(styles.minHeight) || 48;
   const maxHeight = extractPixels(styles.maxHeight) || 10000;
   return { minHeight, maxHeight };
}

// Textarea-Höhe während Drag anpassen
function resizeTextarea(moveEvent, startMouseY, startHeight, textarea, minHeight, maxHeight) {
   const mouseDelta = moveEvent.clientY - startMouseY;
   const newHeight = startHeight + mouseDelta;
   const limitedHeight = limitValue(newHeight, minHeight, maxHeight);
   textarea.style.height = `${limitedHeight}px`;
}

// Resize starten (Maus gedrückt)
function startTextareaResize(event, textarea) {
   event.preventDefault();
   const { minHeight, maxHeight } = getTextareaLimits(textarea);
   const startMouseY = event.clientY;
   const startHeight = textarea.offsetHeight;
   
   const onMouseMove = (e) => resizeTextarea(e, startMouseY, startHeight, textarea, minHeight, maxHeight);
   const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
   };
   document.addEventListener("mousemove", onMouseMove);
   document.addEventListener("mouseup", onMouseUp);
}

// Resize-Handle für ein Textarea einrichten
function setupTextareaResizeHandle(wrapper) {
   const textarea = wrapper.querySelector("textarea");
   const handle = wrapper.querySelector(".add-task__textarea-resize");
   
   if (!textarea || !handle) return;
   
   // Handle klickbar machen
   handle.style.pointerEvents = "auto";
   
   // Bei Maus-Klick auf Handle
   handle.addEventListener("mousedown", (event) => {
      startTextareaResize(event, textarea);
   });
}

// ===== PRIORITY FIELD =====

// Click-Handler für einen Priority-Button
function handlePriorityClick(event) {
   const clickedButton = event.target.closest(".add-task__priority-option");
   if (!clickedButton) return;
   
   // Alle Priority-Buttons finden
   const field = clickedButton.closest(".add-task__priority-field");
   const allButtons = field.querySelectorAll(".add-task__priority-option");
   
   // Entferne active-Klasse von allen
   allButtons.forEach(btn => btn.classList.remove("add-task__priority-option--active"));
   
   // Füge active-Klasse zum geklickten Button hinzu
   clickedButton.classList.add("add-task__priority-option--active");
}

// Priority-Feld initialisieren
function initPriorityField() {
   const priorityField = document.getElementById("addTaskPriority");
   if (!priorityField) return;
   
   priorityField.addEventListener("click", handlePriorityClick);
}

// ===== CATEGORY SELECT =====

function getCategoryElements() {
   const select = document.getElementById("addTaskCategory");
   return {
      select,
      menu: document.getElementById("addTaskCategoryMenu"),
      input: document.getElementById("addTaskCategoryInput"),
      valueLabel: document.querySelector("#addTaskCategory .add-task__select-value"),
      selectionGroup: select?.closest(".add-task__selection-group")
   };
}

function isCategoryReady(elements) {
   return elements.select && elements.menu && elements.input && elements.valueLabel;
}

function setCategoryOpenState(elements, isOpen) {
   if (!elements.selectionGroup) return;
   elements.selectionGroup.classList.toggle("add-task__selection-group--category-open", isOpen);
}

function toggleCategoryMenu(elements) {
   const isOpen = elements.select.classList.toggle("add-task__select--open");
   if (isOpen) {
      resetCategoryPlaceholder(elements);
   } else {
      restoreLastCategorySelection(elements);
   }
   elements.select.setAttribute("aria-expanded", isOpen ? "true" : "false");
   setCategoryOpenState(elements, isOpen);
}

function closeCategoryMenu(elements) {
   elements.select.classList.remove("add-task__select--open");
   elements.select.setAttribute("aria-expanded", "false");
   setCategoryOpenState(elements, false);
   restoreLastCategorySelection(elements);
}

function setCategoryValue(option, elements) {
   const label = option.textContent.trim();
   const value = option.dataset.value || label;
   elements.input.value = value;
   elements.valueLabel.textContent = label;
   elements.input.dataset.lastValue = value;
   elements.valueLabel.dataset.lastLabel = label;
   elements.input.dispatchEvent(new Event("input", { bubbles: true }));
   closeCategoryMenu(elements);
}

function resetCategoryPlaceholder(elements) {
   const placeholder = elements.valueLabel.dataset.placeholder || elements.valueLabel.textContent;
   elements.valueLabel.textContent = placeholder;
   elements.valueLabel.dataset.placeholder = placeholder;
   elements.input.value = "";
   elements.input.dispatchEvent(new Event("input", { bubbles: true }));
}

function restoreLastCategorySelection(elements) {
   const lastLabel = elements.valueLabel.dataset.lastLabel;
   const lastValue = elements.input.dataset.lastValue;
   if (!lastLabel || !lastValue) return;
   elements.valueLabel.textContent = lastLabel;
   elements.input.value = lastValue;
   elements.input.dispatchEvent(new Event("input", { bubbles: true }));
}

function handleCategorySelectClick(event, elements) {
   event.stopPropagation();
   toggleCategoryMenu(elements);
}

function handleCategoryOptionClick(event, elements) {
   event.stopPropagation();
   const option = event.target.closest(".add-task__select-option");
   if (!option) return;
   setCategoryValue(option, elements);
}

function setupCategoryEvents(elements) {
   elements.select.addEventListener("click", (event) => handleCategorySelectClick(event, elements));
   elements.menu.addEventListener("click", (event) => handleCategoryOptionClick(event, elements));
   document.addEventListener("click", () => closeCategoryMenu(elements));
}

function initCategorySelect() {
   const elements = getCategoryElements();
   if (!isCategoryReady(elements)) return;
   elements.select.setAttribute("aria-expanded", "false");
   elements.valueLabel.dataset.placeholder = elements.valueLabel.textContent;
   if (elements.input.value) {
      elements.input.dataset.lastValue = elements.input.value;
      elements.valueLabel.dataset.lastLabel = elements.valueLabel.textContent;
   }
   setupCategoryEvents(elements);
}

// ===== ASSIGNED SELECT =====

function getAssignedElements() {
   const select = document.getElementById("addTaskAssigned");
   return {
      select,
      menu: document.getElementById("addTaskAssignedMenu"),
      input: document.getElementById("addTaskAssignedInput"),
      valueLabel: document.querySelector("#addTaskAssigned .add-task__select-value"),
      initialsContainer: document.getElementById("addTaskAssignedInitials"),
      selectionGroup: select?.closest(".add-task__information-group--selection")
   };
}

function isAssignedReady(elements) {
   return elements.select && elements.menu && elements.input && elements.valueLabel;
}

function setAssignedOpenState(elements, isOpen) {
   if (!elements.selectionGroup) return;
   elements.selectionGroup.classList.toggle("add-task__selection-group--assigned-open", isOpen);
}

function toggleAssignedMenu(elements) {
   const isOpen = elements.select.classList.toggle("add-task__select--open");
   if (isOpen) {
      resetAssignedPlaceholder(elements);
   } else {
      restoreLastAssignedSelection(elements);
   }
   elements.select.setAttribute("aria-expanded", isOpen ? "true" : "false");
   setAssignedOpenState(elements, isOpen);
}

function closeAssignedMenu(elements) {
   elements.select.classList.remove("add-task__select--open");
   elements.select.setAttribute("aria-expanded", "false");
   setAssignedOpenState(elements, false);
   restoreLastAssignedSelection(elements);
}

function setAssignedValue(option, elements) {
   const label = option.textContent.trim();
   const value = option.dataset.value || label;
   elements.input.value = value;
   elements.valueLabel.textContent = label;
   elements.input.dataset.lastValue = value;
   elements.valueLabel.dataset.lastLabel = label;
   elements.input.dispatchEvent(new Event("input", { bubbles: true }));
   closeAssignedMenu(elements);
}

function resetAssignedPlaceholder(elements) {
   const placeholder = elements.valueLabel.dataset.placeholder || elements.valueLabel.textContent;
   elements.valueLabel.textContent = placeholder;
   elements.valueLabel.dataset.placeholder = placeholder;
   elements.input.value = "";
   elements.input.dispatchEvent(new Event("input", { bubbles: true }));
}

function restoreLastAssignedSelection(elements) {
   const lastLabel = elements.valueLabel.dataset.lastLabel;
   const lastValue = elements.input.dataset.lastValue;
   if (!lastLabel || !lastValue) return;
   elements.valueLabel.textContent = lastLabel;
   elements.input.value = lastValue;
   elements.input.dispatchEvent(new Event("input", { bubbles: true }));
}

function handleAssignedSelectClick(event, elements) {
   event.stopPropagation();
   toggleAssignedMenu(elements);
}

function handleAssignedOptionClick(event, elements) {
   event.stopPropagation();
   const option = event.target.closest(".add-task__select-option");
   if (!option) return;
   
   // Toggle selection state
   const isSelected = option.classList.toggle("add-task__select-option--selected");
   
   // Update icon
   const checkbox = option.querySelector(".add-task__option-checkbox");
   if (checkbox) {
      if (isSelected) {
         checkbox.src = "./assets/icons/desktop/checkBox--checked.svg";
      } else {
         checkbox.src = "./assets/icons/desktop/checkBox.svg";
      }
   }
   
   // Update initials display
   updateAssignedInitials(elements);
}

function updateAssignedInitials(elements) {
   const selected = elements.menu.querySelectorAll(".add-task__select-option--selected");
   const initialsContainer = elements.initialsContainer;
   
   if (!initialsContainer) return;
   
   // Clear container
   initialsContainer.innerHTML = "";
   
   // Add initials for each selected contact
   selected.forEach((option) => {
      const initials = option.querySelector(".add-task__option-initials");
      if (initials) {
         const initialsSpan = document.createElement("span");
         initialsSpan.className = "add-task__assigned-initial";
         initialsSpan.textContent = initials.textContent;
         initialsContainer.appendChild(initialsSpan);
      }
   });
}

function setupAssignedEvents(elements) {
   elements.select.addEventListener("click", (event) => handleAssignedSelectClick(event, elements));
   elements.menu.addEventListener("click", (event) => handleAssignedOptionClick(event, elements));
   document.addEventListener("click", () => closeAssignedMenu(elements));
}

function initAssignedSelect() {
   const elements = getAssignedElements();
   if (!isAssignedReady(elements)) return;
   elements.select.setAttribute("aria-expanded", "false");
   elements.valueLabel.dataset.placeholder = elements.valueLabel.textContent;
   if (elements.input.value) {
      elements.input.dataset.lastValue = elements.input.value;
      elements.valueLabel.dataset.lastLabel = elements.valueLabel.textContent;
   }
   setupAssignedEvents(elements);
}

// Alle Textareas mit Resize-Handle initialisieren
function initTextareaResize() {
   const allTextareaWrappers = document.querySelectorAll(".add-task__input-field--textarea");
   allTextareaWrappers.forEach(setupTextareaResizeHandle);
}

// ===== SUBTASKS =====

function addSubtaskItem(list, value) {
   const item = document.createElement("li");
   item.className = "add-task__subtask-item";
   item.innerHTML = `
      <span class="add-task__subtask-text">${value}</span>
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
   
   const textSpan = item.querySelector(".add-task__subtask-text");
   const deleteButton = item.querySelector(".add-task__subtask-item-button[data-action='delete']");
   const deleteEditButton = item.querySelector(".add-task__subtask-item-button[data-action='delete-edit']");
   const checkButton = item.querySelector(".add-task__subtask-item-button[data-action='check']");
   const editButton = item.querySelector(".add-task__subtask-item-button[data-action='edit']");
   
   // Delete button handler (normal mode)
   deleteButton.addEventListener("click", () => {
      item.remove();
   });
   
   // Delete button handler (edit mode)
   deleteEditButton.addEventListener("click", (e) => {
      e.stopPropagation();
      item.remove();
   });
   
   // Edit button handler
   editButton.addEventListener("click", () => {
      enableEditMode(item, textSpan, checkButton);
   });
   
   // Double-click to edit on text
   textSpan.addEventListener("dblclick", () => {
      enableEditMode(item, textSpan, checkButton);
   });
   
   list.prepend(item);
}

function enableEditMode(item, textSpan, checkButton) {
   const currentText = textSpan.textContent;
   item.classList.add("add-task__subtask-item--editing");
   
   const input = document.createElement("input");
   input.type = "text";
   input.className = "add-task__subtask-input";
   input.value = currentText;
   
   textSpan.replaceWith(input);
   input.focus();
   input.select();
   
   function reattachListeners(newSpan) {
      // Re-attach dblclick listener
      newSpan.addEventListener("dblclick", () => {
         enableEditMode(item, newSpan, checkButton);
      });
      
      // Re-attach edit button listener
      const editButton = item.querySelector(".add-task__subtask-item-button[data-action='edit']");
      editButton.replaceWith(editButton.cloneNode(true));
      const newEditButton = item.querySelector(".add-task__subtask-item-button[data-action='edit']");
      newEditButton.addEventListener("click", () => {
         enableEditMode(item, newSpan, checkButton);
      });
   }
   
   function saveEdit() {
      const newText = input.value.trim();
      if (newText) {
         const newSpan = document.createElement("span");
         newSpan.className = "add-task__subtask-text";
         newSpan.textContent = newText;
         input.replaceWith(newSpan);
         item.classList.remove("add-task__subtask-item--editing");
         
         reattachListeners(newSpan);
      } else {
         input.focus();
      }
   }
   
   // Check button handler for saving
   const checkClickHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      saveEdit();
   };
   checkButton.addEventListener("click", checkClickHandler);
   
   const originalSaveEdit = saveEdit;
   saveEdit = function() {
      checkButton.removeEventListener("click", checkClickHandler);
      originalSaveEdit();
   };
   
   input.addEventListener("blur", (e) => {
      // Delay blur to allow button clicks to register first
      setTimeout(() => {
         if (item.classList.contains("add-task__subtask-item--editing")) {
            saveEdit();
         }
      }, 100);
   });
   input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
         saveEdit();
      } else if (e.key === "Escape") {
         checkButton.removeEventListener("click", checkClickHandler);
         const newSpan = document.createElement("span");
         newSpan.className = "add-task__subtask-text";
         newSpan.textContent = currentText;
         input.replaceWith(newSpan);
         item.classList.remove("add-task__subtask-item--editing");
         
         reattachListeners(newSpan);
      }
   });
}

function handleSubtaskClear(input) {
   input.value = "";
   input.focus();
}

function handleSubtaskAdd(input, list) {
   const value = input.value.trim();
   if (!value) return;
   addSubtaskItem(list, value);
   input.value = "";
   input.focus();
}

function setupSubtaskGroup(group) {
   const input = group.querySelector(".add-task__input--subtasks");
   const list = group.querySelector(".add-task__subtask-list");
   const clearButton = group.querySelector(".add-task__subtask-button[data-action='clear']");
   const addButton = group.querySelector(".add-task__subtask-button[data-action='add']");
   if (!input || !list || !clearButton || !addButton) return;
   clearButton.addEventListener("click", () => handleSubtaskClear(input));
   addButton.addEventListener("click", () => handleSubtaskAdd(input, list));
}

function initSubtaskControls() {
   const groups = document.querySelectorAll(".add-task__input-group--subtasks");
   groups.forEach(setupSubtaskGroup);
}

// ===== CLEAR BUTTON =====

function clearFormFields(container) {
   const fields = container.querySelectorAll("input, textarea, select");
   fields.forEach((field) => {
      if (field.type === "checkbox" || field.type === "radio") {
         field.checked = false;
         return;
      }
      field.value = "";
   });
}

function resetPriorityToMedium(container) {
   const priorityField = container.querySelector(".add-task__priority-field");
   if (!priorityField) return;
   const allButtons = priorityField.querySelectorAll(".add-task__priority-option");
   allButtons.forEach((btn) => btn.classList.remove("add-task__priority-option--active"));
   const mediumButton = priorityField.querySelector(".add-task__priority-option--medium");
   if (mediumButton) {
      mediumButton.classList.add("add-task__priority-option--active");
   }
}

function resetCategorySelect(container) {
   const select = container.querySelector(".add-task__select--category");
   if (!select) return;
   const valueLabel = select.querySelector(".add-task__select-value");
   const input = container.querySelector("#addTaskCategoryInput");
   if (!valueLabel || !input) return;
   const placeholder = valueLabel.dataset.placeholder || "Select task category";
   valueLabel.textContent = placeholder;
   valueLabel.dataset.placeholder = placeholder;
   valueLabel.dataset.lastLabel = "";
   input.value = "";
   input.dataset.lastValue = "";
   select.classList.remove("add-task__select--open");
   select.setAttribute("aria-expanded", "false");
   input.dispatchEvent(new Event("input", { bubbles: true }));
}

function resetValidationState(container) {
   const allFields = container.querySelectorAll(".add-task__input-field--required");
   allFields.forEach((field) => field.classList.remove("add-task__input-field--error"));
   const createButton = container.querySelector(".add-task__button--create");
   if (createButton) {
      setButtonState(createButton, false);
   }
}

function clearSubtaskLists(container) {
   const lists = container.querySelectorAll(".add-task__subtask-list");
   lists.forEach((list) => {
      list.innerHTML = "";
   });
}

function handleClearButtonClick(event, button) {
   event.preventDefault();
   const container = button.closest(".main_flex-instructions") || document;
   clearFormFields(container);
   clearSubtaskLists(container);
   resetCategorySelect(container);
   resetPriorityToMedium(container);
   resetValidationState(container);
}

function initClearButtons() {
   const clearButtons = document.querySelectorAll(".add-task__button--cancel");
   clearButtons.forEach((button) => {
      button.addEventListener("click", (event) => handleClearButtonClick(event, button));
   });
}

// ===== INIT =====

document.addEventListener("DOMContentLoaded", () => {
   initDatePicker();
   initFormValidation();
   initPriorityField();
   initCategorySelect();
   initAssignedSelect();
   initTextareaResize();
   initClearButtons();
   initSubtaskControls();
});
