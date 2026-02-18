function openDialog() {
    const dialog = document.getElementById("addTaskDialog");
    if (dialog) {
        dialog.showModal();
    }
}

window.addEventListener("click", (event) => {
    const dialog = document.getElementById("addTaskDialog");
    if (dialog && event.target === dialog) {
        dialog.close();
    }
});

function closeDialog() {
    const dialog = document.getElementById("addTaskDialog");
    if (dialog) {
        dialog.close();
    }
};