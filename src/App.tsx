import React, { useState, useRef } from 'react';
import { SHAPES_DATA } from './data/shapes';
import { StyleOptions, ShapeDefinition } from './types';
import { IsometricShape } from './components/IsometricShape';
import { ExportPanel } from './components/ExportPanel';
import { getBoxFaces, projectEllipse, projectLine, getPathBoundingBox } from './utils/geometry';
import { 
  RotateCw, 
  Layers, 
  Grid, 
  Settings, 
  Download, 
  Maximize2, 
  Compass, 
  Sparkles, 
  Sliders, 
  Info,
  Check,
  Copy
} from 'lucide-react';

interface SheetCell {
  shapeId: string;
  x: number;
  y: number;
}

const COMPOSITION_CELLS: SheetCell[] = [
  // Row 1: Y = 185 (4 columns)
  { shapeId: 'single-cube', x: 185, y: 185 },
  { shapeId: 'cube-pyramid', x: 560, y: 185 },
  { shapeId: 'rectangular-bar', x: 935, y: 185 },
  { shapeId: 'hollow-cube', x: 1315, y: 185 },

  // Row 2: Y = 500 (4 columns)
  { shapeId: 'segmented-block', x: 185, y: 500 },
  { shapeId: 'parallel-plates', x: 560, y: 500 },
  { shapeId: 'slab-hole', x: 935, y: 500 },
  { shapeId: 'puzzle-joint', x: 1315, y: 500 },

  // Row 3: Y = 815 (4 columns)
  { shapeId: '3d-cylinder', x: 185, y: 815 },
  { shapeId: 'static-shape-1', x: 560, y: 815 },
  { shapeId: 'static-shape-2', x: 935, y: 815 },
  { shapeId: 'static-shape-3', x: 1315, y: 815 },

  // Row 4: Y = 1130 (4 columns)
  { shapeId: 'static-shape-4', x: 185, y: 1130 },
  { shapeId: 'static-shape-5', x: 560, y: 1130 },
  { shapeId: 'static-shape-6', x: 935, y: 1130 },
  { shapeId: 'static-shape-7', x: 1315, y: 1130 },

  // Row 5: Y = 1445 (1 centered highlight)
  { shapeId: 'static-shape-8', x: 750, y: 1445 }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'inspector' | 'board'>('inspector');
  const [selectedShapeId, setSelectedShapeId] = useState<string>('3d-globe');
  
  // Default options loaded from the Blueprint sketch theme
  const [options, setOptions] = useState<StyleOptions>({
    strokeColor: '#ffffff',
    strokeWidth: 1.5,
    fillOpacity: 0.35,
    topFaceColor: '#222222',
    leftFaceColor: '#1a1a1a',
    rightFaceColor: '#161616',
    modelFillColor: '#222222',
    useShading: true,
    shadingIntensity: 0.4,
    isometricAngle: 30,
    scale: 130, // Default inspect scale
    rotationX: 35.264, // Isometric tilt
    rotationY: 0,
    rotationZ: 45,     // Isometric orbit
    showGrid: true,
    gridSize: 4,
    gridColor: '#222222',
    backgroundColor: '#000000'
  });

  // Track dynamic positions of composition tiles
  const [cells, setCells] = useState<SheetCell[]>(COMPOSITION_CELLS);
  const [draggedCellId, setDraggedCellId] = useState<string | null>(null);
  const cellDragOffsetRef = useRef({ x: 0, y: 0 });
  const wasMovedRef = useRef(false);

  // Track dragging state for intuitive 3D rotation
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const rotStartRef = useRef({ x: 0, z: 0 });
  const [copiedAll, setCopiedAll] = useState(false);

  const selectedShape = SHAPES_DATA.find(s => s.id === selectedShapeId) || SHAPES_DATA[0];

  const handleResetRotation = () => {
    setOptions(prev => ({
      ...prev,
      rotationX: 35.264,
      rotationY: 0,
      rotationZ: 45
    }));
  };

  const handleResetLayout = () => {
    setCells(COMPOSITION_CELLS);
  };

  // Mouse drag handlers for 3D rotation orbit on viewer
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    wasMovedRef.current = false;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    rotStartRef.current = { x: options.rotationX, z: options.rotationZ };
  };

  const handleCellMouseDown = (e: React.MouseEvent, shapeId: string) => {
    e.stopPropagation();
    wasMovedRef.current = false;
    setDraggedCellId(shapeId);

    const svg = document.getElementById('svg-composition-board');
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const xCoordinate = ((e.clientX - rect.left) / rect.width) * 1500;
    const yCoordinate = ((e.clientY - rect.top) / rect.height) * 1620;

    const cell = cells.find(c => c.shapeId === shapeId);
    if (cell) {
      cellDragOffsetRef.current = {
        x: xCoordinate - cell.x,
        y: yCoordinate - cell.y
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggedCellId) {
      wasMovedRef.current = true;
      const svg = document.getElementById('svg-composition-board');
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const xCoordinate = ((e.clientX - rect.left) / rect.width) * 1500;
      const yCoordinate = ((e.clientY - rect.top) / rect.height) * 1620;

      const newX = xCoordinate - cellDragOffsetRef.current.x;
      const newY = yCoordinate - cellDragOffsetRef.current.y;

      setCells(prev => prev.map(c => c.shapeId === draggedCellId ? {
        ...c,
        x: Math.max(0, Math.min(1500, newX)),
        y: Math.max(0, Math.min(1620, newY))
      } : c));
      return;
    }

    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      wasMovedRef.current = true;
    }

    // Horiz drag adjusts rotationZ (yaw/orbit), vert drag adjusts rotationX (pitch/altitude)
    setOptions(prev => ({
      ...prev,
      rotationZ: (rotStartRef.current.z + dx * 0.5) % 360,
      rotationX: Math.max(-90, Math.min(90, rotStartRef.current.x - dy * 0.5))
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedCellId(null);
  };

  // Touch handlers for mobile support
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) return;
    wasMovedRef.current = false;
    setIsDragging(true);
    const touch = e.touches[0];
    dragStartRef.current = { x: touch.clientX, y: touch.clientY };
    rotStartRef.current = { x: options.rotationX, z: options.rotationZ };
  };

  const handleCellTouchStart = (e: React.TouchEvent, shapeId: string) => {
    e.stopPropagation();
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    wasMovedRef.current = false;
    setDraggedCellId(shapeId);

    const svg = document.getElementById('svg-composition-board');
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const xCoordinate = ((touch.clientX - rect.left) / rect.width) * 1500;
    const yCoordinate = ((touch.clientY - rect.top) / rect.height) * 1620;

    const cell = cells.find(c => c.shapeId === shapeId);
    if (cell) {
      cellDragOffsetRef.current = {
        x: xCoordinate - cell.x,
        y: yCoordinate - cell.y
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];

    if (draggedCellId) {
      wasMovedRef.current = true;
      const svg = document.getElementById('svg-composition-board');
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const xCoordinate = ((touch.clientX - rect.left) / rect.width) * 1500;
      const yCoordinate = ((touch.clientY - rect.top) / rect.height) * 1620;

      const newX = xCoordinate - cellDragOffsetRef.current.x;
      const newY = yCoordinate - cellDragOffsetRef.current.y;

      setCells(prev => prev.map(c => c.shapeId === draggedCellId ? {
        ...c,
        x: Math.max(0, Math.min(1500, newX)),
        y: Math.max(0, Math.min(1620, newY))
      } : c));
      return;
    }

    if (!isDragging) return;
    const dx = touch.clientX - dragStartRef.current.x;
    const dy = touch.clientY - dragStartRef.current.y;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      wasMovedRef.current = true;
    }

    setOptions(prev => ({
      ...prev,
      rotationZ: (rotStartRef.current.z + dx * 0.5) % 360,
      rotationX: Math.max(-90, Math.min(90, rotStartRef.current.x - dy * 0.5))
    }));
  };

  // Handles copying active inspector shape SVG
  const handleCopyCode = () => {
    const svgElement = document.getElementById(`svg-render-${selectedShape.id}`);
    if (!svgElement) return;
    const clone = svgElement.cloneNode(true) as SVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const svgString = clone.outerHTML;
    navigator.clipboard.writeText(svgString);
  };

  // Handles downloading active inspector shape XML file
  const handleDownloadFile = () => {
    const svgElement = document.getElementById(`svg-render-${selectedShape.id}`);
    if (!svgElement) return;
    const clone = svgElement.cloneNode(true) as SVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    
    // Inject custom styling variables explicitly so svg is completely standalone
    const blob = new Blob([clone.outerHTML], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const trigger = document.createElement('a');
    trigger.href = url;
    trigger.download = `${selectedShape.id}_isometric_vector.svg`;
    document.body.appendChild(trigger);
    trigger.click();
    document.body.removeChild(trigger);
    URL.revokeObjectURL(url);
  };

  // Handles copying complete composed sheet SVG
  const handleCopyAllSheet = () => {
    const svgElement = document.getElementById('svg-composition-board');
    if (!svgElement) return;
    const clone = svgElement.cloneNode(true) as SVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    navigator.clipboard.writeText(clone.outerHTML);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Handles downloading complete composed sheet file
  const handleDownloadAllSheet = () => {
    const svgElement = document.getElementById('svg-composition-board');
    if (!svgElement) return;
    const clone = svgElement.cloneNode(true) as SVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    
    const blob = new Blob([clone.outerHTML], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const trigger = document.createElement('a');
    trigger.href = url;
    trigger.download = 'isometric_composed_blueprint_sheet.svg';
    document.body.appendChild(trigger);
    trigger.click();
    document.body.removeChild(trigger);
    URL.revokeObjectURL(url);
  };

  // Helper calculation to draw one cell shape within the unified master SVG
  const renderCellComponents = (cell: SheetCell, shape: ShapeDefinition, cellScale: number) => {
    const shapeAsAny = shape as any;
    const isStaticPath = !!(shapeAsAny.fillPaths || shapeAsAny.strokePaths);

    if (isStaticPath) {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      const allPaths = [...(shapeAsAny.fillPaths || []), ...(shapeAsAny.strokePaths || [])];
      allPaths.forEach(p => {
        const box = getPathBoundingBox(p);
        minX = Math.min(minX, box.minX);
        minY = Math.min(minY, box.minY);
        maxX = Math.max(maxX, box.maxX);
        maxY = Math.max(maxY, box.maxY);
      });
      
      const bboxW = (maxX === -Infinity ? 100 : maxX) - (minX === Infinity ? 0 : minX);
      const bboxH = (maxY === -Infinity ? 100 : maxY) - (minY === Infinity ? 0 : minY);
      const pathCenterX = minX + bboxW / 2;
      const pathCenterY = minY + bboxH / 2;
      
      // Symmetrical size target to fit inside grid circle boundaries
      const targetDim = 110;
      const scaleFactor = bboxW > 0 && bboxH > 0 ? Math.min(targetDim / bboxW, targetDim / bboxH) : 1;
      
      const tx = -pathCenterX * scaleFactor;
      const ty = -pathCenterY * scaleFactor;
      const transformStr = `translate(${tx.toFixed(2)}, ${ty.toFixed(2)}) scale(${scaleFactor.toFixed(4)})`;

      return [
        <g key={`cell-${cell.shapeId}-static`} transform={transformStr}>
          {shapeAsAny.fillPaths && shapeAsAny.fillPaths.map((pathStr: string, idx: number) => (
            <path
              key={`cell-static-fill-${idx}`}
              d={pathStr}
              fill={options.strokeColor}
              fillOpacity={options.fillOpacity > 0 ? options.fillOpacity : 0.08}
              stroke="none"
              strokeLinejoin="round"
            />
          ))}
          {shapeAsAny.strokePaths && shapeAsAny.strokePaths.map((pathStr: string, idx: number) => (
            <path
              key={`cell-static-stroke-${idx}`}
              d={pathStr}
              fill="none"
              stroke={options.strokeColor}
              strokeWidth={options.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </g>
      ];
    }

    const pointsList: React.ReactNode[] = [];
    const localCenterX = 0;
    const localCenterY = 0;

    // 1. Process box faces
    shape.boxes.forEach((box, bIdx) => {
      const faces = getBoxFaces(box, bIdx, { ...options, scale: cellScale }, localCenterX, localCenterY);
      faces.forEach(face => {
        if (face.isVisible) {
          const ptsStr = face.points.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
          let baseFill = '';
          if (options.modelFillColor) {
            baseFill = options.modelFillColor;
          } else if (face.originalFaceType === 'top') {
            baseFill = options.topFaceColor;
          } else if (
            face.originalFaceType === 'front-left' || 
            face.originalFaceType === 'back-left' ||
            face.originalFaceType === 'bottom'
          ) {
            baseFill = options.leftFaceColor;
          } else {
            baseFill = options.rightFaceColor;
          }
          if (face.color) baseFill = face.color;

          pointsList.push(
            <g key={`cell-${cell.shapeId}-face-${bIdx}-${face.originalFaceType}`} data-depth={face.avgDepth}>
              <polygon
                points={ptsStr}
                fill={baseFill}
                fillOpacity={options.fillOpacity}
                stroke={options.strokeColor}
                strokeWidth={options.strokeWidth}
                strokeLinejoin="round"
              />
              {options.useShading && (
                <polygon
                  points={ptsStr}
                  fill="#000000"
                  fillOpacity={(1 - face.shadingFactor) * options.shadingIntensity * options.fillOpacity}
                />
              )}
            </g>
          );
        }
      });
    });

    // 2. Process ellipses
    if (shape.ellipses) {
      shape.ellipses.forEach((ellipse, eIdx) => {
        const projEllipse = projectEllipse(ellipse, { ...options, scale: cellScale }, localCenterX, localCenterY);
        pointsList.push(
          <g key={`cell-${cell.shapeId}-ellipse-${eIdx}`} data-depth={projEllipse.avgDepth}>
            <path
              d={projEllipse.pathData}
              fill="none"
              stroke={options.strokeColor}
              strokeWidth={options.strokeWidth}
              strokeLinecap="round"
            />
            {projEllipse.ticks.map((tick, tIdx) => (
              <line
                key={`tick-${tIdx}`}
                x1={tick.x1}
                y1={tick.y1}
                x2={tick.x2}
                y2={tick.y2}
                stroke={options.strokeColor}
                strokeWidth={options.strokeWidth}
                strokeLinecap="round"
              />
            ))}
          </g>
        );
      });
    }

    // 3. Process lines
    if (shape.lines) {
      shape.lines.forEach((line, lIdx) => {
        const projLine = projectLine(line, { ...options, scale: cellScale }, localCenterX, localCenterY);
        pointsList.push(
          <line
            key={`cell-${cell.shapeId}-line-${lIdx}`}
            data-depth={projLine.avgDepth}
            x1={projLine.x1}
            y1={projLine.y1}
            x2={projLine.x2}
            y2={projLine.y2}
            stroke={line.color || options.strokeColor}
            strokeWidth={options.strokeWidth}
            strokeLinecap="round"
          />
        );
      });
    }

    // Sort render nodes by data-depth
    return pointsList.sort((a, b) => {
      const depthA = Number((a as React.ReactElement).props['data-depth'] || 0);
      const depthB = Number((b as React.ReactElement).props['data-depth'] || 0);
      return depthA - depthB;
    });
  };

  return (
    <div className="min-h-screen bg-black text-neutral-300 flex flex-col p-6 sm:p-10 lg:p-12 font-sans" id="app-root">
      
      {/* Editorial Specimen Title & Navigation Header */}
      <header className="flex flex-col md:flex-row justify-between items-baseline border-b border-neutral-800 pb-6 mb-8 w-full max-w-7xl mx-auto">
        <div className="flex flex-col mb-4 md:mb-0">
          <span className="text-[10px] uppercase tracking-[0.3em] font-normal text-neutral-500 mb-1">
            Specimen No. 142 • Active Vectors
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-light tracking-tighter leading-none text-neutral-200">
            Isometric Archive
          </h1>
        </div>

        <nav className="flex gap-6 sm:gap-8 text-[11px] font-mono uppercase tracking-[0.18em] font-medium">
          <button
            onClick={() => setActiveTab('inspector')}
            id="tab-inspector"
            className={`pb-1 border-b-2 transition-all cursor-pointer ${
              activeTab === 'inspector'
                ? 'border-neutral-200 text-neutral-200'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Shape Inspector
          </button>
          <button
            onClick={() => setActiveTab('board')}
            id="tab-board"
            className={`pb-1 border-b-2 transition-all cursor-pointer ${
              activeTab === 'board'
                ? 'border-neutral-200 text-neutral-200'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Composition Grid
          </button>
        </nav>
      </header>

      {/* Main Content Pane */}
      <main className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row gap-8 lg:gap-10">

        {/* Outer view frame depending on active tab */}
        {activeTab === 'inspector' ? (
          <>
            {/* Left Box: Drag Interactive SVG Viewport */}
            <div className="flex-1 bg-[#0a0a0a] border border-neutral-800 rounded-none overflow-hidden flex flex-col relative min-h-[480px] lg:min-h-0">
                            {/* Floating control flags */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10 pointer-events-none">
                
                {/* Top Left: Reset Button */}
                <div className="pointer-events-auto">
                  <button
                    onClick={handleResetRotation}
                    id="btn-orient-iso"
                    className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-[9px] font-medium uppercase tracking-[0.15em] px-3.5 py-2 shadow-sm flex items-center border border-neutral-800 transition-all cursor-pointer"
                  >
                    Snap Isometric (30°)
                  </button>
                </div>

                {/* Top Right: Live Matrix */}
                <div className="pointer-events-auto bg-[#0a0a0a]/90 text-neutral-300 font-mono text-[9px] px-3.5 py-2 shadow-sm border border-neutral-800 backdrop-blur-md leading-relaxed flex flex-col min-w-[150px]">
                  <div className="text-neutral-200 font-medium uppercase tracking-[0.15em] border-b border-neutral-800 pb-1 mb-1 font-sans">
                    Live Matrix
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-500 uppercase text-[8px] font-sans">Tilt (Pitch)</span>
                    <span>{options.rotationX.toFixed(1)}°</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-500 uppercase text-[8px] font-sans">Orbit (Yaw)</span>
                    <span>{options.rotationZ.toFixed(1)}°</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-500 uppercase text-[8px] font-sans">Scale</span>
                    <span>{options.scale}px</span>
                  </div>
                </div>
              </div>

              {/* The Actual SVG Rendering Stage */}
              <div
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
                className={`flex-1 flex items-center justify-center cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
                style={{ backgroundColor: options.backgroundColor }}
              >
                <div className="w-[380px] h-[380px] flex items-center justify-center pointer-events-none">
                  <IsometricShape shape={selectedShape} options={options} width={400} height={400} />
                </div>
              </div>

              {/* Quick-switch gallery slides on bottom of the inspector */}
              <div className="bg-[#050505] border-t border-neutral-800 p-4">
                <h4 className="text-[10px] font-medium text-neutral-400 uppercase tracking-[0.2em] mb-2.5">
                  Vector Specimen Index
                </h4>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {SHAPES_DATA.map((s) => {
                    const isCurrent = s.id === selectedShapeId;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedShapeId(s.id)}
                        id={`btn-select-shape-${s.id}`}
                        className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-none text-[11px] font-medium uppercase tracking-wider border transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-neutral-100 border-neutral-100 text-black'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-850'
                        }`}
                      >
                        <span className="w-1.5 h-1.5" style={{ backgroundColor: isCurrent ? '#000000' : options.strokeColor }}></span>
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Box: Controls Dashboard */}
            <div className="w-full lg:w-[420px] bg-[#0a0a0a] border border-neutral-800 rounded-none p-6 flex flex-col space-y-6">
              
              {/* Header description */}
              <div className="border-b border-neutral-800 pb-4">
                <span className="text-[9px] uppercase tracking-[0.3em] font-medium text-neutral-500 block mb-1">
                  Catalogue No. {(SHAPES_DATA.findIndex(s => s.id === selectedShape.id) + 1).toString().padStart(3, '0')}
                </span>
                <h2 className="text-2xl font-display font-light text-neutral-200 leading-tight tracking-tight">
                  {selectedShape.name}
                </h2>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed text-left font-sans">
                  {selectedShape.description}
                </p>
              </div>

              {/* Geometry Customization & Colors Settings Panel */}
              <div className="pt-2 space-y-5">
                <h3 className="text-xs uppercase tracking-[0.18em] font-medium text-neutral-300 flex items-center gap-1.5 border-b border-neutral-800 pb-2">
                  <Sliders className="w-3.5 h-3.5 text-neutral-400" /> Geometry Customization
                </h3>

                <div className="space-y-4">
                  {/* Model Scale Slider */}
                  <div>
                    <div className="flex justify-between text-[11px] font-medium uppercase tracking-wide text-neutral-400 mb-1">
                      <span>Model Scaling</span>
                      <span className="font-mono text-neutral-200">{options.scale} px</span>
                    </div>
                    <input
                      type="range"
                      id="input-scale-slider"
                      min="60"
                      max="200"
                      step="5"
                      value={options.scale}
                      onChange={(e) => setOptions(prev => ({ ...prev, scale: parseInt(e.target.value) }))}
                      className="w-full h-1 bg-neutral-800 rounded-none appearance-none cursor-pointer accent-white"
                    />
                  </div>

                  {/* Stroke thickness */}
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
                      onChange={(e) => setOptions(prev => ({ ...prev, strokeWidth: parseFloat(e.target.value) }))}
                      className="w-full h-1 bg-neutral-800 rounded-none appearance-none cursor-pointer accent-white"
                    />
                  </div>

                  {/* Grid Lines options */}
                  <div className="flex items-center justify-between py-1 bg-neutral-950 p-2.5 border border-neutral-850">
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="chk-show-grid"
                        checked={options.showGrid}
                        onChange={(e) => setOptions(prev => ({ ...prev, showGrid: e.target.checked }))}
                        className="rounded-none border-neutral-700 text-black focus:ring-white w-3.5 h-3.5 cursor-pointer accent-white"
                      />
                      <label htmlFor="chk-show-grid" className="cursor-pointer text-[11px] font-medium uppercase tracking-wider text-neutral-300 font-sans">Isometric Grid Lines</label>
                    </span>
                  </div>
                </div>
              </div>

              {/* Geometry Palette Customizers */}
              <div className="pt-5 space-y-4">
                <h3 className="text-xs uppercase tracking-[0.18em] font-medium text-neutral-300 flex items-center gap-1.5 border-b border-neutral-800 pb-2">
                  <Sparkles className="w-3.5 h-3.5 text-neutral-400" /> Geometry Colors
                </h3>

                <div className="space-y-4">
                  {/* Canvas Backdrop BG Color */}
                  <div>
                    <div className="flex justify-between text-[11px] font-medium uppercase tracking-wide text-neutral-500 mb-1.5">
                      <span>Backdrop BG Color</span>
                      <span className="font-mono text-neutral-400 text-[10px]">{options.backgroundColor.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1.5 border border-neutral-800 p-1 bg-neutral-950 flex-1">
                        <input
                          type="color"
                          id="picker-bg-color"
                          value={options.backgroundColor}
                          onChange={(e) => setOptions(prev => ({ ...prev, backgroundColor: e.target.value }))}
                          className="w-8 h-8 border border-neutral-800 rounded-none cursor-pointer bg-transparent"
                        />
                        <span className="text-[10.5px] font-mono text-neutral-300 uppercase px-1">{options.backgroundColor}</span>
                      </div>
                    </div>
                    {/* Swatches block */}
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { color: '#ffffff', label: 'Paper' },
                        { color: '#faf7f2', label: 'Cream' },
                        { color: '#f1f5f9', label: 'Slate' },
                        { color: '#ecf2ff', label: 'Grid Blue' },
                        { color: '#1e293b', label: 'Charcoal' },
                        { color: '#090d16', label: 'Void Black' }
                      ].map((item, idx) => (
                        <button
                          key={`bg-swatch-${idx}`}
                          id={`btn-bg-swatch-${idx}`}
                          onClick={() => setOptions(prev => ({ ...prev, backgroundColor: item.color }))}
                          title={item.label}
                          className={`w-6 h-6 border transition-all cursor-pointer ${
                            options.backgroundColor.toLowerCase() === item.color.toLowerCase()
                              ? 'border-neutral-200 scale-110 ring-1 ring-neutral-400'
                              : 'border-neutral-850 hover:border-neutral-600'
                          }`}
                          style={{ backgroundColor: item.color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Model Fill Color */}
                  <div>
                    <div className="flex justify-between text-[11px] font-medium uppercase tracking-wide text-neutral-500 mb-1.5">
                      <span>Model Fill Color</span>
                      <span className="font-mono text-neutral-400 text-[10px]">{options.modelFillColor?.toUpperCase() || ''}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1.5 border border-neutral-800 p-1 bg-neutral-950 flex-1">
                        <input
                          type="color"
                          id="picker-model-fill-color"
                          value={options.modelFillColor || '#222222'}
                          onChange={(e) => setOptions(prev => ({ ...prev, modelFillColor: e.target.value }))}
                          className="w-8 h-8 border border-neutral-800 rounded-none cursor-pointer bg-transparent"
                        />
                        <span className="text-[10.5px] font-mono text-neutral-300 uppercase px-1">{options.modelFillColor}</span>
                      </div>
                    </div>
                    {/* Swatches block */}
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { color: '#222222', label: 'Dark Charcoal' },
                        { color: '#444444', label: 'Slate Gray' },
                        { color: '#888888', label: 'Cool Gray' },
                        { color: '#00e5ff', label: 'Tech Cyan' },
                        { color: '#10b981', label: 'Aero Emerald' },
                        { color: '#ef4444', label: 'Highland Highland' }
                      ].map((item, idx) => (
                        <button
                          key={`fill-swatch-${idx}`}
                          id={`btn-fill-swatch-${idx}`}
                          onClick={() => setOptions(prev => ({ ...prev, modelFillColor: item.color }))}
                          title={item.label}
                          className={`w-6 h-6 border transition-all cursor-pointer ${
                            options.modelFillColor?.toLowerCase() === item.color.toLowerCase()
                              ? 'border-neutral-200 scale-110 ring-1 ring-neutral-400'
                              : 'border-neutral-850 hover:border-neutral-600'
                          }`}
                          style={{ backgroundColor: item.color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Outline / Stroke Color */}
                  <div>
                    <div className="flex justify-between text-[11px] font-medium uppercase tracking-wide text-neutral-500 mb-1.5">
                      <span>Outline Color</span>
                      <span className="font-mono text-neutral-400 text-[10px]">{options.strokeColor.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1.5 border border-neutral-800 p-1 bg-neutral-950 flex-1">
                        <input
                          type="color"
                          id="picker-stroke-color"
                          value={options.strokeColor}
                          onChange={(e) => setOptions(prev => ({ ...prev, strokeColor: e.target.value }))}
                          className="w-8 h-8 border border-neutral-800 rounded-none cursor-pointer bg-transparent"
                        />
                        <span className="text-[10.5px] font-mono text-neutral-300 uppercase px-1">{options.strokeColor}</span>
                      </div>
                    </div>
                    {/* Swatches block */}
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { color: '#3b82f6', label: 'Blueprint Blue' },
                        { color: '#0f172a', label: 'Slate Black' },
                        { color: '#064e3b', label: 'Evergreen' },
                        { color: '#7c2d12', label: 'Burnt Clay' },
                        { color: '#00e5ff', label: 'Cyber Cyan' },
                        { color: '#ef4444', label: 'Crimson' }
                      ].map((item, idx) => (
                        <button
                          key={`stroke-swatch-${idx}`}
                          id={`btn-stroke-swatch-${idx}`}
                          onClick={() => setOptions(prev => ({ ...prev, strokeColor: item.color }))}
                          title={item.label}
                          className={`w-6 h-6 border transition-all cursor-pointer ${
                            options.strokeColor.toLowerCase() === item.color.toLowerCase()
                              ? 'border-neutral-200 scale-110 ring-1 ring-neutral-400'
                              : 'border-neutral-850 hover:border-neutral-600'
                          }`}
                          style={{ backgroundColor: item.color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Isometric Grid Lines Color */}
                  <div>
                    <div className="flex justify-between text-[11px] font-medium uppercase tracking-wide text-neutral-500 mb-1.5">
                      <span>Grid Line Color</span>
                      <span className="font-mono text-neutral-400 text-[10px]">{options.gridColor.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1.5 border border-neutral-800 p-1 bg-neutral-950 flex-1">
                        <input
                          type="color"
                          id="picker-grid-color"
                          value={options.gridColor}
                          onChange={(e) => setOptions(prev => ({ ...prev, gridColor: e.target.value }))}
                          className="w-8 h-8 border border-neutral-800 rounded-none cursor-pointer bg-transparent"
                        />
                        <span className="text-[10.5px] font-mono text-neutral-300 uppercase px-1">{options.gridColor}</span>
                      </div>
                    </div>
                    {/* Swatches block */}
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { color: '#bfdbfe', label: 'Blueprint' },
                        { color: '#94a3b8', label: 'Gray' },
                        { color: '#a7f3d0', label: 'Soft Green' },
                        { color: '#fdba74', label: 'Orange' },
                        { color: '#091f42', label: 'Cyber Blue' },
                        { color: '#fca5a5', label: 'Soft Red' }
                      ].map((item, idx) => (
                        <button
                          key={`grid-swatch-${idx}`}
                          id={`btn-grid-swatch-${idx}`}
                          onClick={() => setOptions(prev => ({ ...prev, gridColor: item.color }))}
                          title={item.label}
                          className={`w-6 h-6 border transition-all cursor-pointer ${
                            options.gridColor.toLowerCase() === item.color.toLowerCase()
                              ? 'border-neutral-200 scale-110 ring-1 ring-neutral-400'
                              : 'border-neutral-850 hover:border-neutral-600'
                          }`}
                          style={{ backgroundColor: item.color }}
                        />
                      ))}
                    </div>
                  </div>


                </div>
              </div>



              {/* Exporter triggers */}
              <div className="border-t border-neutral-800 pt-5">
                <ExportPanel
                  shape={selectedShape}
                  onCopyCode={handleCopyCode}
                  onDownloadFile={handleDownloadFile}
                />
              </div>

            </div>
          </>
        ) : (
          /* Composed Unified Sketch Sheet Board View */
          <div className="w-full flex flex-col space-y-6">
            
            {/* Control toolbar banner */}
            <div className="bg-[#0a0a0a] border border-neutral-800 rounded-none p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-neutral-900 border border-neutral-800 p-2 rounded-none text-neutral-300">
                  <Grid className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-neutral-200">Unified Composition Board</h2>
                  <p className="text-xs text-neutral-400">All 17 isometric geometries composed into their original sketch grid coordinates.</p>
                </div>
              </div>

              {/* Composition actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetLayout}
                  id="btn-reset-layout"
                  className="flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 hover:text-neutral-200 rounded-none transition-all cursor-pointer"
                >
                  <Compass className="w-4 h-4" /> Reset Layout
                </button>

                <button
                  onClick={handleCopyAllSheet}
                  id="btn-copy-sheet"
                  className="flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 hover:text-neutral-200 rounded-none transition-all cursor-pointer"
                >
                  {copiedAll ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" /> Copied Sheet SVG!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copy Sheet SVG Code
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleDownloadAllSheet}
                  id="btn-download-sheet"
                  className="flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-medium text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-none transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download Complete Blueprint Sheet
                </button>
              </div>
            </div>

            {/* Giant synchronous interactive drawing stage */}
            <div className="bg-[#0a0a0a] border border-neutral-800 rounded-none p-4 md:p-8 flex flex-col items-center shadow-sm overflow-hidden relative">
              
              {/* Overlay guides */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none z-10">
                <div className="bg-black/95 backdrop-blur-md text-neutral-250 text-[10px] px-3.5 py-1.5 border border-neutral-800 rounded-none font-medium flex items-center gap-2 shadow-sm">
                  <RotateCw className="w-3.5 h-3.5 text-indigo-400 rotate-90" />
                  <span>Orbit sheet: Drag background to spin shapes!</span>
                  <span className="text-neutral-700">|</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span>Move elements: Drag any shape directly to arrange in space!</span>
                </div>
                
                <div className="text-[10px] font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 rounded-none px-3 py-1">
                  Canvas size: 1500 x 1620 px
                </div>
              </div>

              {/* Drag interactive wrapper */}
              <div 
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
                style={{ backgroundColor: options.backgroundColor }}
                className={`w-full max-w-full overflow-x-auto border border-neutral-800 rounded-none cursor-grab ${
                  isDragging ? 'cursor-grabbing' : ''
                }`}
              >
                <div className="min-w-[1200px] aspect-[150/162] relative p-1 pointer-events-none">
                  
                  {/* Master responsive single SVG Composition Canvas */}
                  <svg
                     id="svg-composition-board"
                     viewBox="0 0 1500 1620"
                     width="1500"
                     height="1620"
                     className="w-full h-full select-none"
                     style={{ background: options.backgroundColor, transition: 'background 0.3s ease' }}
                  >
                    
                    {/* Background Grids */}
                    {options.showGrid && (
                      <g stroke={options.gridColor} strokeWidth="0.5" strokeOpacity="0.4" strokeDasharray="3,3">
                        {/* Render a giant XY layout grid on center board */}
                        {Array.from({ length: 30 }).map((_, gIdx) => {
                          const stepVec = 50;
                          const gridCoord = (gIdx - 15) * stepVec;
                          const gl1 = projectLine({ p1: { x: gridCoord, y: -800, z: -1 }, p2: { x: gridCoord, y: 800, z: -1 } }, options, 750, 810);
                          const gl2 = projectLine({ p1: { x: -800, y: gridCoord, z: -1 }, p2: { x: 800, y: gridCoord, z: -1 } }, options, 750, 810);
                          return (
                            <g key={`composition-grid-${gIdx}`}>
                              <line x1={gl1.x1} y1={gl1.y1} x2={gl1.x2} y2={gl1.y2} />
                              <line x1={gl2.x1} y1={gl2.y1} x2={gl2.x2} y2={gl2.y2} />
                            </g>
                          );
                        })}
                      </g>
                    )}

                    {/* Paint each cell */}
                    {cells.map((cell) => {
                      const shape = SHAPES_DATA.find(s => s.id === cell.shapeId);
                      if (!shape) return null;

                      // Symmetrical spacing adjustments for rows
                      return (
                        <g 
                          key={`cell-${cell.shapeId}`} 
                          transform={`translate(${cell.x}, ${cell.y})`}
                          className="cursor-grab active:cursor-grabbing pointer-events-auto hover:opacity-90 hover:scale-105 transition-all select-none"
                          style={{ transformOrigin: `${cell.x}px ${cell.y}px` }}
                          onMouseDown={(e) => handleCellMouseDown(e, cell.shapeId)}
                          onTouchStart={(e) => handleCellTouchStart(e, cell.shapeId)}
                          onClick={() => {
                            if (wasMovedRef.current) return;
                            setSelectedShapeId(cell.shapeId);
                            setActiveTab('inspector');
                          }}
                        >
                          {/* Inner cell visual circle guide boundaries */}
                          <circle r="120" fill="none" stroke={options.strokeColor} strokeWidth="0.5" strokeOpacity="0.1" strokeDasharray="1,2" />
                          
                          {/* Hover target bounding label helper */}
                          <text 
                            y="-110" 
                            textAnchor="middle" 
                            fontFamily="monospace" 
                            fontSize="9" 
                            fill={options.strokeColor} 
                            fillOpacity="0.5"
                            fontWeight="bold"
                          >
                            {shape.name.toUpperCase()}
                          </text>

                          {/* local cell rendering components */}
                          {renderCellComponents(cell, shape, options.scale * 0.75)}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Bottom Quick Tips */}
              <div className="mt-4 flex items-center gap-2 text-[11px] text-neutral-400 font-medium">
                <Info className="w-4 h-4 text-neutral-500" />
                <span>Tip: Click any shape label or drawing on the board to jump directly inside and inspect/export that individual 3D model!</span>
              </div>
            </div>
            
          </div>
        )}
      </main>

      {/* Footer copyright */}
      <footer className="bg-black text-neutral-500 py-6 text-center text-xs mt-12 border-t border-neutral-900">
        <p className="font-mono">Isometric SVG Workbench © 2026 • Crafted with precision isometric vectors</p>
      </footer>
    </div>
  );
}
