
// ColorMaker presets (see template in colormaker.js)

const presets = {
  baseRanges: {
    l: [50, 70],
    c: [25, 35]
  }
}

const numColors = 7 // palette size

// P5.js sketch -----------------------------

const M = .05,
      R = .8

let S, cm, narrow, infos,
    lPal = [],
    cPal = [],
    hPal = []

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
    lch = cm.palette[i]
    // Big blocks
    cm.fill(lch)
    rect(x, M, w, h)
    // Legend text
    cm.fill(getTextCol(lch.l))
    textSize(.01)
    if (narrow) {
      text(`${~~(lch.l)}-${~~(lch.c)}-${~~(lch.h)}`, x + .01, M + h - .01)
    } else {
      text(`L${~~(lch.l)} C${~~(lch.c)} H${~~(lch.h)}`, x + .01, M + h - .01)
    }

    // Sorted by Lightness
    drawSortedPalette(i, x, w, h, 'l', lPal, 1)
    // Sorted by Chroma
    drawSortedPalette(i, x, w, h, 'c', cPal, 2)
    // Sorted by Hue
    drawSortedPalette(i, x, w, h, 'h', hPal, 3)

  }

  // Color wheels
  drawWheel('lightness')
  drawWheel('chroma')

  // Palette infos at bottom
  cm.fill({ l: 0, c: 0, h: 0 })
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
  return {
    l: (colL + 50) % 100,
    c: 0,
    h: 0
  }
}

function sortPal(val) { 
  // Returns a sorted version of cm.palette
  // val : string = 'l', 'c' or 'h' (which value to sort by)
  let res = [...cm.palette].sort((a, b) => a[val] - b[val])
  res.forEach((lch, i) => res[i] = lch)
  return res
}

function drawSortedPalette(i, x, w, h, by, lchPal, offset=1) {
  // by: str = 'l', 'c' or 'h'
  cm.fill(lchPal[i])
  rect(x, M+h+(h/3*(offset-1))+.01, w, h/3)
  // Legend text
  cm.fill(getTextCol(lchPal[i].l))
  text(`${~~(lchPal[i][by])}`, x + .01, M + h + h/3 * offset)
  if (i === 0) {
    fill('black')
    text(by.toUpperCase(), x - .02, M + h + h/3 * offset)
  }
}

function drawWheel(type) {
  let isChroma = type === 'chroma'
  let x = isChroma ? .75 : .25
  let y = .5
  let def = radians(.3)
  let steps = 60
  noFill()
  strokeWeight(.001)
  let step = 0
  // Draw background gradient
  for (let i = 0; i < TAU; i += def) {
    step++
    let lastx2 = x
    let lasty2 = y
    for (let j = 0; j < steps + 1; j++) {
      let r = (.2 / steps) * j
      let col = isChroma ? 
        { l: 70, c: map(j, 0, steps, 0, 100), h: degrees(i) } :
        { l: map(j, 0, steps, 0, 100), c: 90, h: degrees(i) }
      cm.stroke(col)
      let x2 = x + cos(i) * r
      let y2 = y + sin(i) * r
      line(lastx2, lasty2, x2, y2)
      lastx2 = x2
      lasty2 = y2
    }
  }
  // Draw concentric circles
  hPal.forEach(col => {
    let r = map(col.l, 0, 100, .025, .175)
    cm.stroke({l:30, c:0, h:0})
    noFill()
    circle(x, y, r*2)
  })
  // Draw points
  hPal.forEach(col => {
    let r = map(col.l, 0, 100, .025, .175)
    let angle = radians(col.h)
    let x3 = x + cos(angle) * r
    let y3 = y + sin(angle) * r
    cm.fill(col)
    circle(x3, y3, .02)
  })
}

function windowResized() {
  S = min(windowHeight / R, windowWidth)
  resizeCanvas(S, S*R)
  draw()
}