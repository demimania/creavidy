'use client'

import { memo, useState } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { motion } from 'framer-motion'
import { Variable, Hash, Type } from 'lucide-react'
import { useWorkspaceStore, type NodeData } from '@/lib/stores/workspace-store'
import { PromptVariableEditor } from './PromptVariableEditor'

// ============================================================================
// Variable Nodes — SetVariable, GetVariable, TextFormatter
// ============================================================================

// Accent colour for variable nodes (uses the lime/yellow accent from the design)
const VAR_COLOR = '#D1FE17'
const GET_COLOR = '#a78bfa'
const FMT_COLOR = '#0ea5e9'

// ── SetVariableNodeContent ────────────────────────────────────────────────────
export const SetVariableNodeContent = memo(({ id, data, selected }: NodeProps<NodeData>) => {
  const setVariable = useWorkspaceStore((s) => s.setVariable)
  const updateNodeConfig = useWorkspaceStore((s) => s.updateNodeConfig)
  const config = data.config as { varName?: string; value?: string }

  const varName = config.varName ?? ''
  const varValue = config.value ?? ''

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    updateNodeConfig(id, { varName: e.target.value })
  }

  function handleValueChange(val: string) {
    updateNodeConfig(id, { value: val })
    if (varName.trim()) {
      setVariable(varName.trim(), val)
    }
  }

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`relative w-[260px] rounded-xl border transition-all ${selected ? 'ring-2 ring-offset-2 ring-offset-[#0F051D]' : 'hover:shadow-lg'}`}
      style={{
        borderColor: selected ? VAR_COLOR : 'rgba(255,255,255,0.10)',
        boxShadow: selected ? `0 0 25px ${VAR_COLOR}20` : undefined,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-t-xl"
        style={{ background: `${VAR_COLOR}10` }}
      >
        <div
          className="w-5 h-5 rounded flex items-center justify-center"
          style={{ backgroundColor: `${VAR_COLOR}25` }}
        >
          <Variable className="w-3 h-3" style={{ color: VAR_COLOR }} />
        </div>
        <span className="flex-1 text-[11px] font-semibold text-white">Set Variable</span>
        <span
          className="text-[8px] px-1.5 py-0.5 rounded font-medium"
          style={{ background: `${VAR_COLOR}20`, color: VAR_COLOR }}
        >
          VAR
        </span>
      </div>

      {/* Body */}
      <div className="bg-[#0F051D]/90 backdrop-blur-xl rounded-b-xl">
        {/* Variable name */}
        <div className="mx-3 mt-2">
          <label className="text-[9px] text-zinc-500 uppercase tracking-wider font-medium mb-1 block">
            Variable Name
          </label>
          <div className="flex items-center gap-1.5 bg-[#1a1025] border border-white/8 rounded-lg px-2.5 py-1.5 focus-within:border-[#D1FE17]/50 transition-colors">
            <span className="text-[#D1FE17] text-[11px] font-mono font-bold select-none">{'{'}</span>
            <input
              type="text"
              value={varName}
              onChange={handleNameChange}
              placeholder="variable_name"
              className="flex-1 bg-transparent text-[11px] text-zinc-200 font-mono outline-none placeholder:text-zinc-600"
            />
            <span className="text-[#D1FE17] text-[11px] font-mono font-bold select-none">{'}'}</span>
          </div>
        </div>

        {/* Value editor */}
        <div className="mx-3 mt-2 mb-2">
          <label className="text-[9px] text-zinc-500 uppercase tracking-wider font-medium mb-1 block">
            Value
          </label>
          <div className="bg-[#1a1025] border border-white/8 rounded-lg overflow-hidden focus-within:border-[#D1FE17]/50 transition-colors">
            <PromptVariableEditor
              value={varValue}
              onChange={handleValueChange}
              placeholder="Value or {another_variable}..."
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-white/5">
          {varName.trim() ? (
            <span className="text-[9px] font-mono" style={{ color: VAR_COLOR }}>
              {`{${varName}}`}
            </span>
          ) : (
            <span className="text-[9px] text-zinc-600">No variable name</span>
          )}
          <span className="text-[8px] text-zinc-600">Set</span>
        </div>
      </div>

      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="var-in"
        className="!w-3 !h-3 !rounded-full !border-2 !border-[#0F051D]"
        style={{ backgroundColor: VAR_COLOR }}
      />
      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="var-out"
        className="!w-3 !h-3 !rounded-full !border-2 !border-[#0F051D]"
        style={{ backgroundColor: VAR_COLOR }}
      />
    </motion.div>
  )
})
SetVariableNodeContent.displayName = 'SetVariableNode'

