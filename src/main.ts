import "./style.css";

const APP_NAME = "Notepad+++";
//const app = document.querySelector<HTMLDivElement>("#app")!;

//document.title = APP_NAME;
//app.innerHTML = APP_NAME;

const title = document.createElement("h1");
title.textContent = APP_NAME;
document.body.appendChild(title);

const canvas = document.createElement("canvas");
canvas.id = "canvas";
canvas.width = 256;
canvas.height = 256;
document.body.appendChild(canvas);