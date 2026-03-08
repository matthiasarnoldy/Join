// ===== CATEGORY SELECT =====

function initCategorySelect() {
   const elements = getCategoryElements();
   if (!elements) return;
   elements.select.setAttribute("aria-expanded", "false");
   elements.label.dataset.placeholder = elements.label.textContent;
   if (elements.input.value) {
      elements.input.dataset.lastValue = elements.input.value;
      elements.label.dataset.lastLabel = elements.label.textContent;
   }
   setupCategoryClickListeners(elements);
}

function getCategoryElements() {
   const select = document.getElementById("addTaskCategory");
   const menu = document.getElementById("addTaskCategoryMenu");
   const input = document.getElementById("addTaskCategoryInput");
   const label = document.querySelector("#addTaskCategory .add-task__select-value");
   if (!select || !menu || !input || !label) return null;
   return {
      select,
      menu,
      input,
      label,
      group: select.closest(".add-task__selection-group")
   };
}

function setupCategoryClickListeners(elements) {
   elements.select.addEventListener("click", (event) => {
      handleCategorySelectClick(event, elements);
   });
   elements.menu.addEventListener("click", (event) => {
      handleCategoryOptionClick(event, elements);
   });
   document.addEventListener("click", () => {
      closeCategoryMenu(elements);
   });
}

function handleCategorySelectClick(event, elements) {
   event.stopPropagation();
   toggleCategoryMenu(elements);
}

function toggleCategoryMenu(elements) {
   if (isCategoryMenuOpen(elements)) {
      closeCategoryMenu(elements);
      restoreCategorySelection(elements);
   } else {
      openCategoryMenu(elements);
      resetCategoryPlaceholder(elements);
   }
}

function isCategoryMenuOpen(elements) {
   return elements.select.classList.contains("add-task__select--open");
}

function closeCategoryMenu(elements) {
   elements.select.classList.remove("add-task__select--open");
   elements.select.setAttribute("aria-expanded", "false");
   if (elements.group) {
      elements.group.classList.remove("add-task__selection-group--category-open");
   }
}

function restoreCategorySelection(elements) {
   const lastValue = elements.input.dataset.lastValue;
   const lastLabel = elements.label.dataset.lastLabel;
   if (!lastValue || !lastLabel) return;
   elements.label.textContent = lastLabel;
   elements.input.value = lastValue;
   elements.input.dispatchEvent(new Event("input", { bubbles: true }));
}

function openCategoryMenu(elements) {
   elements.select.classList.add("add-task__select--open");
   elements.select.setAttribute("aria-expanded", "true");
   if (elements.group) {
      elements.group.classList.add("add-task__selection-group--category-open");
   }
}

function resetCategoryPlaceholder(elements) {
   const placeholder = elements.label.dataset.placeholder || elements.label.textContent;
   elements.label.textContent = placeholder;
   elements.label.dataset.placeholder = placeholder;
   elements.input.value = "";
   elements.input.dispatchEvent(new Event("input", { bubbles: true }));
}

function handleCategoryOptionClick(event, elements) {
   event.stopPropagation();
   const option = event.target.closest(".add-task__select-option");
   if (!option) return;
   selectCategoryOption(option, elements);
}

function selectCategoryOption(option, elements) {
   saveCategorySelection(option, elements);
   closeCategoryMenu(elements);
}

function saveCategorySelection(option, elements) {
   const optionValue = option.dataset.value;
   const optionText = option.textContent.trim();
   elements.input.value = optionValue;
   elements.label.textContent = optionText;
   elements.input.dataset.lastValue = optionValue;
   elements.label.dataset.lastLabel = optionText;
   elements.input.dispatchEvent(new Event("input", { bubbles: true }));
}