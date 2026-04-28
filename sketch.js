let capture;

function setup() {
  // 產生一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);
  // 擷取攝影機影像內容
  capture = createCapture(VIDEO);
  // 隱藏原始的 HTML video 標籤，只在畫布上繪製
  capture.hide();
}

function draw() {
  // 畫布的背景顏色為 e7c6ff
  background('#e7c6ff');

  // 顯示的影像寬高為整個畫布寬高的 50%
  let vW = width * 0.5;
  let vH = height * 0.5;
  
  // 計算置中位置
  let x = (width - vW) / 2;
  let y = (height - vH) / 2;

  // 將影像繪製在畫布中間
  image(capture, x, y, vW, vH);
}

function windowResized() {
  // 視窗大小改變時，重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
}