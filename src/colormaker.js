// TODO : implement custom harmonyTable
// TODO : implement custom tonesTable
// TODO : implement chroma tables + custom chromaTable

const harmonyTable = {
  Uniform: {
    name: 'Uniform',
    steps: [0],
    deviationRange: [0, 0],
    weight: 1
  },
  Analogous: {
    name: 'Analogous',
    steps: [0],
    deviationRange: [15, 30],
    weight: 2
  },
  Complementary: {
    name: 'Complementary',
    steps: [0, 0, 0, 180],
    deviationRange: [10, 20],
    weight: 4,
  },
  Split_complementary: {
    name: 'Split_complementary',
    steps: [0, 0, 150, 210],
    deviationRange: [8, 12],
    weight: 6
  },
  Triadic: {
    name: 'Triadic',
    steps: [0, 120, 240],
    deviationRange: [6, 12],
    weight: 4
  },
  Tetradic: {
    name: 'Tetradic',
    steps: [0, 180, 0, 180],
    deviationRange: [6, 8],
    weight: 4
  },
  Square: {
    name: 'Square',
    steps: [0, 90, 180, 270],
    deviationRange: [6, 8],
    weight: 4
  },
  Big_mess: {
    name: 'Big_mess',
    steps: [0],
    deviationRange: [60, 90],
    weight: 8
  }
}

const tonesTable = {
  Uniform: { 
    name: 'Uniform',
    steps: [0], 
    weight: 1 
  },
  Low_contrast: { 
    name: 'Low_contrast',
    steps: [-.2, 0, 0, .2], 
    weight: 1 
  },
  Medium_contrast: { 
    name: 'Medium_contrast',
    steps: [-.25, 0, 0, .25], 
    weight: 1 
  },
  High_contrast: { 
    name: 'High_contrast',
    steps: [0, .35], 
    weight: 1 
  },
  Heavy_base_low_contrast: {
    name: 'Heavy_base_low_contrast', 
    steps: [0, 0, 0, 0, 0, 0, 0, 0, 0, .15], 
    weight: 1 
  },
  Heavy_base_medium_contrast: { 
    name: 'Heavy_base_medium_contrast',
    steps: [0, 0, 0, 0, 0, .25], 
    weight: 1 
  },
  Heavy_base_high_contrast: { 
    name: 'Heavy_base_high_contrast',
    steps: [0, 0, 0, .4], 
    weight: 1
  },
  Full_range: { 
    name: 'Full_range',
    steps: [-.4, -.25, -.1, 0, 0, .1, .25, .4],
    weight: 1 
  },
  Opposite: { 
    name: 'Opposite',
    steps: [0, -1, 1, 1], 
    weight : 1
  }
}

const defaultSettings = {
  baseRanges: {
    l: [65, 70],
    c: [40, 50],
    h: [0, 360]
  },
  deviationRanges: {
    l: [6, 12],
    c: [6, 10]
  },
  paletteSize: 7
}

// Utils ---------------------------------
const clamp=(n,min,max)=> Math.min(Math.max(n,min),max)

//--------------------------------------------------------------

class ColorMaker {

  constructor(p, prng = () => random()) {
    /**
    * @param {object} p : presets
    * @param {function} prng : PRNG function, defaults to p5.js random()
    */

    this.prng = prng

    // Harmony table
    this.harmonyName = p.harmonyName ? 
      this.weightedRandomArr(p.harmonyName) : 
      this.weightedRandomObj(harmonyTable).name
    this.harmony = harmonyTable[this.harmonyName]
    if (this.harmonyName === 'Tetradic') {
      let r = this.random(30, 60)
      harmonyTable.Tetradic.steps = [r, 180 + r, 0, 180]
    }

    // Lightness table
    this.tonesName = p.tonesName ? 
      this.weightedRandomArr(p.tonesName) : 
      this.weightedRandomObj(tonesTable).name
    this.tones = tonesTable[this.tonesName].steps

    // Ranges for base color random pick
    this.baseRanges = {...defaultSettings.baseRanges}
    if (p.baseRanges) {
      if (p.baseRanges.l) this.baseRanges.l = p.baseRanges.l
      if (p.baseRanges.c) this.baseRanges.c = p.baseRanges.c
      if (p.baseRanges.h) this.baseRanges.h = p.baseRanges.h
    }

    // Base color (can be forced in presets)
    this.base = {}
    this.setBase()
    if (p.base) {
      if (p.base.l !== undefined) this.base.l = p.base.l
      if (p.base.c !== undefined) this.base.c = p.base.c
      if (p.base.h !== undefined) this.base.h = p.base.h
    }

    // Ranges for randomizing deviation
    this.deviationRanges = {...defaultSettings.deviationRanges}
    this.deviationRanges.h = this.harmony.deviationRange
    if (p.deviationRanges) {
      if (p.deviationRanges.l) this.deviationRanges.l = p.deviationRanges.l
      if (p.deviationRanges.c) this.deviationRanges.c = p.deviationRanges.c
      if (p.deviationRanges.h) this.deviationRanges.h = p.deviationRanges.h
    }

    // Set deviation from deviation ranges
    this.deviation = {
      l: this.random(this.deviationRanges.l[0], this.deviationRanges.l[1]),
      c: this.random(this.deviationRanges.c[0], this.deviationRanges.c[1]),
      h: this.random(this.deviationRanges.h[0], this.deviationRanges.h[1])
    }
    // deviation can be forced in presets
    if (p.deviation) {
      if (p.deviation.l !== undefined) this.deviation.l = p.deviation.l
      if (p.deviation.c !== undefined) this.deviation.c = p.deviation.c
      if (p.deviation.h !== undefined) this.deviation.h = p.deviation.h
    }

    // Palette storage : arrays of strings, initiated with base color
    this.palette = [this.base]
  
  }

