/**
 * UI Controller - HelixScan Clinical Genomics Platform
 * Futuristic Dark Medical Theme & Mobile-Optimized Matrix Engine
 */

const UIController = (() => {
  // Application State
  const state = {
    samples: [],
    alignedSamples: [],
    refIndex: 0,
    mutations: [],
    consensusInfo: null,
    matrices: null,
    phyloTree: null,
    activeTab: 'alignment',
    readingFrame: 0,
    cellSize: 'standard', // 'compact', 'standard', 'expanded'
    highlightMode: 'all', // 'all', 'diffs', 'snps', 'indels'
    mutationFilter: {
      sample: 'all',
      type: 'all',
      impact: 'all',
      search: ''
    },
    activeInspectedBase: null
  };

  /**
   * Initialize App
   */
  function init() {
    setupEventListeners();
    // Load default dataset: Sickle Cell Anemia (HBB)
    loadDataset('hbb_sickle_cell');
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /**
   * Setup Event Listeners
   */
  function setupEventListeners() {
    // Preset selector
    const presetSelect = document.getElementById('preset-selector');
    if (presetSelect) {
      presetSelect.addEventListener('change', (e) => {
        if (e.target.value) {
          loadDataset(e.target.value);
        }
      });
    }

    // Desktop Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        switchTab(tab);
      });
    });

    // Mobile Bottom Tab navigation
    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        switchTab(tab);
      });
    });

    // Highlight mode filters
    document.querySelectorAll('input[name="highlight-mode"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        state.highlightMode = e.target.value;
        renderAlignmentMatrix();
      });
    });

    // Reading frame selector
    const frameSelect = document.getElementById('reading-frame-select');
    if (frameSelect) {
      frameSelect.addEventListener('change', (e) => {
        state.readingFrame = parseInt(e.target.value, 10);
        renderTranslationTab();
      });
    }

    // Mutation filters
    const filterSample = document.getElementById('filter-sample');
    const filterType = document.getElementById('filter-type');
    const filterImpact = document.getElementById('filter-impact');
    const filterSearch = document.getElementById('filter-search');

    if (filterSample) filterSample.addEventListener('change', updateMutationFilters);
    if (filterType) filterType.addEventListener('change', updateMutationFilters);
    if (filterImpact) filterImpact.addEventListener('change', updateMutationFilters);
    if (filterSearch) filterSearch.addEventListener('input', updateMutationFilters);

    // Jump to position
    const jumpInput = document.getElementById('jump-pos-input');
    const jumpBtn = document.getElementById('jump-pos-btn');
    if (jumpBtn && jumpInput) {
      jumpBtn.addEventListener('click', () => {
        const pos = parseInt(jumpInput.value, 10);
        if (!isNaN(pos)) scrollToPosition(pos);
      });
      jumpInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const pos = parseInt(jumpInput.value, 10);
          if (!isNaN(pos)) scrollToPosition(pos);
        }
      });
    }

    // File Drop & Upload
    setupFileUpload();

    // Export buttons
    document.getElementById('btn-export-csv')?.addEventListener('click', exportCSV);
    document.getElementById('btn-export-fasta')?.addEventListener('click', exportAlignedFASTA);
    document.getElementById('btn-export-json')?.addEventListener('click', exportJSON);
    document.getElementById('btn-print')?.addEventListener('click', () => window.print());

    // Modal triggers
    document.getElementById('btn-add-sample')?.addEventListener('click', () => openModal('modal-add-sample'));
    document.getElementById('btn-mutate-synth')?.addEventListener('click', () => openModal('modal-mutate-synth'));

    // Global Tooltip for Desktop Mousemove
    document.addEventListener('mousemove', (e) => {
      const tooltip = document.getElementById('bio-tooltip');
      if (tooltip && tooltip.style.opacity === '1') {
        const offset = 15;
        let left = e.clientX + offset;
        let top = e.clientY + offset;
        if (left + 280 > window.innerWidth) left = e.clientX - 290;
        if (top + 170 > window.innerHeight) top = e.clientY - 180;
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
      }
    });

    // Close inspector when tapping outside
    document.addEventListener('click', (e) => {
      const inspector = document.getElementById('mobile-base-inspector');
      if (inspector && !inspector.classList.contains('translate-y-full')) {
        if (!inspector.contains(e.target) && !e.target.closest('.base-cell')) {
          closeInspector();
        }
      }
    });
  }

  /**
   * Set Base Cell Zoom on Matrix (Mobile & Desktop)
   */
  function setCellSize(mode) {
    state.cellSize = mode;
    const root = document.documentElement;

    if (mode === 'compact') {
      root.style.setProperty('--cell-width', '22px');
      root.style.setProperty('--cell-height', '26px');
    } else if (mode === 'expanded') {
      root.style.setProperty('--cell-width', '36px');
      root.style.setProperty('--cell-height', '38px');
    } else {
      root.style.setProperty('--cell-width', '28px');
      root.style.setProperty('--cell-height', '32px');
    }

    renderAlignmentMatrix();
  }

  /**
   * Setup Drag-and-drop & File Input
   */
  function setupFileUpload() {
    const dropzone = document.getElementById('fasta-dropzone');
    const fileInput = document.getElementById('fasta-file-input');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('border-cyan-400', 'bg-cyan-950/20');
      });

      ['dragleave', 'dragend'].forEach(type => {
        dropzone.addEventListener(type, () => {
          dropzone.classList.remove('border-cyan-400', 'bg-cyan-950/20');
        });
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-cyan-400', 'bg-cyan-950/20');
        if (e.dataTransfer.files.length) {
          handleUploadedFiles(e.dataTransfer.files);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
          handleUploadedFiles(e.target.files);
        }
      });
    }
  }

  /**
   * Handle uploaded FASTA or text files
   */
  function handleUploadedFiles(files) {
    const file = files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const parsed = BioAlgorithms.parseFASTA(content);
      if (parsed.length > 0) {
        state.samples = parsed.map((s, idx) => ({
          id: `sample_${Date.now()}_${idx}`,
          name: s.name,
          description: `Uploaded from ${file.name}`,
          sequence: s.sequence,
          active: true
        }));
        state.refIndex = 0;
        const presetEl = document.getElementById('preset-selector');
        if (presetEl) presetEl.value = '';
        runFullAnalysis();
        switchTab('alignment');
        showToast(`Loaded ${parsed.length} clinical sequences from ${file.name}`, 'success');
      } else {
        showToast('Could not parse valid FASTA sequence from file', 'error');
      }
    };
    reader.readAsText(file);
  }

  /**
   * Load curated preset dataset
   */
  function loadDataset(datasetKey) {
    const dataset = SAMPLE_DATASETS[datasetKey];
    if (!dataset) return;

    state.samples = dataset.samples.map((s, idx) => ({
      id: `sample_${dataset.id}_${idx}`,
      name: s.name,
      description: s.description || '',
      sequence: s.sequence,
      active: true
    }));
    state.refIndex = dataset.referenceIndex || 0;

    const bannerTitle = document.getElementById('dataset-title');
    const bannerDesc = document.getElementById('dataset-desc');
    const bannerCategory = document.getElementById('dataset-category');
    if (bannerTitle) bannerTitle.textContent = dataset.title;
    if (bannerDesc) bannerDesc.textContent = dataset.description;
    if (bannerCategory) bannerCategory.textContent = dataset.category;

    runFullAnalysis();
  }

  /**
   * Primary pipeline: Alignment -> Mutations -> Consensus -> Matrices -> Phylogeny
   */
  function runFullAnalysis() {
    if (!state.samples || state.samples.length === 0) return;

    if (state.refIndex < 0 || state.refIndex >= state.samples.length) {
      state.refIndex = 0;
    }

    // 1. Multiple Sequence Alignment
    state.alignedSamples = BioAlgorithms.multiSequenceAlign(state.samples, state.refIndex);

    // 2. Consensus and Conservation
    state.consensusInfo = BioAlgorithms.calculateConsensus(state.alignedSamples);

    // 3. Mutation Detection against Reference
    const refAligned = state.alignedSamples[state.refIndex].aligned;
    const allMutations = [];

    state.alignedSamples.forEach((sample, idx) => {
      if (idx !== state.refIndex) {
        const muts = BioAlgorithms.detectMutations(refAligned, sample.aligned, sample.name, sample.id);
        allMutations.push(...muts);
      }
    });

    state.mutations = allMutations;

    // 4. Similarity and Distance Matrices
    state.matrices = BioAlgorithms.computeMatrices(state.alignedSamples);

    // 5. UPGMA Phylogenetic Tree
    state.phyloTree = BioAlgorithms.buildUPGMATree(state.matrices.names, state.matrices.distanceMatrix);

    // Update UI Stats & Views
    updateOverviewStats();
    updateSampleFilterDropdown();
    renderAlignmentMatrix();
    renderMutationLedger();
    renderMatricesTab();
    renderPhylogeneticTree();
    renderTranslationTab();
    renderSampleManager();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /**
   * Update top KPI summary cards
   */
  function updateOverviewStats() {
    const totalSamplesEl = document.getElementById('stat-total-samples');
    const seqLengthEl = document.getElementById('stat-seq-length');
    const totalMutsEl = document.getElementById('stat-total-mutations');
    const avgIdentityEl = document.getElementById('stat-avg-identity');
    const tsTvRatioEl = document.getElementById('stat-tstv-ratio');

    if (totalSamplesEl) totalSamplesEl.textContent = state.alignedSamples.length;
    if (seqLengthEl) seqLengthEl.textContent = `${state.alignedSamples[0]?.aligned.length || 0} bp`;
    if (totalMutsEl) totalMutsEl.textContent = state.mutations.length;

    // Compute average identity against reference
    if (state.matrices && state.matrices.identityMatrix.length > 1) {
      const refIdentities = state.matrices.identityMatrix[state.refIndex].filter((_, idx) => idx !== state.refIndex);
      const avg = refIdentities.reduce((a, b) => a + b, 0) / refIdentities.length;
      if (avgIdentityEl) avgIdentityEl.textContent = `${avg.toFixed(1)}%`;
    } else if (avgIdentityEl) {
      avgIdentityEl.textContent = '100%';
    }

    // Global Ts/Tv ratio across all mutations
    let tsCount = 0;
    let tvCount = 0;
    state.mutations.forEach(m => {
      if (m.isTransition) tsCount++;
      if (m.isTransversion) tvCount++;
    });
    const tsTv = tvCount > 0 ? (tsCount / tvCount).toFixed(2) : (tsCount > 0 ? 'Inf' : '0.00');
    if (tsTvRatioEl) tsTvRatioEl.textContent = `${tsTv} (${tsCount}/${tvCount})`;
  }

  /**
   * Render Alignment Matrix View
   */
  function renderAlignmentMatrix() {
    const container = document.getElementById('alignment-matrix-content');
    if (!container || !state.alignedSamples || state.alignedSamples.length === 0) return;

    const alignedLen = state.alignedSamples[0].aligned.length;
    const refSeq = state.alignedSamples[state.refIndex].aligned;

    // Build ruler row
    let rulerHtml = `
      <div class="flex items-center sticky-header bg-[#030612] border-b border-cyan-500/20 min-w-max text-xs text-slate-400 select-none">
        <div class="sticky-corner w-48 sm:w-64 px-3 sm:px-4 py-2 text-cyan-400 font-mono font-bold tracking-wider uppercase text-[10px] shrink-0">
          Position Ruler
        </div>
        <div class="flex">`;

    for (let col = 0; col < alignedLen; col++) {
      const pos = col + 1;
      const isTick = (pos % 10 === 0) || (pos === 1);
      rulerHtml += `
        <div class="base-cell text-center font-mono text-[9px] text-slate-500 border-r border-slate-800/80">
          ${isTick ? pos : '·'}
        </div>`;
    }
    rulerHtml += `</div></div>`;

    // Consensus Row
    let consensusHtml = `
      <div class="flex items-center bg-[#070e20] border-b border-cyan-500/20 min-w-max">
        <div class="sticky-col w-48 sm:w-64 px-3 sm:px-4 py-2 font-mono text-xs font-semibold text-emerald-400 shrink-0 flex items-center justify-between">
          <span class="flex items-center gap-1.5 truncate">
            <span class="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]"></span>
            Consensus Track
          </span>
          <span class="text-[9px] text-slate-400 font-mono hidden sm:inline">Major Base</span>
        </div>
        <div class="flex">`;

    for (let col = 0; col < alignedLen; col++) {
      const base = state.consensusInfo.consensus[col];
      const score = Math.round(state.consensusInfo.conservation[col].score * 100);
      consensusHtml += `
        <div class="base-cell base-${base === '-' ? 'gap' : base}" 
             data-col="${col}" data-pos="${col + 1}"
             title="Consensus: ${base} (${score}% conserved)">
          ${base}
        </div>`;
    }
    consensusHtml += `</div></div>`;

    // Conservation Score Bar Track
    let conservationBarHtml = `
      <div class="flex items-center bg-[#040816] border-b border-slate-800 min-w-max">
        <div class="sticky-col w-48 sm:w-64 px-3 sm:px-4 py-1.5 font-mono text-[10px] text-slate-400 shrink-0 flex items-center justify-between">
          <span>Conservation %</span>
          <span class="text-[9px] text-slate-500 hidden sm:inline">0 - 100%</span>
        </div>
        <div class="flex h-5 items-end">`;

    for (let col = 0; col < alignedLen; col++) {
      const score = state.consensusInfo.conservation[col].score;
      const heightPct = Math.round(score * 100);
      let barColor = 'bg-emerald-400 shadow-[0_0_6px_#10b981]';
      if (heightPct < 50) barColor = 'bg-rose-500 shadow-[0_0_6px_#f43f5e]';
      else if (heightPct < 85) barColor = 'bg-amber-400 shadow-[0_0_6px_#f59e0b]';

      conservationBarHtml += `
        <div class="base-cell h-full flex items-end justify-center px-0.5 border-r border-slate-800/40"
             title="Pos ${col + 1}: ${heightPct}% conserved">
          <div class="w-full ${barColor} rounded-t-sm" style="height: ${heightPct}%;"></div>
        </div>`;
    }
    conservationBarHtml += `</div></div>`;

    // Sample Sequences Rows
    let samplesHtml = '';
    state.alignedSamples.forEach((sample, sIdx) => {
      const isRef = (sIdx === state.refIndex);
      const rowBg = isRef ? 'bg-indigo-950/25 hover:bg-indigo-950/40' : 'bg-[#050b18]/60 hover:bg-[#0a1630]/80';

      samplesHtml += `
        <div class="flex items-center ${rowBg} border-b border-slate-800/80 min-w-max transition-colors">
          <div class="sticky-col w-48 sm:w-64 px-3 sm:px-4 py-2 font-mono text-xs font-medium text-slate-200 shrink-0 flex items-center justify-between">
            <div class="truncate max-w-[120px] sm:max-w-[170px]" title="${sample.name}">
              ${sample.name}
            </div>
            ${isRef ? 
              `<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-500/50">REF</span>` : 
              `<span class="text-[10px] text-slate-500 font-mono">#${sIdx + 1}</span>`
            }
          </div>
          <div class="flex">`;

      const seq = sample.aligned;
      for (let col = 0; col < alignedLen; col++) {
        const char = seq[col];
        const refChar = refSeq[col];
        const isDiff = !isRef && (char !== refChar);
        const isIndel = (char === '-' || refChar === '-');

        // Apply highlight filters
        let cellClass = `base-cell base-${char === '-' ? 'gap' : char}`;
        let shouldDim = false;

        if (isDiff) {
          if (isIndel) cellClass += ' diff-indel';
          else cellClass += ' diff-cell';
        }

        if (state.highlightMode === 'diffs' && !isDiff && !isRef) {
          shouldDim = true;
        } else if (state.highlightMode === 'snps' && (!isDiff || isIndel) && !isRef) {
          shouldDim = true;
        } else if (state.highlightMode === 'indels' && (!isDiff || !isIndel) && !isRef) {
          shouldDim = true;
        }

        if (shouldDim) {
          cellClass += ' opacity-20';
        }

        samplesHtml += `
          <div class="${cellClass}" 
               data-sample-idx="${sIdx}" 
               data-col="${col}" 
               data-pos="${col + 1}"
               data-char="${char}" 
               data-ref-char="${refChar}"
               onclick="UIController.inspectBase(event)"
               onmouseenter="UIController.handleBaseHover(event)"
               onmouseleave="UIController.handleBaseLeave(event)">
            ${char}
          </div>`;
      }
      samplesHtml += `</div></div>`;
    });

    container.innerHTML = rulerHtml + consensusHtml + conservationBarHtml + samplesHtml;
    renderMinimap();
  }

  /**
   * Minimap overview density bar showing mutation hotspots along the genome
   */
  function renderMinimap() {
    const minimapCanvas = document.getElementById('alignment-minimap-canvas');
    if (!minimapCanvas || !state.alignedSamples || state.alignedSamples.length === 0) return;

    const ctx = minimapCanvas.getContext('2d');
    const width = minimapCanvas.parentElement.clientWidth || 600;
    const height = 24;
    minimapCanvas.width = width;
    minimapCanvas.height = height;

    const alignedLen = state.alignedSamples[0].aligned.length;
    const refSeq = state.alignedSamples[state.refIndex].aligned;

    // Background track
    ctx.fillStyle = '#050b18';
    ctx.fillRect(0, 0, width, height);

    // Compute diff density per bucket
    const buckets = new Float32Array(width);
    for (let col = 0; col < alignedLen; col++) {
      const bIdx = Math.floor((col / alignedLen) * width);
      let diffCount = 0;
      for (let s = 0; s < state.alignedSamples.length; s++) {
        if (s !== state.refIndex && state.alignedSamples[s].aligned[col] !== refSeq[col]) {
          diffCount++;
        }
      }
      buckets[bIdx] += diffCount;
    }

    const maxDiff = Math.max(1, ...buckets);

    // Render glowing bars
    for (let x = 0; x < width; x++) {
      const val = buckets[x];
      if (val > 0) {
        const barHeight = (val / maxDiff) * (height - 4);
        ctx.fillStyle = val > 2 ? '#f43f5e' : '#00f0ff';
        ctx.fillRect(x, height - barHeight - 2, 1, barHeight);
      }
    }
  }

  /**
   * Mobile-Friendly Base Inspector (Bottom Sheet on tap)
   */
  function inspectBase(e) {
    const target = e.currentTarget;
    const col = parseInt(target.dataset.col, 10);
    const pos = parseInt(target.dataset.pos, 10);
    const sIdx = parseInt(target.dataset.sampleIdx, 10);
    const char = target.dataset.char;
    const refChar = target.dataset.refChar;

    const sample = state.alignedSamples[sIdx];
    const isRef = (sIdx === state.refIndex);
    const mutation = state.mutations.find(m => m.sampleId === sample.id && m.position === pos);

    const inspector = document.getElementById('mobile-base-inspector');
    const nameEl = document.getElementById('inspector-sample-name');
    const posEl = document.getElementById('inspector-position');
    const contentEl = document.getElementById('inspector-content');

    if (!inspector || !contentEl) return;

    nameEl.textContent = sample.name;
    posEl.textContent = `Position ${pos} (1-idx)`;

    let html = `
      <div class="grid grid-cols-2 gap-3 bg-[#040816] p-3 rounded-xl border border-cyan-500/20">
        <div>
          <span class="text-slate-400 text-[10px] uppercase font-mono block">Sample Base</span>
          <span class="text-lg font-bold font-mono text-cyan-300">${char}</span>
        </div>
        <div>
          <span class="text-slate-400 text-[10px] uppercase font-mono block">Reference Base</span>
          <span class="text-lg font-bold font-mono text-indigo-300">${refChar}</span>
        </div>
      </div>`;

    if (mutation) {
      const isSNP = mutation.type === 'SNP';
      html += `
        <div class="bg-[#040816] p-3 rounded-xl border border-cyan-500/20 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-slate-400 font-mono text-[11px]">MUTATION CLASS:</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${isSNP ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50' : 'bg-purple-500/30 text-purple-300 border border-purple-500/50'}">
              ${mutation.subType}
            </span>
          </div>
          ${mutation.codonChange ? `
            <div class="flex items-center justify-between text-slate-300">
              <span class="font-mono text-slate-400">Codon Triplet:</span>
              <span class="font-mono font-bold text-amber-300">${mutation.codonChange}</span>
            </div>` : ''}
          ${mutation.aaChange ? `
            <div class="flex items-center justify-between text-slate-300">
              <span class="font-mono text-slate-400">Protein Residue:</span>
              <span class="font-mono font-bold text-cyan-300">${mutation.aaChange}</span>
            </div>` : ''}
          <div class="flex items-center justify-between pt-1 border-t border-slate-800 text-slate-300">
            <span class="font-mono text-slate-400">Clinical Impact:</span>
            <span class="font-bold text-emerald-400">${mutation.impact || 'Unknown'}</span>
          </div>
        </div>`;
    } else if (isRef) {
      html += `<div class="p-2 text-indigo-300 italic font-mono text-[11px] bg-indigo-950/30 rounded border border-indigo-500/30">Reference Standard Baseline Sequence</div>`;
    } else {
      html += `<div class="p-2 text-emerald-300 font-mono text-[11px] bg-emerald-950/30 rounded border border-emerald-500/30">Conserved Base (100% Homology to Reference)</div>`;
    }

    contentEl.innerHTML = html;
    inspector.classList.remove('translate-y-full');
  }

  function closeInspector() {
    const inspector = document.getElementById('mobile-base-inspector');
    if (inspector) inspector.classList.add('translate-y-full');
  }

  /**
   * Handle Desktop Tooltip on Base Cell Hover
   */
  function handleBaseHover(e) {
    // Only show on desktop screens
    if (window.innerWidth < 768) return;

    const target = e.currentTarget;
    const col = parseInt(target.dataset.col, 10);
    const pos = parseInt(target.dataset.pos, 10);
    const sIdx = parseInt(target.dataset.sampleIdx, 10);
    const char = target.dataset.char;
    const refChar = target.dataset.refChar;

    const sample = state.alignedSamples[sIdx];
    const isRef = (sIdx === state.refIndex);
    const tooltip = document.getElementById('bio-tooltip');
    if (!tooltip) return;

    const mutation = state.mutations.find(m => m.sampleId === sample.id && m.position === pos);

    let html = `
      <div class="bg-[#070e1e]/95 backdrop-blur-xl border border-cyan-500/40 rounded-xl shadow-2xl p-3 text-xs w-64 space-y-2">
        <div class="flex items-center justify-between border-b border-cyan-500/20 pb-1.5">
          <span class="font-bold text-slate-100 truncate font-display">${sample.name}</span>
          <span class="font-mono text-cyan-400 font-bold">Pos ${pos}</span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-slate-300 font-mono">
          <div>Base: <span class="font-bold text-cyan-300">${char}</span></div>
          <div>Ref: <span class="font-bold text-indigo-300">${refChar}</span></div>
        </div>`;

    if (mutation) {
      const isSNP = mutation.type === 'SNP';
      html += `
        <div class="pt-1.5 border-t border-cyan-500/20 space-y-1 font-mono">
          <div class="flex items-center gap-1.5">
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${isSNP ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50' : 'bg-purple-500/30 text-purple-300 border border-purple-500/50'}">
              ${mutation.subType}
            </span>
          </div>
          ${mutation.codonChange ? `<div class="text-slate-300">Codon: <span class="text-amber-300">${mutation.codonChange}</span></div>` : ''}
          ${mutation.aaChange ? `<div class="text-slate-300">Protein: <span class="font-bold text-cyan-300">${mutation.aaChange}</span></div>` : ''}
          ${mutation.impact ? `<div class="text-slate-400 text-[11px]">${mutation.impact}</div>` : ''}
        </div>`;
    } else if (isRef) {
      html += `<div class="text-[11px] text-indigo-400 italic font-mono">Reference Standard Base</div>`;
    } else {
      html += `<div class="text-[11px] text-emerald-400 font-mono">Conserved (Matches Reference)</div>`;
    }

    html += `</div>`;
    tooltip.innerHTML = html;
    tooltip.style.opacity = '1';
  }

  function handleBaseLeave() {
    const tooltip = document.getElementById('bio-tooltip');
    if (tooltip) tooltip.style.opacity = '0';
  }

  /**
   * Scroll alignment matrix container to a specific position
   */
  function scrollToPosition(pos) {
    const matrix = document.querySelector('.matrix-container');
    if (!matrix) return;
    const cellWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-width')) || 28;
    const scrollTarget = (pos - 1) * cellWidth;
    matrix.scrollTo({
      left: scrollTarget,
      behavior: 'smooth'
    });
  }

  /**
   * Update Sample Filter Dropdown in Mutation Table
   */
  function updateSampleFilterDropdown() {
    const select = document.getElementById('filter-sample');
    if (!select) return;

    let options = '<option value="all">All Query Samples</option>';
    state.alignedSamples.forEach((s, idx) => {
      if (idx !== state.refIndex) {
        options += `<option value="${s.id}">${s.name}</option>`;
      }
    });
    select.innerHTML = options;
  }

  /**
   * Filter and Render Mutation Ledger Table & Mobile Cards
   */
  function updateMutationFilters() {
    state.mutationFilter = {
      sample: document.getElementById('filter-sample')?.value || 'all',
      type: document.getElementById('filter-type')?.value || 'all',
      impact: document.getElementById('filter-impact')?.value || 'all',
      search: (document.getElementById('filter-search')?.value || '').toLowerCase().trim()
    };
    renderMutationLedger();
  }

  function renderMutationLedger() {
    const tbody = document.getElementById('mutation-table-body');
    const mobileContainer = document.getElementById('mobile-mutation-cards');
    const countBadge = document.getElementById('mutation-filtered-count');

    let filtered = state.mutations;

    // Filter by sample
    if (state.mutationFilter.sample !== 'all') {
      filtered = filtered.filter(m => m.sampleId === state.mutationFilter.sample);
    }

    // Filter by type
    if (state.mutationFilter.type !== 'all') {
      filtered = filtered.filter(m => {
        if (state.mutationFilter.type === 'transition') return m.isTransition;
        if (state.mutationFilter.type === 'transversion') return m.isTransversion;
        if (state.mutationFilter.type === 'insertion') return m.type === 'Insertion';
        if (state.mutationFilter.type === 'deletion') return m.type === 'Deletion';
        return true;
      });
    }

    // Filter by impact
    if (state.mutationFilter.impact !== 'all') {
      filtered = filtered.filter(m => {
        if (!m.impact) return false;
        return m.impact.toLowerCase().includes(state.mutationFilter.impact.toLowerCase());
      });
    }

    // Filter by search text
    if (state.mutationFilter.search) {
      const q = state.mutationFilter.search;
      filtered = filtered.filter(m => 
        m.sampleName.toLowerCase().includes(q) ||
        m.subType.toLowerCase().includes(q) ||
        m.position.toString().includes(q) ||
        (m.codonChange && m.codonChange.toLowerCase().includes(q)) ||
        (m.aaChange && m.aaChange.toLowerCase().includes(q)) ||
        (m.impact && m.impact.toLowerCase().includes(q))
      );
    }

    if (countBadge) {
      countBadge.textContent = `${filtered.length} of ${state.mutations.length} mutations`;
    }

    // Desktop Table Rendering
    if (tbody) {
      if (filtered.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="8" class="text-center py-8 text-slate-500 font-mono">
              No mutations match current diagnostic filters.
            </td>
          </tr>`;
      } else {
        let rowsHtml = '';
        filtered.forEach(m => {
          let impactBadgeClass = 'bg-slate-800 text-slate-300';
          if (m.impact?.includes('Silent')) impactBadgeClass = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
          else if (m.impact?.includes('Conservative')) impactBadgeClass = 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40';
          else if (m.impact?.includes('Radical')) impactBadgeClass = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
          else if (m.impact?.includes('Nonsense') || m.impact?.includes('Frameshift')) impactBadgeClass = 'bg-rose-500/20 text-rose-300 border border-rose-500/40';

          let typeBadgeClass = 'bg-slate-800 text-slate-300';
          if (m.isTransition) typeBadgeClass = 'bg-teal-500/20 text-teal-300 border border-teal-500/40';
          else if (m.isTransversion) typeBadgeClass = 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40';
          else if (m.type === 'Insertion') typeBadgeClass = 'bg-purple-500/20 text-purple-300 border border-purple-500/40';
          else if (m.type === 'Deletion') typeBadgeClass = 'bg-pink-500/20 text-pink-300 border border-pink-500/40';

          rowsHtml += `
            <tr class="border-b border-slate-800/80 hover:bg-[#0c1833]/60 transition-colors">
              <td class="py-3 px-4 font-mono font-medium text-slate-200">
                ${m.sampleName}
              </td>
              <td class="py-3 px-4 font-mono font-bold text-cyan-400">
                ${m.position}
              </td>
              <td class="py-3 px-4">
                <span class="px-2 py-0.5 rounded text-[11px] font-semibold ${typeBadgeClass}">
                  ${m.subType}
                </span>
              </td>
              <td class="py-3 px-4 font-mono text-sm">
                <span class="text-rose-400 font-bold">${m.refBase}</span>
                <span class="text-slate-500 mx-1.5">→</span>
                <span class="text-emerald-400 font-bold">${m.altBase}</span>
              </td>
              <td class="py-3 px-4 font-mono text-xs text-amber-300">
                ${m.codonChange || '-'}
              </td>
              <td class="py-3 px-4 font-mono text-xs font-bold text-cyan-300">
                ${m.aaChange || '-'}
              </td>
              <td class="py-3 px-4">
                <span class="px-2 py-0.5 rounded text-[11px] font-semibold ${impactBadgeClass}">
                  ${m.impact || 'Unknown'}
                </span>
              </td>
              <td class="py-3 px-4 text-right">
                <button class="px-2.5 py-1 text-xs rounded-lg bg-[#081328] hover:bg-cyan-950 text-cyan-300 border border-cyan-500/40 transition"
                        onclick="UIController.jumpToMutation(${m.position})">
                  Locate
                </button>
              </td>
            </tr>`;
        });
        tbody.innerHTML = rowsHtml;
      }
    }

    // Mobile Mutation Cards Rendering (Feed for mobile phones)
    if (mobileContainer) {
      if (filtered.length === 0) {
        mobileContainer.innerHTML = `
          <div class="text-center py-6 text-slate-500 font-mono text-xs">
            No mutations match current diagnostic filters.
          </div>`;
      } else {
        let cardsHtml = '';
        filtered.forEach(m => {
          let impactBadgeClass = 'bg-slate-800 text-slate-300';
          if (m.impact?.includes('Silent')) impactBadgeClass = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
          else if (m.impact?.includes('Conservative')) impactBadgeClass = 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40';
          else if (m.impact?.includes('Radical')) impactBadgeClass = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
          else if (m.impact?.includes('Nonsense') || m.impact?.includes('Frameshift')) impactBadgeClass = 'bg-rose-500/20 text-rose-300 border border-rose-500/40';

          cardsHtml += `
            <div class="mutation-card-mobile space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold font-display text-slate-100 text-sm truncate max-w-[190px]">${m.sampleName}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  Pos ${m.position}
                </span>
              </div>
              <div class="flex items-center justify-between text-xs font-mono">
                <div class="flex items-center gap-1.5">
                  <span class="text-rose-400 font-bold">${m.refBase}</span>
                  <span class="text-slate-500">→</span>
                  <span class="text-emerald-400 font-bold">${m.altBase}</span>
                  <span class="text-slate-400 text-[10px]">(${m.subType})</span>
                </div>
                ${m.aaChange ? `<span class="text-cyan-300 font-bold">${m.aaChange}</span>` : ''}
              </div>
              <div class="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                <span class="px-2 py-0.5 rounded font-semibold ${impactBadgeClass}">
                  ${m.impact || 'Unknown'}
                </span>
                <button class="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs shadow-sm transition"
                        onclick="UIController.jumpToMutation(${m.position})">
                  Locate
                </button>
              </div>
            </div>`;
        });
        mobileContainer.innerHTML = cardsHtml;
      }
    }
  }

  function jumpToMutation(position) {
    switchTab('alignment');
    scrollToPosition(position);
  }

  /**
   * Render Matrices Tab (Identity & Distance Heatmaps)
   */
  function renderMatricesTab() {
    const idContainer = document.getElementById('identity-matrix-container');
    const distContainer = document.getElementById('distance-matrix-container');
    if (!idContainer || !distContainer || !state.matrices) return;

    const names = state.matrices.names;
    const n = names.length;

    // Identity Matrix Table
    let idHtml = `<table class="w-full text-xs font-mono text-center border-collapse"><thead><tr><th class="p-2 text-left bg-[#030612] border border-cyan-500/20 text-cyan-400">Sample</th>`;
    names.forEach(name => {
      idHtml += `<th class="p-2 bg-[#030612] border border-cyan-500/20 text-slate-300 truncate max-w-[85px]" title="${name}">${name.substring(0, 8)}</th>`;
    });
    idHtml += `</tr></thead><tbody>`;

    for (let i = 0; i < n; i++) {
      idHtml += `<tr><td class="p-2 text-left font-semibold bg-[#030612] border border-cyan-500/20 text-slate-300 truncate max-w-[110px]" title="${names[i]}">${names[i]}</td>`;
      for (let j = 0; j < n; j++) {
        const val = state.matrices.identityMatrix[i][j];
        let bgStyle = '';
        if (i === j) {
          bgStyle = 'background: rgba(16, 185, 129, 0.25); color: #6ee7b7; font-weight: 700;';
        } else {
          const ratio = Math.max(0, Math.min(1, (val - 70) / 30));
          bgStyle = `background: rgba(6, 182, 212, ${0.1 + ratio * 0.45}); color: #e0f2fe;`;
        }
        idHtml += `<td class="p-2 border border-slate-800 matrix-val-cell cursor-default" style="${bgStyle}" title="${names[i]} vs ${names[j]}: ${val.toFixed(2)}% identity">${val.toFixed(1)}%</td>`;
      }
      idHtml += `</tr>`;
    }
    idHtml += `</tbody></table>`;
    idContainer.innerHTML = idHtml;

    // Distance Matrix Table (Jukes-Cantor)
    let distHtml = `<table class="w-full text-xs font-mono text-center border-collapse"><thead><tr><th class="p-2 text-left bg-[#030612] border border-cyan-500/20 text-rose-400">Sample</th>`;
    names.forEach(name => {
      distHtml += `<th class="p-2 bg-[#030612] border border-cyan-500/20 text-slate-300 truncate max-w-[85px]" title="${name}">${name.substring(0, 8)}</th>`;
    });
    distHtml += `</tr></thead><tbody>`;

    for (let i = 0; i < n; i++) {
      distHtml += `<tr><td class="p-2 text-left font-semibold bg-[#030612] border border-cyan-500/20 text-slate-300 truncate max-w-[110px]" title="${names[i]}">${names[i]}</td>`;
      for (let j = 0; j < n; j++) {
        const val = state.matrices.distanceMatrix[i][j];
        let bgStyle = '';
        if (i === j) {
          bgStyle = 'background: rgba(100, 116, 139, 0.15); color: #94a3b8;';
        } else {
          const intensity = Math.min(1, val * 5);
          bgStyle = `background: rgba(244, 63, 94, ${0.12 + intensity * 0.45}); color: #fecdd3;`;
        }
        distHtml += `<td class="p-2 border border-slate-800 matrix-val-cell cursor-default" style="${bgStyle}" title="${names[i]} vs ${names[j]}: d = ${val.toFixed(4)}">${val.toFixed(3)}</td>`;
      }
      distHtml += `</tr>`;
    }
    distHtml += `</tbody></table>`;
    distContainer.innerHTML = distHtml;

    setupPairwiseComparator();
  }

  /**
   * Pairwise detailed comparative breakdown
   */
  function setupPairwiseComparator() {
    const selA = document.getElementById('comp-sample-a');
    const selB = document.getElementById('comp-sample-b');
    if (!selA || !selB) return;

    let opts = '';
    state.alignedSamples.forEach((s, idx) => {
      opts += `<option value="${idx}">${s.name}</option>`;
    });
    selA.innerHTML = opts;
    selB.innerHTML = opts;

    if (state.alignedSamples.length > 1) {
      selA.value = '0';
      selB.value = '1';
    }

    const runComp = () => {
      const idxA = parseInt(selA.value, 10);
      const idxB = parseInt(selB.value, 10);
      const sA = state.alignedSamples[idxA];
      const sB = state.alignedSamples[idxB];
      if (!sA || !sB) return;

      const stats = BioAlgorithms.calculatePairwiseStats(sA.aligned, sB.aligned);
      const resultBox = document.getElementById('pairwise-stats-output');
      if (resultBox) {
        resultBox.innerHTML = `
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
            <div class="bg-[#040816] p-3 rounded-xl border border-cyan-500/20">
              <div class="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Similarity Score</div>
              <div class="text-xl font-bold font-mono text-emerald-400 mt-1">${stats.similarity}%</div>
              <div class="text-[10px] text-slate-500 font-mono mt-0.5">${stats.matches} identical bases</div>
            </div>
            <div class="bg-[#040816] p-3 rounded-xl border border-cyan-500/20">
              <div class="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Jukes-Cantor Distance</div>
              <div class="text-xl font-bold font-mono text-cyan-400 mt-1">${stats.jcDistance}</div>
              <div class="text-[10px] text-slate-500 font-mono mt-0.5">Substitutions / site</div>
            </div>
            <div class="bg-[#040816] p-3 rounded-xl border border-cyan-500/20">
              <div class="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Ts / Tv Ratio</div>
              <div class="text-xl font-bold font-mono text-amber-400 mt-1">${stats.tsTvRatio}</div>
              <div class="text-[10px] text-slate-500 font-mono mt-0.5">${stats.transitions} Ts / ${stats.transversions} Tv</div>
            </div>
            <div class="bg-[#040816] p-3 rounded-xl border border-cyan-500/20">
              <div class="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Indel Columns</div>
              <div class="text-xl font-bold font-mono text-purple-400 mt-1">${stats.gaps}</div>
              <div class="text-[10px] text-slate-500 font-mono mt-0.5">Aligned Gap Sites</div>
            </div>
          </div>`;
      }
    };

    selA.onchange = runComp;
    selB.onchange = runComp;
    runComp();
  }

  /**
   * Render Interactive UPGMA Phylogenetic Cladogram via SVG
   */
  function renderPhylogeneticTree() {
    const svg = document.getElementById('phylo-tree-svg');
    if (!svg || !state.phyloTree) return;

    const width = svg.parentElement.clientWidth || 700;
    const height = Math.max(350, state.alignedSamples.length * 75);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.innerHTML = '';

    const root = state.phyloTree;
    const padding = { top: 40, right: 220, bottom: 40, left: 50 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    const leaves = [];
    function findLeaves(node) {
      if (node.isLeaf) leaves.push(node);
      else if (node.children) node.children.forEach(findLeaves);
    }
    findLeaves(root);

    const leafYMap = new Map();
    leaves.forEach((l, idx) => {
      const y = padding.top + (idx / Math.max(1, leaves.length - 1)) * plotHeight;
      leafYMap.set(l, y);
    });

    const maxTreeHeight = Math.max(0.0001, root.height);

    function computeCoords(node) {
      const x = padding.left + ((maxTreeHeight - node.height) / maxTreeHeight) * plotWidth;
      if (node.isLeaf) {
        node.x = x;
        node.y = leafYMap.get(node);
      } else {
        node.children.forEach(computeCoords);
        node.x = x;
        node.y = (node.children[0].y + node.children[1].y) / 2;
      }
    }
    computeCoords(root);

    let svgContent = '';
    function renderBranches(node) {
      if (!node.isLeaf && node.children) {
        const c1 = node.children[0];
        const c2 = node.children[1];

        svgContent += `
          <path class="tree-branch" d="M ${node.x} ${c1.y} L ${c1.x} ${c1.y}" />
          <path class="tree-branch" d="M ${node.x} ${c2.y} L ${c2.x} ${c2.y}" />
          <path class="tree-branch" d="M ${node.x} ${c1.y} L ${node.x} ${c2.y}" />
        `;

        svgContent += `
          <circle cx="${node.x}" cy="${node.y}" r="4" class="tree-node-circle">
            <title>Internal Node (Height: ${node.height.toFixed(4)})</title>
          </circle>
        `;

        renderBranches(c1);
        renderBranches(c2);
      } else if (node.isLeaf) {
        svgContent += `
          <circle cx="${node.x}" cy="${node.y}" r="5" fill="#10b981" stroke="#047857" stroke-width="2" />
          <text x="${node.x + 12}" y="${node.y + 4}" class="tree-leaf-text">${node.name}</text>
        `;
      }
    }

    renderBranches(root);

    const scaleBarDist = maxTreeHeight * 0.25;
    const scaleBarPx = (scaleBarDist / maxTreeHeight) * plotWidth;
    svgContent += `
      <g transform="translate(${padding.left}, ${height - 15})">
        <line x1="0" y1="0" x2="${scaleBarPx}" y2="0" stroke="#06b6d4" stroke-width="2" />
        <line x1="0" y1="-4" x2="0" y2="4" stroke="#06b6d4" stroke-width="2" />
        <line x1="${scaleBarPx}" y1="-4" x2="${scaleBarPx}" y2="4" stroke="#06b6d4" stroke-width="2" />
        <text x="${scaleBarPx / 2}" y="-6" fill="#38bdf8" font-size="11" text-anchor="middle" font-family="'JetBrains Mono', monospace">
          ${scaleBarDist.toFixed(4)} subs/site
        </text>
      </g>
    `;

    svg.innerHTML = svgContent;
  }

  /**
   * Render Codon & Protein Translation Tab
   */
  function renderTranslationTab() {
    const container = document.getElementById('translation-output-container');
    if (!container || !state.alignedSamples || state.alignedSamples.length === 0) return;

    const frame = state.readingFrame;
    const refSample = state.alignedSamples[state.refIndex];
    const refTrans = BioAlgorithms.translateDNA(refSample.sequence, frame);

    let html = `
      <div class="space-y-4">
        <div class="cyber-card p-4 rounded-xl">
          <div class="flex items-center justify-between mb-3 border-b border-cyan-500/20 pb-2">
            <div class="font-bold text-slate-100 flex items-center gap-2 font-display">
              <span class="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]"></span>
              Reference Translation: ${refSample.name}
            </div>
            <span class="text-xs font-mono text-cyan-300">Frame +${frame + 1} (${refTrans.aaSeq.length} Residues)</span>
          </div>
          <div class="font-mono text-xs leading-relaxed tracking-wider break-all bg-[#030612] p-3 rounded-lg border border-cyan-500/20 text-indigo-200 select-all shadow-inner">
            ${refTrans.aaSeq || 'None'}
          </div>
        </div>`;

    state.alignedSamples.forEach((sample, sIdx) => {
      if (sIdx === state.refIndex) return;

      const qTrans = BioAlgorithms.translateDNA(sample.sequence, frame);
      let aaDiffCount = 0;
      let styledAATrack = '';

      for (let p = 0; p < qTrans.aaSeq.length; p++) {
        const qAA = qTrans.aaSeq[p];
        const rAA = refTrans.aaSeq[p];
        const isDiff = (rAA !== undefined && qAA !== rAA);

        if (isDiff) {
          aaDiffCount++;
          styledAATrack += `<span class="bg-rose-500/30 text-rose-300 font-bold px-1 rounded mx-0.5 border border-rose-500/50 shadow-[0_0_6px_rgba(244,63,94,0.4)]" title="Residue ${p + 1}: ${rAA} → ${qAA}">${qAA}</span>`;
        } else {
          styledAATrack += `<span class="text-slate-300">${qAA}</span>`;
        }
      }

      html += `
        <div class="cyber-card p-4 rounded-xl">
          <div class="flex items-center justify-between mb-3 border-b border-cyan-500/20 pb-2">
            <div class="font-bold text-slate-100 flex items-center gap-2 font-display">
              <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
              ${sample.name}
            </div>
            <div class="flex items-center gap-3 text-xs font-mono">
              <span class="text-rose-400 font-bold">${aaDiffCount} Alterations</span>
              <span class="text-slate-400">${qTrans.aaSeq.length} AA</span>
            </div>
          </div>
          <div class="font-mono text-xs leading-relaxed tracking-wider break-all bg-[#030612] p-3 rounded-lg border border-cyan-500/20 select-all shadow-inner">
            ${styledAATrack || 'None'}
          </div>
        </div>`;
    });

    html += `</div>`;
    container.innerHTML = html;
  }

  /**
   * Render Sample Manager Tab
   */
  function renderSampleManager() {
    const list = document.getElementById('sample-manager-list');
    if (!list) return;

    let html = '';
    state.samples.forEach((sample, idx) => {
      const isRef = (idx === state.refIndex);
      const stats = BioAlgorithms.getSequenceStats(sample.sequence);

      html += `
        <div class="cyber-card p-3.5 sm:p-4 rounded-xl transition ${isRef ? 'border-cyan-500/60 bg-cyan-950/15' : ''}">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold font-display text-slate-100 text-sm">${sample.name}</span>
                ${isRef ? 
                  `<span class="px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-500 text-black shadow-sm font-mono">REFERENCE</span>` : 
                  `<button class="px-2 py-0.5 text-[10px] rounded bg-[#081328] hover:bg-cyan-950 text-cyan-300 border border-cyan-500/30 transition font-mono"
                           onclick="UIController.setReference(${idx})">Set as Ref</button>`
                }
              </div>
              <div class="text-xs text-slate-400 mt-1">${sample.description || 'Clinical specimen without additional annotation'}</div>
            </div>
            <div class="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-mono text-slate-400">
              <div>Span: <span class="text-slate-200 font-bold">${stats.length} bp</span></div>
              <div>GC: <span class="text-emerald-400 font-bold">${stats.gcContent}%</span></div>
              <div>Tm: <span class="text-cyan-400 font-bold">${stats.tm}°C</span></div>
              ${!isRef && state.samples.length > 2 ? 
                `<button class="text-rose-400 hover:text-rose-300 text-sm ml-2 p-1" onclick="UIController.removeSample(${idx})" title="Remove sample">✕</button>` : ''
              }
            </div>
          </div>
        </div>`;
    });

    list.innerHTML = html;
  }

  function setReference(index) {
    state.refIndex = index;
    runFullAnalysis();
    showToast(`Set "${state.samples[index].name}" as clinical reference baseline`, 'info');
  }

  function removeSample(index) {
    if (state.samples.length <= 2) {
      showToast('At least two samples are required for comparative analysis', 'warning');
      return;
    }
    state.samples.splice(index, 1);
    if (state.refIndex >= state.samples.length) state.refIndex = 0;
    runFullAnalysis();
    showToast('Sample removed from cohort', 'info');
  }

  /**
   * Add custom sequence modal action
   */
  function addCustomSample() {
    const nameInput = document.getElementById('new-sample-name');
    const seqInput = document.getElementById('new-sample-seq');
    const descInput = document.getElementById('new-sample-desc');

    const name = nameInput.value.trim() || `Patient_${state.samples.length + 1}`;
    const rawSeq = seqInput.value.trim();
    const desc = descInput?.value.trim() || 'Custom registered sequence';

    const val = BioAlgorithms.validateSequence(rawSeq);
    if (!val.isValid || val.length === 0) {
      showToast('Invalid sequence: only A, C, G, T, N permitted', 'error');
      return;
    }

    state.samples.push({
      id: `sample_custom_${Date.now()}`,
      name,
      description: desc,
      sequence: val.cleaned,
      active: true
    });

    nameInput.value = '';
    seqInput.value = '';
    if (descInput) descInput.value = '';

    closeModal('modal-add-sample');
    runFullAnalysis();
    showToast(`Added clinical sample "${name}"`, 'success');
  }

  /**
   * Synthetic Mutation Generator
   */
  function generateSyntheticMutant() {
    const rateInput = document.getElementById('synth-mutation-rate');
    const rate = parseFloat(rateInput.value) || 0.05;
    const refSeq = state.samples[state.refIndex].sequence;

    const bases = ['A', 'C', 'G', 'T'];
    let mutated = '';

    for (let i = 0; i < refSeq.length; i++) {
      if (Math.random() < rate) {
        const roll = Math.random();
        if (roll < 0.8) {
          const current = refSeq[i];
          const others = bases.filter(b => b !== current);
          mutated += others[Math.floor(Math.random() * others.length)];
        } else if (roll < 0.9) {
          mutated += refSeq[i] + bases[Math.floor(Math.random() * 4)];
        } else {
          continue; // Deletion
        }
      } else {
        mutated += refSeq[i];
      }
    }

    const newName = `Synthetic_Drift_${Math.round(rate * 100)}pct_${Date.now().toString().slice(-4)}`;
    state.samples.push({
      id: `sample_synth_${Date.now()}`,
      name: newName,
      description: `Synthetically induced mutations at ${(rate * 100).toFixed(1)}% rate from baseline`,
      sequence: mutated,
      active: true
    });

    closeModal('modal-mutate-synth');
    runFullAnalysis();
    showToast(`Simulated mutant "${newName}"`, 'success');
  }

  /**
   * Tab Navigation (Desktop + Mobile Sync)
   */
  function switchTab(tabId) {
    state.activeTab = tabId;

    // Desktop tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      const active = (btn.dataset.tab === tabId);
      btn.classList.toggle('active', active);
      btn.classList.toggle('border-cyan-400', active);
      btn.classList.toggle('text-cyan-300', active);
      btn.classList.toggle('border-transparent', !active);
      btn.classList.toggle('text-slate-400', !active);
    });

    // Mobile nav buttons
    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
      const active = (btn.dataset.tab === tabId);
      btn.classList.toggle('active', active);
    });

    // Panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('hidden', panel.id !== `tab-${tabId}`);
    });

    if (tabId === 'similarity') {
      renderPhylogeneticTree();
    }

    // Scroll to top of content on mobile switch
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
  }

  function showToast(message, type = 'info') {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;

    let bgClass = 'bg-[#08152e] text-cyan-200 border-cyan-500/50';
    if (type === 'success') bgClass = 'bg-[#05241b] text-emerald-300 border-emerald-500/50';
    else if (type === 'error') bgClass = 'bg-[#2a0815] text-rose-300 border-rose-500/50';
    else if (type === 'warning') bgClass = 'bg-[#291804] text-amber-300 border-amber-500/50';

    toast.className = `fixed bottom-20 md:bottom-6 right-4 sm:right-6 px-4 py-3 rounded-xl border shadow-2xl text-xs font-mono font-bold z-50 flex items-center gap-2 transition-all transform duration-300 ${bgClass}`;
    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
    }, 3200);
  }

  function exportCSV() {
    if (!state.mutations || state.mutations.length === 0) {
      showToast('No mutations to export', 'warning');
      return;
    }

    const headers = ['Sample', 'Position', 'Type', 'Subtype', 'Reference_Base', 'Alternate_Base', 'Codon_Change', 'Protein_Change', 'Functional_Impact'];
    const rows = state.mutations.map(m => [
      `"${m.sampleName}"`,
      m.position,
      `"${m.type}"`,
      `"${m.subType}"`,
      `"${m.refBase}"`,
      `"${m.altBase}"`,
      `"${m.codonChange || ''}"`,
      `"${m.aaChange || ''}"`,
      `"${m.impact || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(csvContent, 'helixscan_clinical_mutation_report.csv', 'text/csv');
    showToast('Downloaded clinical mutation report CSV', 'success');
  }

  function exportAlignedFASTA() {
    if (!state.alignedSamples || state.alignedSamples.length === 0) return;
    const fastaStr = BioAlgorithms.exportFASTA(state.alignedSamples, true);
    downloadFile(fastaStr, 'aligned_cohort.fasta', 'text/plain');
    showToast('Downloaded aligned FASTA file', 'success');
  }

  function exportJSON() {
    const payload = {
      timestamp: new Date().toISOString(),
      platform: 'HelixScan Clinical Genomics Suite',
      referenceSample: state.samples[state.refIndex]?.name,
      sampleCount: state.samples.length,
      alignmentLength: state.alignedSamples[0]?.aligned.length || 0,
      mutations: state.mutations,
      similarityMatrix: {
        names: state.matrices.names,
        identities: state.matrices.identityMatrix.map(row => Array.from(row)),
        distances: state.matrices.distanceMatrix.map(row => Array.from(row))
      }
    };
    downloadFile(JSON.stringify(payload, null, 2), 'helixscan_telemetry.json', 'application/json');
    showToast('Downloaded complete JSON telemetry payload', 'success');
  }

  function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return {
    init,
    loadDataset,
    switchTab,
    setCellSize,
    inspectBase,
    closeInspector,
    handleBaseHover,
    handleBaseLeave,
    jumpToMutation,
    setReference,
    removeSample,
    addCustomSample,
    generateSyntheticMutant,
    openModal,
    closeModal
  };
})();

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  UIController.init();
});
