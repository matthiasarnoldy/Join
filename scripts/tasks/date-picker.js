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
