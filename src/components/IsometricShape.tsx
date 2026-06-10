import React, { useMemo } from 'react';
import { ShapeDefinition, StyleOptions } from '../types';
import {
  getBoxFaces,
  projectEllipse,
  projectLine,
  ProjectedFace,
  ProjectedEllipse,
  ProjectedLine,
  getPathBoundingBox
} from '../utils/geometry';
import { hexToRgba } from '../utils/color';

interface IsometricShapeProps {
  shape: ShapeDefinition;
  options: StyleOptions;
  width?: number;
  height?: number;
}

type DrawElement =
  | { type: 'face'; depth: number; data: ProjectedFace }
  | { type: 'ellipse'; depth: number; data: ProjectedEllipse; color?: string }
  | { type: 'line'; depth: number; data: ProjectedLine; color?: string };

export const IsometricShape: React.FC<IsometricShapeProps> = ({
  shape,
  options,
  width = 400,
  height = 400,
}) => {
  const centerX = width / 2;
  const centerY = height / 2;

  const shapeAsAny = shape as any;
  const isStaticPath = !!(shapeAsAny.fillPaths || shapeAsAny.strokePaths);

  const combinedBBox = useMemo(() => {
    if (!isStaticPath) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const allPaths = [...(shapeAsAny.fillPaths || []), ...(shapeAsAny.strokePaths || [])];
    allPaths.forEach(p => {
      const box = getPathBoundingBox(p);
      minX = Math.min(minX, box.minX);
      minY = Math.min(minY, box.minY);
      maxX = Math.max(maxX, box.maxX);
      maxY = Math.max(maxY, box.maxY);
    });
    return {
      minX: minX === Infinity ? 0 : minX,
      minY: minY === Infinity ? 0 : minY,
      maxX: maxX === -Infinity ? 100 : maxX,
      maxY: maxY === -Infinity ? 100 : maxY,
    };
  }, [shape.id, isStaticPath, shapeAsAny.fillPaths, shapeAsAny.strokePaths]);

  const transform = useMemo(() => {
    if (!combinedBBox) return '';
    const bboxW = combinedBBox.maxX - combinedBBox.minX;
    const bboxH = combinedBBox.maxY - combinedBBox.minY;
    if (bboxW <= 0 || bboxH <= 0) return '';
    
    // We want the shape to fit inside our responsive viewing size.
    const targetDim = (options.scale / 130) * 190;
    
    const scaleFactor = Math.min(targetDim / bboxW, targetDim / bboxH);
    const pathCenterX = combinedBBox.minX + bboxW / 2;
    const pathCenterY = combinedBBox.minY + bboxH / 2;
    
    const tx = centerX - pathCenterX * scaleFactor;
    const ty = centerY - pathCenterY * scaleFactor;
    return `translate(${tx.toFixed(2)}, ${ty.toFixed(2)}) scale(${scaleFactor.toFixed(4)})`;
  }, [combinedBBox, options.scale, centerX, centerY]);

  // Process and sort all 3D components for the painter's algorithm
  const sortedElements = useMemo(() => {
    const renderList: DrawElement[] = [];

    // 1. Process Box Faces
    shape.boxes.forEach((box, bIdx) => {
      const faces = getBoxFaces(box, bIdx, options, centerX, centerY);
      faces.forEach(face => {
        if (face.isVisible) {
          renderList.push({
            type: 'face',
            depth: face.avgDepth,
            data: face
          });
        }
      });
    });

    // 2. Process Ellipses
    if (shape.ellipses) {
      shape.ellipses.forEach(ellipse => {
        const projEllipse = projectEllipse(ellipse, options, centerX, centerY);
        renderList.push({
          type: 'ellipse',
          depth: projEllipse.avgDepth,
          data: projEllipse
        });
      });
    }

    // 3. Process Lines
    if (shape.lines) {
      shape.lines.forEach(line => {
        const projLine = projectLine(line, options, centerX, centerY);
        renderList.push({
          type: 'line',
          depth: projLine.avgDepth,
          data: projLine,
          color: line.color
        });
      });
    }

    // 4. Sort Back-to-Front (lower depth/Z' is further away, drawn first)
    // We add a tie-breaker based on primitive types when depths are near equal
    return renderList.sort((a, b) => {
      if (Math.abs(a.depth - b.depth) < 0.0001) {
        // Tie-breaker: draw faces, then ellipses, then lines on top
        const typeOrder = { face: 1, ellipse: 2, line: 3 };
        return typeOrder[a.type] - typeOrder[b.type];
      }
      return a.depth - b.depth;
    });
  }, [shape, options.rotationX, options.rotationY, options.rotationZ, options.scale, centerX, centerY]);

  return (
    <svg
      id={`svg-render-${shape.id}`}
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      className="select-none"
      style={{
        background: hexToRgba(
          options.backgroundColor,
          options.backgroundOpacity,
        ),
        transition: 'background 0.3s ease',
      }}
    >
      {/* Drawing 3D Entities */}
      {isStaticPath ? (
        <g transform={transform}>
          {shapeAsAny.fillPaths && shapeAsAny.fillPaths.map((pathStr: string, idx: number) => (
            <path
              key={`static-fill-${idx}`}
              d={pathStr}
              fill={options.strokeColor}
              fillOpacity={options.modelFillOpacity * options.fillOpacity}
              stroke="none"
              strokeLinejoin="round"
            />
          ))}
          {shapeAsAny.strokePaths && shapeAsAny.strokePaths.map((pathStr: string, idx: number) => (
            <path
              key={`static-stroke-${idx}`}
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
      ) : (
        <g>
          {sortedElements.map((el, index) => {
            if (el.type === 'face') {
              const face = el.data;
              const ptsStr = face.points.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');

              // Determine face color based on face orientation / role
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

              // Box custom color override if present
              if (face.color) {
                baseFill = face.color;
              }

              return (
                <g key={`el-${index}-${face.boxId}`}>
                  {/* Underlay filled face */}
                  <polygon
                    points={ptsStr}
                    fill={baseFill}
                    fillOpacity={options.modelFillOpacity * options.fillOpacity}
                    stroke={options.strokeColor}
                    strokeWidth={options.strokeWidth}
                    strokeOpacity={options.strokeOpacity}
                    strokeLinejoin="round"
                  />
                  
                  {/* Shadows overlay */}
                  {options.useShading && (
                    <polygon
                      points={ptsStr}
                      fill="#000000"
                      fillOpacity={(1 - face.shadingFactor) * options.shadingIntensity * options.fillOpacity}
                      style={{ pointerEvents: 'none' }}
                    />
                  )}
                </g>
              );
            }

            if (el.type === 'ellipse') {
              const ellipse = el.data;
              return (
                <g key={`el-${index}-ellipse`}>
                  <path
                    d={ellipse.pathData}
                    fill="none"
                    stroke={options.strokeColor}
                    strokeWidth={options.strokeWidth}
                    strokeOpacity={options.strokeOpacity}
                    strokeLinecap="round"
                  />
                  {ellipse.ticks.map((tick, tIdx) => (
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
                </g>
              );
            }

            if (el.type === 'line') {
              const line = el.data;
              return (
                <line
                  key={`el-${index}-line`}
                  x1={line.x1}
                  y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke={el.color || options.strokeColor}
                strokeWidth={options.strokeWidth}
                strokeOpacity={options.strokeOpacity}
                strokeLinecap="round"
              />
              );
            }

            return null;
          })}
        </g>
      )}
    </svg>
  );
};
