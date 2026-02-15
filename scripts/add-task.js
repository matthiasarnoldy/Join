// ===== DATE PICKER =====

const MONTHS = [
   "Januar",
   "Februar",
   "März",
   "April",
   "Mai",
   "Juni",
   "Juli",
   "August",
   "September",
   "Oktober",
   "November",
   "Dezember",
];

const pad2 = (value) => String(value).padStart(2, "0");

const formatDate = (date) => `${pad2(date.getDate())}.${pad2(date.getMonth() + 1)}.${date.getFullYear()}`;

const formatISO = (date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const sameDate = (a, b) =>
   a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const todayMidnight = () => {
   const now = new Date();
   return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const getPickerRefs = () => ({
   picker: document.getElementById("datePicker"),
   input: document.getElementById("addTaskDate"),
   panel: document.getElementById("datePickerPanel"),
   monthLabel: document.getElementById("datePickerMonth"),
   days: document.getElementById("datePickerDays"),
});

const hasRefs = (refs) => Object.values(refs).every(Boolean);

const setPanelOpen = (panel, isOpen) => {
   panel.classList.toggle("date-picker__panel--open", isOpen);
   panel.setAttribute("aria-hidden", String(!isOpen));
};

const emptyDayButton = () => {
   const button = document.createElement("button");
   button.type = "button";
   button.className = "date-picker__day date-picker__day--empty";
   button.setAttribute("aria-hidden", "true");
   return button;
};

const applyDayClasses = (state, date, button) => {
   if (sameDate(date, state.today)) button.classList.add("date-picker__day--today");
   if (date < state.today) {
      button.disabled = true;
      button.classList.add("date-picker__day--disabled");
   }
   if (sameDate(date, state.selectedDate)) button.classList.add("date-picker__day--selected");
};

const createDayButton = (state, date) => {
   const button = document.createElement("button");
   button.type = "button";
   button.className = "date-picker__day";
   button.textContent = String(date.getDate());
   button.dataset.date = formatISO(date);
   applyDayClasses(state, date, button);
   return button;
};

const monthInfo = (date) => {
   const year = date.getFullYear();
   const month = date.getMonth();
   const firstDay = new Date(year, month, 1);
   return {
      year,
      month,
      startIndex: (firstDay.getDay() + 6) % 7,
      daysInMonth: new Date(year, month + 1, 0).getDate(),
   };
};

const renderCalendar = (state) => {
   const info = monthInfo(state.currentDate);
   state.monthLabel.textContent = `${MONTHS[info.month]} ${info.year}`;
   state.days.innerHTML = "";
   for (let i = 0; i < info.startIndex; i += 1) state.days.appendChild(emptyDayButton());
   for (let day = 1; day <= info.daysInMonth; day += 1) {
      state.days.appendChild(createDayButton(state, new Date(info.year, info.month, day)));
   }
};

const togglePanel = (state) => {
   const isOpen = state.panel.classList.contains("date-picker__panel--open");
   setPanelOpen(state.panel, !isOpen);
};

const handleNavClick = (target, state) => {
   const navButton = target.closest(".date-picker__nav");
   if (!navButton) return false;
   const delta = navButton.dataset.action === "prev" ? -1 : 1;
   state.currentDate = new Date(state.currentDate.getFullYear(), state.currentDate.getMonth() + delta, 1);
   renderCalendar(state);
   return true;
};

const handleDayClick = (target, state) => {
   const dayButton = target.closest(".date-picker__day[data-date]");
   if (!dayButton || dayButton.disabled) return;
   const [year, month, day] = dayButton.dataset.date.split("-").map(Number);
   state.selectedDate = new Date(year, month - 1, day);
   state.input.value = formatDate(state.selectedDate);
   state.input.dispatchEvent(new Event("input", { bubbles: true }));
   renderCalendar(state);
   setPanelOpen(state.panel, false);
};

const handlePickerClick = (event, state) => {
   event.stopPropagation();
   const target = event.target;
   if (target.closest(".date-picker__toggle") || target === state.input) return togglePanel(state);
   if (handleNavClick(target, state)) return;
   handleDayClick(target, state);
};

const bindPickerEvents = (state) => {
   state.picker.addEventListener("click", (event) => handlePickerClick(event, state));
   document.addEventListener("click", () => setPanelOpen(state.panel, false));
};

const initDatePicker = () => {
   const refs = getPickerRefs();
   if (!hasRefs(refs)) return;
   const state = {
      ...refs,
      today: todayMidnight(),
      currentDate: todayMidnight(),
      selectedDate: todayMidnight(),
   };
   bindPickerEvents(state);
   renderCalendar(state);
};

// ===== FORM VALIDATION =====

const requiredFields = (container) => Array.from(container.querySelectorAll(".add-task__input-field--required"));

const fieldInput = (field) => field.querySelector("input, textarea, select");

const fieldValid = (field) => {
   const input = fieldInput(field);
   return input && input.value.trim() !== "";
};

const updateButton = (fields, button) => {
   const allValid = fields.every(fieldValid);
   button.classList.toggle("is-disabled", !allValid);
   button.setAttribute("aria-disabled", String(!allValid));
};

const showErrors = (fields) => {
   fields.forEach((field) => field.classList.toggle("add-task__input-field--error", !fieldValid(field)));
};

const bindFieldInputs = (fields, button) => {
   fields.forEach((field) => {
      const input = fieldInput(field);
      if (!input) return;
      input.addEventListener("input", () => {
         field.classList.remove("add-task__input-field--error");
         updateButton(fields, button);
      });
   });
};

const bindCreateButton = (button) => {
   const fields = requiredFields(button.closest("form") || document);
   if (fields.length === 0) return;
   updateButton(fields, button);
   bindFieldInputs(fields, button);
   button.addEventListener("click", (event) => {
      if (fields.every(fieldValid)) return;
      event.preventDefault();
      showErrors(fields);
   });
};

const initFormValidation = () => {
   document.querySelectorAll(".add-task__button--create").forEach(bindCreateButton);
};

// ===== TEXTAREA RESIZE =====

const parsePx = (value) => Number.parseFloat(value) || 0;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const getHeightLimits = (textarea) => {
   const styles = getComputedStyle(textarea);
   const min = parsePx(styles.minHeight) || 48;
   const max = parsePx(styles.maxHeight) || 10000;
   return { min, max };
};

const startResize = (event, textarea) => {
   event.preventDefault();
   const { min, max } = getHeightLimits(textarea);
   const startY = event.clientY;
   const startHeight = textarea.offsetHeight;
   const onMove = (e) => {
      textarea.style.height = `${clamp(startHeight + e.clientY - startY, min, max)}px`;
   };
   const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
   document.addEventListener("mousemove", onMove);
   document.addEventListener("mouseup", onUp);
};

const bindTextareaResize = (wrapper) => {
   const textarea = wrapper.querySelector("textarea");
   const handle = wrapper.querySelector(".add-task__textarea-resize");
   if (!textarea || !handle) return;
   handle.style.pointerEvents = "auto";
   handle.addEventListener("mousedown", (event) => startResize(event, textarea));
};

const initTextareaResize = () => {
   document.querySelectorAll(".add-task__input-field--textarea").forEach(bindTextareaResize);
};

// ===== INIT =====

document.addEventListener("DOMContentLoaded", () => {
   initDatePicker();
   initFormValidation();
   initTextareaResize();
});
