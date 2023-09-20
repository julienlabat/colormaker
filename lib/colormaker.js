
// MODEL FOR PPRESET OBJECT :
// every parameter is optional, default settings are used if nothing is provided
// if you don't want to specify any preset, instatiate with : new ColorMaker({})

// const presets = {
  
  // Set here available harmonies and tones, 
  // second value is weight for random picking

  // harmonyName: [
  //   ['Analogous', 1], 
  //   ['Big_mess', 1]
  // ],
  // tonesName: [
  //   ['Medium_contrast', 1],
  //   ['Low_contrast', 1]
  // ],

  // Ranges for  base color random pick
  // baseRanges: {
  //   l: [0, 100],
  //   c: [0, 100],
  //   h: [0, 360]
  // },
  
  // Force base color 
  // base: {
  //   l: 70,
  //   c: 50,
  //   h: 350
  // },

  // Force deviation ranges
  // deviationRanges: {
  //   l: [0, 100],
  //   c: [0, 100],
  //   h: [0, 100], // Overrides harmony completely
  // },
  
  // Force deviations
  // deviation: {
  //   l: 0,
  //   c: 0,
  //   h: 0
  // }

// }

// --------------------------------------------------------------

const harmonies = {
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
    c: [8, 14]
  },
  paletteSize: 7
}

//------------------------------

const D50 = { X: 0.3457 / 0.3585, Y: 1, Z: (1 - 0.3457 - 0.3585) / 0.3585 }
const k = Math.pow(29, 3) / Math.pow(3, 3)
const e = Math.pow(6, 3) / Math.pow(29, 3)
const clamp =v=> Math.max(0, Math.min(1, v))
const fixup =v=> ~~(clamp(v) * 255)
const normalizeHue = hue => ((hue % 360) < 0 ? hue + 360 : hue)

// Weighted random functions -------------
// Returns a random entry from an object of weighted objects : { name: { ... , weight: int }, ... }
const weightedRandomObj=(obj)=>random(Object.values(obj).reduce((a,v)=>a.concat(new Array(v.weight).fill(v)),[]))
// Returns a random value from an array of [value, weight] pairs
const weightedRandomArr=(arr)=>random(arr.reduce((a,v)=>a.concat(new Array(v[1]).fill(v[0])),[]))

//--------------------------------------------------------------

class ColorMaker {

  constructor(p) {

    // Harmony table
    // TODO : both randoms should be weighted
    this.harmonyName = p.harmonyName ? weightedRandomArr(p.harmonyName) : weightedRandomObj(harmonies).name
    this.harmony = harmonies[this.harmonyName]

    // Lightness table
    this.tonesName = p.tonesName ? weightedRandomArr(p.tonesName) : weightedRandomObj(tonesTable).name
    this.tones = tonesTable[this.tonesName].steps

    // Ranges for base color random pick
    this.baseRanges = {... defaultSettings.baseRanges}
    if (p.baseRanges) {
      if (p.baseRanges.l) this.baseRanges.l = p.baseRanges.l
      if (p.baseRanges.c) this.baseRanges.c = p.baseRanges.c
      if (p.baseRanges.h) this.baseRanges.h = p.baseRanges.h
    }

    // Base color (can be forced in presets)
    this.base = {}
    this.setBase()
    if (p.base) {
      if (p.base.l) this.base.l = p.base.l
      if (p.base.c) this.base.c = p.base.c
      if (p.base.h) this.base.h = p.base.h
    }

    // Ranges for randomizing deviation
    this.deviationRanges = {... defaultSettings.deviationRanges}
    this.deviationRanges.h = this.harmony.deviationRange
    if (p.deviationRanges) {
      if (p.deviationRanges.l) this.deviationRanges.l = p.deviationRanges.l
      if (p.deviationRanges.c) this.deviationRanges.c = p.deviationRanges.c
      if (p.deviationRanges.h) this.deviationRanges.h = p.deviationRanges.h
    }
    // hue deviation range defined in harmony tables

    // Set deviation from deviation ranges
    this.deviation = {
      l: random(this.deviationRanges.l[0], this.deviationRanges.l[1]),
      c: random(this.deviationRanges.c[0], this.deviationRanges.c[1]),
      h: random(this.deviationRanges.h[0], this.deviationRanges.h[1])
    }
    // deviation can be forced in presets
    if (p.deviation) {
      if (p.deviation.l) this.deviation.l = p.deviation.l
      if (p.deviation.c) this.deviation.c = p.deviation.c
      if (p.deviation.h) this.deviation.h = p.deviation.h
    }

    // Palette storage : arrays of strings, initiated with base color
    this.palette = [this.base]
    this.paletteHex = [this.getBaseHex()]
  
  }

