const darkModeButton = document.getElementById('dm-button');
const body = document.getElementById('main-body');

let value = 1;

darkModeButton.addEventListener('click', toggleDarkMode);

function toggleDarkMode()
{
    value *= -1;
    if (value === -1) { // DARK MODE
        body.classList.replace('light-theme', 'dark-theme');
        darkModeButton.classList.replace('bxs-sun-dim', 'bxs-moon');
    } else {
        body.classList.replace('dark-theme', 'light-theme');
        darkModeButton.classList.replace('bxs-moon', 'bxs-sun-dim');
    }
}