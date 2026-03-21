(function () {
    const canvas = document.getElementById('three-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Mouse tracking
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    // ---- Particle System ----
    const particleCount = 2000;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const colorPalette = [
        new THREE.Color(0x00e5ff), // Cyan
        new THREE.Color(0xa855f7), // Purple
        new THREE.Color(0xec4899), // Pink
        new THREE.Color(0x3b82f6), // Blue
    ];

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 50;
        positions[i3 + 1] = (Math.random() - 0.5) * 50;
        positions[i3 + 2] = (Math.random() - 0.5) * 30 - 5;

        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;

        sizes[i] = Math.random() * 3 + 0.5;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Custom shader material for particles
    const particleMaterial = new THREE.ShaderMaterial({
        vertexShader: `
            attribute float size;
            varying vec3 vColor;
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            void main() {
                float dist = length(gl_PointCoord - vec2(0.5));
                if (dist > 0.5) discard;
                float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
                gl_FragColor = vec4(vColor, alpha * 0.6);
            }
        `,
        transparent: true,
        vertexColors: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // // ---- Geometric wireframe shapes ----
    // const shapes = [];

    // // Torus
    // const torusGeo = new THREE.TorusGeometry(3, 0.8, 16, 50);
    // const wireframeMat = new THREE.MeshBasicMaterial({
    //     color: 0x00e5ff,
    //     wireframe: true,
    //     transparent: true,
    //     opacity: 0.06,
    // });
    // const torus = new THREE.Mesh(torusGeo, wireframeMat);
    // torus.position.set(12, 5, -15);
    // scene.add(torus);
    // shapes.push({ mesh: torus, rotSpeed: { x: 0.003, y: 0.005, z: 0 } });

    // // Icosahedron
    // const icoGeo = new THREE.IcosahedronGeometry(2.5, 0);
    // const icoMat = new THREE.MeshBasicMaterial({
    //     color: 0xa855f7,
    //     wireframe: true,
    //     transparent: true,
    //     opacity: 0.06,
    // });
    // const ico = new THREE.Mesh(icoGeo, icoMat);
    // ico.position.set(-14, -6, -12);
    // scene.add(ico);
    // shapes.push({ mesh: ico, rotSpeed: { x: 0.004, y: 0.002, z: 0.003 } });

    // // Octahedron
    // const octGeo = new THREE.OctahedronGeometry(2, 0);
    // const octMat = new THREE.MeshBasicMaterial({
    //     color: 0xec4899,
    //     wireframe: true,
    //     transparent: true,
    //     opacity: 0.05,
    // });
    // const oct = new THREE.Mesh(octGeo, octMat);
    // oct.position.set(8, -8, -10);
    // scene.add(oct);
    // shapes.push({ mesh: oct, rotSpeed: { x: 0.002, y: 0.004, z: 0.001 } });

    // camera.position.z = 15;

    // // ---- Connection Lines ----
    // const lineMaterial = new THREE.LineBasicMaterial({
    //     color: 0x00e5ff,
    //     transparent: true,
    //     opacity: 0.03,
    // });

    // const connectionDistance = 5;
    // let linesMesh;

    // function updateConnections() {
    //     if (linesMesh) scene.remove(linesMesh);
    //     const linePositions = [];
    //     const posArr = particleGeometry.attributes.position.array;

    //     for (let i = 0; i < Math.min(particleCount, 200); i++) {
    //         for (let j = i + 1; j < Math.min(particleCount, 200); j++) {
    //             const dx = posArr[i * 3] - posArr[j * 3];
    //             const dy = posArr[i * 3 + 1] - posArr[j * 3 + 1];
    //             const dz = posArr[i * 3 + 2] - posArr[j * 3 + 2];
    //             const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    //             if (dist < connectionDistance) {
    //                 linePositions.push(posArr[i * 3], posArr[i * 3 + 1], posArr[i * 3 + 2]);
    //                 linePositions.push(posArr[j * 3], posArr[j * 3 + 1], posArr[j * 3 + 2]);
    //             }
    //         }
    //     }

    //     if (linePositions.length > 0) {
    //         const lineGeo = new THREE.BufferGeometry();
    //         lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    //         linesMesh = new THREE.LineSegments(lineGeo, lineMaterial);
    //         scene.add(linesMesh);
    //     }
    // }

    // ---- Animation Loop ----
    let frameCount = 0;

    function animate() {
        requestAnimationFrame(animate);
        frameCount++;

        // Smooth mouse follow
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;

        // Rotate particle system with mouse
        particles.rotation.x = mouse.y * 0.3;
        particles.rotation.y = mouse.x * 0.3;

        // Slight auto-rotation
        particles.rotation.z += 0.0005;

        // Animate particles float
        const posArr = particleGeometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            posArr[i3 + 1] += Math.sin(frameCount * 0.005 + i * 0.1) * 0.003;
        }
        particleGeometry.attributes.position.needsUpdate = true;

        // Rotate geometric shapes
        // shapes.forEach((s) => {
        //     s.mesh.rotation.x += s.rotSpeed.x;
        //     s.mesh.rotation.y += s.rotSpeed.y;
        //     s.mesh.rotation.z += s.rotSpeed.z;
        // });

        // Update connections every 10 frames for performance
        // if (frameCount % 10 === 0) {
        //     updateConnections();
        // }

        renderer.render(scene, camera);
    }

    animate();

    // ---- Event Listeners ----
    window.addEventListener('mousemove', (e) => {
        mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
})();

// ============================================
// CUSTOM CURSOR
// ============================================
(function () {
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');

    if (!dot || !ring) return;

    let cursorX = 0, cursorY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;

        dot.style.left = cursorX + 'px';
        dot.style.top = cursorY + 'px';
    });

    function animateRing() {
        ringX += (cursorX - ringX) * 0.15;
        ringY += (cursorY - ringY) * 0.15;

        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';

        requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover effect
    const hoverElements = document.querySelectorAll('a, button, .project-card, .skill-card');
    hoverElements.forEach((el) => {
        el.addEventListener('mouseenter', () => ring.classList.add('hover'));
        el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
})();

// ============================================
// NAVBAR
// ============================================
(function () {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    const links = document.querySelectorAll('.nav-link');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Hamburger toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close mobile menu on link click
    links.forEach((link) => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Active link on scroll
    const sections = document.querySelectorAll('.section');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach((section) => {
            const sectionTop = section.offsetTop - 200;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        links.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === current) {
                link.classList.add('active');
            }
        });
    });
})();

// ============================================
// TYPEWRITER EFFECT
// ============================================
(function () {
    const element = document.getElementById('typewriter');
    const texts = [
        'Machine Learning Engineer',
        'Android App Developer',
        'Deep Learning Enthusiast',
        'Computer Vision Developer',
    ];

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        const currentText = texts[textIndex];

        if (isDeleting) {
            element.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            element.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }

        if (!isDeleting && charIndex === currentText.length) {
            isDeleting = true;
            typingSpeed = 2000; // Pause before deleting
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typingSpeed = 500; // Pause before typing new text
        }

        setTimeout(type, typingSpeed);
    }

    type();
})();

// ============================================
// SCROLL ANIMATIONS (Intersection Observer)
// ============================================
(function () {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const delay = entry.target.getAttribute('data-delay') || 0;
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, parseInt(delay));
                }
            });
        },
        {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px',
        }
    );

    animatedElements.forEach((el) => observer.observe(el));
})();

