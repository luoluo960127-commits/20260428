// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  // 第一步驟：產生一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function draw() {
  // 畫布的背景顏色為 e7c6ff
  background('#e7c6ff');

  // 計算顯示影像的寬高 (整個畫布寬高的 50%) 與置中位置
  let vW = width * 0.5;
  let vH = height * 0.5;
  let x = (width - vW) / 2;
  let y = (height - vH) / 2;

  // 擷取攝影機影像內容正常顯示在視窗中間
  image(video, x, y, vW, vH);

  // Ensure at least one hand is detected
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // Loop through keypoints and draw circles
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];

          // 關鍵修正：將手部偵測點座標映射到畫布上置中後的影像範圍
          let drawX = map(keypoint.x, 0, video.width, x, x + vW);
          let drawY = map(keypoint.y, 0, video.height, y, y + vH);

          // Color-code based on left or right hand
          if (hand.handedness == "Left") {
            fill(255, 0, 255);
          } else {
            fill(255, 255, 0);
          }

          noStroke();
          circle(drawX, drawY, 16);
        }
      }
    }
  }
}

// 確保視窗調整大小時，畫布也會自動更新
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
