function getSignupForm() {
    return document.querySelector(".main-content--signup .login__formular");
}

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

function getSignupFields() {
    const signupForm = getSignupForm();
    if (!signupForm) return emptySignupFields();
    return mapSignupFields(signupForm);
}

function clearSignupInputErrors(fields) {
    fields.nameInput?.classList.remove("login__input--error");
    fields.emailInput?.classList.remove("login__input--error");
    fields.passwordInput?.classList.remove("login__input--error");
    fields.confirmPasswordInput?.classList.remove("login__input--error");
}

function markRequiredSignupInputs(fields, values) {
    if (!values?.name) fields.nameInput?.classList.add("login__input--error");
    if (!values?.email) fields.emailInput?.classList.add("login__input--error");
    if (!values?.password) fields.passwordInput?.classList.add("login__input--error");
    if (!values?.confirmPassword) fields.confirmPasswordInput?.classList.add("login__input--error");
}

function applySignupInputErrorStyles(fields, message, values) {
    clearSignupInputErrors(fields);
    if (message === "These fields are required") return markRequiredSignupInputs(fields, values);
    if (message === "Please enter a valid email address.") return fields.emailInput?.classList.add("login__input--error");
    if (message === "This email is already registered.") return fields.emailInput?.classList.add("login__input--error");
    if (message === "Your passwords don't match. Please try again.") return fields.confirmPasswordInput?.classList.add("login__input--error");
}

function showSignupError(message, values) {
    const fields = getSignupFields();
    const { errorElement } = fields;
    if (!errorElement) return;
    errorElement.textContent = message;
    errorElement.style.display = "block";
    errorElement.style.opacity = "1";
    applySignupInputErrorStyles(fields, message, values);
}

function hideSignupError() {
    const fields = getSignupFields();
    const { errorElement } = fields;
    if (!errorElement) return;
    errorElement.style.display = "block";
    errorElement.style.opacity = "0";
    clearSignupInputErrors(fields);
}

function areSignupFieldsReady(fields) {
    return fields.nameInput && fields.emailInput && fields.passwordInput && fields.confirmPasswordInput;
}

function readSignupValues(fields) {
    return {
        name: fields.nameInput.value.trim(),
        email: fields.emailInput.value.trim().toLowerCase(),
        password: fields.passwordInput.value,
        confirmPassword: fields.confirmPasswordInput.value,
    };
}

function hasMissingSignupValues(values) {
    return !values.name || !values.email || !values.password || !values.confirmPassword;
}

function getSignupValidationError(values) {
    if (hasMissingSignupValues(values)) return "These fields are required";
    if (!isValidEmailAddress(values.email)) return "Please enter a valid email address.";
    if (values.password !== values.confirmPassword) return "Your passwords don't match. Please try again.";
    return "";
}

function isPrivacyPolicyAccepted() {
    const checkbox = document.getElementById("privacy-policy");
    return Boolean(checkbox?.checked);
}

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

function buildUserPayload(newUser) {
    return {
        name: newUser.name,
        email: newUser.email,
        initial: generateInitialFromName(newUser.name),
        password: newUser.password,
        createdAt: formatGermanTimestamp(new Date()),
    };
}

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

function getSignupValidationElements() {
    return {
        signupForm: document.querySelector(".login__formular"),
        signupSubmitButton: document.getElementById("login-button"),
        privacyCheckbox: document.getElementById("privacy-policy"),
    };
}

function areSignupValidationElementsReady(elements) {
    return elements.signupForm && elements.signupSubmitButton && elements.privacyCheckbox;
}

function bindSignupValidation(inputs, privacyCheckbox, signupSubmitButton) {
    const updateButtonState = () => checkFormValidity(inputs, privacyCheckbox, signupSubmitButton);
    setSignupButtonState(signupSubmitButton, false);
    inputs.forEach((input) => input.addEventListener("input", updateButtonState));
    privacyCheckbox.addEventListener("change", updateButtonState);
}

function setupSignupFormValidation() {
    const elements = getSignupValidationElements();
    if (!areSignupValidationElementsReady(elements)) return;
    const inputs = elements.signupForm.querySelectorAll("input[type='text'], input[type='email'], input[type='password']");
    bindSignupValidation(inputs, elements.privacyCheckbox, elements.signupSubmitButton);
}

function checkFormValidity(inputs, checkbox, button) {
    const allInputsFilled = Array.from(inputs).every((input) => input.value.trim() !== "");
    setSignupButtonState(button, allInputsFilled && checkbox.checked);
}

function setSignupButtonState(button, isEnabled) {
    button.disabled = false;
    button.setAttribute("aria-disabled", String(!isEnabled));
    button.classList.toggle("is-disabled", !isEnabled);
}

function bindSignupButton(loginButton) {
    loginButton.addEventListener("click", (event) => {
        event.preventDefault();
        handleSignup(loginButton);
    });
}

function scheduleSummaryRedirect(userId) {
    setTimeout(() => redirectToSummary(userId), 1000);
}

async function registerSignupUser(payload) {
    const users = await getUsersFromDatabase();
    if (isEmailAlreadyRegistered(users, payload.email)) {
        showSignupError("This email is already registered.");
        return "";
    }
    return createUserInDatabase(payload);
}

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

function createSignupMessage() {
    const messageDiv = document.createElement("div");
    messageDiv.className = "signup-success-message";
    const messageText = document.createElement("span");
    messageText.textContent = "You signed up successfully";
    messageDiv.appendChild(messageText);
    return messageDiv;
}

function showSignupSuccess() {
    const message = createSignupMessage();
    document.body.appendChild(message);
    requestAnimationFrame(() => {
        message.classList.add("signup-success-message--visible");
    });
    setTimeout(() => message.remove(), 1000);
}
