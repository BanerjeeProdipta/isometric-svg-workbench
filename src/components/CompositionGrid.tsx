import React, { useMemo, useState } from 'react';
import { Check, Copy, Download, Grid } from 'lucide-react';
import { SHAPES_DATA } from '../data/shapes';
import { StyleOptions, ShapeDefinition } from '../types';
import {
  BOARD_VIEWBOX,
  COMPOSITION_CELLS,
  BoundingBox,
  SheetCell,
} from '../data/composition';
import {
  getBoxFaces,
  projectEllipse,
  projectLine,
  getPathBoundingBox,
} from '../utils/geometry';
import { hexToRgba } from '../utils/color';

interface CompositionGridProps {
  options: StyleOptions;
  onSelectCell: (cell: SheetCell) => void;
  onCopySheet: () => void;
  onDownloadSheet: () => void;
}

const STATIC_SHAPE_BOUNDS = new Map<string, BoundingBox>();

for (const shape of SHAPES_DATA) {
  const shapeAsAny = shape as any;
  const fillPaths = shapeAsAny.fillPaths || [];
  const strokePaths = shapeAsAny.strokePaths || [];

  if (!fillPaths.length && !strokePaths.length) continue;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  [...fillPaths, ...strokePaths].forEach((pathStr: string) => {
    const box = getPathBoundingBox(pathStr);
    minX = Math.min(minX, box.minX);
    minY = Math.min(minY, box.minY);
    maxX = Math.max(maxX, box.maxX);
    maxY = Math.max(maxY, box.maxY);
  });

  STATIC_SHAPE_BOUNDS.set(shape.id, {
    minX: minX === Infinity ? 0 : minX,
    minY: minY === Infinity ? 0 : minY,
    maxX: maxX === -Infinity ? 100 : maxX,
    maxY: maxY === -Infinity ? 100 : maxY,
  });
}

