import { Point3D, Box3D, StyleOptions, Ellipse3D, Line3D } from '../types';

/**
 * Rotates a 3D point around the origin using Euler angles (X, Y, Z).
 */
export function rotatePoint(p: Point3D, angleX: number, angleY: number, angleZ: number): Point3D {
  const radX = (angleX * Math.PI) / 180;
  const radY = (angleY * Math.PI) / 180;
  const radZ = (angleZ * Math.PI) / 180;

  let x = p.x;
  let y = p.y;
  let z = p.z;

  // 1. Rotate around Z (Yaw)
  if (angleZ !== 0) {
    const cosZ = Math.cos(radZ);
    const sinZ = Math.sin(radZ);
    const nx = x * cosZ - y * sinZ;
    const ny = x * sinZ + y * cosZ;
    x = nx;
    y = ny;
  }

  // 2. Rotate around Y (Pitch)
  if (angleY !== 0) {
    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);
    const nx = x * cosY + z * sinY;
    const nz = -x * sinY + z * cosY;
    x = nx;
    z = nz;
  }

  // 3. Rotate around X (Roll)
  if (angleX !== 0) {
    const cosX = Math.cos(radX);
    const sinX = Math.sin(radX);
    const ny = y * cosX - z * sinX;
    const nz = y * sinX + z * cosX;
    y = ny;
    z = nz;
  }

  return { x, y, z };
}

/**
 * Projects a 3D point to 2D screen coordinates.
 * Larger scale means larger shape, isometricAngle controls skew.
 */
export function projectPoint(
  p: Point3D, 
  centerX: number, 
  centerY: number, 
  scale: number
): { x: number; y: number } {
  // Orthographic projection in rotated 3D space.
  // Standard computer graphic screens have +Y pointing DOWN, so we invert Y.
  return {
    x: centerX + p.x * scale,
    y: centerY - p.y * scale
  };
}

// Face direction categories for shading purposes
export type FaceType = 'top' | 'bottom' | 'front-left' | 'front-right' | 'back-left' | 'back-right';

export interface ProjectedFace {
  originalFaceType: FaceType;
  boxId: string;
  points: { x: number; y: number }[]; // 2D projected points
  avgDepth: number;                   // Z-depth for sorting
  isVisible: boolean;
  shadingFactor: number;              // 0 to 1 value of light intensity
  color?: string;                     // Box custom color
}

/**
 * Calculates the signed area of a 2D projected polygon.
 * If negative (with screen coordinate +Y down), winding is CCW.
 * Safe for backface culling.
 */
export function calculateProjectedArea(points: { x: number; y: number }[]): number {
  let area = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    area += (p1.x * p2.y - p2.x * p1.y);
  }
  return area * 0.5;
}

/**
 * Generates and projects the visible faces of a 3D box.
 */
