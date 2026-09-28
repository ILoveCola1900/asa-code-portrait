// ==================== 配置区 ====================
let img;
let particles = [];
let backdrop;
let particleLayer;
let highResLayer;
let highResReady = false;
let aggregationStartFrame = 0;

// 0=散乱漂浮，1=聚合中，2=聚合完成
let state = 0;
const RESOLUTION = 280;
const BRIGHT_CUTOFF = 240;
const HIGH_RES = 500;
const AGGREGATION_TIMEOUT_FRAMES = 720;

// ==================== 粒子类 ====================
class Particle {
  constructor(x, y, tx, ty, size, r, g, b, ease, delay) {
    this.x = x;
    this.y = y;
    this.tx = tx;
    this.ty = ty;
    this.size = size;
    this.r = r;
    this.g = g;
    this.b = b;
    this.ease = ease;
    this.delay = delay;
    this.atTarget = false;
  }

  update() {
    if (state === 0) {
      this.x += random(-0.5, 0.5);
      this.y += random(-0.5, 0.5);

      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
      return;
    }

    if (state !== 1 || this.atTarget) return;

    if (this.delay > 0) {
      this.delay--;
      return;
    }

    this.x = lerp(this.x, this.tx, this.ease);
    this.y = lerp(this.y, this.ty, this.ease);

    if (
      Math.abs(this.x - this.tx) < 0.25 &&
      Math.abs(this.y - this.ty) < 0.25
    ) {
      this.x = this.tx;
      this.y = this.ty;
      this.atTarget = true;
    }
  }

  display() {
    let radius = Math.max(0.5, this.size / 2);
    let radiusSquared = radius * radius;
    let minX = Math.max(0, Math.floor(this.x - radius));
    let maxX = Math.min(width - 1, Math.ceil(this.x + radius));
    let minY = Math.max(0, Math.floor(this.y - radius));
    let maxY = Math.min(height - 1, Math.ceil(this.y + radius));
    let pixels = particleLayer.pixels;

    for (let y = minY; y <= maxY; y++) {
      let dy = y + 0.5 - this.y;

      for (let x = minX; x <= maxX; x++) {
        let dx = x + 0.5 - this.x;
        if (dx * dx + dy * dy > radiusSquared) continue;

        let index = (y * width + x) * 4;
        pixels[index] = this.r;
        pixels[index + 1] = this.g;
        pixels[index + 2] = this.b;
        pixels[index + 3] = 255;
      }
    }
  }
}

// ==================== 核心代码 ====================
function preload() {
  img = loadImage("asa.jpg");
}

function setup() {
  let scale = 800 / img.width;
  createCanvas(800, img.height * scale);
  pixelDensity(2);
  frameRate(60);

  backdrop = createGraphics(width, height);
  backdrop.pixelDensity(1);
  drawBackdrop();
  particleLayer = createImage(width, height);
  particleLayer.loadPixels();
  highResLayer = createGraphics(width, height);
  highResLayer.pixelDensity(2);
  generateParticles();

  console.log("Particle count: " + particles.length);
}

function draw() {
  background(240);
  image(backdrop, 0, 0, width, height);
  noStroke();

  if (state === 2) {
    if (!highResReady) {
      renderHighResStatic();
    }
    image(highResLayer, 0, 0, width, height);
    return;
  }

  let allSettled = true;
  particleLayer.pixels.fill(0);

  for (let particle of particles) {
    particle.update();
    particle.display();

    if (state === 1 && !particle.atTarget) {
      allSettled = false;
    }
  }

  particleLayer.updatePixels();
  image(particleLayer, 0, 0, width, height);

  if (
    state === 1 &&
    (allSettled ||
      frameCount - aggregationStartFrame > AGGREGATION_TIMEOUT_FRAMES)
  ) {
    state = 2;
    renderHighResStatic();
    image(highResLayer, 0, 0, width, height);
  }
}

function drawBackdrop() {
  drawGradient(backdrop);
}

function drawGradient(target) {
  let topColor = color(228, 142, 105);
  let bottomColor = color(247, 210, 184);

  target.noStroke();
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    target.stroke(lerpColor(topColor, bottomColor, inter));
    target.line(0, y, width, y);
  }
}

function renderHighResStatic() {
  highResLayer.background(240);
  drawGradient(highResLayer);
  highResLayer.noStroke();

  img.loadPixels();

  let cellW = width / HIGH_RES;
  let cols = HIGH_RES;
  let rows = floor(height / cellW);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let sampleX = map(col, 0, cols, 0, img.width);
      let sampleY = map(row, 0, rows, 0, img.height);
      let c = img.get(floor(sampleX), floor(sampleY));
      let b = brightness(c);
      let size = map(b, 0, 255, cellW * 0.9, cellW * 0.08);

      highResLayer.fill(b < 80 ? 20 : c);
      highResLayer.ellipse(
        col * cellW + cellW / 2,
        row * cellW + cellW / 2,
        size,
        size
      );
    }
  }

  highResReady = true;
}

function generateParticles() {
  img.loadPixels();
  particles = [];

  let cellW = width / RESOLUTION;
  let cols = RESOLUTION;
  let rows = floor(height / cellW);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let sampleX = map(col, 0, cols, 0, img.width);
      let sampleY = map(row, 0, rows, 0, img.height);
      let c = img.get(floor(sampleX), floor(sampleY));
      let b = brightness(c);

      // 跳过过亮背景，避免生成大量低信息量粒子
      if (b > BRIGHT_CUTOFF) continue;

      let tx = col * cellW + cellW / 2;
      let ty = row * cellW + cellW / 2;
      let size = map(b, 0, 255, cellW * 0.9, cellW * 0.12);
      let r = b < 80 ? 30 : red(c);
      let g = b < 80 ? 30 : green(c);
      let blueValue = b < 80 ? 30 : blue(c);

      particles.push(
        new Particle(
          random(width),
          random(height),
          tx,
          ty,
          size,
          r,
          g,
          blueValue,
          random(0.02, 0.08),
          floor(random(61))
        )
      );
    }
  }
}

function mousePressed() {
  if (state === 0) {
    state = 1;
    aggregationStartFrame = frameCount;
  } else if (state === 2) {
    state = 0;
    highResReady = false;
    highResLayer.clear();

    for (let particle of particles) {
      particle.x = random(width);
      particle.y = random(height);
      particle.atTarget = false;
      particle.delay = floor(random(61));
    }
  }
}

function keyPressed() {
  if (key === "s" || key === "S") {
    saveCanvas(state === 2 ? "asa_halftone_hd" : "asa_particles", "png");
  }
}
