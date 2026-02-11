function summary() {
    getCurrentTime();
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