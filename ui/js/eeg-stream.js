/**
 * DISHA - Refined EEG Multi-Channel Stream & Interactive 10-20 Electrode Map
 * File: ui/js/eeg-stream.js
 * 
 * Features:
 *   - Guaranteed auto-resizing via ResizeObserver (fixes blank canvas when tab was hidden)
 *   - Vibrant, high-contrast neural waveforms with clear labels and voltage indicators
 *   - Channel controls (play/pause/reset/speed)
 *   - Interactive 10-20 Brain Map with clickable electrode inspection modal
 */

class DishaWaveformStream {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.isPlaying = true;
    this.speed = 1.0;
    this.animationId = null;

    // 8 Classical Channels from 10-20 Montage with Distinct High-Contrast Scientific Palette
    this.channels = [
      { name: 'Fp1 (Prefrontal L)', color: '#0d9488', darkColor: '#14b8a6', buffer: [], baseAmp: 18, freq: 0.07 },
      { name: 'Fp2 (Prefrontal R)', color: '#0284c7', darkColor: '#38bdf8', buffer: [], baseAmp: 18, freq: 0.08 },
      { name: 'F7 (Frontal Inferior L)', color: '#2563eb', darkColor: '#60a5fa', buffer: [], baseAmp: 15, freq: 0.11 },
      { name: 'F8 (Frontal Inferior R)', color: '#4f46e5', darkColor: '#818cf8', buffer: [], baseAmp: 15, freq: 0.10 },
      { name: 'T3 (Temporal L)', color: '#7c3aed', darkColor: '#a78bfa', buffer: [], baseAmp: 14, freq: 0.13 },
      { name: 'T4 (Temporal R)', color: '#9333ea', darkColor: '#c084fc', buffer: [], baseAmp: 14, freq: 0.12 },
      { name: 'Pz (Parietal Midline)', color: '#059669', darkColor: '#34d399', buffer: [], baseAmp: 20, freq: 0.09 },
      { name: 'Oz (Occipital Midline)', color: '#d97706', darkColor: '#fbbf24', buffer: [], baseAmp: 24, freq: 0.06 }
    ];

    this.sampleCount = 0;
    this.maxPoints = 350;
    this.displayWidth = 700;
    this.displayHeight = 270;

    // Pre-fill buffers so waves appear instantly
    this.seedBuffers();

    this.initCanvasSize();