// ============================================
// SKILL BAR ANIMATION
// ============================================
(function () {
    const skillFills = document.querySelectorAll('.skill-fill');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const width = entry.target.getAttribute('data-width');
                    entry.target.style.width = width + '%';
                    entry.target.classList.add('animate');
                }
            });
        },
        { threshold: 0.5 }
    );

    skillFills.forEach((fill) => observer.observe(fill));
})();

// ============================================
// COUNTER ANIMATION
// ============================================
(function () {
    const counters = document.querySelectorAll('.stat-number');
    let animated = false;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !animated) {
                    animated = true;
                    counters.forEach((counter) => {
                        const target = parseInt(counter.getAttribute('data-count'));
                        const duration = 2000;
                        const step = target / (duration / 16);
                        let current = 0;

                        function updateCounter() {
                            current += step;
                            if (current < target) {
                                counter.textContent = Math.floor(current);
                                requestAnimationFrame(updateCounter);
                            } else {
                                counter.textContent = target;
                            }
                        }

                        updateCounter();
                    });
                }
            });
        },
        { threshold: 0.5 }
    );

    counters.forEach((counter) => observer.observe(counter));
})();

// ============================================
// CONTACT FORM
// ============================================
(function () {
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form values
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();

        // Simple validation
        if (!name || !email || !subject || !message) {
            status.textContent = 'Please fill in all fields.';
            status.className = 'form-status show error';
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            status.textContent = 'Please enter a valid email address.';
            status.className = 'form-status show error';
            return;
        }

        // Simulate submission
        const btn = form.querySelector('.btn-submit');
        btn.innerHTML = '<span>Sending...</span>';
        btn.disabled = true;

        setTimeout(() => {
            status.textContent = '✨ Message sent successfully! I\'ll get back to you soon.';
            status.className = 'form-status show success';
            form.reset();
            btn.innerHTML = '<span>Send Message</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>';
            btn.disabled = false;

            setTimeout(() => {
                status.className = 'form-status';
            }, 5000);
        }, 1500);
    });
})();

// ============================================
// SMOOTH SCROLL
// ============================================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
