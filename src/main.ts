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
    ctx.strokeStyle = 'black'; // Set desired color for line
    ctx.fillStyle = 'black';   // Ensure fill uses the same color

    if (this.points.length > 1) {
      ctx.beginPath();
      ctx.moveTo(this.points[0].x, this.points[0].y);
      for (let i = 1; i < this.points.length; i++) {
        ctx.lineTo(this.points[i].x, this.points[i].y);
      }
      ctx.stroke();
    } else {
      const { x, y } = this.points[0];
      ctx.beginPath();
      ctx.arc(x, y, this.thickness / 2, 0, Math.PI * 2);
      ctx.fill(); // Use fill() to draw circles with fillStyle
    }
  }
}

class markerStyle {
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

  constructor(thickness: number) {
    this.x = 0;
    this.y = 0; 
    this.thickness = thickness;
  }

  updatePosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  updateThickness(thickness: number) {
    this.thickness = thickness;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.thickness / 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'gray'; // Example preview color
    ctx.stroke();
  }
}

let isDrawing = false;
let drawing: Array<MarkerLine> = [];
let redoStack: Array<MarkerLine> = [];
let currentLine: MarkerLine | null = null;
let markerOptions = new markerStyle();
let toolPreview: ToolPreview | null = null;
toolPreview = new ToolPreview(markerOptions.getThickness());

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  const currentThickness = markerOptions.getThickness();
  currentLine = new MarkerLine(e.offsetX, e.offsetY, currentThickness);
  redoStack.length = 0;
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing && currentLine) {
    currentLine.drag(e.offsetX, e.offsetY);
    drawCanvas(pencil, drawing);
    currentLine.display(pencil);
  } 
  
  else if (!isDrawing && toolPreview) {
    toolPreview.updatePosition(e.offsetX, e.offsetY);
    drawCanvas(pencil, drawing);
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
  markerOptions.setThickness(2);
  if (toolPreview) {
    toolPreview.updateThickness(2);
  }
}

function setMarkerThick() {
  markerOptions.setThickness(5);
  if (toolPreview) {
    toolPreview.updateThickness(5);
  }
}

function toggleButton(button: HTMLButtonElement, otherButton: HTMLButtonElement): void {
  button.classList.add('active');
  otherButton.classList.remove('active');
}