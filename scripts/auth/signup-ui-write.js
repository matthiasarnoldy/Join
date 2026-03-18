/**
 * Returns the empty signup fields.
 * @returns {object} The empty signup fields object.
 */
function emptySignupFields() {
    return {
        form: null,
        nameInput: null,
        emailInput: null,
        passwordInput: null,
        confirmPasswordInput: null,
        errorElements: {},
        privacyError: null,
    };
}


/**
 * Resets the signup error element.
 *
 * @param {HTMLElement|null} element - The element.
 * @returns {void} Nothing.
 */
function resetSignupErrorElement(element) {
    if (!element) return;
    element.textContent = element.dataset.defaultMessage || "";
    element.style.display = "block";
    element.style.opacity = "0";
}


/**
 * Resets the signup error elements.
 *
 * @param {object} fields - The fields object.
 * @returns {void} Nothing.
 */
function resetSignupErrorElements(fields) {
    Object.values(fields.errorElements || {}).forEach(resetSignupErrorElement);
    resetSignupErrorElement(fields.privacyError);
}


/**
 * Shows the signup field error.
 *
 * @param {HTMLElement|null} input - The input.
 * @param {HTMLElement|null} errorElement - The error element.
 * @param {string} message - The message.
 * @returns {void} Nothing.
 */
function showSignupFieldError(input, errorElement, message) {
    input?.classList.add("login__input--error");
    if (!errorElement) return;
    errorElement.textContent = message;
    errorElement.style.display = "block";
    errorElement.style.opacity = "1";
}


/**
 * Clears the signup input errors.
 *
 * @param {object} fields - The fields object.
 * @returns {void} Nothing.
 */
function clearSignupInputErrors(fields) {
    fields.nameInput?.classList.remove("login__input--error");
    fields.emailInput?.classList.remove("login__input--error");
    fields.passwordInput?.classList.remove("login__input--error");
    fields.confirmPasswordInput?.classList.remove("login__input--error");
    resetSignupErrorElements(fields);
}


/**
 * Marks the required signup inputs.
 *
 * @param {object} fields - The fields object.
 * @param {object} values - The values object.
 * @returns {void} Nothing.
 */
function markRequiredSignupInputs(fields, values) {
    if (!values?.name) showSignupFieldError(fields.nameInput, fields.errorElements?.name, "This field is required");
    if (!values?.email) showSignupFieldError(fields.emailInput, fields.errorElements?.email, "This field is required");
    if (!values?.password) showSignupFieldError(fields.passwordInput, fields.errorElements?.password, "This field is required");
    if (!values?.confirmPassword) showSignupFieldError(fields.confirmPasswordInput, fields.errorElements?.confirmPassword, "This field is required");
}


/**
 * Applies the signup input error styles.
 *
 * @param {object} fields - The fields object.
 * @param {string} message - The message.
 * @param {object} values - The values object.
 * @returns {void} Nothing.
 */
function applySignupInputErrorStyles(fields, message, values) {
    clearSignupInputErrors(fields);
    if (message === "These fields are required") return markRequiredSignupInputs(fields, values);
    if (message === "Please enter a valid email address.") return showSignupFieldError(fields.emailInput, fields.errorElements?.email, message);
    if (message === "This email is already registered.") return showSignupFieldError(fields.emailInput, fields.errorElements?.email, message);
    if (message === "Your passwords don't match. Please try again.") return showSignupFieldError(fields.confirmPasswordInput, fields.errorElements?.confirmPassword, message);
    if (message === "Please accept the Privacy Policy.") return showSignupFieldError(null, fields.privacyError, message);
}


/**
 * Shows the signup error.
 *
 * @param {string} message - The message.
 * @param {object} values - The values object.
 * @returns {void} Nothing.
 */
function showSignupError(message, values) {
    const fields = getSignupFields();
    applySignupInputErrorStyles(fields, message, values);
}


/**
 * Hides the signup error.
 * @returns {void} Nothing.
 */
function hideSignupError() {
    const fields = getSignupFields();
    clearSignupInputErrors(fields);
}


/**
 * Sets the signup button state.
 *
 * @param {HTMLElement|null} button - The button.
 * @param {boolean} isEnabled - Whether it is enabled.
 * @returns {void} Nothing.
 */
function setSignupButtonState(button, isEnabled) {
    if (!button) return;
    button.disabled = false;
    button.setAttribute("aria-disabled", String(!isEnabled));
    button.classList.toggle("is-disabled", !isEnabled);
}


/**
 * Schedules the summary redirect.
 *
 * @param {string|number} userId - The user ID used for this operation.
 * @returns {void} Nothing.
 */
function scheduleSummaryRedirect(userId) {
    setTimeout(() => redirectToSummary(userId), 1000);
}


/**
 * Creates the signup message.
 * @returns {HTMLDivElement} The signup message element.
 */
function createSignupMessage() {
    const messageDiv = document.createElement("div");
    messageDiv.className = "signup-success-message";
    const messageText = document.createElement("span");
    messageText.textContent = "You signed up successfully";
    messageDiv.appendChild(messageText);
    return messageDiv;
}


/**
 * Shows the signup success.
 * @returns {void} Nothing.
 */
function showSignupSuccess() {
    const message = createSignupMessage();
    document.body.appendChild(message);
    requestAnimationFrame(() => {
        message.classList.add("signup-success-message--visible");
    });
    setTimeout(() => message.remove(), 1000);
}
