// ===== TEXTAREA RESIZE =====

function extractPixels(cssValue) {
   return Number.parseFloat(cssValue) || 0;
}

function limitValue(value, min, max) {
   return Math.min(Math.max(value, min), max);
}

function getTextareaLimits(textarea) {
   const styles = getComputedStyle(textarea);
   const minHeight = extractPixels(styles.minHeight) || 48;
   const maxHeight = extractPixels(styles.maxHeight) || 10000;
   return { minHeight, maxHeight };
}

function resizeTextarea(moveEvent, startMouseY, startHeight, textarea, minHeight, maxHeight) {
   const mouseDelta = moveEvent.clientY - startMouseY;
   const newHeight = startHeight + mouseDelta;
   textarea.style.height = `${limitValue(newHeight, minHeight, maxHeight)}px`;
}

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

function setupTextareaResizeHandle(wrapper) {
   const textarea = wrapper.querySelector("textarea");
   const handle = wrapper.querySelector(".add-task__textarea-resize");
   if (!textarea || !handle) return;
   handle.style.pointerEvents = "auto";
   handle.addEventListener("mousedown", (event) => startTextareaResize(event, textarea));
}

function initTextareaResize() {
   const wrappers = document.querySelectorAll(".add-task__input-field--textarea");
   wrappers.forEach(setupTextareaResizeHandle);
}

// ===== PRIORITY FIELD =====

function handlePriorityClick(event) {
   const clickedButton = event.target.closest(".add-task__priority-option");
   if (!clickedButton) return;
   const field = clickedButton.closest(".add-task__priority-field");
   const allButtons = field.querySelectorAll(".add-task__priority-option");
   allButtons.forEach(btn => btn.classList.remove("add-task__priority-option--active"));
   clickedButton.classList.add("add-task__priority-option--active");
}

function initPriorityField() {
   const priorityField = document.getElementById("addTaskPriority");
   if (priorityField) {
      priorityField.addEventListener("click", handlePriorityClick);
   }
}

// ===== CLEAR BUTTON =====

function clearFormFields(container) {
   container.querySelectorAll("input, textarea, select").forEach((field) => {
      if (field.type !== "checkbox" && field.type !== "radio") {
         field.value = "";
      }
   });
}

function resetValidationState(container) {
   container.querySelectorAll(".add-task__input-field--required").forEach((field) => {
      field.classList.remove("add-task__input-field--error");
   });
}

function resetPriorityToMedium(container) {
   const priorityField = container.querySelector(".add-task__priority-field");
   if (!priorityField) return;
   priorityField.querySelectorAll(".add-task__priority-option").forEach((btn) => {
      btn.classList.remove("add-task__priority-option--active");
   });
   const mediumButton = priorityField.querySelector(".add-task__priority-option--medium");
   if (mediumButton) mediumButton.classList.add("add-task__priority-option--active");
}

function clearSubtaskLists(container) {
   container.querySelectorAll(".add-task__subtask-list").forEach((list) => {
      list.innerHTML = "";
   });
}

function resetCategorySelect(container) {
   const select = container.querySelector(".add-task__select--category");
   if (!select) return;
   const valueLabel = select.querySelector(".add-task__select-value");
   const input = container.querySelector("#addTaskCategoryInput");
   if (valueLabel && input) {
      const placeholder = valueLabel.dataset.placeholder || "Select task category";
      valueLabel.textContent = placeholder;
      valueLabel.dataset.placeholder = placeholder;
      valueLabel.dataset.lastLabel = "";
      input.value = "";
      input.dataset.lastValue = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
   }
   select.classList.remove("add-task__select--open");
   select.setAttribute("aria-expanded", "false");
}

function resetAssignedSelect(container) {
   const select = container.querySelector(".add-task__select--assigned");
   if (!select) return;
   const menu = container.querySelector("#addTaskAssignedMenu");
   if (menu) {
      menu.querySelectorAll(".add-task__select-option--selected").forEach((option) => {
         option.classList.remove("add-task__select-option--selected");
         const checkbox = option.querySelector(".add-task__option-checkbox");
         if (checkbox) checkbox.src = "./assets/icons/desktop/checkBox.svg";
      });
   }
   const valueLabel = select.querySelector(".add-task__select-value");
   if (valueLabel) valueLabel.textContent = "Select contacts to assign";
   const input = container.querySelector("#addTaskAssignedInput");
   if (input) input.value = "";
   const initialsContainer = container.querySelector("#addTaskAssignedInitials");
   if (initialsContainer) initialsContainer.innerHTML = "";
   select.classList.remove("add-task__select--open");
   select.setAttribute("aria-expanded", "false");
   const footer = container.querySelector(".add-task__footer");
   if (footer) footer.style.transform = "translateY(0)";
   const wrapper = select.closest(".add-task__select-wrapper");
   if (wrapper) wrapper.style.paddingBottom = "0px";
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
   document.querySelectorAll(".add-task__button--cancel").forEach((button) => {
      button.addEventListener("click", (event) => handleClearButtonClick(event, button));
   });
}

