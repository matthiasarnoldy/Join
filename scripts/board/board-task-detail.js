(function () {
   function getTaskDetailDialog() {
      return document.getElementById("taskDetailDialog");
   }

   function closeTaskDetailDialog() {
      const dialog = getTaskDetailDialog();
      if (!dialog) return;
      dialog.close();
      delete dialog.dataset.taskId;
   }

   function setTaskDetailLabel(category) {
      const label = document.getElementById("taskDetailCategory");
      if (!label) return;
      label.className = "task-detail__label";
      if (category === "technical") label.classList.add("task-detail__label--teal");
      label.textContent = window.BoardCards?.getCategoryLabel(category) || "No category";
   }

   function setTaskDetailText(id, value, fallback) {
      const element = document.getElementById(id);
      if (element) element.textContent = value || fallback;
   }

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

   function createTaskDetailEmptyItem(text) {
      const item = document.createElement("li");
      item.className = "task-detail__empty";
      item.textContent = text;
      return item;
   }

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

   function renderTaskDetail(taskData) {
      setTaskDetailLabel(taskData.category);
      setTaskDetailText("taskDetailTitle", taskData.title, "Untitled task");
      setTaskDetailText("taskDetailDescription", taskData.description, "No description");
      setTaskDetailText("taskDetailDate", taskData.date, "No due date");
      setTaskDetailPriority(taskData.priority);
      renderTaskDetailAssigned(taskData.assigned || []);
      renderTaskDetailSubtasks(taskData.subtasks || []);
   }

   function openTaskDetail(taskId) {
      const dialog = getTaskDetailDialog();
      if (!dialog) return;
      const taskData = window.BoardData?.getTask(taskId);
      if (!taskData) return;
      dialog.dataset.taskId = String(taskId);
      renderTaskDetail(taskData);
      dialog.showModal();
   }

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

   function getTaskWithToggledSubtask(task, subtaskIndex, isCompleted) {
      const subtasks = (task.subtasks || []).map((subtask, index) =>
         index === subtaskIndex ? { ...subtask, completed: isCompleted } : subtask,
      );
      return { ...task, subtasks };
   }

   async function reloadBoardAndKeepDetailOpen(taskId) {
      const tasks = await window.BoardData.loadTasks();
      window.BoardCards?.renderBoardFromTasks(tasks);
      window.BoardDnd?.initializeDraggableCards();
      openTaskDetail(taskId);
   }

   async function persistTaskDetailSubtaskToggle(taskId, updatedTask) {
      await window.BoardData.putTask(taskId, updatedTask);
      await reloadBoardAndKeepDetailOpen(taskId);
   }

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

   function getAssignedLookupMaps(assigned) {
      return {
         values: new Set(assigned.map((person) => person.value)),
         names: new Set(assigned.map((person) => person.name)),
      };
   }

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
               ? "./assets/icons/desktop/checkBox--checked.svg"
               : "./assets/icons/desktop/checkBox.svg";
         }
      });
   }

   function syncAssignedInputState(assignedCount) {
      const input = document.getElementById("addTaskAssignedInput");
      if (!input) return;
      input.value = assignedCount > 0 ? "assigned" : "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
   }

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

   function setAssignedInForm(assigned) {
      const assignedList = assigned || [];
      const maps = getAssignedLookupMaps(assignedList);
      syncAssignedOptions(maps);
      syncAssignedInputState(assignedList.length);
      refreshAssignedInitials();
   }

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

   function setFormFieldValueAndTrigger(id, value) {
      const field = document.getElementById(id);
      if (!field) return;
      field.value = value || "";
      field.dispatchEvent(new Event("input", { bubbles: true }));
   }

   function fillAddTaskFormForEdit(taskData) {
      setFormFieldValueAndTrigger("addTaskTitle", taskData.title);
      setFormFieldValueAndTrigger("addTaskDescription", taskData.description);
      setFormFieldValueAndTrigger("addTaskDate", taskData.date);
      setPriorityInForm(taskData.priority || "medium");
      setCategoryInForm(taskData.category || "");
      setAssignedInForm(taskData.assigned || []);
      setSubtasksInForm(taskData.subtasks || []);
   }

   function clearAddTaskDialogForm(dialog) {
      if (typeof handleClearClick !== "function") return;
      const clearButton = dialog.querySelector(".add-task__button--cancel");
      if (!clearButton) return;
      handleClearClick({ preventDefault: () => {} }, clearButton);
   }

   function prepareEditTaskDialogData(dialog, taskId, taskData, taskKey = "") {
      dialog.dataset.taskStatus = taskData.status || "todo";
      dialog.dataset.editTaskId = String(taskId);
      if (taskKey) dialog.dataset.editTaskKey = taskKey;
   }

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

   async function handleTaskDetailDeleteClick(dialog) {
      const taskId = dialog?.dataset.taskId;
      if (!taskId) return;
      await handleDeleteTask(taskId);
   }

   async function handleTaskDetailEditClick(dialog) {
      const taskId = dialog?.dataset.taskId;
      if (!taskId) return;
      await openEditTaskDialog(taskId);
   }

   function bindTaskDetailButton(id, eventName, handler) {
      const element = document.getElementById(id);
      if (element) element.addEventListener(eventName, handler);
   }

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
