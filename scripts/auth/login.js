const LOGIN_ERROR_MESSAGE = "Check your email and password. Please try again.";
const GUEST_USER_NAME = "Guest User";
const GUEST_USER_EMAIL = "guest@join.local";
const GUEST_USER_INITIAL = "G";

/**
 * Returns the login form.
 * @returns {HTMLFormElement|null} The login form element, or null when it is not available.
 */
function getLoginForm() {
    return document.querySelector(".main-content .login__formular");
}


/**
 * Returns the empty login fields.
 * @returns {object|null} The empty login fields object, or null when it is not available.
 */
function emptyLoginFields() {
    return { form: null, emailInput: null, passwordInput: null, errorElement: null };
}


/**
 * Maps the login fields.
 *
 * @param {HTMLFormElement|null} loginForm - The login form.
 * @returns {object} The login fields object.
 */
function mapLoginFields(loginForm) {
    return {
        form: loginForm,
        emailInput: loginForm.querySelector("input[type='email']"),
        passwordInput: loginForm.querySelector("input[type='password']"),
        errorElement: loginForm.querySelector(".login__input--required"),
    };
}


/**
 * Returns the login fields.
 * @returns {object} The login fields object.
 */
function getLoginFields() {
    if (document.querySelector(".main-content--signup")) return emptyLoginFields();
    const loginForm = getLoginForm();
    if (!loginForm) return emptyLoginFields();
    return mapLoginFields(loginForm);
}


/**
 * Shows the login error.
 * @returns {void} Nothing.
 */
function showLoginError() {
    const { emailInput, passwordInput, errorElement } = getLoginFields();
    if (!errorElement) return;
    errorElement.textContent = LOGIN_ERROR_MESSAGE;
    errorElement.style.display = "block";
    errorElement.style.opacity = "1";
    emailInput?.classList.add("login__input--error");
    passwordInput?.classList.add("login__input--error");
}


/**
 * Hides the login error.
 * @returns {void} Nothing.
 */
function hideLoginError() {
    const { emailInput, passwordInput, errorElement } = getLoginFields();
    if (!errorElement) return;
    errorElement.style.display = "block";
    errorElement.style.opacity = "0";
    emailInput?.classList.remove("login__input--error");
    passwordInput?.classList.remove("login__input--error");
}


/**
 * Binds the login error hide on input.
 * @returns {void} Nothing.
 */
function bindLoginErrorHideOnInput() {
    const fields = getLoginFields();
    if (!areLoginFieldsReady(fields)) return;
    fields.emailInput.addEventListener("input", hideLoginError);
    fields.passwordInput.addEventListener("input", hideLoginError);
}


/**
 * Checks whether the login fields are ready.
 *
 * @param {object} fields - The fields object.
 * @returns {boolean} Whether the login fields are ready.
 */
function areLoginFieldsReady(fields) {
    return fields.emailInput && fields.passwordInput;
}


/**
 * Reads the login values.
 *
 * @param {object} fields - The fields object.
 * @returns {object} The login values object.
 */
function readLoginValues(fields) {
    return {
        email: fields.emailInput.value.trim().toLowerCase(),
        password: fields.passwordInput.value,
    };
}


/**
 * Checks whether the valid login is values.
 *
 * @param {object} values - The values object.
 * @returns {boolean} Whether the valid login is values.
 */
function isValidLoginValues(values) {
    if (!values.email || !values.password) return false;
    return isValidEmailAddress(values.email);
}


/**
 * Builds the login payload.
 * @returns {object} The login payload object.
 */
function buildLoginPayload() {
    const fields = getLoginFields();
    if (!areLoginFieldsReady(fields)) return showLoginError(), null;
    const values = readLoginValues(fields);
    if (!isValidLoginValues(values)) return showLoginError(), null;
    hideLoginError();
    return values;
}


/**
 * Sets up the login buttons.
 * @returns {void} Nothing.
 */
function setupLoginButtons() {
    bindMainLoginButton();
    bindGuestLoginButton();
}


/**
 * Binds the main login button.
 * @returns {void} Nothing.
 */
function bindMainLoginButton() {
    const loginButton = document.getElementById("login-button");
    if (!loginButton) return;
    if (document.querySelector(".main-content--signup")) return bindSignupButton(loginButton);
    loginButton.addEventListener("click", () => handleLogin(loginButton));
}


/**
 * Binds the guest login button.
 * @returns {void} Nothing.
 */
function bindGuestLoginButton() {
    const guestLoginButton = document.getElementById("guest-login-button");
    if (!guestLoginButton) return;
    guestLoginButton.addEventListener("click", () => handleGuestLogin(guestLoginButton));
}