export function getBoxFaces(
  box: Box3D,
  boxIndex: number,
  options: StyleOptions,
  centerX: number,
  centerY: number
): ProjectedFace[] {
  const { x, y, z, w, d, h } = box;

  // Define 6 faces of the box with CCW winding (looking from the outside)
  const faceDefinitions: { type: FaceType; vertices: Point3D[] }[] = [
    {
      type: 'top',
      vertices: [
        { x, y, z: z + h },
        { x: x + w, y, z: z + h },
        { x: x + w, y: y + d, z: z + h },
        { x, y: y + d, z: z + h }
      ]
    },
    {
      type: 'bottom',
      vertices: [
        { x, y, z },
        { x, y: y + d, z },
        { x: x + w, y: y + d, z },
        { x: x + w, y, z }
      ]
    },
    {
      type: 'front-right', // Y min face
      vertices: [
        { x, y, z },
        { x: x + w, y, z },
        { x: x + w, y, z: z + h },
        { x, y, z: z + h }
      ]
    },
    {
      type: 'back-left', // Y max face
      vertices: [
        { x: x + w, y: y + d, z },
        { x, y: y + d, z },
        { x, y: y + d, z: z + h },
        { x: x + w, y: y + d, z: z + h }
      ]
    },
    {
      type: 'front-left', // X min face
      vertices: [
        { x, y: y + d, z },
        { x, y, z },
        { x, y, z: z + h },
        { x, y: y + d, z: z + h }
      ]
    },
    {
      type: 'back-right', // X max face
      vertices: [
        { x: x + w, y, z },
        { x: x + w, y: y + d, z },
        { x: x + w, y: y + d, z: z + h },
        { x: x + w, y, z: z + h }
      ]
    }
  ];

  // Lighting Direction Vector in unrotated world space
  // We can simulate an infinite directional light coming from high top-left-front
  const lightSource: Point3D = { x: 0.8, y: -0.6, z: 1.5 };
  const lightLen = Math.sqrt(lightSource.x ** 2 + lightSource.y ** 2 + lightSource.z ** 2);
  const normalizedLight = { x: lightSource.x / lightLen, y: lightSource.y / lightLen, z: lightSource.z / lightLen };

  const projectedFaces: ProjectedFace[] = [];

  for (const faceDef of faceDefinitions) {
    // 1. Rotate vertices in 3D
    const rotatedVertices = faceDef.vertices.map(v => 
      rotatePoint(v, options.rotationX, options.rotationY, options.rotationZ)
    );

    // 2. Project vertices to 2D
    const projectedPoints = rotatedVertices.map(v => 
      projectPoint(v, centerX, centerY, options.scale)
    );

    // 3. Compute visibility via 2D normal area culling.
    // In our projection, because we inverted Y, a positive area means facing us.
    const area = calculateProjectedArea(projectedPoints);
    const isVisible = area > 0.001;

    // 4. Compute average Z-depth for painters sorting (larger depth = closer to camera)
    const avgDepth = rotatedVertices.reduce((sum, v) => sum + v.z, 0) / 4;

    // 5. Calculate original normal direction vector for shading
    // We compute the face normal vector in its UNROTATED coordinates, so shading is fixed
    // to the face directions, which looks clean and schematic-like!
    let normal: Point3D = { x: 0, y: 0, z: 0 };
    switch (faceDef.type) {
      case 'top': normal = { x: 0, y: 0, z: 1 }; break;
      case 'bottom': normal = { x: 0, y: 0, z: -1 }; break;
      case 'front-left': normal = { x: -1, y: 0, z: 0 }; break;
      case 'back-right': normal = { x: 1, y: 0, z: 0 }; break;
      case 'front-right': normal = { x: 0, y: -1, z: 0 }; break;
      case 'back-left': normal = { x: 0, y: 1, z: 0 }; break;
    }

    // Dot product with our light source to find shading intensity
    const dot = normal.x * normalizedLight.x + normal.y * normalizedLight.y + normal.z * normalizedLight.z;
    // Map dot product from [-1, 1] to [0.2, 1.0] for soft ambient shading
    const shadingFactor = Math.max(0.15, (dot + 1) / 2);

    projectedFaces.push({
      originalFaceType: faceDef.type,
      boxId: `${boxIndex}-${faceDef.type}`,
      points: projectedPoints,
      avgDepth,
      isVisible,
      shadingFactor,
      color: box.color
    });
  }

  return projectedFaces;
}

/**
 * Projects a 3D ellipse (circle on canvas plane) into 2D handles.
 */
export interface ProjectedEllipse {
  pathData: string;
  avgDepth: number;
  ticks: { x1: number; y1: number; x2: number; y2: number }[];
}

export function projectEllipse(
  ellipse: Ellipse3D,
  options: StyleOptions,
  centerX: number,
  centerY: number
): ProjectedEllipse {
  const { cx, cy, cz, rx, ry, plane, hasTicks } = ellipse;
  const segments = 64;
  const points: Point3D[] = [];

  for (let i = 0; i <= segments; i++) {
    const theta = (i * 2 * Math.PI) / segments;
    let p: Point3D = { x: cx, y: cy, z: cz };

    if (plane === 'xy') {
      p.x = cx + rx * Math.cos(theta);
      p.y = cy + ry * Math.sin(theta);
    } else if (plane === 'xz') {
      p.x = cx + rx * Math.cos(theta);
      p.z = cz + ry * Math.sin(theta);
    } else if (plane === 'yz') {
      p.y = cy + rx * Math.cos(theta);
      p.z = cz + ry * Math.sin(theta);
    }

    points.push(p);
  }

  // Rotate and project points
  const rotatedPoints = points.map(p => rotatePoint(p, options.rotationX, options.rotationY, options.rotationZ));
  const screenPoints = rotatedPoints.map(p => projectPoint(p, centerX, centerY, options.scale));

  // Build SVG path
  let pathData = '';
  if (screenPoints.length > 0) {
    pathData = `M ${screenPoints[0].x.toFixed(2)} ${screenPoints[0].y.toFixed(2)}`;
    for (let i = 1; i < screenPoints.length; i++) {
      pathData += ` L ${screenPoints[i].x.toFixed(2)} ${screenPoints[i].y.toFixed(2)}`;
    }
  }

  const avgDepth = rotatedPoints.reduce((sum, p) => sum + p.z, 0) / rotatedPoints.length;

  // Tick marks for crosshair ellipse
  const ticks: { x1: number; y1: number; x2: number; y2: number }[] = [];
  if (hasTicks) {
    const tickLen = 0.15; // length of tick outward
    const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

    for (const theta of angles) {
      let p1: Point3D = { x: cx, y: cy, z: cz };
      let p2: Point3D = { x: cx, y: cy, z: cz };

      const cos = Math.cos(theta);
      const sin = Math.sin(theta);

      if (plane === 'xy') {
        p1.x = cx + rx * cos;
        p1.y = cy + ry * sin;
        p2.x = cx + (rx + tickLen) * cos;
        p2.y = cy + (ry + tickLen) * sin;
      }

      const r1 = rotatePoint(p1, options.rotationX, options.rotationY, options.rotationZ);
      const r2 = rotatePoint(p2, options.rotationX, options.rotationY, options.rotationZ);

      const s1 = projectPoint(r1, centerX, centerY, options.scale);
      const s2 = projectPoint(r2, centerX, centerY, options.scale);

      ticks.push({ x1: s1.x, y1: s1.y, x2: s2.x, y2: s2.y });
    }
  }

  return { pathData, avgDepth, ticks };
}

