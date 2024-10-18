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

  constructor(initialX: number, initialY: number) {
    this.points.push({ x: initialX, y: initialY });
  }

  drag(x: number, y: number): void {
    this.points.push({ x, y });
  }

  display(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    if (this.points.length === 1) {
      const { x, y } = this.points[0];
      ctx.arc(x, y, 1, 0, Math.PI * 2); // Draw a dot if it's the start
      ctx.fill();
    } else if (this.points.length > 1) {
      ctx.moveTo(this.points[0].x, this.points[0].y);
      for (let i = 1; i < this.points.length; i++) {
        ctx.lineTo(this.points[i].x, this.points[i].y);
      }
      ctx.stroke();
    }
  }
}

let isDrawing = false;
let drawing: Array<MarkerLine> = [];
let redoStack: Array<MarkerLine> = [];
let currentLine: MarkerLine | null = null;

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  currentLine = new MarkerLine(e.offsetX, e.offsetY);
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

document.body.appendChild(clearButton);
document.body.appendChild(undoButton);
document.body.appendChild(redoButton);

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