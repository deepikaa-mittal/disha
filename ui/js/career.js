/**
 * DISHA - Career Exploration & Performance Profile Engine
 * File: ui/js/career.js
 * 
 * Manages:
 *   - Career environments mapping & match scores
 *   - Explainability engine ("Why am I seeing this?")
 *   - Branching Career Path SVG visualizer
 */

class CareerExplorerEngine {
  constructor(containerId, whyModalId, treeContainerId) {
    this.container = document.getElementById(containerId);
    this.whyModal = document.getElementById(whyModalId);
    this.treeContainer = document.getElementById(treeContainerId);

    this.environments = [];
    this.branchingTree = null;
    this.init();
  }

  async init() {
    const data = await window.dishaApi.getCareerPaths();
    this.environments = data.environments || [];
    this.branchingTree = data.branching_tree || null;

    this.renderEnvironments();
    this.renderBranchingTree();
  }

  renderEnvironments() {
    if (!this.container) return;

    this.container.innerHTML = this.environments.map(env => `
      <div class="career-env-card" data-env-id="${env.id}">
        <div class="career-env-header">
          <div>
            <h3 style="font-size:15px; font-weight:700; color:var(--text-primary);">${env.name}</h3>
            <p style="font-size:11.5px; color:var(--text-muted); margin-top:2px;">${env.description}</p>
          </div>
          <span class="career-match-pill">${env.match_percentage}% MATCH</span>
        </div>

        <div>
          <div style="font-size:10.5px; text-transform:uppercase; letter-spacing:0.6px; color:var(--text-dim); font-weight:700; margin-bottom:6px;">
            Observed Signals
          </div>
          <ul class="signals-list">
            ${env.observed_signals.map(s => `<li>${s}</li>`).join('')}
          </ul>
        </div>

        <div style="margin-top:auto; padding-top:14px; border-top:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center;">
          <button class="btn-secondary" onclick="window.careerEngine.openWhyModal('${env.id}')" style="font-size:11.5px; padding:5px 12px;">
            Why am I seeing this?
          </button>
          <button class="btn-primary" onclick="window.careerEngine.exploreField('${env.id}')" style="font-size:11.5px; padding:5px 14px;">
            Explore Paths →
          </button>
        </div>
      </div>
    `).join('');
  }

  renderBranchingTree() {
    if (!this.treeContainer || !this.branchingTree) return;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const strokeColor = isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1';
    const nodeBg = isDark ? '#162033' : '#ffffff';
    const nodeBorder = isDark ? '#14b8a6' : '#0d9488';
    const textColor = isDark ? '#f8fafc' : '#0f172a';
    const subColor = isDark ? '#94a3b8' : '#64748b';

    this.treeContainer.innerHTML = `
      <svg viewBox="0 0 760 210" style="width:100%; height:100%; max-height:210px; font-family:Inter, sans-serif;">
        <!-- Root Node -->
        <rect x="20" y="80" width="130" height="42" rx="8" fill="${nodeBg}" stroke="${nodeBorder}" stroke-width="1.5" />
        <text x="85" y="98" text-anchor="middle" font-size="11" font-weight="700" fill="${textColor}">Observed Profile</text>
        <text x="85" y="112" text-anchor="middle" font-size="9" fill="${subColor}">Session #08 Telemetry</text>

        <!-- Branch 1 Lines -->
        <path d="M 150 101 C 190 101, 190 35, 230 35" fill="none" stroke="${strokeColor}" stroke-width="1.4" />
        <!-- Branch 2 Lines -->
        <path d="M 150 101 L 230 101" fill="none" stroke="${strokeColor}" stroke-width="1.4" />
        <!-- Branch 3 Lines -->
        <path d="M 150 101 C 190 101, 190 167, 230 167" fill="none" stroke="${strokeColor}" stroke-width="1.4" />

        <!-- Node 1: Analytical -->
        <rect x="230" y="18" width="150" height="34" rx="6" fill="${nodeBg}" stroke="${strokeColor}" stroke-width="1.2" />
        <text x="305" y="34" text-anchor="middle" font-size="10.5" font-weight="600" fill="${textColor}">Analytical / Systems</text>
        <text x="305" y="46" text-anchor="middle" font-size="8.5" fill="${subColor}">High Focus · Low Variance</text>

        <!-- Sub-branches 1 -->
        <path d="M 380 35 L 430 20" fill="none" stroke="${strokeColor}" stroke-width="1" />
        <path d="M 380 35 L 430 35" fill="none" stroke="${strokeColor}" stroke-width="1" />
        <path d="M 380 35 L 430 50" fill="none" stroke="${strokeColor}" stroke-width="1" />
        <text x="435" y="23" font-size="9" font-weight="500" fill="${textColor}">Data Science & AI</text>
        <text x="435" y="38" font-size="9" font-weight="500" fill="${textColor}">Systems Architecture</text>
        <text x="435" y="53" font-size="9" font-weight="500" fill="${textColor}">Quantitative Research</text>

        <!-- Node 2: Adaptability -->
        <rect x="230" y="84" width="150" height="34" rx="6" fill="${nodeBg}" stroke="${strokeColor}" stroke-width="1.2" />
        <text x="305" y="100" text-anchor="middle" font-size="10.5" font-weight="600" fill="${textColor}">High-Pressure Triage</text>
        <text x="305" y="112" text-anchor="middle" font-size="8.5" fill="${subColor}">Sub-300ms Decisions</text>

        <!-- Sub-branches 2 -->
        <path d="M 380 101 L 430 86" fill="none" stroke="${strokeColor}" stroke-width="1" />
        <path d="M 380 101 L 430 101" fill="none" stroke="${strokeColor}" stroke-width="1" />
        <path d="M 380 101 L 430 116" fill="none" stroke="${strokeColor}" stroke-width="1" />
        <text x="435" y="89" font-size="9" font-weight="500" fill="${textColor}">Emergency Medicine / Triage</text>
        <text x="435" y="104" font-size="9" font-weight="500" fill="${textColor}">Financial Trading Systems</text>
        <text x="435" y="119" font-size="9" font-weight="500" fill="${textColor}">Aerospace Operations</text>

        <!-- Node 3: Strategy -->
        <rect x="230" y="150" width="150" height="34" rx="6" fill="${nodeBg}" stroke="${strokeColor}" stroke-width="1.2" />
        <text x="305" y="166" text-anchor="middle" font-size="10.5" font-weight="600" fill="${textColor}">Strategic Management</text>
        <text x="305" y="178" text-anchor="middle" font-size="8.5" fill="${subColor}">Emotional Stability · Pacing</text>

        <!-- Sub-branches 3 -->
        <path d="M 380 167 L 430 152" fill="none" stroke="${strokeColor}" stroke-width="1" />
        <path d="M 380 167 L 430 167" fill="none" stroke="${strokeColor}" stroke-width="1" />
        <path d="M 380 167 L 430 182" fill="none" stroke="${strokeColor}" stroke-width="1" />
        <text x="435" y="155" font-size="9" font-weight="500" fill="${textColor}">Product Management</text>
        <text x="435" y="170" font-size="9" font-weight="500" fill="${textColor}">Technology Strategy</text>
        <text x="435" y="185" font-size="9" font-weight="500" fill="${textColor}">Operations Leadership</text>
      </svg>
    `;
  }

