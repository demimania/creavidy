/**
 * Client-side image processing utilities using Canvas API.
 * All operations are free (no AI credits), runs in-browser.
 */

// ── Helper: load image URL to HTMLImageElement ────────────────────────────────
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

// ── Helper: canvas → data URL ────────────────────────────────────────────────
function canvasToDataURL(canvas: HTMLCanvasElement, quality = 0.92): string {
  return canvas.toDataURL('image/png', quality)
}

// ── Levels (brightness/contrast/gamma) ───────────────────────────────────────
export async function applyLevels(
  imageUrl: string,
  { brightness = 0, contrast = 0, gamma = 1 }: { brightness?: number; contrast?: number; gamma?: number }
): Promise<string> {
  const img = await loadImage(imageUrl)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  const brightnessFactor = 1 + brightness / 100
  const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast))

  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      let v = data[i + c]
      // Brightness
      v = v * brightnessFactor
      // Contrast
      v = contrastFactor * (v - 128) + 128
      // Gamma
      v = 255 * Math.pow(v / 255, 1 / gamma)
      data[i + c] = Math.min(255, Math.max(0, Math.round(v)))
    }
  }

  ctx.putImageData(imageData, 0, 0)
  return canvasToDataURL(canvas)
}

// ── Crop ──────────────────────────────────────────────────────────────────────
export async function cropImage(
  imageUrl: string,
  { x, y, width, height }: { x: number; y: number; width: number; height: number }
): Promise<string> {
  const img = await loadImage(imageUrl)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, x, y, width, height, 0, 0, width, height)
  return canvasToDataURL(canvas)
}

// ── Resize ────────────────────────────────────────────────────────────────────
export async function resizeImage(
  imageUrl: string,
  { width, height, mode = 'stretch' }: { width: number; height: number; mode?: 'stretch' | 'contain' | 'cover' }
): Promise<string> {
  const img = await loadImage(imageUrl)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  if (mode === 'stretch') {
    ctx.drawImage(img, 0, 0, width, height)
  } else {
    const ratio = Math.min(width / img.width, height / img.height)
    const sw = img.width * ratio
    const sh = img.height * ratio
    const sx = (width - sw) / 2
    const sy = (height - sh) / 2
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(img, sx, sy, sw, sh)
  }

  return canvasToDataURL(canvas)
}

// ── Blur ──────────────────────────────────────────────────────────────────────
export async function blurImage(imageUrl: string, { radius = 4 }: { radius?: number }): Promise<string> {
  const img = await loadImage(imageUrl)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')!
  ctx.filter = `blur(${radius}px)`
  ctx.drawImage(img, 0, 0)
  return canvasToDataURL(canvas)
}

// ── Invert ────────────────────────────────────────────────────────────────────
export async function invertImage(imageUrl: string): Promise<string> {
  const img = await loadImage(imageUrl)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    data[i]     = 255 - data[i]
    data[i + 1] = 255 - data[i + 1]
    data[i + 2] = 255 - data[i + 2]
  }
  ctx.putImageData(imageData, 0, 0)
  return canvasToDataURL(canvas)
}

// ── Channels ──────────────────────────────────────────────────────────────────
export async function isolateChannel(
  imageUrl: string,
  { channel }: { channel: 'r' | 'g' | 'b' | 'a' | 'rgb' }
): Promise<string> {
  const img = await loadImage(imageUrl)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    if (channel === 'r') { data[i + 1] = 0; data[i + 2] = 0 }
    else if (channel === 'g') { data[i] = 0; data[i + 2] = 0 }
    else if (channel === 'b') { data[i] = 0; data[i + 1] = 0 }
    else if (channel === 'a') {
      const alpha = data[i + 3]
      data[i] = alpha; data[i + 1] = alpha; data[i + 2] = alpha; data[i + 3] = 255
    }
    // 'rgb' = keep all
  }

  ctx.putImageData(imageData, 0, 0)
  return canvasToDataURL(canvas)
}

// ── Compositor (multi-layer blend) ────────────────────────────────────────────
export async function compositeImages(
  imageUrls: string[],
  { blendMode = 'source-over', opacity = 1 }: { blendMode?: GlobalCompositeOperation; opacity?: number }
): Promise<string> {
  if (imageUrls.length === 0) throw new Error('En az 1 görsel gerekli')
  const images = await Promise.all(imageUrls.map(loadImage))
  const canvas = document.createElement('canvas')
  canvas.width = images[0].width
  canvas.height = images[0].height
  const ctx = canvas.getContext('2d')!

  images.forEach((img, i) => {
    ctx.globalAlpha = i === 0 ? 1 : opacity
    ctx.globalCompositeOperation = i === 0 ? 'source-over' : blendMode
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  })

  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'
  return canvasToDataURL(canvas)
}

// ── Extract Video Frame ────────────────────────────────────────────────────────
export function extractVideoFrame(videoUrl: string, timestampSec: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'
    video.src = videoUrl
    video.currentTime = timestampSec

    video.addEventListener('seeked', () => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(video, 0, 0)
      resolve(canvasToDataURL(canvas))
    }, { once: true })

    video.addEventListener('error', reject, { once: true })
    video.load()
  })
}

// ── Matte Grow/Shrink (dilate/erode mask) ─────────────────────────────────────
export async function matteGrowShrink(
  maskUrl: string,
  { amount = 5 }: { amount?: number } // positive = grow, negative = shrink
): Promise<string> {
  const img = await loadImage(maskUrl)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')!

  if (amount > 0) {
    ctx.filter = `blur(${amount}px)`
    ctx.drawImage(img, 0, 0)
    // Threshold to binary
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    for (let i = 0; i < imageData.data.length; i += 4) {
      const v = imageData.data[i] > 30 ? 255 : 0
      imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = v
    }
    ctx.putImageData(imageData, 0, 0)
  } else {
    // Shrink via negative blur then threshold
    ctx.drawImage(img, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    for (let i = 0; i < imageData.data.length; i += 4) {
      const v = imageData.data[i] > (128 + Math.abs(amount) * 2) ? 255 : 0
      imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = v
    }
    ctx.putImageData(imageData, 0, 0)
  }

  return canvasToDataURL(canvas)
}

// ── Merge Alpha (apply mask to image) ────────────────────────────────────────
export async function mergeAlpha(imageUrl: string, maskUrl: string): Promise<string> {
  const [img, mask] = await Promise.all([loadImage(imageUrl), loadImage(maskUrl)])
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')!

  // Draw image
  ctx.drawImage(img, 0, 0)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

  // Draw mask to temporary canvas
  const maskCanvas = document.createElement('canvas')
  maskCanvas.width = img.width
  maskCanvas.height = img.height
  const maskCtx = maskCanvas.getContext('2d')!
  maskCtx.drawImage(mask, 0, 0, img.width, img.height)
  const maskData = maskCtx.getImageData(0, 0, img.width, img.height)

  // Apply mask as alpha
  for (let i = 0; i < imageData.data.length; i += 4) {
    imageData.data[i + 3] = maskData.data[i] // use mask red channel as alpha
  }

  ctx.putImageData(imageData, 0, 0)
  return canvasToDataURL(canvas)
}
