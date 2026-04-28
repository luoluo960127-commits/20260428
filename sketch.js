let capture;
let handPose;
let hands = [];

function preload() {
  // 載入 handPose 模型
  handPose = ml5.handPose();
}

function setup() {
  // 產生一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);
  // 擷取攝影機影像內容
  capture = createCapture(VIDEO);
  // 隱藏原始的 HTML video 標籤，只在畫布上繪製
  capture.hide();

  // 開始偵測影像中的手部
  handPose.detectStart(capture, gotHands);
}

function gotHands(results) {
  // 將偵測結果存入 hands 變數
  hands = results;
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

  // 繪製手部辨識點
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    for (let j = 0; j < hand.keypoints.length; j++) {
      let keypoint = hand.keypoints[j];
      
      // 因為影像被縮放成 50% 且位移到中間，所以座標需要重新映射
      let drawX = map(keypoint.x, 0, capture.width, x, x + vW);
      let drawY = map(keypoint.y, 0, capture.height, y, y + vH);

      fill(0, 255, 0);
      noStroke();
      circle(drawX, drawY, 8);
    }
  }
}

function windowResized() {
  // 視窗大小改變時，重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
}