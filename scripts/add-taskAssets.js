// ===== TEXTAREA RESIZE =====

function initTextareaResize() {
   const wrappers = document.querySelectorAll(".add-task__input-field--textarea");
   wrappers.forEach(setupTextareaResize);
}

function setupTextareaResize(wrapper) {
   const textarea = wrapper.querySelector("textarea");
   const handle = wrapper.querySelector(".add-task__textarea-resize");
   if (!textarea || !handle) return;
   handle.style.pointerEvents = "auto";
   handle.addEventListener("mousedown", (event) => {
      startTextareaResize(event, textarea);
   });
}

function startTextareaResize(event, textarea) {
   event.preventDefault();
   const { minHeight, maxHeight } = getTextareaHeight(textarea);
   const startY = event.clientY;
   const startHeight = textarea.offsetHeight;
   const moveHandler = (e) => {
      handleMouseMove(e, startY, startHeight, textarea, minHeight, maxHeight);
   };
   const upHandler = () => {
      removeResizeListeners(moveHandler, upHandler);
   };
   document.addEventListener("mousemove", moveHandler);
   document.addEventListener("mouseup", upHandler);
}

function getTextareaHeight(textarea) {
   const styles = getComputedStyle(textarea);
   const minHeight = getPixelValue(styles.minHeight) || 48;
   const maxHeight = getPixelValue(styles.maxHeight) || 1000;
   return { minHeight, maxHeight };
}

function getPixelValue(cssValue) {
   return Number.parseFloat(cssValue) || 0;
}

function handleMouseMove(event, startY, startHeight, textarea, minHeight, maxHeight) {
   const deltaY = event.clientY - startY;
   const newHeight = startHeight + deltaY;
   updateTextareaHeight(textarea, newHeight, minHeight, maxHeight);
}

function updateTextareaHeight(textarea, newHeight, minHeight, maxHeight) {
   const clampedHeight = clampValue(newHeight, minHeight, maxHeight);
   textarea.style.height = `${clampedHeight}px`;
}

function clampValue(value, min, max) {
   if (value < min) return min;
   if (value > max) return max;
   return value;
}

function removeResizeListeners(moveHandler, upHandler) {
   document.removeEventListener("mousemove", moveHandler);
   document.removeEventListener("mouseup", upHandler);
}

// ===== PRIORITY FIELD =====

function initPriorityField() {
   const priorityField = document.getElementById("addTaskPriority");
   if (!priorityField) return;
   priorityField.addEventListener("click", handlePriorityClick);
}

function handlePriorityClick(clickEvent) {
   const clickedButton = clickEvent.target.closest(".add-task__priority-option");
   if (!clickedButton) return;
   const field = clickedButton.closest(".add-task__priority-field");
   const priorityButtons = field.querySelectorAll(".add-task__priority-option");
   removeActiveFromAll(priorityButtons);
   setButtonActive(clickedButton);
}

function removeActiveFromAll(priorityButtons) {
   priorityButtons.forEach(button => {
      button.classList.remove("add-task__priority-option--active");
   });
}

function setButtonActive(button) {
   button.classList.add("add-task__priority-option--active");
}

// ===== SUBTASKS =====

function initSubtaskControls() {
   const groups = document.querySelectorAll(".add-task__input-group--subtasks");
   groups.forEach(setupSubtaskButtons);
}

function setupSubtaskButtons(group) {
   const input = group.querySelector(".add-task__input--subtasks");
   const list = group.querySelector(".add-task__subtask-list");
   const clearButton = group.querySelector(".add-task__subtask-button[data-action='clear']");
   const addButton = group.querySelector(".add-task__subtask-button[data-action='add']");
   if (!input || !list || !clearButton || !addButton) return;
   clearButton.addEventListener("click", () => {
      clearSubtaskInput(input);
   });
   addButton.addEventListener("click", () => {
      addSubtaskFromInput(input, list);
   });
}

function clearSubtaskInput(input) {
   input.value = "";
   input.focus();
}

function addSubtaskFromInput(input, list) {
   const inputValue = input.value.trim();
   if (!inputValue) return;
   addSubtaskToList(list, inputValue);
   clearSubtaskInput(input);
}

function createEditInput(currentText) {
   const input = document.createElement("input");
   input.type = "text";
   input.className = "add-task__subtask-input";
   input.value = currentText;
   return input;
}

