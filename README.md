# ColorMaker

Funky color palette generator using LCH color space. Works only with [p5.js](http://p5js.org) for now.


## How it works

When initiated, the ColorMaker picks at random:
- a predefined **harmony table** (allowed hue angles)
- a predefined **tones table** (allowed lightness differentials)
- a **base color** from user defined / preset ranges (base color can be forced by user)
- standard **deviation** for each LCH value from user defined / preset ranges (deviation values can be forced by user)

It then creates each color by:
- picking its **base Hue** at random from the harmony table
- offseting the base color Lightness by a random amount from the tones table, to get its **base lightness**
- keeping the base color Chroma as **base Chroma**
- deviating from these base values with a normal random of their respective standard deviations


## Usage

### With p5.js

ColorMaker is designed to work with p5.js with minimum hassle:
- Instantiate with `new ColorMaker(presets)`
- Generate a new palette with the `newPalette(n)` method, where `n` is an integer number of colors. The class stores colors in a `palette` array in LCH format : `{ l: 100, c: 100, h: 360 }`
- In your sketch, instead of p5.js `fill()` and `stroke()` methods, use `ColorMaker.fill()` and `ColorMaker.stroke()`. Both functions take an LCH object as single argument.

Example:
```js
const cm = new ColorMaker({});  // empty object will initiate with default settings
cm.newPalette(7);               // create a new palette with 7 colors
let palette = cm.palette;       // retrieve palette array
cm.fill(palette[0]);            // set fill to first color
rect(200, 200, 100, 100);
```

### Without p5.js

ColorMaker random functions default to p5.js random, if you're not using p5, you need to provide a replacement PRNG. Using ColorMaker without p5.js also allows you to use P3 color space
- Instantiate with presets and PRNG function eg.: `new ColorMaker({}, () => Math.radom())`
- Generate a new palette with the `newPalette(n)` method, where `n` is an integer number of colors. The class stores colors in a `palette` array in LCH format : `{ l: 100, c: 100, h: 360 }`
- Pass colors to Context with lch notation : `lch(100% 100% 360deg / 1)`
  
Example:
```js
let canvas = document.createElement('canvas');
let ctx = canvas.getContext('2d');

const cm = new ColorMaker({}, () => Math.random());
cm.newPalette(7);
let color = cm.palette[0];
ctx.fillStyle = `lch(${color.l}% ${color.c}% ${color.h}deg / 1)`;
ctx.fillRect(200, 200, 100, 100);
```


## Presets
ColorMaker must be instatiated with a preset object, here's a template with details on each settings.  
All settings are optional and will override the default settings.

```js
const presets = {
  
  // Set here harmonies and tones to pick from.
  // Second value is the weight for random picking

  harmonyName: [ // exhaustive list (with default weights)
    ['Uniform', 1], 
    ['Analogous', 2], 
    ['Complementary', 4],
    ['Split_complementary', 6],
    ['Triadic', 4],
    ['Tetradic', 4],
    ['Square', 4],
    ['Big_mess', 8]
  ],
  tonesName: [ // exhaustive list (with default weights)
    ['Uniform', 1],
    ['Low_contrast', 1],
    ['Medium_contrast', 1],
    ['High_contrast', 1],
    ['Heavy_base_low_contrast', 1],
    ['Heavy_base_medium_contrast', 1],
    ['Heavy_base_high_contrast', 1],
    ['Full_range', 1],
    ['Opposite', 1],
  ],

  // Ranges for base color random pick
  baseRanges: {
    l: [0, 100],
    c: [0, 100],
    h: [0, 360]
  },
  
  // Force base color 
  base: {
    l: 70,
    c: 50,
    h: 350
  },

  // Force deviation ranges
  deviationRanges: {
    l: [0, 100], // will not affect tones map
    c: [0, 100],
    h: [0, 100], // overrides harmony's presets
  },
  
  // Force deviations 
  deviation: {
    l: 0,
    c: 0,
    h: 0
  }
};
```