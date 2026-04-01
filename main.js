
const ThemeManager = (() => {
  const KEY = 'chs-theme';
  let current = localStorage.getItem(KEY) || 'light';

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelectorAll('[data-theme-icon]').forEach(el => {
      el.textContent = theme === 'dark' ? '☀️' : '🌙';
    });
    current = theme;
    localStorage.setItem(KEY, theme);
  }

  function toggle() { apply(current === 'dark' ? 'light' : 'dark'); }

  function init() {
    apply(current);
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', toggle);
    });
  }

  return { init, toggle, apply };
})();

// ── RTL Support ────────────────────────────────
const RTLManager = (() => {
  const KEY = 'chs-dir';
  let current = localStorage.getItem(KEY) || 'ltr';

  function apply(dir) {
    document.documentElement.setAttribute('dir', dir);
    document.querySelectorAll('[data-rtl-icon]').forEach(el => {
      el.textContent = dir === 'rtl' ? '↔ LTR' : '↔ RTL';
    });
    current = dir;
    localStorage.setItem(KEY, dir);
  }

  function toggle() { apply(current === 'rtl' ? 'ltr' : 'rtl'); }

  function init() {
    apply(current);
    document.querySelectorAll('[data-rtl-toggle]').forEach(btn => {
      btn.addEventListener('click', toggle);
    });
  }

  return { init };
})();

// ── Mobile Nav ─────────────────────────────────
const NavManager = (() => {
  function init() {
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav');

    if (!hamburger || !mobileNav) return;

    hamburger.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
      hamburger.textContent = mobileNav.classList.contains('open') ? '✕' : '☰';
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
        mobileNav.classList.remove('open');
        hamburger.textContent = '☰';
      }
    });
  }

  return { init };
})();

// ── Scroll Reveal ──────────────────────────────
const ScrollReveal = (() => {
  function init() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.1 });

    els.forEach(el => obs.observe(el));
  }

  return { init };
})();

