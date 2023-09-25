const presets = {
  
  // soft and light pastel colors
  pastel: { 
    tonesName: [
      ['Low_contrast', 3],
      ['Medium_contrast', 2],
      ['Heavy_base_low_contrast', 1],
      ['Heavy_base_medium_contrast', 1]
    ],
    baseRanges: {
      l: [70, 90],
      c: [15, 25]
    },
    deviationRanges: {
      l: [8, 14],
      c: [3, 8]
    },
  },

  // Full ranges everywhere !
  wild: { 
    baseRanges: {
      l: [0, 100],
      c: [0, 131]
    },
    deviationRanges: {
      l: [0, 100],
      c: [0, 131],
      h: [0, 360]
    },
  }


}