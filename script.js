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

    // ===== START: COUNTDOWN TIMER LOGIC =====
    function startCountdown() {
        const countDownDate = new Date("Dec 1, 2025 00:00:00").getTime();
        const daysEl = document.getElementById("days");
        const hoursEl = document.getElementById("hours");
        const minutesEl = document.getElementById("minutes");
        const secondsEl = document.getElementById("seconds");

        if (!daysEl || !hoursEl || !minutesEl || !secondsEl) {
            console.error("Countdown elements not found!");
            return; // Exit if elements are missing
        }

        const countdownFunction = setInterval(function () {
            const now = new Date().getTime();
            const distance = countDownDate - now;

            // Time calculations
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Output the result in elements
            daysEl.textContent = days < 10 ? '0' + days : days;
            hoursEl.textContent = hours < 10 ? '0' + hours : hours;
            minutesEl.textContent = minutes < 10 ? '0' + minutes : minutes;
            secondsEl.textContent = seconds < 10 ? '0' + seconds : seconds;

            // If the count down is finished, write some text
            if (distance < 0) {
                clearInterval(countdownFunction);
                document.getElementById("countdown-timer").innerHTML = "<div class='event-live'>Event is LIVE!</div>"; // Or some other message
            }
        }, 1000);
    }
    startCountdown(); // Start the countdown on page load
    // ===== END: COUNTDOWN TIMER LOGIC =====

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