// ── Form Validation ────────────────────────────
const FormValidator = (() => {
  const rules = {
    fullName(v) {
      v = v.trim();
      if (!v) return 'Full name is required.';
      if (v.length < 2) return 'Name must be at least 2 characters.';
      if (v.length > 50) return 'Name must be at most 50 characters.';
      if (!/^[A-Za-z]+( [A-Za-z]+)*$/.test(v)) return 'Only letters and single spaces allowed. No numbers or special characters.';
      return '';
    },
    phone(v) {
      v = v.trim();
      if (!v) return 'Phone number is required.';
      if (!/^[0-9]{10}$/.test(v)) return 'Enter exactly 10 digits.';
      if (!/^[6-9]/.test(v)) return 'Phone number must start with 6, 7, 8, or 9.';
      return '';
    },
    email(v) {
      v = v.trim();
      if (!v) return 'Email is required.';
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/i.test(v)) return 'Enter a valid email ending with .com.';
      return '';
    },
    password(v) {
      if (!v) return 'Password is required.';
      if (v.length < 8) return 'Password must be at least 8 characters.';
      if (/\s/.test(v)) return 'Password must not contain spaces.';
      if (!/[A-Z]/.test(v)) return 'Must include at least one uppercase letter.';
      if (!/[a-z]/.test(v)) return 'Must include at least one lowercase letter.';
      if (!/[0-9]/.test(v)) return 'Must include at least one number.';
      if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v)) return 'Must include at least one special character.';
      return '';
    },
    confirmPassword(v, pwField) {
      if (!v) return 'Please confirm your password.';
      const pw = document.querySelector(pwField);
      if (pw && v !== pw.value) return 'Passwords do not match.';
      return '';
    },
    message(v) {
      if (!v.trim()) return 'Message is required.';
      if (v.trim().length < 10) return 'Message must be at least 10 characters.';
      return '';
    },
    subject(v) {
      if (!v.trim()) return 'Subject is required.';
      return '';
    },
    terms(checked) {
      if (!checked) return 'You must agree to the terms.';
      return '';
    }
  };

  function showError(input, msg) {
    const errEl = document.querySelector(`[data-error="${input.dataset.validate}"]`) ||
      input.parentElement.querySelector('.error-msg');
    if (!errEl) return;
    errEl.textContent = msg;
    errEl.classList.toggle('show', !!msg);
    input.classList.toggle('error', !!msg);
  }

  function validateInput(input) {
    const type = input.dataset.validate;
    if (!type) return true;
    let error = '';

    if (type === 'fullName') error = rules.fullName(input.value);
    else if (type === 'phone') error = rules.phone(input.value);
    else if (type === 'email') error = rules.email(input.value);
    else if (type === 'password') error = rules.password(input.value);
    else if (type === 'confirmPassword') error = rules.confirmPassword(input.value, input.dataset.target);
    else if (type === 'message') error = rules.message(input.value);
    else if (type === 'subject') error = rules.subject(input.value);
    else if (type === 'terms') error = rules.terms(input.checked);

    showError(input, error);
    return !error;
  }

  function attachRealtimeValidation(form) {
    const inputs = form.querySelectorAll('[data-validate]');
    inputs.forEach(input => {
      input.addEventListener('blur', () => validateInput(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('error')) validateInput(input);
        checkSubmitState(form);
      });
      input.addEventListener('change', () => { validateInput(input); checkSubmitState(form); });
    });
  }

  function checkSubmitState(form) {
    const btn = form.querySelector('[type="submit"]');
    if (!btn) return;
    const inputs = form.querySelectorAll('[data-validate]');
    let allOk = true;
    inputs.forEach(input => {
      const type = input.dataset.validate;
      let error = '';
      if (type === 'fullName') error = rules.fullName(input.value);
      else if (type === 'phone') error = rules.phone(input.value);
      else if (type === 'email') error = rules.email(input.value);
      else if (type === 'password') error = rules.password(input.value);
      else if (type === 'confirmPassword') error = rules.confirmPassword(input.value, input.dataset.target);
      else if (type === 'message') error = rules.message(input.value);
      else if (type === 'subject') error = rules.subject(input.value);
      else if (type === 'terms') error = rules.terms(input.checked);
      if (error) allOk = false;
    });
    btn.disabled = !allOk;
    btn.style.opacity = allOk ? '1' : '0.5';
    btn.style.cursor = allOk ? 'pointer' : 'not-allowed';
  }

  function initForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    checkSubmitState(form);
    attachRealtimeValidation(form);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputs = form.querySelectorAll('[data-validate]');
      let firstError = null;
      let allValid = true;
      inputs.forEach(input => {
        const valid = validateInput(input);
        if (!valid && !firstError) firstError = input;
        if (!valid) allValid = false;
      });
      if (firstError) { firstError.focus(); return; }
      if (allValid) {
        const successMsg = form.querySelector('.form-success');
        if (successMsg) successMsg.style.display = 'block';
        form.reset();
        inputs.forEach(input => { input.classList.remove('error'); });
        setTimeout(() => { if (successMsg) successMsg.style.display = 'none'; }, 4000);
        checkSubmitState(form);
      }
    });
  }

  return { initForm };
})();

// ── FAQ Accordion ──────────────────────────────
const FAQManager = (() => {
  function init() {
    document.querySelectorAll('.faq-question').forEach(q => {
      q.addEventListener('click', () => {
        const item = q.closest('.faq-item');
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  }
  return { init };
})();

// ── Auth Tabs ──────────────────────────────────
const AuthTabs = (() => {
  function init() {
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.target;
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(target)?.classList.add('active');
      });
    });
  }
  return { init };
})();

