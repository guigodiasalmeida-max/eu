// Menu mobile
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav__links');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('is-open');
});

// Fecha o menu ao clicar em um link (mobile)
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
  });
});

// Pausa a animação de órbita do hero se o usuário preferir menos movimento
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) {
  const orbitGroup = document.getElementById('orbitGroup');
  if (orbitGroup) orbitGroup.style.animation = 'none';
}

// ---------- Brincadeira 1: efeito "scramble" no nome ao carregar ----------
if (!prefersReducedMotion) {
  const nameEl = document.querySelector('.hero__name');
  if (nameEl) {
    const finalText = nameEl.textContent;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!<>-_\\/[]{}—=+*^?#________';
    let frame = 0;
    const totalFrames = 24;

    function scrambleStep() {
      let output = '';
      const revealCount = Math.floor((frame / totalFrames) * finalText.length);
      for (let i = 0; i < finalText.length; i++) {
        if (finalText[i] === ' ') { output += ' '; continue; }
        if (i < revealCount) {
          output += finalText[i];
        } else {
          output += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      nameEl.textContent = output;
      frame++;
      if (frame <= totalFrames) {
        requestAnimationFrame(() => setTimeout(scrambleStep, 28));
      } else {
        nameEl.textContent = finalText;
      }
    }
    scrambleStep();
  }
}

// ---------- Brincadeira 2: órbita do hero reage ao mouse ----------
const heroVisual = document.querySelector('.hero__visual');
const orbitGroupEl = document.getElementById('orbitGroup');
if (heroVisual && orbitGroupEl && !prefersReducedMotion) {
  heroVisual.addEventListener('mousemove', (e) => {
    const rect = heroVisual.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    orbitGroupEl.style.transform = `rotate(${x * 18}deg) scale(1.04) translate(${x * 8}px, ${y * 8}px)`;
  });
  heroVisual.addEventListener('mouseleave', () => {
    orbitGroupEl.style.transform = '';
  });
}

// ---------- Brincadeira 3: tilt 3D nos itens de trabalho ----------
if (!prefersReducedMotion) {
  document.querySelectorAll('.work-item__link').forEach(item => {
    item.addEventListener('mousemove', (e) => {
      const rect = item.getBoundingClientRect();
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      item.style.transform = `perspective(600px) rotateX(${relY * -3}deg)`;
    });
    item.addEventListener('mouseleave', () => {
      item.style.transform = '';
    });
  });
}

// ---------- Brincadeira 4: botões magnéticos ----------
if (!prefersReducedMotion) {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.4 - 2}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// ---------- Brincadeira 6: campo de bolinhas que fogem do mouse ----------
(function bubbleField() {
  const canvas = document.getElementById('bubbleField');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height, particles;
  const mouse = { x: -9999, y: -9999 };
  const colors = ['rgba(124, 92, 255, 0.55)', 'rgba(255, 209, 102, 0.5)', 'rgba(237, 237, 237, 0.35)'];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createParticles() {
    const count = Math.min(70, Math.floor((width * height) / 18000));
    particles = Array.from({ length: count }, () => {
      const homeX = Math.random() * width;
      const homeY = Math.random() * height;
      return {
        x: homeX,
        y: homeY,
        homeX,
        homeY,
        r: 1.5 + Math.random() * 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        driftAngle: Math.random() * Math.PI * 2,
        driftSpeed: 0.002 + Math.random() * 0.003,
      };
    });
  }

  function tick() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      // deriva lenta ao redor da posição de origem
      p.driftAngle += p.driftSpeed;
      const targetX = p.homeX + Math.cos(p.driftAngle) * 14;
      const targetY = p.homeY + Math.sin(p.driftAngle) * 14;

      // repulsão do mouse
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      const repelRadius = 110;

      let pushX = 0, pushY = 0;
      if (dist < repelRadius) {
        const force = (1 - dist / repelRadius) * 6;
        pushX = (dx / (dist || 1)) * force;
        pushY = (dy / (dist || 1)) * force;
      }

      p.x += (targetX - p.x) * 0.04 + pushX;
      p.y += (targetY - p.y) * 0.04 + pushY;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });

    drawSnake();

    requestAnimationFrame(tick);
  }

  // ---------- Brincadeira 7: cobrinha de bolinhas seguindo o cursor ----------
  const snakeLength = 16;
  const snakeSegments = Array.from({ length: snakeLength }, () => ({ x: -9999, y: -9999 }));
  let snakeActive = false;

  function drawSnake() {
    if (mouse.x < 0 || mouse.y < 0) return;
    if (!snakeActive) {
      // teleporta a cobrinha inteira pra posição do mouse na primeira vez, sem "voar" da esquina
      snakeSegments.forEach(seg => { seg.x = mouse.x; seg.y = mouse.y; });
      snakeActive = true;
    }

    // a cabeça persegue o mouse, cada segmento persegue o anterior
    snakeSegments[0].x += (mouse.x - snakeSegments[0].x) * 0.32;
    snakeSegments[0].y += (mouse.y - snakeSegments[0].y) * 0.32;
    for (let i = 1; i < snakeSegments.length; i++) {
      snakeSegments[i].x += (snakeSegments[i - 1].x - snakeSegments[i].x) * 0.32;
      snakeSegments[i].y += (snakeSegments[i - 1].y - snakeSegments[i].y) * 0.32;
    }

    snakeSegments.forEach((seg, i) => {
      const t = i / (snakeSegments.length - 1);
      const radius = 8 * (1 - t) + 1.5;
      const r = Math.round(124 + (255 - 124) * t);
      const g = Math.round(92 + (209 - 92) * t);
      const b = Math.round(255 + (102 - 255) * t);
      const alpha = 0.85 * (1 - t * 0.7);
      ctx.beginPath();
      ctx.arc(seg.x, seg.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.fill();
    });
  }

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
    snakeActive = false;
  });
  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  resize();
  createParticles();

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    tick();
  } else {
    // desenha uma vez, parado, pra quem prefere menos movimento
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.homeX, p.homeY, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });
  }
})();

// ---------- Brincadeira 5: confete ao clicar no email de contato ----------
const contactEmail = document.querySelector('.contact-email');
if (contactEmail) {
  contactEmail.addEventListener('click', (e) => {
    if (prefersReducedMotion) return;
    const rect = contactEmail.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    const colors = ['#7c5cff', '#ffd166', '#ededed'];

    for (let i = 0; i < 18; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.left = `${originX}px`;
      piece.style.top = `${originY}px`;
      const angle = Math.random() * Math.PI * 2;
      const distance = 60 + Math.random() * 90;
      piece.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
      piece.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
      piece.style.setProperty('--rot', `${Math.random() * 360}deg`);
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 700);
    }
  });
}
