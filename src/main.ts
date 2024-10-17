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

let isDrawing = false;
let drawing: Array<Array<{ x: number, y: number }>> = [];
let currentLine: Array<{ x: number, y: number }> = [];
let redoStack: Array<Array<{ x: number, y: number }>> = [];

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  currentLine = [{ x: e.offsetX, y: e.offsetY }];
  drawing.push(currentLine);
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    const point = { x: e.offsetX, y: e.offsetY };
    currentLine.push(point);
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

window.addEventListener("mouseup", () => {
  if (isDrawing) {
    isDrawing = false;
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

canvas.addEventListener("drawing-changed", () => {
  drawCanvas(pencil, drawing);
});

function clearCanvas(pencil: CanvasRenderingContext2D) {
  pencil.clearRect(0, 0, canvas.width, canvas.height);
}

function drawCanvas(pencil: CanvasRenderingContext2D, lines: Array<Array<{ x: number, y: number }>>) {
  clearCanvas(pencil);
  for (const line of lines) {
    if (line.length > 0) {
      pencil.beginPath();
      pencil.moveTo(line[0].x, line[0].y);
      for (const point of line) {
        pencil.lineTo(point.x, point.y);
      }
      pencil.stroke();
    }
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
  if(drawing.length > 0) {
    const lastLine = drawing.pop();
    if (lastLine) {
      redoStack.push(lastLine);
      canvas.dispatchEvent(new Event("drawing-changed"));
    }
  }
}

function redoLine() {
  if(redoStack.length > 0) {
    const lastLine = redoStack.pop();
    if (lastLine) {
      drawing.push(lastLine);
      canvas.dispatchEvent(new Event("drawing-changed"));
    }
  }
}