// Main script for EDC Website

document.addEventListener('DOMContentLoaded', () => {
    console.log('EDC Website initialized!');

    // Initialize console code simulation
    animateConsoleDemo();

    // Setup active nav link on scroll
    setupScrollSpy();

    // Button action listeners
    const primaryBtn = document.getElementById('hero-primary-btn');
    if (primaryBtn) {
        primaryBtn.addEventListener('click', () => {
            const featuresSec = document.getElementById('features');
            if (featuresSec) {
                featuresSec.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    const ctaNavBtn = document.getElementById('cta-nav');
    if (ctaNavBtn) {
        ctaNavBtn.addEventListener('click', () => {
            alert('Welcome! Let us know what features or customization you would like to add to this website.');
        });
    }
});

// Simulate commands inside the glass console-demo element
function animateConsoleDemo() {
    const consoleDemo = document.querySelector('.console-demo');
    if (!consoleDemo) return;

    const baseLines = [
        '<span class="prompt">$</span> npm run dev',
        '<span class="success">> Ready in 245ms</span>'
    ];

    const lines = [
        '<span class="prompt">$</span> git status',
        'On branch main',
        'Your branch is up to date with \'origin/main\'.',
        'nothing to commit, working tree clean',
        '<span class="prompt">$</span> npm run dev',
        '<span class="success">> Ready in 120ms</span>',
        '<span class="success">> Local: http://localhost:5173</span>'
    ];

    let currentLineIndex = 0;
    
    // Add text periodically to show dynamic life
    setInterval(() => {
        if (currentLineIndex < lines.length) {
            if (currentLineIndex === 0) {
                consoleDemo.innerHTML = '';
            }
            consoleDemo.innerHTML += (currentLineIndex > 0 ? '<br>' : '') + lines[currentLineIndex];
            currentLineIndex++;
        } else {
            // reset after some time
            setTimeout(() => {
                consoleDemo.innerHTML = baseLines.join('<br>');
                currentLineIndex = 0;
            }, 5000);
        }
    }, 2000);
}

// Track scrolling to highlight navigation links
function setupScrollSpy() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });
}
