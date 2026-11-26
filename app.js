/**
 * tuneio — Product Website Controller
 * Handles accessible clipboard copy, installer tabs switching, and GradientASCII background integration.
 */

import { initGradientASCII } from './gradient-ascii.js';

(function () {
  'use strict';

  // --- Initialize GradientASCII as Hero Background ---
  const heroAsciiContainer = document.getElementById('hero-gradient-ascii');
  console.log('[tuneio] ASCII container found:', !!heroAsciiContainer, heroAsciiContainer?.clientWidth, heroAsciiContainer?.clientHeight);
  if (heroAsciiContainer) {
    try {
      const result = initGradientASCII(heroAsciiContainer, {
        colors: ['#7c3aed', '#f6f8ff'],
        shape: 'horizon',
        characters: ' =+xX0S8#@',
        cellSize: 18,
        density: 0.8,
        glow: 0.4,
        mouseInteraction: true,
        clickEffect: 'wave',
        intro: true,
        lightMode: false
      });
      console.log('[tuneio] initGradientASCII result:', result);
    } catch (err) {
      console.error('GradientASCII WebGL2 initialization ERROR:', err);
    }
  }

  // --- Accessibility Announcer Helper ---
  const announcer = document.getElementById('a11y-announcer');
  function announce(message) {
    if (announcer) {
      announcer.textContent = '';
      setTimeout(() => {
        announcer.textContent = message;
      }, 50);
    }
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
    } catch (err) {
      console.warn('Clipboard write failed:', err);
      success = false;
    }

    if (success && triggerBtn) {
      const originalLabel = triggerBtn.querySelector('.copy-label') 
        ? triggerBtn.querySelector('.copy-label').textContent 
        : triggerBtn.textContent;

      triggerBtn.classList.add('copied');
      if (triggerBtn.querySelector('.copy-label')) {
        triggerBtn.querySelector('.copy-label').textContent = 'Copied!';
      } else {
        triggerBtn.textContent = 'copied!';
      }

      announce(`Copied ${text} to clipboard`);

      setTimeout(() => {
        triggerBtn.classList.remove('copied');
        if (triggerBtn.querySelector('.copy-label')) {
          triggerBtn.querySelector('.copy-label').textContent = originalLabel;
        } else {
          triggerBtn.textContent = originalLabel;
        }
      }, 2000);
    }
  }

  // Initialize all generic copy buttons with data-clipboard-target
  document.querySelectorAll('[data-clipboard-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetSelector = btn.getAttribute('data-clipboard-target');
      const targetElem = document.querySelector(targetSelector);
      if (targetElem) {
        const textToCopy = targetElem.textContent.trim();
        copyToClipboard(textToCopy, btn);
      }
    });
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

  function setInstallerTool(tool) {
    if (!installerCommands[tool]) return;

    // Update Tab Selection
    installerTabBtns.forEach(btn => {
      const isSelected = (btn.getAttribute('data-tool') === tool);
      btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      btn.tabIndex = isSelected ? 0 : -1;
    });

    // Update Command Text
    if (activeInstallCmd) {
      activeInstallCmd.textContent = installerCommands[tool];
    }

    // Toggle virtual environment note for pip
    if (installPipNote) {
      installPipNote.style.display = (tool === 'pip') ? 'block' : 'none';
    }

    announce(`Selected installer ${tool}: command is ${installerCommands[tool]}`);
  }

  installerTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tool = btn.getAttribute('data-tool');
      setInstallerTool(tool);
    });
  });

  // Installer tablist keyboard navigation
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
      }

      if (targetIndex !== -1) {
        const nextTool = tools[targetIndex];
        setInstallerTool(nextTool);
        const nextBtn = document.getElementById(`tab-${nextTool}`);
        if (nextBtn) nextBtn.focus();
      }
    });
  }

})();