// ── Countdown Timer ────────────────────────────
const Countdown = (() => {
  function init(targetDateStr) {
    const target = new Date(targetDateStr).getTime();
    const days = document.getElementById('cd-days');
    const hours = document.getElementById('cd-hours');
    const mins = document.getElementById('cd-mins');
    const secs = document.getElementById('cd-secs');
    if (!days) return;

    function update() {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      days.textContent = String(d).padStart(2, '0');
      hours.textContent = String(h).padStart(2, '0');
      mins.textContent = String(m).padStart(2, '0');
      secs.textContent = String(s).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }
  return { init };
})();

// ── Dashboard Sidebar Toggle ────────────────────
const DashboardManager = (() => {
  function init() {
    const toggleBtn = document.querySelector('.sidebar-toggle-btn');
    const sidebar = document.querySelector('.sidebar');
    if (!toggleBtn || !sidebar) return;
    toggleBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
  }
  return { init };
})();

// ── Analytics Chart (simple canvas) ───────────
const ChartManager = (() => {
  function drawBar(canvasId, labels, data, color = '#4ade80') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const max = Math.max(...data) * 1.1;
    const barW = (W - 60) / data.length - 10;
    const startX = 50;

    ctx.clearRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#eee';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = H - 40 - ((H - 60) / 4) * i;
      ctx.beginPath(); ctx.moveTo(startX, y); ctx.lineTo(W - 10, y); ctx.stroke();
      ctx.fillStyle = '#888';
      ctx.font = '11px Poppins, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(max / 4 * i), startX - 5, y + 4);
    }

    // Bars
    data.forEach((val, i) => {
      const x = startX + i * (barW + 10);
      const barH = ((H - 60) * val) / max;
      const y = H - 40 - barH;
      ctx.fillStyle = color;
      const radius = 4;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + barW - radius, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius);
      ctx.lineTo(x + barW, y + barH);
      ctx.lineTo(x, y + barH);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.fill();

      // Labels
      ctx.fillStyle = '#888';
      ctx.font = '10px Poppins, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i], x + barW / 2, H - 20);
    });
  }

  function init() {
    drawBar('revenueChart',
      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      [42000, 55000, 38000, 67000, 72000, 58000, 81000, 75000, 69000, 88000, 93000, 105000]
    );
    drawBar('leadsChart',
      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      [120, 145, 98, 178, 192, 155, 210, 195, 182, 225, 240, 268]
    );
  }

  return { init, drawBar };
})();

// ── Init Everything ─────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  RTLManager.init();
  NavManager.init();
  ScrollReveal.init();
  FAQManager.init();
  AuthTabs.init();
  DashboardManager.init();

  // Init forms
  ['loginForm', 'registerForm', 'contactForm', 'searchForm', 'subscribeForm'].forEach(id => {
    FormValidator.initForm(id);
  });

  // Countdown — target 90 days from now
  const future = new Date();
  future.setDate(future.getDate() + 90);
  Countdown.init(future.toISOString());

  // Charts
  ChartManager.init();
});

// DROPDOWN CLICK TOGGLE
document.querySelectorAll(".dropdown-toggle").forEach(btn => {
  btn.addEventListener("click", function(e){
    e.preventDefault();

    const parent = this.parentElement;

    // close others
    document.querySelectorAll(".dropdown").forEach(d => {
      if(d !== parent) d.classList.remove("active");
    });

    parent.classList.toggle("active");
  });
});

// CLOSE ON OUTSIDE CLICK
document.addEventListener("click", function(e){
  if(!e.target.closest(".dropdown")){
    document.querySelectorAll(".dropdown").forEach(d => d.classList.remove("active"));
  }
});

document.addEventListener("DOMContentLoaded", function () {

  const links = document.querySelectorAll(".nav-links a");
  const currentPage = window.location.pathname.split("/").pop();

  links.forEach(link => {
    const linkPage = link.getAttribute("href");

    if (linkPage === currentPage) {
      link.classList.add("active");
    }
  });

});