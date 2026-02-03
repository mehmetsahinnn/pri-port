/*==================== MENU SHOW Y HIDDEN ====================*/
const navMenu = document.getElementById('nav-menu'),
    navToggle = document.getElementById('nav-toggle'),
    navClose = document.getElementById('nav-close');

/*===== MENU SHOW =====*/
/* Validate if constant exists */
if(navToggle){
    navToggle.addEventListener('click', ()=>{
        navMenu.classList.add('show-menu');
    })
}

/*===== MENU HIDDEN =====*/
/* Validate if constant exists */
if(navClose){
    navClose.addEventListener('click', ()=>{
        navMenu.classList.remove('show-menu');
    })
}

/*==================== REMOVE MENU MOBILE ====================*/
const navLink = document.querySelectorAll('.nav__link');

function linkAction(){
    const navMenu = document.getElementById('nav-menu');
    // When we click on each nav__link, we remove the show-menu class
    navMenu.classList.remove('show-menu');
}
navLink.forEach(n => n.addEventListener('click', linkAction));

/*==================== ACCORDION SKILLS ====================*/
const skillsContent = document.getElementsByClassName('skills__content'),
    skillsHeader = document.querySelectorAll('.skills__header');

function toggleSkills() {
    let itemClass = this.parentNode.className;

    for(i = 0; i < skillsContent.length; i++){
        skillsContent[i].className = 'skills__content skills__close';
    }

    if(itemClass === 'skills__content skills__close'){
        this.parentNode.className = 'skills__content skills__open';
    }
}

skillsHeader.forEach((el) => {
    el.addEventListener('click', toggleSkills);
});

/*==================== QUALIFICATION TABS ====================*/
const tabs = document.querySelectorAll('[data-target]'),
    tabContents = document.querySelectorAll('[data-content]')

tabs.forEach(tab =>{
    tab.addEventListener('click', ()=>{
        const target = document.querySelector(tab.dataset.target);

        tabContents.forEach(tabContent =>{
            tabContent.classList.remove('qualification__active');
        });

        target.classList.add('qualification__active');

        tabs.forEach(tab =>{
            tab.classList.remove('qualification__active');
        })
        tab.classList.add('qualification__active');
    })
})

/*==================== SERVICES MODAL ====================*/
const modalViews = document.querySelectorAll('.services__modal'),
    modalBtns = document.querySelectorAll('.services__button'),
    modalCloses = document.querySelectorAll('.services__modal-close');

let modal = function (modalClick){
    modalViews[modalClick].classList.add('active-modal');
};

modalBtns.forEach((modalBtn, i)=>{
    modalBtn.addEventListener('click', ()=>{
        modal(i);
    })
});

modalCloses.forEach(modalClose => {
    modalClose.addEventListener('click', () =>{
        modalViews.forEach((modalView) =>{
            modalView.classList.remove('active-modal');
        });
    });
});

/*==================== PORTFOLIO SWIPER  ====================*/
let swiper = new Swiper(".portfolio__container", {
    cssMode: true,
    loop: true,
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
});

/*==================== TESTIMONIAL ====================*/


/*==================== SCROLL SECTIONS ACTIVE LINK ====================*/
const sections = document.querySelectorAll('section[id]')

function scrollActive(){
    const scrollY = window.pageYOffset;

    sections.forEach(current =>{
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 50;
        sectionId = current.getAttribute('id');

        if(scrollY > sectionTop && scrollY <= sectionTop + sectionHeight){
            document.querySelector('.nav__menu a[href*=' + sectionId + ']').classList.add('active-link');
        }else{
            document.querySelector('.nav__menu a[href*=' + sectionId + ']').classList.remove('active-link');
        }
    })
}
window.addEventListener('scroll', scrollActive);


/*==================== CHANGE BACKGROUND HEADER ====================*/
function scrollHeader(){
    const nav = document.getElementById('header');
    // When the scroll is greater than 200 viewport height, add the scroll-header class to the header tag
    if(this.scrollY >= 80) nav.classList.add('scroll-header'); else nav.classList.remove('scroll-header');
}
window.addEventListener('scroll', scrollHeader);


/*==================== SHOW SCROLL UP ====================*/
function scrollUp(){
    const scrollUp = document.getElementById('scroll-up');
    // When the scroll is higher than 560 viewport height, add the show-scroll class to the a tag with the scroll-top class
    if(this.scrollY >= 560) scrollUp.classList.add('show-scroll'); else scrollUp.classList.remove('show-scroll');
}
window.addEventListener('scroll', scrollUp);

/*==================== DARK LIGHT THEME ====================*/
const themeButton = document.getElementById('theme-button')
const darkTheme = 'dark-theme'
const iconTheme = 'uil-sun'

// Previously selected topic (if user selected)
const selectedTheme = localStorage.getItem('selected-theme')
const selectedIcon = localStorage.getItem('selected-icon')

// We obtain the current theme that the interface has by validating the dark-theme class
const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light'
const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? 'uil-moon' : 'uil-sun'

// We validate if the user previously chose a topic
if (selectedTheme) {
    // If the validation is fulfilled, we ask what the issue was to know if we activated or deactivated the dark
    document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme)
    themeButton.classList[selectedIcon === 'uil-moon' ? 'add' : 'remove'](iconTheme)
}

// Activate / deactivate the theme manually with the button
themeButton.addEventListener('click', () => {
    // Add or remove the dark / icon theme
    document.body.classList.toggle(darkTheme)
    themeButton.classList.toggle(iconTheme)
    // We save the theme and the current icon that the user chose
    localStorage.setItem('selected-theme', getCurrentTheme())
    localStorage.setItem('selected-icon', getCurrentIcon())
})

