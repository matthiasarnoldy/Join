// ===== SUBTASK MANAGEMENT =====

function addSubtaskItem(list, value) {
   const item = document.createElement("li");
   item.className = "add-task__subtask-item";
   
   const textSpan = document.createElement("span");
   textSpan.className = "add-task__subtask-text";
   textSpan.textContent = value;
   textSpan.addEventListener("dblclick", () => enableEditMode(item, textSpan, checkButton));
   
   const actionContainer = document.createElement("div");
   actionContainer.className = "add-task__subtask-actions";
   
   const editButton = document.createElement("button");
   editButton.className = "add-task__subtask-button add-task__subtask-button--edit";
   editButton.innerHTML = '<svg width="24" height="24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/></svg>';
   editButton.addEventListener("click", () => enableEditMode(item, textSpan, checkButton));
   
   const checkButton = document.createElement("button");
   checkButton.className = "add-task__subtask-button add-task__subtask-button--check";
   checkButton.innerHTML = '<svg width="24" height="24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>';
   
   const deleteButton = document.createElement("button");
   deleteButton.className = "add-task__subtask-button add-task__subtask-button--delete";
   deleteButton.innerHTML = '<svg width="24" height="24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z"/></svg>';
   deleteButton.addEventListener("click", () => item.remove());
   
   actionContainer.appendChild(editButton);
   actionContainer.appendChild(checkButton);
   actionContainer.appendChild(deleteButton);
   
   item.appendChild(textSpan);
   item.appendChild(actionContainer);
   list.insertBefore(item, list.firstChild);
   list.scrollTop = 0;
}

function enableEditMode(item, textSpan, checkButton) {
   const currentValue = textSpan.textContent;
   textSpan.style.display = "none";
   
   const input = document.createElement("input");
   input.type = "text";
   input.className = "add-task__subtask-input";
   input.value = currentValue;
   
   function saveEdit() {
      const newValue = input.value.trim();
      if (newValue) {
         textSpan.textContent = newValue;
      }
      textSpan.style.display = "block";
      input.remove();
      reattachListeners(textSpan, item, checkButton);
   }
   
   input.addEventListener("blur", saveEdit);
   input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") saveEdit();
      if (e.key === "Escape") {
         textSpan.style.display = "block";
         input.remove();
      }
   });
   
   checkButton.addEventListener("click", saveEdit, { once: true });
   
   item.insertBefore(input, textSpan.nextSibling);
   input.focus();
}

function reattachListeners(textSpan, item, checkButton) {
   textSpan.removeEventListener("dblclick", enableEditMode);
   textSpan.addEventListener("dblclick", () => enableEditMode(item, textSpan, checkButton));
}

function clearSubtaskLists(container) {
   const lists = container.querySelectorAll(".add-task__subtask-list");
   lists.forEach((list) => {
      list.innerHTML = "";
   });
}

function initSubtaskControls() {
   const addButtons = document.querySelectorAll(".add-task__subtask-add");
   const inputs = document.querySelectorAll(".add-task__subtask-input-field");
   
   inputs.forEach((input, index) => {
      const addButton = addButtons[index];
      if (!addButton) return;
      
      const list = input.closest(".add-task__input-group")?.nextElementSibling;
      if (!list || !list.classList.contains("add-task__subtask-list")) return;
      
      const addEvent = () => {
         const value = input.value.trim();
         if (value) {
            addSubtaskItem(list, value);
            input.value = "";
         }
      };
      
      addButton.addEventListener("click", addEvent);
      input.addEventListener("keydown", (e) => {
         if (e.key === "Enter") addEvent();
      });
   });
}
