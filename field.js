document.addEventListener('DOMContentLoaded', () => {
    const checkThree = setInterval(() => {
        if (typeof THREE !== 'undefined') {
            clearInterval(checkThree);
            initThreeJS();
        }
    }, 100);

    function initThreeJS() {
        const container = document.getElementById('canvas-container');
        if (!container) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#051a14'); 
        
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 35;
        
        const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 
        container.appendChild(renderer.domElement);

        // Secure Data Block Geometry
        const geometry = new THREE.IcosahedronGeometry(18, 1);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xB57E1F, 
            wireframe: true,
            transparent: true,
            opacity: 0.15 
        });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        // Ground Truth Nodes
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 250; 
        const posArray = new Float32Array(particlesCount * 3);
        
        for(let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 70;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.12,
            color: 0xB57E1F,
            transparent: true,
            opacity: 0.5
        });
        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        const clock = new THREE.Clock();
        
        function animate() {
            requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();
            
            // Slow, deliberate rotation representing stability
            sphere.rotation.y = elapsedTime * 0.04;
            sphere.rotation.x = elapsedTime * 0.02;
            particlesMesh.rotation.y = elapsedTime * 0.015;
            
            renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
});