  openWhyModal(envId) {
    const env = this.environments.find(e => e.id === envId);
    if (!env || !this.whyModal) return;

    const titleEl = document.getElementById('why-modal-title');
    const bodyEl = document.getElementById('why-modal-body');

    if (titleEl) titleEl.textContent = `Why: ${env.name}`;

    if (bodyEl) {
      bodyEl.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div>
            <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--accent-teal); letter-spacing:0.8px;">
              Observed Gameplay Behaviors
            </div>
            <ul class="signals-list" style="margin-top:6px;">
              ${env.game_behaviors.map(b => `<li>${b}</li>`).join('')}
            </ul>
          </div>

          <div>
            <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--accent-teal); letter-spacing:0.8px;">
              Supporting EEG Neural Features
            </div>
            <p style="font-size:12px; color:var(--text-secondary); margin-top:4px;">
              Model-weighted coefficients extracted from your gameplay epoch session:
            </p>
            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">
              ${env.supporting_features.map(f => `
                <span class="mono" style="background:var(--bg-surface-subtle); border:1px solid var(--border-subtle); padding:3px 8px; border-radius:4px; font-size:11px;">
                  ${f}
                </span>
              `).join('')}
            </div>
          </div>

          <div>
            <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--accent-teal); letter-spacing:0.8px;">
              Recommended Field Trajectories
            </div>
            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:6px;">
              ${env.recommended_fields.map(f => `
                <span style="background:var(--accent-teal-subtle); border:1px solid var(--accent-teal-border); color:var(--accent-teal); padding:3px 10px; border-radius:999px; font-size:11px; font-weight:600;">
                  ${f}
                </span>
              `).join('')}
            </div>
          </div>

          <div style="padding:12px; background:var(--bg-surface-subtle); border:1px solid var(--border-subtle); border-radius:8px; font-size:11px; color:var(--text-muted); line-height:1.4;">
            <strong>Scientific & Diagnostic Limitation:</strong> DISHA identifies exploratory performance environments based on recorded neural engagement and gameplay decisions. It is not an aptitude test, psychiatric diagnosis, or deterministic career guarantee.
          </div>
        </div>
      `;
    }

    this.whyModal.classList.add('open');
  }

  exploreField(envId) {
    this.openWhyModal(envId);
  }
}

window.CareerExplorerEngine = CareerExplorerEngine;
