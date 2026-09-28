let img;
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

  let BG_RES = 150;
  let FACE_RES = 500;
  let FEATHER = 0.08;
  let faceZones = [[0.25, 0.05, 0.75, 1.0]];

  drawHalftoneLayer(BG_RES, faceZones, FEATHER, false);
  drawHalftoneLayer(FACE_RES, faceZones, FEATHER, true);
}

function drawHalftoneLayer(res, zones, feather, isFaceLayer) {
  let cellW = width / res;
  let cols = res;
  let rows = floor(height / cellW);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let x = col * cellW;
      let y = row * cellW;
      let faceWeight = 0;

      for (let zone of zones) {
        let dx = Math.min(x - width * zone[0], width * zone[2] - x);
        let dy = Math.min(y - height * zone[1], height * zone[3] - y);
        let distance = Math.min(dx, dy);
        let weight = constrain(distance / (width * feather), 0, 1);
        faceWeight = Math.max(faceWeight, weight);
      }

      if (isFaceLayer && faceWeight < 0.3) continue;
      if (!isFaceLayer && faceWeight >= 0.7) continue;

      let sampleX = map(col, 0, cols, 0, img.width);
      let sampleY = map(row, 0, rows, 0, img.height);
      let c = img.get(floor(sampleX), floor(sampleY));
      let b = brightness(c);

      if (isFaceLayer) {
        b = map(b, 15, 240, 0, 255, true);
      }

      let size = map(b, 0, 255, cellW * MAX_DOT, cellW * 0.05);
      fill(b < 80 ? (isFaceLayer ? 10 : 30) : c);
      noStroke();
      ellipse(x + cellW / 2, y + cellW / 2, size, size);
    }
  }
}

function keyPressed() {
  if (key === "s" || key === "S") {
    saveCanvas("asa_halftone_v04", "png");
  }
}