// ===== SUBTASKS =====

function addSubtaskItem(list, value) {
   const item = document.createElement("li");
   item.className = "add-task__subtask-item";
   item.innerHTML = `
      <span class="add-task__subtask-text">${value}</span>
      <div class="add-task__subtask-item-actions">
         <button type="button" class="add-task__subtask-item-button add-task__subtask-item-button--edit" data-action="edit">
            <img src="./assets/icons/desktop/subtask__pencil.svg" alt="" />
         </button>
         <button type="button" class="add-task__subtask-item-button add-task__subtask-item-button--delete-edit" data-action="delete-edit" style="display: none;">
            <img src="./assets/icons/desktop/subtask__trash.svg" alt="" />
         </button>
         <span class="add-task__subtask-dividingline"></span>
         <button type="button" class="add-task__subtask-item-button add-task__subtask-item-button--delete" data-action="delete">
            <img src="./assets/icons/desktop/subtask__trash.svg" alt="" />
         </button>
         <button type="button" class="add-task__subtask-item-button add-task__subtask-item-button--check" data-action="check" style="display: none;">
            <img src="./assets/icons/desktop/check.svg" alt="" />
         </button>
      </div>
   `;
   
   const textSpan = item.querySelector(".add-task__subtask-text");
   const editBtn = item.querySelector("[data-action='edit']");
   const deleteBtn = item.querySelector("[data-action='delete']");
   const deleteEditBtn = item.querySelector("[data-action='delete-edit']");
   const checkBtn = item.querySelector("[data-action='check']");
   
   editBtn.addEventListener("click", () => enableEditMode(item, textSpan, checkBtn));
   deleteBtn.addEventListener("click", () => item.remove());
   deleteEditBtn.addEventListener("click", (e) => { e.stopPropagation(); item.remove(); });
   textSpan.addEventListener("dblclick", () => enableEditMode(item, textSpan, checkBtn));
   
   list.prepend(item);
}

function enableEditMode(item, textSpan, checkBtn) {
   const currentText = textSpan.textContent;
   item.classList.add("add-task__subtask-item--editing");
   
   const input = document.createElement("input");
   input.type = "text";
   input.className = "add-task__subtask-input";
   input.value = currentText;
   
   textSpan.replaceWith(input);
   input.focus();
   input.select();
   
   function saveEdit() {
      const newText = input.value.trim();
      if (newText) {
         const newSpan = document.createElement("span");
         newSpan.className = "add-task__subtask-text";
         newSpan.textContent = newText;
         input.replaceWith(newSpan);
         item.classList.remove("add-task__subtask-item--editing");
         reattachListeners(newSpan, item, checkBtn);
      }
   }
   
   const checkHandler = (e) => { e.stopPropagation(); saveEdit(); };
   checkBtn.addEventListener("click", checkHandler, { once: true });
   
   input.addEventListener("blur", () => setTimeout(() => {
      if (item.classList.contains("add-task__subtask-item--editing")) saveEdit();
   }, 100));
   
   input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") saveEdit();
      if (e.key === "Escape") {
         const newSpan = document.createElement("span");
         newSpan.className = "add-task__subtask-text";
         newSpan.textContent = currentText;
         input.replaceWith(newSpan);
         item.classList.remove("add-task__subtask-item--editing");
         reattachListeners(newSpan, item, checkBtn);
      }
   });
}

function reattachListeners(textSpan, item, checkBtn) {
   textSpan.addEventListener("dblclick", () => enableEditMode(item, textSpan, checkBtn));
   const editBtn = item.querySelector("[data-action='edit']");
   if (editBtn) editBtn.addEventListener("click", () => enableEditMode(item, textSpan, checkBtn));
}

function setupSubtaskGroup(group) {
   const input = group.querySelector(".add-task__input--subtasks");
   const list = group.querySelector(".add-task__subtask-list");
   const clearBtn = group.querySelector(".add-task__subtask-button[data-action='clear']");
   const addBtn = group.querySelector(".add-task__subtask-button[data-action='add']");
   
   if (!input || !list || !clearBtn || !addBtn) return;
   
   const addEvent = () => {
      if (input.value.trim()) {
         addSubtaskItem(list, input.value.trim());
         input.value = "";
      }
   };
   
   clearBtn.addEventListener("click", () => { input.value = ""; input.focus(); });
   addBtn.addEventListener("click", addEvent);
   input.addEventListener("keydown", (e) => { if (e.key === "Enter") addEvent(); });
}

function initSubtaskControls() {
   document.querySelectorAll(".add-task__input-group--subtasks").forEach(setupSubtaskGroup);
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
