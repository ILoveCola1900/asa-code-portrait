let img;
const RESOLUTION = 300;
const MAX_DOT = 0.9;

function preload() {
  img = loadImage("../../asa.jpg");
}

function setup() {
  let scale = 800 / img.width;
  createCanvas(800, img.height * scale);
  noLoop();
  generateHalftone();
}

function generateHalftone() {
  background(240);
  img.loadPixels();

  let cellW = width / RESOLUTION;
  let cols = RESOLUTION;
  let rows = floor(height / cellW);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let sampleX = map(col, 0, cols, 0, img.width);
      let sampleY = map(row, 0, rows, 0, img.height);
      let c = img.get(floor(sampleX), floor(sampleY));
      let b = brightness(c);
      let size = map(b, 0, 255, cellW * MAX_DOT, cellW * 0.05);

      fill(b < 80 ? 30 : c);
      noStroke();
      ellipse(
        col * cellW + cellW / 2,
        row * cellW + cellW / 2,
        size,
        size
      );
    }
  }
}

function keyPressed() {
  if (key === "s" || key === "S") {
    saveCanvas("asa_halftone_v03", "png");
  }
}
