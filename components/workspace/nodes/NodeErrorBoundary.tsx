'use client'

import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  nodeId?: string
  nodeLabel?: string
  children: ReactNode
}

interface State {
  hasError: boolean
  error: string
}

export class NodeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message || 'Bilinmeyen hata' }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[NodeErrorBoundary] Node ${this.props.nodeId} crashed:`, error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: '' })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        className="min-w-[200px] max-w-[260px] rounded-xl overflow-hidden"
        style={{
          border: '1px solid rgba(239,68,68,0.4)',
          borderLeft: '3px solid rgba(239,68,68,0.8)',
          background: '#0F051D',
          boxShadow: '0 0 16px rgba(239,68,68,0.1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-white/8"
          style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.25) 0%, rgba(239,68,68,0.08) 100%)' }}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span className="flex-1 text-[11px] font-semibold text-red-300 truncate">
            {this.props.nodeLabel || this.props.nodeId || 'Node'} — Hata
          </span>
        </div>

        {/* Body */}
        <div className="px-3 py-3 space-y-2.5">
          <p className="text-[10px] text-red-400/80 bg-red-500/10 rounded-lg px-2 py-2 leading-relaxed break-words">
            {this.state.error}
          </p>
          <button
            onClick={this.handleReset}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-medium text-red-300 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Yeniden Dene
          </button>
        </div>
      </div>
    )
  }
}

/**
 * HOC — wrap any ReactFlow node component with an error boundary.
 * Usage: `export const SafeMyNode = withNodeErrorBoundary(MyNodeContent)`
 */
export function withNodeErrorBoundary<P extends { id: string; data: { label?: string } }>(
  WrappedNode: React.ComponentType<P>
): React.ComponentType<P> {
  const displayName = WrappedNode.displayName || WrappedNode.name || 'Node'

  function SafeNode(props: P) {
    return (
      <NodeErrorBoundary nodeId={props.id} nodeLabel={props.data?.label}>
        <WrappedNode {...props} />
      </NodeErrorBoundary>
    )
  }

  SafeNode.displayName = `Safe(${displayName})`
  return SafeNode
}
