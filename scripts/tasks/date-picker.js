const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

/**
 * Returns the two digits.
 *
 * @param {*} number - The number.
 * @returns {string} The two digits.
 */
function twoDigits(number) {
   return String(number).padStart(2, "0");
}


/**
 * Formats the german date.
 *
 * @param {string} date - The date.
 * @returns {string} The german date.
 */
function formatGermanDate(date) {
   const day = twoDigits(date.getDate());
   const month = twoDigits(date.getMonth() + 1);
   const year = date.getFullYear();
   return `${day}/${month}/${year}`;
}


/**
 * Formats the isodate.
 *
 * @param {string} date - The date.
 * @returns {string} The isodate.
 */
function formatISODate(date) {
   const year = date.getFullYear();
   const month = twoDigits(date.getMonth() + 1);
   const day = twoDigits(date.getDate());
   return `${year}-${month}-${day}`;
}


/**
 * Checks whether the day are same.
 *
 * @param {string} dateToCheck - The date to check.
 * @param {string} targetDate - The target date.
 * @returns {boolean} Whether the day are same.
 */
function areSameDay(dateToCheck, targetDate) {
   if (!dateToCheck || !targetDate) return false;
   return dateToCheck.getFullYear() === targetDate.getFullYear() && 
          dateToCheck.getMonth() === targetDate.getMonth() && 
          dateToCheck.getDate() === targetDate.getDate();
}


/**
 * Returns the today at midnight.
 * @returns {number} The today at midnight value.
 */
function getTodayAtMidnight() {
   const now = new Date();
   return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}


/**
 * Disables the if past day.
 *
 * @param {HTMLElement|null} button - The button.
 * @param {string} date - The date.
 * @param {number} today - The today.
 * @returns {void} Nothing.
 */
function disableIfPastDay(button, date, today) {
   if (date >= today) return;
   button.disabled = true;
   button.classList.add("date-picker__day--disabled");
}


/**
 * Draws the calendar.
 *
 * @param {object} currentDate - The current date object.
 * @param {number} today - The today.
 * @param {HTMLElement|null} selectedDate - The selected date.
 * @param {number} monthLabel - The month label.
 * @param {number} daysContainer - The days container.
 * @returns {void} Nothing.
 */
function drawCalendar(currentDate, today, selectedDate, monthLabel, daysContainer) {
   const year = currentDate.getFullYear();
   const month = currentDate.getMonth();
   updateMonthLabel(currentDate, monthLabel);
   daysContainer.innerHTML = "";
   addEmptyDays(year, month, daysContainer);
   addMonthDays(year, month, today, selectedDate, daysContainer);
}


/**
 * Returns the selected or today.
 *
 * @param {object} pickerState - The picker state object.
 * @returns {*} The selected or today result.
 */
function getSelectedOrToday(pickerState) {
   if (pickerState.selectedDate) return pickerState.selectedDate;
   return pickerState.today;
}


/**
 * Handles the nav click.
 *
 * @param {HTMLElement|null} navButton - The nav button.
 * @param {object} pickerState - The picker state object.
 * @param {number} monthLabel - The month label.
 * @param {number} daysContainer - The days container.
 * @returns {void} Nothing.
 */
function handleNavClick(navButton, pickerState, monthLabel, daysContainer) {
   const direction = navButton.dataset.action === "prev" ? -1 : 1;
   pickerState.currentDate = new Date(pickerState.currentDate.getFullYear(), pickerState.currentDate.getMonth() + direction, 1);
   drawCalendar(pickerState.currentDate, pickerState.today, pickerState.selectedDate, monthLabel, daysContainer);
}


/**
 * Returns the date picker elements.
 * @returns {object} The date picker elements object.
 */
function getDatePickerElements() {
   return {
      picker: document.getElementById("datePicker"),
      input: document.getElementById("addTaskDate"),
      panel: document.getElementById("datePickerPanel"),
      monthLabel: document.getElementById("datePickerMonth"),
      daysContainer: document.getElementById("datePickerDays")
   };
}


/**
 * Checks whether the ready is picker.
 *
 * @param {object} elements - The elements object.
 * @returns {boolean} Whether the ready is picker.
 */
function isPickerReady(elements) {
   return elements.picker && elements.input && elements.panel && elements.monthLabel && elements.daysContainer;
}


/**
 * Initializes the calendar.
 *
 * @param {object} pickerState - The picker state object.
 * @param {number} monthLabel - The month label.
 * @param {number} daysContainer - The days container.
 * @returns {void} Nothing.
 */
