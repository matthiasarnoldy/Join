const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

function twoDigits(number) {
   return String(number).padStart(2, "0");
}

function formatGermanDate(date) {
   const day = twoDigits(date.getDate());
   const month = twoDigits(date.getMonth() + 1);
   const year = date.getFullYear();
   return `${day}/${month}/${year}`;
}

function formatISODate(date) {
   const year = date.getFullYear();
   const month = twoDigits(date.getMonth() + 1);
   const day = twoDigits(date.getDate());
   return `${year}-${month}-${day}`;
}

function areSameDay(dateToCheck, targetDate) {
   if (!dateToCheck || !targetDate) return false;
   return dateToCheck.getFullYear() === targetDate.getFullYear() && 
          dateToCheck.getMonth() === targetDate.getMonth() && 
          dateToCheck.getDate() === targetDate.getDate();
}

function getTodayAtMidnight() {
   const now = new Date();
   return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function openCalendar(panel) {
   panel.classList.add("date-picker__panel--open");
   panel.setAttribute("aria-hidden", "false");
}

function closeCalendar(panel) {
   panel.classList.remove("date-picker__panel--open");
   panel.setAttribute("aria-hidden", "true");
}

function createEmptyDayButton() {
   const button = document.createElement("button");
   button.type = "button";
   button.className = "date-picker__day date-picker__day--empty";
   button.setAttribute("aria-hidden", "true");
   return button;
}

function markTodayIfNeeded(button, date, today) {
   if (!areSameDay(date, today)) return;
   button.classList.add("date-picker__day--today");
}

function disableIfPastDay(button, date, today) {
   if (date >= today) return;
   button.disabled = true;
   button.classList.add("date-picker__day--disabled");
}

function markSelectedIfNeeded(button, date, selectedDate) {
   if (!areSameDay(date, selectedDate)) return;
   button.classList.add("date-picker__day--selected");
}

function createDayButton(date, today, selectedDate) {
   const button = document.createElement("button");
   button.type = "button";
   button.className = "date-picker__day";
   button.textContent = date.getDate();
   button.dataset.date = formatISODate(date);
   markTodayIfNeeded(button, date, today);
   disableIfPastDay(button, date, today);
   markSelectedIfNeeded(button, date, selectedDate);
   return button;
}

function updateMonthLabel(currentDate, monthLabel) {
   const year = currentDate.getFullYear();
   const month = currentDate.getMonth();
   monthLabel.textContent = `${MONTHS[month]} ${year}`;
}

function addEmptyDays(year, month, daysContainer) {
   const firstDayOfMonth = new Date(year, month, 1);
   const firstWeekday = (firstDayOfMonth.getDay() + 6) % 7;
   for (let i = 0; i < firstWeekday; i++) {
      daysContainer.appendChild(createEmptyDayButton());
   }
}

function addMonthDays(year, month, today, selectedDate, daysContainer) {
   const lastDayOfMonth = new Date(year, month + 1, 0);
   const totalDays = lastDayOfMonth.getDate();
   for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      const dayButton = createDayButton(date, today, selectedDate);
      daysContainer.appendChild(dayButton);
   }
}

function drawCalendar(currentDate, today, selectedDate, monthLabel, daysContainer) {
   const year = currentDate.getFullYear();
   const month = currentDate.getMonth();
   updateMonthLabel(currentDate, monthLabel);
   daysContainer.innerHTML = "";
   addEmptyDays(year, month, daysContainer);
   addMonthDays(year, month, today, selectedDate, daysContainer);
}

function getSelectedOrToday(pickerState) {
   if (pickerState.selectedDate) return pickerState.selectedDate;
   return pickerState.today;
}

function setCalendarToSelected(pickerState, monthLabel, daysContainer) {
   const baseDate = getSelectedOrToday(pickerState);
   pickerState.currentDate = new Date(baseDate);
   drawCalendar(pickerState.currentDate, pickerState.today, pickerState.selectedDate, monthLabel, daysContainer);
}

function handleToggleClick(panel, pickerState, monthLabel, daysContainer) {
   if (panel.classList.contains("date-picker__panel--open")) {
      closeCalendar(panel);
      return;
   }
   setCalendarToSelected(pickerState, monthLabel, daysContainer);
   openCalendar(panel);
}

function handleNavClick(navButton, pickerState, monthLabel, daysContainer) {
   const direction = navButton.dataset.action === "prev" ? -1 : 1;
   pickerState.currentDate = new Date(pickerState.currentDate.getFullYear(), pickerState.currentDate.getMonth() + direction, 1);
   drawCalendar(pickerState.currentDate, pickerState.today, pickerState.selectedDate, monthLabel, daysContainer);
}

function handleDayClick(dayButton, pickerState, input, monthLabel, daysContainer, panel) {
   const [year, month, day] = dayButton.dataset.date.split("-").map(Number);
   pickerState.selectedDate = new Date(year, month - 1, day);
   input.value = formatGermanDate(pickerState.selectedDate);
   input.dispatchEvent(new Event("input", { bubbles: true }));
   drawCalendar(pickerState.currentDate, pickerState.today, pickerState.selectedDate, monthLabel, daysContainer);
   closeCalendar(panel);
}

