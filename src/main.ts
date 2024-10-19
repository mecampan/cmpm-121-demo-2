import "./style.css";

const APP_NAME = "Notepad+++";

const title = document.createElement("h1");
title.textContent = APP_NAME;
document.body.appendChild(title);

const canvas = document.createElement("canvas");
canvas.id = "canvas";
canvas.width = 256;
canvas.height = 256;
document.body.appendChild(canvas);
const pencil = canvas.getContext("2d");

if (!pencil) {
  throw new Error("Failed to get canvas context");
}

interface Drawable {
  display(ctx: CanvasRenderingContext2D): void;
}

class MarkerLine implements Drawable {
  private points: { x: number; y: number }[] = [];
  private thickness: number;

  constructor(initialX: number, initialY: number, thickness: number) {
    this.points.push({ x: initialX, y: initialY });
    this.thickness = thickness;
  }

  drag(x: number, y: number): void {
    this.points.push({ x, y });
  }

  display(ctx: CanvasRenderingContext2D): void {
    ctx.lineWidth = this.thickness;
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    if (this.points.length > 1) {
      ctx.moveTo(this.points[0].x, this.points[0].y);
      for (let i = 1; i < this.points.length; i++) {
        ctx.lineTo(this.points[i].x, this.points[i].y);
      }
      ctx.stroke();
    }
  }
}

class StickerTool implements Drawable {
  private x: number;
  private y: number;
  private sticker: string;

  constructor(sticker: string) {
    this.x = 0;
    this.y = 0;
    this.sticker = sticker;
  }

  updatePosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  display(ctx: CanvasRenderingContext2D): void {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.sticker, this.x, this.y);
  }
}

class MarkerStyle {
  private thickness: number;

  constructor() {
    this.thickness = 2;
  }

  setThickness(thickness: number) {
    this.thickness = thickness;
  }

  getThickness() {
    return this.thickness;
  }
}

class ToolPreview {
  private x: number;
  private y: number;
  private thickness: number;
  private sticker: string | null = null;

  constructor(thickness: number) {
    this.x = 0;
    this.y = 0;
    this.thickness = thickness;
  }

  updatePosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  updateThickness(thickness: number): void {
    this.thickness = thickness;
  }

  updateSticker(sticker: string | null): void {
    this.sticker = sticker;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.sticker) {
      ctx.font = '20px Arial';
      ctx.fillStyle = 'gray';
      ctx.fillText(this.sticker, this.x, this.y);
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.thickness / 2, 0, Math.PI * 2);
      ctx.strokeStyle = 'gray';
      ctx.stroke();
    }
  }
}

let isDrawing = false;
let drawing: Array<Drawable> = [];
let redoStack: Array<Drawable> = [];
let currentLine: MarkerLine | null = null;
let markerOptions = new MarkerStyle();
let toolPreview = new ToolPreview(markerOptions.getThickness());
let activeSticker: string | null = null;

canvas.addEventListener("mousedown", (e) => {
  if (activeSticker) {
    const sticker = new StickerTool(activeSticker);
    sticker.updatePosition(e.offsetX, e.offsetY);
    drawing.push(sticker);
    canvas.dispatchEvent(new Event("drawing-changed"));
  } else {
    isDrawing = true;
    const currentThickness = markerOptions.getThickness();
    currentLine = new MarkerLine(e.offsetX, e.offsetY, currentThickness);
    redoStack.length = 0;
  }
});

canvas.addEventListener("mousemove", (e) => {
  const { offsetX, offsetY } = e;
  if (isDrawing && currentLine) {
    currentLine.drag(offsetX, offsetY);
    drawCanvas(pencil);
    currentLine.display(pencil);
  } else {
    toolPreview.updatePosition(offsetX, offsetY);
    drawCanvas(pencil);
    toolPreview.draw(pencil);
  }
});

