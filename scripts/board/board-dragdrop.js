(function () {
   let draggedCard = null;
   let dragGhostCard = null;
   let dragGhostOffsetX = 0;
   let dragGhostOffsetY = 0;
   const transparentDragImage = new Image();
   transparentDragImage.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

   function updateDragGhostPosition(event) {
      if (!dragGhostCard) return;
      const { clientX, clientY } = event;
      if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) return;
      if (clientX <= 0 && clientY <= 0) return;
      dragGhostCard.style.left = `${clientX - dragGhostOffsetX}px`;
      dragGhostCard.style.top = `${clientY - dragGhostOffsetY}px`;
   }

   function clearDropHighlights() {
      const directories = document.querySelectorAll(".board-task-directory");
      directories.forEach((directory) =>
         directory.classList.remove("board-task-directory--dragover"),
      );
   }

   function getInsertBeforeElement(container, mouseY) {
      const cards = Array.from(container.querySelectorAll(".task-card")).filter(
         (card) => card !== draggedCard && card.style.display !== "none",
      );
      let closest = {
         offset: Number.NEGATIVE_INFINITY,
         element: null,
      };

      cards.forEach((card) => {
         const box = card.getBoundingClientRect();
         const offset = mouseY - box.top - box.height / 2;
         if (offset < 0 && offset > closest.offset) {
            closest = { offset, element: card };
         }
      });

      return closest.element;
   }

   function handleCardDragStart(card, event) {
      draggedCard = card;
      card.classList.add("task-card--dragging");

      dragGhostOffsetX = card.offsetWidth / 2;
      dragGhostOffsetY = card.offsetHeight / 2;
      dragGhostCard = card.cloneNode(true);
      dragGhostCard.classList.remove("task-card--dragging");
      dragGhostCard.classList.add("task-card--drag-ghost");
      dragGhostCard.style.width = `${card.offsetWidth}px`;
      document.body.appendChild(dragGhostCard);
      updateDragGhostPosition(event);

      if (!event.dataTransfer) return;
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setDragImage(transparentDragImage, 0, 0);
      event.dataTransfer.setData("text/plain", card.dataset.taskId || "demo-card");
   }

   function handleCardDrag(event) {
      updateDragGhostPosition(event);
   }

   function handleCardDragEnd(card) {
      card.classList.remove("task-card--dragging");
      if (dragGhostCard) {
         dragGhostCard.remove();
         dragGhostCard = null;
      }
      clearDropHighlights();
      draggedCard = null;
      window.BoardCards?.updatePlaceholders?.();
   }

   function makeCardDraggable(card) {
      if (!card || card.dataset.dndInitialized === "true") return;
      card.dataset.dndInitialized = "true";
      card.setAttribute("draggable", "true");
      card.addEventListener("dragstart", (event) =>
         handleCardDragStart(card, event),
      );
      card.addEventListener("drag", (event) => handleCardDrag(event));
      card.addEventListener("dragend", () => handleCardDragEnd(card));
   }

   function initializeDraggableCards() {
      const cards = document.querySelectorAll(".task-card");
      cards.forEach(makeCardDraggable);
   }

   function handleDirectoryDragOver(directory, event) {
      if (!draggedCard) return;
      event.preventDefault();
      updateDragGhostPosition(event);
      directory.classList.add("board-task-directory--dragover");
      const placeholder = directory.querySelector(".board-task-placeholder");
      if (placeholder) placeholder.style.display = "none";
      const insertBeforeElement = getInsertBeforeElement(directory, event.clientY);
      if (insertBeforeElement) directory.insertBefore(draggedCard, insertBeforeElement);
      else directory.appendChild(draggedCard);
   }

   function handleDirectoryDragLeave(directory, event) {
      if (directory.contains(event.relatedTarget)) return;
      directory.classList.remove("board-task-directory--dragover");
      const placeholder = directory.querySelector(".board-task-placeholder");
      if (!placeholder) return;
      const hasVisibleCards = Array.from(
         directory.querySelectorAll(".task-card"),
      ).some((card) => card !== draggedCard && card.style.display !== "none");
      placeholder.style.display = hasVisibleCards ? "none" : "";
   }

   async function handleDirectoryDrop(directory, event) {
      event.preventDefault();
      directory.classList.remove("board-task-directory--dragover");
      const targetStatus = window.BoardData?.getStatusByDirectoryId(directory.id);
      const draggedTaskId =
         event.dataTransfer?.getData("text/plain") || draggedCard?.dataset.taskId;
      if (!draggedTaskId || !targetStatus) return;
      try {
         await window.BoardData?.updateTaskStatus(draggedTaskId, targetStatus);
      } catch (error) {
         console.error("Task status update failed:", error);
      }
      window.BoardCards?.updatePlaceholders?.();
   }

   function initializeDropZone(directory) {
      if (directory.dataset.dropzoneInitialized === "true") return;
      directory.dataset.dropzoneInitialized = "true";
      directory.addEventListener("dragover", (event) =>
         handleDirectoryDragOver(directory, event),
      );
      directory.addEventListener("dragleave", (event) =>
         handleDirectoryDragLeave(directory, event),
      );
      directory.addEventListener("drop", (event) =>
         handleDirectoryDrop(directory, event),
      );
   }

   function setupDropZones() {
      const directories = document.querySelectorAll(".board-task-directory");
      directories.forEach((directory) => initializeDropZone(directory));
   }

   function isDragging() {
      return Boolean(draggedCard);
   }

   window.BoardDnd = {
      initializeDraggableCards,
      isDragging,
      makeCardDraggable,
      setupDropZones,
   };
})();
