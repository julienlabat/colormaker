# ColorMaker 🌈

**Funky color palette generator using [LCH color space](https://lea.verou.me/blog/2020/04/lch-colors-in-css-what-why-and-how/).**

ColorMaker is first designed to work effortlessly with [p5.js](https://p5js.org/) but can be used in any JavaScript project that requires versatile color palette generation.

It generates random colors within LCH color space according to several **presets** (hues harmony, tones table, deviation ranges …). Default presets are fine tuned to produce a wide variety of palettes, but the power of this tool resides in the ability to **customize** these presets.

## How it works

When initiated, the ColorMaker picks at random:
- a predefined **harmony table** (allowed hue angles)
- a predefined **tones table** (allowed lightness differentials)
- a **base color** from user defined / preset **ranges** (base color can also be forced by user)
- standard **deviation** for each LCH value from user defined / preset **ranges** (deviation values can be forced by user)

It then creates each color by:
- picking its **base Hue** at random from the harmony table
- offseting the base color Lightness by a random amount from the tones table, to get its **base lightness**
- keeping the base color Chroma as **base Chroma**
- deviating from these base values with a normal random of their respective **standard deviations**


## Usage

### With p5.js

ColorMaker is designed to work with p5.js with minimum hassle:
- Instantiate with `new ColorMaker(presets)`
- Generate a new palette with the `newPalette(n)` method, where `n` is an integer number of colors. The class stores colors in a `palette` array in LCH format : `{ l: 100, c: 131, h: 360 }`
- In your sketch, instead of p5.js `background()`, `fill()` and `stroke()` methods, use `ColorMaker.background()`, `ColorMaker.fill()` and `ColorMaker.stroke()`. Both functions take an LCH object as single argument.

Example:
```js
const cm = new ColorMaker({});  // empty object will initiate with default settings
cm.newPalette(7);               // create a new palette with 7 colors
let palette = cm.palette;       // retrieve palette array

cm.fill(palette[0]);            // set fill to first color
rect(200, 200, 100, 100);
```

### Without p5.js

ColorMaker random functions default to p5.js random, if you're not using p5, you need to provide a replacement PRNG. Using ColorMaker without p5.js also allows you to benefit of the full range of P3 color space.
- Instantiate with presets and PRNG function eg.: `new ColorMaker({}, () => Math.random())`
- Generate a new palette with the `newPalette(n)` method, where `n` is an integer number of colors. The class stores colors in a `palette` array in LCH format : `{ l: 100, c: 131, h: 360 }`
- To pass colors to Context or CSS properties, use the `lchString()` method
  
Example:
```js
let canvas = document.createElement('canvas');
let ctx = canvas.getContext('2d');

const cm = new ColorMaker({}, () => Math.random());
cm.newPalette(7);

let color = cm.palette[0];
let lch = lchString(color);

ctx.fillStyle = lch;
ctx.fillRect(200, 200, 100, 100);
```


## Presets
ColorMaker must be instatiated with a `preset`` object, here's a template with details on each settings.  
  
All settings are optional and will override the default settings.

Pass an empty object `{}` to the constructor to use default presets (see above).

Template:

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
    c: [0, 131],
    h: [0, 360]
  },
  
  // Force base color 
  base: {
    l: 100,
    c: 131, // in LCH color space chroma maxes to ~131
    h: 360
  },

  // Force deviation ranges
  deviationRanges: {
    l: [0, 100],
    c: [0, 131],
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
You can see examples of presets in [example-presets.js](src/example-presets.js).

## Get CSS color string
Colors stored in ColorMaker have a `toString()` method that returns a formatted string for CSS lch color :
```js
console.log(cm.palette[0].toString())
// logs "lch(100 131 360 / 100%)"
```

### Manual colors
In order to manipulate arbitrary colors, you need to use the `color()` method. This will return a copy of your color object including a `toString()` method.
```js
let col = cm.color({
  l: 100,
  c: 131,
  h: 360
})
cm.fill(col)

console.log(col.toString())
// logs "lch(100 131 360 / 100%)"
```

## Alter Colors
ColorMaker comes with a pretty useful `alterColor(color, args, cycle)` method. It returns a modified copy of any color according to provided arguments :
- `color` : object with lch values eg.: `{ l:100, c:131, h:360 }`
- `args` : object with the following (optional) keys : `l`, `c`, `h`, `a`, `L`, `C`, `H`, `A` with number values.
  - lowercase letters add the value to the original value
  - uppercase letters set to value
- `cycle`: boolean: if true, overflowing values will cycle to opposite (eg. with max 100 : 90 + 20 = 10), if false, values will be clamped (eg. with max 100: 90 + 20 = 100)

Example: 
```js
let color = {
  l: 20,
  c: 40,
  h: 350
}
let color2 = cm.alterColor(color, {
  l: 10,
  C: 50,
  h: -40,
  a: -50
})
// color2 : { l: 30, c: 50, h: 310, a: 50 }
```
You can use this method if you need colors to have an Alpha value of less than 100%. Final alpha value must not be 0%.