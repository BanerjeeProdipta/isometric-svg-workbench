export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Box3D {
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  h: number;
  id?: string;
  color?: string; // Optional custom color override for this voxel
}

export interface Ellipse3D {
  cx: number;
  cy: number;
  cz: number;
  rx: number;
  ry: number;
  plane: 'xy' | 'xz' | 'yz';
  hasTicks?: boolean;
}

export interface Line3D {
  p1: Point3D;
  p2: Point3D;
  color?: string;
}

export interface ShapeDefinition {
  id: string;
  name: string;
  description: string;
  boxes: Box3D[];
  ellipses?: Ellipse3D[];
  lines?: Line3D[];
  fillPaths?: string[];
  strokePaths?: string[];
}

export interface StyleOptions {
  strokeColor: string;
  strokeWidth: number;
  fillOpacity: number;
  topFaceColor: string;
  leftFaceColor: string;
  rightFaceColor: string;
  modelFillColor: string;
  useShading: boolean;
  shadingIntensity: number; // 0 to 1
  isometricAngle: number;   // default 30 (degrees)
  scale: number;            // default 60
  rotationX: number;        // in degrees (pitch)
  rotationY: number;        // in degrees (yaw)
  rotationZ: number;        // in degrees (roll)
  showGrid: boolean;
  gridSize: number;
  gridColor: string;
  backgroundColor: string;
}

export type PresetTheme = 'blueprint' | 'monochrome' | 'emerald' | 'sunset' | 'cyberpunk' | 'warmPalette';
