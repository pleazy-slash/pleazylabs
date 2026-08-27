'use client';

import { useLabStore } from '@/lib/store';
import { CELL_SUBCOMPONENTS } from '@/lib/cellHierarchy';

export default function SubComponentTreePanel() {
  const selectedId = useLabStore((state) => state.selectedComponentId);
  const setSelectedComponent = useLabStore((state) => state.setSelectedComponent);
  const setComponentOpacity = useLabStore((state) => state.setComponentOpacity);
  const toggleVisibility = useLabStore((state) => state.toggleComponentVisibility);
  const components = useLabStore((state) => state.components);

  const renderTreeNodes = (node, depth = 0) => {
    const isSelected = selectedId === node.id;
    const currentOpacity = components[node.id]?.opacity ?? node.opacity ?? 1.0;
    const isVisible = components[node.id]?.visible ?? true;

    return (
      <div key={node.id} style={{ paddingLeft: `${depth * 12}px` }} className="my-1">
        <div
          onClick={() => setSelectedComponent(node.id)}
          className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition ${
            isSelected ? 'bg-cyan-900/60 border border-cyan-500' : 'hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center space-x-2 truncate">
            <span className="text-[10px] text-slate-500">{node.type === 'ASSEMBLY' ? '📁' : '⚡'}</span>
            <span className={`text-xs ${isSelected ? 'text-cyan-300 font-bold' : 'text-slate-300'}`}>
              {node.name}
            </span>
          </div>

          {node.type === 'PARTS' && (
            <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={currentOpacity}
                onChange={(e) => setComponentOpacity(node.id, parseFloat(e.target.value))}
                className="w-12 h-1 accent-cyan-400"
              />
              <button
                onClick={() => toggleVisibility(node.id)}
                className="text-[10px] text-slate-400 hover:text-white px-1"
              >
                {isVisible ? '👁️' : '🙈'}
              </button>
            </div>
          )}
        </div>

        {node.children && node.children.map((child) => renderTreeNodes(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="absolute top-4 right-4 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3 rounded-xl text-slate-100 font-sans shadow-2xl z-10 max-h-[85vh] overflow-y-auto">
      <h3 className="text-xs font-bold text-cyan-400 mb-2 uppercase tracking-wider border-b border-slate-700 pb-1.5">
        Sub-Component Explorer
      </h3>
      {renderTreeNodes(CELL_SUBCOMPONENTS)}
    </div>
  );
}
