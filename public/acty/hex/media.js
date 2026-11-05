// The shader receives two complete scene textures. Frame media here, before
// its UV warp / RGB separation, so all seven original includes remain intact.
export function createMediaSlot() {
  let source, fit, scratch, context, videoCallback;
  let dirty = true, frameStamp, lastUrl;
  let textureWidth = 0, textureHeight = 0;

  function markDirty() { dirty = true; }
  function watchVideo() {
    videoCallback = source.requestVideoFrameCallback(() => {
      dirty = true;
      watchVideo();
    });
  }
  function reset() {
    if (videoCallback != null) source.cancelVideoFrameCallback(videoCallback);
    videoCallback = undefined;
    source?.removeEventListener?.('seeked', markDirty);
    source = null;
    // Release the intermediate bitmap and the decoder reference on replacement.
    if (scratch) scratch.width = scratch.height = 1;
    scratch = context = null;
    lastUrl = frameStamp = undefined;
    dirty = true;
    textureWidth = textureHeight = 0;
  }
  function set(media, nextFit) {
    if (media === source && nextFit === fit) { markDirty(); return; }
    reset();
    source = media;
    fit = nextFit;
    if (source?.localName === 'video') {
      source.addEventListener('seeked', markDirty);
      if (source.requestVideoFrameCallback && source.cancelVideoFrameCallback) watchVideo();
    }
  }
  function prepare(width, height, screenWidth, screenHeight, maxSize) {
    let cropWidth = width, cropHeight = height;
    let scale = Math.min(1, maxSize / width, maxSize / height);
    if (fit === 'cover') {
      const aspect = screenWidth / screenHeight;
      cropWidth = Math.min(width, height * aspect);
      cropHeight = Math.min(height, width / aspect);
      scale = Math.min(1, screenWidth / cropWidth, screenHeight / cropHeight,
        maxSize / cropWidth, maxSize / cropHeight);
    }
    const w = Math.max(1, Math.round(cropWidth * scale));
    const h = Math.max(1, Math.round(cropHeight * scale));
    if (w === width && h === height && Math.abs(cropWidth - width) < 0.01
        && Math.abs(cropHeight - height) < 0.01) return {pixels: source, w, h};
    if (!scratch) {
      scratch = document.createElement('canvas');
      context = scratch.getContext('2d', {alpha: true});
      if (!context) throw new Error('Unable to prepare a scene texture.');
      context.globalCompositeOperation = 'copy';
    }
    if (scratch.width !== w || scratch.height !== h) {
      scratch.width = w;
      scratch.height = h;
      context.globalCompositeOperation = 'copy';
    }
    context.drawImage(source, (width - cropWidth) / 2, (height - cropHeight) / 2,
      cropWidth, cropHeight, 0, 0, w, h);
    return {pixels: scratch, w, h};
  }
  function upload(gl, texture, unit, maxSize) {
    if (!source) return false;
    const isVideo = source.localName === 'video';
    const isImage = source.localName === 'img';
    if ((isVideo && source.readyState < 2) || (isImage && !source.complete)) return false;
    const width = isVideo ? source.videoWidth : isImage ? source.naturalWidth : source.width;
    const height = isVideo ? source.videoHeight : isImage ? source.naturalHeight : source.height;
    if (!(width > 0 && height > 0)) return false;
    if (source.getContext) dirty = true; // A new scene render can reuse the same canvas.
    if (source.currentSrc !== lastUrl) { lastUrl = source.currentSrc; dirty = true; }
    if (isVideo && videoCallback == null) {
      const stamp = source.getVideoPlaybackQuality?.().totalVideoFrames ?? source.currentTime;
      if (stamp !== frameStamp) { frameStamp = stamp; dirty = true; }
    }
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    if (!dirty) return true;
    const {pixels, w, h} = prepare(width, height, gl.drawingBufferWidth, gl.drawingBufferHeight, maxSize);
    if (textureWidth !== w || textureHeight !== h) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      textureWidth = w;
      textureHeight = h;
    } else {
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    }
    dirty = false;
    return true;
  }
  return {
    set, upload, reset, markDirty,
    invalidateTexture() { textureWidth = textureHeight = 0; markDirty(); }
  };
}