function initializeCalendar(pickerState, monthLabel, daysContainer) {
   drawCalendar(pickerState.currentDate, pickerState.today, pickerState.selectedDate, monthLabel, daysContainer);
}


/**
 * Handles the nav hit.
 *
 * @param {*} clicked - The clicked.
 * @param {object} elements - The elements object.
 * @param {object} pickerState - The picker state object.
 * @returns {boolean} Whether the nav hit.
 */
function handleNavHit(clicked, elements, pickerState) {
   const navButton = clicked.closest(".date-picker__nav");
   if (!navButton) return false;
   handleNavClick(navButton, pickerState, elements.monthLabel, elements.daysContainer);
   return true;
}


/**
 * Sets up the picker events.
 *
 * @param {object} elements - The elements object.
 * @param {object} pickerState - The picker state object.
 * @returns {void} Nothing.
 */
function setupPickerEvents(elements, pickerState) {
   elements.picker.addEventListener("click", (event) => handlePickerClick(event, elements, pickerState));
   document.addEventListener("click", () => closeCalendar(elements.panel));
}


/**
 * Initializes the date picker.
 * @returns {void} Nothing.
 */
function initDatePicker() {
   const elements = getDatePickerElements();
   if (!isPickerReady(elements)) return;
   const pickerState = createPickerState();
   initializeCalendar(pickerState, elements.monthLabel, elements.daysContainer);
   // Reset selected date when input is cleared so previously selected day is not shown
   elements.input.addEventListener("input", () => {
      if (!elements.input.value || elements.input.value.trim() === "") {
         pickerState.selectedDate = null;
         drawCalendar(pickerState.currentDate, pickerState.today, pickerState.selectedDate, elements.monthLabel, elements.daysContainer);
      }
   });
   setupPickerEvents(elements, pickerState);
}


/**
 * Opens the calendar.
 *
 * @param {HTMLElement|null} panel - The panel.
 * @returns {void} Nothing.
 */
function openCalendar(panel) {
   panel.classList.add("date-picker__panel--open");
   panel.setAttribute("aria-hidden", "false");
}


/**
 * Closes the calendar.
 *
 * @param {HTMLElement|null} panel - The panel.
 * @returns {void} Nothing.
 */
function closeCalendar(panel) {
   panel.classList.remove("date-picker__panel--open");
   panel.setAttribute("aria-hidden", "true");
}


/**
 * Creates the empty day button.
 * @returns {HTMLButtonElement} The empty day button element.
 */
function createEmptyDayButton() {
   const button = document.createElement("button");
   button.type = "button";
   button.className = "date-picker__day date-picker__day--empty";
   button.setAttribute("aria-hidden", "true");
   return button;
}


/**
 * Marks the today if needed.
 *
 * @param {HTMLElement|null} button - The button.
 * @param {string} date - The date.
 * @param {number} today - The today.
 * @returns {void} Nothing.
 */
function markTodayIfNeeded(button, date, today) {
   if (!areSameDay(date, today)) return;
   button.classList.add("date-picker__day--today");
}


/**
 * Marks the selected if needed.
 *
 * @param {HTMLElement|null} button - The button.
 * @param {string} date - The date.
 * @param {HTMLElement|null} selectedDate - The selected date.
 * @returns {void} Nothing.
 */
function markSelectedIfNeeded(button, date, selectedDate) {
   if (!areSameDay(date, selectedDate)) return;
   button.classList.add("date-picker__day--selected");
}


/**
 * Creates the day button.
 *
 * @param {string} date - The date.
 * @param {number} today - The today.
 * @param {HTMLElement|null} selectedDate - The selected date.
 * @returns {HTMLButtonElement} The day button element.
 */
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


/**
 * Updates the month label.
 *
 * @param {object} currentDate - The current date object.
 * @param {number} monthLabel - The month label.
 * @returns {void} Nothing.
 */
function updateMonthLabel(currentDate, monthLabel) {
   const year = currentDate.getFullYear();
   const month = currentDate.getMonth();
   monthLabel.textContent = `${MONTHS[month]} ${year}`;
}


/**
 * Adds the empty days.
 *
 * @param {number} year - The year.
 * @param {number} month - The month.
 * @param {number} daysContainer - The days container.
 * @returns {void} Nothing.
 */
function addEmptyDays(year, month, daysContainer) {
   const firstDayOfMonth = new Date(year, month, 1);
   const firstWeekday = (firstDayOfMonth.getDay() + 6) % 7;
   for (let i = 0; i < firstWeekday; i++) {
      daysContainer.appendChild(createEmptyDayButton());
   }
}