function createTextElement(text) {
   const span = document.createElement("span");
   span.className = "add-task__subtask-text";
   span.textContent = text;
   return span;
}

function replaceInputWithText(inputElement, textElement) {
   inputElement.replaceWith(textElement);
}

function reattachEditListeners(item, textElement, checkButton) {
   setupSubtaskDoubleClick(item, textElement, checkButton);
   const editButton = item.querySelector(".add-task__subtask-item-button[data-action='edit']");
   const newEditButton = editButton.cloneNode(true);
   editButton.replaceWith(newEditButton);
   setupSubtaskEditButton(item, newEditButton, textElement, checkButton);
}

function saveSubtaskEdit(item, inputElement, checkButton) {
   const newText = inputElement.value.trim();
   if (newText) {
      const newTextElement = createTextElement(newText);
      replaceInputWithText(inputElement, newTextElement);
      item.classList.remove("add-task__subtask-item--editing");
      reattachEditListeners(item, newTextElement, checkButton);
   } else {
      inputElement.focus();
   }
}

function cancelSubtaskEdit(item, inputElement, originalText, checkButton) {
   const newTextElement = createTextElement(originalText);
   replaceInputWithText(inputElement, newTextElement);
   item.classList.remove("add-task__subtask-item--editing");
   reattachEditListeners(item, newTextElement, checkButton);
}

function setupEditKeyboardEvents(item, inputElement, originalText, checkButton) {
   inputElement.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
         saveSubtaskEdit(item, inputElement, checkButton);
      } else if (e.key === "Escape") {
         cancelSubtaskEdit(item, inputElement, originalText, checkButton);
      }
   });
}

function setupEditBlurEvent(item, inputElement, checkButton) {
   inputElement.addEventListener("blur", () => {
      setTimeout(() => {
         if (item.classList.contains("add-task__subtask-item--editing")) {
            saveSubtaskEdit(item, inputElement, checkButton);
         }
      }, 100);
   });
}

function addSubtaskToList(list, subtaskText) {
   const item = createSubtaskItem(subtaskText);
   setupSubtaskListeners(item);
   list.prepend(item);
}

function createSubtaskItem(subtaskText) {
   const item = document.createElement("li");
   item.className = "add-task__subtask-item";
   item.innerHTML = createSubtaskHTML(subtaskText);
   return item;
}

function setupSubtaskListeners(item) {
   const textElement = item.querySelector(".add-task__subtask-text");
   const deleteButton = item.querySelector(".add-task__subtask-item-button[data-action='delete']");
   const deleteEditButton = item.querySelector(".add-task__subtask-item-button[data-action='delete-edit']");
   const checkButton = item.querySelector(".add-task__subtask-item-button[data-action='check']");
   const editButton = item.querySelector(".add-task__subtask-item-button[data-action='edit']");
   setupSubtaskDeleteButton(item, deleteButton);
   setupSubtaskDeleteButton(item, deleteEditButton);
   setupSubtaskEditButton(item, editButton, textElement, checkButton);
   setupSubtaskDoubleClick(item, textElement, checkButton);
}

function setupSubtaskDeleteButton(item, button) {
   button.addEventListener("click", () => {
      deleteSubtaskItem(item);
   });
}

function setupSubtaskEditButton(item, button, textElement, checkButton) {
   button.addEventListener("click", () => {
      enableSubtaskEdit(item, textElement, checkButton);
   });
}


function setupSubtaskDoubleClick(item, textElement, checkButton) {
   textElement.addEventListener("dblclick", () => {
      enableSubtaskEdit(item, textElement, checkButton);
   });
}

function deleteSubtaskItem(item) {
   item.remove();
}

function enableSubtaskEdit(item, textElement, checkButton) {
   const originalText = textElement.textContent;
   item.classList.add("add-task__subtask-item--editing");
   const inputElement = createEditInput(originalText);
   replaceTextWithInput(textElement, inputElement);
   setupCheckButtonListener(checkButton, item, inputElement);
   setupEditBlurEvent(item, inputElement, checkButton);
   setupEditKeyboardEvents(item, inputElement, originalText, checkButton);
}

function replaceTextWithInput(textElement, inputElement) {
   textElement.replaceWith(inputElement);
   inputElement.focus();
   inputElement.select();
}

function setupCheckButtonListener(checkButton, item, inputElement) {
   const checkHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      saveSubtaskEdit(item, inputElement, checkButton);
   };
   checkButton.addEventListener("click", checkHandler);
}
