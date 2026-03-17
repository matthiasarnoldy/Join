"use strict";

{
   let draggedCard = null;
   let dragGhostCard = null;
   let dragGhostOffsetX = 0;
   let dragGhostOffsetY = 0;
   const transparentDragImage = new Image();
   transparentDragImage.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

   /**
    * Checks whether the drag event contains valid coordinates.
    *
    * @param {Event} event - The drag event.
    * @returns {boolean} Whether the drag event contains valid coordinates.
    */
   function hasValidDragPosition(event) {
      const { clientX, clientY } = event;
      return Number.isFinite(clientX) && Number.isFinite(clientY) && !(clientX <= 0 && clientY <= 0);
   }

   /**
    * Updates the drag ghost position.
    *
    * @param {Event} event - The drag event.
    * @returns {void} Nothing.
    */
   function updateDragGhostPosition(event) {
      if (!dragGhostCard || !hasValidDragPosition(event)) return;
      dragGhostCard.style.left = `${event.clientX - dragGhostOffsetX}px`;
      dragGhostCard.style.top = `${event.clientY - dragGhostOffsetY}px`;
   }

   /**
    * Clears the drop highlights.
    * @returns {void} Nothing.
    */
   function clearDropHighlights() {
      document.querySelectorAll(".board-task-directory").forEach((directory) => directory.classList.remove("board-task-directory--dragover"));
   }

   /**
    * Updates the closest insert candidate.
    *
    * @param {HTMLElement} card - The task card.
    * @param {number} mouseY - The mouse y coordinate.
    * @param {{offset: number, element: HTMLElement|null}} closest - The current closest candidate.
    * @returns {{offset: number, element: HTMLElement|null}} The updated closest candidate.
    */
   function updateClosestInsertCandidate(card, mouseY, closest) {
      const box = card.getBoundingClientRect();
      const offset = mouseY - box.top - box.height / 2;
      return offset < 0 && offset > closest.offset ? { offset, element: card } : closest;
   }

   /**
    * Returns the draggable cards in one container.
    *
    * @param {HTMLElement} container - The card container.
    * @returns {Array<HTMLElement>} The visible draggable cards.
    */
   function getVisibleDraggableCards(container) {
      return Array.from(container.querySelectorAll(".task-card")).filter((card) => card !== draggedCard && card.style.display !== "none");
   }

   /**
    * Returns the insert before element.
    *
    * @param {HTMLElement} container - The card container.
    * @param {number} mouseY - The mouse y coordinate.
    * @returns {HTMLElement|null} The insert before element.
    */
   function getInsertBeforeElement(container, mouseY) {
      let closest = { offset: Number.NEGATIVE_INFINITY, element: null };
      getVisibleDraggableCards(container).forEach((card) => {
         closest = updateClosestInsertCandidate(card, mouseY, closest);
      });
      return closest.element;
   }

   /**
    * Stores the drag offsets for one card.
    *
    * @param {HTMLElement} card - The dragged card.
    * @returns {void} Nothing.
    */
   function setDragGhostOffsets(card) {
      dragGhostOffsetX = card.offsetWidth / 2;
      dragGhostOffsetY = card.offsetHeight / 2;
   }

   /**
    * Creates the drag ghost for one card.
    *
    * @param {HTMLElement} card - The dragged card.
    * @returns {void} Nothing.
    */
   function createDragGhost(card) {
      dragGhostCard = card.cloneNode(true);
      dragGhostCard.classList.remove("task-card--dragging");
      dragGhostCard.classList.add("task-card--drag-ghost");
      dragGhostCard.style.width = `${card.offsetWidth}px`;
      document.body.appendChild(dragGhostCard);
   }

   /**
    * Sets the browser drag data.
    *
    * @param {Event} event - The drag event.
    * @param {HTMLElement} card - The dragged card.
    * @returns {void} Nothing.
    */
   function setDragData(event, card) {
      if (!event.dataTransfer) return;
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setDragImage(transparentDragImage, 0, 0);
      event.dataTransfer.setData("text/plain", card.dataset.taskId || "demo-card");
   }

   /**
    * Handles the card drag start.
    *
    * @param {HTMLElement} card - The dragged card.
    * @param {Event} event - The drag event.
    * @returns {void} Nothing.
    */
   function handleCardDragStart(card, event) {
      draggedCard = card;
      card.classList.add("task-card--dragging");
      setDragGhostOffsets(card);
      createDragGhost(card);
      updateDragGhostPosition(event);
      setDragData(event, card);
   }

   /**
    * Handles the card drag.
    *
    * @param {Event} event - The drag event.
    * @returns {void} Nothing.
    */
   function handleCardDrag(event) {
      updateDragGhostPosition(event);
   }

   /**
    * Removes the drag ghost.
    * @returns {void} Nothing.
    */
   function removeDragGhost() {
      if (!dragGhostCard) return;
      dragGhostCard.remove();
      dragGhostCard = null;
   }

   /**
    * Handles the card drag end.
    *
    * @param {HTMLElement} card - The dragged card.
    * @returns {void} Nothing.
    */
   function handleCardDragEnd(card) {
      card.classList.remove("task-card--dragging");
      removeDragGhost();
      clearDropHighlights();
      draggedCard = null;
      window.BoardCards?.updatePlaceholders?.();
   }

   /**
    * Makes the card draggable.
    *
    * @param {HTMLElement|null} card - The task card.
    * @returns {void} Nothing.
    */
   function makeCardDraggable(card) {
      if (!card || card.dataset.dndInitialized === "true") return;
      card.dataset.dndInitialized = "true";
      card.setAttribute("draggable", "true");
      card.addEventListener("dragstart", (event) => handleCardDragStart(card, event));
      card.addEventListener("drag", handleCardDrag);
      card.addEventListener("dragend", () => handleCardDragEnd(card));
   }

   /**
    * Initializes the draggable cards.
    * @returns {void} Nothing.
    */
   function initializeDraggableCards() {
      document.querySelectorAll(".task-card").forEach(makeCardDraggable);
   }

   /**
    * Hides the directory placeholder while dragging.
    *
    * @param {HTMLElement} directory - The task directory.
    * @returns {void} Nothing.
    */
   function hideDirectoryPlaceholder(directory) {
      const placeholder = directory.querySelector(".board-task-placeholder");
      if (placeholder) placeholder.style.display = "none";
   }

   /**
    * Moves the dragged card inside one directory.
    *
    * @param {HTMLElement} directory - The task directory.
    * @param {number} mouseY - The mouse y coordinate.
    * @returns {void} Nothing.
    */
   function moveDraggedCard(directory, mouseY) {
      const insertBeforeElement = getInsertBeforeElement(directory, mouseY);
      if (insertBeforeElement) directory.insertBefore(draggedCard, insertBeforeElement);
      else directory.appendChild(draggedCard);
   }

   /**
    * Handles the directory drag over.
    *
    * @param {HTMLElement} directory - The task directory.
    * @param {Event} event - The drag event.
    * @returns {void} Nothing.
    */
   function handleDirectoryDragOver(directory, event) {
      if (!draggedCard) return;
      event.preventDefault();
      updateDragGhostPosition(event);
      directory.classList.add("board-task-directory--dragover");
      hideDirectoryPlaceholder(directory);
      moveDraggedCard(directory, event.clientY);
   }

   /**
    * Returns whether the directory still shows visible cards.
    *
    * @param {HTMLElement} directory - The task directory.
    * @returns {boolean} Whether the directory still shows visible cards.
    */
   function hasVisibleCards(directory) {
      return Array.from(directory.querySelectorAll(".task-card")).some((card) => card !== draggedCard && card.style.display !== "none");
   }

   /**
    * Handles the directory drag leave.
    *
    * @param {HTMLElement} directory - The task directory.
    * @param {Event} event - The drag event.
    * @returns {void} Nothing.
    */
   function handleDirectoryDragLeave(directory, event) {
      const placeholder = directory.querySelector(".board-task-placeholder");
      if (directory.contains(event.relatedTarget)) return;
      directory.classList.remove("board-task-directory--dragover");
      if (placeholder) placeholder.style.display = hasVisibleCards(directory) ? "none" : "";
   }

   /**
    * Returns the dragged task ID from a drop event.
    *
    * @param {Event} event - The drop event.
    * @returns {string|undefined} The dragged task ID.
    */
   function getDraggedTaskId(event) {
      return event.dataTransfer?.getData("text/plain") || draggedCard?.dataset.taskId;
   }

   /**
    * Handles the directory drop.
    *
    * @param {HTMLElement} directory - The task directory.
    * @param {Event} event - The drop event.
    * @returns {Promise<void>} A promise that resolves when the drop is processed.
    */
   async function handleDirectoryDrop(directory, event) {
      const targetStatus = window.BoardData?.getStatusByDirectoryId(directory.id);
      const draggedTaskId = getDraggedTaskId(event);
      event.preventDefault();
      directory.classList.remove("board-task-directory--dragover");
      if (!draggedTaskId || !targetStatus) return;
      try {
         await window.BoardData?.updateTaskStatus(draggedTaskId, targetStatus);
      } catch (error) {
         console.error("Task status update failed:", error);
      }
      window.BoardCards?.updatePlaceholders?.();
   }

   /**
    * Binds one drop zone event.
    *
    * @param {HTMLElement} directory - The task directory.
    * @param {string} eventName - The event name.
    * @param {*} handler - The event handler.
    * @returns {void} Nothing.
    */
   function bindDropZoneEvent(directory, eventName, handler) {
      directory.addEventListener(eventName, (event) => handler(directory, event));
   }

   /**
    * Initializes the drop zone.
    *
    * @param {HTMLElement|null} directory - The task directory.
    * @returns {void} Nothing.
    */
   function initializeDropZone(directory) {
      if (!directory || directory.dataset.dropzoneInitialized === "true") return;
      directory.dataset.dropzoneInitialized = "true";
      bindDropZoneEvent(directory, "dragover", handleDirectoryDragOver);
      bindDropZoneEvent(directory, "dragleave", handleDirectoryDragLeave);
      bindDropZoneEvent(directory, "drop", handleDirectoryDrop);
   }

   /**
    * Sets up the drop zones.
    * @returns {void} Nothing.
    */
   function setupDropZones() {
      document.querySelectorAll(".board-task-directory").forEach(initializeDropZone);
   }

   /**
    * Checks whether the board is dragging.
    * @returns {boolean} Whether the board is dragging.
    */
   function isDragging() {
      return Boolean(draggedCard);
   }

   window.BoardDnd = {
      initializeDraggableCards,
      isDragging,
      makeCardDraggable,
      setupDropZones,
   };
}
