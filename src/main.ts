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
let drawingIndex = 0;

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  currentLine = [{ x: e.offsetX, y: e.offsetY }];
  drawing.splice(drawingIndex);
  drawing.push(currentLine);
  drawingIndex = drawing.length;
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    const point = { x: e.offsetX, y: e.offsetY };
    currentLine.push(point);
    drawCanvas(pencil, drawing.slice(0, drawingIndex));
  }
});

window.addEventListener("mouseup", () => {
  if (isDrawing) {
    isDrawing = false;
    drawingIndex = drawing.length;
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

canvas.addEventListener("drawing-changed", () => {
  drawCanvas(pencil, drawing.slice(0, drawingIndex));
});

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

function clearCanvas(pencil: CanvasRenderingContext2D) {
  pencil.clearRect(0, 0, canvas.width, canvas.height);
}

const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
clearButton.addEventListener("click", () => {
  clearDrawing(pencil);
});

const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
undoButton.addEventListener("click", () => {
  undoLine(pencil);
});

const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
redoButton.addEventListener("click", () => {
  redoLine(pencil);
});

document.body.appendChild(clearButton);
document.body.appendChild(undoButton);
document.body.appendChild(redoButton);

function clearDrawing(pencil: CanvasRenderingContext2D) {
  clearCanvas(pencil);
  drawing.length = 0;
  drawingIndex = 0;
}

function undoLine(pencil: CanvasRenderingContext2D) {
  if (drawingIndex > 0) {
    drawingIndex--;
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
}

function redoLine(pencil: CanvasRenderingContext2D) {
  if (drawingIndex < drawing.length) {
    drawingIndex++;
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
}