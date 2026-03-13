/**
 * Returns the signup form.
 * @returns {HTMLFormElement|null} The signup form element, or null when it is not available.
 */
function getSignupForm() {
    return document.querySelector(".main-content--signup .login__formular");
}


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
        errorElement: null,
    };
}


/**
 * Maps the signup fields.
 *
 * @param {HTMLFormElement|null} signupForm - The signup form.
 * @returns {object} The signup fields object.
 */
function mapSignupFields(signupForm) {
    return {
        form: signupForm,
        nameInput: signupForm.querySelector("input[type='text']"),
        emailInput: signupForm.querySelector("input[type='email']"),
        passwordInput: signupForm.querySelector("#password-input"),
        confirmPasswordInput: signupForm.querySelector("#confirm-password-input"),
        errorElement: signupForm.querySelector(".login__input--required"),
    };
}


/**
 * Returns the signup fields.
 * @returns {object} The signup fields object.
 */
function getSignupFields() {
    const signupForm = getSignupForm();
    if (!signupForm) return emptySignupFields();
    return mapSignupFields(signupForm);
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
}


/**
 * Marks the required signup inputs.
 *
 * @param {object} fields - The fields object.
 * @param {object} values - The values object.
 * @returns {void} Nothing.
 */
function markRequiredSignupInputs(fields, values) {
    if (!values?.name) fields.nameInput?.classList.add("login__input--error");
    if (!values?.email) fields.emailInput?.classList.add("login__input--error");
    if (!values?.password) fields.passwordInput?.classList.add("login__input--error");
    if (!values?.confirmPassword) fields.confirmPasswordInput?.classList.add("login__input--error");
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
    if (message === "Please enter a valid email address.") return fields.emailInput?.classList.add("login__input--error");
    if (message === "This email is already registered.") return fields.emailInput?.classList.add("login__input--error");
    if (message === "Your passwords don't match. Please try again.") return fields.confirmPasswordInput?.classList.add("login__input--error");
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
    const { errorElement } = fields;
    if (!errorElement) return;
    errorElement.textContent = message;
    errorElement.style.display = "block";
    errorElement.style.opacity = "1";
    applySignupInputErrorStyles(fields, message, values);
}


/**
 * Hides the signup error.
 * @returns {void} Nothing.
 */
function hideSignupError() {
    const fields = getSignupFields();
    const { errorElement } = fields;
    if (!errorElement) return;
    errorElement.style.display = "block";
    errorElement.style.opacity = "0";
    clearSignupInputErrors(fields);
}


/**
 * Checks whether the signup fields are ready.
 *
 * @param {object} fields - The fields object.
 * @returns {boolean} Whether the signup fields are ready.
 */
function areSignupFieldsReady(fields) {
    return fields.nameInput && fields.emailInput && fields.passwordInput && fields.confirmPasswordInput;
}


/**
 * Reads the signup values.
 *
 * @param {object} fields - The fields object.
 * @returns {object} The signup values object.
 */
function readSignupValues(fields) {
    return {
        name: fields.nameInput.value.trim(),
        email: fields.emailInput.value.trim().toLowerCase(),
        password: fields.passwordInput.value,
        confirmPassword: fields.confirmPasswordInput.value,
    };
}


/**
 * Checks whether there are missing signup values.
 *
 * @param {object} values - The values object.
 * @returns {boolean} Whether there are missing signup values.
 */
function hasMissingSignupValues(values) {
    return !values.name || !values.email || !values.password || !values.confirmPassword;
}


/**
 * Returns the signup validation error.
 *
 * @param {object} values - The values object.
 * @returns {string} The signup validation error.
 */
function getSignupValidationError(values) {
    if (hasMissingSignupValues(values)) return "These fields are required";
    if (!isValidEmailAddress(values.email)) return "Please enter a valid email address.";
    if (values.password !== values.confirmPassword) return "Your passwords don't match. Please try again.";
    return "";
}


/**
 * Checks whether the privacy policy is accepted.
 * @returns {boolean} Whether the privacy policy is accepted.
 */
function isPrivacyPolicyAccepted() {
    const checkbox = document.getElementById("privacy-policy");
    return Boolean(checkbox?.checked);
}


/**
 * Builds the signup payload.
 * @returns {object|null} The signup payload object, or null when it is not available.
 */
function buildSignupPayload() {
    const fields = getSignupFields();
    if (!areSignupFieldsReady(fields)) {
        showSignupError("Signup form is incomplete.");
        return null;
    }
    const values = readSignupValues(fields);
    const validationError = getSignupValidationError(values);
    if (validationError) return showSignupError(validationError, values), null;
    if (!isPrivacyPolicyAccepted()) {
        showSignupError("Please accept the Privacy Policy.", values);
        return null;
    }
    hideSignupError();
    return { name: values.name, email: values.email, password: values.password };
}


/**
 * Generates the initial from name.
 *
 * @param {string} name - The name.
 * @returns {string} The initial from name.
 */
