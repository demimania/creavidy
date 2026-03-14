// ============================================================================
// Node Definitions — 220+ node (Creavidy tam katalog)
// status: 'active' = fal.ai ile çalışıyor | 'beta' = test | 'soon' = yakında
// ============================================================================

export type NodeDataType = 'text' | 'image' | 'video' | 'audio' | 'mask' | 'number' | 'boolean' | 'array' | '3d' | 'any'
export type NodeStatus = 'active' | 'beta' | 'soon'

export interface PortDef {
  name: string
  type: NodeDataType
  required?: boolean
  multiple?: boolean
}

export interface NodeDefinition {
  id: string
  label: string
  description: string
  icon: string
  category: NodeCategory
  subcategory: string
  inputs: PortDef[]
  outputs: PortDef[]
  provider?: string
  creditCost?: number | string
  status: NodeStatus
  isNew?: boolean
}

export type NodeCategory =
  | 'production'
  | 'toolbox-editing'
  | 'toolbox-matte'
  | 'text'
  | 'iterators'
  | 'helpers'
  | 'datatypes'
  | 'image-t2i'
  | 'image-vector'
  | 'image-edit'
  | 'image-i2i'
  | 'image-enhance'
  | 'video-gen'
  | 'video-v2v'
  | 'video-lipsync'
  | 'video-enhance'
  | '3d'
  | 'community'
  | 'ai-avatar'

export interface CategoryMeta {
  id: NodeCategory
  label: string
  icon: string
  color: string
}

