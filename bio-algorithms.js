/**
 * BioAlgorithms - Comprehensive DNA Analysis, Sequence Alignment & Mutation Engine
 * Handles DNA validation, translation, Needleman-Wunsch alignment, MSA,
 * SNP/Indel classification, Jukes-Cantor distance, and UPGMA phylogenetic tree generation.
 */

const BioAlgorithms = (() => {
  // Standard Genetic Code (DNA -> Amino Acid)
  const CODON_TABLE = {
    'TTT': { aa: 'F', name: 'Phenylalanine', type: 'hydrophobic' },
    'TTC': { aa: 'F', name: 'Phenylalanine', type: 'hydrophobic' },
    'TTA': { aa: 'L', name: 'Leucine', type: 'hydrophobic' },
    'TTG': { aa: 'L', name: 'Leucine', type: 'hydrophobic' },
    'CTT': { aa: 'L', name: 'Leucine', type: 'hydrophobic' },
    'CTC': { aa: 'L', name: 'Leucine', type: 'hydrophobic' },
    'CTA': { aa: 'L', name: 'Leucine', type: 'hydrophobic' },
    'CTG': { aa: 'L', name: 'Leucine', type: 'hydrophobic' },
    'ATT': { aa: 'I', name: 'Isoleucine', type: 'hydrophobic' },
    'ATC': { aa: 'I', name: 'Isoleucine', type: 'hydrophobic' },
    'ATA': { aa: 'I', name: 'Isoleucine', type: 'hydrophobic' },
    'ATG': { aa: 'M', name: 'Methionine (Start)', type: 'start' },
    'GTT': { aa: 'V', name: 'Valine', type: 'hydrophobic' },
    'GTC': { aa: 'V', name: 'Valine', type: 'hydrophobic' },
    'GTA': { aa: 'V', name: 'Valine', type: 'hydrophobic' },
    'GTG': { aa: 'V', name: 'Valine', type: 'hydrophobic' },
    'TCT': { aa: 'S', name: 'Serine', type: 'polar' },
    'TCC': { aa: 'S', name: 'Serine', type: 'polar' },
    'TCA': { aa: 'S', name: 'Serine', type: 'polar' },
    'TCG': { aa: 'S', name: 'Serine', type: 'polar' },
    'CCT': { aa: 'P', name: 'Proline', type: 'hydrophobic' },
    'CCC': { aa: 'P', name: 'Proline', type: 'hydrophobic' },
    'CCA': { aa: 'P', name: 'Proline', type: 'hydrophobic' },
    'CCG': { aa: 'P', name: 'Proline', type: 'hydrophobic' },
    'ACT': { aa: 'T', name: 'Threonine', type: 'polar' },
    'ACC': { aa: 'T', name: 'Threonine', type: 'polar' },
    'ACA': { aa: 'T', name: 'Threonine', type: 'polar' },
    'ACG': { aa: 'T', name: 'Threonine', type: 'polar' },
    'GCT': { aa: 'A', name: 'Alanine', type: 'hydrophobic' },
    'GCC': { aa: 'A', name: 'Alanine', type: 'hydrophobic' },
    'GCA': { aa: 'A', name: 'Alanine', type: 'hydrophobic' },
    'GCG': { aa: 'A', name: 'Alanine', type: 'hydrophobic' },
    'TAT': { aa: 'Y', name: 'Tyrosine', type: 'polar' },
    'TAC': { aa: 'Y', name: 'Tyrosine', type: 'polar' },
    'TAA': { aa: '*', name: 'Stop (Ochre)', type: 'stop' },
    'TAG': { aa: '*', name: 'Stop (Amber)', type: 'stop' },
    'CAT': { aa: 'H', name: 'Histidine', type: 'basic' },
    'CAC': { aa: 'H', name: 'Histidine', type: 'basic' },
    'CAA': { aa: 'Q', name: 'Glutamine', type: 'polar' },
    'CAG': { aa: 'Q', name: 'Glutamine', type: 'polar' },
    'AAT': { aa: 'N', name: 'Asparagine', type: 'polar' },
    'AAC': { aa: 'N', name: 'Asparagine', type: 'polar' },
    'AAA': { aa: 'K', name: 'Lysine', type: 'basic' },
    'AAG': { aa: 'K', name: 'Lysine', type: 'basic' },
    'GAT': { aa: 'D', name: 'Aspartic Acid', type: 'acidic' },
    'GAC': { aa: 'D', name: 'Aspartic Acid', type: 'acidic' },
    'GAA': { aa: 'E', name: 'Glutamic Acid', type: 'acidic' },
    'GAG': { aa: 'E', name: 'Glutamic Acid', type: 'acidic' },
    'TGT': { aa: 'C', name: 'Cysteine', type: 'polar' },
    'TGC': { aa: 'C', name: 'Cysteine', type: 'polar' },
    'TGA': { aa: '*', name: 'Stop (Opal)', type: 'stop' },
    'TGG': { aa: 'W', name: 'Tryptophan', type: 'hydrophobic' },
    'CGT': { aa: 'R', name: 'Arginine', type: 'basic' },
    'CGC': { aa: 'R', name: 'Arginine', type: 'basic' },
    'CGA': { aa: 'R', name: 'Arginine', type: 'basic' },
    'CGG': { aa: 'R', name: 'Arginine', type: 'basic' },
    'AGT': { aa: 'S', name: 'Serine', type: 'polar' },
    'AGC': { aa: 'S', name: 'Serine', type: 'polar' },
    'AGA': { aa: 'R', name: 'Arginine', type: 'basic' },
    'AGG': { aa: 'R', name: 'Arginine', type: 'basic' },
    'GGT': { aa: 'G', name: 'Glycine', type: 'hydrophobic' },
    'GGC': { aa: 'G', name: 'Glycine', type: 'hydrophobic' },
    'GGA': { aa: 'G', name: 'Glycine', type: 'hydrophobic' },
    'GGG': { aa: 'G', name: 'Glycine', type: 'hydrophobic' },
  };

  const PURINES = new Set(['A', 'G']);
  const PYRIMIDINES = new Set(['C', 'T']);

  /**
   * Cleans raw DNA string: uppercase, replaces U with T, removes numbers and whitespace.
   */
  function cleanSequence(seq) {
    if (!seq) return '';
    return seq.toUpperCase().replace(/U/g, 'T').replace(/[^A-Z-]/g, '');
  }

  /**
   * Validate sequence characters
   */
  function validateSequence(seq) {
    const cleaned = cleanSequence(seq);
    const validBases = /^[ACGTN-]+$/i;
    const isValid = validBases.test(cleaned);
    const invalidChars = cleaned.replace(/[ACGTN-]/gi, '');
    return {
      isValid,
      cleaned,
      length: cleaned.replace(/-/g, '').length,
      invalidChars: [...new Set(invalidChars.split(''))]
    };
  }

  /**
   * Calculate nucleotide frequencies & biochemical stats
   */
  function getSequenceStats(seq) {
    const s = cleanSequence(seq).replace(/-/g, '');
    const counts = { A: 0, C: 0, G: 0, T: 0, N: 0, Other: 0 };
    for (let i = 0; i < s.length; i++) {
      const b = s[i];
      if (counts[b] !== undefined) counts[b]++;
      else counts.Other++;
    }
    const len = s.length || 1;
    const gcCount = counts.G + counts.C;
    const gcContent = ((gcCount / len) * 100);
    const atCount = counts.A + counts.T;
    const atGcRatio = gcCount > 0 ? (atCount / gcCount) : 0;

    // Wallace Rule approximation for short sequences (<14bp: Tm = (wA+xT)*2 + (yG+zC)*4)
    // Nearest-neighbor approximation for longer sequences
    let tm = 0;
    if (len > 0) {
      if (len < 14) {
        tm = (counts.A + counts.T) * 2 + (counts.G + counts.C) * 4;
      } else {
        tm = 64.9 + 41 * (gcCount - 16.4) / len;
      }
    }

    // Molecular weight approximation: single-stranded DNA: (An x 313.21) + (Tn x 304.2) + (Cn x 289.18) + (Gn x 329.21) - 61.96
    const mw = (counts.A * 313.21) + (counts.T * 304.20) + (counts.C * 289.18) + (counts.G * 329.21) - 61.96;

    return {
      length: s.length,
      counts,
      gcContent: Number(gcContent.toFixed(2)),
      atGcRatio: Number(atGcRatio.toFixed(2)),
      tm: Number(tm.toFixed(1)),
      mw: Number(Math.max(0, mw).toFixed(1))
    };
  }

  /**
   * Translate DNA sequence into Amino Acid sequence for a given frame (0, 1, or 2)
   */
  function translateDNA(seq, frame = 0) {
    const s = cleanSequence(seq).replace(/-/g, '');
    let aaSeq = '';
    const codons = [];
    for (let i = frame; i + 2 < s.length; i += 3) {
      const codon = s.substring(i, i + 3);
      const info = CODON_TABLE[codon] || { aa: '?', name: 'Unknown', type: 'unknown' };
      aaSeq += info.aa;
      codons.push({
        position: i + 1,
        codon,
        aa: info.aa,
        name: info.name,
        type: info.type
      });
    }
    return { aaSeq, codons };
  }

  /**
   * Global Pairwise Alignment: Needleman-Wunsch algorithm
   */
  function needlemanWunsch(seq1, seq2, matchScore = 2, mismatchScore = -1, gapPenalty = -2) {
    const s1 = cleanSequence(seq1).replace(/-/g, '');
    const s2 = cleanSequence(seq2).replace(/-/g, '');
    const m = s1.length;
    const n = s2.length;

    // Fast-path for exact match
    if (s1 === s2) {
      return { alignedSeq1: s1, alignedSeq2: s2, score: s1.length * matchScore };
    }

    // Initialize DP matrix (1D flattened for memory & speed)
    const cols = n + 1;
    const score = new Int32Array((m + 1) * cols);

    for (let i = 0; i <= m; i++) score[i * cols + 0] = i * gapPenalty;
    for (let j = 0; j <= n; j++) score[0 * cols + j] = j * gapPenalty;

    for (let i = 1; i <= m; i++) {
      const char1 = s1[i - 1];
      const iOffset = i * cols;
      const prevIOffset = (i - 1) * cols;

      for (let j = 1; j <= n; j++) {
        const char2 = s2[j - 1];
        const match = (char1 === char2) ? matchScore : mismatchScore;
        const diag = score[prevIOffset + (j - 1)] + match;
        const up = score[prevIOffset + j] + gapPenalty;
        const left = score[iOffset + (j - 1)] + gapPenalty;

        score[iOffset + j] = Math.max(diag, Math.max(up, left));
      }
    }

    // Traceback
    let aligned1 = [];
    let aligned2 = [];
    let i = m;
    let j = n;

    while (i > 0 || j > 0) {
      const current = score[i * cols + j];
      const char1 = i > 0 ? s1[i - 1] : null;
      const char2 = j > 0 ? s2[j - 1] : null;
      const match = (char1 === char2) ? matchScore : mismatchScore;

      if (i > 0 && j > 0 && current === score[(i - 1) * cols + (j - 1)] + match) {
        aligned1.push(char1);
        aligned2.push(char2);
        i--;
        j--;
      } else if (i > 0 && current === score[(i - 1) * cols + j] + gapPenalty) {
        aligned1.push(char1);
        aligned2.push('-');
        i--;
      } else {
        aligned1.push('-');
        aligned2.push(char2);
        j--;
      }
    }

    return {
      alignedSeq1: aligned1.reverse().join(''),
      alignedSeq2: aligned2.reverse().join(''),
      score: score[m * cols + n]
    };
  }

  /**
   * Reference-Anchored Multiple Sequence Alignment (Star Alignment)
   * Aligns all query sequences against the designated reference sequence,
   * then merges all insertions so that all sequences have equal length and consistent coordinates.
   */
  function multiSequenceAlign(samples, refIndex = 0) {
    if (!samples || samples.length === 0) return [];
    if (samples.length === 1) return [{ ...samples[0], aligned: cleanSequence(samples[0].sequence) }];

    const refSample = samples[refIndex] || samples[0];
    const refRaw = cleanSequence(refSample.sequence).replace(/-/g, '');

    // Align each sample to reference
    const alignments = [];
    for (let k = 0; k < samples.length; k++) {
      if (k === refIndex) {
        alignments.push({ sample: samples[k], refAligned: refRaw, queryAligned: refRaw });
      } else {
        const queryRaw = cleanSequence(samples[k].sequence).replace(/-/g, '');
        const res = needlemanWunsch(refRaw, queryRaw);
        alignments.push({
          sample: samples[k],
          refAligned: res.alignedSeq1,
          queryAligned: res.alignedSeq2
        });
      }
    }

    // Determine max gap insertions needed at each position of the reference
    // Map ref original characters to insertion counts
    const refLen = refRaw.length;
    // insertion counts before ref pos 0, pos 1, ..., after last pos
    const maxGapsBefore = new Int32Array(refLen + 1);

    for (let k = 0; k < alignments.length; k++) {
      if (k === refIndex) continue;
      const refA = alignments[k].refAligned;
      let refIdx = 0;
      let currentGapRun = 0;
      for (let p = 0; p < refA.length; p++) {
        if (refA[p] === '-') {
          currentGapRun++;
        } else {
          if (currentGapRun > maxGapsBefore[refIdx]) {
            maxGapsBefore[refIdx] = currentGapRun;
          }
          currentGapRun = 0;
          refIdx++;
        }
      }
      if (currentGapRun > maxGapsBefore[refIdx]) {
        maxGapsBefore[refIdx] = currentGapRun;
      }
    }

    // Now reconstruct unified MSA for all sequences
    const result = [];
    for (let k = 0; k < samples.length; k++) {
      let unified = '';
      const pair = alignments[k];
      const refA = pair.refAligned;
      const qA = pair.queryAligned;

      let refIdx = 0;
      let p = 0;

      while (refIdx <= refLen) {
        const needed = maxGapsBefore[refIdx];
        let actualSampleRun = '';

        if (k === refIndex) {
          // Reference has gaps where other samples inserted bases
          actualSampleRun = '-'.repeat(needed);
        } else {
          // Collect whatever gap or insertion query had before this ref base
          while (p < refA.length && refA[p] === '-') {
            actualSampleRun += qA[p];
            p++;
          }
          // Pad with '-' if other samples had longer insertions here
          while (actualSampleRun.length < needed) {
            actualSampleRun += '-';
          }
        }
        unified += actualSampleRun;

        // Append the actual ref base (or query base at that position)
        if (refIdx < refLen) {
          if (k === refIndex) {
            unified += refRaw[refIdx];
          } else {
            if (p < refA.length && refA[p] !== '-') {
              unified += qA[p];
              p++;
            } else {
              unified += '-';
            }
          }
          refIdx++;
        } else {
          break;
        }
      }

      result.push({
        ...samples[k],
        aligned: unified
      });
    }

    return result;
  }

  /**
   * Calculate Conservation and Consensus across aligned samples
   */
  function calculateConsensus(alignedSamples) {
    if (!alignedSamples || alignedSamples.length === 0) return { consensus: '', conservation: [] };

    const len = alignedSamples[0].aligned.length;
    const nSamples = alignedSamples.length;
    let consensus = '';
    const conservation = [];

    for (let col = 0; col < len; col++) {
      const counts = { A: 0, C: 0, G: 0, T: 0, '-': 0 };
      for (let s = 0; s < nSamples; s++) {
        const char = alignedSamples[s].aligned[col] || '-';
        if (counts[char] !== undefined) counts[char]++;
      }

      // Find major base
      let maxBase = '-';
      let maxCount = -1;
      for (const [base, cnt] of Object.entries(counts)) {
        if (cnt > maxCount) {
          maxCount = cnt;
          maxBase = base;
        }
      }

      const conservationScore = (maxCount / nSamples);
      consensus += maxBase;
      conservation.push({
        position: col + 1,
        majorBase: maxBase,
        score: conservationScore,
        counts
      });
    }

    return { consensus, conservation };
  }

  /**
   * Detect and classify mutations of query sequence against reference sequence
   */
  function detectMutations(refAligned, queryAligned, sampleName = 'Query', sampleId = '') {
    const mutations = [];
    const len = Math.min(refAligned.length, queryAligned.length);

    // Track contiguous indels
    let inDeletion = false;
    let delStart = -1;
    let delSeq = '';

    let inInsertion = false;
    let insStart = -1;
    let insSeq = '';

    // Translation frames for both sequences (without gaps)
    const refClean = refAligned.replace(/-/g, '');
    const queryClean = queryAligned.replace(/-/g, '');

    // Map aligned positions to unaligned coordinate (for codon lookup)
    let refCoord = 0;
    let queryCoord = 0;

    for (let i = 0; i < len; i++) {
      const r = refAligned[i];
      const q = queryAligned[i];
      const pos = i + 1;

      if (r !== '-') refCoord++;
      if (q !== '-') queryCoord++;

      // Check for Deletion (ref has base, query has gap)
      if (r !== '-' && q === '-') {
        if (!inDeletion) {
          inDeletion = true;
          delStart = pos;
          delSeq = r;
        } else {
          delSeq += r;
        }
      } else {
        if (inDeletion) {
          // Close deletion
          const isFrameshift = (delSeq.length % 3 !== 0);
          mutations.push({
            sampleName,
            sampleId,
            position: delStart,
            endPosition: delStart + delSeq.length - 1,
            length: delSeq.length,
            type: 'Deletion',
            subType: isFrameshift ? 'Frameshift Deletion' : 'In-frame Deletion',
            refBase: delSeq,
            altBase: '-',
            impact: isFrameshift ? 'High (Frameshift)' : 'Moderate (In-frame Indel)',
            details: `Deleted ${delSeq.length}bp (${delSeq})`
          });
          inDeletion = false;
          delSeq = '';
        }
      }

      // Check for Insertion (ref has gap, query has base)
      if (r === '-' && q !== '-') {
        if (!inInsertion) {
          inInsertion = true;
          insStart = pos;
          insSeq = q;
        } else {
          insSeq += q;
        }
      } else {
        if (inInsertion) {
          // Close insertion
          const isFrameshift = (insSeq.length % 3 !== 0);
          mutations.push({
            sampleName,
            sampleId,
            position: insStart,
            endPosition: insStart + insSeq.length - 1,
            length: insSeq.length,
            type: 'Insertion',
            subType: isFrameshift ? 'Frameshift Insertion' : 'In-frame Insertion',
            refBase: '-',
            altBase: insSeq,
            impact: isFrameshift ? 'High (Frameshift)' : 'Moderate (In-frame Indel)',
            details: `Inserted ${insSeq.length}bp (${insSeq})`
          });
          inInsertion = false;
          insSeq = '';
        }
      }

      // Check for Single Nucleotide Substitution
      if (r !== '-' && q !== '-' && r !== q) {
        let subType = 'Substitution';
        let transition = false;

        if (
          (PURINES.has(r) && PURINES.has(q)) ||
          (PYRIMIDINES.has(r) && PYRIMIDINES.has(q))
        ) {
          subType = 'Transition';
          transition = true;
        } else {
          subType = 'Transversion';
          transition = false;
        }

        // Functional codon analysis
        let functionalImpact = 'Unknown';
        let codonChange = 'N/A';
        let aaChange = 'N/A';

        // Calculate codon in clean reference coordinates
        const codonIndex = Math.floor((refCoord - 1) / 3);
        const codonPos = (refCoord - 1) % 3;
        const codonStart = codonIndex * 3;

        if (codonStart + 3 <= refClean.length) {
          const refCodon = refClean.substring(codonStart, codonStart + 3);
          const altCodonArr = refCodon.split('');
          altCodonArr[codonPos] = q;
          const altCodon = altCodonArr.join('');

          const refAAInfo = CODON_TABLE[refCodon];
          const altAAInfo = CODON_TABLE[altCodon];

          if (refAAInfo && altAAInfo) {
            codonChange = `${refCodon} → ${altCodon}`;
            aaChange = `${refAAInfo.aa}${codonIndex + 1}${altAAInfo.aa}`;

            if (refAAInfo.aa === altAAInfo.aa) {
              functionalImpact = 'Synonymous (Silent)';
            } else if (altAAInfo.aa === '*') {
              functionalImpact = 'Nonsense (Stop Gain)';
            } else if (refAAInfo.aa === '*') {
              functionalImpact = 'Stop Lost (Readthrough)';
            } else {
              // Missense: check if radical or conservative substitution
              const isConservative = (refAAInfo.type === altAAInfo.type);
              functionalImpact = isConservative ? 'Missense (Conservative)' : 'Missense (Radical)';
            }
          }
        }

        mutations.push({
          sampleName,
          sampleId,
          position: pos,
          endPosition: pos,
          length: 1,
          type: 'SNP',
          subType,
          refBase: r,
          altBase: q,
          isTransition: transition,
          isTransversion: !transition,
          codonChange,
          aaChange,
          impact: functionalImpact,
          details: `${r} → ${q} (${subType})`
        });
      }
    }

    // Flush any pending indel at sequence end
    if (inDeletion) {
      const isFrameshift = (delSeq.length % 3 !== 0);
      mutations.push({
        sampleName,
        sampleId,
        position: delStart,
        endPosition: delStart + delSeq.length - 1,
        length: delSeq.length,
        type: 'Deletion',
        subType: isFrameshift ? 'Frameshift Deletion' : 'In-frame Deletion',
        refBase: delSeq,
        altBase: '-',
        impact: isFrameshift ? 'High (Frameshift)' : 'Moderate (In-frame Indel)',
        details: `Deleted ${delSeq.length}bp (${delSeq})`
      });
    }

    if (inInsertion) {
      const isFrameshift = (insSeq.length % 3 !== 0);
      mutations.push({
        sampleName,
        sampleId,
        position: insStart,
        endPosition: insStart + insSeq.length - 1,
        length: insSeq.length,
        type: 'Insertion',
        subType: isFrameshift ? 'Frameshift Insertion' : 'In-frame Insertion',
        refBase: '-',
        altBase: insSeq,
        impact: isFrameshift ? 'High (Frameshift)' : 'Moderate (In-frame Indel)',
        details: `Inserted ${insSeq.length}bp (${insSeq})`
      });
    }

    return mutations;
  }

  /**
   * Pairwise comparison statistics between two aligned sequences
   */
  function calculatePairwiseStats(seq1, seq2) {
    const len = Math.min(seq1.length, seq2.length);
    let matches = 0;
    let mismatches = 0;
    let gaps = 0;
    let transitions = 0;
    let transversions = 0;
    let validCompared = 0;

    for (let i = 0; i < len; i++) {
      const a = seq1[i];
      const b = seq2[i];

      if (a === '-' || b === '-') {
        gaps++;
      } else {
        validCompared++;
        if (a === b) {
          matches++;
        } else {
          mismatches++;
          if (
            (PURINES.has(a) && PURINES.has(b)) ||
            (PYRIMIDINES.has(a) && PYRIMIDINES.has(b))
          ) {
            transitions++;
          } else {
            transversions++;
          }
        }
      }
    }

    const similarity = validCompared > 0 ? (matches / validCompared) * 100 : 0;
    const overallIdentity = len > 0 ? (matches / len) * 100 : 0;
    const pDistance = validCompared > 0 ? (mismatches / validCompared) : 0;

    // Jukes-Cantor distance: d = -0.75 * ln(1 - 4/3 * p)
    let jcDistance = 0;
    if (pDistance < 0.75) {
      jcDistance = -0.75 * Math.log(1 - (4 / 3) * pDistance);
    } else {
      jcDistance = 3.0; // Saturated substitution limit
    }

    const tsTvRatio = transversions > 0 ? (transitions / transversions) : transitions;

    return {
      alignedLength: len,
      matches,
      mismatches,
      gaps,
      validCompared,
      similarity: Number(similarity.toFixed(2)),
      overallIdentity: Number(overallIdentity.toFixed(2)),
      pDistance: Number(pDistance.toFixed(4)),
      jcDistance: Number(Math.max(0, jcDistance).toFixed(4)),
      transitions,
      transversions,
      tsTvRatio: Number(tsTvRatio.toFixed(2))
    };
  }

  /**
   * Compute complete distance & similarity matrices across all aligned samples
   */
  function computeMatrices(alignedSamples) {
    const n = alignedSamples.length;
    const identityMatrix = Array.from({ length: n }, () => new Float32Array(n));
    const distanceMatrix = Array.from({ length: n }, () => new Float32Array(n));
    const names = alignedSamples.map(s => s.name);

    for (let i = 0; i < n; i++) {
      identityMatrix[i][i] = 100.0;
      distanceMatrix[i][i] = 0.0;
      for (let j = i + 1; j < n; j++) {
        const stats = calculatePairwiseStats(alignedSamples[i].aligned, alignedSamples[j].aligned);
        identityMatrix[i][j] = stats.similarity;
        identityMatrix[j][i] = stats.similarity;
        distanceMatrix[i][j] = stats.jcDistance;
        distanceMatrix[j][i] = stats.jcDistance;
      }
    }

    return { names, identityMatrix, distanceMatrix };
  }

  /**
   * UPGMA (Unweighted Pair Group Method with Arithmetic Mean)
   * Builds phylogenetic tree from distance matrix
   */
  function buildUPGMATree(names, distMatrix) {
    const n = names.length;
    if (n === 0) return null;
    if (n === 1) return { name: names[0], isLeaf: true, height: 0, children: [] };

    // Active clusters
    let clusters = names.map((name, idx) => ({
      id: idx,
      name,
      isLeaf: true,
      size: 1,
      height: 0,
      children: []
    }));

    // Working distance table
    let d = distMatrix.map(row => Array.from(row));

    while (clusters.length > 1) {
      // Find pair with minimum distance
      let minD = Infinity;
      let minI = -1;
      let minJ = -1;

      for (let i = 0; i < clusters.length; i++) {
        for (let j = i + 1; j < clusters.length; j++) {
          if (d[i][j] < minD) {
            minD = d[i][j];
            minI = i;
            minJ = j;
          }
        }
      }

      if (minI === -1) break;

      const cI = clusters[minI];
      const cJ = clusters[minJ];
      const newHeight = minD / 2;

      // Create new merged node
      const mergedNode = {
        name: `Node_${clusters.length}`,
        isLeaf: false,
        size: cI.size + cJ.size,
        height: newHeight,
        branchI: Math.max(0, newHeight - cI.height),
        branchJ: Math.max(0, newHeight - cJ.height),
        children: [cI, cJ]
      };

      // Calculate new distances to remaining clusters
      const newRow = [];
      for (let k = 0; k < clusters.length; k++) {
        if (k !== minI && k !== minJ) {
          const dist = (cI.size * d[minI][k] + cJ.size * d[minJ][k]) / (cI.size + cJ.size);
          newRow.push(dist);
        }
      }

      // Remove larger index first to avoid shifting issues
      const removeFirst = Math.max(minI, minJ);
      const removeSecond = Math.min(minI, minJ);

      clusters.splice(removeFirst, 1);
      clusters.splice(removeSecond, 1);

      // Rebuild d matrix
      const newD = [];
      let nextRowIdx = 0;
      for (let i = 0; i < d.length; i++) {
        if (i === removeFirst || i === removeSecond) continue;
        const row = [];
        for (let j = 0; j < d[i].length; j++) {
          if (j === removeFirst || j === removeSecond) continue;
          row.push(d[i][j]);
        }
        row.push(newRow[nextRowIdx]);
        newD.push(row);
        nextRowIdx++;
      }

      // Add row for merged node
      newRow.push(0);
      newD.push(newRow);

      clusters.push(mergedNode);
      d = newD;
    }

    return clusters[0];
  }

  /**
   * FASTA parser: parses FASTA string into array of { name, sequence }
   */
  function parseFASTA(fastaStr) {
    if (!fastaStr || typeof fastaStr !== 'string') return [];
    const lines = fastaStr.split(/\r?\n/);
    const samples = [];
    let currentName = '';
    let currentSeq = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (line.startsWith('>')) {
        if (currentName || currentSeq) {
          samples.push({
            name: currentName || `Sample_${samples.length + 1}`,
            sequence: cleanSequence(currentSeq)
          });
        }
        currentName = line.substring(1).trim();
        currentSeq = '';
      } else {
        currentSeq += line;
      }
    }

    if (currentName || currentSeq) {
      samples.push({
        name: currentName || `Sample_${samples.length + 1}`,
        sequence: cleanSequence(currentSeq)
      });
    }

    return samples;
  }

  /**
   * Export sequences to FASTA format
   */
  function exportFASTA(samples, useAligned = false) {
    return samples.map(s => {
      const seq = useAligned ? (s.aligned || s.sequence) : s.sequence;
      // Wrap lines at 70 chars
      const wrapped = seq.match(/.{1,70}/g)?.join('\n') || seq;
      return `>${s.name}\n${wrapped}`;
    }).join('\n\n');
  }

  return {
    CODON_TABLE,
    cleanSequence,
    validateSequence,
    getSequenceStats,
    translateDNA,
    needlemanWunsch,
    multiSequenceAlign,
    calculateConsensus,
    detectMutations,
    calculatePairwiseStats,
    computeMatrices,
    buildUPGMATree,
    parseFASTA,
    exportFASTA
  };
})();

// Export for module or browser window
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BioAlgorithms;
} else if (typeof window !== 'undefined') {
  window.BioAlgorithms = BioAlgorithms;
}