  setBase() {
    // Sets a new random base color with same presets
    this.base = {
      mode: 'lch',
      l: random(this.baseRanges.l[0], this.baseRanges.l[1]),
      c: random(this.baseRanges.c[0], this.baseRanges.c[1]),
      h: random(this.baseRanges.h[0], this.baseRanges.h[1])
    }
  }

  getBaseHex() {
    // returns base color in hex format
    return this.formatHex(this.base)
  }

  newColor() {
    // Returns a new color at random from current instance properties
    let t = random(this.tones) * 100 // lightness offset from tones map
    let l = Math.abs(this.base.l - t)
    return {
      mode:"lch",
      l: constrain(randomGaussian(l, this.deviation.l), 0, 100),
      c: constrain(randomGaussian(this.base.c, this.deviation.c), 0, 100),
      h: abs(randomGaussian(this.base.h + random(this.harmony.steps), this.deviation.h))%360
    }
  }

  newPalette(len=defaultSettings.paletteSize) {
    // Fills the palette with a given number of colors
    for (let i = 0; i < len-1; i++) {
      let col = this.newColor()
      this.palette.push(col)
      this.paletteHex.push(this.formatHex(col))
    }
  }

  alterColor(col, args, toRgba=false, dontCycle=false) {
    // Takes in a color hex string
    // Returns a modified color according to args (in lch or rgba format)
    // lowercase arg adds to value : { l: 20 } will add 20 to original l
    // uppercase arg sets a new value : { L: 20 } will set l to 20
    let lch = this.rgbToLch(this.parseRgb(col))
    
    if (args.l) lch.l = dontCycle ? Math.abs(args.l + lch.l) : Math.abs(100 + args.l + lch.l) % 100
    if (args.c) lch.c = dontCycle ? Math.abs(args.c + lch.c) : Math.abs(100 + args.c + lch.c) % 100
    if (args.h) lch.h = dontCycle ? Math.abs(args.h + lch.h) : Math.abs(360 + args.h + lch.h) % 360
    if (args.a) lch.alpha = Math.abs(args.a + lch.a) % 1
    if (args.L) lch.l = args.L
    if (args.C) lch.c = args.C
    if (args.H) lch.h = args.H
    if (args.A) lch.alpha = args.A
    
    return toRgba ? this.formatRgba(lch) : lch
  }


//--------------------------------------------------------------
// Custom made formatters and parser
  
  formatRgba(lch) {
    let col = this.lchToRgb(lch)
    const f = v => v ? fixup(v) : 'none'
    let r = f(col.r),
        g = f(col.g),
        b = f(col.b)
    return `rgba(${r}, ${g}, ${b}, ${ col.alpha ? clamp(col.alpha) : 1 })`
  }

  formatHex(lch) {
    let rgb = this.lchToRgb(lch)
    const f = v => Math.round(v * 255).toString(16).padStart(2, '0')
    let r = f(rgb.r),
        g = f(rgb.g),
        b = f(rgb.b)
    return `#${r}${g}${b}`
  }

  parseRgb(str) {
    const f = (start, end) => parseInt(str.slice(start, end), 16) / 255
    if (str[0] === '#') {
      let res = {
        mode: 'rgb',
        r: f(1, 3),
        g: f(3, 5),
        b: f(5, 7),
        alpha: 1
      }
      return this.fixup_rgb(res)
    }
    else return undefined
  }

  //------------------------------
  // from https://github.com/Evercoder/culori by Dan Burzo

  lchToLab({ l, c, h, alpha }, mode = 'lab') {
    let res = {
      mode,
      l,
      a: c ? c * Math.cos((h / 180) * Math.PI) : 0,
      b: c ? c * Math.sin((h / 180) * Math.PI) : 0
    };
    if (alpha) res.alpha = alpha;
    return res;
  }