/**
 * Checks whether the user is matching.
 *
 * @param {object} user - The user object.
 * @param {object} payload - The payload object.
 * @returns {boolean} Whether the user is matching.
 */
function isMatchingUser(user, payload) {
    if (!user || typeof user !== "object") return false;
    const userEmail = String(user.email || "").toLowerCase();
    return userEmail === payload.email && String(user.password || "") === payload.password;
}


/**
 * Returns the matching login user.
 *
 * @param {Array<object>} users - The users list.
 * @param {object} payload - The payload object.
 * @returns {object|null} The matching login user object, or null when it is not available.
 */
function getMatchingLoginUser(users, payload) {
    return Object.entries(users).find(([, user]) => isMatchingUser(user, payload)) || null;
}


/**
 * Returns the user entry by email.
 *
 * @param {Array<object>} usersObject - The users object list.
 * @param {string} email - The email.
 * @returns {string} The user entry by email.
 */
function getUserEntryByEmail(usersObject, email) {
    const normalizedEmail = String(email || "").toLowerCase();
    return Object.entries(usersObject).find(([, user]) => {
        const userEmail = String(user?.email || "").toLowerCase();
        return userEmail === normalizedEmail;
    }) || null;
}


/**
 * Builds the guest user payload.
 * @returns {object} The guest user payload object.
 */
function buildGuestUserPayload() {
    return {
        name: GUEST_USER_NAME,
        email: GUEST_USER_EMAIL,
        initial: GUEST_USER_INITIAL,
        password: "",
        createdAt: formatGermanTimestamp(new Date()),
    };
}


/**
 * Returns the guest user needs update.
 *
 * @param {object} user - The user object.
 * @returns {object} The guest user needs update object.
 */
function guestUserNeedsUpdate(user) {
    const initial = String(user?.initial || "").trim().toUpperCase();
    const name = String(user?.name || "").trim();
    const email = String(user?.email || "").trim().toLowerCase();
    return initial !== GUEST_USER_INITIAL || name !== GUEST_USER_NAME || email !== GUEST_USER_EMAIL;
}


/**
 * Updates the guest user profile.
 *
 * @param {string|number} userId - The user ID used for this operation.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
async function updateGuestUserProfile(userId) {
    const response = await fetch(`${getAuthBaseUrl()}users/${encodeURIComponent(userId)}.json`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: GUEST_USER_NAME,
            email: GUEST_USER_EMAIL,
            initial: GUEST_USER_INITIAL,
        }),
    });
    if (!response.ok) throw new Error(`Failed updating guest user: HTTP ${response.status}`);
}


/**
 * Creates the guest user in database.
 * @returns {Promise<string>} A promise that resolves to the guest user in database.
 */
async function createGuestUserInDatabase() {
    const response = await fetch(`${getAuthBaseUrl()}users.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildGuestUserPayload()),
    });
    if (!response.ok) throw new Error(`Failed creating guest user: HTTP ${response.status}`);
    const data = await response.json();
    return String(data?.name || "");
}


/**
 * Returns the or create guest user ID.
 * @returns {Promise<string>} A promise that resolves to the or create guest user ID.
 */
async function getOrCreateGuestUserId() {
    const users = await getUsersFromDatabase();
    const guestUserEntry = getUserEntryByEmail(users, GUEST_USER_EMAIL);
    if (!guestUserEntry) return createGuestUserInDatabase();
    const [guestUserId, guestUser] = guestUserEntry;
    if (guestUserNeedsUpdate(guestUser)) await updateGuestUserProfile(guestUserId);
    return guestUserId;
}


/**
 * Handles the guest login.
 *
 * @param {HTMLElement|null} guestLoginButton - The guest login button.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
async function handleGuestLogin(guestLoginButton) {
    try {
        setButtonDisabled(guestLoginButton, true);
        hideLoginError();
        const guestUserId = await getOrCreateGuestUserId();
        if (!guestUserId) throw new Error("Missing guest user id");
        redirectToSummary(guestUserId);
    } catch (error) {
        console.error("Guest login failed:", error);
        showLoginError();
    } finally {
        setButtonDisabled(guestLoginButton, false);
    }
}


/**
 * Handles the login.
 *
 * @param {HTMLElement|null} loginButton - The login button.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
async function handleLogin(loginButton) {
    const payload = buildLoginPayload();
    if (!payload) return;
    try {
        setButtonDisabled(loginButton, true);
        const users = await getUsersFromDatabase();
        const matchingUserEntry = getMatchingLoginUser(users, payload);
        if (!matchingUserEntry) return showLoginError();
        const [matchingUserId] = matchingUserEntry;
        redirectToSummary(matchingUserId);
    } catch (error) {
        console.error("Login failed:", error);
        showLoginError();
    } finally {
        setButtonDisabled(loginButton, false);
    }
}
