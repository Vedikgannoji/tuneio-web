/**
 * tuneio — Product Website Controller
 * Handles GradientASCII, adaptive navbar, scroll-reactive glow,
 * 3-step workflow walkthrough, installer tabs, and clipboard copy.
 */

import { initGradientASCII } from './gradient-ascii.js';

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  // --- Initialize GradientASCII as Hero Background ---
  const heroAsciiContainer = document.getElementById('hero-gradient-ascii');
  if (heroAsciiContainer) {
    try {
      const asciiInstance = initGradientASCII(heroAsciiContainer, {
        colors: ['#6722dc', '#f6f8ff'],
        shape: 'horizon',
        characters: ' .·•●',
        cellSize: 18,
        density: 0.8,
        glow: 0.2,
        mouseInteraction: true,
        clickEffect: 'wave',
        intro: true,
        lightMode: false
      });
      document.documentElement.setAttribute('data-hero-ascii', asciiInstance ? 'on' : 'off');
    } catch {
      document.documentElement.setAttribute('data-hero-ascii', 'off');
    }
  }

  // --- Accessibility Announcer Helper ---
  const announcer = document.getElementById('a11y-announcer');
  function announce(message) {
    if (!announcer) return;
    announcer.textContent = '';
    setTimeout(() => {
      announcer.textContent = message;
    }, 50);
  }

  // --- Clipboard Copy Helper ---
  async function copyToClipboard(text, triggerBtn) {
    let success = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        success = true;
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch {
      success = false;
    }

    if (success && triggerBtn) {
      const labelEl = triggerBtn.querySelector('.copy-label');
      const originalLabel = labelEl ? labelEl.textContent : triggerBtn.textContent;

      triggerBtn.classList.add('copied');
      if (labelEl) {
        labelEl.textContent = 'Copied!';
      } else {
        triggerBtn.textContent = 'Copied!';
      }

      announce(`Copied ${text} to clipboard`);

      setTimeout(() => {
        triggerBtn.classList.remove('copied');
        if (labelEl) {
          labelEl.textContent = originalLabel;
        } else {
          triggerBtn.textContent = originalLabel;
        }
      }, 2000);
    }
  }

  document.querySelectorAll('[data-clipboard-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetSelector = btn.getAttribute('data-clipboard-target');
      const targetElem = targetSelector ? document.querySelector(targetSelector) : null;
      if (targetElem) {
        copyToClipboard(targetElem.textContent.trim(), btn);
      }
    });
  });

  // --- Adaptive Navbar, Scroll-Progress & Ambient Glow ---
  const header = document.getElementById('site-header');
  const heroButtons = document.getElementById('hero-buttons');
  const navCta = document.getElementById('nav-cta');
  const navIndicator = document.getElementById('nav-indicator');
  const navSpyLinks = Array.from(document.querySelectorAll('.nav-spy-link'));
  const mobileMenuBtn = document.getElementById('nav-menu-btn');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  const mobileCloseBtn = document.getElementById('mobile-nav-close');
  const mobileBackdrop = document.getElementById('mobile-nav-backdrop');

  const SCROLL_THRESHOLD = 40;
  let activeSpySection = null;
  let isMenuOpen = false;
  let lastScrollY = window.scrollY;
  let scrollTicking = false;

  function setActiveSpyLink(sectionId) {
    activeSpySection = sectionId;
    let activeLink = null;
    navSpyLinks.forEach(link => {
      const matches = link.getAttribute('data-section') === sectionId;
      link.classList.toggle('is-active', matches);
      if (matches) activeLink = link;
    });
    if (navIndicator) {
      if (activeLink) {
        navIndicator.style.width = `${activeLink.offsetWidth}px`;
        navIndicator.style.transform = `translateX(${activeLink.offsetLeft}px)`;
        navIndicator.classList.add('is-visible');
      } else {
        navIndicator.classList.remove('is-visible');
      }
    }
  }

  function updateScrollMetrics() {
    scrollTicking = false;
    const scrollY = window.scrollY;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, scrollY / maxScroll));

    document.documentElement.style.setProperty('--scroll-progress', progress.toFixed(4));

    if (!prefersReducedMotion) {
      const glowY = 18 + progress * 64;
      const glowOpacity = 0.14 + Math.sin(progress * Math.PI) * 0.08;
      document.documentElement.style.setProperty('--glow-y', `${glowY.toFixed(1)}%`);
      document.documentElement.style.setProperty('--glow-opacity', glowOpacity.toFixed(3));
    }

    if (header) {
      const shouldBeScrolled = scrollY > SCROLL_THRESHOLD;
      const wasScrolled = header.classList.contains('is-scrolled');
      if (shouldBeScrolled !== wasScrolled) {
        header.classList.toggle('is-scrolled', shouldBeScrolled);
        window.requestAnimationFrame(() => setActiveSpyLink(activeSpySection));
      }

      const navHasFocus = header.contains(document.activeElement);
      const delta = scrollY - lastScrollY;
      if (scrollY <= 80 || isMenuOpen || navHasFocus) {
        header.classList.remove('is-hidden');
      } else if (delta > 8) {
        header.classList.add('is-hidden');
      } else if (delta < -6) {
        header.classList.remove('is-hidden');
      }
    }
    lastScrollY = scrollY;
  }

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      scrollTicking = true;
      window.requestAnimationFrame(updateScrollMetrics);
    }
  }, { passive: true });
  window.addEventListener('resize', () => setActiveSpyLink(activeSpySection), { passive: true });
  updateScrollMetrics();

  if (heroButtons && navCta && 'IntersectionObserver' in window) {
    const ctaObserver = new IntersectionObserver(entries => {
      const buttonsVisible = entries.some(entry => entry.isIntersecting);
      navCta.classList.toggle('is-visible', !buttonsVisible);
      navCta.tabIndex = buttonsVisible ? -1 : 0;
    }, { threshold: 0 });
    ctaObserver.observe(heroButtons);
  }

  if ('IntersectionObserver' in window) {
    const sections = ['hero', 'features', 'install']
      .map(id => document.getElementById(id))
      .filter(Boolean);
    const spyObserver = new IntersectionObserver(entries => {
      const visibleEntries = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visibleEntries.length > 0) {
        const id = visibleEntries[0].target.id;
        setActiveSpyLink(id === 'hero' ? null : id);
      }
    }, { rootMargin: '-25% 0px -45% 0px', threshold: [0.1, 0.4] });
    sections.forEach(sec => spyObserver.observe(sec));
  }

  // Mobile Menu Drawer with Focus Trap & Esc
  function getFocusableInDrawer() {
    if (!mobileDrawer) return [];
    return Array.from(
      mobileDrawer.querySelectorAll('a[href], button:not([disabled])')
    );
  }

  function openMobileMenu() {
    if (!mobileDrawer || !mobileMenuBtn) return;
    isMenuOpen = true;
    mobileDrawer.hidden = false;
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
    header?.classList.remove('is-hidden');
    mobileCloseBtn?.focus();
  }

  function closeMobileMenu(returnFocus = true) {
    if (!mobileDrawer || !mobileMenuBtn) return;
    isMenuOpen = false;
    mobileDrawer.hidden = true;
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    if (returnFocus) {
      mobileMenuBtn.focus();
    }
  }

  mobileMenuBtn?.addEventListener('click', () => {
    if (isMenuOpen) closeMobileMenu(true);
    else openMobileMenu();
  });

  mobileCloseBtn?.addEventListener('click', () => closeMobileMenu(true));
  mobileBackdrop?.addEventListener('click', () => closeMobileMenu(true));

  mobileDrawer?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => closeMobileMenu(false));
  });

  document.addEventListener('keydown', (e) => {
    if (!isMenuOpen) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeMobileMenu(true);
      return;
    }
    if (e.key === 'Tab') {
      const focusable = getFocusableInDrawer();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // --- Workflow 3-Step Interactive Walkthrough ---
  const stepMeta = {
    observe: { cmd: '$ tuneio monitor', tabId: 'wf-tab-observe' },
    approve: { cmd: '$ tuneio optimize enable', tabId: 'wf-tab-approve' },
    compare: { cmd: '$ tuneio compare', tabId: 'wf-tab-compare' }
  };
  const stepTabs = Array.from(document.querySelectorAll('.workflow-step-btn'));
  const stepPanes = Array.from(document.querySelectorAll('.wf-pane'));
  const wfPanel = document.getElementById('wf-panel');
  const wfTerminalCmd = document.getElementById('wf-terminal-cmd');
  const wfTablist = document.querySelector('.workflow-steps');

  function setWorkflowStep(stepKey) {
    if (!stepMeta[stepKey]) return;
    stepTabs.forEach(tab => {
      const selected = tab.getAttribute('data-step') === stepKey;
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      tab.tabIndex = selected ? 0 : -1;
    });
    stepPanes.forEach(pane => {
      pane.hidden = pane.getAttribute('data-pane') !== stepKey;
    });
    if (wfPanel) wfPanel.setAttribute('aria-labelledby', stepMeta[stepKey].tabId);
    if (wfTerminalCmd) wfTerminalCmd.textContent = stepMeta[stepKey].cmd;
  }

  stepTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      setWorkflowStep(tab.getAttribute('data-step'));
    });
  });

  if (wfTablist) {
    const keys = ['observe', 'approve', 'compare'];
    wfTablist.addEventListener('keydown', (e) => {
      const current = document.querySelector('.workflow-step-btn[aria-selected="true"]');
      const currentIdx = keys.indexOf(current?.getAttribute('data-step') || 'observe');
      let nextIdx = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextIdx = (currentIdx + 1) % keys.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        nextIdx = (currentIdx - 1 + keys.length) % keys.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextIdx = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextIdx = keys.length - 1;
      }
      if (nextIdx !== -1) {
        const nextKey = keys[nextIdx];
        setWorkflowStep(nextKey);
        document.getElementById(stepMeta[nextKey].tabId)?.focus();
      }
    });
  }

  const wfApproveBtn = document.getElementById('wf-approve-btn');
  const wfPolicyBox = document.getElementById('wf-policy-box');
  const wfApprovalBadge = document.getElementById('wf-approval-badge');
  const wfActivationState = document.getElementById('wf-activation-state');
  const wfApproveHint = document.getElementById('wf-approve-hint');
  let isPolicyApproved = false;

  wfApproveBtn?.addEventListener('click', () => {
    isPolicyApproved = !isPolicyApproved;
    wfApproveBtn.setAttribute('aria-pressed', isPolicyApproved ? 'true' : 'false');
    wfApproveBtn.classList.toggle('is-approved', isPolicyApproved);
    wfApproveBtn.textContent = isPolicyApproved ? 'Approved' : 'Approve caching';
    wfPolicyBox?.classList.toggle('is-approved', isPolicyApproved);

    if (wfApprovalBadge) {
      wfApprovalBadge.textContent = isPolicyApproved ? 'Approved' : 'Pending review';
    }
    if (wfActivationState) {
      wfActivationState.textContent = isPolicyApproved
        ? 'Approved by developer · public GET /api/products'
        : 'Explicit approval required';
      wfActivationState.classList.toggle('wf-val-ok', isPolicyApproved);
    }
    if (wfApproveHint) {
      wfApproveHint.textContent = isPolicyApproved
        ? 'Sample policy approved. Click again to reset.'
        : 'Caching never starts automatically without your confirmation.';
    }
    announce(isPolicyApproved
      ? 'Sample caching policy approved for public GET /api/products'
      : 'Sample caching policy reset to pending review');
  });

  // --- Installer Tabs Controller ---
  const installerCommands = {
    pip: 'pip install tuneio',
    pipx: 'pipx install tuneio',
    uv: 'uv tool install tuneio'
  };

  const installerTabBtns = document.querySelectorAll('.installer-tab-btn');
  const activeInstallCmd = document.getElementById('active-install-cmd');
  const installPipNote = document.getElementById('install-pip-note');
  const installPanel = document.getElementById('panel-install');

  function setInstallerTool(tool) {
    if (!installerCommands[tool]) return;

    installerTabBtns.forEach(btn => {
      const isSelected = btn.getAttribute('data-tool') === tool;
      btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      btn.tabIndex = isSelected ? 0 : -1;
    });

    if (installPanel) {
      installPanel.setAttribute('aria-labelledby', `tab-${tool}`);
    }
    if (activeInstallCmd) {
      activeInstallCmd.textContent = installerCommands[tool];
    }
    if (installPipNote) {
      installPipNote.hidden = tool !== 'pip';
    }

    announce(`Selected installer ${tool}: command is ${installerCommands[tool]}`);
  }

  installerTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setInstallerTool(btn.getAttribute('data-tool'));
    });
  });

  const installerTabsList = document.querySelector('.installer-tabs-list');
  if (installerTabsList) {
    const tools = ['pip', 'pipx', 'uv'];
    installerTabsList.addEventListener('keydown', (e) => {
      const currentSelectedBtn = document.querySelector('.installer-tab-btn[aria-selected="true"]');
      const currentTool = currentSelectedBtn ? currentSelectedBtn.getAttribute('data-tool') : 'pip';
      const currentIndex = tools.indexOf(currentTool);
      let targetIndex = -1;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        targetIndex = (currentIndex + 1) % tools.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        targetIndex = (currentIndex - 1 + tools.length) % tools.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        targetIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        targetIndex = tools.length - 1;
      }

      if (targetIndex !== -1) {
        const nextTool = tools[targetIndex];
        setInstallerTool(nextTool);
        document.getElementById(`tab-${nextTool}`)?.focus();
      }
    });
  }
})();
