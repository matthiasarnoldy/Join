(function () {
   const BOARD_DETAIL_ASSET_BASE_PATH = window.location.pathname.includes("/templates/")
      ? "../assets/"
      : "./assets/";

   /**
    * Returns the board detail asset path.
    *
    * @param {string} relativePath - The relative path.
    * @returns {string} The board detail asset path.
    */
   function boardDetailAssetPath(relativePath) {
      return `${BOARD_DETAIL_ASSET_BASE_PATH}${relativePath}`;
   }

   /**
    * Returns the task detail dialog.
    * @returns {HTMLDialogElement|null} The task detail dialog element, or null when it is not available.
    */
   function getTaskDetailDialog() {
      return document.getElementById("taskDetailDialog");
   }

   /**
    * Closes the task detail dialog.
    * @returns {void} Nothing.
    */
   function closeTaskDetailDialog() {
      const dialog = getTaskDetailDialog();
      if (!dialog) return;
      dialog.close();
      delete dialog.dataset.taskId;
      window.updateBoardDialogScrollLock?.();
   }

   /**
    * Sets the task detail label.
    *
    * @param {string} category - The category.
    * @returns {void} Nothing.
    */
   function setTaskDetailLabel(category) {
      const label = document.getElementById("taskDetailCategory");
      if (!label) return;
      label.className = "task-detail__label";
      if (category === "technical") label.classList.add("task-detail__label--teal");
      label.textContent = window.BoardCards?.getCategoryLabel(category) || "No category";
   }

   /**
    * Sets the task detail text.
    *
    * @param {string} id - The element ID.
    * @param {string} value - The value.
    * @param {string} fallback - The fallback.
    * @returns {void} Nothing.
    */
   function setTaskDetailText(id, value, fallback) {
      const element = document.getElementById(id);
      if (element) element.textContent = value || fallback;
   }

   /**
    * Sets the task detail priority.
    *
    * @param {string} priority - The priority.
    * @returns {void} Nothing.
    */
   function setTaskDetailPriority(priority) {
      const text = document.getElementById("taskDetailPriorityText");
      const icon = document.getElementById("taskDetailPriorityIcon");
      const label = window.BoardCards?.getPriorityLabel(priority) || "Medium";
      if (text) text.textContent = label;
      if (icon) {
         icon.src = window.BoardCards?.getPriorityIcon(priority) || "";
         icon.alt = label;
      }
   }

   /**
    * Creates the task detail empty item.
    *
    * @param {string} text - The text.
    * @returns {HTMLLIElement} The task detail empty item element.
    */
   function createTaskDetailEmptyItem(text) {
      const item = document.createElement("li");
      item.className = "task-detail__empty";
      item.textContent = text;
      return item;
   }

   /**
    * Renders the task detail assigned.
    *
    * @param {Array<object>} assignees - The assignees list.
    * @returns {void} Nothing.
    */
   function renderTaskDetailAssigned(assignees) {
      const list = document.getElementById("taskDetailAssignedList");
      if (!list) return;
      const colors = ["orange", "teal", "purple"];
      list.innerHTML = "";
      if (!assignees.length) {
         list.appendChild(createTaskDetailEmptyItem("No assignees"));
         return;
      }
      assignees.forEach((assignee, index) => {
         const item = document.createElement("li");
         item.className = "task-detail__assigned-item";
         item.innerHTML = `<span class="avatar avatar--${colors[index % colors.length]}">${assignee.initials || "?"}</span><span class="task-detail__assigned-name">${assignee.name || "Unnamed"}</span>`;
         list.appendChild(item);
      });
   }

   /**
    * Renders the task detail subtasks.
    *
    * @param {Array<object>} subtasks - The subtasks list.
    * @returns {void} Nothing.
    */
   function renderTaskDetailSubtasks(subtasks) {
      const list = document.getElementById("taskDetailSubtasksList");
      if (!list) return;
      list.innerHTML = "";
      if (!subtasks.length) {
         list.appendChild(createTaskDetailEmptyItem("No subtasks"));
         return;
      }
      subtasks.forEach((subtask, index) => {
         const item = document.createElement("li");
         const checked = Boolean(subtask.completed);
         item.className = "task-detail__subtask-item";
         item.innerHTML = `<input type="checkbox" class="task-detail__subtask-checkbox" ${checked ? "checked" : ""} data-subtask-index="${index}"><span class="task-detail__subtask-text${checked ? " task-detail__subtask-text--done" : ""}">${subtask.text || `Subtask ${index + 1}`}</span>`;
         list.appendChild(item);
      });
   }

   /**
    * Renders the task detail.
    *
    * @param {object} taskData - The task data object.
    * @returns {void} Nothing.
    */
   function renderTaskDetail(taskData) {
      setTaskDetailLabel(taskData.category);
      setTaskDetailText("taskDetailTitle", taskData.title, "Untitled task");
      setTaskDetailText("taskDetailDescription", taskData.description, "No description");
      setTaskDetailText("taskDetailDate", taskData.date, "No due date");
      setTaskDetailPriority(taskData.priority);
      renderTaskDetailAssigned(taskData.assigned || []);
      renderTaskDetailSubtasks(taskData.subtasks || []);
   }

   /**
    * Opens the task detail.
    *
    * @param {string|number} taskId - The task ID used for this operation.
    * @returns {void} Nothing.
    */
   function openTaskDetail(taskId) {
      const dialog = getTaskDetailDialog();
      if (!dialog) return;
      const taskData = window.BoardData?.getTask(taskId);
      if (!taskData) return;
      dialog.dataset.taskId = String(taskId);
      renderTaskDetail(taskData);
      dialog.showModal();
      window.updateBoardDialogScrollLock?.();
   }

   /**
    * Returns the task detail subtask toggle payload.
    *
    * @param {Event} event - The event object that triggered the handler.
    * @returns {object|null} The task detail subtask toggle payload object, or null when it is not available.
    */
   function getTaskDetailSubtaskTogglePayload(event) {
      const checkbox = event.target.closest(".task-detail__subtask-checkbox");
      const taskId = getTaskDetailDialog()?.dataset.taskId;
      const subtaskIndex = Number.parseInt(checkbox?.dataset.subtaskIndex || "", 10);
      const currentTask = window.BoardData?.getTask(taskId);
      if (!checkbox || !taskId || Number.isNaN(subtaskIndex) || !currentTask?.subtasks?.[subtaskIndex]) {
         return null;
      }
      return { checkbox, taskId, subtaskIndex, currentTask };
   }

   /**
    * Returns the task with toggled subtask.
    *
    * @param {object} task - The task object.
    * @param {number} subtaskIndex - The subtask index.
    * @param {boolean} isCompleted - Whether it is completed.
    * @returns {object} The task with toggled subtask object.
    */
   function getTaskWithToggledSubtask(task, subtaskIndex, isCompleted) {
      const subtasks = (task.subtasks || []).map((subtask, index) =>
         index === subtaskIndex ? { ...subtask, completed: isCompleted } : subtask,
      );
      return { ...task, subtasks };
   }

   /**
    * Reloads the board and keep detail open.
    *
    * @param {string|number} taskId - The task ID used for this operation.
    * @returns {Promise<void>} A promise that resolves when the operation is complete.
    */
   async function reloadBoardAndKeepDetailOpen(taskId) {
      const tasks = await window.BoardData.loadTasks();
      window.BoardCards?.renderBoardFromTasks(tasks);
      window.BoardDnd?.initializeDraggableCards();
      openTaskDetail(taskId);
   }

   /**
    * Persists the task detail subtask toggle.
    *
    * @param {string|number} taskId - The task ID used for this operation.
    * @param {object} updatedTask - The updated task object.
    * @returns {Promise<void>} A promise that resolves when the operation is complete.
    */
   async function persistTaskDetailSubtaskToggle(taskId, updatedTask) {
      await window.BoardData.putTask(taskId, updatedTask);
      await reloadBoardAndKeepDetailOpen(taskId);
   }

   /**
    * Handles the task detail subtask toggle.
    *
    * @param {Event} event - The event object that triggered the handler.
    * @returns {Promise<void>} A promise that resolves when the operation is complete.
    */
   async function handleTaskDetailSubtaskToggle(event) {
      const payload = getTaskDetailSubtaskTogglePayload(event);
      if (!payload) return;
      const { checkbox, taskId, subtaskIndex, currentTask } = payload;
      const updatedTask = getTaskWithToggledSubtask(
         currentTask,
         subtaskIndex,
         checkbox.checked,
      );
      try {
         await persistTaskDetailSubtaskToggle(taskId, updatedTask);
      } catch (error) {
         checkbox.checked = !checkbox.checked;
         console.error("Subtask update failed:", error);
      }
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
               ? boardDetailAssetPath("icons/desktop/checkBox--checked.svg")
               : boardDetailAssetPath("icons/desktop/checkBox.svg");
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
      closeTaskDetailDialog();
      dialog.showModal();
   }

   /**
    * Handles deleting the task.
    *
    * @param {string|number} taskId - The task ID used for this operation.
    * @returns {Promise<void>} A promise that resolves when the operation is complete.
    */
   async function handleDeleteTask(taskId) {
      const shouldDelete = window.confirm("Delete this task?");
      if (!shouldDelete) return;
      try {
         await window.BoardData.deleteTask(taskId);
         closeTaskDetailDialog();
         const tasks = await window.BoardData.loadTasks();
         window.BoardCards?.renderBoardFromTasks(tasks);
      } catch (error) {
         console.error("Task delete failed:", error);
      }
   }

   /**
    * Handles the task detail delete click.
    *
    * @param {HTMLDialogElement|null} dialog - The dialog.
    * @returns {Promise<void>} A promise that resolves when the operation is complete.
    */
   async function handleTaskDetailDeleteClick(dialog) {
      const taskId = dialog?.dataset.taskId;
      if (!taskId) return;
      await handleDeleteTask(taskId);
   }

   /**
    * Handles the task detail edit click.
    *
    * @param {HTMLDialogElement|null} dialog - The dialog.
    * @returns {Promise<void>} A promise that resolves when the operation is complete.
    */
   async function handleTaskDetailEditClick(dialog) {
      const taskId = dialog?.dataset.taskId;
      if (!taskId) return;
      await openEditTaskDialog(taskId);
   }

   /**
    * Binds the task detail button.
    *
    * @param {string} id - The element ID.
    * @param {string} eventName - The event object that triggered the handler.
    * @param {*} handler - The handler.
    * @returns {void} Nothing.
    */
   function bindTaskDetailButton(id, eventName, handler) {
      const element = document.getElementById(id);
      if (element) element.addEventListener(eventName, handler);
   }

   /**
    * Sets up the task detail interactions.
    * @returns {void} Nothing.
    */
   function setupTaskDetailInteractions() {
      const dialog = getTaskDetailDialog();
      if (!dialog || dialog.dataset.initialized === "true") return;
      dialog.dataset.initialized = "true";
      const subtasksList = document.getElementById("taskDetailSubtasksList");
      bindTaskDetailButton("taskDetailClose", "click", closeTaskDetailDialog);
      if (subtasksList) {
         subtasksList.addEventListener("change", handleTaskDetailSubtaskToggle);
      }
      bindTaskDetailButton("taskDetailDelete", "click", () =>
         handleTaskDetailDeleteClick(dialog),
      );
      bindTaskDetailButton("taskDetailEdit", "click", () =>
         handleTaskDetailEditClick(dialog),
      );
   }

   window.BoardTaskDetail = {
      closeTaskDetailDialog,
      openTaskDetail,
      setupTaskDetailInteractions,
   };
})();
