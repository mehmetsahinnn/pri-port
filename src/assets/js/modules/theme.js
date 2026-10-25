import { getItem, setItem } from './storage.js?v=20261025';

const DARK_CLASS = 'dark-theme';
const SUN_ICON = 'uil-sun';

export function initTheme() {
    const button = document.getElementById('theme-button');
    if (!button) return;

    const currentTheme = () => (document.body.classList.contains(DARK_CLASS) ? 'dark' : 'light');
    const currentIcon = () => (button.classList.contains(SUN_ICON) ? 'uil-moon' : 'uil-sun');

    const savedTheme = getItem('selected-theme');
    const savedIcon = getItem('selected-icon');
    if (savedTheme) {
        document.body.classList.toggle(DARK_CLASS, savedTheme === 'dark');
        button.classList.toggle(SUN_ICON, savedIcon === 'uil-moon');
    }

    button.addEventListener('click', () => {
        document.body.classList.toggle(DARK_CLASS);
        button.classList.toggle(SUN_ICON);
        setItem('selected-theme', currentTheme());
        setItem('selected-icon', currentIcon());
    });
}
