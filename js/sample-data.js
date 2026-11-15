/**
 * Preset Real-World Genomic Datasets
 * Scientifically accurate sequences with clinical & evolutionary significance
 */

const SAMPLE_DATASETS = {
  hbb_sickle_cell: {
    id: 'hbb_sickle_cell',
    title: 'Sickle Cell Anemia & Hemoglobinopathies (HBB)',
    description: 'Beta-globin (HBB) gene variants showing canonical point mutations (Glu6Val transversion causing Sickle Cell Anemia, Glu6Lys HbC, and HbE).',
    category: 'Clinical Genetics',
    referenceIndex: 0,
    samples: [
      {
        name: 'HBB_WildType_HbA (Normal)',
        description: 'Normal adult beta-globin exon 1 coding sequence fragment',
        sequence: 'ATGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAACGTGGATGAAGTTGGTGGTGAGGCCCTGGGCAGGCTGCTGGTGGTCTACCCTTGGACCCAGAGGTTCTTTGAGTCCTTTGGGGATCTGTCCACTCCTGATGCTGTTATGGGCAACCCTAAGGTGAAGGCTCATGGCAAGAAAGTGCTCGGTGCCTTTAGTGATGGC'
      },
      {
        name: 'HBB_HbS_Sickle_Cell (GAG->GTG, Glu6Val)',
        description: 'A->T transversion at codon 6 causing valine substitution and polymerization under hypoxia',
        sequence: 'ATGGTGCACCTGACTCCTGTGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAACGTGGATGAAGTTGGTGGTGAGGCCCTGGGCAGGCTGCTGGTGGTCTACCCTTGGACCCAGAGGTTCTTTGAGTCCTTTGGGGATCTGTCCACTCCTGATGCTGTTATGGGCAACCCTAAGGTGAAGGCTCATGGCAAGAAAGTGCTCGGTGCCTTTAGTGATGGC'
      },
      {
        name: 'HBB_HbC_Hemolytic (GAG->AAG, Glu6Lys)',
        description: 'G->A transition at codon 6 causing lysine substitution and crystalline precipitation',
        sequence: 'ATGGTGCACCTGACTCCTAAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAACGTGGATGAAGTTGGTGGTGAGGCCCTGGGCAGGCTGCTGGTGGTCTACCCTTGGACCCAGAGGTTCTTTGAGTCCTTTGGGGATCTGTCCACTCCTGATGCTGTTATGGGCAACCCTAAGGTGAAGGCTCATGGCAAGAAAGTGCTCGGTGCCTTTAGTGATGGC'
      },
      {
        name: 'HBB_HbE_Variant (GAG->AAG, Glu26Lys)',
        description: 'G->A transition at codon 26 producing mild beta-thalassemia phenotype',
        sequence: 'ATGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAACGTGGATGAAGTTGGTGGTGAGAAGCTGGGCAGGCTGCTGGTGGTCTACCCTTGGACCCAGAGGTTCTTTGAGTCCTTTGGGGATCTGTCCACTCCTGATGCTGTTATGGGCAACCCTAAGGTGAAGGCTCATGGCAAGAAAGTGCTCGGTGCCTTTAGTGATGGC'
      }
    ]
  },

  sars_cov2_spike: {
    id: 'sars_cov2_spike',
    title: 'SARS-CoV-2 Spike Receptor Binding Domain (RBD)',
    description: 'Spike glycoprotein mutations across pivotal variants of concern (Alpha, Delta, Omicron BA.1) exhibiting immune evasion and receptor affinity changes.',
    category: 'Virology & Evolution',
    referenceIndex: 0,
    samples: [
      {
        name: 'Wuhan-Hu-1_Reference',
        description: 'Original ancestral wild-type SARS-CoV-2 isolate',
        sequence: 'AAGATTGGTGACTACACTGTGCTGTACCAGTCAACTTTCTTTTCCTTTTGTGTCAACACAACTCAGTTTGTAGTAGAAGACCCTGTTCTCGTTGAAACTCCATGTAATGGCGTAACCGGCTTTTACCATTTTACAAGTGGAACAAATTTTACCACACGTCCACGTGGTTTTCCTACTGTC'
      },
      {
        name: 'Alpha_Variant_B117 (N501Y)',
        description: 'Variant exhibiting N501Y mutation in RBD',
        sequence: 'AAGATTGGTGACTACACTGTGCTGTACCAGTCAACTTTCTTTTCCTTTTGTGTCAACACAACTCAGTTTGTAGTAGAAGACCCTGTTCTCGTTGAAACTCCATGTAATGGCGTAACCGGCTTTTACCACTTTACAAGTGGAACATATTTTACCACACGTCCACGTGGTTTTCCTACTGTC'
      },
      {
        name: 'Delta_Variant_B16172 (L452R_T478K)',
        description: 'Delta lineage harboring L452R and T478K substitutions',
        sequence: 'AAGATTGGTGACTACACTCGGCTGTACCAGTCAACTTTCTTTTCCTTTTGTGTCAACACAACTCAGTTTGTAGTAGAAAACCCTGTTCTCGTTGAAACTCCATGTAATGGCGTAACCGGCTTTTACCATTTTACAAGTGGAACAAATTTTACCACACGTCCACGTGGTTTTCCTACTGTC'
      },
      {
        name: 'Omicron_Variant_BA1 (Multi-mutant)',
        description: 'Hyper-mutated RBD with extensive antigenic drift',
        sequence: 'AAGATTGGTGACTACACTAATCTGTACCAGTCAACTTTCTTTTCCTTTTGTGTCAACAGCACTCAGTTTGTAGTAGAAGACCCTGTTCTCGTTGAAACTCCATGTAATGGCGTAACCGGCAGTTACAACTTTACAAGTGGAAGAAATTTTACCAAACGTCCACGTGGTTTTCCTCATGTC'
      }
    ]
  },

  cftr_cystic_fibrosis: {
    id: 'cftr_cystic_fibrosis',
    title: 'Cystic Fibrosis Transmembrane Regulator (CFTR)',
    description: 'Human CFTR exon 10 sequence illustrating in-frame deletion (ΔF508 loss of Phenylalanine) and premature stop codon nonsense mutations (G542X, R553X).',
    category: 'Clinical Genetics',
    referenceIndex: 0,
    samples: [
      {
        name: 'CFTR_Exon10_WildType (Normal)',
        description: 'Intact functional CFTR chloride channel exon sequence',
        sequence: 'ACTTCACTTCTAATGATGATTATGGGAGAACTGGAGCCTTCAGAGGGTAAAATTAAGCACAGTGGAAGAATTTCATTCTGTTCTCAGTTTTCCTGGATTATGCCTGGCACCATTAAAGAAAATATCATCTTTGGTGTTTCCTATGATGAATATAGATACAGAAGCGTCATCAAAGCATGCCAACTAGAAGAG'
      },
      {
        name: 'CFTR_Delta_F508 (In-frame 3bp Deletion)',
        description: 'Loss of 3 nucleotides (CTT) eliminating Phe508 codon without disrupting reading frame',
        sequence: 'ACTTCACTTCTAATGATGATTATGGGAGAACTGGAGCCTTCAGAGGGTAAAATTAAGCACAGTGGAAGAATTTCATTCTGTTCTCAGTTTTCCTGGATTATGCCTGGCACCATTAAAGAAAATATCATCGGTGTTTCCTATGATGAATATAGATACAGAAGCGTCATCAAAGCATGCCAACTAGAAGAG'
      },
      {
        name: 'CFTR_G542X (Nonsense Stop Mutation)',
        description: 'G->T transversion creating premature stop codon TGA at position 542',
        sequence: 'ACTTCACTTCTAATGATGATTATGGGAGAACTGGAGCCTTCAGAGGGTAAAATTAAGCACAGTGGAAGAATTTCATTCTGTTCTCAGTTTTCCTGGATTATGCCTGGCACCATTAAAGAAAATATCATCTTTTGAGTTTCCTATGATGAATATAGATACAGAAGCGTCATCAAAGCATGCCAACTAGAAGAG'
      },
      {
        name: 'CFTR_R553X (Nonsense Premature Stop)',
        description: 'C->T transition creating premature stop codon TGA at position 553',
        sequence: 'ACTTCACTTCTAATGATGATTATGGGAGAACTGGAGCCTTCAGAGGGTAAAATTAAGCACAGTGGAAGAATTTCATTCTGTTCTCAGTTTTCCTGGATTATGCCTGGCACCATTAAAGAAAATATCATCTTTGGTGTTTCCTATGATGAATATAGATACAGATGCGTCATCAAAGCATGCCAACTAGAAGAG'
      }
    ]
  },

  brca1_cancer: {
    id: 'brca1_cancer',
    title: 'BRCA1 Hereditary Breast/Ovarian Cancer',
    description: 'Pathogenic Ashkenazi Jewish founder mutations including 185delAG frameshift deletion, 5382insC insertion, and RING domain missense variant.',
    category: 'Oncogenomics',
    referenceIndex: 0,
    samples: [
      {
        name: 'BRCA1_Exon_WildType (Normal)',
        description: 'Unmutated normal BRCA1 tumor suppressor sequence',
        sequence: 'ATGGATTTATCTGCTCTTCGCGTTGAAGAAGTACAAAATGTCATTAATGCTATGCAGAAAATCTTAGAGTGTCCCATCTGTCTGGAGTTGATCAAGGAACCTGTCTCCACAAAGTGTGACCACATATTTTGCAAATTTTGCATGCTGAAACTTCTCAACCAGAAGAAAGGGCCTTCACAGTGTCCTTTATGTAAGAATGATATAACCAAAAGGAGCCTACAAGAA'
      },
      {
        name: 'BRCA1_185delAG (Frameshift Deletion)',
        description: '2bp deletion of AG at codon 68 shifting the reading frame and inducing an immediate premature stop codon',
        sequence: 'ATGGATTTATCTGCTCTTCGCGTTGAAGAAGTACAAAATGTCATTAATGCTATGCAGAAAATCTTAGAGTGTCCCATCTGTCTGGAGTTGATCAAGGAACCTGTCTCCACAAAGTGTGACCACATATTTTGCAAATTTTGCATGCTGAAACTTCTCAACCAGAAGAAAGGGCCTTCACAGTGTCCCAAAGAATGATATAACCAAAAGGAGCCTACAAGAA'
      },
      {
        name: 'BRCA1_5382insC (Frameshift Insertion)',
        description: '1bp cytosine insertion causing frameshift mutation and truncated nonfunctional protein',
        sequence: 'ATGGATTTATCTGCTCTTCGCGTTGAAGAAGTACAAAATGTCATTAATGCTATGCAGAAAATCTTAGAGTGTCCCATCTGTCTGGAGTTGATCAAGGAACCTGTCTCCACAAAGTGTGACCACATATTTTGCAAATTTTGCATGCTGAAACTTCTCAACCAGAAGAAAGGGCCTTCACAGTGTCCTTTTATGTAAGAATGATATAACCAAAAGGAGCCTACAAGAA'
      },
      {
        name: 'BRCA1_C61G (Deleterious Missense)',
        description: 'T->G transversion disrupting the zinc-binding RING finger motif (Cys61Gly)',
        sequence: 'ATGGATTTATCTGCTCTTCGCGTTGAAGAAGTACAAAATGTCATTAATGCTATGCAGAAAATCTTAGAGTGTCCCATCTGTCTGGAGTTGATCAAGGAACCTGTCTCCACAAAGTGTGACCACATATTTGGCAAATTTTGCATGCTGAAACTTCTCAACCAGAAGAAAGGGCCTTCACAGTGTCCTTTATGTAAGAATGATATAACCAAAAGGAGCCTACAAGAA'
      }
    ]
  },

  primate_evolution: {
    id: 'primate_evolution',
    title: 'Hominoid Cytochrome B (Primate Phylogenetics)',
    description: 'Mitochondrial CytB sequence across Great Apes (Human, Chimp, Gorilla, Orangutan) exhibiting high transition/transversion bias and evolutionary divergence.',
    category: 'Evolutionary Phylogenetics',
    referenceIndex: 0,
    samples: [
      {
        name: 'Homo_sapiens (Human)',
        description: 'Modern human mitochondrial Cytochrome B gene segment',
        sequence: 'ATGACCCCAATACGCAAAATTAACCCCCTAATAAAATTAATTAACCACTCATTCATCGACCTACCCACCCCATCCAACATCTCCGCATGATGAAACTTCGGCTCACTCCTTGGCGCCTGCCTGATCCTCCAAATCACCACAGGACTATTCCTAGCCATGCACTACTCACCAGACGCCTCAACCGCCTTTTCATCAATCGCCCACATCACTCGAGACGTAAATTAT'
      },
      {
        name: 'Pan_troglodytes (Chimpanzee)',
        description: 'Common chimpanzee CytB showing 98.5% sequence homology with human',
        sequence: 'ATGACCCCAATACGCAAAACCAACCCCCTAATAAAATTAATTAACCACTCATTCATCGACCTACCCACCCCATCCAACATCTCCACATGATGAAACTTCGGCTCACTCCTTGGCGCCTGCCTAATCCTCCAAATCACCACAGGACTATTCCTAGCCATACACTACTCACCAGACGCCTCAACCGCCTTTTCATCAATCGCCCACATCACTCGAGACGTAAATTAT'
      },
      {
        name: 'Gorilla_gorilla (Gorilla)',
        description: 'Western lowland gorilla CytB with characteristic synapomorphies',
        sequence: 'ATGACCCCAATACGCAAAATCAACCCCCTAATAAAATTAATTAACCATTCATTCATCGACCTACCCACCCCATCCAACATCTCCGCATGATGAAACTTCGGCTCACTCCTTGGCACCTGCCTAATCCTCCAAATCACCACAGGACTATTCCTAGCCATACATTACTCACCAGACGCCTCAACCGCCTTTTCATCAATCGCTCACATCACTCGAGACGTAAATTAT'
      },
      {
        name: 'Pongo_abelii (Orangutan)',
        description: 'Sumatran orangutan CytB as an evolutionary outgroup among great apes',
        sequence: 'ATGACCCCAATACGCAAAATCAACCCCCTAATAAAATTAATCAACCACTCATTCATCGATCTCCCCACCCCATCCAACATCTCTGCATGATGAAACTTTGGCTCACTCCTTGGTGCCTGCCTGATCCTACAAATCACCACAGGACTATTCCTAGCCATACACTATTCACCAGACGCCTCAACTGCCTTTTCATCAATCGCACACATCACCCGAGACGTAAATTAT'
      }
    ]
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SAMPLE_DATASETS;
} else if (typeof window !== 'undefined') {
  window.SAMPLE_DATASETS = SAMPLE_DATASETS;
}
