let img;
const RESOLUTION = 500;
const MAX_DOT = 0.9;

function preload() {
  img = loadImage("../../asa.jpg");
}

function setup() {
  let scale = 800 / img.width;
  createCanvas(800, img.height * scale);
  pixelDensity(2);
  noLoop();
  renderHalftone();
}

function renderHalftone() {
  background(240);
  drawGradient();
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
      let size = map(b, 0, 255, cellW * MAX_DOT, cellW * 0.08);

      fill(b < 80 ? 20 : c);
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

function drawGradient() {
  let topColor = color(228, 142, 105);
  let bottomColor = color(247, 210, 184);

  noStroke();
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    stroke(lerpColor(topColor, bottomColor, inter));
    line(0, y, width, y);
  }
}

function keyPressed() {
  if (key === "s" || key === "S") {
    saveCanvas("asa_halftone_v1_hd", "png");
  }
}