export const CATEGORY_META: CategoryMeta[] = [
  { id: 'production',      label: 'Production',           icon: '🎬', color: '#f59e0b' },
  { id: 'text',            label: 'Text Tools',           icon: '📝', color: '#a78bfa' },
  { id: 'datatypes',       label: 'Data Types',           icon: '📦', color: '#94a3b8' },
  { id: 'iterators',       label: 'Iterators',            icon: '🔁', color: '#f97316' },
  { id: 'helpers',         label: 'Helpers',              icon: '⚡', color: '#84cc16' },
  { id: 'toolbox-editing', label: 'Toolbox — Editing',    icon: '🔧', color: '#6366f1' },
  { id: 'toolbox-matte',   label: 'Toolbox — Matte',      icon: '🎭', color: '#8b5cf6' },
  { id: 'image-t2i',       label: 'Image — Text to Image',icon: '🖼️',  color: '#FFE744' },
  { id: 'image-vector',    label: 'Image — Vector',       icon: '〽️', color: '#fbbf24' },
  { id: 'image-edit',      label: 'Image — Edit',         icon: '✏️',  color: '#f43f5e' },
  { id: 'image-i2i',       label: 'Image — From Image',   icon: '🔄', color: '#fb923c' },
  { id: 'image-enhance',   label: 'Image — Enhance',      icon: '✨', color: '#10b981' },
  { id: 'video-gen',       label: 'Video — Generate',     icon: '🎥', color: '#D1FE17' },
  { id: 'video-v2v',       label: 'Video — Edit',         icon: '🎞️',  color: '#0ea5e9' },
  { id: 'video-lipsync',   label: 'Video — Lip Sync',     icon: '👄', color: '#ec4899' },
  { id: 'video-enhance',   label: 'Video — Enhance',      icon: '🔭', color: '#06b6d4' },
  { id: '3d',              label: '3D Models',            icon: '🧊', color: '#06b6d4' },
  { id: 'community',       label: 'Community / Custom',   icon: '🌐', color: '#64748b' },
  { id: 'ai-avatar',      label: 'AI Avatar',            icon: '🧑‍💻', color: '#ec4899' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const img  = (n: string): PortDef => ({ name: n, type: 'image' })
const imgR = (n: string): PortDef => ({ name: n, type: 'image', required: true })
const imgM = (n: string): PortDef => ({ name: n, type: 'image', multiple: true })
const txt  = (n: string): PortDef => ({ name: n, type: 'text' })
const txtR = (n: string): PortDef => ({ name: n, type: 'text', required: true })
const vid  = (n: string): PortDef => ({ name: n, type: 'video' })
const vidR = (n: string): PortDef => ({ name: n, type: 'video', required: true })
const aud  = (n: string): PortDef => ({ name: n, type: 'audio' })
const msk  = (n: string): PortDef => ({ name: n, type: 'mask' })
const mskR = (n: string): PortDef => ({ name: n, type: 'mask', required: true })
const num  = (n: string): PortDef => ({ name: n, type: 'number' })
const arr  = (n: string): PortDef => ({ name: n, type: 'array' })
const tdD  = (n: string): PortDef => ({ name: n, type: '3d' })
const any  = (n: string): PortDef => ({ name: n, type: 'any' })

// ─── NODE CATALOG ─────────────────────────────────────────────────────────────
export const NODE_DEFINITIONS: NodeDefinition[] = [

  // ═══ PRODUCTION — Creavidy Video Studio ═══════════════════════════════════
  {
    id: 'videoBriefNode', label: 'Video Brief', icon: '🎬',
    description: 'Videonun hikayesini, stilini ve seslendiricisini ayarla',
    category: 'production', subcategory: 'brief',
    inputs: [], outputs: [txt('Brief')], status: 'active',
  },
  {
    id: 'filmStripNode', label: 'Film Strip', icon: '🎞️',
    description: 'Sahne bazlı video üretim şeridi — görsel + ses + altyazı',
    category: 'production', subcategory: 'strip',
    inputs: [txt('Brief')], outputs: [vid('Video')], status: 'active',
  },

  // ═══ TEXT TOOLS (6) ═══════════════════════════════════════════════════════
  {
    id: 'promptNode', label: 'Prompt', icon: '📄',
    description: 'Metin girişi; Variable desteği; Display: Value/Source modu',
    category: 'text', subcategory: 'input',
    inputs: [any('Variable')], outputs: [txt('Text')], status: 'soon',
  },
  {
    id: 'promptConcatNode', label: 'Prompt Concatenator', icon: '🔗',
    description: 'Birden fazla prompt birleştirme',
    category: 'text', subcategory: 'utility',
    inputs: [{ name: 'Text', type: 'text', multiple: true }], outputs: [txt('Text')], status: 'soon',
  },
  {
    id: 'promptEnhancerNode', label: 'Prompt Enhancer', icon: '✨',
    description: 'AI destekli prompt iyileştirme ve zenginleştirme',
    category: 'text', subcategory: 'enhance',
    inputs: [txtR('Prompt')], outputs: [txt('Text')], creditCost: 1, status: 'soon',
  },
  {
    id: 'llmNode', label: 'Run Any LLM', icon: '🤖',
    description: 'GPT-4o, Gemini, Claude — serbest LLM çağrısı; çoklu image input',
    category: 'text', subcategory: 'generate',
    inputs: [txt('Prompt'), img('Image')], outputs: [txt('Text')],
    creditCost: 3, status: 'active',
  },
  {
    id: 'imageDescriberNode', label: 'Image Describer', icon: '👁️',
    description: 'Görseli metin olarak açıkla (vision model)',
    category: 'text', subcategory: 'vision',
    inputs: [imgR('Image')], outputs: [txt('Text')], creditCost: 2, status: 'soon',
  },
  {
    id: 'videoDescriberNode', label: 'Video Describer', icon: '🎬',
    description: 'Videoyu metin olarak açıkla',
    category: 'text', subcategory: 'vision',
    inputs: [vidR('Video')], outputs: [txt('Text')], creditCost: 3, status: 'soon',
  },
  // Script is a Creavidy alias for Prompt/LLM
  {
    id: 'scriptNode', label: 'Script', icon: '📃',
    description: 'AI ile senaryo veya metin üret',
    category: 'text', subcategory: 'generate',
    inputs: [], outputs: [txt('Text')], creditCost: 2, status: 'active',
  },
  {
    id: 'systemPromptNode', label: 'System Prompt', icon: '⚙️',
    description: 'LLM için sistem talimatı tanımla',
    category: 'text', subcategory: 'utility',
    inputs: [], outputs: [txt('System')], status: 'active',
  },
  // Variable system nodes
  {
    id: 'setVariableNode', label: 'Set Variable', icon: '📌',
    description: '{variable} syntax ile değişken ata — tüm node\'larda kullanılabilir',
    category: 'helpers', subcategory: 'variable',
    inputs: [any('Input')], outputs: [txt('Value')], status: 'active', isNew: true,
  },
  {
    id: 'getVariableNode', label: 'Get Variable', icon: '🔍',
    description: 'Daha önce set edilmiş {variable} değerini oku ve pipeline\'a aktar',
    category: 'helpers', subcategory: 'variable',
    inputs: [], outputs: [txt('Value')], status: 'active', isNew: true,
  },
  {
    id: 'textFormatterNode', label: 'Text Formatter', icon: '✏️',
    description: 'Şablon metin birleştirme — {a} + {b} → output; {variable} highlight',
    category: 'helpers', subcategory: 'variable',
    inputs: [{ name: 'Text', type: 'text', multiple: true }], outputs: [txt('Text')], status: 'active', isNew: true,
  },

  // ═══ DATATYPES (6) ════════════════════════════════════════════════════════
  {
    id: 'numberNode', label: 'Number', icon: '🔢',
    description: 'Sayısal değer girişi (int/float)',
    category: 'datatypes', subcategory: 'value',
    inputs: [], outputs: [num('Value')], status: 'soon',
  },
  {
    id: 'textValueNode', label: 'Text', icon: '📝',
    description: 'Serbest metin değer girişi',
    category: 'datatypes', subcategory: 'value',
    inputs: [], outputs: [txt('Value')], status: 'soon',
  },
  {
    id: 'toggleNode', label: 'Toggle', icon: '🔘',
    description: 'Boolean açık/kapalı (true/false)',
    category: 'datatypes', subcategory: 'value',
    inputs: [], outputs: [{ name: 'Value', type: 'boolean' }], status: 'soon',
  },
  {
    id: 'listSelectorNode', label: 'List Selector', icon: '📋',
    description: 'Dropdown listeden seçim — kamera açısı, lens, shot size vb.',
    category: 'datatypes', subcategory: 'value',
    inputs: [], outputs: [txt('Value')], status: 'soon',
  },
  {
    id: 'seedNode', label: 'Seed', icon: '🎲',
    description: 'Deterministic üretim için seed değeri',
    category: 'datatypes', subcategory: 'value',
    inputs: [], outputs: [num('Seed')], status: 'soon',
  },
  {
    id: 'arrayNode', label: 'Array', icon: '📦',
    description: 'Dizi / liste veri yapısı',
    category: 'datatypes', subcategory: 'value',
    inputs: [], outputs: [arr('Array')], status: 'active',
  },

  // ═══ ITERATORS (3) ════════════════════════════════════════════════════════
  {
    id: 'textIteratorNode', label: 'Text Iterator', icon: '🔁',
    description: 'Metin listesini ayırıcıya göre bölerek döngüyle işle',
    category: 'iterators', subcategory: 'loop',
    inputs: [txtR('Text')], outputs: [txt('Item')], status: 'active', isNew: true,
  },
  {
    id: 'imageIteratorNode', label: 'Image Iterator', icon: '🖼️',
    description: 'Prompt listesinden paralel/sıralı N görsel üretir',
    category: 'iterators', subcategory: 'loop',
    inputs: [txt('Prompts')], outputs: [img('Images')], status: 'active', isNew: true,
  },
  {
    id: 'taskManagerNode', label: 'Task Manager', icon: '✅',
    description: 'Pipeline görevlerini listeler, iptal/yeniden çalıştır',
    category: 'iterators', subcategory: 'loop',
    inputs: [], outputs: [], status: 'active', isNew: true,
  },
  {
    id: 'videoIteratorNode', label: 'Video Iterator', icon: '🎬',
    description: 'Video seti üzerinde tek tek döngü',
    category: 'iterators', subcategory: 'loop',
    inputs: [vidR('Videos')], outputs: [vid('Video')], status: 'soon',
  },

  // ═══ HELPERS (12) ═════════════════════════════════════════════════════════
  {
    id: 'importNode', label: 'Import', icon: '📥',
    description: 'Dosya yükleme (image/video/3D/audio)',
    category: 'helpers', subcategory: 'io',
    inputs: [], outputs: [any('File')], status: 'soon',
  },
  {
    id: 'exportNode', label: 'Export', icon: '📤',
    description: 'Dosyayı dışa aktar / indir',
    category: 'helpers', subcategory: 'io',
    inputs: [any('Input')], outputs: [], status: 'active',
  },
  {
    id: 'previewNode', label: 'Preview', icon: '👁️',
    description: 'Ön izleme penceresi',
    category: 'helpers', subcategory: 'io',
    inputs: [any('Input')], outputs: [], status: 'soon',
  },
  {
    id: 'importModelNode', label: 'Import Model', icon: '🤖',
    description: 'Custom/community model yükleme',
    category: 'helpers', subcategory: 'model',
    inputs: [], outputs: [any('Model')], status: 'soon',
  },
  {
    id: 'importLoraNode', label: 'Import LoRA', icon: '🧩',
    description: 'Tek LoRA adapter yükleme',
    category: 'helpers', subcategory: 'model',
    inputs: [], outputs: [any('LoRA')], status: 'soon',
  },
  {
    id: 'importMultiLoraNode', label: 'Import Multiple LoRAs', icon: '🧩',
    description: 'Çoklu LoRA adapter yükleme',
    category: 'helpers', subcategory: 'model',
    inputs: [], outputs: [any('LoRAs')], status: 'soon',
  },
  {
    id: 'routerNode', label: 'Router', icon: '🔀',
    description: 'Veriyi birden fazla hedefe dağıt (1 input → N output)',
    category: 'helpers', subcategory: 'flow',
    inputs: [any('Input', )], outputs: [{ name: 'Output', type: 'any', multiple: true }], status: 'active',
  },
  {
    id: 'outputNode', label: 'Output', icon: '🎯',
    description: 'Final çıktı tanımlama',
    category: 'helpers', subcategory: 'io',
    inputs: [any('Input')], outputs: [], status: 'soon',
  },
  {
    id: 'captionNode', label: 'Caption', icon: '💬',
    description: 'Videoya altyazı ekle',
    category: 'helpers', subcategory: 'overlay',
    inputs: [vidR('Video')], outputs: [vid('Video')], status: 'active',
  },
  {
    id: 'stickyNoteNode', label: 'Sticky Note', icon: '📌',
    description: 'Canvas üzerine açıklama notu',
    category: 'helpers', subcategory: 'annotation',
    inputs: [], outputs: [], status: 'soon',
  },
  {
    id: 'depthAnythingV2Node', label: 'Depth Anything V2', icon: '📊',
    description: 'Derinlik haritası çıkarma',
    category: 'helpers', subcategory: 'analysis',
    inputs: [imgR('Image')], outputs: [img('Depth')], status: 'soon', isNew: true,
  },
  {
    id: 'compareNode', label: 'Compare', icon: '⚖️',
    description: 'İki görseli yan yana karşılaştır',
    category: 'helpers', subcategory: 'utility',
    inputs: [imgR('Image A'), imgR('Image B')], outputs: [img('Result')], status: 'soon', isNew: true,
  },
  {
    id: 'klingElementNode', label: 'Kling Element', icon: '🎭',
    description: 'Kling element bazlı işleme',
    category: 'helpers', subcategory: 'utility',
    inputs: [imgR('Image')], outputs: [img('Image')], provider: 'Kuaishou', status: 'soon', isNew: true,
  },

  // ═══ TOOLBOX — EDITING (10) ═══════════════════════════════════════════════
  {
    id: 'levelsNode', label: 'Levels', icon: '🎚️',
    description: 'Brightness, contrast, gamma seviye ayarları',
    category: 'toolbox-editing', subcategory: 'color',
    inputs: [imgR('Image')], outputs: [img('Image')], status: 'active',
  },
  {
    id: 'compositorNode', label: 'Compositor', icon: '🗂️',
    description: 'Çoklu katman birleştirme (layer compositing)',
    category: 'toolbox-editing', subcategory: 'composite',
    inputs: [{ name: 'Images', type: 'image', multiple: true, required: true }], outputs: [img('Image')], status: 'active',
  },
  {
    id: 'painterNode', label: 'Painter', icon: '🎨',
    description: 'El ile çizim/boyama aracı (brush tool)',
    category: 'toolbox-editing', subcategory: 'draw',
    inputs: [img('Image')], outputs: [img('Image')], status: 'soon',
  },
  {
    id: 'cropNode', label: 'Crop', icon: '✂️',
    description: 'Görsel kırpma (bounding box ile)',
    category: 'toolbox-editing', subcategory: 'transform',
    inputs: [imgR('Image')], outputs: [img('Image')], status: 'active',
  },
  {
    id: 'resizeNode', label: 'Resize', icon: '⤢',
    description: 'Boyut değiştirme (piksel/yüzde bazlı)',
    category: 'toolbox-editing', subcategory: 'transform',
    inputs: [imgR('Image')], outputs: [img('Image')], status: 'active',
  },
  {
    id: 'blurNode', label: 'Blur', icon: '💧',
    description: 'Gaussian bulanıklaştırma',
    category: 'toolbox-editing', subcategory: 'filter',
    inputs: [imgR('Image')], outputs: [img('Image')], status: 'active',
  },
  {
    id: 'invertNode', label: 'Invert', icon: '🔄',
    description: 'Renk ters çevirme (negatif)',
    category: 'toolbox-editing', subcategory: 'filter',
    inputs: [imgR('Image')], outputs: [img('Image')], status: 'active',
  },
  {
    id: 'channelsNode', label: 'Channels', icon: '🌈',
    description: 'RGB/Alpha kanal ayırma ve birleştirme',
    category: 'toolbox-editing', subcategory: 'color',
    inputs: [imgR('Image')], outputs: [img('Image')], status: 'active',
  },
  {
    id: 'extractVideoFrameNode', label: 'Extract Video Frame', icon: '📸',
    description: 'Videodan belirli kare(ler) çıkarma',
    category: 'toolbox-editing', subcategory: 'video',
    inputs: [vidR('Video')], outputs: [img('Frame')], status: 'active',
  },
  {
    id: 'videoConcatenatorNode', label: 'Video Concatenator', icon: '➕',
    description: 'Birden fazla videoyu birleştirme',
    category: 'toolbox-editing', subcategory: 'video',
    inputs: [{ name: 'Videos', type: 'video', multiple: true, required: true }], outputs: [vid('Video')], status: 'soon',
  },

  // ═══ TOOLBOX — MATTE (6) ══════════════════════════════════════════════════
  {
    id: 'maskExtractorNode', label: 'Mask Extractor', icon: '🔍',
    description: 'Otomatik nesne/konu maske çıkarma',
    category: 'toolbox-matte', subcategory: 'mask',
    inputs: [imgR('Image')], outputs: [msk('Mask')], status: 'active',
  },
  {
    id: 'maskByTextNode', label: 'Mask by Text', icon: '🔤',
    description: 'Metin prompt ile maske oluşturma (SAM tabanlı)',
    category: 'toolbox-matte', subcategory: 'mask',
    inputs: [imgR('Image'), txtR('Text')], outputs: [msk('Mask')], status: 'active',
  },
  {
    id: 'matteGrowShrinkNode', label: 'Matte Grow/Shrink', icon: '⬡',
    description: 'Maske kenarlarını genişletme veya daraltma',
    category: 'toolbox-matte', subcategory: 'mask',
    inputs: [mskR('Mask')], outputs: [msk('Mask')], status: 'active',
  },
  {
    id: 'mergeAlphaNode', label: 'Merge Alpha', icon: '🔀',
    description: 'Alfa kanallarını birleştirme',
    category: 'toolbox-matte', subcategory: 'composite',
    inputs: [imgR('Image'), mskR('Mask')], outputs: [img('Image')], status: 'active',
  },
  {
    id: 'videoMatteNode', label: 'Video Matte', icon: '🎬',
    description: 'Video için otomatik maske çıkarma',
    category: 'toolbox-matte', subcategory: 'mask',
    inputs: [vidR('Video')], outputs: [vid('Matte')], status: 'active',
  },
  {
    id: 'videoMaskByTextNode', label: 'Video Mask by Text', icon: '🎥',
    description: 'Video için metin tabanlı maske',
    category: 'toolbox-matte', subcategory: 'mask',
    inputs: [vidR('Video'), txtR('Text')], outputs: [vid('Matte')], status: 'soon',
  },

  // ═══ IMAGE — TEXT TO IMAGE (23) ═══════════════════════════════════════════
  {
    id: 'flux2DevLoraNode', label: 'Flux 2 Dev LoRA', icon: '⚡',
    description: 'Flux 2 Dev ile LoRA destekli görsel üretim',
    category: 'image-t2i', subcategory: 'flux',
    inputs: [txtR('Prompt'), any('LoRA')], outputs: [img('Image')],
    provider: 'Black Forest Labs', creditCost: 8, status: 'soon',
  },
  {
    id: 'flux2ProNode', label: 'Flux 2 Pro', icon: '💎',
    description: 'Flux 2 Pro — yüksek kaliteli görsel üretim',
    category: 'image-t2i', subcategory: 'flux',
    inputs: [txtR('Prompt')], outputs: [img('Image')],
    provider: 'Black Forest Labs', creditCost: 15, status: 'active',
  },
  {
    id: 'flux2FlexNode', label: 'Flux 2 Flex', icon: '🌀',
    description: 'Flux 2 Flex — esnek görsel üretim',
    category: 'image-t2i', subcategory: 'flux',
    inputs: [txtR('Prompt')], outputs: [img('Image')],
    provider: 'Black Forest Labs', creditCost: 12, status: 'soon',
  },
  {
    id: 'reveNode', label: 'Reve', icon: '🌙',
    description: 'Reve AI görsel üretim modeli',
    category: 'image-t2i', subcategory: 'other',
    inputs: [txtR('Prompt')], outputs: [img('Image')],
    provider: 'Reve AI', creditCost: 10, status: 'soon',
  },
  {
    id: 'higgsFieldImageNode', label: 'Higgsfield Image', icon: '🔬',
    description: 'Higgsfield AI görsel üretim',
    category: 'image-t2i', subcategory: 'other',
    inputs: [txtR('Prompt')], outputs: [img('Image')],
    provider: 'Higgsfield', creditCost: 10, status: 'soon',
  },
  {
    id: 'gptImage15Node', label: 'GPT Image 1.5', icon: '🟢',
    description: "OpenAI'ın yeni görsel modeli",
    category: 'image-t2i', subcategory: 'openai',
    inputs: [txtR('Prompt')], outputs: [img('Image')],
    provider: 'OpenAI', creditCost: 15, status: 'soon', isNew: true,
  },
  {
    id: 'imagen4Node', label: 'Imagen 4', icon: '🌈',
    description: "Google'un en yeni görsel modeli",
    category: 'image-t2i', subcategory: 'google',
    inputs: [txtR('Prompt')], outputs: [img('Image')],
    provider: 'Google', creditCost: 12, status: 'soon', isNew: true,
  },
  {
    id: 'imagen3Node', label: 'Imagen 3', icon: '🌅',
    description: 'Google Imagen 3 görsel üretim',
    category: 'image-t2i', subcategory: 'google',
    inputs: [txtR('Prompt')], outputs: [img('Image')],
    provider: 'Google', creditCost: 10, status: 'soon',
  },
  {
    id: 'imagen3FastNode', label: 'Imagen 3 Fast', icon: '⚡',
    description: 'Google Imagen 3 Fast — hızlı üretim',
    category: 'image-t2i', subcategory: 'google',
    inputs: [txtR('Prompt')], outputs: [img('Image')],
    provider: 'Google', creditCost: 6, status: 'soon',
  },
  {
    id: 'fluxPro11UltraNode', label: 'Flux Pro 1.1 Ultra', icon: '💫',
    description: 'Flux Pro 1.1 Ultra — en yüksek kalite',
    category: 'image-t2i', subcategory: 'flux',
    inputs: [txtR('Prompt')], outputs: [img('Image')],
    provider: 'Black Forest Labs', creditCost: 18, status: 'soon',
  },
  {
    id: 'fluxPro11Node', label: 'Flux Pro 1.1', icon: '🔷',
    description: 'Flux Pro 1.1 görsel üretim',
    category: 'image-t2i', subcategory: 'flux',
    inputs: [txtR('Prompt')], outputs: [img('Image')],
    provider: 'Black Forest Labs', creditCost: 12, status: 'active',
  },
  {
    id: 'fluxFastNode', label: 'Flux Fast (Schnell)', icon: '⚡',
    description: 'Flux Schnell — hızlı ve ucuz görsel üretim',
    category: 'image-t2i', subcategory: 'flux',
    inputs: [txtR('Prompt')], outputs: [img('Image')],
    provider: 'Black Forest Labs', creditCost: 5, status: 'active',
  },
  {
    id: 'fluxDevLoraNode', label: 'Flux Dev LoRA', icon: '🧩',
    description: 'Flux Dev ile özel LoRA kullanımı',
    category: 'image-t2i', subcategory: 'flux',
    inputs: [txtR('Prompt'), any('LoRA')], outputs: [img('Image')],
    provider: 'Black Forest Labs', creditCost: 8, status: 'soon',
  },
  {
    id: 'recraftV4Node', label: 'Recraft V4', icon: '🎨',
    description: 'Recraft V4 — profesyonel görsel & illüstrasyon',
    category: 'image-t2i', subcategory: 'recraft',
    inputs: [txtR('Prompt')], outputs: [img('Image')],
    provider: 'Recraft', creditCost: 12, status: 'active', isNew: true,
  },
  {
    id: 'recraftV3Node', label: 'Recraft V3', icon: '🖌️',
    description: 'Recraft V3 görsel üretim',
    category: 'image-t2i', subcategory: 'recraft',
    inputs: [txtR('Prompt')], outputs: [img('Image')],
    provider: 'Recraft', creditCost: 10, status: 'soon',
  },
  {
    id: 'mysticNode', label: 'Mystic', icon: '🔮',
    description: 'Mystic AI görsel üretim modeli',
    category: 'image-t2i', subcategory: 'other',
    inputs: [txtR('Prompt')], outputs: [img('Image')],
    provider: 'Mystic', creditCost: 10, status: 'soon',
  },
  {
    id: 'ideogramV3Node', label: 'Ideogram V3', icon: '🔠',
    description: 'Metin render desteğiyle görsel üretim',
    category: 'image-t2i', subcategory: 'ideogram',
    inputs: [txtR('Prompt')], outputs: [img('Image')],
    provider: 'Ideogram', creditCost: 10, status: 'active',
  },
  {
    id: 'ideogramV3CharNode', label: 'Ideogram V3 Character', icon: '🧑',
    description: 'Tutarlı karakter üretimi — Ideogram V3',
    category: 'image-t2i', subcategory: 'ideogram',
    inputs: [txtR('Prompt')], outputs: [img('Image')],
    provider: 'Ideogram', creditCost: 12, status: 'soon',
  },
  {
    id: 'sd35Node', label: 'Stable Diffusion 3.5', icon: '🌀',
    description: "Stability AI'ın SD 3.5 modeli",
    category: 'image-t2i', subcategory: 'stability',
    inputs: [txtR('Prompt')], outputs: [img('Image')],
    provider: 'Stability AI', creditCost: 8, status: 'active',
  },
  {
    id: 'minimaxImage01Node', label: 'Minimax Image 01', icon: '🌀',
    description: 'Minimax Image 01 görsel üretim',
    category: 'image-t2i', subcategory: 'minimax',
    inputs: [txtR('Prompt')], outputs: [img('Image')],
    provider: 'Minimax', creditCost: 8, status: 'soon',
  },
  {
    id: 'briaNode', label: 'Bria', icon: '🦋',
    description: 'Bria AI ticari görsel üretim',
    category: 'image-t2i', subcategory: 'other',
    inputs: [txtR('Prompt')], outputs: [img('Image')],
    provider: 'Bria AI', creditCost: 8, status: 'soon',
  },
  {
    id: 'lumaPhotonNode', label: 'Luma Photon', icon: '💡',
    description: 'Luma AI Photon görsel üretim',
    category: 'image-t2i', subcategory: 'luma',
    inputs: [txtR('Prompt')], outputs: [img('Image')],
    provider: 'Luma AI', creditCost: 8, status: 'soon',
  },
  {
    id: 'nvidiaStaticNode', label: 'Nvidia Sana', icon: '🖥️',
    description: 'Nvidia Sana hızlı görsel üretim',
    category: 'image-t2i', subcategory: 'other',
    inputs: [txtR('Prompt')], outputs: [img('Image')],
    provider: 'Nvidia', creditCost: 5, status: 'soon',
  },
  {
    id: 'seedream5LiteNode', label: 'Seedream 5.0 Lite', icon: '🌱',
    description: 'Seedream 5.0 Lite — hızlı ve kaliteli',
    category: 'image-t2i', subcategory: 'other',
    inputs: [txtR('Prompt')], outputs: [img('Image')],
    provider: 'ByteDance', creditCost: 6, status: 'active',
  },

  // ═══ IMAGE — VECTOR GRAPHICS (4) ══════════════════════════════════════════
  {
    id: 'recraftVectorizerNode', label: 'Recraft Vectorizer', icon: '〽️',
    description: 'Görseli SVG vektöre dönüştür',
    category: 'image-vector', subcategory: 'vector',
    inputs: [imgR('Image')], outputs: [img('SVG')],
    provider: 'Recraft', creditCost: 8, status: 'soon', isNew: true,
  },
  {
    id: 'vectorizerNode', label: 'Vectorizer', icon: '✏️',
    description: 'Görsel → SVG vektör dönüşümü',
    category: 'image-vector', subcategory: 'vector',
    inputs: [imgR('Image')], outputs: [img('SVG')],
    creditCost: 5, status: 'soon',
  },
  {
    id: 'recraftV3SvgNode', label: 'Recraft V3 SVG', icon: '🖊️',
    description: 'Recraft V3 ile direkt SVG üretim',
    category: 'image-vector', subcategory: 'vector',
    inputs: [txtR('Prompt')], outputs: [img('SVG')],
    provider: 'Recraft', creditCost: 10, status: 'soon',
  },
  {
    id: 'textToVectorNode', label: 'Text To Vector', icon: '🔡',
    description: 'Metinden SVG vektör üretim',
    category: 'image-vector', subcategory: 'vector',
    inputs: [txtR('Prompt')], outputs: [img('SVG')],
    creditCost: 8, status: 'soon',
  },

  // ═══ IMAGE — EDIT IMAGES (32) ══════════════════════════════════════════════
  {
    id: 'nanoBanana2Node', label: 'Nano Banana 2', icon: '🍌',
    description: 'Google — gelişmiş görsel düzenleme',
    category: 'image-edit', subcategory: 'edit',
    inputs: [imgR('Image'), txtR('Prompt')], outputs: [img('Image')],
    provider: 'Google', creditCost: 15, status: 'soon', isNew: true,
  },
  {
    id: 'flux2MaxNode', label: 'Flux 2 Max', icon: '🔥',
    description: 'Flux 2 Max — yüksek kaliteli görsel düzenleme',
    category: 'image-edit', subcategory: 'edit',
    inputs: [imgR('Image'), txtR('Prompt')], outputs: [img('Image')],
    provider: 'Black Forest Labs', creditCost: 18, status: 'soon',
  },
  {
    id: 'seedreamV45EditNode', label: 'Seedream V4.5 Edit', icon: '🌱',
    description: 'Seedream V4.5 görsel düzenleme',
    category: 'image-edit', subcategory: 'edit',
    inputs: [imgR('Image'), txtR('Prompt')], outputs: [img('Image')],
    provider: 'Google', creditCost: 10, status: 'soon',
  },
  {
    id: 'seedreamV5EditNode', label: 'Seedream V5 Edit', icon: '🌿',
    description: 'Seedream V5 görsel düzenleme',
    category: 'image-edit', subcategory: 'edit',
    inputs: [imgR('Image'), txtR('Prompt')], outputs: [img('Image')],
    provider: 'Google', creditCost: 12, status: 'soon', isNew: true,
  },
  {
    id: 'nanoBananaProNode', label: 'Nano Banana Pro', icon: '🍌',
    description: 'Google Gemini 3 — profesyonel görsel düzenleme',
    category: 'image-edit', subcategory: 'edit',
    inputs: [imgR('Image'), txtR('Prompt')], outputs: [img('Image')],
    provider: 'Google', creditCost: 15, status: 'soon',
  },
  {
    id: 'qwenImageEditPlusNode', label: 'Qwen Image Edit Plus', icon: '🔵',
    description: 'Alibaba Qwen görsel düzenleme (Plus)',
    category: 'image-edit', subcategory: 'edit',
    inputs: [imgR('Image'), txtR('Prompt')], outputs: [img('Image')],
    provider: 'Alibaba/Qwen', creditCost: 10, status: 'soon',
  },
  {
    id: 'reveEditNode', label: 'Reve Edit', icon: '✏️',
    description: 'Reve AI görsel düzenleme',
    category: 'image-edit', subcategory: 'edit',
    inputs: [imgR('Image'), txtR('Prompt')], outputs: [img('Image')],
    provider: 'Reve AI', creditCost: 10, status: 'soon',
  },
  {
    id: 'nanoBananaNode', label: 'Nano Banana', icon: '🍌',
    description: 'Google — standart görsel düzenleme',
    category: 'image-edit', subcategory: 'edit',
    inputs: [imgR('Image'), txtR('Prompt')], outputs: [img('Image')],
    provider: 'Google', creditCost: 10, status: 'soon',
  },
  {
    id: 'runwayGen4ImageNode', label: 'Runway Gen-4 Image', icon: '🛫',
    description: 'Runway Gen-4 görsel düzenleme',
    category: 'image-edit', subcategory: 'edit',
    inputs: [imgR('Image'), txtR('Prompt')], outputs: [img('Image')],
    provider: 'Runway', creditCost: 15, status: 'soon',
  },
  {
    id: 'fluxKontextNode', label: 'Flux Kontext', icon: '✏️',
    description: 'Metin ile görsel düzenleme — Flux Kontext',
    category: 'image-edit', subcategory: 'edit',
    inputs: [imgR('Image'), txtR('Prompt')], outputs: [img('Image')],
    provider: 'Black Forest Labs', creditCost: 10, status: 'active',
  },
  {
    id: 'fluxKontextLoraNode', label: 'Flux Kontext LoRA', icon: '🧩',
    description: 'Flux Kontext ile LoRA destekli düzenleme',
    category: 'image-edit', subcategory: 'edit',
    inputs: [imgR('Image'), txtR('Prompt'), any('LoRA')], outputs: [img('Image')],
    provider: 'Black Forest Labs', creditCost: 12, status: 'soon',
  },
  {
    id: 'gptImage15EditNode', label: 'GPT Image 1.5 Edit', icon: '🟢',
    description: 'OpenAI GPT Image 1.5 görsel düzenleme',
    category: 'image-edit', subcategory: 'edit',
    inputs: [imgR('Image'), txtR('Prompt')], outputs: [img('Image')],
    provider: 'OpenAI', creditCost: 15, status: 'soon',
  },
  {
    id: 'fluxKontextMultiNode', label: 'Flux Kontext Multi Image', icon: '🖼️',
    description: 'Çoklu görsel ile Flux Kontext düzenleme',
    category: 'image-edit', subcategory: 'edit',
    inputs: [{ name: 'Images', type: 'image', multiple: true, required: true }, txtR('Prompt')], outputs: [img('Image')],
    provider: 'Black Forest Labs', creditCost: 15, status: 'soon',
  },
  {
    id: 'seedEdit30Node', label: 'SeedEdit 3.0', icon: '🌿',
    description: 'Google SeedEdit 3.0 görsel düzenleme',
    category: 'image-edit', subcategory: 'edit',
    inputs: [imgR('Image'), txtR('Prompt')], outputs: [img('Image')],
    provider: 'Google', creditCost: 10, status: 'soon',
  },
  {
    id: 'fluxFillProNode', label: 'Flux Fill Pro (Inpaint)', icon: '🖌️',
    description: 'Maske ile bölgesel düzenleme — Flux Fill Pro',
    category: 'image-edit', subcategory: 'inpaint',
    inputs: [imgR('Image'), mskR('Mask'), txtR('Prompt')], outputs: [img('Image')],
    provider: 'Black Forest Labs', creditCost: 12, status: 'beta',
  },
  {
    id: 'flux2InpaintNode', label: 'Flux 2 Inpaint [Klein 9B]', icon: '🖊️',
    description: 'Flux 2 Klein 9B ile inpaint',
    category: 'image-edit', subcategory: 'inpaint',
    inputs: [imgR('Image'), mskR('Mask'), txtR('Prompt')], outputs: [img('Image')],
    provider: 'Black Forest Labs', creditCost: 12, status: 'soon', isNew: true,
  },
  {
    id: 'fluxDevLoraInpaintNode', label: 'Flux Dev LoRA Inpaint', icon: '🧩',
    description: 'Flux Dev LoRA ile inpaint',
    category: 'image-edit', subcategory: 'inpaint',
    inputs: [imgR('Image'), mskR('Mask'), any('LoRA')], outputs: [img('Image')],
    provider: 'Black Forest Labs', creditCost: 12, status: 'soon',
  },
  {
    id: 'ideogramV3InpaintNode', label: 'Ideogram V3 Inpaint', icon: '🔠',
    description: 'Ideogram V3 ile inpaint',
    category: 'image-edit', subcategory: 'inpaint',
    inputs: [imgR('Image'), mskR('Mask'), txtR('Prompt')], outputs: [img('Image')],
    provider: 'Ideogram', creditCost: 10, status: 'soon',
  },
  {
    id: 'ideogramV2InpaintNode', label: 'Ideogram V2 Inpaint', icon: '🔡',
    description: 'Ideogram V2 ile inpaint',
    category: 'image-edit', subcategory: 'inpaint',
    inputs: [imgR('Image'), mskR('Mask'), txtR('Prompt')], outputs: [img('Image')],
    provider: 'Ideogram', creditCost: 8, status: 'soon',
  },
  {
    id: 'sd3InpaintNode', label: 'SD3 Inpaint', icon: '🌀',
    description: 'Stable Diffusion 3 ile inpaint',
    category: 'image-edit', subcategory: 'inpaint',
    inputs: [imgR('Image'), mskR('Mask'), txtR('Prompt')], outputs: [img('Image')],
    provider: 'Stability AI', creditCost: 8, status: 'soon',
  },
  {
    id: 'briaInpaintNode', label: 'Bria Inpaint', icon: '🦋',
    description: 'Bria AI ile inpaint',
    category: 'image-edit', subcategory: 'inpaint',
    inputs: [imgR('Image'), mskR('Mask'), txtR('Prompt')], outputs: [img('Image')],
    provider: 'Bria AI', creditCost: 8, status: 'soon',
  },
  {
    id: 'fluxProOutpaintNode', label: 'Flux Pro Outpaint', icon: '📐',
    description: 'Görsel sınırlarını genişlet — Flux Pro Outpaint',
    category: 'image-edit', subcategory: 'outpaint',
    inputs: [imgR('Image'), txt('Prompt')], outputs: [img('Image')],
    provider: 'Black Forest Labs', creditCost: 12, status: 'soon',
  },
  {
    id: 'sd3OutpaintNode', label: 'SD3 Outpaint', icon: '🌀',
    description: 'Stable Diffusion 3 outpaint',
    category: 'image-edit', subcategory: 'outpaint',
    inputs: [imgR('Image'), txt('Prompt')], outputs: [img('Image')],
    provider: 'Stability AI', creditCost: 8, status: 'soon',
  },
  {
    id: 'sd3RemoveBgNode', label: 'SD3 Remove Background', icon: '🔲',
    description: 'Stable Diffusion 3 ile arka plan kaldırma',
    category: 'image-edit', subcategory: 'bg-remove',
    inputs: [imgR('Image')], outputs: [img('Image')],
    provider: 'Stability AI', creditCost: 5, status: 'soon',
  },
  {
    id: 'briaRemoveBgNode', label: 'Bria Remove Background', icon: '🦋',
    description: 'Bria AI ile arka plan kaldırma',
    category: 'image-edit', subcategory: 'bg-remove',
    inputs: [imgR('Image')], outputs: [img('Image')],
    provider: 'Bria AI', creditCost: 3, status: 'beta',
  },
  {
    id: 'sd3ContentFillNode', label: 'SD3 Content-Aware Fill', icon: '🎯',
    description: 'Stable Diffusion 3 içerik farkında doldurma',
    category: 'image-edit', subcategory: 'fill',
    inputs: [imgR('Image'), mskR('Mask')], outputs: [img('Image')],
    provider: 'Stability AI', creditCost: 8, status: 'soon',
  },
  {
    id: 'briaContentFillNode', label: 'Bria Content-Aware Fill', icon: '🦋',
    description: 'Bria AI içerik farkında doldurma',
    category: 'image-edit', subcategory: 'fill',
    inputs: [imgR('Image'), mskR('Mask')], outputs: [img('Image')],
    provider: 'Bria AI', creditCost: 8, status: 'soon',
  },
  {
    id: 'kolorsVirtualTryOnNode', label: 'Kolors Virtual Try-On', icon: '👗',
    description: 'Kıyafet sanal deneme — Kolors',
    category: 'image-edit', subcategory: 'special',
    inputs: [imgR('Person'), imgR('Garment')], outputs: [img('Image')],
    provider: 'Kwai', creditCost: 15, status: 'soon',
  },
  {
    id: 'replaceBgNode', label: 'Replace Background', icon: '🌄',
    description: 'Arka planı yeni bir prompt ile değiştir',
    category: 'image-edit', subcategory: 'bg-replace',
    inputs: [imgR('Image'), txtR('Prompt')], outputs: [img('Image')],
    creditCost: 8, status: 'soon',
  },
  {
    id: 'briaReplaceBgNode', label: 'Bria Replace Background', icon: '🦋',
    description: 'Bria AI ile arka plan değiştirme',
    category: 'image-edit', subcategory: 'bg-replace',
    inputs: [imgR('Image'), txtR('Prompt')], outputs: [img('Image')],
    provider: 'Bria AI', creditCost: 8, status: 'soon',
  },
  {
    id: 'relight20Node', label: 'Relight 2.0', icon: '💡',
    description: 'Görseli yeniden aydınlatma',
    category: 'image-edit', subcategory: 'special',
    inputs: [imgR('Image'), txtR('Prompt')], outputs: [img('Image')],
    creditCost: 10, status: 'soon',
  },
  {
    id: 'qwenImageEdit2511Node', label: 'Qwen Image Edit 2511', icon: '🔵',
    description: 'Alibaba Qwen görsel düzenleme 2511',
    category: 'image-edit', subcategory: 'edit',
    inputs: [imgR('Image'), txtR('Prompt')], outputs: [img('Image')],
    provider: 'Alibaba/Qwen', creditCost: 10, status: 'soon', isNew: true,
  },

  // ═══ IMAGE — FROM IMAGE (8) ════════════════════════════════════════════════
  {
    id: 'qwenMultiAngleNode', label: 'Qwen Edit Multiangle', icon: '🔄',
    description: 'Alibaba Qwen çoklu açı görsel üretimi',
    category: 'image-i2i', subcategory: 'variation',
    inputs: [imgR('Image'), txtR('Prompt')], outputs: [imgM('Images')],
    provider: 'Alibaba/Qwen', creditCost: 15, status: 'soon',
  },
  {
    id: 'fluxDevReduxNode', label: 'Flux Dev Redux', icon: '♻️',
    description: 'Flux Dev Redux — görsel varyasyon üretimi',
    category: 'image-i2i', subcategory: 'variation',
    inputs: [imgR('Image'), txt('Prompt')], outputs: [img('Image')],
    provider: 'Black Forest Labs', creditCost: 8, status: 'active',
  },
  {
    id: 'fluxControlNetLoraNode', label: 'Flux ControlNet & LoRA', icon: '🎛️',
    description: 'Flux ControlNet ile yapısal kontrol + LoRA',
    category: 'image-i2i', subcategory: 'controlnet',
    inputs: [imgR('Image'), txtR('Prompt'), any('LoRA')], outputs: [img('Image')],
    provider: 'Black Forest Labs', creditCost: 12, status: 'soon',
  },
  {
    id: 'fluxCannyProNode', label: 'Flux Canny Pro', icon: '📏',
    description: 'Canny edge kontrolü ile görsel üretim',
    category: 'image-i2i', subcategory: 'controlnet',
    inputs: [imgR('Image'), txtR('Prompt')], outputs: [img('Image')],
    provider: 'Black Forest Labs', creditCost: 12, status: 'active',
  },
  {
    id: 'fluxDepthProNode', label: 'Flux Depth Pro', icon: '📊',
    description: 'Derinlik haritası kontrolüyle görsel üretim',
    category: 'image-i2i', subcategory: 'controlnet',
    inputs: [imgR('Image'), txtR('Prompt')], outputs: [img('Image')],
    provider: 'Black Forest Labs', creditCost: 12, status: 'active',
  },
  {
    id: 'img2ImgSdNode', label: 'Image To Image (SD)', icon: '🌀',
    description: 'Stable Diffusion img2img dönüşümü',
    category: 'image-i2i', subcategory: 'variation',
    inputs: [imgR('Image'), txtR('Prompt')], outputs: [img('Image')],
    provider: 'Stability AI', creditCost: 8, status: 'active',
  },
  {
    id: 'sdControlNetsNode', label: 'Stable Diffusion ControlNets', icon: '🎛️',
    description: 'Stable Diffusion ControlNet kontrolü',
    category: 'image-i2i', subcategory: 'controlnet',
    inputs: [imgR('Image'), txtR('Prompt')], outputs: [img('Image')],
    provider: 'Stability AI', creditCost: 10, status: 'active',
  },
  {
    id: 'sketchToImageNode', label: 'Sketch to Image', icon: '✏️',
    description: 'Çizimden gerçekçi görsel üretimi',
    category: 'image-i2i', subcategory: 'variation',
    inputs: [imgR('Sketch'), txtR('Prompt')], outputs: [img('Image')],
    creditCost: 8, status: 'active',
  },

  // ═══ IMAGE — ENHANCE (9) ══════════════════════════════════════════════════
  {
    id: 'topazImageUpscaleNode', label: 'Topaz Image Upscale', icon: '🔭',
    description: 'Topaz AI ile profesyonel upscale',
    category: 'image-enhance', subcategory: 'upscale',
    inputs: [imgR('Image')], outputs: [img('Image')],
    provider: 'Topaz Labs', creditCost: 8, status: 'soon',
  },
  {
    id: 'topazSharpenNode', label: 'Topaz Sharpen', icon: '🔪',
    description: 'Topaz AI ile görsel keskinleştirme',
    category: 'image-enhance', subcategory: 'sharpen',
    inputs: [imgR('Image')], outputs: [img('Image')],
    provider: 'Topaz Labs', creditCost: 6, status: 'soon',
  },
  {
    id: 'magnificSkinNode', label: 'Magnific Skin Enhancer', icon: '💆',
    description: 'Magnific AI cilt iyileştirme',
    category: 'image-enhance', subcategory: 'retouch',
    inputs: [imgR('Image')], outputs: [img('Image')],
    provider: 'Magnific', creditCost: 12, status: 'soon',
  },
  {
    id: 'magnificUpscaleNode', label: 'Magnific Upscale', icon: '🔬',
    description: 'Magnific AI — detay zenginleştirmeli upscale',
    category: 'image-enhance', subcategory: 'upscale',
    inputs: [imgR('Image')], outputs: [img('Image')],
    provider: 'Magnific', creditCost: 12, status: 'soon',
  },
  {
    id: 'magnificPrecisionV2Node', label: 'Magnific Precision Upscale V2', icon: '💠',
    description: 'Magnific Precision Upscale V2',
    category: 'image-enhance', subcategory: 'upscale',
    inputs: [imgR('Image')], outputs: [img('Image')],
    provider: 'Magnific', creditCost: 15, status: 'soon',
  },
  {
    id: 'magnificPrecisionNode', label: 'Magnific Precision Upscale', icon: '💎',
    description: 'Magnific Precision Upscale',
    category: 'image-enhance', subcategory: 'upscale',
    inputs: [imgR('Image')], outputs: [img('Image')],
    provider: 'Magnific', creditCost: 12, status: 'soon',
  },
  {
    id: 'enhancorUpscaleNode', label: 'Enhancor Image Upscale', icon: '🔭',
    description: 'Enhancor AI ile görsel büyütme',
    category: 'image-enhance', subcategory: 'upscale',
    inputs: [imgR('Image')], outputs: [img('Image')],
    provider: 'Enhancor', creditCost: 8, status: 'soon',
  },
  {
    id: 'enhancorSkinNode', label: 'Enhancor Realistic Skin', icon: '👤',
    description: 'Enhancor AI gerçekçi cilt retouching',
    category: 'image-enhance', subcategory: 'retouch',
    inputs: [imgR('Image')], outputs: [img('Image')],
    provider: 'Enhancor', creditCost: 8, status: 'soon',
  },
  {
    id: 'recraftCrispUpscaleNode', label: 'Recraft Crisp Upscale', icon: '✨',
    description: 'Recraft ile keskin upscale',
    category: 'image-enhance', subcategory: 'upscale',
    inputs: [imgR('Image')], outputs: [img('Image')],
    provider: 'Recraft', creditCost: 8, status: 'soon',
  },
  // Creavidy alias
  {
    id: 'upscaleNode', label: 'Upscale (Real-ESRGAN)', icon: '🔭',
    description: 'Görsel çözünürlüğünü artır — Real-ESRGAN',
    category: 'image-enhance', subcategory: 'upscale',
    inputs: [imgR('Image')], outputs: [img('Image')],
    provider: 'fal.ai', creditCost: 5, status: 'beta',
  },

  // ═══ VIDEO — GENERATE (28) ════════════════════════════════════════════════
  {
    id: 'grokVideoNode', label: 'Grok Imagine Video', icon: '⚡',
    description: 'xAI Grok video üretim',
    category: 'video-gen', subcategory: 'xai',
    inputs: [txtR('Prompt'), img('Image')], outputs: [vid('Video')],
    provider: 'xAI', creditCost: 30, status: 'soon',
  },
  {
    id: 'veo31T2VNode', label: 'Veo 3.1 Text to Video', icon: '🔮',
    description: 'Google Veo 3.1 — metinden video üretim',
    category: 'video-gen', subcategory: 'google',
    inputs: [txtR('Prompt')], outputs: [vid('Video')],
    provider: 'Google', creditCost: 50, status: 'active', isNew: true,
  },
  {
    id: 'veo31I2VNode', label: 'Veo 3.1 Image to Video', icon: '🎥',
    description: 'Google Veo 3.1 — görselden video üretim',
    category: 'video-gen', subcategory: 'google',
    inputs: [imgR('Image'), txt('Prompt')], outputs: [vid('Video')],
    provider: 'Google', creditCost: 50, status: 'soon',
  },
  {
    id: 'seedanceV15ProNode', label: 'Seedance V1.5 Pro', icon: '🌿',
    description: 'Google Seedance V1.5 Pro video üretim',
    category: 'video-gen', subcategory: 'google',
    inputs: [txtR('Prompt'), img('Image')], outputs: [vid('Video')],
    provider: 'Google', creditCost: 35, status: 'active',
  },
  {
    id: 'sora2Node', label: 'Sora 2', icon: '🌊',
    description: 'OpenAI Sora 2 Pro — yüksek kaliteli video',
    category: 'video-gen', subcategory: 'openai',
    inputs: [txtR('Prompt')], outputs: [vid('Video')],
    provider: 'OpenAI', creditCost: 60, status: 'active',
  },
  {
    id: 'ltx2VideoNode', label: 'LTX 2 Video', icon: '⚡',
    description: 'LTX Video 2 — hızlı video üretim',
    category: 'video-gen', subcategory: 'ltx',
    inputs: [txtR('Prompt'), img('Image')], outputs: [vid('Video')],
    provider: 'LTX', creditCost: 15, status: 'active',
  },
  {
    id: 'higgsFieldVideoNode', label: 'Higgsfield Video', icon: '🔬',
    description: 'Higgsfield AI video üretim',
    category: 'video-gen', subcategory: 'other',
    inputs: [txtR('Prompt'), img('Image')], outputs: [vid('Video')],
    provider: 'Higgsfield', creditCost: 25, status: 'soon',
  },
  {
    id: 'wan25Node', label: 'Wan 2.5', icon: '🌊',
    description: 'Alibaba Wan 2.5 video modeli',
    category: 'video-gen', subcategory: 'alibaba',
    inputs: [txtR('Prompt'), img('Image')], outputs: [vid('Video')],
    provider: 'Alibaba', creditCost: 20, status: 'soon',
  },
  {
    id: 'wan22Node', label: 'Wan 2.2', icon: '💧',
    description: 'Alibaba Wan 2.2 video modeli',
    category: 'video-gen', subcategory: 'alibaba',
    inputs: [txtR('Prompt'), img('Image')], outputs: [vid('Video')],
    provider: 'Alibaba', creditCost: 18, status: 'soon',
  },
  {
    id: 'moonvalleyNode', label: 'Moonvalley', icon: '🌙',
    description: 'Moonvalley AI video üretim',
    category: 'video-gen', subcategory: 'other',
    inputs: [txtR('Prompt'), img('Image')], outputs: [vid('Video')],
    provider: 'Moonvalley', creditCost: 25, status: 'soon',
  },
  {
    id: 'seedanceV10Node', label: 'Seedance V1.0', icon: '🌱',
    description: 'Google Seedance V1.0 video modeli',
    category: 'video-gen', subcategory: 'google',
    inputs: [txtR('Prompt'), img('Image')], outputs: [vid('Video')],
    provider: 'Google', creditCost: 25, status: 'soon',
  },
  {
    id: 'pixverseV45Node', label: 'Pixverse V4.5', icon: '🎮',
    description: 'Pixverse V4.5 video üretim',
    category: 'video-gen', subcategory: 'other',
    inputs: [txtR('Prompt'), img('Image')], outputs: [vid('Video')],
    provider: 'Pixverse', creditCost: 20, status: 'soon',
  },
  {
    id: 'runwayGen4Node', label: 'Runway Gen-4', icon: '🛫',
    description: 'Runway Gen-4 — sinematik kalite video',
    category: 'video-gen', subcategory: 'runway',
    inputs: [txtR('Prompt'), img('Image')], outputs: [vid('Video')],
    provider: 'Runway', creditCost: 40, status: 'active', isNew: true,
  },
  {
    id: 'runwayGen4TurboNode', label: 'Runway Gen-4 Turbo', icon: '🚀',
    description: 'Runway Gen-4 Turbo — hızlı sinematik video',
    category: 'video-gen', subcategory: 'runway',
    inputs: [txtR('Prompt'), img('Image')], outputs: [vid('Video')],
    provider: 'Runway', creditCost: 30, status: 'active', isNew: true,
  },
  {
    id: 'runwayGen45Node', label: 'Runway Gen-4.5', icon: '✈️',
    description: 'Runway Gen-4.5 video üretim',
    category: 'video-gen', subcategory: 'runway',
    inputs: [txtR('Prompt'), img('Image')], outputs: [vid('Video')],
    provider: 'Runway', creditCost: 45, status: 'soon',
  },
  {
    id: 'runwayGen3TurboNode', label: 'Runway Gen-3 Turbo', icon: '✈️',
    description: 'Runway Gen-3 Turbo video üretim',
    category: 'video-gen', subcategory: 'runway',
    inputs: [txtR('Prompt'), img('Image')], outputs: [vid('Video')],
    provider: 'Runway', creditCost: 25, status: 'soon',
  },
  {
    id: 'kling3Node', label: 'Kling 3', icon: '🦋',
    description: 'Kling 3 — en yeni Kling video modeli',
    category: 'video-gen', subcategory: 'kling',
    inputs: [txtR('Prompt'), img('Image')], outputs: [vid('Video')],
    provider: 'Kuaishou', creditCost: 35, status: 'active', isNew: true,
  },
  {
    id: 'kling16Node', label: 'Kling 1.6', icon: '🔷',
    description: 'Kling 1.6 video üretim',
    category: 'video-gen', subcategory: 'kling',
    inputs: [txtR('Prompt'), img('Image')], outputs: [vid('Video')],
    provider: 'Kuaishou', creditCost: 25, status: 'active',
  },
  {
    id: 'klingVideoNode', label: 'Kling Video', icon: '🎬',
    description: 'Kling Video — standart video üretim',
    category: 'video-gen', subcategory: 'kling',
    inputs: [txtR('Prompt'), img('Image')], outputs: [vid('Video')],
    provider: 'Kuaishou', creditCost: 20, status: 'active',
  },
  {
    id: 'klingFirstLastNode', label: 'Kling First & Last Frame', icon: '🎞️',
    description: 'Kling — ilk ve son kare kontrolüyle video',
    category: 'video-gen', subcategory: 'kling',
    inputs: [imgR('First Frame'), imgR('Last Frame'), txt('Prompt')], outputs: [vid('Video')],
    provider: 'Kuaishou', creditCost: 30, status: 'soon',
  },
  {
    id: 'minimaxHailuo02Node', label: 'Minimax Hailuo-02', icon: '🌀',
    description: 'Minimax Hailuo-02 — gelişmiş video üretim',
    category: 'video-gen', subcategory: 'minimax',
    inputs: [txtR('Prompt'), img('Image')], outputs: [vid('Video')],
    provider: 'Minimax', creditCost: 25, status: 'active', isNew: true,
  },
  {
    id: 'veo2Node', label: 'Veo 2', icon: '🎥',
    description: 'Google Veo 2 video üretim',
    category: 'video-gen', subcategory: 'google',
    inputs: [txtR('Prompt'), img('Image')], outputs: [vid('Video')],
    provider: 'Google', creditCost: 40, status: 'active',
  },
  {
    id: 'minimaxVideoDirectorNode', label: 'Minimax Video Director', icon: '🎬',
    description: 'Minimax Video Director — kamera hareketi kontrolü',
    category: 'video-gen', subcategory: 'minimax',
    inputs: [txtR('Prompt'), img('Image')], outputs: [vid('Video')],
    provider: 'Minimax', creditCost: 28, status: 'soon',
  },
  {
    id: 'minimaxVideo01Node', label: 'Minimax Video 01', icon: '🌀',
    description: 'Minimax Video 01 modeli',
    category: 'video-gen', subcategory: 'minimax',
    inputs: [txtR('Prompt'), img('Image')], outputs: [vid('Video')],
    provider: 'Minimax', creditCost: 22, status: 'soon',
  },
  {
    id: 'lumaRay2Node', label: 'Luma Ray 2', icon: '💡',
    description: 'Luma Dream Machine Ray 2',
    category: 'video-gen', subcategory: 'luma',
    inputs: [txtR('Prompt'), img('Image')], outputs: [vid('Video')],
    provider: 'Luma AI', creditCost: 25, status: 'active', isNew: true,
  },
  {
    id: 'lumaRay2FlashNode', label: 'Luma Ray 2 Flash', icon: '⚡',
    description: 'Luma Ray 2 Flash — hızlı video üretim',
    category: 'video-gen', subcategory: 'luma',
    inputs: [txtR('Prompt'), img('Image')], outputs: [vid('Video')],
    provider: 'Luma AI', creditCost: 15, status: 'soon',
  },
  {
    id: 'hunyuanVideoNode', label: 'Hunyuan', icon: '🐉',
    description: 'Tencent Hunyuan video üretim',
    category: 'video-gen', subcategory: 'tencent',
    inputs: [txtR('Prompt'), img('Image')], outputs: [vid('Video')],
    provider: 'Tencent', creditCost: 22, status: 'active',
  },
  {
    id: 'wanVideoNode', label: 'Wan Video (Wan 2.6)', icon: '🌊',
    description: 'Alibaba Wan 2.6 video modeli',
    category: 'video-gen', subcategory: 'alibaba',
    inputs: [txtR('Prompt'), img('Image')], outputs: [vid('Video')],
    provider: 'Alibaba', creditCost: 20, status: 'active', isNew: true,
  },
  // Creavidy aliases
  {
    id: 'videoGenNode', label: 'Video Generate (Kling 3.0 Std)', icon: '🎥',
    description: 'Kling 3.0 Standard — varsayılan video üretim',
    category: 'video-gen', subcategory: 'kling',
    inputs: [txtR('Prompt'), img('Image')], outputs: [vid('Video')],
    provider: 'Kuaishou', creditCost: 30, status: 'active',
  },

  // ═══ VIDEO — FROM VIDEO (18) ═══════════════════════════════════════════════
  {
    id: 'videoToVideoWanNode', label: 'Video to Video (Wan)', icon: '🔄',
    description: 'fal-ai/wan/v2v ile video-to-video stil transferi — prompt + video → yeni video',
    category: 'video-v2v', subcategory: 'transform',
    inputs: [vidR('Video'), txtR('Prompt')], outputs: [vid('Video')],
    provider: 'fal.ai / Alibaba', creditCost: 25, status: 'active', isNew: true,
  },
  {
    id: 'grokVideoEditNode', label: 'Grok Imagine - Video Edit', icon: '⚡',
    description: 'xAI Grok ile video düzenleme',
    category: 'video-v2v', subcategory: 'edit',
    inputs: [vidR('Video'), txtR('Prompt')], outputs: [vid('Video')],
    provider: 'xAI', creditCost: 30, status: 'soon',
  },
  {
    id: 'ltx2V2VNode', label: 'LTX 2 - Video to Video', icon: '🔄',
    description: 'LTX 2 video-to-video dönüşümü',
    category: 'video-v2v', subcategory: 'transform',
    inputs: [vidR('Video'), txtR('Prompt')], outputs: [vid('Video')],
    provider: 'LTX', creditCost: 20, status: 'soon',
  },
  {
    id: 'klingo3EditNode', label: 'Kling o3 Edit Video', icon: '✂️',
    description: 'Kling o3 ile video düzenleme',
    category: 'video-v2v', subcategory: 'edit',
    inputs: [vidR('Video'), txtR('Prompt')], outputs: [vid('Video')],
    provider: 'Kuaishou', creditCost: 25, status: 'soon',
  },
  {
    id: 'klingMotionNode', label: 'Kling Motion Control', icon: '🎮',
    description: 'Kling hareket kontrolü ile video',
    category: 'video-v2v', subcategory: 'control',
    inputs: [vidR('Video'), txtR('Prompt')], outputs: [vid('Video')],
    provider: 'Kuaishou', creditCost: 25, status: 'soon',
  },
  {
    id: 'klingo1EditNode', label: 'Kling o1 Edit', icon: '✏️',
    description: 'Kling o1 video düzenleme',
    category: 'video-v2v', subcategory: 'edit',
    inputs: [vidR('Video'), txtR('Prompt')], outputs: [vid('Video')],
    provider: 'Kuaishou', creditCost: 20, status: 'soon',
  },
  {
    id: 'klingo1ReferenceNode', label: 'Kling o1 Reference', icon: '📎',
    description: 'Kling o1 referans bazlı video üretim',
    category: 'video-v2v', subcategory: 'reference',
    inputs: [imgR('Reference'), txtR('Prompt')], outputs: [vid('Video')],
    provider: 'Kuaishou', creditCost: 25, status: 'soon',
  },
  {
    id: 'klingo1RefV2VNode', label: 'Kling o1 Reference V2V', icon: '🔗',
    description: 'Kling o1 referans video-to-video',
    category: 'video-v2v', subcategory: 'reference',
    inputs: [vidR('Video'), imgR('Reference')], outputs: [vid('Video')],
    provider: 'Kuaishou', creditCost: 28, status: 'soon',
  },
  {
    id: 'runwayAlephNode', label: 'Runway Aleph', icon: '🛫',
    description: 'Runway Aleph video transform',
    category: 'video-v2v', subcategory: 'transform',
    inputs: [vidR('Video'), txtR('Prompt')], outputs: [vid('Video')],
    provider: 'Runway', creditCost: 35, status: 'soon',
  },
  {
    id: 'runwayActTwoNode', label: 'Runway Act-Two', icon: '🎭',
    description: 'Runway Act-Two — performans transferi',
    category: 'video-v2v', subcategory: 'transform',
    inputs: [vidR('Video'), vidR('Performance')], outputs: [vid('Video')],
    provider: 'Runway', creditCost: 35, status: 'soon',
  },
  {
    id: 'lumaReframeNode', label: 'Luma Reframe', icon: '📐',
    description: 'Luma AI kamera yeniden çerçeveleme',
    category: 'video-v2v', subcategory: 'reframe',
    inputs: [vidR('Video'), txtR('Prompt')], outputs: [vid('Video')],
    provider: 'Luma AI', creditCost: 20, status: 'soon',
  },
  {
    id: 'lumaModifyNode', label: 'Luma Modify', icon: '✏️',
    description: 'Luma AI video düzenleme',
    category: 'video-v2v', subcategory: 'edit',
    inputs: [vidR('Video'), txtR('Prompt')], outputs: [vid('Video')],
    provider: 'Luma AI', creditCost: 20, status: 'soon',
  },
  {
    id: 'wan22AnimateReplaceNode', label: 'Wan 2.2 Animate - Replace', icon: '🔄',
    description: 'Wan 2.2 — animasyon ile replace',
    category: 'video-v2v', subcategory: 'animate',
    inputs: [vidR('Video'), txtR('Prompt')], outputs: [vid('Video')],
    provider: 'Alibaba', creditCost: 20, status: 'soon',
  },
  {
    id: 'wan22AnimateMoveNode', label: 'Wan 2.2 Animate - Move', icon: '🏃',
    description: 'Wan 2.2 — animasyon ile hareket',
    category: 'video-v2v', subcategory: 'animate',
    inputs: [vidR('Video'), txtR('Prompt')], outputs: [vid('Video')],
    provider: 'Alibaba', creditCost: 20, status: 'soon',
  },
  {
    id: 'wanVaceDepthNode', label: 'Wan Vace Depth', icon: '📊',
    description: 'Wan Vace derinlik haritası güdümlü video',
    category: 'video-v2v', subcategory: 'control',
    inputs: [vidR('Video'), txtR('Prompt')], outputs: [vid('Video')],
    provider: 'Alibaba', creditCost: 25, status: 'soon',
  },
  {
    id: 'wanVacePoseNode', label: 'Wan Vace Pose', icon: '🧘',
    description: 'Wan Vace poz güdümlü video üretim',
    category: 'video-v2v', subcategory: 'control',
    inputs: [vidR('Video'), txtR('Prompt')], outputs: [vid('Video')],
    provider: 'Alibaba', creditCost: 25, status: 'soon',
  },
  {
    id: 'wanVaceReframeNode', label: 'Wan Vace Reframe', icon: '📐',
    description: 'Wan Vace kamera yeniden çerçeveleme',
    category: 'video-v2v', subcategory: 'reframe',
    inputs: [vidR('Video')], outputs: [vid('Video')],
    provider: 'Alibaba', creditCost: 20, status: 'soon',
  },
  {
    id: 'wanVaceOutpaintNode', label: 'Wan Vace Outpaint', icon: '⤢',
    description: 'Wan Vace video outpaint / genişletme',
    category: 'video-v2v', subcategory: 'outpaint',
    inputs: [vidR('Video'), txt('Prompt')], outputs: [vid('Video')],
    provider: 'Alibaba', creditCost: 22, status: 'soon',
  },
  {
    id: 'hunyuanV2VNode', label: 'Hunyuan Video to Video', icon: '🐉',
    description: 'Tencent Hunyuan video-to-video',
    category: 'video-v2v', subcategory: 'transform',
    inputs: [vidR('Video'), txtR('Prompt')], outputs: [vid('Video')],
    provider: 'Tencent', creditCost: 22, status: 'soon',
  },

  // ═══ VIDEO — LIP SYNC (4) ══════════════════════════════════════════════════
  {
    id: 'lipSyncLatentSyncNode', label: 'Lip Sync (LatentSync)', icon: '👄',
    description: 'fal-ai/latentsync ile dudak senkronizasyonu — video + ses → lip sync video',
    category: 'video-lipsync', subcategory: 'lipsync',
    inputs: [vidR('Video'), { name: 'Audio', type: 'audio', required: true }], outputs: [vid('Video')],
    provider: 'fal.ai', creditCost: 20, status: 'active', isNew: true,
  },
  {
    id: 'omnihumanV15Node', label: 'Omnihuman V1.5', icon: '👤',
    description: 'Omnihuman V1.5 — gerçekçi dudak senkronizasyonu',
    category: 'video-lipsync', subcategory: 'lipsync',
    inputs: [vidR('Video'), aud('Audio')], outputs: [vid('Video')],
    provider: 'Omnihuman', creditCost: 20, status: 'soon',
  },
  {
    id: 'sync2ProNode', label: 'Sync 2 Pro', icon: '👄',
    description: 'Sync Labs Sync 2 Pro — profesyonel lip sync',
    category: 'video-lipsync', subcategory: 'lipsync',
    inputs: [vidR('Video'), aud('Audio')], outputs: [vid('Video')],
    provider: 'Sync Labs', creditCost: 20, status: 'soon',
  },
  {
    id: 'klingAiAvatarNode', label: 'Kling AI Avatar', icon: '🎭',
    description: 'Kling AI Avatar ile lip sync',
    category: 'video-lipsync', subcategory: 'lipsync',
    inputs: [imgR('Image'), aud('Audio')], outputs: [vid('Video')],
    provider: 'Kuaishou', creditCost: 25, status: 'soon',
  },
  {
    id: 'pixverseLipsyncNode', label: 'Pixverse Lipsync', icon: '🎤',
    description: 'Pixverse lip sync video üretim',
    category: 'video-lipsync', subcategory: 'lipsync',
    inputs: [vidR('Video'), aud('Audio')], outputs: [vid('Video')],
    provider: 'Pixverse', creditCost: 18, status: 'soon',
  },

  // ═══ VIDEO — ENHANCE (4) ══════════════════════════════════════════════════
  {
    id: 'videoUpscaleNode', label: 'Video Upscale (fal.ai)', icon: '🔬',
    description: 'fal-ai/video-upscaler ile video çözünürlük artırma',
    category: 'video-enhance', subcategory: 'upscale',
    inputs: [vidR('Video')], outputs: [vid('Video')],
    provider: 'fal.ai', creditCost: 10, status: 'active', isNew: true,
  },
  {
    id: 'videoEnhanceRifeNode', label: 'Video Enhance (RIFE)', icon: '✨',
    description: 'fal-ai/rife-v4.6-video ile kare enterpolasyonu ve video iyileştirme',
    category: 'video-enhance', subcategory: 'smooth',
    inputs: [vidR('Video')], outputs: [vid('Video')],
    provider: 'fal.ai', creditCost: 8, status: 'active', isNew: true,
  },
  {
    id: 'topazVideoUpscaleNode', label: 'Topaz Video Upscaler', icon: '🔭',
    description: 'Topaz AI ile video çözünürlük artırma',
    category: 'video-enhance', subcategory: 'upscale',
    inputs: [vidR('Video')], outputs: [vid('Video')],
    provider: 'Topaz Labs', creditCost: 15, status: 'soon',
  },
  {
    id: 'briaVideoUpscaleNode', label: 'Bria Upscale', icon: '🦋',
    description: 'Bria AI video upscale',
    category: 'video-enhance', subcategory: 'upscale',
    inputs: [vidR('Video')], outputs: [vid('Video')],
    provider: 'Bria AI', creditCost: 10, status: 'soon',
  },
  {
    id: 'realEsrganVideoNode', label: 'Real-ESRGAN Video Upscaler', icon: '🔬',
    description: 'Real-ESRGAN açık kaynak video upscale',
    category: 'video-enhance', subcategory: 'upscale',
    inputs: [vidR('Video')], outputs: [vid('Video')],
    provider: 'Open Source', creditCost: 8, status: 'soon',
  },
  {
    id: 'videoSmootherNode', label: 'Video Smoother', icon: '✨',
    description: 'Video düzleştirme ve titreme giderme',
    category: 'video-enhance', subcategory: 'smooth',
    inputs: [vidR('Video')], outputs: [vid('Video')],
    creditCost: 8, status: 'soon',
  },

  // Audio — TTS (Creavidy)
  {
    id: 'voiceNode', label: 'Voice (TTS)', icon: '🎙️',
    description: 'Metinden ses üret — OpenAI / ElevenLabs / fal',
    category: 'helpers', subcategory: 'audio',
    inputs: [txtR('Text')], outputs: [aud('Audio')],
    creditCost: 5, status: 'active',
  },
  // Audio Generation — Faz 8
  {
    id: 'stableAudioNode', label: 'Stable Audio', description: 'Text to music/SFX', icon: '🎵',
    category: 'helpers', subcategory: 'audio',
    inputs: [{ name: 'prompt', type: 'text' }], outputs: [{ name: 'audio', type: 'audio' }],
    provider: 'Stability AI', creditCost: 8, status: 'active', isNew: true,
  },
  {
    id: 'sunoNode', label: 'Suno Music', description: 'AI music generation', icon: '🎼',
    category: 'helpers', subcategory: 'audio',
    inputs: [{ name: 'prompt', type: 'text' }], outputs: [{ name: 'audio', type: 'audio' }],
    provider: 'Suno', creditCost: 12, status: 'active', isNew: true,
  },
  // Voice Clone — Faz 8
  {
    id: 'fishAudioCloneNode', label: 'Fish Audio Clone', description: 'Voice cloning with reference audio', icon: '🐟',
    category: 'helpers', subcategory: 'voice',
    inputs: [{ name: 'text', type: 'text' }, { name: 'reference_audio', type: 'audio' }], outputs: [{ name: 'audio', type: 'audio' }],
    provider: 'Fish Audio', creditCost: 5, status: 'active', isNew: true,
  },
  {
    id: 'elevenLabsCloneNode', label: 'ElevenLabs Clone', description: 'ElevenLabs voice synthesis', icon: '🎙️',
    category: 'helpers', subcategory: 'voice',
    inputs: [{ name: 'text', type: 'text' }], outputs: [{ name: 'audio', type: 'audio' }],
    provider: 'ElevenLabs', creditCost: 6, status: 'active', isNew: true,
  },

  // ═══ 3D MODELS (9+2) ══════════════════════════════════════════════════════
  // Active 3D nodes — Faz 8
  {
    id: 'triposrNode', label: 'TripoSR 3D', description: 'Image/text to 3D model', icon: '📦',
    category: '3d', subcategory: 'generation',
    inputs: [{ name: 'image', type: 'image' }, { name: 'prompt', type: 'text' }], outputs: [{ name: '3d_model', type: '3d' }],
    provider: 'TripoSR', creditCost: 15, status: 'active', isNew: true,
  },
  {
    id: 'hyper3dNode', label: 'Hyper3D Rodin', description: 'High quality 3D generation', icon: '🧊',
    category: '3d', subcategory: 'generation',
    inputs: [{ name: 'image', type: 'image' }, { name: 'prompt', type: 'text' }], outputs: [{ name: '3d_model', type: '3d' }],
    provider: 'Hyper3D', creditCost: 25, status: 'active', isNew: true,
  },
  {
    id: 'meshyV6Node', label: 'Meshy V6', icon: '🧊',
    description: 'Meshy V6 — metin veya görselden 3D model üretim',
    category: '3d', subcategory: 'generate',
    inputs: [txtR('Prompt'), img('Image')], outputs: [tdD('3D Model')],
    provider: 'Meshy', creditCost: 25, status: 'soon',
  },
  {
    id: 'sam3DObjectsNode', label: 'SAM 3D - Objects', icon: '🎯',
    description: 'Meta SAM ile nesneden 3D model',
    category: '3d', subcategory: 'generate',
    inputs: [imgR('Image')], outputs: [tdD('3D Model')],
    provider: 'Meta', creditCost: 20, status: 'soon',
  },
  {
    id: 'rodinV2Node', label: 'Rodin V2', icon: '🗿',
    description: 'Rodin V2 yüksek kaliteli 3D model üretimi',
    category: '3d', subcategory: 'generate',
    inputs: [img('Image'), txt('Prompt')], outputs: [tdD('3D Model')],
    provider: 'Rodin', creditCost: 25, status: 'soon',
  },
  {
    id: 'rodinNode', label: 'Rodin', icon: '🗿',
    description: 'Rodin 3D model üretim',
    category: '3d', subcategory: 'generate',
    inputs: [img('Image'), txt('Prompt')], outputs: [tdD('3D Model')],
    provider: 'Rodin', creditCost: 20, status: 'soon',
  },
  {
    id: 'hunyuan3DV3Node', label: 'Hunyuan 3D V3', icon: '🐉',
    description: 'Tencent Hunyuan 3D V3',
    category: '3d', subcategory: 'generate',
    inputs: [imgR('Image'), txt('Prompt')], outputs: [tdD('3D Model')],
    provider: 'Tencent', creditCost: 25, status: 'soon',
  },
  {
    id: 'hunyuan3DV21Node', label: 'Hunyuan 3D V2.1', icon: '🐲',
    description: 'Tencent Hunyuan 3D V2.1',
    category: '3d', subcategory: 'generate',
    inputs: [imgR('Image')], outputs: [tdD('3D Model')],
    provider: 'Tencent', creditCost: 22, status: 'soon',
  },
  {
    id: 'hunyuan3DV20Node', label: 'Hunyuan 3D V2.0', icon: '🐲',
    description: 'Tencent Hunyuan 3D V2.0',
    category: '3d', subcategory: 'generate',
    inputs: [imgR('Image')], outputs: [tdD('3D Model')],
    provider: 'Tencent', creditCost: 20, status: 'soon',
  },
  {
    id: 'trellis3DV2Node', label: 'Trellis 3D V2', icon: '🏗️',
    description: 'Trellis 3D V2 — görselden 3D sahne',
    category: '3d', subcategory: 'generate',
    inputs: [imgR('Image')], outputs: [tdD('3D Model')],
    creditCost: 22, status: 'soon',
  },
  {
    id: 'trellisNode', label: 'Trellis', icon: '🏛️',
    description: 'Trellis — görselden 3D model üretim',
    category: '3d', subcategory: 'generate',
    inputs: [imgR('Image')], outputs: [tdD('3D Model')],
    creditCost: 20, status: 'soon',
  },

  // ═══ COMMUNITY / CUSTOM (38+) ══════════════════════════════════════════════
  {
    id: 'wan21WithLoraNode', label: 'Wan2.1 With LoRA', icon: '🎞️',
    description: 'Wan 2.1 video üretim + LoRA desteği',
    category: 'community', subcategory: 'video',
    inputs: [txtR('Prompt'), img('Image'), any('LoRA')], outputs: [vid('Video')],
    creditCost: 20, status: 'active',
  },
  {
    id: 'sd3ControlNetsNode', label: 'Control / SD3 ControlNets', icon: '🎛️',
    description: 'Stable Diffusion 3 ControlNet modelleri',
    category: 'community', subcategory: 'control',
    inputs: [imgR('Image'), txtR('Prompt')], outputs: [img('Image')],
    creditCost: 10, status: 'active',
  },
  {
    id: 'ipAdapterSdxlNode', label: 'Control / IPadapter SDXL', icon: '🔗',
    description: 'IPAdapter SDXL görsel referans kontrolü',
    category: 'community', subcategory: 'control',
    inputs: [imgR('Image'), txtR('Prompt')], outputs: [img('Image')],
    creditCost: 10, status: 'active',
  },
  {
    id: 'wan211Vid2VidNode', label: 'wan-2.1-1.3b-vid2vid', icon: '🔄',
    description: 'Wan 2.1 1.3B video-to-video',
    category: 'community', subcategory: 'video',
    inputs: [vidR('Video'), txt('Prompt')], outputs: [vid('Video')],
    creditCost: 15, status: 'active',
  },
  {
    id: 'dreamshaperNode', label: 'Dreamshaper', icon: '🌙',
    description: 'Dreamshaper image model',
    category: 'community', subcategory: 'image',
    inputs: [txtR('Prompt')], outputs: [img('Image')],
    creditCost: 5, status: 'active',
  },
  {
    id: 'videoUtilitiesNode', label: 'Video Utilities', icon: '🛠️',
    description: 'Video yardımcı araçları koleksiyonu',
    category: 'community', subcategory: 'video',
    inputs: [vidR('Video')], outputs: [vid('Video')],
    status: 'soon',
  },
  {
    id: 'dreamshaperV8Node', label: 'Dreamshaper V8', icon: '🌠',
    description: 'Dreamshaper V8 image model',
    category: 'community', subcategory: 'image',
    inputs: [txtR('Prompt')], outputs: [img('Image')],
    creditCost: 5, status: 'active',
  },
  {
    id: 'sdxlLightning4StepNode', label: 'SDXL Lightning 4-step', icon: '⚡',
    description: 'SDXL Lightning — 4 adımda hızlı görsel üretim',
    category: 'community', subcategory: 'image',
    inputs: [txtR('Prompt')], outputs: [img('Image')],
    creditCost: 3, status: 'active',
  },
  {
    id: 'realEsrganUpscaleNode', label: 'Image Upscale / Real-ESRGAN', icon: '🔭',
    description: 'Real-ESRGAN açık kaynak görsel büyütme',
    category: 'community', subcategory: 'upscale',
    inputs: [imgR('Image')], outputs: [img('Image')],
    creditCost: 3, status: 'active',
  },
  {
    id: 'faceAlignNode', label: 'Face Align', icon: '😀',
    description: 'Yüz hizalama ve normalize etme',
    category: 'community', subcategory: 'face',
    inputs: [imgR('Image')], outputs: [img('Image')],
    creditCost: 3, status: 'active',
  },
  {
    id: 'dynavisionNode', label: 'Dynavision', icon: '👁️',
    description: 'Dynavision AI görsel modeli',
    category: 'community', subcategory: 'image',
    inputs: [txtR('Prompt')], outputs: [img('Image')],
    creditCost: 6, status: 'active',
  },
  {
    id: 'sdxlControlNetNode', label: 'SDXL Control Net Models', icon: '🎛️',
    description: 'SDXL ControlNet modelleri koleksiyonu',
    category: 'community', subcategory: 'control',
    inputs: [imgR('Image'), txtR('Prompt')], outputs: [img('Image')],
    creditCost: 8, status: 'active',
  },
  {
    id: 'addLogoNode', label: 'Add Logo', icon: '🏷️',
    description: 'Görsel üzerine logo ekleme',
    category: 'community', subcategory: 'overlay',
    inputs: [imgR('Image'), imgR('Logo')], outputs: [img('Image')],
    creditCost: 1, status: 'soon',
  },
  {
    id: 'elevenLabsVoiceChangerNode', label: 'ElevenLabs - Voice Changer', icon: '🎙️',
    description: 'ElevenLabs ile ses değiştirme',
    category: 'community', subcategory: 'audio',
    inputs: [{ name: 'Audio', type: 'audio', required: true }], outputs: [aud('Audio')],
    provider: 'ElevenLabs', creditCost: 10, status: 'soon',
  },
  {
    id: 'controlLcmNode', label: 'Control / LCM', icon: '⚡',
    description: 'LCM (Latent Consistency Model) hızlı üretim',
    category: 'community', subcategory: 'control',
    inputs: [imgR('Image'), txtR('Prompt')], outputs: [img('Image')],
    creditCost: 3, status: 'active',
  },
  {
    id: 'gfpganVideoNode', label: 'Video Upscale / GFPGAN', icon: '🎥',
    description: 'GFPGAN ile yüz odaklı video upscale',
    category: 'community', subcategory: 'upscale',
    inputs: [vidR('Video')], outputs: [vid('Video')],
    creditCost: 8, status: 'active',
  },
  {
    id: 'expressionEditorNode', label: 'Expression Editor', icon: '😊',
    description: 'Video yüz ifadesi düzenleyici',
    category: 'community', subcategory: 'face',
    inputs: [vidR('Video')], outputs: [vid('Video')],
    creditCost: 10, status: 'active',
  },
  {
    id: 'robustVideoMattingNode', label: 'Robust Video Matting', icon: '🎭',
    description: 'Gelişmiş video arka plan kaldırma',
    category: 'community', subcategory: 'matte',
    inputs: [vidR('Video')], outputs: [vid('Video')],
    creditCost: 8, status: 'active',
  },
  {
    id: 'realisticVisionNode', label: 'Realistic Vision v5.1', icon: '📷',
    description: 'Realistic Vision v5.1 — fotorealist görsel',
    category: 'community', subcategory: 'image',
    inputs: [txtR('Prompt')], outputs: [img('Image')],
    creditCost: 5, status: 'active',
  },
  {
    id: 'sd3ExplorerNode', label: 'SD3 Explorer', icon: '🔍',
    description: 'Stable Diffusion 3 Explorer modeli',
    category: 'community', subcategory: 'image',
    inputs: [txtR('Prompt')], outputs: [img('Image')],
    creditCost: 6, status: 'active',
  },
  {
    id: 'recraftCreativeUpscaleNode', label: 'Recraft Creative Upscale', icon: '🎨',
    description: 'Recraft yaratıcı upscale',
    category: 'community', subcategory: 'upscale',
    inputs: [imgR('Image')], outputs: [img('Image')],
    provider: 'Recraft', creditCost: 10, status: 'active',
  },
  {
    id: 'zDepthExtractorNode', label: 'Z-Depth Extractor', icon: '📐',
    description: 'Z-Depth (derinlik) haritası çıkarma',
    category: 'community', subcategory: 'depth',
    inputs: [imgR('Image')], outputs: [img('Depth Map')],
    creditCost: 3, status: 'active',
  },
  {
    id: 'animatedDiffNode', label: 'Animated Diff', icon: '🎬',
    description: 'AnimatedDiff ile görsel animasyon',
    category: 'community', subcategory: 'animation',
    inputs: [imgR('Image'), txtR('Prompt')], outputs: [vid('Video')],
    creditCost: 10, status: 'active',
  },
  {
    id: 'tooncrafterNode', label: 'Video Model / Tooncrafter', icon: '🎨',
    description: 'Tooncrafter — animasyon stil transferi',
    category: 'community', subcategory: 'style',
    inputs: [vidR('Video'), txtR('Prompt')], outputs: [vid('Video')],
    creditCost: 15, status: 'active',
  },
  {
    id: 'tripoSRNode', label: 'Tripo-SR Image to 3D', icon: '🧊',
    description: 'Tripo-SR ile tek görsel → 3D model',
    category: 'community', subcategory: '3d',
    inputs: [imgR('Image')], outputs: [tdD('3D Model')],
    creditCost: 15, status: 'soon',
  },
  {
    id: 'fluxReduxControlNetNode', label: 'Flux Redux ControlNet', icon: '🔗',
    description: 'Flux Redux + ControlNet kombinasyonu',
    category: 'community', subcategory: 'control',
    inputs: [imgR('Image'), txtR('Prompt')], outputs: [img('Image')],
    provider: 'Black Forest Labs', creditCost: 12, status: 'active',
  },
  {
    id: 'sdxlConsistentCharNode', label: 'SDXL Consistent Character', icon: '🧑',
    description: 'SDXL ile tutarlı karakter üretimi',
    category: 'community', subcategory: 'character',
    inputs: [txtR('Prompt'), img('Reference')], outputs: [img('Image')],
    creditCost: 10, status: 'active',
  },
  {
    id: 'sdxlMultiControlNetLoraNode', label: 'SDXL Multi ControlNet LoRA', icon: '🎛️',
    description: 'SDXL çoklu ControlNet + LoRA',
    category: 'community', subcategory: 'control',
    inputs: [imgR('Image'), txtR('Prompt'), any('LoRA')], outputs: [img('Image')],
    creditCost: 12, status: 'active',
  },
  {
    id: 'xlabsFluxDevNode', label: 'XLabs - Flux Dev ControlNet', icon: '🔬',
    description: 'XLabs Flux Dev ControlNet',
    category: 'community', subcategory: 'control',
    inputs: [imgR('Image'), txtR('Prompt')], outputs: [img('Image')],
    provider: 'Black Forest Labs', creditCost: 10, status: 'active',
  },
  {
    id: 'klingLipSyncCommunityNode', label: 'Kling Lip-Sync', icon: '👄',
    description: 'Kling community lip-sync modeli',
    category: 'community', subcategory: 'lipsync',
    inputs: [vidR('Video'), aud('Audio')], outputs: [vid('Video')],
    provider: 'Kuaishou', creditCost: 15, status: 'active',
  },
  {
    id: 'ultimateSdUpscaleNode', label: 'Ultimate SD Upscale', icon: '🔭',
    description: 'Ultimate SD Upscale — tile bazlı büyütme',
    category: 'community', subcategory: 'upscale',
    inputs: [imgR('Image'), txtR('Prompt')], outputs: [img('Image')],
    creditCost: 8, status: 'active',
  },
  {
    id: 'faceSwapNode', label: 'Face Swap', icon: '😷',
    description: 'Yüz değiştirme (face swap)',
    category: 'community', subcategory: 'face',
    inputs: [imgR('Source'), imgR('Target')], outputs: [img('Image')],
    creditCost: 8, status: 'active',
  },
  {
    id: 'mergeAudioVideoNode', label: 'Merge Audio and Video', icon: '🔀',
    description: 'Ses ve videoyu birleştir',
    category: 'community', subcategory: 'audio',
    inputs: [vidR('Video'), { name: 'Audio', type: 'audio', required: true }], outputs: [vid('Video')],
    status: 'soon',
  },
  {
    id: 'clarityUpscaleNode', label: 'Image Upscale / Clarity', icon: '💎',
    description: 'Clarity Upscale — keskinlik koruyan büyütme',
    category: 'community', subcategory: 'upscale',
    inputs: [imgR('Image')], outputs: [img('Image')],
    creditCost: 8, status: 'active',
  },
  {
    id: 'idPreservationFluxNode', label: 'ID Preservation - Flux', icon: '🪪',
    description: 'Flux ile kimlik korumalı görsel üretim',
    category: 'community', subcategory: 'identity',
    inputs: [imgR('Reference'), txtR('Prompt')], outputs: [img('Image')],
    provider: 'Black Forest Labs', creditCost: 12, status: 'active',
  },
  {
    id: 'videoToAudioNode', label: 'Video to Audio', icon: '🎵',
    description: 'Videodan ses kanalını çıkar',
    category: 'community', subcategory: 'audio',
    inputs: [vidR('Video')], outputs: [aud('Audio')],
    status: 'soon',
  },
  {
    id: 'increaseFrameRateNode', label: 'Increase Frame-rate', icon: '🎞️',
    description: 'Video kare hızını artırma (FPS boost)',
    category: 'community', subcategory: 'enhance',
    inputs: [vidR('Video')], outputs: [vid('Video')],
    creditCost: 8, status: 'active',
  },
  {
    id: 'videoSmootherCommunityNode', label: 'Video Smoother', icon: '✨',
    description: 'Video titreme ve sarsılma giderme',
    category: 'community', subcategory: 'enhance',
    inputs: [vidR('Video')], outputs: [vid('Video')],
    creditCost: 5, status: 'active',
  },

  // ═══ AI AVATAR (5) ═══════════════════════════════════════════════════════
  {
    id: 'heygenTalkingPhotoNode', label: 'HeyGen Talking Photo', icon: '🧑‍💻',
    description: 'Fotoğraftan konuşan avatar videosu üret — HeyGen Talking Photo',
    category: 'ai-avatar', subcategory: 'heygen',
    inputs: [imgR('Portrait'), txtR('Script')], outputs: [vid('Avatar Video')],
    provider: 'HeyGen', creditCost: 20, status: 'active', isNew: true,
  },
  {
    id: 'heygenVideoAvatarNode', label: 'HeyGen Video Avatar', icon: '🎭',
    description: 'Hazır avatar ile script okutarak profesyonel video üret — HeyGen',
    category: 'ai-avatar', subcategory: 'heygen',
    inputs: [txtR('Script')], outputs: [vid('Avatar Video')],
    provider: 'HeyGen', creditCost: 30, status: 'active', isNew: true,
  },
  {
    id: 'hedraCharacterNode', label: 'Hedra Character', icon: '🎬',
    description: 'Görsel + ses ile senkron konuşan karakter videosu — Hedra Character-3',
    category: 'ai-avatar', subcategory: 'hedra',
    inputs: [imgR('Portrait'), aud('Audio')], outputs: [vid('Character Video')],
    provider: 'Hedra', creditCost: 25, status: 'active', isNew: true,
  },
  {
    id: 'hedraLipSyncNode', label: 'Hedra Lip Sync', icon: '💬',
    description: 'Fotoğraf + metin girişinden dudak senkronlu video — Hedra',
    category: 'ai-avatar', subcategory: 'hedra',
    inputs: [imgR('Portrait'), txtR('Script')], outputs: [vid('Lip Sync Video')],
    provider: 'Hedra', creditCost: 20, status: 'active', isNew: true,
  },
  {
    id: 'runwayActTwoAvatarNode', label: 'Runway Act-Two', icon: '🎥',
    description: 'Portreden ses senkronlu avatar animasyonu — Runway Act-Two',
    category: 'ai-avatar', subcategory: 'runway',
    inputs: [imgR('Portrait'), aud('Audio')], outputs: [vid('Avatar Video')],
    provider: 'Runway', creditCost: 35, status: 'beta', isNew: true,
  },
  {
    id: 'runwayAvatarPortraitNode', label: 'Runway Portrait Animator', icon: '🧬',
    description: 'Portre fotoğrafından prompt ile avatar videosu — Runway Gen-4',
    category: 'ai-avatar', subcategory: 'runway',
    inputs: [imgR('Portrait'), txtR('Prompt')], outputs: [vid('Avatar Video')],
    provider: 'Runway', creditCost: 30, status: 'beta', isNew: true,
  },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export function getNodesByCategory(category: NodeCategory): NodeDefinition[] {
  return NODE_DEFINITIONS.filter(n => n.category === category)
}

export function searchNodes(query: string): NodeDefinition[] {
  const q = query.toLowerCase()
  return NODE_DEFINITIONS.filter(n =>
    n.label.toLowerCase().includes(q) ||
    n.description.toLowerCase().includes(q) ||
    (n.provider?.toLowerCase().includes(q) ?? false) ||
    n.category.includes(q)
  )
}

export function getNodeDef(id: string): NodeDefinition | undefined {
  return NODE_DEFINITIONS.find(n => n.id === id)
}

// Wire colors by data type
export const WIRE_COLORS: Record<NodeDataType, string> = {
  text:    '#a78bfa',
  image:   '#FFE744',
  video:   '#D1FE17',
  audio:   '#ec4899',
  mask:    '#94a3b8',
  number:  '#f97316',
  boolean: '#06b6d4',
  array:   '#3b82f6',
  '3d':    '#06b6d4',
  any:     '#6366f1',
}
