// ===== TASK SPEICHERN =====

function getFormData(container = document) {
   // Prüfen ob der Task aus dem Board-Dialog kommt
   const dialog = document.getElementById("addTaskDialog");
   const status = dialog?.dataset.taskStatus || "todo";
   
   return {
      id: Date.now(),
      title: container.querySelector("#addTaskTitle")?.value || "",
      description: container.querySelector("#addTaskDescription")?.value || "",
      date: container.querySelector("#addTaskDate")?.value || "",
      priority: container.querySelector('input[name="priority"]:checked')?.value || "medium",
      category: container.querySelector("#addTaskCategoryInput")?.value || "",
      assigned: getAssignedContacts(container),
      subtasks: getSubtasks(container),
      status: status
   };
}

function getAssignedContacts(container) {
   const options = container.querySelectorAll(".add-task__select-option--assigned");
   const selected = [];
   options.forEach((option) => {
      if (option.classList.contains("add-task__select-option--selected")) {
         const initials = option.querySelector(".add-task__option-initials")?.textContent || "";
         const name = option.textContent.trim();
         const value = option.dataset.value || "";
         selected.push({ name, initials, value });
      }
   });
   return selected;
}

function getSubtasks(container) {
   const subtaskItems = container.querySelectorAll(".add-task__subtask-item");
   const subtasks = [];
   subtaskItems.forEach((item) => {
      const text = item.querySelector(".add-task__subtask-text")?.textContent || "";
      if (text) {
         subtasks.push({ text, completed: false });
      }
   });
   return subtasks;
}

function saveTaskToBoard() {
   const taskData = getFormData();
   console.log("Creating task:", taskData);
   
   // Tasks aus sessionStorage laden
   const tasks = JSON.parse(sessionStorage.getItem("tasks") || "[]");
   tasks.push(taskData);
   
   // Tasks in sessionStorage speichern
   sessionStorage.setItem("tasks", JSON.stringify(tasks));
   
   // Prüfen ob wir im Dialog (board.html) oder auf der add-task.html Seite sind
   const dialog = document.getElementById("addTaskDialog");
   const isInDialog = dialog && dialog.open;
   
   if (isInDialog) {
      // Im Dialog: Seite neu laden, um die neue Task anzuzeigen
      showSuccessMessage();
      setTimeout(() => {
         window.location.reload();
      }, 1000);
   } else {
      // Auf add-task.html: Zu board.html weiterleiten
      showSuccessMessage();
      setTimeout(() => {
         window.location.href = "./board.html";
      }, 1000);
   }
}

