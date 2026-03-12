'use client'

import { memo } from 'react'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from 'reactflow'

// ── Labeled Edge — shows connection type label on the line ──────────────────

function LabeledEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  style = {}, data, markerEnd, selected
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  })

  const label = data?.label as string | undefined
  const edgeColor = (style?.stroke as string) || '#a78bfa'

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={{
        ...style,
        strokeWidth: selected ? 4 : 2,
        stroke: selected ? '#FFF' : edgeColor,
        filter: selected ? `drop-shadow(0 0 8px #FFF)` : `drop-shadow(0 0 3px ${edgeColor}40)`,
        transition: 'stroke 0.2s, stroke-width 0.2s, filter 0.2s',
      }} />

      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-[#0F051D]/90 border border-white/10 backdrop-blur-sm"
          >
            <span style={{ color: edgeColor }}>{label}</span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

export const LabeledEdgeComponent = memo(LabeledEdge)

export const edgeTypes = {
  labeled: LabeledEdgeComponent,
}
