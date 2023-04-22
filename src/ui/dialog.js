function createDialog(message) {
    const dialog = document.createElement('div');
    dialog.classList.add('dialog');
    dialog.innerHTML = message;

    const container = document.getElementById('dialogs');
    container.appendChild(dialog);
    dialog.appendChild(createConfirm());

    return dialog;
}

// Closes the dialog box
function createConfirm() {
    console.log('creating');
    const button = document.createElement('div');
    button.classList = 'dialog-confirm';
    button.innerHTML = 'CONFIRM >>';
    button.addEventListener('click', async (e) => {
        e.target.parentElement.remove();
    })
    return button; 
}

function showStory(event) {

    const dialog = event.text;
    // Create dialog frame
    const frame = createDialog(dialog);



}

export { showStory};