function showSuccessMessage() {
   const message = document.createElement("div");
   message.className = "task-success-message";
   message.textContent = "Task added to board";
   message.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #4caf50;
      color: white;
      padding: 20px 40px;
      border-radius: 10px;
      font-size: 18px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
   `;
   document.body.appendChild(message);
   setTimeout(() => {
      message.remove();
   }, 1000);
}

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
   if (!fields.every(isFieldFilled)) {
      event.preventDefault();
      showErrorsOnEmptyFields(fields);
      return;
   }
   event.preventDefault();
   saveTaskToBoard();
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
   updateAssignedInitials(elements);
}

function closeAssignedMenu(elements) {
   elements.select.classList.remove("add-task__select--open");
   elements.select.setAttribute("aria-expanded", "false");
   setAssignedOpenState(elements, false);
   restoreLastAssignedSelection(elements);
   updateAssignedInitials(elements);
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
   
   // Show search input and hide value label
   const searchInput = elements.select.querySelector(".add-task__select-input");
   if (searchInput) {
      searchInput.style.display = "block";
      searchInput.value = "To: ";
      
      // Add event handlers to prevent deleting "To: "
      searchInput.addEventListener("keydown", (e) => handleAssignedSearchKeydown(e, searchInput));
      searchInput.addEventListener("input", (e) => handleAssignedSearchInput(e, searchInput));
      
      elements.valueLabel.style.display = "none";
      
      // Focus after "To: "
      setTimeout(() => {
         searchInput.setSelectionRange(4, 4);
         searchInput.focus();
      }, 0);
   }
}

function handleAssignedSearchKeydown(e, input) {
   // Prevent backspace if cursor is at or before position 4 (after "To: ")
   if (e.key === "Backspace" && input.selectionStart <= 4) {
      e.preventDefault();
   }
   // Prevent delete key if cursor is at or before position 4
   if (e.key === "Delete" && input.selectionStart < 4) {
      e.preventDefault();
   }
}

function handleAssignedSearchInput(e, input) {
   // Ensure "To: " is always at the beginning
   if (!input.value.startsWith("To: ")) {
      const searchText = input.value.replace(/^To: /, "");
      input.value = "To: " + searchText;
      input.setSelectionRange(4 + searchText.length, 4 + searchText.length);
   }
   
   // Filter contacts based on search text
   const searchText = input.value.substring(4).toLowerCase().trim();
   const menu = input.closest(".add-task__select-wrapper")?.querySelector(".add-task__select-menu--assigned");
   
   if (menu) {
      const options = menu.querySelectorAll(".add-task__select-option--assigned");
      options.forEach((option) => {
         const text = option.textContent.toLowerCase();
         if (searchText === "" || text.includes(searchText)) {
            option.style.display = "flex";
         } else {
            option.style.display = "none";
         }
      });
   }
}

function restoreLastAssignedSelection(elements) {
   // Hide search input and show value label
   const searchInput = elements.select.querySelector(".add-task__select-input");
   if (searchInput) {
      searchInput.style.display = "none";
      searchInput.value = "";
      searchInput.removeEventListener("keydown", handleAssignedSearchKeydown);
      searchInput.removeEventListener("input", handleAssignedSearchInput);
   }
   
   // Show all contacts again
   const menu = elements.menu;
   if (menu) {
      const options = menu.querySelectorAll(".add-task__select-option--assigned");
      options.forEach((option) => {
         option.style.display = "flex";
      });
   }
   
   const lastLabel = elements.valueLabel.dataset.lastLabel;
   const lastValue = elements.input.dataset.lastValue;
   
   if (lastLabel && lastValue) {
      elements.valueLabel.textContent = lastLabel;
      elements.input.value = lastValue;
   } else {
      // Show default placeholder if no selection exists
      elements.valueLabel.textContent = "Select contacts to assign";
      elements.input.value = "";
   }
   
   elements.valueLabel.style.display = "block";
   elements.input.dispatchEvent(new Event("input", { bubbles: true }));
}

function handleAssignedSelectClick(event, elements) {
   event.stopPropagation();
   if (event.target.closest(".add-task__select-input")) return;
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
   const wrapper = elements.select?.closest(".add-task__select-wrapper");
   const isMenuOpen = elements.select?.classList.contains("add-task__select--open");
   const footer = document.querySelector(".add-task__footer");
   
   if (!initialsContainer) return;
   
   // Clear container
   initialsContainer.innerHTML = "";
   
   // Calculate how many initials fit in one line based on container width
   // Each initial is 42px wide + 8px gap = 50px per element
   const containerWidth = initialsContainer.offsetWidth;
   const elementWidth = 50; // 42px + 8px gap
   const totalSlots = Math.floor(containerWidth / elementWidth);
   // Reserve one slot for "+" if there are more contacts than slots available
   const maxDisplay = selected.length > totalSlots ? totalSlots - 1 : totalSlots;
   let displayCount = 0;
   
   // Add initials that fit in the line
   selected.forEach((option) => {
      if (displayCount < maxDisplay) {
         const initials = option.querySelector(".add-task__option-initials");
         if (initials) {
            const initialsSpan = document.createElement("span");
            initialsSpan.className = "add-task__assigned-initial";
            initialsSpan.textContent = initials.textContent;
            
            // Add click handler to remove selection
            initialsSpan.addEventListener("click", () => {
               option.classList.remove("add-task__select-option--selected");
               const checkbox = option.querySelector(".add-task__option-checkbox");
               if (checkbox) {
                  checkbox.src = "./assets/icons/desktop/checkBox.svg";
               }
               updateAssignedInitials(elements);
            });
            
            initialsContainer.appendChild(initialsSpan);
            displayCount++;
         }
      }
   });
   
   // Add "+" indicator if there are more selected than fit in the line
   if (selected.length > displayCount) {
      const plusSpan = document.createElement("span");
      plusSpan.className = "add-task__assigned-overflow";
      plusSpan.textContent = `+${selected.length - displayCount}`;
      initialsContainer.appendChild(plusSpan);
   }
   
   // Update wrapper padding and footer position based on whether contacts are selected and menu is closed
   if (wrapper) {
      if (selected.length > 0 && !isMenuOpen) {
         wrapper.style.paddingBottom = "52px";
      } else {
         wrapper.style.paddingBottom = "0px";
      }
   }
   
   // Update footer position based on whether contacts are selected and menu is closed
   if (footer) {
      if (selected.length > 0 && !isMenuOpen) {
         footer.style.transform = "translateY(-34px)";
      } else {
         footer.style.transform = "translateY(0)";
      }
   }
}

function setupAssignedEvents(elements) {
   elements.select.addEventListener("click", (event) => handleAssignedSelectClick(event, elements));
   elements.menu.addEventListener("click", (event) => handleAssignedOptionClick(event, elements));
   const searchInput = elements.select.querySelector(".add-task__select-input");
   if (searchInput) {
      searchInput.addEventListener("click", (event) => event.stopPropagation());
      searchInput.addEventListener("mousedown", (event) => event.stopPropagation());
      searchInput.addEventListener("focus", () => {
         const isOpen = elements.select.classList.contains("add-task__select--open");
         if (!isOpen) toggleAssignedMenu(elements);
      });
   }
   document.addEventListener("click", (event) => {
      if (event.target.closest(".add-task__select-input")) return;
      closeAssignedMenu(elements);
   });
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

function resetAssignedSelect(container) {
   const select = container.querySelector(".add-task__select--assigned");
   if (!select) return;
   const valueLabel = select.querySelector(".add-task__select-value");
   const input = container.querySelector("#addTaskAssignedInput");
   const initialsContainer = container.querySelector("#addTaskAssignedInitials");
   const menu = container.querySelector("#addTaskAssignedMenu");
   
   // Reset all selected options
   if (menu) {
      const selectedOptions = menu.querySelectorAll(".add-task__select-option--selected");
      selectedOptions.forEach((option) => {
         option.classList.remove("add-task__select-option--selected");
         const checkbox = option.querySelector(".add-task__option-checkbox");
         if (checkbox) {
            checkbox.src = "./assets/icons/desktop/checkBox.svg";
         }
      });
   }
   
   // Reset placeholder
   if (valueLabel) {
      valueLabel.textContent = "Select contacts to assign";
   }
   
   // Clear hidden input
   if (input) {
      input.value = "";
   }
   
   // Clear initials
   if (initialsContainer) {
      initialsContainer.innerHTML = "";
   }
   
   // Close menu
   select.classList.remove("add-task__select--open");
   select.setAttribute("aria-expanded", "false");
   
   // Reset footer position
   const footer = container.querySelector(".add-task__footer");
   if (footer) {
      footer.style.transform = "translateY(0)";
   }
   
   // Reset wrapper padding
   const wrapper = select.closest(".add-task__select-wrapper");
   if (wrapper) {
      wrapper.style.paddingBottom = "0px";
   }
}

function handleClearButtonClick(event, button) {
   event.preventDefault();
   const container = button.closest(".main_flex-instructions") || document;
   clearFormFields(container);
   clearSubtaskLists(container);
   resetCategorySelect(container);
   resetPriorityToMedium(container);
   resetValidationState(container);
   resetAssignedSelect(container);
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