/*==================== ADMIN LOGIN ====================*/
document.addEventListener('DOMContentLoaded', function() {
    const adminTrigger = document.getElementById('admin-trigger');
    const adminModal = document.getElementById('admin-modal');
    const adminClose = document.querySelector('.admin-close');
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminMenu = document.getElementById('admin-menu');
    const contactMenuItem = document.getElementById('contact-menu-item');
    const loginError = document.getElementById('login-error');

    // Admin credentials (in production, use proper authentication)
    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'msahin2026';

    // Check if elements exist
    if (!adminTrigger || !adminModal || !adminClose || !adminLoginForm || !adminMenu || !loginError) {
        console.error('Admin elements not found');
        return;
    }

    // Function to toggle admin mode
    function toggleAdminMode(isLoggedIn) {
        if (isLoggedIn) {
            if (adminMenu) adminMenu.style.display = 'block';
            if (contactMenuItem) contactMenuItem.style.display = 'none';
        } else {
            if (adminMenu) adminMenu.style.display = 'none';
            if (contactMenuItem) contactMenuItem.style.display = 'block';
        }
    }

    // Check if already logged in
    if (localStorage.getItem('admin-logged-in') === 'true') {
        toggleAdminMode(true);
    }

    // Open modal on "All rights reserved" click (3 fast clicks)
    let clickCount = 0;
    let clickTimer = null;

    adminTrigger.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        clickCount++;

        console.log('Admin trigger clicked, count:', clickCount);

        if (clickCount === 1) {
            if (clickTimer) clearTimeout(clickTimer);
            clickTimer = setTimeout(function() {
                console.log('Timeout - resetting click count');
                clickCount = 0;
            }, 800);
        } else if (clickCount === 3) {
            if (clickTimer) clearTimeout(clickTimer);
            clickCount = 0;
            adminModal.style.display = 'flex';
            console.log('Opening admin modal');
        }
    });

    // Close modal
    adminClose.addEventListener('click', function() {
        adminModal.style.display = 'none';
        loginError.style.display = 'none';
    });

    // Close modal when clicking outside (Safari compatible)
    adminModal.addEventListener('click', function(e) {
        if (e.target === adminModal) {
            adminModal.style.display = 'none';
            loginError.style.display = 'none';
        }
    });

    // Handle login
    adminLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const username = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            localStorage.setItem('admin-logged-in', 'true');
            toggleAdminMode(true);
            adminModal.style.display = 'none';
            loginError.style.display = 'none';
            adminLoginForm.reset();

            setTimeout(function() {
                alert('Login successful! API Access menu is now visible.');
            }, 100);
        } else {
            loginError.style.display = 'block';
            loginError.textContent = 'Invalid username or password!';
        }
    });

    // API Menu Toggle - Click to open/close
    const apiMenuToggle = document.getElementById('api-menu-toggle');
    const apiSubmenu = document.getElementById('api-submenu');

    if (apiMenuToggle && apiSubmenu) {
        apiMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            apiSubmenu.classList.toggle('active');
        });

        // Close submenu when clicking outside
        document.addEventListener('click', function(e) {
            if (adminMenu && !adminMenu.contains(e.target)) {
                apiSubmenu.classList.remove('active');
            }
        });

        // Keep menu open when clicking submenu items
        apiSubmenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // Home Page Contact Button / Admin Dropdown
    const homeContactBtn = document.getElementById('home-contact-btn');
    const homeAdminSubmenu = document.getElementById('home-admin-submenu');
    const homeContactWrapper = document.getElementById('home-contact-wrapper');
    let homeDropdownHandler = null;

    if (homeContactBtn && homeAdminSubmenu) {
        // Check if logged in to change button behavior
        function updateHomeContactButton() {
            const isLoggedIn = localStorage.getItem('admin-logged-in') === 'true';

            if (isLoggedIn) {
                // Show dropdown menu
                homeAdminSubmenu.style.display = '';

                // Remove old handler if exists
                if (homeDropdownHandler) {
                    homeContactBtn.removeEventListener('click', homeDropdownHandler);
                }

                // Change to dropdown mode
                homeDropdownHandler = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    homeAdminSubmenu.classList.toggle('active');
                };
                homeContactBtn.addEventListener('click', homeDropdownHandler);

                // Update button text to show it's a dropdown
                homeContactBtn.innerHTML = 'API Access <i class="uil uil-angle-down button__icon"></i>';
            } else {
                // Hide dropdown menu
                homeAdminSubmenu.style.display = 'none';
                homeAdminSubmenu.classList.remove('active');

                // Remove dropdown handler
                if (homeDropdownHandler) {
                    homeContactBtn.removeEventListener('click', homeDropdownHandler);
                    homeDropdownHandler = null;
                }

                // Normal contact link
                homeContactBtn.href = '#contact';
                homeContactBtn.innerHTML = 'Contact Me<i class="uil uil-message button__icon"></i>';
            }
        }

        // Initial check
        updateHomeContactButton();

        // Update after login
        adminLoginForm.addEventListener('submit', function(e) {
            setTimeout(updateHomeContactButton, 200);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (homeContactWrapper && !homeContactWrapper.contains(e.target)) {
                homeAdminSubmenu.classList.remove('active');
            }
        });

        // Keep dropdown open when clicking submenu items
        homeAdminSubmenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
});