function getDatePickerElements() {
   return {
      picker: document.getElementById("datePicker"),
      input: document.getElementById("addTaskDate"),
      panel: document.getElementById("datePickerPanel"),
      monthLabel: document.getElementById("datePickerMonth"),
      daysContainer: document.getElementById("datePickerDays")
   };
}

function isPickerReady(elements) {
   return elements.picker && elements.input && elements.panel && elements.monthLabel && elements.daysContainer;
}

function createPickerState() {
   const today = getTodayAtMidnight();
   return { today, currentDate: new Date(today), selectedDate: new Date(today) };
}

function initializeCalendar(pickerState, monthLabel, daysContainer) {
   drawCalendar(pickerState.currentDate, pickerState.today, pickerState.selectedDate, monthLabel, daysContainer);
}

function handleToggleHit(clicked, elements, pickerState) {
   if (!clicked.closest(".date-picker__toggle") && clicked !== elements.input) return false;
   handleToggleClick(elements.panel, pickerState, elements.monthLabel, elements.daysContainer);
   return true;
}

function handleNavHit(clicked, elements, pickerState) {
   const navButton = clicked.closest(".date-picker__nav");
   if (!navButton) return false;
   handleNavClick(navButton, pickerState, elements.monthLabel, elements.daysContainer);
   return true;
}

function handleDayHit(clicked, elements, pickerState) {
   const dayButton = clicked.closest(".date-picker__day[data-date]");
   if (!dayButton || dayButton.disabled) return;
   handleDayClick(dayButton, pickerState, elements.input, elements.monthLabel, elements.daysContainer, elements.panel);
}

function handlePickerClick(event, elements, pickerState) {
   event.stopPropagation();
   const clicked = event.target;
   if (handleToggleHit(clicked, elements, pickerState)) return;
   if (handleNavHit(clicked, elements, pickerState)) return;
   handleDayHit(clicked, elements, pickerState);
}

function setupPickerEvents(elements, pickerState) {
   elements.picker.addEventListener("click", (event) => handlePickerClick(event, elements, pickerState));
   document.addEventListener("click", () => closeCalendar(elements.panel));
}

function initDatePicker() {
   const elements = getDatePickerElements();
   if (!isPickerReady(elements)) return;
   const pickerState = createPickerState();
   initializeCalendar(pickerState, elements.monthLabel, elements.daysContainer);
   setupPickerEvents(elements, pickerState);
}

// ===== FORMULAR-VALIDIERUNG =====

// Alle Pflichtfelder im Container finden
function findRequiredFields(container) {
   return Array.from(container.querySelectorAll(".add-task__input-field--required"));
}

// Input-Element aus Feld holen (input, textarea oder select)
function getInputFromField(field) {
   return field.querySelector("input, textarea, select");
}

// Prüfen ob ein Feld ausgefüllt ist
function isFieldFilled(field) {
   const input = getInputFromField(field);
   if (!input) return false;
   return input.value.trim() !== ""; // Nicht leer
}

// Button aktivieren/deaktivieren
function setButtonState(button, allFieldsValid) {
   if (allFieldsValid) {
      button.classList.remove("is-disabled");
      button.setAttribute("aria-disabled", "false");
   } else {
      button.classList.add("is-disabled");
      button.setAttribute("aria-disabled", "true");
   }
}

// Fehler anzeigen bei leeren Feldern
function showErrorsOnEmptyFields(fields) {
   fields.forEach((field) => {
      if (!isFieldFilled(field)) {
         field.classList.add("add-task__input-field--error");
      }
   });
}

// Input-Handler für ein Feld
function handleFieldInput(field, fields, button) {
   field.classList.remove("add-task__input-field--error");
   const allValid = fields.every(isFieldFilled);
   setButtonState(button, allValid);
}

// Live-Validierung: Bei jeder Eingabe prüfen
function setupLiveValidation(fields, button) {
   fields.forEach((field) => {
      const input = getInputFromField(field);
      if (!input) return;
      input.addEventListener("input", () => handleFieldInput(field, fields, button));
   });
}

// Button-Click Handler
function handleCreateButtonClick(event, fields) {
   if (fields.every(isFieldFilled)) return;
   event.preventDefault();
   showErrorsOnEmptyFields(fields);
}

// Create-Button vorbereiten
function setupCreateButton(button) {
   const form = button.closest("form") || document;
   const fields = findRequiredFields(form);
   if (fields.length === 0) return;
   const allValid = fields.every(isFieldFilled);
   setButtonState(button, allValid);
   setupLiveValidation(fields, button);
   button.addEventListener("click", (event) => handleCreateButtonClick(event, fields));
}