const renderCellComponents = (
  cell: SheetCell,
  shape: ShapeDefinition,
  options: StyleOptions,
  cellScale: number,
) => {
  const shapeAsAny = shape as any;
  const isStaticPath = !!(shapeAsAny.fillPaths || shapeAsAny.strokePaths);

  if (isStaticPath) {
    const cachedBounds =
      STATIC_SHAPE_BOUNDS.get(shape.id) ||
      ({
        minX: 0,
        minY: 0,
        maxX: 100,
        maxY: 100,
      } as BoundingBox);

    const bboxW = cachedBounds.maxX - cachedBounds.minX;
    const bboxH = cachedBounds.maxY - cachedBounds.minY;
    const pathCenterX = cachedBounds.minX + bboxW / 2;
    const pathCenterY = cachedBounds.minY + bboxH / 2;

    const targetDim = 110;
    const scaleFactor =
      bboxW > 0 && bboxH > 0
        ? Math.min(targetDim / bboxW, targetDim / bboxH)
        : 1;

    const tx = -pathCenterX * scaleFactor;
    const ty = -pathCenterY * scaleFactor;
    const transformStr = `translate(${tx.toFixed(2)}, ${ty.toFixed(2)}) scale(${scaleFactor.toFixed(4)})`;

    return (
      <g key={`cell-${cell.shapeId}-static`} transform={transformStr}>
        {shapeAsAny.fillPaths &&
          shapeAsAny.fillPaths.map((pathStr: string, idx: number) => (
            <path
              key={`cell-static-fill-${idx}`}
              d={pathStr}
              fill={options.strokeColor}
              fillOpacity={options.modelFillOpacity * options.fillOpacity}
              stroke="none"
              strokeLinejoin="round"
            />
          ))}
        {shapeAsAny.strokePaths &&
          shapeAsAny.strokePaths.map((pathStr: string, idx: number) => (
            <path
              key={`cell-static-stroke-${idx}`}
              d={pathStr}
              fill="none"
              stroke={options.strokeColor}
              strokeWidth={options.strokeWidth}
              strokeOpacity={options.strokeOpacity}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
      </g>
    );
  }

  const pointsList: React.ReactNode[] = [];
  const localCenterX = 0;
  const localCenterY = 0;

  shape.boxes.forEach((box, bIdx) => {
    const faces = getBoxFaces(
      box,
      bIdx,
      { ...options, scale: cellScale },
      localCenterX,
      localCenterY,
    );
    faces.forEach((face) => {
      if (!face.isVisible) return;
      const ptsStr = face.points
        .map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`)
        .join(' ');
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
        <g
          key={`cell-${cell.shapeId}-face-${bIdx}-${face.originalFaceType}`}
          data-depth={face.avgDepth}
        >
          <polygon
            points={ptsStr}
            fill={baseFill}
            fillOpacity={options.modelFillOpacity * options.fillOpacity}
            stroke={options.strokeColor}
            strokeWidth={options.strokeWidth}
            strokeOpacity={options.strokeOpacity}
            strokeLinejoin="round"
          />
          {options.useShading && (
            <polygon
              points={ptsStr}
              fill="#000000"
              fillOpacity={
                (1 - face.shadingFactor) *
                options.shadingIntensity *
                options.fillOpacity
              }
            />
          )}
        </g>,
      );
    });
  });

  if (shape.ellipses) {
    shape.ellipses.forEach((ellipse, eIdx) => {
      const projEllipse = projectEllipse(
        ellipse,
        { ...options, scale: cellScale },
        localCenterX,
        localCenterY,
      );
      pointsList.push(
        <g
          key={`cell-${cell.shapeId}-ellipse-${eIdx}`}
          data-depth={projEllipse.avgDepth}
        >
              <path
                d={projEllipse.pathData}
                fill="none"
                stroke={options.strokeColor}
                strokeWidth={options.strokeWidth}
                strokeOpacity={options.strokeOpacity}
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
              strokeOpacity={options.strokeOpacity}
              strokeLinecap="round"
            />
          ))}
        </g>,
      );
    });
  }

  if (shape.lines) {
    shape.lines.forEach((line, lIdx) => {
      const projLine = projectLine(
        line,
        { ...options, scale: cellScale },
        localCenterX,
        localCenterY,
      );
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
          strokeOpacity={options.strokeOpacity}
          strokeLinecap="round"
        />,
      );
    });
  }

  return pointsList.sort((a, b) => {
    const depthA = Number((a as React.ReactElement).props['data-depth'] || 0);
    const depthB = Number((b as React.ReactElement).props['data-depth'] || 0);
    return depthA - depthB;
  });
};

export const CompositionGrid: React.FC<CompositionGridProps> = ({
  options,
  onSelectCell,
  onCopySheet,
  onDownloadSheet,
}) => {
  const [copiedAll, setCopiedAll] = useState(false);

  const compositionCells = useMemo(
    () =>
      COMPOSITION_CELLS.map((cell) => {
        const shape = SHAPES_DATA.find((s) => s.id === cell.shapeId);
        if (!shape) return null;

        return (
          <g
            key={`cell-${cell.shapeId}`}
            transform={`translate(${cell.x}, ${cell.y})`}
            className="select-none cursor-pointer transition-opacity hover:opacity-95"
            role="button"
            tabIndex={0}
            aria-label={`Inspect ${shape.name}`}
            onClick={() => onSelectCell(cell)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectCell(cell);
              }
            }}
          >
            <rect
              x="-128"
              y="-128"
              width="256"
              height="256"
              rx="0"
              ry="0"
              fill="none"
              stroke="rgba(255, 158, 207, 0.55)"
              strokeWidth="1.2"
            />
            <rect
              x="-120"
              y="-120"
              width="240"
              height="240"
              rx="0"
              ry="0"
              fill="none"
              stroke="rgba(255, 158, 207, 0.16)"
              strokeWidth="0.6"
            />

            <text
              y="-110"
              textAnchor="middle"
              fontFamily="monospace"
              fontSize="9"
              fill="rgba(255, 158, 207, 0.9)"
              fontWeight="bold"
            >
              {shape.name.toUpperCase()}
            </text>

            {renderCellComponents(cell, shape, options, options.scale * 0.75)}
          </g>
        );
      }),
    [onSelectCell, options],
  );

  return (
    <div className="w-full flex flex-col space-y-6">
      <div className="bg-[#0a0a0a] border border-dashed border-neutral-700 rounded-none p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-neutral-900 border border-dashed border-neutral-700 p-2 rounded-none text-[#ff9ecf]">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-mono text-neutral-200">
              // Unified Composition Board
            </h2>
            <p className="text-xs text-neutral-500 font-mono">
              All 17 isometric geometries composed into their original sketch
              grid coordinates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onCopySheet();
              setCopiedAll(true);
              setTimeout(() => setCopiedAll(false), 2000);
            }}
            id="btn-copy-sheet"
            className="flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-mono text-neutral-300 bg-neutral-900 border border-dashed border-neutral-700 hover:bg-neutral-800 rounded-none transition-all cursor-pointer"
          >
            {copiedAll ? (
              <>
                <Check className="w-4 h-4 text-[#ff9ecf]" /> // Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> // Copy Sheet SVG
              </>
            )}
          </button>

          <button
            onClick={onDownloadSheet}
            id="btn-download-sheet"
            className="flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-mono text-[#ff9ecf] bg-transparent border border-dashed border-[#ff9ecf]/40 hover:bg-[#ff9ecf]/10 rounded-none transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> // Export Blueprint
          </button>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-dashed border-neutral-700 rounded-none p-4 md:p-8 flex flex-col items-center overflow-hidden relative">
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none z-10">
          <div className="bg-black/95 text-[#ff9ecf]/90 text-[10px] px-3.5 py-1.5 border border-dashed border-neutral-700 rounded-none font-mono flex items-center gap-2">
            <span className="text-neutral-500">//</span>
            <span>Blueprint overview - all 17 specimens</span>
          </div>

          <div className="text-[10px] font-mono text-neutral-600 bg-neutral-900 border border-dashed border-neutral-700 rounded-none px-3 py-1">
            [ {BOARD_VIEWBOX.width} x {BOARD_VIEWBOX.height} ]
          </div>
        </div>

        <div
          style={{
            backgroundColor: hexToRgba(
              options.backgroundColor,
              options.backgroundOpacity,
            ),
          }}
          className="w-full max-w-full overflow-x-auto border border-dashed border-neutral-700 rounded-none bg-canvas-dots"
        >
          <div className="min-w-[1200px] aspect-[150/162] relative p-1">
              <svg
                id="svg-composition-board"
                viewBox={`0 0 ${BOARD_VIEWBOX.width} ${BOARD_VIEWBOX.height}`}
                width={BOARD_VIEWBOX.width}
                height={BOARD_VIEWBOX.height}
                className="w-full h-full select-none"
                style={{
                  background: hexToRgba(
                    options.backgroundColor,
                    options.backgroundOpacity,
                  ),
                  transition: 'background 0.3s ease',
              }}
            >
              <rect
                x="20"
                y="20"
                width="1460"
                height="1580"
                fill="none"
                stroke="rgba(255, 153, 204, 0.12)"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <rect
                x="25"
                y="25"
                width="1450"
                height="1570"
                fill="none"
                stroke="rgba(255, 153, 204, 0.06)"
                strokeWidth="0.5"
              />

              <g stroke="rgba(255, 153, 204, 0.18)" strokeWidth="0.5">
                {[0, 250, 500, 750, 1000, 1250, 1500].map((x) => (
                  <g key={`dim-tick-top-${x}`}>
                    <line x1={x} y1="16" x2={x} y2="24" />
                    <text
                      x={x}
                      y="12"
                      textAnchor="middle"
                      fill="rgba(255, 153, 204, 0.24)"
                      fontSize="7"
                      fontFamily="monospace"
                    >
                      {x}
                    </text>
                  </g>
                ))}
                {[0, 270, 540, 810, 1080, 1350, 1620].map((y) => (
                  <g key={`dim-tick-left-${y}`}>
                    <line x1="16" y1={y} x2="24" y2={y} />
                    <text
                      x="10"
                      y={y + 2}
                      textAnchor="end"
                      fill="rgba(255, 153, 204, 0.24)"
                      fontSize="7"
                      fontFamily="monospace"
                    >
                      {y}
                    </text>
                  </g>
                ))}
              </g>

              {compositionCells}
            </svg>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-[11px] text-neutral-600 font-mono">
          <span className="text-[#ff9ecf]/55">//</span>
          <span>Click any shape to inspect its geometry in the Shape Inspector view.</span>
        </div>
      </div>
    </div>
  );
};
