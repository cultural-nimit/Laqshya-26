document.addEventListener('DOMContentLoaded', function () {
    const header = document.getElementById('header');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    // Header scroll effect
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Hamburger Menu
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    const navigationLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
    const navigationSections = navigationLinks
        .map(link => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    function setActiveNavigation(sectionId) {
        navigationLinks.forEach(link => {
            const isActive = link.getAttribute('href') === `#${sectionId}`;
            link.classList.toggle('active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    if ('IntersectionObserver' in window) {
        const navigationObserver = new IntersectionObserver(entries => {
            const visibleSection = entries
                .filter(entry => entry.isIntersecting)
                .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];
            if (visibleSection) setActiveNavigation(visibleSection.target.id);
        }, { rootMargin: '-25% 0px -60% 0px', threshold: [0.1, 0.4, 0.7] });

        navigationSections.forEach(section => navigationObserver.observe(section));
    }

    // Modal Logic
    const modal = document.getElementById('guidelines-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body').querySelector('ul');
    const closeModalBtn = document.getElementById('close-modal-btn');

    document.querySelectorAll('.guidelines-button').forEach(button => {
        button.addEventListener('click', () => {
            modalTitle.textContent = button.dataset.modalTitle;
            const guidelines = button.dataset.modalContent.split('|');
            modalBody.innerHTML = '';
            let currentItem;
            let currentIndent = 0;

            guidelines.forEach(guideline => {
                const text = guideline.replace(/\r?\n/g, '');
                const content = text.trim().replace(/^•\s*/, '');
                if (!content) return;

                const indent = text.length - text.trimStart().length;
                if (!currentItem || indent <= currentIndent) {
                    currentItem = document.createElement('li');
                    currentItem.textContent = content;
                    modalBody.appendChild(currentItem);
                    currentIndent = indent;
                    return;
                }

                let nestedList = currentItem.querySelector('ul');
                if (!nestedList) {
                    nestedList = document.createElement('ul');
                    currentItem.appendChild(nestedList);
                }

                const nestedItem = document.createElement('li');
                nestedItem.textContent = content;
                nestedList.appendChild(nestedItem);
            });
            modal.classList.add('show');
        });
    });

    function closeModal() {
        if (modal) { // Check if modal exists
            modal.classList.remove('show');
        }
    }
    if (closeModalBtn) { // Check if close button exists
        closeModalBtn.addEventListener('click', closeModal);
    }
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            closeModal();
        }
    });

    // Event Tab Logic
    const tabs = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to the clicked tab and its content
            tab.classList.add('active');
            const tabId = tab.dataset.tab;
            const activeTabContent = document.getElementById(tabId);
            if (activeTabContent) { // Check if content exists
                activeTabContent.classList.add('active');
            }
        });
    });

    const eventSearch = document.getElementById('event-search');
    const departmentFilter = document.getElementById('department-filter');
    const eventTypeFilter = document.getElementById('event-type-filter');
    const teamSizeFilter = document.getElementById('team-size-filter');
    const participationFilter = document.getElementById('participation-filter');
    const resetEventFilters = document.getElementById('reset-event-filters');
    const eventFilterStatus = document.getElementById('event-filter-status');
    const eventCards = [...document.querySelectorAll('.event-card')];

    function getEventMetadata(card) {
        const tabContent = card.closest('.tab-content');
        const department = card.closest('.department-section')?.querySelector('.department-title')?.textContent.trim() || 'General';
        const type = tabContent?.id === 'core-events' ? 'Core' :
            tabContent?.id === 'general-events' ? 'General' : 'Sports & Cultural';
        const text = card.textContent.toLowerCase();
        const isIndividual = /individual|solo/.test(text);
        const hasTeam = /team|members|participants/.test(text);
        const hasLargeTeam = /(?:8\s*[-–]\s*12|7\s*[-–]\s*12|maximum of (?:8|9|10|12)|five members|five participants)/.test(text);
        const hasMediumTeam = /(?:5\s*[-–]\s*7|maximum of (?:5|6|7)|seven members)/.test(text);
        const teamSize = isIndividual ? 'individual' : hasLargeTeam ? 'large' : hasMediumTeam ? 'medium' : hasTeam ? 'small' : 'unknown';
        const participation = [
            isIndividual ? 'individual' : hasTeam ? 'team' : null,
            /\bug\b|undergraduate/.test(text) ? 'ug' : null,
            /\bpg\b|postgraduate/.test(text) ? 'pg' : null
        ].filter(Boolean);

        return {
            searchText: text,
            department,
            type,
            teamSize,
            participation
        };
    }

    const eventMetadata = new Map(eventCards.map(card => [card, getEventMetadata(card)]));

    function addFilterOptions(select, values) {
        [...new Set(values)].sort().forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    if (departmentFilter && eventTypeFilter) {
        addFilterOptions(departmentFilter, eventCards.map(card => eventMetadata.get(card).department));
        addFilterOptions(eventTypeFilter, eventCards.map(card => eventMetadata.get(card).type));
    }

    function updateEventFilters() {
        const search = eventSearch?.value.trim().toLowerCase() || '';
        const selectedDepartment = departmentFilter?.value || 'all';
        const selectedType = eventTypeFilter?.value || 'all';
        const selectedTeamSize = teamSizeFilter?.value || 'all';
        const selectedParticipation = participationFilter?.value || 'all';
        let visibleCount = 0;

        eventCards.forEach(card => {
            const metadata = eventMetadata.get(card);
            const matches = (!search || metadata.searchText.includes(search)) &&
                (selectedDepartment === 'all' || metadata.department === selectedDepartment) &&
                (selectedType === 'all' || metadata.type === selectedType) &&
                (selectedTeamSize === 'all' || metadata.teamSize === selectedTeamSize) &&
                (selectedParticipation === 'all' || metadata.participation.includes(selectedParticipation));

            card.hidden = !matches;
            if (matches) visibleCount += 1;
        });

        document.querySelectorAll('.department-section').forEach(section => {
            section.hidden = !section.querySelector('.event-card:not([hidden])');
        });

        if (eventFilterStatus) {
            eventFilterStatus.textContent = `${visibleCount} event${visibleCount === 1 ? '' : 's'} found`;
        }
    }

    [eventSearch, departmentFilter, eventTypeFilter, teamSizeFilter, participationFilter]
        .filter(Boolean)
        .forEach(control => control.addEventListener('input', updateEventFilters));

    resetEventFilters?.addEventListener('click', () => {
        if (eventSearch) eventSearch.value = '';
        [departmentFilter, eventTypeFilter, teamSizeFilter, participationFilter]
            .filter(Boolean)
            .forEach(select => { select.value = 'all'; });
        updateEventFilters();
    });

    updateEventFilters();

    // =========================================================
    // --- START: UPDATED Banner Carousel Logic (Sliding) ---
    // =========================================================
    const slidesContainer = document.querySelector('.banner-carousel .slides');
    const slides = document.querySelectorAll('.banner-carousel .slide');
    const prevButton = document.querySelector('.banner-carousel .prev');
    const nextButton = document.querySelector('.banner-carousel .next');
    const dotsContainer = document.querySelector('.banner-carousel .carousel-dots');

    let currentIndex = 0;
    let slideInterval;

    if (slides.length > 0) {
        // --- 1. Create Dots ---
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.classList.add('dot');
            if (i === currentIndex) {
                dot.classList.add('active');
            }
            dot.addEventListener('click', () => {
                goToSlide(i);
                resetInterval(); // Reset auto-play timer on manual click
            });
            dotsContainer.appendChild(dot);
        });

        const dots = document.querySelectorAll('.banner-carousel .dot');

        // --- 2. Core Function: goToSlide ---
        function goToSlide(index) {
            const carousel = document.querySelector('.banner-carousel');
            if (!carousel || !slidesContainer) return; // Safety check

            // Clamp index to be within bounds (looping)
            if (index < 0) {
                index = slides.length - 1;
            } else if (index >= slides.length) {
                index = 0;
            }

            currentIndex = index;
            const activeSlide = slides[currentIndex];
            if (!activeSlide) return; // Safety check

            // Calculate the offset to center the active slide
            const carouselWidth = carousel.offsetWidth;
            const slideOffsetLeft = activeSlide.offsetLeft;
            const slideWidth = activeSlide.offsetWidth;

            // Offset = center of carousel - center of slide
            const offset = (carouselWidth / 2) - (slideOffsetLeft + (slideWidth / 2));

            slidesContainer.style.transform = `translateX(${offset}px)`;

            // Update active classes for slides (for scale/opacity)
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === currentIndex);
            });

            // Update active classes for dots
            if (dots.length > 0) {
                dots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === currentIndex);
                });
            }
        }

        // --- 3. Event Listeners for Buttons ---
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                goToSlide(currentIndex + 1);
                resetInterval();
            });
        }
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                goToSlide(currentIndex - 1);
                resetInterval();
            });
        }

        // --- 4. Auto-play Functionality ---
        function startInterval() {
            clearInterval(slideInterval); // Clear just in case
            slideInterval = setInterval(() => {
                goToSlide(currentIndex + 1);
            }, 5000); // 5 seconds
        }

        function resetInterval() {
            clearInterval(slideInterval);
            startInterval();
        }

        // --- 5. Initial Load & Resize Handling ---
        // Use window.onload to ensure all images are loaded and widths are correct
        window.addEventListener('load', () => {
            goToSlide(currentIndex); // Set initial position
            startInterval(); // Start auto-play
        });

        // Recalculate on window resize
        window.addEventListener('resize', () => {
            goToSlide(currentIndex);
        });

        // Pause on hover
        const carousel = document.querySelector('.banner-carousel');
        if (carousel) {
            carousel.addEventListener('mouseenter', () => clearInterval(slideInterval));
            carousel.addEventListener('mouseleave', startInterval);
        }
    }
    // =========================================================
    // --- END: UPDATED Banner Carousel Logic ---
    // =========================================================


    // Scroll Reveal Animation (Optional - keeping it simple for now)
    // const sections = document.querySelectorAll('.section');
    // const observer = new IntersectionObserver((entries) => {
    //     entries.forEach(entry => {
    //         if (entry.isIntersecting) {
    //             entry.target.classList.add('visible');
    //             observer.unobserve(entry.target);
    //         }
    //     });
    // }, { threshold: 0.1 }); // Adjusted threshold
    // sections.forEach(section => observer.observe(section));


    // Scroll to Top Button
    const scrollToTopBtn = document.getElementById("scrollToTopBtn");
    if (scrollToTopBtn) { // Check if button exists
        window.onscroll = function () { scrollFunction() };
        function scrollFunction() {
            if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
                scrollToTopBtn.style.display = "block";
            } else {
                scrollToTopBtn.style.display = "none";
            }
        }
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

}); // This is the end of your DOMContentLoaded
// });

function closeAlert() {
    const alertBox = document.getElementById('registration-alert');
    if (alertBox) {
        alertBox.style.display = 'none';
        // Remove the padding from body so the nav goes back to top
        document.body.style.paddingTop = '0';
    }
}

// ===== START: PROMO POPUP ADDON =====
const brochureModal = document.getElementById('brochure-modal');
const closeBrochureBtn = document.querySelector('.close-brochure');

if (brochureModal && closeBrochureBtn) {
    setTimeout(() => {
        brochureModal.classList.add('show-brochure');
    }, 1000);

    closeBrochureBtn.addEventListener('click', () => {
        brochureModal.classList.remove('show-brochure');
    });

    window.addEventListener('click', (event) => {
        if (event.target === brochureModal) {
            brochureModal.classList.remove('show-brochure');
        }
    });
}
// ===== END: PROMO POPUP ADDON =====