  setBase() {
    // Sets a new random base color with same presets
    this.base = {
      l: this.random(this.baseRanges.l[0], this.baseRanges.l[1]),
      c: this.random(this.baseRanges.c[0], this.baseRanges.c[1]),
      h: this.random(this.baseRanges.h[0], this.baseRanges.h[1])
    }
  }

  newColor() {
    // Returns a new color at random from current instance properties
    let t = this.random(this.tones) * 100 // lightness offset from tones map
    let l = Math.abs(this.base.l - t)
    return {
      l: clamp(this.randomGaussian(l, this.deviation.l), 0, 100),
      c: clamp(this.randomGaussian(this.base.c, this.deviation.c), 0, 131),
      h: Math.abs(this.randomGaussian(this.base.h + this.random(this.harmony.steps), this.deviation.h))%360
    }
  }

  newPalette(len=defaultSettings.paletteSize) {
    // Fills the palette with a given number of colors
    for (let i = 0; i < len-1; i++) {
      let col = this.newColor()
      this.palette.push(col)
    }
  }

  alterColor(col, args, cycle=true) {
    // Takes in a LCH color object
    // Returns a modified coy of col according to args (in lch format)
    // lowercase arg adds to value : { l: 20 } will add 20 to original l
    // uppercase arg sets a new value : { L: 20 } will set l to 20
    // Alpha (a, A) values must not result to 0
    let lch = {...col}
    if (args.l) lch.l = cycle ? Math.abs(100 + args.l + lch.l) % 100 : clamp(args.l + lch.l, 0, 100)
    if (args.c) lch.c = cycle ? Math.abs(131 + args.c + lch.c) % 131 : clamp(args.c + lch.c, 0, 131)
    if (args.h) lch.h = cycle ? Math.abs(360 + args.h + lch.h) % 360 : clamp(args.h + lch.h, 0, 360)
    if (args.a) lch.a = lch.a ? Math.abs(100 + args.a + lch.a) % 100 : Math.abs(100 + args.a + 1) % 100
    if (args.L) lch.l = args.L
    if (args.C) lch.c = args.C
    if (args.H) lch.h = args.H
    if (args.A) lch['a'] = args.A
    
    return lch
  }

  // P5 replacement methods ------------------------------------
  
  background(col) {
    noStroke()
    fill(0)
    drawingContext.fillStyle = `lch(${col.l} ${col.c} ${col.h} / ${col.a || 100}%)`
    rect(0, 0, width, height)
  }

  fill(col) {
    fill(0)
    drawingContext.fillStyle = `lch(${col.l} ${col.c} ${col.h} / ${col.a || 100}%)`
  }
  
  stroke(col) {
    stroke(0)
    drawingContext.strokeStyle = `lch(${col.l} ${col.c} ${col.h} / ${col.a || 100}%)`
  }

  // Random functions --------------------------------------------

  random(min, max) {
    // if min is an array : return random value from array
    // else return random number between min and max
    return Array.isArray(min) ? 
      min[~~(this.prng() * min.length)] : 
      this.prng() * (max-min) + min
  }

  randomGaussian(mean, sd) {
    const u = 1 - this.prng()
    const v = this.prng()
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v )
    // console.log(z * sd + mean)
    return z * sd + mean
  }

  weightedRandomObj(o) {
    let l = Object.values(o).reduce((a,v)=>a.concat(new Array(v.weight).fill(v)),[])
    return this.random(l)
  }

  weightedRandomArr(l) {
    let m = l.reduce((a,v)=>a.concat(new Array(v[1]).fill(v[0])))
    return this.random(m)
  }

}
