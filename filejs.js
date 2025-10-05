// Gestione menu e navigazione
document.addEventListener('DOMContentLoaded', function() {
    initializeMenu();
    initializeForms();
    initializeScrollAnimations();
    initializeAccessibility();
});

// Inizializzazione menu
function initializeMenu() {
    const menuLinks = document.querySelectorAll('nav.menu a[data-target]');
    
    menuLinks.forEach(link => {
        link.addEventListener('click', handleMenuClick);
        
        // Aggiunge supporto per navigazione da tastiera
        link.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleMenuClick.call(this, e);
            }
        });
    });
}

// Gestione click menu
function handleMenuClick(e) {
    e.preventDefault();
    const targetId = this.getAttribute('data-target');
    const targetSection = document.getElementById(targetId);

    if (!targetSection) return;

    // Nascondi tutte le sezioni a scomparsa
    document.querySelectorAll('section:not(.always-visible)')
        .forEach(sec => sec.classList.remove('active'));

    // Gestione sezioni
    if (!targetSection.classList.contains('always-visible')) {
        targetSection.classList.add('active');
        smoothScrollTo(targetSection);
    } else {
        smoothScrollTo(targetSection);
    }

    // Aggiorna stato attivo nel menu
    updateActiveMenuItem(this);
}

// Scroll fluido migliorato
function smoothScrollTo(element) {
    const headerOffset = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

// Aggiorna elemento attivo nel menu
function updateActiveMenuItem(activeLink) {
    document.querySelectorAll('nav.menu a').forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}

// Gestione form candidatura per offerte
function toggleForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const isVisible = form.classList.contains('show');
    
    // Chiudi tutti gli altri form
    document.querySelectorAll('.form-candidatura-offerta.show')
        .forEach(f => f.classList.remove('show'));
    
    // Toggle del form corrente
    if (!isVisible) {
        form.classList.add('show');
        // Focus sul primo campo del form
        const firstInput = form.querySelector('input, textarea, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 300);
        }
    }
}

// Inizializzazione animazioni al scroll
function initializeScrollAnimations() {
    // Intersection Observer per animazioni al scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Aggiungi classe animate con un piccolo delay per effetto staggered
                const delay = Array.from(entry.target.parentNode.children).indexOf(entry.target) * 100;
                setTimeout(() => {
                    entry.target.classList.add('animate');
                }, delay);
                
                // Smetti di osservare questo elemento
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Osserva tutti gli elementi che devono essere animati
    const elementsToAnimate = document.querySelectorAll(
        '.servizio, .riquadro, .annuncio-lavoro'
    );
    
    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });
}

// Inizializzazione form
function initializeForms() {
    // Form candidatura spontanea
    const candidaturaForm = document.getElementById('candidatura-form');
    if (candidaturaForm) {
        candidaturaForm.addEventListener('submit', handleFormSubmission);
    }

    // Form info
    const infoForm = document.getElementById('info-form');
    if (infoForm) {
        infoForm.addEventListener('submit', handleFormSubmission);
    }

    // Form offerte di lavoro
    document.querySelectorAll('.job-form').forEach((form, index) => {
        form.addEventListener('submit', function(e) {
            handleJobFormSubmission.call(this, e, index + 1);
        });
    });

    // Validazione in tempo reale
    initializeFormValidation();
}

// Gestione invio form generici
async function handleFormSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('.btn-submit');
    const successMessage = form.parentElement.querySelector('.success-message') || 
                          document.getElementById('success-message') ||
                          document.getElementById('info-success');
    
    // Stato di caricamento
    setLoadingState(submitBtn, true);
    
    try {
        const formData = new FormData(form);
        
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            showSuccessMessage(successMessage);
            form.reset();
            
            // Analytics tracking (se disponibile)
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_submit', {
                    'event_category': 'engagement',
                    'event_label': form.id || 'contact_form'
                });
            }
        } else {
            throw new Error('Errore del server');
        }
    } catch (error) {
        console.error('Errore invio form:', error);
        showErrorMessage('Si è verificato un errore. Riprova più tardi.');
    } finally {
        setLoadingState(submitBtn, false);
    }
}

