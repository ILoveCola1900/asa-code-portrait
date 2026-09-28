let img;
const RESOLUTION = 80;
const CHAR_SET = " .:-=+*#%@";
const USE_COLOR = true;
const INVERT = true;

function preload() {
  img = loadImage("../../asa.jpg");
}

function setup() {
  let scale = 800 / img.width;
  createCanvas(800, img.height * scale);
  noLoop();
  textFont("monospace");
  textAlign(CENTER, CENTER);
  generateASCII();
}

function generateASCII() {
  background(240);

  let cellW = width / RESOLUTION;
  let cellH = cellW * 0.5;
  let rows = floor(height / cellH);

  img.loadPixels();

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < RESOLUTION; col++) {
      let sampleX = map(col, 0, RESOLUTION, 0, img.width);
      let sampleY = map(row, 0, rows, 0, img.height);
      let c = img.get(floor(sampleX), floor(sampleY));
      let b = brightness(c);
      let index = floor(map(b, 0, 255, 0, CHAR_SET.length - 1));

      if (INVERT) {
        index = CHAR_SET.length - 1 - index;
      }

      fill(USE_COLOR ? c : 255);
      noStroke();
      textSize(cellW * 0.8);
      text(CHAR_SET[index], col * cellW + cellW / 2, row * cellH + cellH / 2);
    }
  }
}

function keyPressed() {
  if (key === "s" || key === "S") {
    saveCanvas("asa_ascii", "png");
  }
}
