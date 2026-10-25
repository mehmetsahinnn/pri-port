// Hidden admin entry point on the public page.
//
// Authentication is entirely server-side: /api/admin-login sets an HttpOnly
// cookie that this script can neither read nor steal. The only thing the page
// knows is the answer of /api/admin-verify, which decides whether the nav shows
// the "Admin Panel" link. All real tools live behind that cookie on the server.

import { applyLang, t } from './i18n.js?v=20261025';

const TRIGGER_CLICKS = 3;
const TRIGGER_WINDOW_MS = 800;

function setAdminUi(isAdmin) {
    const adminMenu = document.getElementById('admin-menu');
    const contactMenu = document.getElementById('contact-menu-item');
    const homeButton = document.getElementById('home-contact-btn');

    if (adminMenu) adminMenu.style.display = isAdmin ? '' : 'none';
    if (contactMenu) contactMenu.style.display = isAdmin ? 'none' : '';

    if (homeButton) {
        homeButton.setAttribute('href', isAdmin ? '/admin.html' : '#contact');
        const label = homeButton.querySelector('[data-i18n]');
        if (label) label.dataset.i18n = isAdmin ? 'admin_panel' : 'contact_me';
        const icon = homeButton.querySelector('.button__icon');
        if (icon) icon.className = `uil ${isAdmin ? 'uil-setting' : 'uil-message'} button__icon`;
        applyLang();
    }
}

async function checkSession() {
    try {
        const res = await fetch('/api/admin-verify', { credentials: 'same-origin', cache: 'no-store' });
        setAdminUi(res.ok);
    } catch {
        // Offline or no backend (e.g. plain static server): stay logged out.
        setAdminUi(false);
    }
}

function initTrigger(openModal) {
    const trigger = document.getElementById('admin-trigger');
    if (!trigger) return;

    let clicks = 0;
    let timer = null;
    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        clicks += 1;
        if (clicks === 1) {
            timer = setTimeout(() => { clicks = 0; }, TRIGGER_WINDOW_MS);
        } else if (clicks >= TRIGGER_CLICKS) {
            clearTimeout(timer);
            clicks = 0;
            openModal();
        }
    });
}

export function initAdmin() {
    const modal = document.getElementById('admin-modal');
    const closeBtn = modal?.querySelector('.admin-close');
    const form = document.getElementById('admin-login-form');
    const errorEl = document.getElementById('login-error');
    if (!modal || !closeBtn || !form || !errorEl) return;

    const showError = (key) => {
        errorEl.textContent = t(key);
        errorEl.style.display = 'block';
    };
    const openModal = () => {
        modal.style.display = 'flex';
        document.getElementById('admin-username')?.focus();
    };
    const closeModal = () => {
        modal.style.display = 'none';
        errorEl.style.display = 'none';
    };

    initTrigger(openModal);
    closeBtn.addEventListener('click', closeModal);
    closeBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') closeModal();
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display !== 'none') closeModal();
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submit = form.querySelector('button[type="submit"]');
        const username = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;

        errorEl.style.display = 'none';
        if (submit) submit.disabled = true;

        try {
            const res = await fetch('/api/admin-login', {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (res.ok) {
                form.reset();
                closeModal();
                setAdminUi(true);
            } else if (res.status === 429) {
                showError('admin_err_rate');
            } else if (res.status >= 500) {
                showError('admin_err_server');
            } else {
                showError('admin_err_invalid');
            }
        } catch {
            showError('admin_err_network');
        } finally {
            if (submit) submit.disabled = false;
        }
    });

    checkSession();
}