    // Use ResizeObserver so when parent container becomes visible or resizes, canvas updates immediately!
    if (window.ResizeObserver && this.canvas.parentElement) {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          if (entry.contentRect.width > 20 && entry.contentRect.height > 20) {
            this.initCanvasSize();
          }
        }
      });
      this.resizeObserver.observe(this.canvas.parentElement);
    }

    window.addEventListener('resize', () => this.initCanvasSize());

    this.start();
  }

  seedBuffers() {
    for (let c of this.channels) {
      c.buffer = [];
      for (let i = 0; i < this.maxPoints; i++) {
        const t = i * 0.05;
        const h1 = Math.sin(t * c.freq * 10) * c.baseAmp;
        const h2 = Math.sin(t * c.freq * 20) * (c.baseAmp * 0.4);
        const h3 = Math.cos(t * c.freq * 4) * (c.baseAmp * 0.5);
        c.buffer.push(h1 + h2 + h3);
      }
    }
  }

  initCanvasSize() {
    if (!this.canvas || !this.canvas.parentElement) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const w = rect.width > 50 ? Math.floor(rect.width) : (this.canvas.clientWidth > 50 ? this.canvas.clientWidth : 760);
    const h = rect.height > 50 ? Math.floor(rect.height) : (this.canvas.clientHeight > 50 ? this.canvas.clientHeight : 320);

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.displayWidth = w;
    this.displayHeight = h;

    // Immediately trigger a draw call
    this.draw();
  }

  start() {
    this.isPlaying = true;
    const loop = () => {
      if (this.isPlaying) {
        this.step();
        this.draw();
      }
      this.animationId = requestAnimationFrame(loop);
    };
    loop();
  }

  toggle() {
    this.isPlaying = !this.isPlaying;
    return this.isPlaying;
  }

  reset() {
    this.sampleCount = 0;
    this.seedBuffers();
    this.draw();
  }

  setSpeed(s) {
    this.speed = s;
  }

  step() {
    this.sampleCount += 1 * this.speed;
    const t = this.sampleCount * 0.05;

    for (let c of this.channels) {
      const h1 = Math.sin(t * c.freq * 10) * c.baseAmp;
      const h2 = Math.sin(t * c.freq * 20) * (c.baseAmp * 0.45);
      const h3 = Math.cos(t * c.freq * 4) * (c.baseAmp * 0.5);
      const noise = (Math.random() - 0.5) * 4.0;
      const val = h1 + h2 + h3 + noise;

      c.buffer.push(val);
      if (c.buffer.length > this.maxPoints) c.buffer.shift();
    }
  }

  draw() {
    const { ctx, canvas, displayWidth, displayHeight, channels } = this;
    if (!ctx || !canvas) return;

    // Self-healing check: if canvas has layout dimensions but internal display size is mismatch
    if (canvas.clientWidth > 50 && (Math.abs(canvas.clientWidth - this.displayWidth) > 2 || this.displayWidth === 0)) {
      this.initCanvasSize();
      return;
    }

    const width = displayWidth || 760;
    const height = displayHeight || 320;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    // Canvas background
    ctx.fillStyle = isDark ? '#090d16' : '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Subtle coordinate vertical gridlines
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.07)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 10; i++) {
      const x = (width / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    const chH = height / channels.length;

    channels.forEach((ch, idx) => {
      const cy = chH * idx + chH / 2;
      const color = isDark ? (ch.darkColor || ch.color) : ch.color;

      // Zero-line baseline
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.stroke();

      // Channel pill badge background on left
      const badgeText = ch.name;
      ctx.font = 'bold 12px Inter, sans-serif';
      const textWidth = ctx.measureText(badgeText).width;

      ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(241, 245, 249, 0.9)';
      ctx.beginPath();
      ctx.roundRect?.(8, cy - 14, textWidth + 16, 22, 4) || ctx.rect(8, cy - 14, textWidth + 16, 22);
      ctx.fill();
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.12)';
      ctx.stroke();

      // Channel color marker dot
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(16, cy - 3, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Channel label text
      ctx.fillStyle = isDark ? '#f8fafc' : '#090e17';
      ctx.fillText(badgeText, 25, cy);

      // Latest voltage value badge on right
      const latestVal = ch.buffer[ch.buffer.length - 1] || 0;
      const valText = `${latestVal > 0 ? '+' : ''}${latestVal.toFixed(1)} µV`;
      ctx.font = 'bold 12px JetBrains Mono, monospace';
      const valWidth = ctx.measureText(valText).width;

      ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(241, 245, 249, 0.9)';
      ctx.beginPath();
      ctx.roundRect?.(width - valWidth - 20, cy - 14, valWidth + 14, 22, 4) || ctx.rect(width - valWidth - 20, cy - 14, valWidth + 14, 22);
      ctx.fill();
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.12)';
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.fillText(valText, width - valWidth - 13, cy);

      // Draw high-contrast waveform line
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.2;
      ctx.lineJoin = 'round';
      ctx.beginPath();

      const stepX = width / (this.maxPoints - 1);
      for (let i = 0; i < ch.buffer.length; i++) {
        const x = i * stepX;
        const y = cy - ch.buffer[i];
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    // Active live telemetry scan playhead line
    const scanX = ((this.sampleCount % this.maxPoints) / this.maxPoints) * width;
    ctx.strokeStyle = isDark ? 'rgba(20, 184, 166, 0.45)' : 'rgba(13, 148, 136, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(scanX, 0);
    ctx.lineTo(scanX, height);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}


/**
 * 2. Refined 10-20 Scientific Brain Map with Clickable Inspection
 */
class DishaBrainMap {
  constructor(svgId, modalId) {
    this.svg = document.getElementById(svgId);
    this.modal = document.getElementById(modalId);
    if (!this.svg) return;

    this.electrodes = [
      { id: 'Fp1', x: 40, y: 22, region: 'Left Prefrontal', amp: '14.2 µV', freq: 'Alpha (10.2 Hz)', quality: '98%', modelWeight: 'Top 5% Weight' },
      { id: 'Fp2', x: 60, y: 22, region: 'Right Prefrontal', amp: '15.1 µV', freq: 'Alpha (10.4 Hz)', quality: '97%', modelWeight: 'Top 5% Weight' },
      { id: 'F7',  x: 22, y: 34, region: 'Left Inferior Frontal', amp: '12.8 µV', freq: 'Theta (6.8 Hz)', quality: '95%', modelWeight: 'Included' },
      { id: 'Fz',  x: 50, y: 34, region: 'Midline Frontal', amp: '16.4 µV', freq: 'Theta (6.2 Hz)', quality: '99%', modelWeight: 'High Significance' },
      { id: 'F8',  x: 78, y: 34, region: 'Right Inferior Frontal', amp: '13.2 µV', freq: 'Theta (6.9 Hz)', quality: '94%', modelWeight: 'Included' },
      { id: 'T3',  x: 18, y: 50, region: 'Left Mid-Temporal', amp: '11.5 µV', freq: 'Beta (18.2 Hz)', quality: '96%', modelWeight: 'Moderate' },
      { id: 'Cz',  x: 50, y: 50, region: 'Midline Central (Vertex)', amp: '18.0 µV', freq: 'Sensorimotor (13.1 Hz)', quality: '100%', modelWeight: 'Primary Reference' },
      { id: 'T4',  x: 82, y: 50, region: 'Right Mid-Temporal', amp: '11.9 µV', freq: 'Beta (18.5 Hz)', quality: '95%', modelWeight: 'Moderate' },
      { id: 'Pz',  x: 50, y: 66, region: 'Midline Parietal', amp: '19.4 µV', freq: 'Alpha (9.8 Hz)', quality: '99%', modelWeight: 'High Significance' },
      { id: 'Oz',  x: 50, y: 82, region: 'Midline Occipital', amp: '24.2 µV', freq: 'Alpha Rhythm (10.1 Hz)', quality: '98%', modelWeight: 'Visual Sensory Baseline' }
    ];

    this.render();
  }

  render() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const headStroke = isDark ? 'rgba(255, 255, 255, 0.25)' : '#94a3b8';
    const headFill = isDark ? 'rgba(17, 24, 39, 0.8)' : '#f8fafc';
    const nodeColor = isDark ? '#14b8a6' : '#0d9488';
    const textFill = isDark ? '#e2e8f0' : '#1e293b';

    this.svg.innerHTML = `
      <g stroke="${headStroke}" stroke-width="1.8" fill="none">
        <!-- Nose Landmark -->
        <path d="M 46 11 L 50 4 L 54 11" stroke-linecap="round" stroke-linejoin="round" />
        <!-- Ears -->
        <path d="M 8 44 C 3 47, 3 53, 8 56" />
        <path d="M 92 44 C 97 47, 97 53, 92 56" />
        <!-- Head Contour -->
        <ellipse cx="50" cy="50" rx="42" ry="42" fill="${headFill}" stroke="${headStroke}" />
        <!-- Meridian grid lines -->
        <line x1="50" y1="8" x2="50" y2="92" stroke-dasharray="3,3" opacity="0.6" />
        <line x1="8" y1="50" x2="92" y2="50" stroke-dasharray="3,3" opacity="0.6" />
      </g>
      <g id="disha-electrode-nodes"></g>
    `;

    const g = this.svg.querySelector('#disha-electrode-nodes');

    this.electrodes.forEach(el => {
      const grp = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      grp.setAttribute('class', 'electrode-node-interactive');
      grp.style.cursor = 'pointer';

      // Outer hover ring
      const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      ring.setAttribute('cx', el.x);
      ring.setAttribute('cy', el.y);
      ring.setAttribute('r', '6');
      ring.setAttribute('fill', isDark ? 'rgba(20, 184, 166, 0.2)' : 'rgba(13, 148, 136, 0.15)');

      // Center dot
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', el.x);
      circle.setAttribute('cy', el.y);
      circle.setAttribute('r', '3.8');
      circle.setAttribute('fill', nodeColor);
      circle.setAttribute('stroke', isDark ? '#090d16' : '#ffffff');
      circle.setAttribute('stroke-width', '1.2');

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', el.x);
      text.setAttribute('y', el.y - 5);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', textFill);
      text.setAttribute('font-size', '4.2');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('font-family', 'JetBrains Mono, monospace');
      text.textContent = el.id;

      grp.appendChild(ring);
      grp.appendChild(circle);
      grp.appendChild(text);

      grp.addEventListener('click', () => this.inspectElectrode(el));

      g.appendChild(grp);
    });
  }

  inspectElectrode(el) {
    if (!this.modal) return;
    const title = document.getElementById('electrode-modal-title');
    const body = document.getElementById('electrode-modal-body');

    if (title) title.textContent = `Channel: ${el.id} (${el.region})`;
    if (body) {
      body.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:18px;">
          <div style="background:var(--bg-surface-subtle); padding:14px 16px; border-radius:8px; border:1px solid var(--border-subtle);">
            <div style="font-size:12px; color:var(--text-muted); text-transform:uppercase; font-weight:700; letter-spacing:0.5px;">Mean Amplitude</div>
            <div class="mono" style="font-size:20px; font-weight:700; color:var(--accent-teal); margin-top:4px;">${el.amp}</div>
          </div>
          <div style="background:var(--bg-surface-subtle); padding:14px 16px; border-radius:8px; border:1px solid var(--border-subtle);">
            <div style="font-size:12px; color:var(--text-muted); text-transform:uppercase; font-weight:700; letter-spacing:0.5px;">Dominant Rhythm</div>
            <div class="mono" style="font-size:16.5px; font-weight:700; color:var(--text-primary); margin-top:4px;">${el.freq}</div>
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid var(--border-subtle); font-size:14.5px;">
          <span style="color:var(--text-secondary);">Signal Impedance Quality:</span>
          <strong style="color:var(--state-positive);">${el.quality} (Optimal)</strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid var(--border-subtle); font-size:14.5px;">
          <span style="color:var(--text-secondary);">Model Feature Attribution:</span>
          <strong style="color:var(--text-primary);">${el.modelWeight}</strong>
        </div>
        <p style="font-size:13.5px; color:var(--text-secondary); margin-top:16px; line-height:1.6;">
          * Recorded under standardized 10-20 international montage coordinates. Used in cross-channel covariance matrices and spatial coherence calculations.
        </p>
      `;
    }

    this.modal.classList.add('open');
  }
}

window.DishaWaveformStream = DishaWaveformStream;
window.DishaBrainMap = DishaBrainMap;
