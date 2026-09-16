/**
 * DISHA - Dataset Explorer & Dynamic Column Inspector
 * File: ui/js/dataset-viewer.js
 */

class DishaDatasetViewer {
  constructor(tableBodyId, paginationId, columnSelectorId, sampleInspectorId) {
    this.tableBody = document.getElementById(tableBodyId);
    this.paginationEl = document.getElementById(paginationId);
    this.columnSelector = document.getElementById(columnSelectorId);
    this.inspectorEl = document.getElementById(sampleInspectorId);

    this.currentPage = 1;
    this.limit = 12;
    this.emotionFilter = 'All';
    this.searchQuery = '';
    this.selectedColumns = [
      'mean_0_a', 'mean_1_a', 'mean_2_a', 'mean_3_a',
      'stddev_0_a', 'fft_0_b', 'fft_1_b', 'entropy0_a', 'label'
    ];

    this.init();
  }

  init() {
    this.loadPage(1);
    this.setupListeners();
  }

  setupListeners() {
    const searchInput = document.getElementById('dataset-search-input');
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.searchQuery = e.target.value.trim();
          this.loadPage(1);
        }, 300);
      });
    }

    if (this.columnSelector) {
      this.columnSelector.addEventListener('change', () => {
        const selected = Array.from(this.columnSelector.selectedOptions).map(o => o.value);
        if (selected.length > 0) {
          if (!selected.includes('label')) selected.push('label');
          this.selectedColumns = selected;
          this.loadPage(1);
        }
      });
    }
  }

  async loadPage(page = 1) {
    this.currentPage = page;
    if (this.tableBody) {
      this.tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:20px; color:var(--text-muted);">Loading research dataset records...</td></tr>`;
    }

    const data = await window.dishaApi.getDatasetSamples(
      this.currentPage,
      this.limit,
      this.emotionFilter,
      this.searchQuery,
      this.selectedColumns.join(',')
    );

    this.renderTable(data);
    this.renderPagination(data);
  }

  renderTable(data) {
    if (!this.tableBody) return;

    if (!data.samples || data.samples.length === 0) {
      this.tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:20px; color:var(--text-muted);">No records match criteria.</td></tr>`;
      return;
    }

    const thead = document.getElementById('dataset-table-head');
    if (thead && data.columns) {
      thead.innerHTML = `
        <th>Sample ID</th>
        ${data.columns.filter(c => c !== 'label').map(c => `<th>${c}</th>`).join('')}
        <th>Ground Truth</th>
        <th>Inspect</th>
      `;
    }

    const rowsHtml = data.samples.map(row => {
      const sampleId = row._sample_id;
      const label = row.label;
      const badgeColor = label === 'POSITIVE' ? 'var(--state-positive)' : (label === 'NEGATIVE' ? 'var(--state-negative)' : 'var(--state-neutral)');
      const badgeBg = label === 'POSITIVE' ? 'var(--state-positive-bg)' : (label === 'NEGATIVE' ? 'var(--state-negative-bg)' : 'var(--state-neutral-bg)');

      const featureCells = data.columns.filter(c => c !== 'label').map(c => {
        const val = row[c] !== undefined ? row[c] : '--';
        return `<td class="mono" style="font-size:13px;">${val}</td>`;
      }).join('');

      return `
        <tr data-sample-id="${sampleId}" style="border-bottom:1px solid var(--border-subtle);">
          <td class="mono" style="font-weight:700; font-size:13.5px; color:var(--accent-teal);">#${sampleId}</td>
          ${featureCells}
          <td><span style="background:${badgeBg}; color:${badgeColor}; padding:3px 8px; border-radius:999px; font-weight:700; font-size:12px;">${label}</span></td>
          <td>
            <button class="btn-secondary" onclick="window.datasetViewer.inspectSample(${sampleId})" style="padding:4px 10px; font-size:12.5px; font-weight:600;">
              Predict ➔
            </button>
          </td>
        </tr>
      `;
    }).join('');

    this.tableBody.innerHTML = rowsHtml;
  }

  renderPagination(data) {
    if (!this.paginationEl) return;
    const { page, total_pages, total } = data;
    this.paginationEl.innerHTML = `
      <span style="color:var(--text-secondary); font-size:13px;">Page <strong>${page}</strong> of <strong>${total_pages}</strong> (${total.toLocaleString()} samples)</span>
      <div style="display:flex; gap:8px;">
        <button class="btn-secondary" ${page <= 1 ? 'disabled' : ''} onclick="window.datasetViewer.loadPage(${page - 1})" style="padding:4px 12px; font-size:12.5px;">Prev</button>
        <button class="btn-secondary" ${page >= total_pages ? 'disabled' : ''} onclick="window.datasetViewer.loadPage(${page + 1})" style="padding:4px 12px; font-size:12.5px;">Next</button>
      </div>
    `;
  }

  async inspectSample(sampleId) {
    if (!this.inspectorEl) return;
    this.inspectorEl.innerHTML = `<div style="padding:18px; text-align:center; font-size:14px; color:var(--accent-teal);">Running classification through active model for Sample #${sampleId}...</div>`;

    const result = await window.dishaApi.predict({ sample_idx: sampleId });
    if (!result) {
      this.inspectorEl.innerHTML = `<div style="padding:14px; font-size:14px; color:var(--state-negative);">Prediction failed.</div>`;
      return;
    }

    const { predicted_emotion, emotion_confidence, predicted_stress_level, stress_score, probabilities, inference_latency_ms, ground_truth_label, is_match } = result;

    this.inspectorEl.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
        <div>
          <div style="font-size:16px; font-weight:700; color:var(--text-primary);">Sample #${sampleId} Inference Result</div>
          <div style="font-size:13px; color:var(--text-muted); margin-top:2px;">Holdout validation record</div>
        </div>
        <div>
          <span style="background:${is_match ? 'var(--state-positive-bg)' : 'var(--state-negative-bg)'}; color:${is_match ? 'var(--state-positive)' : 'var(--state-negative)'}; padding:4px 10px; border-radius:999px; font-size:12.5px; font-weight:600;">
            ${is_match ? '✓ Prediction Matches Ground Truth' : '✗ Classification Mismatch'}
          </span>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:14px;">
        <div style="background:var(--bg-surface-subtle); padding:12px 14px; border-radius:8px; border:1px solid var(--border-subtle);">
          <div style="font-size:11.5px; color:var(--text-muted); text-transform:uppercase; font-weight:700; letter-spacing:0.5px;">Predicted Emotion</div>
          <div style="font-size:20px; font-weight:700; color:var(--accent-teal); margin-top:4px;">${predicted_emotion}</div>
          <div style="font-size:12.5px; color:var(--text-secondary); margin-top:2px;">Confidence: ${(emotion_confidence * 100).toFixed(1)}%</div>
        </div>
        <div style="background:var(--bg-surface-subtle); padding:12px 14px; border-radius:8px; border:1px solid var(--border-subtle);">
          <div style="font-size:11.5px; color:var(--text-muted); text-transform:uppercase; font-weight:700; letter-spacing:0.5px;">Stress Score</div>
          <div style="font-size:20px; font-weight:700; color:var(--text-primary); margin-top:4px;">${stress_score?.toFixed(1) || '--'} / 100</div>
          <div style="font-size:12.5px; color:var(--text-secondary); margin-top:2px;">Mapped: ${predicted_stress_level}</div>
        </div>
        <div style="background:var(--bg-surface-subtle); padding:12px 14px; border-radius:8px; border:1px solid var(--border-subtle);">
          <div style="font-size:11.5px; color:var(--text-muted); text-transform:uppercase; font-weight:700; letter-spacing:0.5px;">Inference Latency</div>
          <div class="mono" style="font-size:20px; font-weight:700; color:var(--text-primary); margin-top:4px;">${inference_latency_ms} ms</div>
          <div style="font-size:12.5px; color:var(--text-secondary); margin-top:2px;">Ground Truth: ${ground_truth_label}</div>
        </div>
      </div>
      <div style="font-size:13px; color:var(--text-secondary); display:flex; gap:20px;">
        <span>Positive: <strong>${(probabilities?.POSITIVE * 100 || 0).toFixed(1)}%</strong></span>
        <span>Neutral: <strong>${(probabilities?.NEUTRAL * 100 || 0).toFixed(1)}%</strong></span>
        <span>Negative: <strong>${(probabilities?.NEGATIVE * 100 || 0).toFixed(1)}%</strong></span>
      </div>
    `;
  }
}

window.DishaDatasetViewer = DishaDatasetViewer;
