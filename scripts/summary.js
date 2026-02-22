document.addEventListener("DOMContentLoaded", initSummary);

function initSummary() {
    getCurrentTime();
    updateBacklogCount();
    updateDoneCount();
    updateTasksOnBoardCount();
    updateTasksInProgressCount();
    updateAwaitingFeedbackCount();
    updateUrgentCount();
    updateUpcomingDeadline();
}

function updateBacklogCount() {
    const tasks = JSON.parse(sessionStorage.getItem("tasks") || "[]");
    const todoCount = tasks.filter(task => task.status === "todo").length;
    const backlogElement = document.getElementById("backlogCount");
    if (backlogElement) backlogElement.textContent = todoCount;
}

function updateDoneCount() {
    const tasks = JSON.parse(sessionStorage.getItem("tasks") || "[]");
    const doneCount = tasks.filter(task => task.status === "done").length;
    const doneElement = document.getElementById("doneCount");
    if (doneElement) doneElement.textContent = doneCount;
}

function updateTasksOnBoardCount() {
    const tasks = JSON.parse(sessionStorage.getItem("tasks") || "[]");
    const totalCount = tasks.length;
    const boardElement = document.getElementById("tasksOnBoardCount");
    if (boardElement) boardElement.textContent = totalCount;
}

function updateTasksInProgressCount() {
    const tasks = JSON.parse(sessionStorage.getItem("tasks") || "[]");
    const progressCount = tasks.filter(task => task.status === "in-progress").length;
    const progressElement = document.getElementById("tasksInProgressCount");
    if (progressElement) progressElement.textContent = progressCount;
}

function updateAwaitingFeedbackCount() {
    const tasks = JSON.parse(sessionStorage.getItem("tasks") || "[]");
    const feedbackCount = tasks.filter(task => task.status === "await-feedback").length;
    const feedbackElement = document.getElementById("awaitingFeedbackCount");
    if (feedbackElement) feedbackElement.textContent = feedbackCount;
}

function updateUrgentCount() {
    const tasks = JSON.parse(sessionStorage.getItem("tasks") || "[]");
    const urgentCount = tasks.filter(task => task.priority === "urgent").length;
    const urgentElement = document.getElementById("urgentCount");
    if (urgentElement) urgentElement.textContent = urgentCount;
}

function updateUpcomingDeadline() {
    const tasks = JSON.parse(sessionStorage.getItem("tasks") || "[]");
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