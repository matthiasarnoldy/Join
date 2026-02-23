// ========================
// JOIN DATABASE STRUKTUR
// ========================
// WICHTIG: Passwörter werden von Firebase Authentication gehandhabt
// und sind NICHT in dieser Datenbank gespeichert!

const joinDatabase = {
    users: [
        {
            uid: "",                    // Firebase UID (eindeutig)
            name: "",                   // z.B. "Max Mustermann"
            email: "",                  // z.B. "max@test.de"
            initials: "",               // z.B. "MM" (auto generiert)
            createdAt: "",
            updatedAt: ""
            // KEIN PASSWORD HIER!
            // Passwort ist in Firebase Authentication gespeichert
        }
    ],
    tasks: [
        {
            id: "",
            title: "",
            description: "",
            date: "",                   // Format: "dd/mm/yyyy"
            priority: "",               // urgent, medium, low
            category: "",               // technical, user-story
            assigned: [],               // Array von User UIDs
            subtasks: [],               // Array von Subtask-Objekten
            status: "",                 // todo, in-progress, await-feedback, done
            createdAt: "",
            updatedAt: ""
        }
    ],
    contacts: [
        {
            id: "",
            name: "",
            email: "",
            phone: "",
            initials: "",
            color: "",
            createdAt: "",
            updatedAt: ""
        }
    ]
};

// ========================
// FIREBASE AUTHENTICATION
// ========================
// Diese Datenbank wird von Firebase Auth gehandhabt
// Nicht manuell zu erstellen - Firebase macht das automatisch!

/*
Firebase Auth speichert pro User intern:
{
    uid: "abc123def456",           // Eindeutige Firebase UID
    email: "max@test.de",
    passwordHash: "$2a$10$...",    // Verschlüsseltes Passwort (bcrypt)
    createdAt: 1708617600000,
    emailVerified: false,
    disabled: false
}

Diese Daten sind:
- NICHT direkt abrufbar (auch nicht über Console)
- Nur Firebase kennt das verschlüsselte Passwort
- Nur Firebase kann das Passwort validieren
*/