/**
 * Projects a 3D line into a 2D line.
 */
export interface ProjectedLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  avgDepth: number;
}

export function projectLine(
  line: Line3D,
  options: StyleOptions,
  centerX: number,
  centerY: number
): ProjectedLine {
  const r1 = rotatePoint(line.p1, options.rotationX, options.rotationY, options.rotationZ);
  const r2 = rotatePoint(line.p2, options.rotationX, options.rotationY, options.rotationZ);

  const s1 = projectPoint(r1, centerX, centerY, options.scale);
  const s2 = projectPoint(r2, centerX, centerY, options.scale);

  return {
    x1: s1.x,
    y1: s1.y,
    x2: s2.x,
    y2: s2.y,
    avgDepth: (r1.z + r2.z) / 2
  };
}

/**
 * Robust parser to calculate the 2D bounding box of an SVG path segment.
 */
export function getPathBoundingBox(pathStr: string) {
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  // Clean coordinates with regex, extracting both numbers (including negative/decimals) and command indicators.
  const tokens = pathStr.match(/[a-df-zDF-Z]|[-+]?[0-9]*\.?[0-9]+/g) || [];
  
  let curX = 0;
  let curY = 0;
  let idx = 0;
  
  while (idx < tokens.length) {
    const token = tokens[idx];
    if (/[a-df-zDF-Z]/.test(token)) {
      const cmd = token;
      idx++;
      if (cmd === 'z' || cmd === 'Z') {
        continue;
      }
      // Gather numeric parameters of this command before encountering an option command word.
      const coords: number[] = [];
      while (idx < tokens.length && !/[a-df-zDF-Z]/.test(tokens[idx])) {
        coords.push(Number(tokens[idx]));
        idx++;
      }
      
      let cIdx = 0;
      if (cmd === 'M' || cmd === 'L') {
        while (cIdx + 1 < coords.length) {
          curX = coords[cIdx];
          curY = coords[cIdx + 1];
          minX = Math.min(minX, curX);
          maxX = Math.max(maxX, curX);
          minY = Math.min(minY, curY);
          maxY = Math.max(maxY, curY);
          cIdx += 2;
        }
      } else if (cmd === 'V') {
        while (cIdx < coords.length) {
          curY = coords[cIdx];
          minY = Math.min(minY, curY);
          maxY = Math.max(maxY, curY);
          cIdx++;
        }
      } else if (cmd === 'H') {
        while (cIdx < coords.length) {
          curX = coords[cIdx];
          minX = Math.min(minX, curX);
          maxX = Math.max(maxX, curX);
          cIdx++;
        }
      }
    } else {
      curX = Number(token);
      curY = Number(tokens[idx+1] || token);
      minX = Math.min(minX, curX);
      maxX = Math.max(maxX, curX);
      minY = Math.min(minY, curY);
      maxY = Math.max(maxY, curY);
      idx += 2;
    }
  }
  
  return {
    minX: minX === Infinity ? 0 : minX,
    minY: minY === Infinity ? 0 : minY,
    maxX: maxX === -Infinity ? 100 : maxX,
    maxY: maxY === -Infinity ? 100 : maxY
  };
}
