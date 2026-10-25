// Navigation, tabs, carousel and scroll behaviour.

// Makes a non-button element (role="button") react to Enter / Space like a real button.
function onActivate(el, handler) {
    el.addEventListener('click', handler);
    el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handler(e);
        }
    });
}

function initMobileMenu() {
    const menu = document.getElementById('nav-menu');
    const toggle = document.getElementById('nav-toggle');
    const close = document.getElementById('nav-close');
    if (!menu) return;

    if (toggle) onActivate(toggle, () => menu.classList.add('show-menu'));
    if (close) onActivate(close, () => menu.classList.remove('show-menu'));
    document.querySelectorAll('.nav__link').forEach((link) => {
        link.addEventListener('click', () => menu.classList.remove('show-menu'));
    });
}

function initQualificationTabs() {
    const tabs = document.querySelectorAll('[data-target]');
    const contents = document.querySelectorAll('[data-content]');

    tabs.forEach((tab) => {
        onActivate(tab, () => {
            const target = document.querySelector(tab.dataset.target);
            if (!target) return;

            contents.forEach((content) => content.classList.remove('qualification__active'));
            tabs.forEach((other) => other.classList.remove('qualification__active'));
            target.classList.add('qualification__active');
            tab.classList.add('qualification__active');
        });
    });
}

function initPortfolioSwiper() {
    if (typeof Swiper === 'undefined') return;

    new Swiper('.portfolio__container', {
        cssMode: true,
        loop: true,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
    });
}

function initScrollEffects() {
    const header = document.getElementById('header');
    const scrollUp = document.getElementById('scroll-up');
    const sections = document.querySelectorAll('section[id]');
    const links = new Map();
    sections.forEach((section) => {
        const link = document.querySelector(`.nav__menu a[href="#${section.id}"]`);
        if (link) links.set(section, link);
    });

    function update() {
        const y = window.scrollY;

        if (header) header.classList.toggle('scroll-header', y >= 80);
        if (scrollUp) scrollUp.classList.toggle('show-scroll', y >= 560);

        links.forEach((link, section) => {
            const top = section.offsetTop - 50;
            link.classList.toggle('active-link', y > top && y <= top + section.offsetHeight);
        });
    }

    // One passive listener, batched to the next frame.
    let queued = false;
    window.addEventListener(
        'scroll',
        () => {
            if (queued) return;
            queued = true;
            requestAnimationFrame(() => {
                queued = false;
                update();
            });
        },
        { passive: true }
    );
    update();
}

export function initUi() {
    initMobileMenu();
    initQualificationTabs();
    initPortfolioSwiper();
    initScrollEffects();
}
