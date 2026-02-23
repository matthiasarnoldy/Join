const JOIN_DATA_KEY = "joinData";


function ensureAppData() {
  const data = localStorage.getItem(JOIN_DATA_KEY);
  if (!data) {
    const initialData = { tasks: [], contacts: [] };
    saveJoinData(initialData);
  }
}


function getJoinData() {
  const data = localStorage.getItem(JOIN_DATA_KEY);
  try {
    return JSON.parse(data) || { tasks: [], contacts: [] };
  } catch (e) {
    return { tasks: [], contacts: [] };
  }
}


function saveJoinData(data) {
  localStorage.setItem(JOIN_DATA_KEY, JSON.stringify(data));
}


// Initialisierung beim Laden
ensureAppData();
