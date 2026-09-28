let img;

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
  let MAX_DOT = 0.9;
  let FEATHER = 0.06;
  let faceZones = [[0.25, 0.05, 0.75, 1.0]];

  let cellW = width / FACE_RES;
  let cols = FACE_RES;
  let rows = floor(height / cellW);
  let bgProbability = sq(BG_RES / FACE_RES);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let x = col * cellW;
      let y = row * cellW;
      let faceWeight = 0;

      for (let zone of faceZones) {
        let dx = Math.min(x - width * zone[0], width * zone[2] - x);
        let dy = Math.min(y - height * zone[1], height * zone[3] - y);
        let distance = Math.min(dx, dy);
        let weight = constrain(distance / (width * FEATHER), 0, 1);
        weight = weight * weight * (3 - 2 * weight);
        faceWeight = Math.max(faceWeight, weight);
      }

      let drawProbability = map(faceWeight, 0, 1, bgProbability, 1.0);
      let noiseValue = noise(col * 0.65, row * 0.65);
      if (noiseValue > drawProbability) continue;

      let sampleX = map(col, 0, cols, 0, img.width);
      let sampleY = map(row, 0, rows, 0, img.height);
      let c = img.get(floor(sampleX), floor(sampleY));
      let b = brightness(c);
      b = map(b, 15 * faceWeight, 240 - 15 * faceWeight, 0, 255, true);

      let maxDotSize = cellW * MAX_DOT * map(faceWeight, 0, 1, 0.7, 1.0);
      let size = map(b, 0, 255, maxDotSize, cellW * 0.05);

      fill(b < 80 ? lerpColor(color(30), color(10), faceWeight) : c);
      noStroke();
      ellipse(x + cellW / 2, y + cellW / 2, size, size);
    }
  }
}

function keyPressed() {
  if (key === "s" || key === "S") {
    saveCanvas("asa_halftone_v05", "png");
  }
}
