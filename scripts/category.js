// ===== CATEGORY DROPDOWN =====

function getCategoryElements() {
   return {
      select: document.querySelector(".add-task__select--category"),
      menu: document.querySelector(".add-task__select-menu--category"),
      valueLabel: document.querySelector(".add-task__select-value--category"),
   };
}

function isCategoryReady(elements) {
   return elements.select && elements.menu && elements.valueLabel;
}

function setCategoryOpenState(elements, isOpen) {
   const wrapper = elements.select?.closest(".add-task__selection-group");
   if (!wrapper) return;
   
   if (isOpen) {
      wrapper.classList.add("add-task__selection-group--category-open");
   } else {
      wrapper.classList.remove("add-task__selection-group--category-open");
   }
}

function toggleCategoryMenu(elements) {
   const isOpen = elements.select.classList.toggle("add-task__select--open");
   elements.select.setAttribute("aria-expanded", isOpen ? "true" : "false");
   setCategoryOpenState(elements, isOpen);
}

function closeCategoryMenu(elements) {
   elements.select.classList.remove("add-task__select--open");
   elements.select.setAttribute("aria-expanded", "false");
   setCategoryOpenState(elements, false);
}

function handleCategorySelectClick(event, elements) {
   event.stopPropagation();
   toggleCategoryMenu(elements);
}

function handleCategoryOptionClick(event, elements) {
   event.stopPropagation();
   const option = event.target.closest(".add-task__select-option");
   if (!option) return;
   
   const options = elements.menu.querySelectorAll(".add-task__select-option");
   options.forEach((opt) => opt.classList.remove("add-task__select-option--selected"));
   option.classList.add("add-task__select-option--selected");
   
   elements.valueLabel.textContent = option.textContent.trim();
   closeCategoryMenu(elements);
}

function setupCategoryEvents(elements) {
   elements.select.addEventListener("click", (event) => handleCategorySelectClick(event, elements));
   elements.menu.addEventListener("click", (event) => handleCategoryOptionClick(event, elements));
   document.addEventListener("click", () => closeCategoryMenu(elements));
}

function initCategorySelect() {
   const elements = getCategoryElements();
   if (!isCategoryReady(elements)) return;
   elements.select.setAttribute("aria-expanded", "false");
   setupCategoryEvents(elements);
}

function resetCategorySelect(container) {
   const select = container.querySelector(".add-task__select--category");
   const menu = container.querySelector(".add-task__select-menu--category");
   const valueLabel = container.querySelector(".add-task__select-value--category");
   
   if (!select || !menu) return;
   
   const options = menu.querySelectorAll(".add-task__select-option");
   options.forEach((option, index) => {
      if (index === 0) {
         option.classList.add("add-task__select-option--selected");
      } else {
         option.classList.remove("add-task__select-option--selected");
      }
   });
   
   if (valueLabel && options.length > 0) {
      valueLabel.textContent = options[0].textContent.trim();
   }
   
   select.classList.remove("add-task__select--open");
   select.setAttribute("aria-expanded", "false");
}
