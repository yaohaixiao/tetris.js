const renderImage = (ctx, img, x, y, size) => {
  if (!img.complete) {
    return;
  }

  ctx.save();
  ctx.drawImage(img, x, y, size, size);
  ctx.restore();
};

export default renderImage;
