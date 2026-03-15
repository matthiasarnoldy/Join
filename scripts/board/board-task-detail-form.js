(function () {
   const BOARD_DETAIL_FORM_ASSET_BASE_PATH = window.location.pathname.includes("/templates/")
      ? "../assets/"
      : "./assets/";

   /**
    * Returns the board detail form asset path.
    *
    * @param {string} relativePath - The relative path.
    * @returns {string} The board detail form asset path.
    */
   function boardDetailFormAssetPath(relativePath) {
      return `${BOARD_DETAIL_FORM_ASSET_BASE_PATH}${relativePath}`;
   }

   /**
    * Sets the priority in form.
    *
    * @param {string} priority - The priority.
    * @returns {void} Nothing.
    */
   function setPriorityInForm(priority) {
      const priorityField = document.getElementById("addTaskPriority");
      if (!priorityField) return;
      const buttons = priorityField.querySelectorAll(".add-task__priority-option");
      buttons.forEach((button) =>
         button.classList.remove("add-task__priority-option--active"),
      );
      const target = priorityField.querySelector(
         `.add-task__priority-option--${priority || "medium"}`,
      );
      if (target) target.classList.add("add-task__priority-option--active");
   }

   /**
    * Sets the category in form.
    *
    * @param {string} category - The category.
    * @returns {void} Nothing.
    */
   function setCategoryInForm(category) {
      const input = document.getElementById("addTaskCategoryInput");
      const select = document.getElementById("addTaskCategory");
      if (!input || !select) return;
      const label = select.querySelector(".add-task__select-value");
      const option = document.querySelector(
         `#addTaskCategoryMenu .add-task__select-option[data-value="${category}"]`,
      );
      input.value = category || "";
      if (label) {
         label.textContent = option ? option.textContent.trim() : "Select task category";
         label.dataset.lastLabel = label.textContent;
      }
      input.dataset.lastValue = input.value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
   }

   /**
    * Returns the assigned lookup maps.
    *
    * @param {Array<object>} assigned - The assigned list.
    * @returns {object} The assigned lookup maps object.
    */
   function getAssignedLookupMaps(assigned) {
      return {
         values: new Set(assigned.map((person) => person.value)),
         names: new Set(assigned.map((person) => person.name)),
      };
   }

   /**
    * Synchronizes the assigned options.
    *
    * @param {object} maps - The maps object.
    * @returns {void} Nothing.
    */
   function syncAssignedOptions(maps) {
      const options = document.querySelectorAll(
         "#addTaskAssignedMenu .add-task__select-option--assigned",
      );
      options.forEach((option) => {
         const isSelected =
            maps.values.has(option.dataset.value || "") ||
            maps.names.has(option.dataset.name || option.textContent.trim());
         const checkbox = option.querySelector(".add-task__option-checkbox");
         option.classList.toggle(ASSIGNED_SELECTED_CLASS, isSelected);
         if (checkbox) {
            checkbox.src = isSelected
               ? boardDetailFormAssetPath("icons/desktop/checkBox--checked.svg")
               : boardDetailFormAssetPath("icons/desktop/checkBox.svg");
         }
      });
   }

   /**
    * Synchronizes the assigned input state.
    *
    * @param {number} assignedCount - The assigned count.
    * @returns {void} Nothing.
    */
   function syncAssignedInputState(assignedCount) {
      const input = document.getElementById("addTaskAssignedInput");
      if (!input) return;
      input.value = assignedCount > 0 ? "assigned" : "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
   }

   /**
    * Refreshes the assigned initials.
    * @returns {void} Nothing.
    */
   function refreshAssignedInitials() {
      if (
         typeof getAssignedElements !== "function" ||
         typeof updateContactInitials !== "function"
      ) {
         return;
      }
      const elements = getAssignedElements();
      if (elements) updateContactInitials(elements);
   }

   /**
    * Sets the assigned in form.
    *
    * @param {Array<object>} assigned - The assigned list.
    * @returns {void} Nothing.
    */
   function setAssignedInForm(assigned) {
      const assignedList = assigned || [];
      const maps = getAssignedLookupMaps(assignedList);
      syncAssignedOptions(maps);
      syncAssignedInputState(assignedList.length);
      refreshAssignedInitials();
   }

   /**
    * Sets the subtasks in form.
    *
    * @param {Array<object>} subtasks - The subtasks list.
    * @returns {void} Nothing.
    */
   function setSubtasksInForm(subtasks) {
      const list = document.querySelector(".add-task__subtask-list");
      if (!list) return;
      list.innerHTML = "";
      (subtasks || []).forEach((subtask) => {
         if (typeof createSubtaskItem === "function") {
            const item = createSubtaskItem(subtask.text || "");
            item.dataset.completed = subtask.completed ? "true" : "false";
            list.prepend(item);
            if (typeof setupSubtaskListeners === "function") {
               setupSubtaskListeners(item);
            }
         }
      });
   }

   /**
    * Sets the form field value and trigger.
    *
    * @param {string} id - The element ID.
    * @param {string} value - The value.
    * @returns {void} Nothing.
    */
   function setFormFieldValueAndTrigger(id, value) {
      const field = document.getElementById(id);
      if (!field) return;
      field.value = value || "";
      field.dispatchEvent(new Event("input", { bubbles: true }));
   }

   /**
    * Fills the add task form for edit.
    *
    * @param {object} taskData - The task data object.
    * @returns {void} Nothing.
    */
   function fillAddTaskFormForEdit(taskData) {
      setFormFieldValueAndTrigger("addTaskTitle", taskData.title);
      setFormFieldValueAndTrigger("addTaskDescription", taskData.description);
      setFormFieldValueAndTrigger("addTaskDate", taskData.date);
      setPriorityInForm(taskData.priority || "medium");
      setCategoryInForm(taskData.category || "");
      setAssignedInForm(taskData.assigned || []);
      setSubtasksInForm(taskData.subtasks || []);
   }

   /**
    * Clears the add task dialog form.
    *
    * @param {HTMLDialogElement|null} dialog - The dialog.
    * @returns {void} Nothing.
    */
   function clearAddTaskDialogForm(dialog) {
      if (typeof handleClearClick !== "function") return;
      const clearButton = dialog.querySelector(".add-task__button--cancel");
      if (!clearButton) return;
      handleClearClick({ preventDefault: () => {} }, clearButton);
   }

   /**
    * Prepares the edit task dialog data.
    *
    * @param {HTMLDialogElement|null} dialog - The dialog.
    * @param {string|number} taskId - The task ID used for this operation.
    * @param {object} taskData - The task data object.
    * @param {string} [taskKey=""] - The task key. Defaults to "".
    * @returns {void} Nothing.
    */
   function prepareEditTaskDialogData(dialog, taskId, taskData, taskKey = "") {
      dialog.dataset.taskStatus = taskData.status || "todo";
      dialog.dataset.editTaskId = String(taskId);
      if (taskKey) dialog.dataset.editTaskKey = taskKey;
   }

   /**
    * Opens the edit task dialog.
    *
    * @param {string|number} taskId - The task ID used for this operation.
    * @returns {Promise<void>} A promise that resolves when the operation is complete.
    */
   async function openEditTaskDialog(taskId) {
      const dialog = window.getAddTaskDialog?.();
      const taskData = window.BoardData?.getTask(taskId);
      if (!dialog || !taskData) return;
      const taskKey = await window.BoardData.getTaskKey(taskId);
      clearAddTaskDialogForm(dialog);
      prepareEditTaskDialogData(dialog, taskId, taskData, taskKey || "");
      window.setAddTaskDialogMode?.(true);
      fillAddTaskFormForEdit(taskData);
      window.BoardTaskDetail?.closeTaskDetailDialog();
      dialog.showModal();
      window.updateBoardDialogScrollLock?.();
      requestAnimationFrame(() => refreshAssignedInitials());
   }

   window.BoardTaskDetailForm = {
      openEditTaskDialog,
      fillAddTaskFormForEdit,
      clearAddTaskDialogForm,
   };
})();