  labToLch({ l, a, b, alpha }, mode = 'lch') {
    let c = Math.sqrt(a * a + b * b);
    let res = { mode, l, c };
    if (c) res.h = normalizeHue((Math.atan2(b, a) * 180) / Math.PI);
    if (alpha) res.alpha = alpha;
    return res;
  }

  labToXyz50({ l, a, b, alpha }) {
    let fn = v => (Math.pow(v, 3) > e ? Math.pow(v, 3) : (116 * v - 16) / k);
    let fy = (l + 16) / 116;
    let fx = a / 500 + fy;
    let fz = fy - b / 200;
  
    let res = {
      mode: 'xyz50',
      x: fn(fx) * D50.X,
      y: fn(fy) * D50.Y,
      z: fn(fz) * D50.Z
    };
  
    if (alpha) {
      res.alpha = alpha;
    }
  
    return res;
  }

  xyz50ToLab({ x, y, z, alpha }) {
    const f = value => (value > e ? Math.cbrt(value) : (k * value + 16) / 116);
    let f0 = f(x / D50.X);
    let f1 = f(y / D50.Y);
    let f2 = f(z / D50.Z);
  
    let res = {
      mode: 'lab',
      l: 116 * f1 - 16,
      a: 500 * (f0 - f1),
      b: 200 * (f1 - f2)
    };
  
    if (alpha) {
      res.alpha = alpha;
    }
  
    return res;
  }
  
  lrgbToRgb({ r, g, b, alpha }, mode = 'rgb') {
    const fn = c => {
      const abs = Math.abs(c);
      if (abs > 0.0031308) {
        return (Math.sign(c) || 1) * (1.055 * Math.pow(abs, 1 / 2.4) - 0.055);
      }
      return c * 12.92;
    };
    let res = {
      mode,
      r: fn(r),
      g: fn(g),
      b: fn(b)
    };
    if (alpha) res.alpha = alpha;
    return res;
  };

  rgbToLrgb({ r, g, b, alpha }) {
    const fn = c => {
      const abs = Math.abs(c);
      if (abs < 0.04045) {
        return c / 12.92;
      }
      return (Math.sign(c) || 1) * Math.pow((abs + 0.055) / 1.055, 2.4);
    };
    let res = {
      mode: 'lrgb',
      r: fn(r),
      g: fn(g),
      b: fn(b)
    };
    if (alpha) res.alpha = alpha;
    return res;
  };

  xyz50ToRgb({ x, y, z, alpha }) {
    let res = this.lrgbToRgb({
      r:
        x * 3.1341359569958707 -
        y * 1.6173863321612538 -
        0.4906619460083532 * z,
      g:
        x * -0.978795502912089 +
        y * 1.916254567259524 +
        0.03344273116131949 * z,
      b:
        x * 0.07195537988411677 -
        y * 0.2289768264158322 +
        1.405386058324125 * z
    });
    if (alpha) {
      res.alpha = alpha;
    }
    return res;
  }

  rgbToXyz50(rgb) {
    let { r, g, b, alpha } = this.rgbToLrgb(rgb);
    let res = {
      mode: 'xyz50',
      x:
        0.436065742824811 * r +
        0.3851514688337912 * g +
        0.14307845442264197 * b,
      y:
        0.22249319175623702 * r +
        0.7168870538238823 * g +
        0.06061979053616537 * b,
      z:
        0.013923904500943465 * r +
        0.09708128566574634 * g +
        0.7140993584005155 * b
    };
    if (alpha) {
      res.alpha = alpha;
    }
    return res;
  }

  lchToRgb(lch) {
    return this.fixup_rgb(this.xyz50ToRgb(this.labToXyz50(this.lchToLab(lch))))
  }
  
  rgbToLch(rgb) {
    return this.labToLch(this.xyz50ToLab(this.rgbToXyz50(rgb)))
  }

  fixup_rgb(rgb) {
    const f = v => Math.max(0, Math.min(v, 1))
    const res = {
      mode: rgb.mode,
      r: f(rgb.r),
      g: f(rgb.g),
      b: f(rgb.b)
    };
    if (rgb.alpha) {
      res.alpha = rgb.alpha;
    }
    return res;
  }

}