function generateInitialFromName(name) {
    const trimmedName = name.trim();
    if (!trimmedName) return "?";
    const nameParts = trimmedName.split(/\s+/).filter(Boolean);
    const firstInitial = nameParts[0].charAt(0).toUpperCase();
    const secondLetter = nameParts[0].charAt(1).toUpperCase();
    const lastInitial =
        nameParts.length > 1
            ? nameParts[nameParts.length - 1].charAt(0).toUpperCase()
            : secondLetter || firstInitial;
    return `${firstInitial}${lastInitial}`;
}


/**
 * Builds the user payload.
 *
 * @param {object} newUser - The new user object.
 * @returns {object} The user payload object.
 */
function buildUserPayload(newUser) {
    return {
        name: newUser.name,
        email: newUser.email,
        initial: generateInitialFromName(newUser.name),
        password: newUser.password,
        createdAt: formatGermanTimestamp(new Date()),
    };
}


/**
 * Creates the user in database.
 *
 * @param {object} newUser - The new user object.
 * @returns {Promise<string>} A promise that resolves to the user in database.
 */
async function createUserInDatabase(newUser) {
    const response = await fetch(`${getAuthBaseUrl()}users.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildUserPayload(newUser)),
    });
    if (!response.ok) throw new Error(`Failed creating user: HTTP ${response.status}`);
    const data = await response.json();
    return String(data?.name || "");
}


/**
 * Returns the signup validation elements.
 * @returns {object} The signup validation elements object.
 */
function getSignupValidationElements() {
    return {
        signupForm: document.querySelector(".login__formular"),
        signupSubmitButton: document.getElementById("login-button"),
        privacyCheckbox: document.getElementById("privacy-policy"),
    };
}


/**
 * Checks whether the signup validation elements are ready.
 *
 * @param {object} elements - The elements object.
 * @returns {boolean} Whether the signup validation elements are ready.
 */
function areSignupValidationElementsReady(elements) {
    return elements.signupForm && elements.signupSubmitButton && elements.privacyCheckbox;
}


/**
 * Binds the signup validation.
 *
 * @param {NodeListOf<Element>|Array<Element>} inputs - The inputs collection.
 * @param {HTMLInputElement|null} privacyCheckbox - The privacy checkbox.
 * @param {HTMLElement|null} signupSubmitButton - The signup submit button.
 * @returns {void} Nothing.
 */
function bindSignupValidation(inputs, privacyCheckbox, signupSubmitButton) {
    const updateButtonState = () => checkFormValidity(inputs, privacyCheckbox, signupSubmitButton);
    setSignupButtonState(signupSubmitButton, false);
    inputs.forEach((input) => input.addEventListener("input", updateButtonState));
    privacyCheckbox.addEventListener("change", updateButtonState);
}


/**
 * Sets up the signup form validation.
 * @returns {void} Nothing.
 */
function setupSignupFormValidation() {
    const elements = getSignupValidationElements();
    if (!areSignupValidationElementsReady(elements)) return;
    const inputs = elements.signupForm.querySelectorAll("input[type='text'], input[type='email'], input[type='password']");
    bindSignupValidation(inputs, elements.privacyCheckbox, elements.signupSubmitButton);
}


/**
 * Checks the form validity.
 *
 * @param {NodeListOf<Element>|Array<Element>} inputs - The inputs collection.
 * @param {HTMLElement|null} checkbox - The checkbox.
 * @param {HTMLElement|null} button - The button.
 * @returns {void} Nothing.
 */
function checkFormValidity(inputs, checkbox, button) {
    const allInputsFilled = Array.from(inputs).every((input) => input.value.trim() !== "");
    setSignupButtonState(button, allInputsFilled && checkbox.checked);
}


/**
 * Sets the signup button state.
 *
 * @param {HTMLElement|null} button - The button.
 * @param {boolean} isEnabled - Whether it is enabled.
 * @returns {void} Nothing.
 */
function setSignupButtonState(button, isEnabled) {
    button.disabled = false;
    button.setAttribute("aria-disabled", String(!isEnabled));
    button.classList.toggle("is-disabled", !isEnabled);
}


/**
 * Binds the signup button.
 *
 * @param {HTMLElement|null} loginButton - The login button.
 * @returns {void} Nothing.
 */
function bindSignupButton(loginButton) {
    loginButton.addEventListener("click", (event) => {
        event.preventDefault();
        handleSignup(loginButton);
    });
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
 * Registers the signup user.
 *
 * @param {object} payload - The payload object.
 * @returns {Promise<string>} A promise that resolves to the signup user.
 */
async function registerSignupUser(payload) {
    const users = await getUsersFromDatabase();
    if (isEmailAlreadyRegistered(users, payload.email)) {
        showSignupError("This email is already registered.");
        return "";
    }
    return createUserInDatabase(payload);
}


/**
 * Handles the signup.
 *
 * @param {HTMLElement|null} signupButton - The signup button.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
async function handleSignup(signupButton) {
    const payload = buildSignupPayload();
    if (!payload) return;
    try {
        setButtonDisabled(signupButton, true);
        const createdUserId = await registerSignupUser(payload);
        if (!createdUserId) return;
        showSignupSuccess();
        scheduleSummaryRedirect(createdUserId);
    } catch (error) {
        console.error("Signup failed:", error);
        showSignupError("Signup failed. Please try again.");
    } finally {
        setButtonDisabled(signupButton, false);
    }
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
