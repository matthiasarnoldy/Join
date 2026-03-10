const LOGIN_ERROR_MESSAGE = "Check your email and password. Please try again.";
const GUEST_USER_NAME = "Guest User";
const GUEST_USER_EMAIL = "guest@join.local";
const GUEST_USER_INITIAL = "G";

function getLoginForm() {
    return document.querySelector(".main-content .login__formular");
}

function emptyLoginFields() {
    return { form: null, emailInput: null, passwordInput: null, errorElement: null };
}

function mapLoginFields(loginForm) {
    return {
        form: loginForm,
        emailInput: loginForm.querySelector("input[type='email']"),
        passwordInput: loginForm.querySelector("input[type='password']"),
        errorElement: loginForm.querySelector(".login__input--required"),
    };
}

function getLoginFields() {
    if (document.querySelector(".main-content--signup")) return emptyLoginFields();
    const loginForm = getLoginForm();
    if (!loginForm) return emptyLoginFields();
    return mapLoginFields(loginForm);
}

function showLoginError() {
    const { emailInput, passwordInput, errorElement } = getLoginFields();
    if (!errorElement) return;
    errorElement.textContent = LOGIN_ERROR_MESSAGE;
    errorElement.style.display = "block";
    errorElement.style.opacity = "1";
    emailInput?.classList.add("login__input--error");
    passwordInput?.classList.add("login__input--error");
}

function hideLoginError() {
    const { emailInput, passwordInput, errorElement } = getLoginFields();
    if (!errorElement) return;
    errorElement.style.display = "block";
    errorElement.style.opacity = "0";
    emailInput?.classList.remove("login__input--error");
    passwordInput?.classList.remove("login__input--error");
}

function bindLoginErrorHideOnInput() {
    const fields = getLoginFields();
    if (!areLoginFieldsReady(fields)) return;
    fields.emailInput.addEventListener("input", hideLoginError);
    fields.passwordInput.addEventListener("input", hideLoginError);
}

function areLoginFieldsReady(fields) {
    return fields.emailInput && fields.passwordInput;
}

function readLoginValues(fields) {
    return {
        email: fields.emailInput.value.trim().toLowerCase(),
        password: fields.passwordInput.value,
    };
}

function isValidLoginValues(values) {
    if (!values.email || !values.password) return false;
    return isValidEmailAddress(values.email);
}

function buildLoginPayload() {
    const fields = getLoginFields();
    if (!areLoginFieldsReady(fields)) return showLoginError(), null;
    const values = readLoginValues(fields);
    if (!isValidLoginValues(values)) return showLoginError(), null;
    hideLoginError();
    return values;
}

function setupLoginButtons() {
    bindMainLoginButton();
    bindGuestLoginButton();
}

function bindMainLoginButton() {
    const loginButton = document.getElementById("login-button");
    if (!loginButton) return;
    if (document.querySelector(".main-content--signup")) return bindSignupButton(loginButton);
    loginButton.addEventListener("click", () => handleLogin(loginButton));
}

function bindGuestLoginButton() {
    const guestLoginButton = document.getElementById("guest-login-button");
    if (!guestLoginButton) return;
    guestLoginButton.addEventListener("click", () => handleGuestLogin(guestLoginButton));
}

function isMatchingUser(user, payload) {
    if (!user || typeof user !== "object") return false;
    const userEmail = String(user.email || "").toLowerCase();
    return userEmail === payload.email && String(user.password || "") === payload.password;
}

function getMatchingLoginUser(users, payload) {
    return Object.entries(users).find(([, user]) => isMatchingUser(user, payload)) || null;
}

function getUserEntryByEmail(usersObject, email) {
    const normalizedEmail = String(email || "").toLowerCase();
    return Object.entries(usersObject).find(([, user]) => {
        const userEmail = String(user?.email || "").toLowerCase();
        return userEmail === normalizedEmail;
    }) || null;
}

function buildGuestUserPayload() {
    return {
        name: GUEST_USER_NAME,
        email: GUEST_USER_EMAIL,
        initial: GUEST_USER_INITIAL,
        password: "",
        createdAt: formatGermanTimestamp(new Date()),
    };
}

function guestUserNeedsUpdate(user) {
    const initial = String(user?.initial || "").trim().toUpperCase();
    const name = String(user?.name || "").trim();
    const email = String(user?.email || "").trim().toLowerCase();
    return initial !== GUEST_USER_INITIAL || name !== GUEST_USER_NAME || email !== GUEST_USER_EMAIL;
}

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

async function getOrCreateGuestUserId() {
    const users = await getUsersFromDatabase();
    const guestUserEntry = getUserEntryByEmail(users, GUEST_USER_EMAIL);
    if (!guestUserEntry) return createGuestUserInDatabase();
    const [guestUserId, guestUser] = guestUserEntry;
    if (guestUserNeedsUpdate(guestUser)) await updateGuestUserProfile(guestUserId);
    return guestUserId;
}

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
