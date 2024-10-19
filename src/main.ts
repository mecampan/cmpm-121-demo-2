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

class MarkerLine {
  private points: { x: number, y: number }[] = [];
  private thickness: number; // Store thickness directly

  constructor(initialX: number, initialY: number, thickness: number) {
    this.points.push({ x: initialX, y: initialY });
    this.thickness = thickness; // Capture thickness at creation
  }

  drag(x: number, y: number): void {
    this.points.push({ x, y });
  }

  display(ctx: CanvasRenderingContext2D): void {
    ctx.lineWidth = this.thickness; // Use stored thickness
    ctx.beginPath();
    if (this.points.length > 1) {
      ctx.moveTo(this.points[0].x, this.points[0].y);
      for (let i = 1; i < this.points.length; i++) {
        ctx.lineTo(this.points[i].x, this.points[i].y);
      }
      ctx.stroke();
    } else {
      // Draw a single dot if only one point
      const { x, y } = this.points[0];
      ctx.arc(x, y, this.thickness / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

class markerStyle {
  private thickness: number;

  constructor() {
    this.thickness = 1;
  }

  setThickness(thickness: number) {
    this.thickness = thickness;
  }

  getThickness() {
    return this.thickness;
  }
}

let isDrawing = false;
let drawing: Array<MarkerLine> = [];
let redoStack: Array<MarkerLine> = [];
let currentLine: MarkerLine | null = null;
let markerOptions = new markerStyle(); // Instance is still needed to control new thickness

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  const currentThickness = markerOptions.getThickness(); // Capture current thickness
  currentLine = new MarkerLine(e.offsetX, e.offsetY, currentThickness);
  currentLine.display(pencil);
  redoStack.length = 0;
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing && currentLine) {
    currentLine.drag(e.offsetX, e.offsetY);
    currentLine.display(pencil);
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
  drawCanvas(pencil, drawing);
});

function clearCanvas(pencil: CanvasRenderingContext2D) {
  pencil.clearRect(0, 0, canvas.width, canvas.height);
}

function drawCanvas(pencil: CanvasRenderingContext2D, lines: Array<MarkerLine>) {
  clearCanvas(pencil);
  for (const line of lines) {
    line.display(pencil);
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
  toggleButton(thinMarkerButton, thickMarkerButton);
});

const thickMarkerButton = document.createElement("button");
thickMarkerButton.textContent = "Thick Marker";
thickMarkerButton.addEventListener("click", () => {
  setMarkerThick();
  toggleButton(thickMarkerButton, thinMarkerButton);
});

document.body.appendChild(clearButton);
document.body.appendChild(undoButton);
document.body.appendChild(redoButton);
document.body.appendChild(thinMarkerButton);
document.body.appendChild(thickMarkerButton);

function clearDrawing() {
  drawing.length = 0;
  redoStack.length = 0;
  canvas.dispatchEvent(new Event("drawing-changed"));
}

function undoLine() {
  if (drawing.length > 0) {
    const lastLine = drawing.pop();
    if (lastLine) {
      redoStack.push(lastLine);
      canvas.dispatchEvent(new Event("drawing-changed"));
    }
  }
}

function redoLine() {
  if (redoStack.length > 0) {
    const lastLine = redoStack.pop();
    if (lastLine) {
      drawing.push(lastLine);
      canvas.dispatchEvent(new Event("drawing-changed"));
    }
  }
}

function setMarkerThin() {
  markerOptions.setThickness(1); // Modify managed thickness
}

function setMarkerThick() {
  markerOptions.setThickness(5); // Modify managed thickness
}

function toggleButton(button: HTMLButtonElement, otherButton: HTMLButtonElement): void {
  button.classList.add('active');
  otherButton.classList.remove('active');
}