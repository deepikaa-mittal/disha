/**
 * DISHA - Master Application Controller
 * File: ui/js/app.js
 * 
 * Orchestrates:
 *   - Dual Light/Dark theme persistence & dynamic chart restyling
 *   - Landing page ↔ App dashboard view transitions
 *   - 10-section analytical dashboard navigation
 *   - Synchronized dual-timeline telemetry rendering
 *   - Session history comparison
 *   - Research export generation
 */

document.addEventListener('DOMContentLoaded', async () => {
  const AppState = {
    theme: localStorage.getItem('disha_theme') || 'light',
    currentView: 'landing', // 'landing' | 'app'
    currentTab: 'overview',
    summaryData: null,
    metricsData: null,
    telemetryPoints: [],
    sessions: [],
    currentPrediction: {
      predicted_emotion: 'POSITIVE',
      emotion_confidence: 0.918,
      predicted_stress_level: 'Low',
      stress_score: 32.4,
      probabilities: { POSITIVE: 0.918, NEUTRAL: 0.052, NEGATIVE: 0.030 },
      inference_latency_ms: 0.368
    }
  };

  // ============================================================================
  // 1. Dual-Theme Management
  // ============================================================================
  function applyTheme(theme) {
    AppState.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('disha_theme', theme);

    // Update icons on toggle buttons
    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    toggleBtns.forEach(btn => {
      btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('title', `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`);
    });

    // Re-render active charts to adopt new theme background/text/grid colors
    if (AppState.currentView === 'app') {
      renderActiveTabCharts(AppState.currentTab);
    }
    if (window.careerEngine) {
      window.careerEngine.renderBranchingTree();
    }
    if (window.dishaBrainMap) {
      window.dishaBrainMap.render();
    }
  }

  // Apply initial saved theme
  applyTheme(AppState.theme);

  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(AppState.theme === 'dark' ? 'light' : 'dark');
    });
  });

  // ============================================================================
  // 2. Landing Page ↔ App Dashboard View Routing
  // ============================================================================
  const landingViewEl = document.getElementById('landing-view');
  const appViewEl = document.getElementById('app-view');

  function showView(viewName, initialTab = 'overview') {
    AppState.currentView = viewName;
    if (viewName === 'app') {
      landingViewEl.style.display = 'none';
      appViewEl.classList.add('active');
      switchTab(initialTab);
    } else {
      appViewEl.classList.remove('active');
      landingViewEl.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Bind entry CTAs
  document.querySelectorAll('.js-enter-disha').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showView('app', btn.dataset.targetTab || 'overview');
    });
  });

  // Return to landing via brand logo in sidebar
  const returnBrandBtn = document.getElementById('sidebar-brand-btn');
  if (returnBrandBtn) {
    returnBrandBtn.addEventListener('click', () => {
      showView('landing');
    });
  }

  // Smooth scroll for landing pill nav links
  document.querySelectorAll('.pill-nav-link[data-anchor]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(link.dataset.anchor);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // ============================================================================
  // 3. App Dashboard Tab Navigation (10 Core Sections)
  // ============================================================================
  const navItems = document.querySelectorAll('.disha-nav-item');
  const pageViews = document.querySelectorAll('.dash-page-view');
  const viewTitleEl = document.getElementById('dash-view-title');
  const viewDescEl = document.getElementById('dash-view-desc');

  const tabMeta = {
    overview: { title: 'Overview', desc: 'Neural state summary and latest gameplay performance telemetry' },
    'live-session': { title: 'Live Session', desc: 'Real-time multi-channel EEG signals and gameplay telemetry simulation' },
    'eeg-signals': { title: 'EEG Signals', desc: 'Multi-channel 10-20 waveforms and interactive cranial electrode map' },
    'emotion-stress': { title: 'Emotion & Stress', desc: 'Ground-truth category balance, class probabilities, and stress index' },
    'game-performance': { title: 'Game Performance', desc: 'Gaming analytics and synchronized neural-performance dual timeline' },
    'performance-profile': { title: 'Performance Profile', desc: 'Multidimensional cognitive scores derived from observed telemetry' },
    'career-explorer': { title: 'Career Explorer', desc: 'Career environments and explainable performance-matching pathways' },
    'model-insights': { title: 'Model Insights', desc: 'Validation confusion matrix, multi-model benchmarks, and limitations' },
    dataset: { title: 'Research Dataset', desc: 'Searchable 2,548-feature inspection console and 1-click prediction' },
    'research-export': { title: 'Research Export', desc: 'Diagnostic telemetry and laboratory report documentation export' }
  };

  function switchTab(tabId) {
    AppState.currentTab = tabId;

    navItems.forEach(item => {
      item.classList.toggle('active', item.dataset.tab === tabId);
    });

    pageViews.forEach(v => {
      v.classList.toggle('active', v.id === `dash-${tabId}`);
    });

    if (tabMeta[tabId]) {
      if (viewTitleEl) viewTitleEl.textContent = tabMeta[tabId].title;
      if (viewDescEl) viewDescEl.textContent = tabMeta[tabId].desc;
    }

    if (tabId === 'eeg-signals' && window.dishaWaveforms) {
      setTimeout(() => {
        window.dishaWaveforms.initCanvasSize();
        window.dishaBrainMap?.render();
      }, 40);
    }

    renderActiveTabCharts(tabId);
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.dataset.tab;
      if (tabId) switchTab(tabId);
    });
  });

  // Sidebar toggle
  const sidebarEl = document.getElementById('disha-sidebar');
  const sidebarToggleBtn = document.getElementById('disha-sidebar-toggle');
  if (sidebarToggleBtn && sidebarEl) {
    sidebarToggleBtn.addEventListener('click', () => {
      sidebarEl.classList.toggle('collapsed');
      setTimeout(() => {
        window.dishaWaveforms?.initCanvasSize();
      }, 250);
    });
  }

  // ============================================================================
  // 4. Data Loading & Initialization
  // ============================================================================
  await window.dishaApi.checkHealth();
  AppState.summaryData = await window.dishaApi.getDatasetSummary();
  AppState.metricsData = await window.dishaApi.getMetrics();
  AppState.telemetryPoints = await window.dishaApi.getPerformanceTelemetry();
  AppState.sessions = await window.dishaApi.getSessionHistory();

  // Initialize components
  window.dishaWaveforms = new window.DishaWaveformStream('disha-eeg-canvas');
  window.dishaBrainMap = new window.DishaBrainMap('disha-brain-svg', 'electrode-modal');
  window.careerEngine = new window.CareerExplorerEngine('career-cards-container', 'why-modal', 'branching-tree-container');
  window.datasetViewer = new window.DishaDatasetViewer('dataset-table-body', 'dataset-pagination', 'dataset-col-picker', 'sample-inspector-box');

  // Pre-draw stress gauge
  drawCleanStressGauge(AppState.currentPrediction?.stress_score || 32);

  // Waveform buttons
  const waveToggle = document.getElementById('wave-toggle-btn');
  const waveReset = document.getElementById('wave-reset-btn');
  const waveSpeed = document.getElementById('wave-speed-select');
  if (waveToggle && window.dishaWaveforms) {
    waveToggle.addEventListener('click', () => {
      const running = window.dishaWaveforms.toggle();
      waveToggle.textContent = running ? '⏸ Pause' : '▶ Resume';
    });
  }
  if (waveReset && window.dishaWaveforms) {
    waveReset.addEventListener('click', () => window.dishaWaveforms.reset());
  }
  if (waveSpeed && window.dishaWaveforms) {
    waveSpeed.addEventListener('change', (e) => window.dishaWaveforms.setSpeed(parseFloat(e.target.value)));
  }

  // Close modals
  document.querySelectorAll('.disha-modal-close, .disha-modal-overlay').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (e.target === btn || btn.classList.contains('disha-modal-close')) {
        document.querySelectorAll('.disha-modal-overlay').forEach(m => m.classList.remove('open'));
      }
    });
  });

  // ============================================================================
  // 5. Chart Render Dispatcher
  // ============================================================================
  async function renderActiveTabCharts(tabId) {
    if (tabId === 'overview') {
      window.DishaCharts.renderDualTimeline('overview-telemetry-chart', AppState.telemetryPoints);
      window.DishaCharts.renderPerformanceProfileRadar('overview-profile-radar');
    } else if (tabId === 'eeg-signals') {
      setTimeout(() => {
        window.dishaWaveforms?.initCanvasSize();
        window.dishaBrainMap?.render();
      }, 40);
    } else if (tabId === 'game-performance') {
      window.DishaCharts.renderDualTimeline('game-dual-timeline-chart', AppState.telemetryPoints);
    } else if (tabId === 'performance-profile') {
      window.DishaCharts.renderPerformanceProfileRadar('profile-tab-radar');
    } else if (tabId === 'emotion-stress') {
      window.DishaCharts.renderEmotionDonut('emotion-donut-chart', AppState.summaryData?.class_distribution, (label) => {
        if (window.datasetViewer) {
          switchTab('dataset');
          const filter = document.getElementById('dataset-filter-select');
          if (filter) {
            filter.value = label;
            window.datasetViewer.filterEmotion = label;
            window.datasetViewer.loadPage(1);
          }
        }
      });
      drawCleanStressGauge(AppState.currentPrediction?.stress_score || 32);
    } else if (tabId === 'model-insights') {
      window.DishaCharts.renderConfusionMatrix('insights-cm-chart', AppState.metricsData?.confusion_matrix_emotion);
      const comp = await window.dishaApi.getModelComparison();
      if (comp?.models) {
        window.DishaCharts.renderModelComparison('insights-comparison-chart', comp.models);
      }
      window.DishaCharts.renderFeatureImportance('insights-features-chart', AppState.metricsData?.top_15_features);
    }
  }

  // ============================================================================
  // 6. Clean Scientific Stress Gauge
  // ============================================================================
  function drawCleanStressGauge(score = 32) {
    const svg = document.getElementById('clean-stress-gauge-svg');
    if (!svg) return;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const trackColor = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';

    let strokeColor = '#059669';
    let statusText = 'Low Stress (Stable Baseline)';
    let badgeBg = isDark ? 'rgba(16, 185, 129, 0.16)' : '#ecfdf5';
    if (score > 65) { 
      strokeColor = '#e11d48'; 
      statusText = 'Elevated Sympathetic Tone'; 
      badgeBg = isDark ? 'rgba(244, 63, 94, 0.16)' : '#fff1f2';
    } else if (score > 35) { 
      strokeColor = '#d97706'; 
      statusText = 'Moderate Cognitive Arousal'; 
      badgeBg = isDark ? 'rgba(217, 119, 6, 0.16)' : '#fffbeb';
    }

    const cx = 110, cy = 92, r = 72;
    // Angle in radians: 0 is right (Pi), Pi is left (0%)
    const clamped = Math.min(100, Math.max(0, score));
    const fraction = clamped / 100;
    const currentRad = Math.PI - fraction * Math.PI;
    const needleX = cx - r * Math.cos(currentRad);
    const needleY = cy - r * Math.sin(currentRad);

    svg.innerHTML = `
      <defs>
        <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#059669" />
          <stop offset="50%" stop-color="#d97706" />
          <stop offset="100%" stop-color="#e11d48" />
        </linearGradient>
      </defs>
      <!-- Base track -->
      <path d="M 38 92 A 72 72 0 0 1 182 92" fill="none" stroke="${trackColor}" stroke-width="12" stroke-linecap="round" />
      <!-- Value arc -->
      <path d="M 38 92 A 72 72 0 0 1 ${needleX} ${needleY}" fill="none" stroke="${strokeColor}" stroke-width="12" stroke-linecap="round" />
      <!-- Indicator Bead -->
      <circle cx="${needleX}" cy="${needleY}" r="6.5" fill="#ffffff" stroke="${strokeColor}" stroke-width="2.5" />
    `;

    const scoreEl = document.getElementById('gauge-score-num');
    const labelEl = document.getElementById('gauge-status-label');
    if (scoreEl) scoreEl.textContent = `${Math.round(clamped)}`;
    if (labelEl) {
      labelEl.textContent = statusText;
      labelEl.style.color = strokeColor;
      labelEl.style.background = badgeBg;
    }
  }

  // ============================================================================
  // 7. Research Report Exporter
  // ============================================================================
  const exportBtn = document.getElementById('export-research-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      exportBtn.textContent = 'Generating Report...';
      const rep = await window.dishaApi.exportReport();
      exportBtn.textContent = 'Export Complete ✓';
      setTimeout(() => exportBtn.textContent = 'Download Research Report', 2000);

      // Trigger text download
      const blob = new Blob([rep.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = rep.filename;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Live periodic telemetry tick
  setInterval(async () => {
    const s = await window.dishaApi.getStreamSample();
    if (s && s.prediction) {
      AppState.currentPrediction = s.prediction;
      const engVal = document.getElementById('live-eng-val');
      if (engVal) engVal.textContent = `${Math.round(s.prediction.emotion_confidence * 100)}%`;
    }
  }, 3000);
});
