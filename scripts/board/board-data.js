(function () {
   const BOARD_BASE_URL =
      window.JOIN_CONFIG.BASE_URL;

   const taskKeyById = {};
   const tasksById = {};

   const STATUS_BY_DIRECTORY_ID = {
      TodoTask: "todo",
      InProgressTask: "in-progress",
      AwaitTask: "await-feedback",
      DoneTask: "done",
   };

   /**
    * Clears the task caches.
    * @returns {void} Nothing.
    */
   function clearTaskCaches() {
      Object.keys(taskKeyById).forEach((taskId) => delete taskKeyById[taskId]);
      Object.keys(tasksById).forEach((taskId) => delete tasksById[taskId]);
   }

   /**
    * Returns the status by directory ID.
    *
    * @param {string|number} directoryId - The directory ID used for this operation.
    * @returns {string|null} The status by directory ID, or null when it is not available.
    */
   function getStatusByDirectoryId(directoryId) {
      return STATUS_BY_DIRECTORY_ID[directoryId] || null;
   }

   /**
    * Finds the task key by ID.
    *
    * @param {string|number} taskId - The task ID used for this operation.
    * @returns {Promise<string|null>} A promise that resolves to the task key by ID, or null when it is not available.
    */
   async function findTaskKeyById(taskId) {
      const response = await fetch(`${BOARD_BASE_URL}tasks.json`);
      if (!response.ok) return null;
      const data = await response.json();
      if (!data) return null;
      const entries = Array.isArray(data)
         ? data.map((task, index) => [String(index), task])
         : Object.entries(data);
      const match = entries.find(
         ([, task]) => task && String(task.id ?? "") === String(taskId),
      );
      return match ? match[0] : null;
   }

   /**
    * Returns the task key.
    *
    * @param {string|number} taskId - The task ID used for this operation.
    * @returns {Promise<string>} A promise that resolves to the task key.
    */
   async function getTaskKey(taskId) {
      const taskIdString = String(taskId);
      let taskKey = taskKeyById[taskIdString];
      if (!taskKey) {
         taskKey = await findTaskKeyById(taskId);
         if (taskKey) taskKeyById[taskIdString] = taskKey;
      }
      return taskKey;
   }

   /**
    * Stores the task.
    *
    * @param {string|number} taskId - The task ID used for this operation.
    * @param {object} taskData - The task data object.
    * @returns {Promise<void>} A promise that resolves when the operation is complete.
    */
   async function putTask(taskId, taskData) {
      const taskKey = await getTaskKey(taskId);
      if (!taskKey) throw new Error(`Task key not found for id ${taskId}`);
      const response = await fetch(`${BOARD_BASE_URL}tasks/${taskKey}.json`, {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ ...taskData, id: taskData.id ?? taskId }),
      });
      if (!response.ok) {
         throw new Error(`Task update failed: HTTP ${response.status}`);
      }
      taskKeyById[String(taskId)] = taskKey;
      tasksById[String(taskId)] = { ...taskData, id: taskData.id ?? taskId };
   }

   /**
    * Deletes the task.
    *
    * @param {string|number} taskId - The task ID used for this operation.
    * @returns {Promise<void>} A promise that resolves when the operation is complete.
    */
   async function deleteTask(taskId) {
      const taskKey = await getTaskKey(taskId);
      if (!taskKey) throw new Error(`Task key not found for id ${taskId}`);
      const response = await fetch(`${BOARD_BASE_URL}tasks/${taskKey}.json`, {
         method: "DELETE",
      });
      if (!response.ok) {
         throw new Error(`Task delete failed: HTTP ${response.status}`);
      }
      delete taskKeyById[String(taskId)];
      delete tasksById[String(taskId)];
   }

   /**
    * Updates the task status.
    *
    * @param {string|number} taskId - The task ID used for this operation.
    * @param {object} newStatus - The new status object.
    * @returns {Promise<void>} A promise that resolves when the operation is complete.
    */
   async function updateTaskStatus(taskId, newStatus) {
      if (!taskId || !newStatus) return;
      const currentTask = tasksById[String(taskId)];
      if (!currentTask) return;
      const updatedTask = {
         ...currentTask,
         id: currentTask.id ?? taskId,
         status: newStatus,
      };
      await putTask(taskId, updatedTask);
      tasksById[String(taskId)] = updatedTask;
   }

   /**
    * Normalizes the Firebase tasks.
    *
    * @param {object} data - The data object.
    * @returns {Array<object>} The Firebase tasks list.
    */
   function normalizeFirebaseTasks(data) {
      if (!data) return [];
      const entries = Array.isArray(data)
         ? data.map((task, index) => [String(index), task])
         : Object.entries(data);

      return entries
         .filter(([, task]) => task && typeof task === "object")
         .map(([key, task]) => {
            const resolvedId = task.id ?? key;
            const normalizedTask = { ...task, id: resolvedId };
            taskKeyById[String(resolvedId)] = key;
            tasksById[String(resolvedId)] = normalizedTask;
            return normalizedTask;
         });
   }

   /**
    * Loads the tasks.
    * @returns {Promise<Array<*>>} A promise that resolves to the tasks list.
    */
   async function loadTasks() {
      clearTaskCaches();
      try {
         const response = await fetch(`${BOARD_BASE_URL}tasks.json`);
         if (!response.ok) throw new Error(`HTTP ${response.status}`);
         const data = await response.json();
         return normalizeFirebaseTasks(data);
      } catch (error) {
         console.error("Task loading failed:", error);
         return [];
      }
   }

   /**
    * Returns the task.
    *
    * @param {string|number} taskId - The task ID used for this operation.
    * @returns {string|null} The task, or null when it is not available.
    */
   function getTask(taskId) {
      return tasksById[String(taskId)] || null;
   }

   /**
    * Returns the all tasks.
    * @returns {Array<object>} The all tasks list.
    */
   function getAllTasks() {
      return Object.values(tasksById);
   }

   window.BoardData = {
      deleteTask,
      getAllTasks,
      getStatusByDirectoryId,
      getTask,
      getTaskKey,
      loadTasks,
      putTask,
      updateTaskStatus,
   };
})();