window.addEventListener("mouseup", () => {
  if (isDrawing && currentLine) {
    isDrawing = false;
    drawing.push(currentLine);
    currentLine = null;
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

canvas.addEventListener("drawing-changed", () => {
  drawCanvas(pencil);
});

function clearCanvas(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawCanvas(ctx: CanvasRenderingContext2D) {
  clearCanvas(ctx);
  for (const drawable of drawing) {
    drawable.display(ctx);
  }
}

const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
clearButton.addEventListener("click", () => {
  clearDrawing();
});

const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
undoButton.addEventListener("click", () => {
  undoLine();
});

const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
redoButton.addEventListener("click", () => {
  redoLine();
});

const thinMarkerButton = document.createElement("button");
thinMarkerButton.textContent = "Thin Marker";
thinMarkerButton.addEventListener("click", () => {
  setMarkerThin();
  activeSticker = null;
  toolPreview.updateSticker(null);
  toggleButton(thinMarkerButton, toggleButtons);
});

const thickMarkerButton = document.createElement("button");
thickMarkerButton.textContent = "Thick Marker";
thickMarkerButton.addEventListener("click", () => {
  setMarkerThick();
  activeSticker = null;
  toolPreview.updateSticker(null);
  toggleButton(thickMarkerButton, toggleButtons);
});

const smileStickerButton = document.createElement("button");
smileStickerButton.textContent = "🙂";
smileStickerButton.addEventListener("click", () => {
  activeSticker = "🙂";
  toolPreview.updateSticker(activeSticker);
  toggleButton(smileStickerButton, toggleButtons);
});

const starStickerButton = document.createElement("button");
starStickerButton.textContent = "⭐";
starStickerButton.addEventListener("click", () => {
  activeSticker = "⭐";
  toolPreview.updateSticker(activeSticker);
  toggleButton(starStickerButton, toggleButtons);
});

const catStickerButton = document.createElement("button");
catStickerButton.textContent = "🐈";
catStickerButton.addEventListener("click", () => {
  activeSticker = "🐈";
  toolPreview.updateSticker(activeSticker);
  toggleButton(catStickerButton, toggleButtons);
});

let toggleButtons: Array<HTMLButtonElement> = [];
toggleButtons.push(thinMarkerButton);
toggleButtons.push(thickMarkerButton);
toggleButtons.push(smileStickerButton);
toggleButtons.push(starStickerButton);
toggleButtons.push(catStickerButton);

document.body.appendChild(clearButton);
document.body.appendChild(undoButton);
document.body.appendChild(redoButton);
document.body.appendChild(thinMarkerButton);
document.body.appendChild(thickMarkerButton);
document.body.appendChild(smileStickerButton);
document.body.appendChild(starStickerButton);
document.body.appendChild(catStickerButton);

function clearDrawing() {
  drawing.length = 0;
  redoStack.length = 0;
  canvas.dispatchEvent(new Event("drawing-changed"));
}

function undoLine() {
  if (drawing.length > 0) {
    const lastDrawable = drawing.pop();
    if (lastDrawable) {
      redoStack.push(lastDrawable);
      canvas.dispatchEvent(new Event("drawing-changed"));
    }
  }
}

function redoLine() {
  if (redoStack.length > 0) {
    const lastDrawable = redoStack.pop();
    if (lastDrawable) {
      drawing.push(lastDrawable);
      canvas.dispatchEvent(new Event("drawing-changed"));
    }
  }
}

function setMarkerThin() {
  markerOptions.setThickness(2);
  toolPreview.updateThickness(2);
}

function setMarkerThick() {
  markerOptions.setThickness(5);
  toolPreview.updateThickness(5);
}

function toggleButton(button: HTMLButtonElement, buttonArray: Array<HTMLButtonElement>): void {
  buttonArray.forEach(element => {
    if (element.textContent == button.textContent) {
      element.classList.add('active');
    } else {
      element.classList.remove('active');
    }
  });
}