// ── GetVariableNodeContent ────────────────────────────────────────────────────
export const GetVariableNodeContent = memo(({ id, data, selected }: NodeProps<NodeData>) => {
  const updateNodeConfig = useWorkspaceStore((s) => s.updateNodeConfig)
  const getVariable = useWorkspaceStore((s) => s.getVariable)
  const config = data.config as { varName?: string }
  const varName = config.varName ?? ''
  const currentValue = varName.trim() ? (getVariable(varName.trim()) ?? '') : ''

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`relative w-[220px] rounded-xl border transition-all ${selected ? 'ring-2 ring-offset-2 ring-offset-[#0F051D]' : 'hover:shadow-lg'}`}
      style={{
        borderColor: selected ? GET_COLOR : 'rgba(255,255,255,0.10)',
        boxShadow: selected ? `0 0 25px ${GET_COLOR}20` : undefined,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-t-xl"
        style={{ background: `${GET_COLOR}10` }}
      >
        <div
          className="w-5 h-5 rounded flex items-center justify-center"
          style={{ backgroundColor: `${GET_COLOR}25` }}
        >
          <Hash className="w-3 h-3" style={{ color: GET_COLOR }} />
        </div>
        <span className="flex-1 text-[11px] font-semibold text-white">Get Variable</span>
        <span
          className="text-[8px] px-1.5 py-0.5 rounded font-medium"
          style={{ background: `${GET_COLOR}20`, color: GET_COLOR }}
        >
          READ
        </span>
      </div>

      {/* Body */}
      <div className="bg-[#0F051D]/90 backdrop-blur-xl rounded-b-xl">
        <div className="mx-3 my-2">
          <label className="text-[9px] text-zinc-500 uppercase tracking-wider font-medium mb-1 block">
            Variable Name
          </label>
          <div className="flex items-center gap-1.5 bg-[#1a1025] border border-white/8 rounded-lg px-2.5 py-1.5 focus-within:border-[#a78bfa]/50 transition-colors">
            <span className="text-[#a78bfa] text-[11px] font-mono font-bold select-none">{'{'}</span>
            <input
              type="text"
              value={varName}
              onChange={(e) => updateNodeConfig(id, { varName: e.target.value })}
              placeholder="variable_name"
              className="flex-1 bg-transparent text-[11px] text-zinc-200 font-mono outline-none placeholder:text-zinc-600"
            />
            <span className="text-[#a78bfa] text-[11px] font-mono font-bold select-none">{'}'}</span>
          </div>
        </div>

        {/* Current value preview */}
        {currentValue && (
          <div className="mx-3 mb-2">
            <div className="bg-[#1a1025] border border-[#a78bfa]/20 rounded-lg px-2.5 py-1.5">
              <p className="text-[10px] text-zinc-400 truncate font-mono">{currentValue}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-white/5">
          {varName.trim() ? (
            <span className="text-[9px] font-mono" style={{ color: GET_COLOR }}>
              {`{${varName}}`}
            </span>
          ) : (
            <span className="text-[9px] text-zinc-600">No variable</span>
          )}
          <span className="text-[8px] text-zinc-600">Get</span>
        </div>
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="getvar-out"
        className="!w-3 !h-3 !rounded-full !border-2 !border-[#0F051D]"
        style={{ backgroundColor: GET_COLOR }}
      />
    </motion.div>
  )
})
GetVariableNodeContent.displayName = 'GetVariableNode'

// ── TextFormatterNodeContent ──────────────────────────────────────────────────
export const TextFormatterNodeContent = memo(({ id, data, selected }: NodeProps<NodeData>) => {
  const updateNodeConfig = useWorkspaceStore((s) => s.updateNodeConfig)
  const variables = useWorkspaceStore((s) => s.variables)
  const config = data.config as { template?: string }
  const template = config.template ?? ''

  // Inject current variable values for preview
  const preview = template.replace(
    /\{([^}]+)\}/g,
    (_, key) => variables[key] ?? `{${key}}`
  )

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`relative w-[280px] rounded-xl border transition-all ${selected ? 'ring-2 ring-offset-2 ring-offset-[#0F051D]' : 'hover:shadow-lg'}`}
      style={{
        borderColor: selected ? FMT_COLOR : 'rgba(255,255,255,0.10)',
        boxShadow: selected ? `0 0 25px ${FMT_COLOR}20` : undefined,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-t-xl"
        style={{ background: `${FMT_COLOR}10` }}
      >
        <div
          className="w-5 h-5 rounded flex items-center justify-center"
          style={{ backgroundColor: `${FMT_COLOR}25` }}
        >
          <Type className="w-3 h-3" style={{ color: FMT_COLOR }} />
        </div>
        <span className="flex-1 text-[11px] font-semibold text-white">Text Formatter</span>
        <span
          className="text-[8px] px-1.5 py-0.5 rounded font-medium"
          style={{ background: `${FMT_COLOR}20`, color: FMT_COLOR }}
        >
          FMT
        </span>
      </div>

      {/* Body */}
      <div className="bg-[#0F051D]/90 backdrop-blur-xl rounded-b-xl">
        {/* Template editor */}
        <div className="mx-3 mt-2">
          <label className="text-[9px] text-zinc-500 uppercase tracking-wider font-medium mb-1 block">
            Template
          </label>
          <div className="bg-[#1a1025] border border-white/8 rounded-lg overflow-hidden focus-within:border-[#0ea5e9]/50 transition-colors">
            <PromptVariableEditor
              value={template}
              onChange={(val) => updateNodeConfig(id, { template: val })}
              placeholder="Hello {name}, welcome to {project}..."
              rows={4}
              variables={variables}
            />
          </div>
        </div>

        {/* Preview */}
        {template && preview !== template && (
          <div className="mx-3 mt-2 mb-0">
            <label className="text-[9px] text-zinc-500 uppercase tracking-wider font-medium mb-1 block">
              Preview
            </label>
            <div className="bg-[#0a0314] border border-[#0ea5e9]/20 rounded-lg px-2.5 py-1.5 max-h-[60px] overflow-y-auto custom-scrollbar">
              <p className="text-[10px] text-zinc-300 whitespace-pre-wrap leading-relaxed">{preview}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-3 py-2 mt-2 border-t border-white/5">
          <span className="text-[9px] text-zinc-500">
            {template
              ? `${[...template.matchAll(/\{([^}]+)\}/g)].length} variables`
              : 'No template'}
          </span>
          <span className="text-[8px] text-zinc-600">Format</span>
        </div>
      </div>

      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="fmt-in"
        className="!w-3 !h-3 !rounded-full !border-2 !border-[#0F051D]"
        style={{ backgroundColor: FMT_COLOR }}
      />
      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="fmt-out"
        className="!w-3 !h-3 !rounded-full !border-2 !border-[#0F051D]"
        style={{ backgroundColor: FMT_COLOR }}
      />
    </motion.div>
  )
})
TextFormatterNodeContent.displayName = 'TextFormatterNode'
