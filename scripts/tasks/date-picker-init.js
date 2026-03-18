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
 * Creates the picker state.
 * @returns {object} The picker state object.
 */
function createPickerState() {
   const today = getTodayAtMidnight();
   return { today, currentDate: new Date(today), selectedDate: new Date(today) };
}
