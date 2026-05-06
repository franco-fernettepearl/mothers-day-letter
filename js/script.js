(function() {
    // DOM Elements
    const wrapper = document.getElementById('envelopeWrapper');
    const openBtn = document.getElementById('openBtn');
    let isOpened = false;

    // Open letter function
    function openLetter() {
        if(isOpened) return;
        isOpened = true;
        wrapper.classList.add('open');
        startConfettiExplosion();
        createFloatingHearts();
    }

    // Event listeners
    wrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        openLetter();
    });

    openBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openLetter();
    });

    // Confetti System
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');
    let animationId = null;
    let particles = [];
    let confettiActive = false;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', () => {
        resizeCanvas();
        if(confettiActive && particles.length > 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    });
    resizeCanvas();

    class ConfettiParticle {
        constructor(x, y, vx, vy, size, color, rotation, spin) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.size = size;
            this.color = color;
            this.rotation = rotation || 0;
            this.spin = spin || (Math.random() - 0.5) * 0.1;
            this.alpha = 1;
            this.decay = 0.98 + Math.random() * 0.01;
            this.gravity = 0.2;
            this.frictionAir = 0.99;
        }

        update() {
            this.vx *= this.frictionAir;
            this.vy += this.gravity;
            this.vy *= this.frictionAir;
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.spin;
            this.alpha *= 0.99;
            return (this.y < canvas.height + 100 && this.alpha > 0.02 && 
                    this.x > -100 && this.x < canvas.width + 100);
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.alpha * 0.9;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
            ctx.restore();
        }
    }

    function burstConfetti(count, originX, originY) {
        const colors = ['#ff4d6d', '#ff8fa3', '#ffb3c6', '#ffc2d1', '#ffd9e8', 
                       '#ffe3e8', '#fbc4c0', '#f8ad9d', '#f4978e', '#f7c59f', '#ffb7c5'];
        for(let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 6;
            const vx = Math.cos(angle) * speed * (Math.random() * 1.5);
            const vy = Math.sin(angle) * speed * (Math.random() * 1.2) - 4;
            const size = 5 + Math.random() * 11;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const rot = Math.random() * Math.PI * 2;
            const spin = (Math.random() - 0.5) * 0.2;
            const x = originX !== undefined ? originX : canvas.width/2;
            const y = originY !== undefined ? originY : canvas.height/3;
            particles.push(new ConfettiParticle(x, y, vx, vy, size, color, rot, spin));
        }
    }

    function startConfettiExplosion() {
        if(confettiActive && particles.length > 0) return;
        confettiActive = true;

        const rect = wrapper.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 3;

        // Multiple bursts
        burstConfetti(120, centerX, centerY);
        
        setTimeout(() => {
            burstConfetti(80, centerX, centerY + 20);
        }, 150);
        
        setTimeout(() => {
            burstConfetti(60, centerX - 15, centerY + 10);
            burstConfetti(60, centerX + 15, centerY + 10);
        }, 300);
        
        setTimeout(() => {
            burstConfetti(100, canvas.width/2, canvas.height/2.5);
        }, 550);

        // Gentle rain of confetti
        let intervalCount = 0;
        const rainInterval = setInterval(() => {
            if(!confettiActive && particles.length === 0) {
                clearInterval(rainInterval);
                return;
            }
            for(let i = 0; i < 15; i++) {
                const fromX = Math.random() * canvas.width;
                const fromY = -10;
                const vx = (Math.random() - 0.5) * 3.5;
                const vy = 2 + Math.random() * 6;
                const size = 4 + Math.random() * 8;
                const colorsLight = ['#ffb7c5', '#ff9eb5', '#ffc8dd', '#ffb3ba', '#ffdfbf', '#ffe0f0'];
                const color = colorsLight[Math.floor(Math.random() * colorsLight.length)];
                particles.push(new ConfettiParticle(fromX, fromY, vx, vy, size, color, Math.random() * Math.PI * 2));
            }
            intervalCount++;
            if(intervalCount > 20) clearInterval(rainInterval);
        }, 600);

        function animateConfetti() {
            if(!confettiActive && particles.length === 0) {
                if(animationId) cancelAnimationFrame(animationId);
                animationId = null;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let keepAlive = false;
            for(let i = particles.length - 1; i >= 0; i--) {
                const alive = particles[i].update();
                if(alive) {
                    particles[i].draw(ctx);
                    keepAlive = true;
                } else {
                    particles.splice(i, 1);
                }
            }
            if(keepAlive || particles.length > 0) {
                animationId = requestAnimationFrame(animateConfetti);
            } else {
                confettiActive = false;
                if(animationId) cancelAnimationFrame(animationId);
                animationId = null;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
        
        if(animationId) cancelAnimationFrame(animationId);
        animateConfetti();
    }

    // Floating hearts effect
    function createFloatingHearts() {
        const heartsContainer = document.getElementById('floatingHearts');
        
        for(let i = 0; i < 15; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.innerHTML = ['❤️', '💖', '💗', '💓', '💕', '💝'][Math.floor(Math.random() * 6)];
                heart.style.position = 'fixed';
                heart.style.left = Math.random() * 100 + '%';
                heart.style.bottom = '-20px';
                heart.style.fontSize = (20 + Math.random() * 30) + 'px';
                heart.style.opacity = '0.8';
                heart.style.pointerEvents = 'none';
                heart.style.zIndex = '1000';
                heart.style.animation = `floatHeart ${3 + Math.random() * 3}s linear forwards`;
                heart.style.filter = 'drop-shadow(0 2px 5px rgba(0,0,0,0.1))';
                
                heartsContainer.appendChild(heart);
                
                setTimeout(() => {
                    heart.remove();
                }, 4000);
            }, i * 200);
        }
    }

    // Add floating hearts animation to stylesheet
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
        @keyframes floatHeart {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 0.8;
            }
            100% {
                transform: translateY(-100vh) rotate(20deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(styleSheet);
})();