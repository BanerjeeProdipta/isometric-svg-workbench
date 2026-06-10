import React, { useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sliders, Sparkles } from 'lucide-react';
import { ExportPanel } from './ExportPanel';
import { IsometricShape } from './IsometricShape';
import { SHAPES_DATA } from '../data/shapes';
import { COMPOSITION_CELLS, INSPECTOR_DEFAULT_SHAPE_ID } from '../data/composition';
import { buildInspectorPath, parseRouteNumber } from '../lib/workbench-routing';
import { StyleOptions } from '../types';
import { hexToRgba } from '../utils/color';

interface InspectorWorkspaceProps {
  options: StyleOptions;
  setOptions: React.Dispatch<React.SetStateAction<StyleOptions>>;
}

const normalizeAngle = (value: number) => ((value % 360) + 360) % 360;

const SHAPE_INDEX_BY_ID = new Map(
  SHAPES_DATA.map((shape, index) => [shape.id, index] as const),
);

interface ColorOpacityFieldProps {
  label: string;
  value: string;
  opacity: number;
  colorId: string;
  opacityId: string;
  onColorChange: (value: string) => void;
  onOpacityChange: (value: number) => void;
}

const ColorOpacityField: React.FC<ColorOpacityFieldProps> = ({
  label,
  value,
  opacity,
  colorId,
  opacityId,
  onColorChange,
  onOpacityChange,
}) => (
  <div>
    <div className="flex justify-between text-[11px] font-medium uppercase tracking-wide text-neutral-500 mb-1.5">
      <span>{label}</span>
      <span className="font-mono text-neutral-400 text-[10px]">
        {value.toUpperCase()} / {Math.round(opacity * 100)}%
      </span>
    </div>
    <div className="flex items-center gap-2 mb-2">
      <div className="flex items-center gap-1.5 border border-dashed border-neutral-700 p-1 bg-neutral-950 flex-1">
        <input
          type="color"
          id={colorId}
          value={value}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-8 h-8 border border-dashed border-neutral-700 rounded-none cursor-pointer bg-transparent"
        />
        <span className="text-[10.5px] font-mono text-neutral-300 uppercase px-1">
          {value}
        </span>
      </div>
    </div>
    <div>
      <div className="flex justify-between text-[10px] uppercase tracking-[0.18em] text-neutral-500 mb-1">
        <span>Opacity</span>
        <span className="font-mono text-neutral-300">{Math.round(opacity * 100)}%</span>
      </div>
      <input
        type="range"
        id={opacityId}
        min="0"
        max="100"
        step="1"
        value={Math.round(opacity * 100)}
        onChange={(e) => onOpacityChange(Number(e.target.value) / 100)}
        className="w-full h-1 bg-neutral-800 rounded-none appearance-none cursor-pointer accent-[#ff9ecf]"
      />
    </div>
  </div>
);

