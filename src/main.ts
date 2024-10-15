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

// When true, moving the mouse draws on the canvas
let isDrawing = false;
let x = 0;
let y = 0;

// Add the event listeners for mousedown, mousemove, and mouseup
canvas.addEventListener("mousedown", (e) => {
  x = e.offsetX;
  y = e.offsetY;
  isDrawing = true;
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    drawLine(pencil, x, y, e.offsetX, e.offsetY);
    x = e.offsetX;
    y = e.offsetY;
  }
});

window.addEventListener("mouseup", (e) => {
  if (isDrawing) {
    drawLine(pencil, x, y, e.offsetX, e.offsetY);
    x = 0;
    y = 0;
    isDrawing = false;
  }
});

function drawLine(pencil, x1, y1, x2, y2) {
  pencil.beginPath();
  pencil.strokeStyle = "black";
  pencil.lineWidth = 1;
  pencil.moveTo(x1, y1);
  pencil.lineTo(x2, y2);
  pencil.stroke();
  pencil.closePath();
}

// Clear Button
const clearButton = document.createElement("button");
clearButton.id = "button";
clearButton.textContent = "Clear";
document.body.appendChild(clearButton);

clearButton.addEventListener("click", () => {
    clearCanvas(pencil);
});

function clearCanvas(pencil) {
    pencil.clearRect(0, 0, canvas.width, canvas.height);
}
