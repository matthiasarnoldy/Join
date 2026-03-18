const GLOBAL_AUTH_USER_QUERY_KEY = "uid";
const GLOBAL_AUTH_SOURCE_QUERY_KEY = "from";
const ROUTING_IS_IN_TEMPLATES = window.location.pathname.includes("/templates/");
const ROUTING_PROTECTED_PAGE_FILES = new Set([
   "summary.html",
   "add-task.html",
   "board.html",
   "contacts.html",
]);

/**
 * Returns the auth user ID from URL.
 * @returns {string} The auth user ID from URL.
 */
function getAuthUserIdFromUrl() {
   const params = new URLSearchParams(window.location.search);
   return String(params.get(GLOBAL_AUTH_USER_QUERY_KEY) || "").trim();
}

/**
 * Returns the auth source from URL.
 * @returns {string} The auth source from URL.
 */
function getAuthSourceFromUrl() {
   const params = new URLSearchParams(window.location.search);
   return String(params.get(GLOBAL_AUTH_SOURCE_QUERY_KEY) || "").trim();
}

/**
 * Returns the current page file name.
 * @returns {string} The current page file name.
 */
function getCurrentPageFileName() {
   return String(window.location.pathname.split("/").pop() || "").toLowerCase();
}

/**
 * Checks whether the page is protected.
 * @returns {boolean} Whether the page is protected.
 */
function isProtectedPage() {
   return ROUTING_PROTECTED_PAGE_FILES.has(getCurrentPageFileName());
}

/**
 * Returns the login entry path.
 * @returns {string} The login entry path.
 */
function getLoginEntryPath() {
   return ROUTING_IS_IN_TEMPLATES ? "../index.html" : "./index.html";
}

/**
 * Returns the signup entry path.
 * @returns {string} The signup entry path.
 */
function getSignupEntryPath() {
   return ROUTING_IS_IN_TEMPLATES ? "./signup.html" : "./templates/signup.html";
}

/**
 * Enforces the auth guard.
 * @returns {boolean} Whether the auth guard.
 */
function enforceAuthGuard() {
   if (!isProtectedPage()) return false;
   if (getAuthUserIdFromUrl()) return false;
   location.replace(getLoginEntryPath());
   return true;
}

/**
 * Builds the auth user query.
 *
 * @param {string} path - The path.
 * @returns {string} The auth user query.
 */
function withAuthUserQuery(path) {
   const userId = getAuthUserIdFromUrl();
   const authSource = getAuthSourceFromUrl();
   if (!userId && !authSource) return path;

   const url = new URL(path, window.location.href);
   if (userId) {
      url.searchParams.set(
         GLOBAL_AUTH_USER_QUERY_KEY,
         encodeURIComponent(userId)
      );
   }
   if (authSource) url.searchParams.set(GLOBAL_AUTH_SOURCE_QUERY_KEY, authSource);

   return `${url.pathname}${url.search}`;
}

window.getAuthUserIdFromUrl = getAuthUserIdFromUrl;
window.getAuthSourceFromUrl = getAuthSourceFromUrl;
window.getCurrentPageFileName = getCurrentPageFileName;
window.isProtectedPage = isProtectedPage;
window.getLoginEntryPath = getLoginEntryPath;
window.getSignupEntryPath = getSignupEntryPath;
window.enforceAuthGuard = enforceAuthGuard;
window.withAuthUserQuery = withAuthUserQuery;
