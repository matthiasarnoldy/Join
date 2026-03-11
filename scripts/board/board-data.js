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

   function clearTaskCaches() {
      Object.keys(taskKeyById).forEach((taskId) => delete taskKeyById[taskId]);
      Object.keys(tasksById).forEach((taskId) => delete tasksById[taskId]);
   }

   function getStatusByDirectoryId(directoryId) {
      return STATUS_BY_DIRECTORY_ID[directoryId] || null;
   }

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

   async function getTaskKey(taskId) {
      const taskIdString = String(taskId);
      let taskKey = taskKeyById[taskIdString];
      if (!taskKey) {
         taskKey = await findTaskKeyById(taskId);
         if (taskKey) taskKeyById[taskIdString] = taskKey;
      }
      return taskKey;
   }

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

   function getTask(taskId) {
      return tasksById[String(taskId)] || null;
   }

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
