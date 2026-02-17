// ===== ASSIGNED-TO DROPDOWN =====

function getAssignedElements() {
   return {
      select: document.querySelector(".add-task__select--assigned"),
      menu: document.querySelector(".add-task__select-menu--assigned"),
      input: document.querySelector("#addTaskAssignedInput"),
      valueLabel: document.querySelector(".add-task__select-value"),
      initialsContainer: document.querySelector("#addTaskAssignedInitials")
   };
}

function isAssignedReady(elements) {
   return elements.select && elements.menu && elements.input && elements.valueLabel && elements.initialsContainer;
}

function setAssignedOpenState(elements, isOpen) {
   const wrapper = elements.select?.closest(".add-task__select-wrapper");
   if (!wrapper) return;
   
   if (isOpen) {
      wrapper.classList.add("add-task__select-wrapper--open");
   } else {
      wrapper.classList.remove("add-task__select-wrapper--open");
   }
}

function toggleAssignedMenu(elements) {
   const isOpen = elements.select.classList.toggle("add-task__select--open");
   if (isOpen) {
      resetAssignedPlaceholder(elements);
      document.body.style.overflow = "hidden";
      document.body.classList.add("add-task--assigned-open");
   } else {
      restoreLastAssignedSelection(elements);
      document.body.style.overflow = "auto";
      document.body.classList.remove("add-task--assigned-open");
   }
   elements.select.setAttribute("aria-expanded", isOpen ? "true" : "false");
   setAssignedOpenState(elements, isOpen);
   updateAssignedInitials(elements);
}

function closeAssignedMenu(elements) {
   elements.select.classList.remove("add-task__select--open");
   elements.select.setAttribute("aria-expanded", "false");
   setAssignedOpenState(elements, false);
   restoreLastAssignedSelection(elements);
   updateAssignedInitials(elements);
   document.body.style.overflow = "auto";
   document.body.classList.remove("add-task--assigned-open");
}

function resetAssignedPlaceholder(elements) {
   const placeholder = elements.valueLabel.dataset.placeholder || elements.valueLabel.textContent;
   elements.valueLabel.textContent = placeholder;
   elements.valueLabel.dataset.placeholder = placeholder;
   elements.input.value = "";
   elements.input.dispatchEvent(new Event("input", { bubbles: true }));
   
   const searchInput = elements.select.querySelector(".add-task__select-input");
   if (searchInput) {
      searchInput.style.display = "block";
      searchInput.value = "To: ";
      searchInput.addEventListener("keydown", (e) => handleAssignedSearchKeydown(e, searchInput));
      searchInput.addEventListener("input", (e) => handleAssignedSearchInput(e, searchInput));
      elements.valueLabel.style.display = "none";
      setTimeout(() => {
         searchInput.setSelectionRange(4, 4);
         searchInput.focus();
      }, 0);
   }
}

function handleAssignedSearchKeydown(e, input) {
   if (e.key === "Backspace" && input.selectionStart <= 4) {
      e.preventDefault();
   }
   if (e.key === "Delete" && input.selectionStart < 4) {
      e.preventDefault();
   }
}

function handleAssignedSearchInput(e, input) {
   if (!input.value.startsWith("To: ")) {
      const searchText = input.value.replace(/^To: /, "");
      input.value = "To: " + searchText;
      input.setSelectionRange(4 + searchText.length, 4 + searchText.length);
   }
   
   const searchText = input.value.substring(4).toLowerCase().trim();
   const menu = input.closest(".add-task__select-wrapper")?.querySelector(".add-task__select-menu--assigned");
   
   if (menu) {
      const options = menu.querySelectorAll(".add-task__select-option--assigned");
      options.forEach((option) => {
         const text = option.textContent.toLowerCase();
         if (searchText === "" || text.includes(searchText)) {
            option.style.display = "flex";
         } else {
            option.style.display = "none";
         }
      });
   }
}

function restoreLastAssignedSelection(elements) {
   const searchInput = elements.select.querySelector(".add-task__select-input");
   if (searchInput) {
      searchInput.style.display = "none";
      searchInput.value = "";
      searchInput.removeEventListener("keydown", handleAssignedSearchKeydown);
      searchInput.removeEventListener("input", handleAssignedSearchInput);
   }
   
   const menu = elements.menu;
   if (menu) {
      const options = menu.querySelectorAll(".add-task__select-option--assigned");
      options.forEach((option) => {
         option.style.display = "flex";
      });
   }
   
   const lastLabel = elements.valueLabel.dataset.lastLabel;
   const lastValue = elements.input.dataset.lastValue;
   
   if (lastLabel && lastValue) {
      elements.valueLabel.textContent = lastLabel;
      elements.input.value = lastValue;
   } else {
      elements.valueLabel.textContent = "Select contacts to assign";
      elements.input.value = "";
   }
   
   elements.valueLabel.style.display = "block";
   elements.input.dispatchEvent(new Event("input", { bubbles: true }));
}

