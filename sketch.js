// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let webglStatus = "";
let modelStatus = "正在載入模型...";
let isModelLoaded = false;
let bubbles = []; // 儲存所有水泡的陣列
let tipsIdx = [4, 8, 12, 16, 20]; // 指尖的編號

function preload() {
  // 初始化模型，並加入回呼函式確認載入狀態
  handPose = ml5.handPose({ flipped: true }, () => {
    modelStatus = "模型載入成功！";
    isModelLoaded = true;
    checkAndStartDetection();
  });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function checkAndStartDetection() {
  // 當模型載入完成，且相機物件已建立，才啟動辨識
  if (isModelLoaded && video) {
    handPose.detectStart(video, gotHands);
  }
}

function setup() {
  // 第一步驟：產生一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);
  
  // 檢查 WebGL 支援
  let canvas = document.createElement('canvas');
  let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (gl) {
    webglStatus = "WebGL 支援：正常";
  } else {
    webglStatus = "WebGL 支援：不支援 (辨識可能變慢或失敗)";
  }

  // 改用回呼函式確保相機啟動，並增加參數讓行動裝置相容性更好
  video = createCapture(VIDEO, { video: { facingMode: 'user' } }, (stream) => {
    console.log("Camera ready");
    checkAndStartDetection();
  });
  video.size(640, 480); // 強制設定基礎解析度，避免初始寬高為 0
  video.hide();
}

function draw() {
  // 畫布的背景顏色為 e7c6ff
  background('#e7c6ff');

  // 顯示狀態訊息 (左上角)
  fill(0);
  noStroke();
  textSize(16);
  textAlign(LEFT, TOP);
  text(`${webglStatus}\n${modelStatus}\n414730217羅紫芸`, 20, 20);

  // 計算顯示影像的寬高 (整個畫布寬高的 50%) 與置中位置
  let vW = width * 0.5;
  let vH = height * 0.5;
  let x = (width - vW) / 2;
  let y = (height - vH) / 2;

  // 步驟：畫面鏡像左右反轉
  push(); 
  translate(width, 0); // 將原點移至畫布右側
  scale(-1, 1);        // 水平反轉 X 軸

  // 擷取攝影機影像內容正常顯示在視窗中間
  // 檢查 video 是否已載入內容，避免畫出空影像
  if (video.width > 0) {
    image(video, x, y, vW, vH);
  }

  // Ensure at least one hand is detected
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 設定線條樣式
        strokeWeight(4);
        if (hand.handedness == "Left") {
          stroke(255, 0, 255); // 左手粉紅色線
          fill(255, 0, 255, 150); // 加入透明度
        } else {
          stroke(255, 255, 0); // 右手黃色線
          fill(255, 255, 0, 150); // 加入透明度
        }

        // 定義要連接的點編號組
        let fingerParts = [
          [0, 1, 2, 3, 4],    // 大拇指
          [5, 6, 7, 8],       // 食指
          [9, 10, 11, 12],    // 中指
          [13, 14, 15, 16],   // 無名指
          [17, 18, 19, 20]    // 小指
        ];

        // 畫手指連接線
        for (let part of fingerParts) {
          for (let i = 0; i < part.length - 1; i++) {
            let kp1 = hand.keypoints[part[i]];
            let kp2 = hand.keypoints[part[i+1]];
            
            let x1 = map(kp1.x, 0, video.width, x, x + vW);
            let y1 = map(kp1.y, 0, video.height, y, y + vH);
            let x2 = map(kp2.x, 0, video.width, x, x + vW);
            let y2 = map(kp2.y, 0, video.height, y, y + vH);
            
            line(x1, y1, x2, y2);
          }
        }

        // Loop through keypoints and draw circles
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];

          // 關鍵修正：將手部偵測點座標映射到畫布上置中後的影像範圍
          let drawX = map(keypoint.x, 0, video.width, x, x + vW);
          let drawY = map(keypoint.y, 0, video.height, y, y + vH);

          // 如果是指定的關鍵點 (4, 8, 12, 16, 20)，產生水泡
          if (tipsIdx.includes(i)) {
            if (frameCount % 5 === 0) { // 每 5 影格產生一個水泡，避免太多
              bubbles.push(new Bubble(drawX, drawY));
            }
          }

          noStroke();
          circle(drawX, drawY, 16);
        }
      }
    }
  }

  // 更新並繪製所有水泡
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    // 如果水泡到了破掉的位置（例如飄了 150 像素或出界），就移除它
    if (bubbles[i].isPopped()) {
      bubbles.splice(i, 1);
    }
  }

  pop(); // 結束鏡像反轉範圍，確保後續繪製（如文字）不被反轉
}

// 定義水泡類別
class Bubble {
  constructor(x, y) {
    this.x = x + random(-5, 5); // 稍微隨機偏移
    this.y = y;
    this.startY = y;
    this.size = random(10, 25);
    this.speed = random(1, 4);
    this.popDistance = random(100, 250); // 水泡破掉的上升距離
  }
  update() {
    this.y -= this.speed; // 往上飄
  }
  display() {
    stroke(255, 255, 255, 200);
    fill(255, 255, 255, 50); // 半透明白色的水泡
    circle(this.x, this.y, this.size);
  }
  isPopped() {
    return (this.startY - this.y > this.popDistance) || (this.y < -50);
  }
}

// 確保視窗調整大小時，畫布也會自動更新
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