// Alle Create-Buttons initialisieren
function initFormValidation() {
   const allCreateButtons = document.querySelectorAll(".add-task__button--create");
   allCreateButtons.forEach(setupCreateButton);
}

// ===== TEXTAREA VERGRÖSSERN/VERKLEINERN =====

// Pixel-Wert aus String extrahieren ("120px" → 120)
function extractPixels(cssValue) {
   return Number.parseFloat(cssValue) || 0;
}

// Wert zwischen Min und Max begrenzen
function limitValue(value, min, max) {
   if (value < min) return min;
   if (value > max) return max;
   return value;
}

// Min/Max-Höhe aus CSS holen
function getTextareaLimits(textarea) {
   const styles = getComputedStyle(textarea);
   const minHeight = extractPixels(styles.minHeight) || 48;
   const maxHeight = extractPixels(styles.maxHeight) || 10000;
   return { minHeight, maxHeight };
}

// Textarea-Höhe während Drag anpassen
function resizeTextarea(moveEvent, startMouseY, startHeight, textarea, minHeight, maxHeight) {
   const mouseDelta = moveEvent.clientY - startMouseY;
   const newHeight = startHeight + mouseDelta;
   const limitedHeight = limitValue(newHeight, minHeight, maxHeight);
   textarea.style.height = `${limitedHeight}px`;
}

// Resize starten (Maus gedrückt)
function startTextareaResize(event, textarea) {
   event.preventDefault();
   const { minHeight, maxHeight } = getTextareaLimits(textarea);
   const startMouseY = event.clientY;
   const startHeight = textarea.offsetHeight;
   
   const onMouseMove = (e) => resizeTextarea(e, startMouseY, startHeight, textarea, minHeight, maxHeight);
   const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
   };
   document.addEventListener("mousemove", onMouseMove);
   document.addEventListener("mouseup", onMouseUp);
}

// Resize-Handle für ein Textarea einrichten
function setupTextareaResizeHandle(wrapper) {
   const textarea = wrapper.querySelector("textarea");
   const handle = wrapper.querySelector(".add-task__textarea-resize");
   
   if (!textarea || !handle) return;
   
   // Handle klickbar machen
   handle.style.pointerEvents = "auto";
   
   // Bei Maus-Klick auf Handle
   handle.addEventListener("mousedown", (event) => {
      startTextareaResize(event, textarea);
   });
}

// ===== PRIORITY FIELD =====

// Click-Handler für einen Priority-Button
function handlePriorityClick(event) {
   const clickedButton = event.target.closest(".add-task__priority-option");
   if (!clickedButton) return;
   
   // Alle Priority-Buttons finden
   const field = clickedButton.closest(".add-task__priority-field");
   const allButtons = field.querySelectorAll(".add-task__priority-option");
   
   // Entferne active-Klasse von allen
   allButtons.forEach(btn => btn.classList.remove("add-task__priority-option--active"));
   
   // Füge active-Klasse zum geklickten Button hinzu
   clickedButton.classList.add("add-task__priority-option--active");
}

// Priority-Feld initialisieren
function initPriorityField() {
   const priorityField = document.getElementById("addTaskPriority");
   if (!priorityField) return;
   
   priorityField.addEventListener("click", handlePriorityClick);
}

// ===== CATEGORY SELECT =====

function getCategoryElements() {
   const select = document.getElementById("addTaskCategory");
   return {
      select,
      menu: document.getElementById("addTaskCategoryMenu"),
      input: document.getElementById("addTaskCategoryInput"),
      valueLabel: document.querySelector("#addTaskCategory .add-task__select-value"),
      selectionGroup: select?.closest(".add-task__selection-group")
   };
}

function isCategoryReady(elements) {
   return elements.select && elements.menu && elements.input && elements.valueLabel;
}

function setCategoryOpenState(elements, isOpen) {
   if (!elements.selectionGroup) return;
   elements.selectionGroup.classList.toggle("add-task__selection-group--category-open", isOpen);
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

function setCategoryValue(option, elements) {
   const label = option.textContent.trim();
   const value = option.dataset.value || label;
   elements.input.value = value;
   elements.valueLabel.textContent = label;
   elements.input.dispatchEvent(new Event("input", { bubbles: true }));
   closeCategoryMenu(elements);
}

function handleCategorySelectClick(event, elements) {
   event.stopPropagation();
   toggleCategoryMenu(elements);
}

function handleCategoryOptionClick(event, elements) {
   event.stopPropagation();
   const option = event.target.closest(".add-task__select-option");
   if (!option) return;
   setCategoryValue(option, elements);
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

// Alle Textareas mit Resize-Handle initialisieren
function initTextareaResize() {
   const allTextareaWrappers = document.querySelectorAll(".add-task__input-field--textarea");
   allTextareaWrappers.forEach(setupTextareaResizeHandle);
}

// ===== INIT =====

document.addEventListener("DOMContentLoaded", () => {
   initDatePicker();
   initFormValidation();
   initPriorityField();
   initCategorySelect();
   initTextareaResize();
});
