const starsContainer = document.getElementById('stars');
const starCount = 300;
for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = `${Math.random() * 100}vw`;
    star.style.top = `${Math.random() * 100}vh`;
    star.style.animationDelay = `${Math.random() * 5}s, ${Math.random() * 40}s`;
    starsContainer.appendChild(star);
}

// Text animation on scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

// Apply observer to h1, planet names, and text boxes
document.querySelectorAll('.h1-m1, .m1-planet-name, .planet-txt-box').forEach(element => {
    observer.observe(element);
});