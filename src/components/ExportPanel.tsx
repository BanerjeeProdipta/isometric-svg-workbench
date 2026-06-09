import React, { useState } from 'react';
import { ShapeDefinition } from '../types';
import { Copy, Check, Download, Code } from 'lucide-react';

interface ExportPanelProps {
  shape: ShapeDefinition;
  onCopyCode: () => void;
  onDownloadFile: () => void;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  shape,
  onCopyCode,
  onDownloadFile,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedJsx, setCopiedJsx] = useState(false);

  const handleCopyCode = () => {
    onCopyCode();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyJsx = () => {
    // Generate a simple React SVG component for the shape
    const svgElement = document.getElementById(`svg-render-${shape.id}`);
    if (!svgElement) return;

    let svgInnerHtml = svgElement.innerHTML;
    // Replace standard SVG attributes with React equivalents
    svgInnerHtml = svgInnerHtml
      .replace(/stroke-width=/g, 'strokeWidth=')
      .replace(/stroke-linecap=/g, 'strokeLinecap=')
      .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
      .replace(/stroke-dasharray=/g, 'strokeDasharray=')
      .replace(/fill-opacity=/g, 'fillOpacity=')
      .replace(/viewbox=/g, 'viewBox=');

    const viewBoxAttr = svgElement.getAttribute('viewBox') || '0 0 400 400';
    const bgFill = svgElement.style.backgroundColor || 'transparent';

    const jsxCode = `import React from 'react';

export const Isometric_${shape.id.replace(/[^a-zA-Z0-9]/g, '_')} = ({ 
  className = '', 
  size = '100%' 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="${viewBoxAttr}"
      className={className}
      style={{ backgroundColor: '${bgFill}' }}
    >
      ${svgInnerHtml.trim()}
    </svg>
  );
};

export default Isometric_${shape.id.replace(/[^a-zA-Z0-9]/g, '_')};`;

    navigator.clipboard.writeText(jsxCode);
    setCopiedJsx(true);
    setTimeout(() => setCopiedJsx(false), 2000);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-neutral-400">Export & Integrate</h3>
      
      <div className="grid grid-cols-1 gap-2">
        {/* Download File */}
        <button
          onClick={onDownloadFile}
          id="btn-download-svg"
          className="flex items-center justify-between w-full px-4 py-3.5 text-xs font-medium uppercase tracking-[0.15em] text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-none border border-neutral-200 transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Download className="w-4 h-4" /> Download Standalone SVG
          </span>
          <span className="text-[10px] bg-black text-neutral-300 px-2 py-0.5 border border-neutral-800">SVG</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          {/* Copy Raw Code */}
          <button
            onClick={handleCopyCode}
            id="btn-copy-code"
            className="flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium uppercase tracking-wider text-neutral-200 hover:bg-neutral-800 bg-neutral-900 border border-neutral-800 rounded-none transition-all cursor-pointer hover:text-white"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy Markup
              </>
            )}
          </button>

          {/* Copy React Code */}
          <button
            onClick={handleCopyJsx}
            id="btn-copy-jsx"
            className="flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium uppercase tracking-wider text-neutral-200 hover:bg-neutral-800 bg-neutral-900 border border-neutral-800 rounded-none transition-all cursor-pointer hover:text-white"
          >
            {copiedJsx ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" /> Copied React!
              </>
            ) : (
              <>
                <Code className="w-4 h-4" /> Copy React
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
