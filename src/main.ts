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

function initializeButtons() {
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "button-container";
  document.body.appendChild(buttonContainer);

  const actionButtonGroup = createActionButtons();
  const markerButtonGroup = createMarkerButtons();
  const stickerButtonGroup = createStickerButtons();
  const customStickerContainer = createCustomStickerButtonContainer();
  const exportButtonGroup = createExportButtons();

  buttonContainer.append(
    actionButtonGroup, 
    markerButtonGroup, 
    stickerButtonGroup, 
    customStickerContainer, 
    exportButtonGroup
  );
}

function createActionButtons(): HTMLDivElement {
  const actionButtonGroup = document.createElement("div");
  actionButtonGroup.className = "button-group";

  const actions = [
    { label: 'Clear', action: clearDrawing },
    { label: 'Undo', action: undoLine },
    { label: 'Redo', action: redoLine }
  ];

  actions.forEach(action => {
    const button = createButton(action.label, action.action);
    actionButtonGroup.appendChild(button);
  });

  return actionButtonGroup;
}

function createMarkerButtons(): HTMLDivElement {
  const markerButtonGroup = document.createElement("div");
  markerButtonGroup.className = "button-group";

  const markers = [
    { label: 'Thin Marker', thickness: 2 },
    { label: 'Thick Marker', thickness: 5 },
    { label: 'THICC Marker', thickness: 10 }
  ];

  markers.forEach(marker => {
    const button = createButton(marker.label, function() {
      setMarkerThickness(marker.thickness);
      toggleButton(this);
    });
    markerButtonGroup.appendChild(button);
  });

  return markerButtonGroup;
}

function createStickerButtons(): HTMLDivElement {
  const stickerButtonGroup = document.createElement("div");
  stickerButtonGroup.className = "button-group";

  stickers.forEach(sticker => {
    const button = createButton(sticker.emoji, function() {
      activeSticker = sticker.emoji;
      toolPreview.updateSticker(activeSticker);
      toggleButton(this);
    });
    stickerButtonGroup.appendChild(button);
  });

  return stickerButtonGroup;
}

function createCustomStickerButtonContainer(): HTMLDivElement {
  const customStickerContainer = document.createElement("div");
  customStickerContainer.className = "button-group";

  const customStickerButton = createButton("Custom Sticker", function() {
    addCustomSticker(customStickerContainer);
  });
  customStickerContainer.appendChild(customStickerButton);

  return customStickerContainer;
}

function createExportButtons(): HTMLDivElement {
  const exportButtonGroup = document.createElement("div");
  exportButtonGroup.className = "button-group";
  
  const exportButton = createButton('Export', exportPicture);
  exportButtonGroup.appendChild(exportButton);

  return exportButtonGroup;
}

function addCustomSticker(container: HTMLElement) {
  const customSticker = prompt("Enter a custom sticker");
  if (customSticker && customSticker.trim()) {
    const customButton = createButton(customSticker, function(this: HTMLButtonElement) {
      activeSticker = customSticker;
      toolPreview.updateSticker(activeSticker);
      toggleButton(this);
    });
    container.appendChild(customButton);
  }
}

function createButton(label: string, onClick: (this: HTMLButtonElement) => void): HTMLButtonElement {
  const button = document.createElement("button");
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

const stickers = [
  { emoji: '🙂', name: 'Smile' },
  { emoji: '⭐', name: 'Star' },
  { emoji: '🐈', name: 'Cat' }
];

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

function setMarkerThickness(thickness: number) {
  activeSticker = null;
  toolPreview.updateSticker(null);

  markerOptions.setThickness(thickness);
  toolPreview.updateThickness(thickness);  
}

function exportPicture() {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = 1024;
  exportCanvas.height = 1024;
  const exportContext = exportCanvas.getContext("2d");

  if (!exportContext) {
    console.log("Failed to get export canvas context");
    return;
  }

  exportContext.scale(4, 4);
  drawCanvas(exportContext);

  const dataURL = exportCanvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = "exported_drawing.png";
  link.click();
}

function toggleButton(activeButton: HTMLButtonElement): void {
  const buttonContainer = document.querySelector('.button-container');
  if (buttonContainer) {
    Array.from(buttonContainer.querySelectorAll('button')).forEach(button => {
      button.classList.toggle('active', button === activeButton);
    });
  }
}

initializeButtons();