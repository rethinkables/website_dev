/* =========================================================================
   The verification field — hero only, deliberately near-still.
   A slow, low-contrast drift of marks: most green (verified),
   a few gold (flagged). Atmosphere, not animation. The eye should
   barely register it moving. Reduced-motion draws a single frame.
   ========================================================================= */
(function () {
  const canvas = document.getElementById('field');
  if (!canvas || typeof THREE === 'undefined') return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 100);
  camera.position.z = 28;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);

  // palette tuned to the paper background — low contrast, premium restraint
  const GREEN = new THREE.Color(0x0A3F31);
  const GREEN_SOFT = new THREE.Color(0x0E5140);
  const GOLD = new THREE.Color(0xB57E1F);

  const COUNT = window.innerWidth <= 768 ? 46 : 78;   // sparse, not busy
  const FLAGGED = 5;
  const group = new THREE.Group();
  scene.add(group);

  const barGeo = new THREE.PlaneGeometry(0.30, 0.82);
  const marks = [];

  for (let i = 0; i < COUNT; i++) {
    const flagged = i < FLAGGED;
    const base = flagged ? GOLD : (Math.random() > 0.5 ? GREEN : GREEN_SOFT);
    const mat = new THREE.MeshBasicMaterial({
      color: base,
      transparent: true,
      // deliberately faint: the field is a texture, not a feature
      opacity: flagged ? 0.30 : (0.05 + Math.random() * 0.09),
      depthWrite: false,
    });
    const m = new THREE.Mesh(barGeo, mat);
    m.position.set(
      (Math.random() - 0.5) * 66,
      (Math.random() - 0.5) * 44,
      (Math.random() - 0.5) * 22
    );
    m.userData = {
      driftY: 0.0016 + Math.random() * 0.0040,   // very slow
      swayFreq: 0.10 + Math.random() * 0.22,
      phase: Math.random() * Math.PI * 2,
      flagged,
      pulse: 0.28 + Math.random() * 0.4,
    };
    group.add(m);
    marks.push(m);
  }

  // barely-there parallax
  let tX = 0, tY = 0, cX = 0, cY = 0;
  if (!reduced) {
    window.addEventListener('pointermove', (e) => {
      tX = (e.clientX / window.innerWidth - 0.5) * 2;
      tY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  const clock = new THREE.Clock();

  function frame() {
    const t = clock.getElapsedTime();
    for (const m of marks) {
      const u = m.userData;
      m.position.y += u.driftY;
      if (m.position.y > 23) m.position.y = -23;
      m.position.x += Math.sin(t * u.swayFreq + u.phase) * 0.0014;
      if (u.flagged) {
        m.material.opacity = 0.22 + Math.sin(t * u.pulse + u.phase) * 0.10;
      }
    }
    cX += (tX - cX) * 0.02;
    cY += (tY - cY) * 0.02;
    group.rotation.y = cX * 0.06;
    group.rotation.x = -cY * 0.04;
    renderer.render(scene, camera);
    if (!reduced) requestAnimationFrame(frame);
  }

  if (reduced) renderer.render(scene, camera);
  else frame();
})();
