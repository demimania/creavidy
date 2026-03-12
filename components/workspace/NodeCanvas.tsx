'use client'

import { useCallback, useRef, useState } from 'react'
import ReactFlow, {
  Background,
  BackgroundVariant,
  MiniMap,
  Panel,
  useReactFlow,
  useStore,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Connection,
  type ReactFlowInstance,
} from 'reactflow'
import { MousePointer2, Hand, Undo2, Redo2, ChevronDown } from 'lucide-react'
import 'reactflow/dist/style.css'

import { nodeTypes } from './nodes/CustomNodes'
import { edgeTypes } from './edges/LabeledEdge'
import { useWorkspaceStore, NODE_COLORS, CONNECTION_RULES, DEFAULT_CONFIGS, type NodeData } from '@/lib/stores/workspace-store'
import type { Node } from 'reactflow'

const zoomSelector = (s: any) => s.transform[2]

function CustomToolbar({ panMode, setPanMode }: { panMode: boolean, setPanMode: (v: boolean) => void }) {
  const { fitView } = useReactFlow()
  const zoom = useStore(zoomSelector)
  const { undo, redo, _history, _historyFuture } = useWorkspaceStore()

  return (
    <Panel position="bottom-center" className="bg-[#1a0d2e]/90 border border-white/10 rounded-2xl shadow-2xl flex items-center p-1.5 gap-1 backdrop-blur-md mb-4 pointer-events-auto">
      <button
        type="button"
        onClick={() => setPanMode(false)}
        title="Select (V)"
        className={`p-2 rounded-xl transition-colors ${!panMode ? 'bg-[#D1FE17] text-black' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
      >
        <MousePointer2 size={16} />
      </button>
      <button
        type="button"
        onClick={() => setPanMode(true)}
        title="Pan (H)"
        className={`p-2 rounded-xl transition-colors ${panMode ? 'bg-[#FFE744] text-black' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
      >
        <Hand size={16} />
      </button>

      <div className="w-px h-6 bg-white/10 mx-1"></div>

      <button
        type="button"
        onClick={undo}
        disabled={_history.length === 0}
        title="Undo (⌘Z)"
        className="p-2 rounded-xl transition-colors text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Undo2 size={16} />
      </button>
      <button
        type="button"
        onClick={redo}
        disabled={_historyFuture.length === 0}
        title="Redo (⌘⇧Z)"
        className="p-2 rounded-xl transition-colors text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Redo2 size={16} />
      </button>

      <div className="w-px h-6 bg-white/10 mx-1"></div>

      <button type="button" onClick={() => fitView({ duration: 500 })} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/5 rounded-lg transition-colors">
        {Math.round(zoom * 100)}%
        <ChevronDown size={14} className="text-zinc-400" />
      </button>
    </Panel>
  )
}

export function NodeCanvas() {
  const {
    nodes, edges, setNodes, setEdges, selectNode, setContextMenu, _pushHistory
  } = useWorkspaceStore()

  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null)
  const [panMode, setPanMode] = useState(true)

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes(applyNodeChanges(changes, nodes) as Node<NodeData>[]),
    [nodes, setNodes]
  )

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges(applyEdgeChanges(changes, edges)),
    [edges, setEdges]
  )

  // ── Connection validation ────────────────────────────────────────────────
  const isValidConnection = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return false
      if (connection.source === connection.target) return false

      const sourceNode = nodes.find(n => n.id === connection.source)
      const targetNode = nodes.find(n => n.id === connection.target)
      if (!sourceNode || !targetNode) return false

      const sourceType = sourceNode.data.type
      const targetType = targetNode.data.type
      const allowed = CONNECTION_RULES[sourceType] || []
      return allowed.includes(targetType)
    },
    [nodes]
  )

  const onNodeDragStop = useCallback(() => { _pushHistory() }, [_pushHistory])

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (!isValidConnection(connection)) return
      _pushHistory()

      const sourceNode = nodes.find(n => n.id === connection.source)
      const sourceType = sourceNode?.data.type || ''
      const color = sourceNode ? NODE_COLORS[sourceType] || '#a78bfa' : '#a78bfa'

      // Auto-label based on source type
      const EDGE_LABELS: Record<string, string> = {
        script: 'Script', voice: 'Audio', imageGen: 'Image',
        videoGen: 'Video', caption: 'Captioned', export: 'File',
      }

      const newEdge = {
        ...connection,
        id: `e-${connection.source}-${connection.target}-${Date.now()}`,
        type: 'labeled',
        style: { stroke: color, strokeWidth: 2 },
        animated: true,
        data: { label: EDGE_LABELS[sourceType] || '' },
      }
      setEdges(addEdge(newEdge, edges))
    },
    [nodes, edges, setEdges, isValidConnection]
  )

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectNode(node.id)
      setContextMenu(null)
    },
    [selectNode, setContextMenu]
  )

  const onPaneClick = useCallback(() => {
    selectNode(null)
    setContextMenu(null)
  }, [selectNode, setContextMenu])

  // ── Right-click context menu ─────────────────────────────────────────────
  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      if (!reactFlowInstance.current || !reactFlowWrapper.current) return

      const bounds = reactFlowWrapper.current.getBoundingClientRect()
      const canvasPos = reactFlowInstance.current.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      })

      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        canvasX: canvasPos.x,
        canvasY: canvasPos.y,
      })
    },
    [setContextMenu]
  )

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onPaneContextMenu={onPaneContextMenu}
        onInit={(instance) => { reactFlowInstance.current = instance }}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        panOnDrag={panMode}
        selectionOnDrag={!panMode}
        panOnScroll={false}
        selectionMode={'partial' as any}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 0.8 }}
        defaultEdgeOptions={{
          style: { strokeWidth: 2 },
          animated: true,
        }}
        proOptions={{ hideAttribution: true }}
        className={!panMode ? '!bg-transparent [&_.react-flow__pane]:cursor-crosshair' : '!bg-transparent [&_.react-flow__pane]:cursor-grab'}
      >
        <Background variant={BackgroundVariant.Dots} color="rgba(255, 255, 255, 0.25)" gap={24} size={2} />
        <CustomToolbar panMode={panMode} setPanMode={setPanMode} />
        <MiniMap
          nodeColor={(node) => NODE_COLORS[(node.data as NodeData)?.type] || '#a78bfa'}
          maskColor="#0F051D99"
          className="!bg-[#1a0d2e]/80 !border-white/10 !rounded-xl"
        />
      </ReactFlow>
    </div>
  )
}
