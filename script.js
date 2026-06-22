/**
 * Singh RTO Services - Main Interactivity Script
 * Includes Stats Counter, Responsive Menu, Active State Navigation,
 * and Form Submission handling with success feedback.
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Navigation Menu Toggle
    const mobileNavToggle = document.getElementById('mobileNavToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    if (mobileNavToggle && navMenu) {
        mobileNavToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileNavToggle.classList.toggle('active');
            
            // Toggle hamburger animation state
            const bars = mobileNavToggle.querySelectorAll('.bar');
            if (mobileNavToggle.classList.contains('active')) {
                bars[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
                bars[1].style.opacity = '0';
                bars[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
            } else {
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
            }
        });
        // Close menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileNavToggle.classList.remove('active');
                
                const bars = mobileNavToggle.querySelectorAll('.bar');
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
            });
        });
    }
    // 2. Active Link Highlighting on Scroll (Intersection Observer)
    const sections = document.querySelectorAll('section');
    
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px', // Trigger when section occupies the middle view
        threshold: 0
    };
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);
    sections.forEach(section => {
        sectionObserver.observe(section);
    });
    // 3. Stats Counter Animation
    const statsSection = document.querySelector('.stats');
    const statNumbers = document.querySelectorAll('.stat-number');
    let animated = false;
    const animateCounters = () => {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'), 10);
            let current = 0;
            const duration = 2000; // 2 seconds
            const stepTime = Math.max(Math.floor(duration / target), 15);
            
            const timer = setInterval(() => {
                current += Math.ceil(target / (duration / stepTime));
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                
                // Add suffix back
                if (stat.textContent.includes('+')) {
                    stat.textContent = current + '+';
                } else if (stat.textContent.includes('%')) {
                    stat.textContent = current + '%';
                } else {
                    stat.textContent = current;
                }
            }, stepTime);
        });
    };
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animated) {
                    animateCounters();
                    animated = true;
                }
            });
        }, { threshold: 0.3 });
        statsObserver.observe(statsSection);
    }
    // 4. Form Submission Handling (Modal Trigger)
    const contactForm = document.getElementById('rtoContactForm');
    const successModal = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (contactForm && successModal) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Gather form data
            const name = document.getElementById('userName').value.trim();
            const phone = document.getElementById('userPhone').value.trim();
            const service = document.getElementById('rtoService').value;
            const message = document.getElementById('userMessage').value.trim();
            // Perform simple validations
            if (!name || !phone || !service) {
                alert('Please fill out all required fields.');
                return;
            }
            // Disable submit button during request
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
            // Send actual POST request to Express backend
            fetch('/api/inquiry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, phone, service, message })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    // Trigger Modal with glassmorphic transition
                    successModal.classList.add('active');
                    // Reset form
                    contactForm.reset();
                } else {
                    alert(data.message || 'Something went wrong. Please try again.');
                }
            })
            .catch(error => {
                console.error('Submission Error:', error);
                alert('We encountered a connection error. Please call us or try again.');
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            });
        });
    }
    // Close success modal
    if (closeModalBtn && successModal) {
        closeModalBtn.addEventListener('click', () => {
            successModal.classList.remove('active');
        });
        // Close on clicking outside the modal content
        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) {
                successModal.classList.remove('active');
            }
        });
    }
    // 5. Desktop WhatsApp tooltip nudge
    const desktopWhatsapp = document.getElementById('desktopWhatsappBubble');
    if (desktopWhatsapp) {
        // Subtle animation nudge after 5 seconds
        setTimeout(() => {
            desktopWhatsapp.style.transform = 'scale(1.25) rotate(10deg)';
            setTimeout(() => {
                desktopWhatsapp.style.transform = '';
            }, 500);
        }, 5000);
    }
});
