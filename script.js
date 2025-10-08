// ------- Onload -----------
window.addEventListener('load', function () {
    const popup = document.getElementById('welcome-popup');

    // Scroll top (prevent start from middle)
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Wait 3s for loader, then hide smoothly and start scripts
    setTimeout(() => {
        popup.classList.add('hide');

        // Give browser a render frame before heavy JS
        requestAnimationFrame(() => {
            setTimeout(startSiteScripts, 200);
        });
    }, 2000);
});

function startSiteScripts() {

    // ---------- Typed.js (guarded with slight delay) ----------
    if (typeof Typed !== 'undefined') {
        setTimeout(() => {
            new Typed('.hero-typer', {
                strings: [
                    "Frontend Developer",
                    "Backend Developer",
                    "Full-Stack Developer",
                    "Web Designer",
                    "Freelancer",
                    "Problem-Solver"
                ],
                typeSpeed: 50,
                backSpeed: 50,
                cursorChar: '',
                loop: true
            });
        }, 500); // starts a bit after load
    }

    // ---------- Mobile nav toggle ----------
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.header .header-items nav');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => navMenu.classList.toggle('show'));
        navMenu.addEventListener('click', e => {
            if (e.target.tagName === 'A') navMenu.classList.remove('show');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (ev) => {
            if (!navMenu.contains(ev.target) && !navToggle.contains(ev.target)) {
                navMenu.classList.remove('show');
            }
            checkScroll();
        });
    }

    // ---------- Portfolio Tabs ----------
    const tabbutton = document.querySelectorAll('.tab-button');
    const tabcontent = document.querySelectorAll('.content-all');

    tabbutton.forEach(button => {
        button.addEventListener('click', () => {
            tabbutton.forEach(btn => btn.classList.remove('active'));
            tabcontent.forEach(content => content.classList.remove('active'));

            button.classList.add('active');

            const tabid = button.getAttribute('data-tab');
            const tabsystem = document.getElementById(tabid);
            if (tabsystem) tabsystem.classList.add('active');

            checkScroll();
        });
    });

    // ---------- Scroll-on Animation (optimized) ----------
    const boxes = document.querySelectorAll('.animate-on-scroll');

    function checkScroll() {
        const triggerPoint = window.innerHeight * 1.01;
        boxes.forEach(box => {
            const rect = box.getBoundingClientRect();
            if (rect.top < triggerPoint && rect.bottom > 0) {
                box.classList.add('show');
            } else {
                box.classList.remove('show');
            }
        });
    }

    // Throttle scroll listener for better FPS
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                checkScroll();
                scrollTimeout = null;
            }, 100);
        }
    }, { passive: true });

    window.addEventListener('resize', checkScroll);
    checkScroll(); // run once immediately

    // ---------- Sticky Navbar Highlight ----------
    (function () {
        const header = document.querySelector('header');
        const navLinks = Array.from(document.querySelectorAll('header .header-items nav a'));
        if (!navLinks.length) return;

        const getHeaderHeight = () => (header ? header.getBoundingClientRect().height : 0);
        const linkToSection = new Map();

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            let target = null;
            if (href === '#') target = document.querySelector('.hero');
            else if (href && href.startsWith('#')) target = document.querySelector(href);
            if (target) linkToSection.set(link, target);
        });

        let sections = Array.from(new Set([...linkToSection.values()]));
        if (!sections.length) return;

        let positions = [];
        function updatePositions() {
            positions = sections.map(s => {
                const top = Math.round(s.getBoundingClientRect().top + window.scrollY);
                return { el: s, top, height: s.offsetHeight };
            }).sort((a, b) => a.top - b.top);
        }

        function sortSections() {
            sections.sort((a, b) => {
                const ta = a.getBoundingClientRect().top + window.scrollY;
                const tb = b.getBoundingClientRect().top + window.scrollY;
                return ta - tb;
            });
        }
        sortSections();
        updatePositions();

        let isAutoScrolling = false;
        let autoScrollTargetY = null;
        const ARRIVAL_TOLERANCE_PX = 2;

        function setActiveForSection(sectionEl) {
            for (const [link, sec] of linkToSection.entries()) {
                link.classList.toggle('active', sec === sectionEl);
            }
            if (!sectionEl && window.scrollY < 50) {
                navLinks.forEach(l => l.classList.remove('active'));
                const home = navLinks.find(l => l.getAttribute('href') === '#');
                if (home) home.classList.add('active');
            }
        }

        function getCurrentSectionByTop() {
            const headerHeight = getHeaderHeight();
            const triggerPos = window.scrollY + headerHeight + 2;
            let current = null;
            for (const p of positions) {
                if (p.top <= triggerPos) current = p.el;
                else break;
            }
            return current;
        }

        function updateActiveByViewport() {
            if (!positions.length) updatePositions();
            const cur = getCurrentSectionByTop();
            if (cur) setActiveForSection(cur);
            else {
                navLinks.forEach(l => l.classList.remove('active'));
                const home = navLinks.find(l => l.getAttribute('href') === '#');
                if (home) home.classList.add('active');
            }
        }

        let ticking = false;
        function onScrollRaf() {
            ticking = false;
            if (isAutoScrolling && autoScrollTargetY !== null) {
                if (Math.abs(window.scrollY - autoScrollTargetY) <= ARRIVAL_TOLERANCE_PX) {
                    isAutoScrolling = false;
                    autoScrollTargetY = null;
                    updateActiveByViewport();
                    return;
                }
                return;
            }
            updateActiveByViewport();
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(onScrollRaf);
            }
        }, { passive: true });

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                const targetEl = (href === '#') ? document.querySelector('.hero') : document.querySelector(href);
                if (!targetEl) return;

                e.preventDefault();
                updatePositions();
                const pos = positions.find(p => p.el === targetEl);
                const headerHeight = getHeaderHeight();
                const targetY = Math.max(0, (pos ? pos.top : Math.round(targetEl.getBoundingClientRect().top + window.scrollY)) - headerHeight);

                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                isAutoScrolling = true;
                autoScrollTargetY = Math.round(targetY);
                window.scrollTo({ top: autoScrollTargetY, behavior: 'smooth' });
            }, { passive: false });
        });

        function cancelAutoScrollLockAndUpdate() {
            if (!isAutoScrolling) return;
            isAutoScrolling = false;
            autoScrollTargetY = null;
            updateActiveByViewport();
        }
        window.addEventListener('wheel', cancelAutoScrollLockAndUpdate, { passive: true });
        window.addEventListener('touchstart', cancelAutoScrollLockAndUpdate, { passive: true });
        window.addEventListener('keydown', (e) => {
            const keys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
            if (keys.includes(e.key)) cancelAutoScrollLockAndUpdate();
        });

        let resizeTimer = null;
        window.addEventListener('resize', () => {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                sortSections();
                updatePositions();
                updateActiveByViewport();
                resizeTimer = null;
            }, 120);
        });

        window.addEventListener('load', updatePositions);

        updatePositions();
        updateActiveByViewport();
    })();
}