// Gestione form offerte di lavoro
async function handleJobFormSubmission(e, formIndex) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('.btn-submit');
    const successMessage = document.getElementById(success-message-${formIndex});
    
    setLoadingState(submitBtn, true);
    
    try {
        const formData = new FormData(form);
        
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            showSuccessMessage(successMessage);
            form.reset();
            
            // Chiudi il form dopo l'invio
            setTimeout(() => {
                const formContainer = form.closest('.form-candidatura-offerta');
                if (formContainer) {
                    formContainer.classList.remove('show');
                }
            }, 3000);
        } else {
            throw new Error('Errore del server');
        }
    } catch (error) {
        console.error('Errore invio candidatura:', error);
        showErrorMessage('Si è verificato un errore. Riprova più tardi.');
    } finally {
        setLoadingState(submitBtn, false);
    }
}

// Stato di caricamento pulsanti
function setLoadingState(button, isLoading) {
    if (!button) return;
    
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = '<span class="loading"></span> Invio in corso...';
    } else {
        button.disabled = false;
        button.innerHTML = button.textContent.includes('Candidatura') ? 
            'Invia Candidatura' : 'Invia richiesta';
    }
}

// Mostra messaggio di successo
function showSuccessMessage(element) {
    if (!element) return;
    
    element.style.display = 'block';
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Nascondi automaticamente dopo 5 secondi
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// Mostra messaggio di errore
function showErrorMessage(message) {
    // Crea un elemento di errore temporaneo
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f8d7da;
        color: #721c24;
        padding: 15px 20px;
        border-radius: 8px;
        border: 1px solid #f5c6cb;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    // Rimuovi dopo 5 secondi
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Validazione form in tempo reale
function initializeFormValidation() {
    const emailInputs = document.querySelectorAll('input[type="email"]');
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    
    emailInputs.forEach(input => {
        input.addEventListener('blur', validateEmail);
    });
    
    phoneInputs.forEach(input => {
        input.addEventListener('blur', validatePhone);
    });
}

// Validazione email
function validateEmail(e) {
    const email = e.target.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
        showFieldError(e.target, 'Inserisci un indirizzo email valido');
    } else {
        clearFieldError(e.target);
    }
}

// Validazione telefono
function validatePhone(e) {
    const phone = e.target.value;
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    
    if (phone && !phoneRegex.test(phone)) {
        showFieldError(e.target, 'Inserisci un numero di telefono valido');
    } else {
        clearFieldError(e.target);
    }
}

// Mostra errore campo
function showFieldError(field, message) {
    clearFieldError(field);
    
    const errorSpan = document.createElement('span');
    errorSpan.className = 'field-error';
    errorSpan.style.cssText = 'color: #dc3545; font-size: 14px; margin-top: 5px; display: block;';
    errorSpan.textContent = message;
    
    field.style.borderColor = '#dc3545';
    field.parentNode.appendChild(errorSpan);
}

// Rimuovi errore campo
function clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    field.style.borderColor = '#f6d1d1';
}

// Inizializzazione accessibilità
function initializeAccessibility() {
    // Skip link per navigazione da tastiera
    addSkipLink();
    
    // Gestione focus trap nei modal/dropdown
    initializeFocusTrap();
    
    // Annunci per screen reader
    initializeAriaLive();
}

// Aggiunge skip link
function addSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Salta al contenuto principale';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #001f3f;
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
}

// Focus trap per dropdown
function initializeFocusTrap() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('a');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (!trigger || !menu) return;
        
        trigger.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const firstLink = menu.querySelector('a');
                if (firstLink) firstLink.focus();
            }
        });
        
        menu.addEventListener('keydown', function(e) {
            const links = menu.querySelectorAll('a');
            const currentIndex = Array.from(links).indexOf(document.activeElement);
            
            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    const nextIndex = (currentIndex + 1) % links.length;
                    links[nextIndex].focus();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    const prevIndex = (currentIndex - 1 + links.length) % links.length;
                    links[prevIndex].focus();
                    break;
                case 'Escape':
                    trigger.focus();
                    break;
            }
        });
    });
}

// Inizializza regioni live per screen reader
function initializeAriaLive() {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'live-region';
    document.body.appendChild(liveRegion);
}

// Annuncia messaggi agli screen reader
function announceToScreenReader(message) {
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
        liveRegion.textContent = message;
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    }
}

// Utility: Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Gestione resize window
window.addEventListener('resize', debounce(function() {
    // Aggiorna layout se necessario
    updateLayoutOnResize();
}, 250));

function updateLayoutOnResize() {
    // Chiudi dropdown aperti su mobile
    if (window.innerWidth <= 768) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.style.display = 'none';
        });
    }
}

// Esporta funzioni per uso globale
window.toggleForm = toggleForm;
window.announceToScreenReader = announceToScreenReader;