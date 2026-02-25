let selectedContactId = null;


function initContactsPage() {
  seedContactsIfEmpty();
  renderContacts();
  bindEvents();
}


function seedContactsIfEmpty() {
  const data = getJoinData();
  if (data.contacts.length === 0) {
    const seed = [
      { id: Date.now() + 1, name: "Anton Mayer", email: "anton@gmail.com", phone: "+49 111", color: "#FF7A00" },
      { id: Date.now() + 2, name: "Anja Schulz", email: "anja@web.de", phone: "+49 222", color: "#FF5EB3" },
      { id: Date.now() + 3, name: "Benedikt Ziegler", email: "ben@gmx.de", phone: "+49 333", color: "#6E52FF" },
      { id: Date.now() + 4, name: "David Eisner", email: "david@mail.com", phone: "+49 444", color: "#9327FF" },
      { id: Date.now() + 5, name: "Eva Fischer", email: "eva@test.de", phone: "+49 555", color: "#00BEE3" },
      { id: Date.now() + 6, name: "Frank Otto", email: "frank@work.de", phone: "+49 666", color: "#1FD7C1" },
      { id: Date.now() + 7, name: "Gabi Weber", email: "gabi@provider.com", phone: "+49 777", color: "#FF745E" },
      { id: Date.now() + 8, name: "Hanna Schmidt", email: "hanna@web.de", phone: "+49 888", color: "#FFA35E" },
      { id: Date.now() + 9, name: "Ingo Sorglos", email: "ingo@fun.de", phone: "+49 999", color: "#FC71FF" },
      { id: Date.now() + 10, name: "Julia Bauer", email: "julia@farm.com", phone: "+49 000", color: "#FFBB2B" }
    ];
    data.contacts = seed;
    saveJoinData(data);
  }
}


function renderContacts() {
  const data = getJoinData();
  const listContainer = document.getElementById('contacts-list-content');
  if (!listContainer) return;

  const sorted = data.contacts.sort((a, b) => a.name.localeCompare(b.name));
  const grouped = groupContacts(sorted);

  let html = "";
  for (const letter in grouped) {
    html += `<div class="group-header">${letter}</div><hr>`;
    grouped[letter].forEach(c => {
      const activeClass = c.id == selectedContactId ? "active" : "";
      html += `
        <div class="contact-item ${activeClass}" data-id="${c.id}">
          <div class="initials" style="background:${c.color}">${getInitials(c.name)}</div>
          <div class="contact-info">
            <span class="name">${c.name}</span>
            <span class="email">${c.email}</span>
          </div>
        </div>`;
    });
  }
  listContainer.innerHTML = html;
}


function groupContacts(contacts) {
  return contacts.reduce((groups, contact) => {
    const letter = contact.name.charAt(0).toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(contact);
    return groups;
  }, {});
}


function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0] ? parts[0].substring(0, 2).toUpperCase() : "??";
}


function handleContactClick(e) {
  const item = e.target.closest('.contact-item');
  if (!item) return;

  selectedContactId = item.dataset.id;
  const data = getJoinData();
  const contact = data.contacts.find(c => c.id == selectedContactId);
  
  renderContacts(); // Für Active Highlight
  showDetail(contact);
}


function showDetail(contact) {
  const view = document.getElementById('detail-view');
  view.classList.remove('d-none');

  document.getElementById('detail-initials').innerText = getInitials(contact.name);
  document.getElementById('detail-initials').style.backgroundColor = contact.color;
  document.getElementById('detail-name').innerText = contact.name;
  document.getElementById('detail-email').innerText = contact.email;
  document.getElementById('detail-email').href = `mailto:${contact.email}`;
  document.getElementById('detail-phone').innerText = contact.phone;
}


function handleCreateContact(e) {
  e.preventDefault();
  const name = document.getElementById('add-name').value;
  const email = document.getElementById('add-email').value;
  const phone = document.getElementById('add-phone').value;
  const errorMsg = document.getElementById('contactFormError');

  if (!name || !email.includes('@') || !email.includes('.') || !phone) {
    errorMsg.innerText = "Bitte gültige Daten eingeben.";
    return;
  }

  const newContact = {
    id: Date.now(),
    name, email, phone,
    color: '#' + Math.floor(Math.random()*16777215).toString(16)
  };

  const data = getJoinData();
  data.contacts.push(newContact);
  saveJoinData(data);
  
  closeOverlay();
  renderContacts();
}


function deleteContact() {
  if (!selectedContactId) return;
  const data = getJoinData();
  data.contacts = data.contacts.filter(c => c.id != selectedContactId);
  saveJoinData(data);
  
  selectedContactId = null;
  document.getElementById('detail-view').classList.add('d-none');
  renderContacts();
}


function bindEvents() {
  document.getElementById('contacts-list-content').addEventListener('click', handleContactClick);
  document.getElementById('contact-form').addEventListener('submit', handleCreateContact);
  document.getElementById('btn-delete').addEventListener('click', deleteContact);
  // Modal toggles hier ergänzen...
}


window.addEventListener('DOMContentLoaded', initContactsPage);