function handleAssignedSelectClick(event, elements) {
   event.stopPropagation();
   toggleAssignedMenu(elements);
}

function handleAssignedOptionClick(event, elements) {
   event.stopPropagation();
   const option = event.target.closest(".add-task__select-option");
   if (!option) return;
   
   const isSelected = option.classList.toggle("add-task__select-option--selected");
   const checkbox = option.querySelector(".add-task__option-checkbox");
   if (checkbox) {
      checkbox.src = isSelected ? "./assets/icons/desktop/checkBox--checked.svg" : "./assets/icons/desktop/checkBox.svg";
   }
   
   updateAssignedInitials(elements);
}

function updateAssignedInitials(elements) {
   const selected = elements.menu.querySelectorAll(".add-task__select-option--selected");
   const initialsContainer = elements.initialsContainer;
   const wrapper = elements.select?.closest(".add-task__select-wrapper");
   const isMenuOpen = elements.select?.classList.contains("add-task__select--open");
   const footer = document.querySelector(".add-task__footer");
   
   if (!initialsContainer) return;
   
   initialsContainer.innerHTML = "";
   
   const containerWidth = initialsContainer.offsetWidth;
   const elementWidth = 50;
   const totalSlots = Math.floor(containerWidth / elementWidth);
   const maxDisplay = selected.length > totalSlots ? totalSlots - 1 : totalSlots;
   let displayCount = 0;
   
   selected.forEach((option) => {
      if (displayCount < maxDisplay) {
         const initials = option.querySelector(".add-task__option-initials");
         if (initials) {
            const initialsSpan = document.createElement("span");
            initialsSpan.className = "add-task__assigned-initial";
            initialsSpan.textContent = initials.textContent;
            initialsSpan.addEventListener("click", () => {
               option.classList.remove("add-task__select-option--selected");
               const checkbox = option.querySelector(".add-task__option-checkbox");
               if (checkbox) checkbox.src = "./assets/icons/desktop/checkBox.svg";
               updateAssignedInitials(elements);
            });
            initialsContainer.appendChild(initialsSpan);
            displayCount++;
         }
      }
   });
   
   if (selected.length > displayCount) {
      const plusSpan = document.createElement("span");
      plusSpan.className = "add-task__assigned-overflow";
      plusSpan.textContent = `+${selected.length - displayCount}`;
      initialsContainer.appendChild(plusSpan);
   }
   
   if (wrapper) {
      wrapper.style.paddingBottom = (selected.length > 0 && !isMenuOpen) ? "52px" : "0px";
   }
   
   if (footer) {
      footer.style.transform = (selected.length > 0 && !isMenuOpen) ? "translateY(-34px)" : "translateY(0)";
   }
}

function setupAssignedEvents(elements) {
   elements.select.addEventListener("click", (event) => handleAssignedSelectClick(event, elements));
   elements.menu.addEventListener("click", (event) => handleAssignedOptionClick(event, elements));
   
   const searchInput = elements.select.querySelector(".add-task__select-input");
   if (searchInput) {
      searchInput.addEventListener("click", (event) => event.stopPropagation());
   }
   
   document.addEventListener("click", () => closeAssignedMenu(elements));
}

function initAssignedSelect() {
   const elements = getAssignedElements();
   if (!isAssignedReady(elements)) return;
   elements.select.setAttribute("aria-expanded", "false");
   elements.valueLabel.dataset.placeholder = elements.valueLabel.textContent;
   if (elements.input.value) {
      elements.input.dataset.lastValue = elements.input.value;
      elements.valueLabel.dataset.lastLabel = elements.valueLabel.textContent;
   }
   setupAssignedEvents(elements);
}

function resetAssignedSelect(container) {
   const select = container.querySelector(".add-task__select--assigned");
   const menu = container.querySelector(".add-task__select-menu--assigned");
   const input = container.querySelector("#addTaskAssignedInput");
   const valueLabel = container.querySelector(".add-task__select-value");
   const initialsContainer = container.querySelector("#addTaskAssignedInitials");
   
   if (!select || !menu) return;
   
   const options = menu.querySelectorAll(".add-task__select-option--assigned");
   options.forEach((option) => {
      option.classList.remove("add-task__select-option--selected");
      const checkbox = option.querySelector(".add-task__option-checkbox");
      if (checkbox) checkbox.src = "./assets/icons/desktop/checkBox.svg";
   });
   
   if (valueLabel) valueLabel.textContent = "Select contacts to assign";
   if (input) input.value = "";
   if (initialsContainer) initialsContainer.innerHTML = "";
   
   select.classList.remove("add-task__select--open");
   select.setAttribute("aria-expanded", "false");
   
   const footer = container.querySelector(".add-task__footer");
   if (footer) footer.style.transform = "translateY(0)";
   
   const wrapper = select.closest(".add-task__select-wrapper");
   if (wrapper) wrapper.style.paddingBottom = "0px";
}
