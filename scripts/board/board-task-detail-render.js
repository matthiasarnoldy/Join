"use strict";

{
   const TASK_DETAIL_AVATAR_COLORS = ["orange", "teal", "purple"];

   /**
    * Sets the task detail label.
    *
    * @param {string} category - The task category.
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
    * Sets text on one task detail element.
    *
    * @param {string} id - The element ID.
    * @param {string} value - The text value.
    * @param {string} fallback - The fallback text.
    * @returns {void} Nothing.
    */
   function setTaskDetailText(id, value, fallback) {
      const element = document.getElementById(id);
      if (element) element.textContent = value || fallback;
   }

   /**
    * Sets the task detail priority.
    *
    * @param {string} priority - The task priority.
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
    * Creates one task detail list item from HTML.
    *
    * @param {string} className - The item class name.
    * @param {string} html - The item HTML.
    * @returns {HTMLLIElement} The task detail list item.
    */
   function createTaskDetailListItem(className, html) {
      const item = document.createElement("li");
      item.className = className;
      item.innerHTML = html;
      return item;
   }

   /**
    * Creates the task detail empty item.
    *
    * @param {string} text - The empty text.
    * @returns {HTMLLIElement} The task detail empty item.
    */
   function createTaskDetailEmptyItem(text) {
      const html = typeof taskDetailEmptyItemHTML === "function" ? taskDetailEmptyItemHTML(text) : text;
      return createTaskDetailListItem("task-detail__empty", html);
   }

   /**
    * Returns one task detail avatar color class.
    *
    * @param {number} index - The assignee index.
    * @returns {string} The avatar color class.
    */
   function getTaskDetailAvatarColor(index) {
      return TASK_DETAIL_AVATAR_COLORS[index % TASK_DETAIL_AVATAR_COLORS.length];
   }

   /**
    * Creates one assigned list item.
    *
    * @param {object} assignee - The assignee object.
    * @param {number} index - The assignee index.
    * @returns {HTMLLIElement} The assigned list item.
    */
   function createTaskDetailAssignedItem(assignee, index) {
      const html = typeof taskDetailAssignedItemHTML === "function"
         ? taskDetailAssignedItemHTML(getTaskDetailAvatarColor(index), assignee.initials || "?", assignee.name || "Unnamed")
         : "";
      return createTaskDetailListItem("task-detail__assigned-item", html);
   }

   /**
    * Returns the task detail subtask text.
    *
    * @param {object} subtask - The subtask object.
    * @param {number} index - The subtask index.
    * @returns {string} The task detail subtask text.
    */
   function getTaskDetailSubtaskText(subtask, index) {
      return subtask.text || `Subtask ${index + 1}`;
   }

   /**
    * Creates one subtask list item.
    *
    * @param {object} subtask - The subtask object.
    * @param {number} index - The subtask index.
    * @returns {HTMLLIElement} The subtask list item.
    */
   function createTaskDetailSubtaskItem(subtask, index) {
      const html = typeof taskDetailSubtaskItemHTML === "function"
         ? taskDetailSubtaskItemHTML(index, Boolean(subtask.completed), getTaskDetailSubtaskText(subtask, index))
         : "";
      return createTaskDetailListItem("task-detail__subtask-item", html);
   }

   /**
    * Renders one task detail list.
    *
    * @param {string} listId - The list element ID.
    * @param {Array<object>} items - The list items.
    * @param {string} emptyText - The empty text.
    * @param {*} createItem - The item factory.
    * @returns {void} Nothing.
    */
   function renderTaskDetailList(listId, items, emptyText, createItem) {
      const list = document.getElementById(listId);
      if (!list) return;
      list.innerHTML = "";
      if (items.length === 0) return list.appendChild(createTaskDetailEmptyItem(emptyText));
      items.forEach((item, index) => list.appendChild(createItem(item, index)));
   }

   /**
    * Renders the task detail assigned list.
    *
    * @param {Array<object>} assignees - The assignees list.
    * @returns {void} Nothing.
    */
   function renderTaskDetailAssigned(assignees) {
      renderTaskDetailList("taskDetailAssignedList", assignees, "No assignees", createTaskDetailAssignedItem);
   }

   /**
    * Renders the task detail subtasks.
    *
    * @param {Array<object>} subtasks - The subtasks list.
    * @returns {void} Nothing.
    */
   function renderTaskDetailSubtasks(subtasks) {
      renderTaskDetailList("taskDetailSubtasksList", subtasks, "No subtasks", createTaskDetailSubtaskItem);
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

   window.BoardTaskDetailRender = {
      renderTaskDetail,
   };
}
