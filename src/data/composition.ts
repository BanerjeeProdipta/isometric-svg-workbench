export interface SheetCell {
  shapeId: string;
  x: number;
  y: number;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export const BOARD_VIEWBOX = {
  width: 1500,
  height: 1620,
};

export const BOARD_CENTER = {
  x: 750,
  y: 810,
};

export const COMPOSITION_CELLS: SheetCell[] = [
  { shapeId: 'single-cube', x: 185, y: 185 },
  { shapeId: 'cube-pyramid', x: 560, y: 185 },
  { shapeId: 'ball', x: 935, y: 185 },
  { shapeId: 'hollow-cube', x: 1315, y: 185 },
  { shapeId: 'segmented-block', x: 185, y: 500 },
  { shapeId: 'parallel-plates', x: 560, y: 500 },
  { shapeId: 'slab-hole', x: 935, y: 500 },
  { shapeId: 'puzzle-joint', x: 1315, y: 500 },
  { shapeId: '3d-cylinder', x: 185, y: 815 },
  { shapeId: 'static-shape-1', x: 560, y: 815 },
  { shapeId: 'static-shape-2', x: 935, y: 815 },
  { shapeId: 'static-shape-3', x: 1315, y: 815 },
  { shapeId: 'static-shape-4', x: 185, y: 1130 },
  { shapeId: 'pyramid', x: 560, y: 1130 },
  { shapeId: 'static-shape-6', x: 935, y: 1130 },
  { shapeId: 'static-shape-7', x: 1315, y: 1130 },
  { shapeId: 'static-shape-8', x: 750, y: 1445 },
];

export const BOARD_GRID_COLORS = {
  minor: 'rgba(255, 153, 204, 0.12)',
  major: 'rgba(255, 153, 204, 0.24)',
};

export const INSPECTOR_DEFAULT_SHAPE_ID = 'segmented-block';
