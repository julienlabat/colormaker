
// ColorMaker presets (see template in colormaker.js)

const presets = {
  baseRanges: {
    l: [50, 70],
    c: [30, 50]
  },
  harmonyName: [['Tetradic', 1]]
}

const numColors = 7 // palette size


// P5.js sketch -----------------------------

const M = .05,
      R = .8

let S, cm, narrow, infos,
    lPal = [],
    cPal = [],
    hPal = [],
    lPalHex = [],
    cPalHex = [],
    hPalHex = []

function setup() {

  // randomSeed(1344324855)
  
  S = min(windowHeight / R, windowWidth)
  createCanvas(S, S*R)
  noLoop()

  // Initiate ColorMaker
  cm = new ColorMaker(presets)
  // Create new palette
  cm.newPalette(numColors)

  // Create sorted palettes for display
  narrow = numColors > 10
  lPal = sortPal('l', 'lch')
  cPal = sortPal('c', 'lch')
  hPal = sortPal('h', 'lch')
  lPalHex = sortPal('l', 'rgb')
  cPalHex = sortPal('c', 'rgb')
  hPalHex = sortPal('h', 'rgb')

  // Store some infos on cm instance to print on canvas
  infos = {
    'Palette Size': `${numColors} colors`,
    'Harmony' : cm.harmonyName.replaceAll('_', ' '),
    'Tones' : cm.tonesName.replaceAll('_', ' '),
    'Deviations' : `L${~~(cm.deviation.l)} C${~~(cm.deviation.c)} H${~~(cm.deviation.h)}`
  }
}

function draw() {

  background(250)
  noStroke()
  
  push()
  scale(S)  

  // Top palettes display
  let w = (1 - M*2) / cm.palette.length,
      h = .1
  for (let i = 0; i < numColors; i++) {
    let x = M + i * w,
        hex = cm.paletteHex[i],
        lch = cm.palette[i]
    // Big blocks
    fill(hex)
    rect(x, M, w, h)
    // Legend text
    fill(getTextCol(lch.l))
    textSize(.01)
    if (narrow) {
      text(`${~~(lch.l)}-${~~(lch.c)}-${~~(lch.h)}`, x + .01, M + h - .01)
    } else {
      text(`L${~~(lch.l)} C${~~(lch.c)} H${~~(lch.h)}`, x + .01, M + h - .01)
    }

    // Sorted by Lightness
    drawSortedPalette(i, x, w, h, 'l', lPal, lPalHex, 1)
    // Sorted by Chroma
    drawSortedPalette(i, x, w, h, 'c', cPal, cPalHex, 2)
    // Sorted by Hue
    drawSortedPalette(i, x, w, h, 'h', hPal, hPalHex, 3)

  }

  // Color wheels
  drawHueLightnessWheel()
  drawHueChromaWheel()

  // Palette infos at bottom
  fill('black')
  noStroke()
  let info = ""
  for ([key, val] of Object.entries(infos)) {
    if (key.includes('Deviations')) info += ` ${key} ${val}`
    else info += ` ${val}  . `
  }
  text(info, M, R-M)

  pop()

}

function getTextCol(colL) {
  // Returns a grey color with opposite lightness to colL : int
  return cm.formatHex({
    l: (colL + 50) % 100,
    c: 0,
    h: 0
  })
}

function sortPal(val, mode) { 
  // Returns a sorted version of cm.palette
  // val : string = 'l', 'c' or 'h' (which value to sort by)
  // mode : str 'lch' or 'rgb' (output)
  let res = [...cm.palette].sort((a, b) => a[val] - b[val])
  res.forEach((lch, i) => {
    if (mode === "lch") res[i] = lch
    if (mode === "rgb") res[i] = cm.formatHex(lch)
  })
  return res
}

function drawSortedPalette(i, x, w, h, by, lchPal, hexPal, offset=1) {
  // by: str = 'l', 'c' or 'h'
  fill(hexPal[i])
  rect(x, M+h+(h/3*(offset-1))+.01, w, h/3)
  // Legend text
  fill(getTextCol(lchPal[i].l))
  text(`${~~(lchPal[i][by])}`, x + .01, M + h + h/3 * offset)
  if (i === 0) {
    fill('black')
    text(by.toUpperCase(), x - .02, M + h + h/3 * offset)
  }
}

function drawHueLightnessWheel() {
  let x = .25
  let y = .5
  let def = radians(.3)
  let lightnessSteps = 60
  noFill()
  strokeWeight(.001)
  let step = 0
  // Draw background gradient
  for (let i = 0; i < TAU; i += def) {
    step++
    let lastx2 = x
    let lasty2 = y
    for (let j = 0; j < lightnessSteps + 1; j++) {
      let r = (.2 / lightnessSteps) * j
      let col = cm.formatHex({ l: map(j, 0, lightnessSteps, 0, 100), c: 80, h: degrees(i) })
      stroke(col)
      let x2 = x + cos(i) * r
      let y2 = y + sin(i) * r
      line(lastx2, lasty2, x2, y2)
      lastx2 = x2
      lasty2 = y2
    }
  }
  // Draw points
  [...cm.palette]
    .sort((a, b) => a.h - b.h)
    .forEach((col, i) => {
      let angle = radians(col.h)
      let r = map(col.l, 0, 100, .025, .175)
      let x3 = x + cos(angle) * r
      let y3 = y + sin(angle) * r
      stroke(60)
      noFill()
      circle(x, y, r*2)
      fill(hPalHex[i])
      circle(x3, y3, .02)
    })
}

function drawHueChromaWheel() {
  let x = .75
  let y = .5
  let def = radians(.2)//.2
  let lightnessSteps = 60
  noFill()
  strokeWeight(.001)
  let step = 0
  // Draw background gradient
  for (let i = 0; i < TAU; i += def) {
    step++
    let lastx2 = x
    let lasty2 = y
    for (let j = 0; j < lightnessSteps + 1; j++) {
      let col = cm.formatHex({ l: 70, c: map(j, 0, lightnessSteps, 0, 100), h: degrees(i) })
      stroke(col)
      let x2 = x + cos(i) * (.2 / lightnessSteps) * j
      let y2 = y + sin(i) * (.2 / lightnessSteps) * j
      line(lastx2, lasty2, x2, y2)
      lastx2 = x2
      lasty2 = y2
    }
  }
  // Draw points
  [...cm.palette]
    .sort((a, b) => a.h - b.h)
    .forEach((col, i) => {
      let angle = radians(col.h)
      let r = map(col.c, 0, 100, .025, .175)
      let x3 = x + cos(angle) * r
      let y3 = y + sin(angle) * r
      stroke(60)
      noFill()
      circle(x, y, r*2)
      fill(hPalHex[i])
      circle(x3, y3, .02)
    })
}

function windowResized() {
  S = min(windowHeight / R, windowWidth)
  resizeCanvas(S, S*R)
  draw()
}
