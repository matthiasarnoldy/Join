document.addEventListener("DOMContentLoaded", initSummary);

const SUMMARY_BASE_URL =
    window.JOIN_CONFIG.BASE_URL;

function initSummary() {
    showGreetingFullscreen();
}

function showGreetingFullscreen() {
    const isMobile = window.matchMedia("(max-width: 1160px)").matches;
    if (!isMobile || !shouldPlayGreetingAnimation()) return loadSummaryWithGreeting();
    const greetings = document.querySelector(".overview__greetings");
    const summaryMain = document.querySelector("main.main");
    if (!greetings || !summaryMain) return loadSummaryWithGreeting();
    activateGreetingView(summaryMain, greetings);
    setTimeout(() => hideGreetingAndLoad(summaryMain, greetings), 1200);
}

function shouldPlayGreetingAnimation() {
    if (isReloadNavigation()) return true;
    return isFromLoginPage();
}

function isReloadNavigation() {
    const navEntry = performance.getEntriesByType("navigation")[0];
    return navEntry?.type === "reload";
}

function isFromLoginPage() {
    return document.referrer.includes("index.html");
}

function loadSummaryWithGreeting() {
    getCurrentTime();
    loadSummaryData();
}

function activateGreetingView(summaryMain, greetings) {
    getCurrentTime();
    summaryMain.classList.add("summary-greeting-active");
    greetings.classList.add("greeting-fullscreen");
}

function hideGreetingAndLoad(summaryMain, greetings) {
    summaryMain.classList.remove("summary-greeting-active");
    greetings.classList.remove("greeting-fullscreen");
    loadSummaryData();
    animateSummaryFadeIn(summaryMain);
}

function animateSummaryFadeIn(summaryMain) {
    summaryMain.classList.remove("summary-fade-in");
    requestAnimationFrame(() => {
        summaryMain.classList.add("summary-fade-in");
    });
}

async function loadSummaryData() {
    const tasks = await loadTasksFromFirebase();
    updateBacklogCount(tasks);
    updateDoneCount(tasks);
    updateTasksOnBoardCount(tasks);
    updateTasksInProgressCount(tasks);
    updateAwaitingFeedbackCount(tasks);
    updateUrgentCount(tasks);
    updateUpcomingDeadline(tasks);
}

async function loadTasksFromFirebase() {
    try {
        const response = await fetch(`${SUMMARY_BASE_URL}tasks.json`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!data) return [];
        if (Array.isArray(data)) {
            return data.filter((task) => task && typeof task === "object");
        }
        return Object.values(data).filter((task) => task && typeof task === "object");
    } catch (error) {
        console.error("Summary task loading failed:", error);
        return [];
    }
}

function updateBacklogCount(tasks) {
    const todoCount = tasks.filter(task => task.status === "todo").length;
    const backlogElement = document.getElementById("backlogCount");
    if (backlogElement) backlogElement.textContent = todoCount;
}

function updateDoneCount(tasks) {
    const doneCount = tasks.filter(task => task.status === "done").length;
    const doneElement = document.getElementById("doneCount");
    if (doneElement) doneElement.textContent = doneCount;
}

function updateTasksOnBoardCount(tasks) {
    const totalCount = tasks.length;
    const boardElement = document.getElementById("tasksOnBoardCount");
    if (boardElement) boardElement.textContent = totalCount;
}

function updateTasksInProgressCount(tasks) {
    const progressCount = tasks.filter(task => task.status === "in-progress").length;
    const progressElement = document.getElementById("tasksInProgressCount");
    if (progressElement) progressElement.textContent = progressCount;
}

function updateAwaitingFeedbackCount(tasks) {
    const feedbackCount = tasks.filter(task => task.status === "await-feedback").length;
    const feedbackElement = document.getElementById("awaitingFeedbackCount");
    if (feedbackElement) feedbackElement.textContent = feedbackCount;
}

function updateUrgentCount(tasks) {
    const urgentCount = tasks.filter(task => task.priority === "urgent").length;
    const urgentElement = document.getElementById("urgentCount");
    if (urgentElement) urgentElement.textContent = urgentCount;
}

function updateUpcomingDeadline(tasks) {
    const urgentTasks = tasks.filter(task => task.priority === "urgent" && task.date);
    if (urgentTasks.length === 0) {
        const deadlineElement = document.getElementById("upcomingDeadline");
        if (deadlineElement) deadlineElement.textContent = "-";
        return;
    }
    const sortedUrgent = urgentTasks.sort((a, b) => parseGermanDate(a.date) - parseGermanDate(b.date));
    const nextDeadline = sortedUrgent[0].date;
    const deadlineElement = document.getElementById("upcomingDeadline");
    if (deadlineElement) deadlineElement.textContent = formatDeadlineDate(nextDeadline);
}

function parseGermanDate(dateString) {
    const parts = dateString.split('/');
    if (parts.length !== 3) return new Date(dateString);
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
}

function formatDeadlineDate(dateString) {
    const date = parseGermanDate(dateString);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = months[date.getMonth()];
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
}

function getCurrentTime() {
    let currentDate = new Date();
    let currentHour = currentDate.getHours();
    setCurrentTime(currentHour);
}

function setCurrentTime(currentHour) {
    let greetings = document.getElementById('greetings');
    greetings.innerHTML =
        currentHour < 7  ? setGoodNight() :
        currentHour < 12 ? setGoodMorning() :
        currentHour < 18 ? setGoodAfternoon() :
        setGoodEvening();
}