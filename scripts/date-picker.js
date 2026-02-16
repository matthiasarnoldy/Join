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