export const InspectorWorkspace: React.FC<InspectorWorkspaceProps> = ({
  options,
  setOptions,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const rotStartRef = useRef({ x: 0, z: 0 });

  const selectedSlug = searchParams.get('shape') || INSPECTOR_DEFAULT_SHAPE_ID;
  const routeX = parseRouteNumber(searchParams.get('x'), 185);
  const routeY = parseRouteNumber(searchParams.get('y'), 500);

  const selectedShape = useMemo(
    () => SHAPES_DATA.find((shape) => shape.id === selectedSlug) || SHAPES_DATA[0],
    [selectedSlug],
  );

  const selectedShapeIndex = SHAPE_INDEX_BY_ID.get(selectedShape.id) ?? 0;
  const selectedCell = COMPOSITION_CELLS.find((cell) => cell.shapeId === selectedShape.id);
  const routeCell = selectedCell || { shapeId: selectedShape.id, x: routeX, y: routeY };

  const handleResetRotation = () => {
    setOptions((prev) => ({
      ...prev,
      rotationX: 35.264,
      rotationY: 0,
      rotationZ: 45,
    }));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    rotStartRef.current = { x: options.rotationX, z: options.rotationZ };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    setOptions((prev) => ({
      ...prev,
      rotationZ: normalizeAngle(rotStartRef.current.z + dx * 0.5),
      rotationX: normalizeAngle(rotStartRef.current.x - dy * 0.5),
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) return;
    setIsDragging(true);
    const touch = e.touches[0];
    dragStartRef.current = { x: touch.clientX, y: touch.clientY };
    rotStartRef.current = { x: options.rotationX, z: options.rotationZ };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || e.touches.length === 0) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStartRef.current.x;
    const dy = touch.clientY - dragStartRef.current.y;

    setOptions((prev) => ({
      ...prev,
      rotationZ: normalizeAngle(rotStartRef.current.z + dx * 0.5),
      rotationX: normalizeAngle(rotStartRef.current.x - dy * 0.5),
    }));
  };

  const handleCopyCode = () => {
    const svgElement = document.getElementById(`svg-render-${selectedShape.id}`);
    if (!svgElement) return;
    const clone = svgElement.cloneNode(true) as SVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    navigator.clipboard.writeText(clone.outerHTML);
  };

  const handleDownloadFile = () => {
    const svgElement = document.getElementById(`svg-render-${selectedShape.id}`);
    if (!svgElement) return;
    const clone = svgElement.cloneNode(true) as SVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const blob = new Blob([clone.outerHTML], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const trigger = document.createElement('a');
    trigger.href = url;
    trigger.download = `${selectedShape.id}_isometric_vector.svg`;
    document.body.appendChild(trigger);
    trigger.click();
    document.body.removeChild(trigger);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-10">
      <div className="flex-1 bg-[#0a0a0a] border border-dashed border-neutral-700 rounded-none overflow-hidden flex flex-col relative min-h-[480px] lg:min-h-0">
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10 pointer-events-none">
          <div className="pointer-events-auto">
            <button
              onClick={handleResetRotation}
              id="btn-orient-iso"
              className="bg-neutral-900 hover:bg-neutral-800 text-[#ff9ecf] text-[9px] font-mono tracking-[0.15em] px-3.5 py-2 shadow-sm flex items-center border border-dashed border-neutral-700 transition-all cursor-pointer"
            >
              Snap Isometric (30°)
            </button>
          </div>

          <div className="pointer-events-auto bg-[#0a0a0a]/90 text-neutral-300 font-mono text-[9px] px-3.5 py-2 shadow-sm border border-dashed border-neutral-700 backdrop-blur-md leading-relaxed flex flex-col min-w-[170px]">
            <div className="text-[#ff9ecf] font-mono uppercase tracking-[0.15em] border-b border-dashed border-neutral-700 pb-1 mb-1">
              // Live Matrix
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-neutral-500 uppercase text-[8px] font-sans">
                Tilt (Pitch)
              </span>
              <span>{options.rotationX.toFixed(1)}°</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-neutral-500 uppercase text-[8px] font-sans">
                Orbit (Yaw)
              </span>
              <span>{options.rotationZ.toFixed(1)}°</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-neutral-500 uppercase text-[8px] font-sans">
                Anchor
              </span>
              <span>
                {routeCell.x}, {routeCell.y}
              </span>
            </div>
          </div>
        </div>

        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          className={`flex-1 flex items-center justify-center cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
          style={{
            backgroundColor: hexToRgba(
              options.backgroundColor,
              options.backgroundOpacity,
            ),
          }}
        >
          <div className="w-[380px] h-[380px] flex items-center justify-center pointer-events-none bg-canvas-dots">
            <IsometricShape shape={selectedShape} options={options} width={400} height={400} />
          </div>
        </div>

        <div className="bg-[#050505] border-t border-dashed border-neutral-700 p-4 bg-canvas-dots">
          <h4 className="text-[10px] font-mono text-[#ff9ecf]/70 tracking-[0.2em] mb-2.5">
            # Vector Specimen Index
          </h4>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {SHAPES_DATA.map((shape) => {
              const isCurrent = shape.id === selectedShape.id;
              const targetCell =
                COMPOSITION_CELLS.find((cell) => cell.shapeId === shape.id) ||
                routeCell;

              return (
                <button
                  key={shape.id}
                  onClick={() =>
                    navigate(buildInspectorPath(shape.id, targetCell.x, targetCell.y))
                  }
                  id={`btn-select-shape-${shape.id}`}
                  className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-none text-[11px] font-medium uppercase tracking-wider border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-neutral-100 border-neutral-100 text-black'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:border-[#ff9ecf]/35 hover:bg-neutral-800'
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5"
                    style={{
                      backgroundColor: isCurrent ? '#000000' : '#ff9ecf',
                    }}
                  />
                  {shape.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[420px] bg-[#0a0a0a] border border-dashed border-neutral-700 rounded-none p-6 flex flex-col space-y-6">
        <div className="border-b border-dashed border-neutral-700 pb-4">
          <span className="text-[9px] font-mono tracking-[0.3em] text-[#ff9ecf]/60 block mb-1">
            // Catalogue No. {(selectedShapeIndex + 1).toString().padStart(3, '0')}
          </span>
          <h2 className="text-2xl font-mono font-light text-neutral-200 leading-tight tracking-tight">
            {selectedShape.name}
          </h2>
          <p className="text-xs text-neutral-500 mt-2 leading-relaxed text-left font-mono">
            {selectedShape.description}
          </p>
        </div>

        <div className="pt-2 space-y-5">
          <h3 className="text-xs font-mono tracking-[0.18em] text-[#ff9ecf]/70 flex items-center gap-1.5 border-b border-dashed border-neutral-700 pb-2">
            <Sliders className="w-3.5 h-3.5 text-[#ff9ecf]/60" /> // Geometry Customization
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[11px] font-medium uppercase tracking-wide text-neutral-400 mb-1">
                <span>Model Scaling</span>
                <span className="font-mono text-neutral-200">{options.scale} px</span>
              </div>
              <input
                type="range"
                id="input-scale-slider"
                min="60"
                max="500"
                step="5"
                value={options.scale}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    scale: parseInt(e.target.value),
                  }))
                }
                className="w-full h-1 bg-neutral-800 rounded-none appearance-none cursor-pointer accent-[#ff9ecf]"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-medium uppercase tracking-wide text-neutral-400 mb-1">
                <span>Outline stroke width</span>
                <span className="font-mono text-neutral-200">{options.strokeWidth} px</span>
              </div>
              <input
                type="range"
                id="input-stroke-width-slider"
                min="0.5"
                max="4.0"
                step="0.1"
                value={options.strokeWidth}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    strokeWidth: parseFloat(e.target.value),
                  }))
                }
                className="w-full h-1 bg-neutral-800 rounded-none appearance-none cursor-pointer accent-[#ff9ecf]"
              />
            </div>
          </div>
        </div>

        <div className="pt-5 space-y-4">
          <h3 className="text-xs font-mono tracking-[0.18em] text-[#ff9ecf]/70 flex items-center gap-1.5 border-b border-dashed border-neutral-700 pb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#ff9ecf]/60" /> // Geometry Colors
          </h3>

          <div className="space-y-4">
            <ColorOpacityField
              label="Backdrop BG Color"
              value={options.backgroundColor}
              opacity={options.backgroundOpacity}
              colorId="picker-bg-color"
              opacityId="input-bg-opacity"
              onColorChange={(value) =>
                setOptions((prev) => ({
                  ...prev,
                  backgroundColor: value,
                }))
              }
              onOpacityChange={(value) =>
                setOptions((prev) => ({
                  ...prev,
                  backgroundOpacity: value,
                }))
              }
            />

            <ColorOpacityField
              label="Model Fill Color"
              value={options.modelFillColor || '#222222'}
              opacity={options.modelFillOpacity}
              colorId="picker-model-fill-color"
              opacityId="input-model-fill-opacity"
              onColorChange={(value) =>
                setOptions((prev) => ({
                  ...prev,
                  modelFillColor: value,
                }))
              }
              onOpacityChange={(value) =>
                setOptions((prev) => ({
                  ...prev,
                  modelFillOpacity: value,
                }))
              }
            />

            <ColorOpacityField
              label="Outline Color"
              value={options.strokeColor}
              opacity={options.strokeOpacity}
              colorId="picker-stroke-color"
              opacityId="input-stroke-opacity"
              onColorChange={(value) =>
                setOptions((prev) => ({
                  ...prev,
                  strokeColor: value,
                }))
              }
              onOpacityChange={(value) =>
                setOptions((prev) => ({
                  ...prev,
                  strokeOpacity: value,
                }))
              }
            />
          </div>
        </div>

        <div className="border-t border-dashed border-neutral-700 pt-5">
          <ExportPanel
            shape={selectedShape}
            onCopyCode={handleCopyCode}
            onDownloadFile={handleDownloadFile}
          />
        </div>
      </div>
    </div>
  );
};
