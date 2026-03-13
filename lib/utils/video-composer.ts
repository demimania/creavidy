/**
 * video-composer.ts — Client-side video composition
 * Canvas + MediaRecorder ile sahne görselleri + seslendirme + captions → video
 */

export interface CaptionStyle {
  id: string
  color?: string
  bg?: string
  font?: string
  glow?: boolean
  uppercase?: boolean
  outline?: boolean
}

export interface ComposeScene {
  imageUrl: string
  audioUrl?: string
  script?: string
  duration: number // fallback süresi (saniye)
}

export interface ComposeParams {
  scenes: ComposeScene[]
  captionStyle?: CaptionStyle
  width?: number
  height?: number
  onProgress?: (pct: number) => void
}

export interface ComposeResult {
  blob: Blob
  url: string
  duration: number
}

// Fetch as blob to avoid CORS tainting canvas
async function fetchAsObjectUrl(url: string): Promise<string> {
  const res = await fetch(url)
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

async function loadAudioBuffer(ctx: AudioContext, url: string): Promise<AudioBuffer> {
  const res = await fetch(url)
  const arrayBuf = await res.arrayBuffer()
  return ctx.decodeAudioData(arrayBuf)
}

function drawImageCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const imgRatio = img.width / img.height
  const canvasRatio = w / h
  let sw: number, sh: number, sx: number, sy: number
  if (imgRatio > canvasRatio) {
    sh = img.height
    sw = sh * canvasRatio
    sx = (img.width - sw) / 2
    sy = 0
  } else {
    sw = img.width
    sh = sw / canvasRatio
    sx = 0
    sy = (img.height - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h)
}

function renderCaption(
  ctx: CanvasRenderingContext2D,
  text: string,
  style: CaptionStyle,
  w: number,
  h: number,
  activeWordIdx: number
) {
  if (!text || style.id === 'none') return

  const fontSize = Math.round(h * 0.045)
  const font = style.font || 'Arial'
  const displayText = style.uppercase ? text.toUpperCase() : text
  const words = displayText.split(' ')

  // Show a chunk of ~5 words around the active word
  const chunkSize = 5
  const chunkStart = Math.max(0, Math.floor(activeWordIdx / chunkSize) * chunkSize)
  const chunk = words.slice(chunkStart, chunkStart + chunkSize).join(' ')

  ctx.save()
  ctx.font = `bold ${fontSize}px "${font}", Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const y = h * 0.85
  const textMetrics = ctx.measureText(chunk)
  const textWidth = textMetrics.width

  // Background bar
  if (style.bg) {
    const padX = fontSize * 0.6
    const padY = fontSize * 0.4
    ctx.fillStyle = style.bg
    const rx = w / 2 - textWidth / 2 - padX
    const ry = y - fontSize / 2 - padY
    const rw = textWidth + padX * 2
    const rh = fontSize + padY * 2
    const radius = 6
    ctx.beginPath()
    ctx.moveTo(rx + radius, ry)
    ctx.lineTo(rx + rw - radius, ry)
    ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + radius)
    ctx.lineTo(rx + rw, ry + rh - radius)
    ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - radius, ry + rh)
    ctx.lineTo(rx + radius, ry + rh)
    ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - radius)
    ctx.lineTo(rx, ry + radius)
    ctx.quadraticCurveTo(rx, ry, rx + radius, ry)
    ctx.closePath()
    ctx.fill()
  }

  // Glow / neon effect
  if (style.glow && style.color) {
    ctx.shadowColor = style.color
    ctx.shadowBlur = 20
  }

  // Outline / stroke
  if (style.outline) {
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = fontSize * 0.15
    ctx.lineJoin = 'round'
    ctx.strokeText(chunk, w / 2, y)
  }

  // Draw word-by-word with active highlight
  const wordChunks = chunk.split(' ')
  let xOffset = w / 2 - textWidth / 2

  for (let wi = 0; wi < wordChunks.length; wi++) {
    const word = wordChunks[wi]
    const wordWidth = ctx.measureText(word + ' ').width
    const globalIdx = chunkStart + wi
    const isActive = globalIdx === activeWordIdx

    if (isActive && style.id === 'karaoke') {
      // Karaoke highlight: bright color for active word
      ctx.fillStyle = '#ff0000'
    } else {
      ctx.fillStyle = style.color || '#ffffff'
    }

    ctx.textAlign = 'left'
    ctx.fillText(word, xOffset, y)
    xOffset += wordWidth
  }

  ctx.restore()
}

export async function composeVideo(params: ComposeParams): Promise<ComposeResult> {
  const {
    scenes,
    captionStyle = { id: 'none' },
    width = 1280,
    height = 720,
    onProgress,
  } = params

  // 1. Preload all assets
  onProgress?.(5)

  const imageUrls: string[] = []
  const images: HTMLImageElement[] = []
  const audioCtx = new AudioContext()
  const audioBuffers: (AudioBuffer | null)[] = []

  for (let i = 0; i < scenes.length; i++) {
    const s = scenes[i]
    // Fetch images as blob URLs to avoid CORS
    const localUrl = await fetchAsObjectUrl(s.imageUrl)
    imageUrls.push(localUrl)
    images.push(await loadImage(localUrl))

    if (s.audioUrl) {
      try {
        audioBuffers.push(await loadAudioBuffer(audioCtx, s.audioUrl))
      } catch {
        audioBuffers.push(null)
      }
    } else {
      audioBuffers.push(null)
    }

    onProgress?.(5 + Math.round((i / scenes.length) * 20))
  }

  // 2. Calculate durations — use audio duration if available, else fallback
  const durations = scenes.map((s, i) => {
    const ab = audioBuffers[i]
    return ab ? ab.duration : s.duration
  })
  const totalDuration = durations.reduce((a, b) => a + b, 0)

  // 3. Create canvas and streams
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  const canvasStream = canvas.captureStream(30)
  const dest = audioCtx.createMediaStreamDestination()

  // Schedule all audio buffers at correct offsets
  let offset = 0
  for (let i = 0; i < scenes.length; i++) {
    const ab = audioBuffers[i]
    if (ab) {
      const src = audioCtx.createBufferSource()
      src.buffer = ab
      src.connect(dest)
      src.start(audioCtx.currentTime + offset)
    }
    offset += durations[i]
  }

  // 4. Merge video + audio tracks
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...dest.stream.getAudioTracks(),
  ])

  // 5. Setup MediaRecorder
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
    ? 'video/webm;codecs=vp9,opus'
    : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
      ? 'video/webm;codecs=vp8,opus'
      : 'video/webm'

  const recorder = new MediaRecorder(combinedStream, { mimeType, videoBitsPerSecond: 4_000_000 })
  const chunks: Blob[] = []
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }

  onProgress?.(30)

  // 6. Start recording and render frames
  return new Promise<ComposeResult>((resolve, reject) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType })
      const url = URL.createObjectURL(blob)

      // Cleanup
      imageUrls.forEach(u => URL.revokeObjectURL(u))
      audioCtx.close()

      resolve({ blob, url, duration: totalDuration })
    }

    recorder.onerror = (e) => reject(e)
    recorder.start(100) // collect data every 100ms

    const startTime = performance.now()
    let currentSceneIdx = 0
    let sceneStartTime = 0

    function renderFrame() {
      const elapsed = (performance.now() - startTime) / 1000

      // Find current scene
      let accum = 0
      for (let i = 0; i < durations.length; i++) {
        if (elapsed < accum + durations[i]) {
          currentSceneIdx = i
          sceneStartTime = accum
          break
        }
        accum += durations[i]
      }

      if (elapsed >= totalDuration) {
        // Final frame
        const lastImg = images[images.length - 1]
        if (lastImg) drawImageCover(ctx, lastImg, width, height)
        setTimeout(() => recorder.stop(), 200)
        onProgress?.(100)
        return
      }

      // Draw current scene image
      const img = images[currentSceneIdx]
      if (img) {
        drawImageCover(ctx, img, width, height)
      } else {
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, width, height)
      }

      // Draw captions
      const scene = scenes[currentSceneIdx]
      if (scene.script && captionStyle.id !== 'none') {
        const sceneElapsed = elapsed - sceneStartTime
        const sceneDur = durations[currentSceneIdx]
        const words = scene.script.split(' ')
        const wordsPerSec = words.length / sceneDur
        const activeWordIdx = Math.min(Math.floor(sceneElapsed * wordsPerSec), words.length - 1)
        const displayScript = captionStyle.uppercase ? scene.script.toUpperCase() : scene.script
        renderCaption(ctx, displayScript, captionStyle, width, height, activeWordIdx)
      }

      // Progress
      const pct = 30 + Math.round((elapsed / totalDuration) * 65)
      onProgress?.(Math.min(pct, 95))

      requestAnimationFrame(renderFrame)
    }

    requestAnimationFrame(renderFrame)
  })
}
