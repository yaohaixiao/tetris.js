import COLORS from '../constants/colors.js';
import Canvas from './canvas.js';

const drawClock = () => {
  const time = new Date();
  const h = time.getHours();
  const m = time.getMinutes();
  const s = time.getSeconds();

  const { TEAL, RGBA_TEAL, ORANGE } = COLORS;
  const { gameBoard, gameBoardContext } = Canvas;
  const { width, height } = gameBoard;
  const centerX = width / 2;
  const centerY = height / 2.2;
  const radius = Math.floor(width * 0.25);

  gameBoardContext.save();
  gameBoardContext.translate(centerX, centerY);
  gameBoardContext.lineCap = 'round';

  gameBoardContext.strokeStyle = TEAL;
  gameBoardContext.fillStyle = TEAL;

  /* ======== 绘制内圈（青色）======== */
  gameBoardContext.save();
  gameBoardContext.beginPath();
  gameBoardContext.arc(0, 0, radius, 0, Math.PI * 2);
  gameBoardContext.lineWidth = Math.floor(width * 0.064);
  gameBoardContext.stroke();
  gameBoardContext.restore();

  /* ======== 绘制表盘（青色半透明）======== */
  gameBoardContext.save();
  gameBoardContext.beginPath();
  gameBoardContext.arc(0, 0, radius, 0, Math.PI * 2);
  // 半透明：rgba(青色, 透明度0.1~0.5 都好看)
  gameBoardContext.fillStyle = RGBA_TEAL;
  gameBoardContext.fill();
  gameBoardContext.restore();

  /* ======== 绘制12个刻度（青色：小圆点样式 + 内缩间距）======== */
  const dotRadius = Math.floor(width * 0.016); // 圆点大小
  const dotMargin = Math.floor(width * 0.08); // 圆点离开内圈的间距（可自行调整）
  const dotDistance = radius - dotMargin; // 圆点到中心的距离

  for (let i = 0; i < 12; i++) {
    gameBoardContext.save();
    gameBoardContext.rotate((i * Math.PI) / 6);
    // 画实心小圆点
    gameBoardContext.beginPath();
    gameBoardContext.arc(0, -dotDistance, dotRadius, 0, Math.PI * 2);
    gameBoardContext.fill();
    gameBoardContext.restore();
  }

  /* ======== 绘制时针（青色）======== */
  const hAng = ((h % 12) + m / 60 + s / 3600) * ((2 * Math.PI) / 12);

  gameBoardContext.save();
  gameBoardContext.rotate(hAng);
  gameBoardContext.lineWidth = 5;
  gameBoardContext.beginPath();
  gameBoardContext.moveTo(0, 0);
  gameBoardContext.lineTo(0, -radius * 0.4);
  gameBoardContext.stroke();
  gameBoardContext.restore();

  /* ======== 绘制分针（青色）======== */
  const mAng = (m + s / 60) * ((2 * Math.PI) / 60);

  gameBoardContext.save();
  gameBoardContext.rotate(mAng);
  gameBoardContext.lineWidth = 4;
  gameBoardContext.beginPath();
  gameBoardContext.moveTo(0, 0);
  gameBoardContext.lineTo(0, -radius * 0.65);
  gameBoardContext.stroke();
  gameBoardContext.restore();

  /* ======== 绘制秒针（橙色）======== */
  const sAng = s * ((2 * Math.PI) / 60);
  gameBoardContext.save();
  gameBoardContext.rotate(sAng);
  gameBoardContext.strokeStyle = ORANGE;
  gameBoardContext.lineWidth = 2;
  gameBoardContext.beginPath();
  gameBoardContext.moveTo(0, 0);
  gameBoardContext.lineTo(0, -radius * 0.75);
  gameBoardContext.stroke();
  gameBoardContext.restore();

  /* ======== 绘制中心圆点（青色）======== */
  const pointRadius = Math.floor(width * 0.014);
  gameBoardContext.save();
  gameBoardContext.fillStyle = ORANGE;
  gameBoardContext.beginPath();
  gameBoardContext.arc(0, 0, pointRadius, 0, Math.PI * 2);
  gameBoardContext.fill();
  gameBoardContext.restore();

  gameBoardContext.restore();
};

export default drawClock;