/**
 * Adds the month days.
 *
 * @param {number} year - The year.
 * @param {number} month - The month.
 * @param {number} today - The today.
 * @param {HTMLElement|null} selectedDate - The selected date.
 * @param {number} daysContainer - The days container.
 * @returns {void} Nothing.
 */
function addMonthDays(year, month, today, selectedDate, daysContainer) {
   const lastDayOfMonth = new Date(year, month + 1, 0);
   const totalDays = lastDayOfMonth.getDate();
   for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      const dayButton = createDayButton(date, today, selectedDate);
      daysContainer.appendChild(dayButton);
   }
}


/**
 * Sets the calendar to selected.
 *
 * @param {object} pickerState - The picker state object.
 * @param {number} monthLabel - The month label.
 * @param {number} daysContainer - The days container.
 * @returns {void} Nothing.
 */
function setCalendarToSelected(pickerState, monthLabel, daysContainer) {
   const baseDate = getSelectedOrToday(pickerState);
   pickerState.currentDate = new Date(baseDate);
   drawCalendar(pickerState.currentDate, pickerState.today, pickerState.selectedDate, monthLabel, daysContainer);
}


/**
 * Handles toggleing the click.
 *
 * @param {HTMLElement|null} panel - The panel.
 * @param {object} pickerState - The picker state object.
 * @param {number} monthLabel - The month label.
 * @param {number} daysContainer - The days container.
 * @returns {void} Nothing.
 */
function handleToggleClick(panel, pickerState, monthLabel, daysContainer) {
   if (panel.classList.contains("date-picker__panel--open")) {
      closeCalendar(panel);
      return;
   }
   setCalendarToSelected(pickerState, monthLabel, daysContainer);
   openCalendar(panel);
}


/**
 * Handles the day click.
 *
 * @param {number} dayButton - The day button.
 * @param {object} pickerState - The picker state object.
 * @param {HTMLElement|null} input - The input.
 * @param {number} monthLabel - The month label.
 * @param {number} daysContainer - The days container.
 * @param {HTMLElement|null} panel - The panel.
 * @returns {void} Nothing.
 */
function handleDayClick(dayButton, pickerState, input, monthLabel, daysContainer, panel) {
   const [year, month, day] = dayButton.dataset.date.split("-").map(Number);
   pickerState.selectedDate = new Date(year, month - 1, day);
   input.value = formatGermanDate(pickerState.selectedDate);
   input.dispatchEvent(new Event("input", { bubbles: true }));
   drawCalendar(pickerState.currentDate, pickerState.today, pickerState.selectedDate, monthLabel, daysContainer);
   closeCalendar(panel);
}


/**
 * Creates the picker state.
 * @returns {object} The picker state object.
 */
function createPickerState() {
   const today = getTodayAtMidnight();
   return { today, currentDate: new Date(today), selectedDate: new Date(today) };
}


/**
 * Handles toggleing the hit.
 *
 * @param {*} clicked - The clicked.
 * @param {object} elements - The elements object.
 * @param {object} pickerState - The picker state object.
 * @returns {boolean} Whether the toggle hit.
 */
function handleToggleHit(clicked, elements, pickerState) {
   if (!clicked.closest(".date-picker__toggle") && clicked !== elements.input) return false;
   handleToggleClick(elements.panel, pickerState, elements.monthLabel, elements.daysContainer);
   return true;
}


/**
 * Handles the day hit.
 *
 * @param {*} clicked - The clicked.
 * @param {object} elements - The elements object.
 * @param {object} pickerState - The picker state object.
 * @returns {void} Nothing.
 */
function handleDayHit(clicked, elements, pickerState) {
   const dayButton = clicked.closest(".date-picker__day[data-date]");
   if (!dayButton || dayButton.disabled) return;
   handleDayClick(dayButton, pickerState, elements.input, elements.monthLabel, elements.daysContainer, elements.panel);
}


/**
 * Handles the picker click.
 *
 * @param {Event} event - The event object that triggered the handler.
 * @param {object} elements - The elements object.
 * @param {object} pickerState - The picker state object.
 * @returns {void} Nothing.
 */
function handlePickerClick(event, elements, pickerState) {
   event.stopPropagation();
   const clicked = event.target;
   if (handleToggleHit(clicked, elements, pickerState)) return;
   if (handleNavHit(clicked, elements, pickerState)) return;
   handleDayHit(clicked, elements, pickerState);
}
