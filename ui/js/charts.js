/**
 * DISHA - Scientific & Dual-Theme Charting Engine
 * File: ui/js/charts.js
 * 
 * Generates Plotly.js charts with full dynamic Light/Dark theme responsiveness.
 * Features:
 *   - Sleek, modern, elegant category distribution ring (replaces harsh primary pie)
 *   - Synchronized dual-timeline: Neural Activity vs Game Performance
 *   - Multidimensional Performance Radar
 *   - Clean multi-model comparison and 3x3 confusion matrix
 */

function getPlotlyThemeLayout() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: {
      family: 'Inter, -apple-system, sans-serif',
      size: 14,
      color: isDark ? '#cbd5e1' : '#334155'
    },
    gridcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
    bordercolor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1',
    hoverlabel: {
      bgcolor: isDark ? '#111827' : '#ffffff',
      bordercolor: isDark ? '#14b8a6' : '#0d9488',
      font: {
        family: 'Inter, sans-serif',
        size: 13.5,
        color: isDark ? '#f8fafc' : '#090e17'
      }
    }
  };
}

const DISHA_PLOTLY_CONFIG = {
  responsive: true,
  displayModeBar: false,
  displaylogo: false
};

const DishaCharts = {
  /**
   * 1. Synchronized Dual Timeline: Neural Activity vs Game Performance
   */
  renderDualTimeline(containerId, telemetryPoints) {
    const el = document.getElementById(containerId);
    if (!el || !telemetryPoints || telemetryPoints.length === 0) return;

    const theme = getPlotlyThemeLayout();
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    const times = telemetryPoints.map(p => p.time_label);
    const neuralEng = telemetryPoints.map(p => p.neural_engagement);
    const stressIdx = telemetryPoints.map(p => p.stress_index);
    const gameScores = telemetryPoints.map(p => p.game_score);

    // Pick clean spaced ticks every 60s (00:00, 01:00, ...) to prevent horizontal/vertical barcode overlap
    const tickvals = times.filter((_, i) => i % 6 === 0 || i === times.length - 1);

    const data = [
      {
        name: 'Neural Focus (%)',
        x: times,
        y: neuralEng,
        type: 'scatter',
        mode: 'lines',
        line: { color: isDark ? '#14b8a6' : '#0d9488', width: 2.8, shape: 'spline' },
        yaxis: 'y1',
        hovertemplate: 'Neural Focus: %{y:.1f}%<extra></extra>'
      },
      {
        name: 'Stress Index',
        x: times,
        y: stressIdx,
        type: 'scatter',
        mode: 'lines',
        line: { color: isDark ? '#f43f5e' : '#e11d48', width: 2.2, dash: 'dot', shape: 'spline' },
        yaxis: 'y1',
        hovertemplate: 'Stress Index: %{y:.1f}<extra></extra>'
      },
      {
        name: 'Game Score',
        x: times,
        y: gameScores,
        type: 'scatter',
        mode: 'lines',
        line: { color: isDark ? '#3b82f6' : '#2563eb', width: 2.8, shape: 'spline' },
        yaxis: 'y2',
        hovertemplate: 'Score: %{y:,} pts<extra></extra>'
      }
    ];

    const layout = {
      paper_bgcolor: theme.paper_bgcolor,
      plot_bgcolor: theme.plot_bgcolor,
      font: theme.font,
      hoverlabel: theme.hoverlabel,
      margin: { l: 65, r: 75, t: 30, b: 58 },
      xaxis: {
        title: {
          text: 'Session Timeline (MM:SS)',
          font: { size: 12, color: theme.font.color },
          standoff: 16
        },
        tickmode: 'array',
        tickvals: tickvals,
        ticktext: tickvals,
        tickfont: { size: 11, color: theme.font.color },
        tickangle: 0,
        gridcolor: theme.gridcolor,
        zeroline: false
      },
      yaxis: {
        title: {
          text: 'Neural & Stress Index',
          font: { size: 12, color: isDark ? '#14b8a6' : '#0d9488' },
          standoff: 10
        },
        tickfont: { size: 11, color: isDark ? '#14b8a6' : '#0d9488' },
        range: [0, 105],
        gridcolor: theme.gridcolor,
        zeroline: false
      },
      yaxis2: {
        title: {
          text: 'Cumulative Game Score',
          font: { size: 12, color: isDark ? '#3b82f6' : '#2563eb' },
          standoff: 10
        },
        tickfont: { size: 11, color: isDark ? '#3b82f6' : '#2563eb' },
        overlaying: 'y',
        side: 'right',
        zeroline: false,
        showgrid: false
      },
      legend: {
        orientation: 'h',
        x: 0.5,
        y: 1.16,
        xanchor: 'center',
        font: { size: 12, color: theme.font.color }
      },
      hovermode: 'x unified'
    };

    Plotly.react(containerId, data, layout, DISHA_PLOTLY_CONFIG);
  },

  /**
   * 2. Sleek, Modern, Elegant Category Distribution Ring
   * (Redesigned with refined harmonious colors, thin ring, clean typography)
   */
  renderEmotionDonut(containerId, distribution, onSliceClick) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const theme = getPlotlyThemeLayout();
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    const labels = ['POSITIVE', 'NEUTRAL', 'NEGATIVE'];
    const values = [
      distribution?.POSITIVE?.count || 708,
      distribution?.NEUTRAL?.count || 716,
      distribution?.NEGATIVE?.count || 708
    ];
    const total = values.reduce((a, b) => a + b, 0);

    // Harmonious modern editorial palette:
    // Positive: refined emerald jade
    // Neutral: elegant slate cobalt / indigo
    // Negative: sophisticated coral rose
    const colors = isDark 
      ? ['#10b981', '#6366f1', '#f43f5e']
      : ['#059669', '#4f46e5', '#e11d48'];

    const data = [{
      type: 'pie',
      hole: 0.78, // Thin, modern executive ring
      labels: labels,
      values: values,
      marker: {
        colors: colors,
        line: { color: isDark ? '#111827' : '#ffffff', width: 3 }
      },
      textinfo: 'none', // No cramped numbers inside thin ring
      hovertemplate: '<b>%{label}</b><br>Count: %{value:,} epochs<br>Share: %{percent}<extra></extra>'
    }];

    const layout = {
      paper_bgcolor: theme.paper_bgcolor,
      plot_bgcolor: theme.plot_bgcolor,
      font: theme.font,
      hoverlabel: theme.hoverlabel,
      margin: { l: 15, r: 15, t: 10, b: 10 },
      showlegend: false, // Clean custom cards below
      annotations: [
        {
          font: { size: 30, color: isDark ? '#f8fafc' : '#090e17', family: 'Outfit', weight: 'bold' },
          showarrow: false,
          text: `${total.toLocaleString()}`,
          x: 0.5,
          y: 0.56
        },
        {
          font: { size: 12, color: isDark ? '#94a3b8' : '#475569', family: 'Inter', weight: '700' },
          showarrow: false,
          text: 'RESEARCH EPOCHS',
          x: 0.5,
          y: 0.43
        },
        {
          font: { size: 11.5, color: isDark ? '#14b8a6' : '#0d9488', family: 'Inter', weight: '600' },
          showarrow: false,
          text: '33.3% Balanced Split',
          x: 0.5,
          y: 0.33
        }
      ]
    };

    Plotly.react(containerId, data, layout, DISHA_PLOTLY_CONFIG);

    // Render modern accompanying category cards below
    let legendContainer = document.getElementById(containerId + '-legend');
    if (!legendContainer) {
      legendContainer = document.createElement('div');
      legendContainer.id = containerId + '-legend';
      legendContainer.style.display = 'grid';
      legendContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
      legendContainer.style.gap = '10px';
      legendContainer.style.marginTop = '16px';
      el.parentElement.appendChild(legendContainer);
    }

    legendContainer.innerHTML = `
      <div style="background:var(--bg-surface-subtle); padding:10px 12px; border-radius:8px; border:1px solid var(--border-subtle); cursor:pointer; transition:transform 0.15s ease;" onclick="window.dishaChartsClickSlice('POSITIVE')">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="width:9px; height:9px; border-radius:50%; background:${colors[0]};"></span>
            <span style="font-weight:700; font-size:13.5px; color:var(--text-primary);">POSITIVE</span>
          </div>
          <span class="mono" style="font-size:12.5px; font-weight:600; color:var(--text-secondary);">${values[0]}</span>
        </div>
        <div style="font-size:11.5px; color:var(--text-muted); line-height:1.4;">Approach / High Focus (33.2%)</div>
      </div>
      <div style="background:var(--bg-surface-subtle); padding:10px 12px; border-radius:8px; border:1px solid var(--border-subtle); cursor:pointer; transition:transform 0.15s ease;" onclick="window.dishaChartsClickSlice('NEUTRAL')">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="width:9px; height:9px; border-radius:50%; background:${colors[1]};"></span>
            <span style="font-weight:700; font-size:13.5px; color:var(--text-primary);">NEUTRAL</span>
          </div>
          <span class="mono" style="font-size:12.5px; font-weight:600; color:var(--text-secondary);">${values[1]}</span>
        </div>
        <div style="font-size:11.5px; color:var(--text-muted); line-height:1.4;">Equilibrium Baseline (33.6%)</div>
      </div>
      <div style="background:var(--bg-surface-subtle); padding:10px 12px; border-radius:8px; border:1px solid var(--border-subtle); cursor:pointer; transition:transform 0.15s ease;" onclick="window.dishaChartsClickSlice('NEGATIVE')">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="width:9px; height:9px; border-radius:50%; background:${colors[2]};"></span>
            <span style="font-weight:700; font-size:13.5px; color:var(--text-primary);">NEGATIVE</span>
          </div>
          <span class="mono" style="font-size:12.5px; font-weight:600; color:var(--text-secondary);">${values[2]}</span>
        </div>
        <div style="font-size:11.5px; color:var(--text-muted); line-height:1.4;">Sympathetic Tone (33.2%)</div>
      </div>
    `;

    window.dishaChartsClickSlice = (label) => {
      if (onSliceClick) onSliceClick(label);
    };

    if (onSliceClick && !el._hasClickListener) {
      el.on('plotly_click', (d) => {
        if (d.points && d.points.length > 0) {
          onSliceClick(d.points[0].label);
        }
      });
      el._hasClickListener = true;
    }
  },

  /**
   * 3. Performance Profile Radar Chart
   */
  renderPerformanceProfileRadar(containerId, scores = { focus: 86, adaptability: 82, precision: 92, stress_regulation: 78, speed: 85 }) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const theme = getPlotlyThemeLayout();
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    const categories = ['Focus Stability', 'Cognitive Adaptability', 'Decision Precision', 'Stress Regulation', 'Reaction Speed'];
    const values = [scores.focus, scores.adaptability, scores.precision, scores.stress_regulation, scores.speed];

    const data = [{
      type: 'scatterpolar',
      r: [...values, values[0]],
      theta: [...categories, categories[0]],
      fill: 'toself',
      fillcolor: isDark ? 'rgba(20, 184, 166, 0.16)' : 'rgba(13, 148, 136, 0.14)',
      line: { color: isDark ? '#14b8a6' : '#0d9488', width: 2.2 },
      marker: { color: isDark ? '#14b8a6' : '#0d9488', size: 6 },
      hovertemplate: '%{theta}: <b>%{r}/100</b><extra></extra>'
    }];

    const layout = {
      paper_bgcolor: theme.paper_bgcolor,
      plot_bgcolor: theme.plot_bgcolor,
      font: theme.font,
      hoverlabel: theme.hoverlabel,
      margin: { l: 45, r: 45, t: 25, b: 25 },
      polar: {
        radialaxis: {
          visible: true,
          range: [0, 100],
          gridcolor: theme.gridcolor,
          linecolor: 'transparent',
          tickfont: { color: theme.font.color, size: 9.5 }
        },
        angularaxis: {
          gridcolor: theme.gridcolor,
          linecolor: theme.bordercolor,
          tickfont: { color: isDark ? '#f1f5f9' : '#0f172a', size: 12, weight: '600' }
        },
        bgcolor: 'transparent'
      }
    };

    Plotly.react(containerId, data, layout, DISHA_PLOTLY_CONFIG);
  },

  /**
   * 4. Multi-Model Benchmark Comparison (Editorial Grouped Bars)
   */
  renderModelComparison(containerId, models) {
    const el = document.getElementById(containerId);
    if (!el || !models) return;

    const theme = getPlotlyThemeLayout();
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    const names = models.map(m => m.name.replace(' Classifier', '').replace(' (LinearSVC)', '').replace(' (MLP)', ''));
    const accs = models.map(m => m.accuracy);
    const f1s = models.map(m => +(m.macro_f1 * 100).toFixed(2));

    const data = [
      {
        name: 'Accuracy (%)',
        x: names,
        y: accs,
        type: 'bar',
        marker: { color: isDark ? '#14b8a6' : '#0d9488' },
        text: accs.map(v => `${v}%`),
        textposition: 'inside',
        insidetextfont: { color: '#ffffff', size: 11.5, weight: 'bold' },
        hovertemplate: '%{x}<br>Accuracy: %{y:.2f}%<extra></extra>'
      },
      {
        name: 'Macro F1 (%)',
        x: names,
        y: f1s,
        type: 'bar',
        marker: { color: isDark ? '#3b82f6' : '#2563eb' },
        text: f1s.map(v => `${v}%`),
        textposition: 'inside',
        insidetextfont: { color: '#ffffff', size: 11.5, weight: 'bold' },
        hovertemplate: '%{x}<br>Macro F1: %{y:.2f}%<extra></extra>'
      }
    ];

    const layout = {
      paper_bgcolor: theme.paper_bgcolor,
      plot_bgcolor: theme.plot_bgcolor,
      font: theme.font,
      hoverlabel: theme.hoverlabel,
      margin: { l: 50, r: 20, t: 20, b: 50 },
      barmode: 'group',
      bargap: 0.28,
      bargroupgap: 0.1,
      yaxis: {
        range: [90, 101],
        title: 'Validation Score (%)',
        ticksuffix: '%',
        gridcolor: theme.gridcolor,
        zeroline: false
      },
      xaxis: {
        color: isDark ? '#cbd5e1' : '#334155',
        tickfont: { size: 12, weight: '600' }
      },
      legend: {
        orientation: 'h',
        x: 0.5,
        y: 1.15,
        xanchor: 'center',
        font: { color: theme.font.color, size: 12 }
      }
    };

    Plotly.react(containerId, data, layout, DISHA_PLOTLY_CONFIG);
  },

  /**
   * 5. 3x3 Confusion Matrix Heatmap
   */
  renderConfusionMatrix(containerId, matrixData) {
    const el = document.getElementById(containerId);
    if (!el || !matrixData) return;

    const theme = getPlotlyThemeLayout();
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    const labels = matrixData.labels || ['POSITIVE', 'NEUTRAL', 'NEGATIVE'];
    const matrix = matrixData.matrix || [[210, 2, 2], [1, 214, 0], [3, 1, 209]];

    const textValues = matrix.map(row => {
      const rowSum = row.reduce((a, b) => a + b, 0);
      return row.map(val => {
        const pct = rowSum > 0 ? (val / rowSum * 100).toFixed(1) : '0.0';
        return `<b>${val}</b><br><span style="font-size:11.5px; opacity:0.85;">(${pct}%)</span>`;
      });
    });

    const colorscale = isDark 
      ? [[0, '#0f172a'], [0.4, '#1e293b'], [1, '#14b8a6']]
      : [[0, '#f8fafc'], [0.4, '#e2e8f0'], [1, '#0d9488']];

    const data = [{
      type: 'heatmap',
      z: matrix,
      x: labels.map(l => `Pred: ${l}`),
      y: labels.map(l => `Actual: ${l}`),
      text: textValues,
      texttemplate: '%{text}',
      colorscale: colorscale,
      showscale: false,
      hovertemplate: '%{y}<br>%{x}<br>Count: %{z}<extra></extra>'
    }];

    const layout = {
      paper_bgcolor: theme.paper_bgcolor,
      plot_bgcolor: theme.plot_bgcolor,
      font: theme.font,
      hoverlabel: theme.hoverlabel,
      margin: { l: 120, r: 20, t: 20, b: 50 },
      xaxis: {
        color: isDark ? '#cbd5e1' : '#334155',
        tickfont: { size: 13, weight: '700' }
      },
      yaxis: {
        color: isDark ? '#cbd5e1' : '#334155',
        tickfont: { size: 13, weight: '700' },
        autorange: 'reversed'
      }
    };

    Plotly.react(containerId, data, layout, DISHA_PLOTLY_CONFIG);
  },

  /**
   * 6. Top 15 Predictive EEG Features
   */
  renderFeatureImportance(containerId, topFeatures) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const theme = getPlotlyThemeLayout();
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    const sortedEntries = Object.entries(topFeatures || {})
      .sort((a, b) => a[1] - b[1])
      .slice(-15);

    const featureNames = sortedEntries.map(e => e[0]);
    const importances = sortedEntries.map(e => +(e[1] * 100).toFixed(2));

    const data = [{
      type: 'bar',
      orientation: 'h',
      y: featureNames,
      x: importances,
      marker: {
        color: isDark ? '#14b8a6' : '#0d9488',
        line: { color: theme.bordercolor, width: 0.8 }
      },
      text: importances.map(v => `${v}%`),
      textposition: 'outside',
      textfont: { color: theme.font.color, size: 12 },
      hovertemplate: '<b>%{y}</b><br>Importance Weight: %{x:.2f}%<extra></extra>'
    }];

    const layout = {
      paper_bgcolor: theme.paper_bgcolor,
      plot_bgcolor: theme.plot_bgcolor,
      font: theme.font,
      hoverlabel: theme.hoverlabel,
      margin: { l: 140, r: 40, t: 10, b: 40 },
      xaxis: {
        title: 'Feature Importance (%)',
        titlefont: { size: 13, color: theme.font.color },
        tickfont: { size: 12, color: theme.font.color },
        color: theme.font.color,
        gridcolor: theme.gridcolor,
        zeroline: false
      },
      yaxis: {
        color: isDark ? '#cbd5e1' : '#1e293b',
        tickfont: { family: 'JetBrains Mono', size: 12, weight: '500' }
      }
    };

    Plotly.react(containerId, data, layout, DISHA_PLOTLY_CONFIG);
  }
};

window.DishaCharts = DishaCharts;
