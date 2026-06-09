import { ShapeDefinition } from '../types';

export const SHAPES_DATA: ShapeDefinition[] = [
  {
    id: 'single-cube',
    name: 'Single Cube',
    description: 'A classic isometric 3D unit cube, showcasing balanced facets.',
    boxes: [
      { x: -0.5, y: -0.5, z: -0.5, w: 1.0, d: 1.0, h: 1.0 }
    ]
  },
  {
    id: 'cube-pyramid',
    name: 'Cube Pile (Pyramid)',
    description: 'A 10-cube pile arranged in a perfect tetrahedral stack.',
    boxes: [
      // Level 0 (Bottom) - 6 cubes
      { x: -0.6, y: -0.6, z: -0.45, w: 0.35, d: 0.35, h: 0.35 },
      { x: -0.2, y: -0.6, z: -0.45, w: 0.35, d: 0.35, h: 0.35 },
      { x: 0.2, y: -0.6, z: -0.45, w: 0.35, d: 0.35, h: 0.35 },
      { x: -0.6, y: -0.2, z: -0.45, w: 0.35, d: 0.35, h: 0.35 },
      { x: -0.2, y: -0.2, z: -0.45, w: 0.35, d: 0.35, h: 0.35 },
      { x: -0.6, y: 0.2, z: -0.45, w: 0.35, d: 0.35, h: 0.35 },

      // Level 1 (Middle) - 3 cubes
      { x: -0.4, y: -0.4, z: -0.1, w: 0.35, d: 0.35, h: 0.35 },
      { x: 0.0, y: -0.4, z: -0.1, w: 0.35, d: 0.35, h: 0.35 },
      { x: -0.4, y: 0.0, z: -0.1, w: 0.35, d: 0.35, h: 0.35 },

      // Level 2 (Top) - 1 cube
      { x: -0.2, y: -0.2, z: 0.25, w: 0.35, d: 0.35, h: 0.35 }
    ]
  },
  {
    id: 'rectangular-bar',
    name: 'Rectangular Prism',
    description: 'A long horizontal bar running along the Y-axis.',
    boxes: [
      { x: -0.25, y: -1.0, z: -0.25, w: 0.5, d: 2.0, h: 0.5 }
    ]
  },
  {
    id: 'hollow-cube',
    name: 'Hollowed-Out Cube',
    description: 'A 12-edge wireframe structure outlining a hollow 3D cube.',
    boxes: [
      // X edges
      { x: -0.6, y: -0.6, z: -0.6, w: 1.2, d: 0.2, h: 0.2 },
      { x: -0.6, y: 0.4, z: -0.6, w: 1.2, d: 0.2, h: 0.2 },
      { x: -0.6, y: -0.6, z: 0.4, w: 1.2, d: 0.2, h: 0.2 },
      { x: -0.6, y: 0.4, z: 0.4, w: 1.2, d: 0.2, h: 0.2 },
      // Y edges
      { x: -0.6, y: -0.6, z: -0.6, w: 0.2, d: 1.2, h: 0.2 },
      { x: 0.4, y: -0.6, z: -0.6, w: 0.2, d: 1.2, h: 0.2 },
      { x: -0.6, y: -0.6, z: 0.4, w: 0.2, d: 1.2, h: 0.2 },
      { x: 0.4, y: -0.6, z: 0.4, w: 0.2, d: 1.2, h: 0.2 },
      // Z edges
      { x: -0.6, y: -0.6, z: -0.6, w: 0.2, d: 0.2, h: 1.2 },
      { x: 0.4, y: -0.6, z: -0.6, w: 0.2, d: 0.2, h: 1.2 },
      { x: -0.6, y: 0.4, z: -0.6, w: 0.2, d: 0.2, h: 1.2 },
      { x: 0.4, y: 0.4, z: -0.6, w: 0.2, d: 0.2, h: 1.2 }
    ]
  },
  {
    id: 'segmented-block',
    name: 'Segmented Star-Cube',
    description: 'A solid central cube with symmetrical raised panels on its faces.',
    boxes: [
      // Central Core
      { x: -0.4, y: -0.4, z: -0.4, w: 0.8, d: 0.8, h: 0.8 },
      // Symmetrical Panels protruding from each face
      { x: -0.25, y: -0.25, z: 0.4, w: 0.5, d: 0.5, h: 0.15 },  // Top
      { x: -0.25, y: -0.25, z: -0.55, w: 0.5, d: 0.5, h: 0.15 }, // Bottom
      { x: -0.25, y: -0.55, z: -0.25, w: 0.5, d: 0.15, h: 0.5 }, // Front-Left (Y-)
      { x: -0.25, y: 0.4, z: -0.25, w: 0.5, d: 0.15, h: 0.5 },  // Back-Right (Y+)
      { x: 0.4, y: -0.25, z: -0.25, w: 0.15, d: 0.5, h: 0.5 },  // Front-Right (X+)
      { x: -0.55, y: -0.25, z: -0.25, w: 0.15, d: 0.5, h: 0.5 }  // Back-Left (X-)
    ]
  },
  {
    id: 'parallel-plates',
    name: 'Triple Slats',
    description: 'Three parallel vertical plates arranged in a spaced sequence.',
    boxes: [
      { x: -0.45, y: -0.6, z: -0.6, w: 0.12, d: 1.2, h: 1.2 },
      { x: -0.06, y: -0.6, z: -0.6, w: 0.12, d: 1.2, h: 1.2 },
      { x: 0.33, y: -0.6, z: -0.6, w: 0.12, d: 1.2, h: 1.2 }
    ]
  },
  {
    id: 'slab-hole',
    name: 'Slab with Circular Hole',
    description: 'A flat square block hollowed with a concentric vertical cylindrical hole.',
    boxes: [
      // We represent the solid slab body using 4 side blocks forming the frame
      { x: -0.7, y: -0.7, z: -0.2, w: 1.4, d: 0.35, h: 0.4 },  // Back Y-
      { x: -0.7, y: 0.35, z: -0.2, w: 1.4, d: 0.35, h: 0.4 }, // Front Y+
      { x: -0.7, y: -0.35, z: -0.2, w: 0.35, d: 0.7, h: 0.4 }, // Side X-
      { x: 0.35, y: -0.35, z: -0.2, w: 0.35, d: 0.7, h: 0.4 }  // Side X+
    ],
    ellipses: [
      // Circular top rim of the hole
      { cx: 0, cy: 0, cz: 0.2, rx: 0.35, ry: 0.35, plane: 'xy', hasTicks: false },
      // Circular bottom rim inside the hole
      { cx: 0, cy: 0, cz: -0.2, rx: 0.35, ry: 0.35, plane: 'xy', hasTicks: false }
    ]
  },
  {
    id: 'puzzle-joint',
    name: '3D Joint Cross',
    description: 'Three mutually perpendicular square beams forming a central 3D hub.',
    boxes: [
      { x: -0.75, y: -0.2, z: -0.2, w: 1.5, d: 0.4, h: 0.4 }, // X beam
      { x: -0.2, y: -0.75, z: -0.2, w: 0.4, d: 1.5, h: 0.4 }, // Y beam
      { x: -0.2, y: -0.2, z: -0.75, w: 0.4, d: 0.4, h: 1.5 }  // Z beam
    ]
  },
  {
    id: '3d-cylinder',
    name: '3D Filigree Cylinder',
    description: 'A structural wireframe cylinder containing horizontal sections and longitudinal ribs.',
    boxes: [],
    ellipses: [
      { cx: 0, cy: 0, cz: 0.5, rx: 0.45, ry: 0.45, plane: 'xy', hasTicks: false },
      { cx: 0, cy: 0, cz: 0.25, rx: 0.45, ry: 0.45, plane: 'xy', hasTicks: false },
      { cx: 0, cy: 0, cz: 0, rx: 0.45, ry: 0.45, plane: 'xy', hasTicks: false },
      { cx: 0, cy: 0, cz: -0.25, rx: 0.45, ry: 0.45, plane: 'xy', hasTicks: false },
      { cx: 0, cy: 0, cz: -0.5, rx: 0.45, ry: 0.45, plane: 'xy', hasTicks: false }
    ],
    lines: [
      { p1: { x: 0.45, y: 0, z: -0.5 }, p2: { x: 0.45, y: 0, z: 0.5 } },
      { p1: { x: 0.318, y: 0.318, z: -0.5 }, p2: { x: 0.318, y: 0.318, z: 0.5 } },
      { p1: { x: 0, y: 0.45, z: -0.5 }, p2: { x: 0, y: 0.45, z: 0.5 } },
      { p1: { x: -0.318, y: 0.318, z: -0.5 }, p2: { x: -0.318, y: 0.318, z: 0.5 } },
      { p1: { x: -0.45, y: 0, z: -0.5 }, p2: { x: -0.45, y: 0, z: 0.5 } },
      { p1: { x: -0.318, y: -0.318, z: -0.5 }, p2: { x: -0.318, y: -0.318, z: 0.5 } },
      { p1: { x: 0, y: -0.45, z: -0.5 }, p2: { x: 0, y: -0.45, z: 0.5 } },
      { p1: { x: 0.318, y: -0.318, z: -0.5 }, p2: { x: 0.318, y: -0.318, z: 0.5 } }
    ]
  },
  {
    id: 'static-shape-1',
    name: 'Concentric Axial Collar',
    description: 'An abstract dual-ring collar boasting an elegant, high-contrast modular layout and balanced geometry.',
    boxes: [
      { x: -0.5, y: -0.1, z: -0.4, w: 0.15, d: 0.2, h: 0.8 },
      { x: 0.35, y: -0.1, z: -0.4, w: 0.15, d: 0.2, h: 0.8 },
      { x: -0.1, y: -0.5, z: -0.4, w: 0.2, d: 0.15, h: 0.8 },
      { x: -0.1, y: 0.35, z: -0.4, w: 0.2, d: 0.15, h: 0.8 }
    ],
    ellipses: [
      { cx: 0, cy: 0, cz: 0.4, rx: 0.5, ry: 0.5, plane: 'xy', hasTicks: false },
      { cx: 0, cy: 0, cz: 0.4, rx: 0.3, ry: 0.3, plane: 'xy', hasTicks: false },
      { cx: 0, cy: 0, cz: -0.4, rx: 0.5, ry: 0.5, plane: 'xy', hasTicks: false },
      { cx: 0, cy: 0, cz: -0.4, rx: 0.3, ry: 0.3, plane: 'xy', hasTicks: false }
    ]
  },
  {
    id: 'static-shape-2',
    name: 'Segmented Slab Block',
    description: 'A 2.5D architectural panel detailing interlocking joint elements and precision offset lines.',
    boxes: [
      { x: -0.6, y: -0.6, z: -0.4, w: 1.2, d: 1.2, h: 0.2 },
      { x: -0.45, y: -0.45, z: -0.2, w: 0.35, d: 0.35, h: 0.3 },
      { x: 0.1, y: -0.45, z: -0.2, w: 0.35, d: 0.35, h: 0.3 },
      { x: -0.45, y: 0.1, z: -0.2, w: 0.35, d: 0.35, h: 0.3 },
      { x: 0.1, y: 0.1, z: -0.2, w: 0.35, d: 0.35, h: 0.3 },
      { x: -0.1, y: -0.1, z: 0.1, w: 0.2, d: 0.2, h: 0.4 }
    ]
  },
  {
    id: 'static-shape-3',
    name: 'Crossbar Hub Bridge',
    description: 'A symmetric central hub showcasing diagonal connecting rods and interlocking modular joints.',
    boxes: [
      { x: -0.25, y: -0.25, z: -0.25, w: 0.5, d: 0.5, h: 0.5 },
      { x: -0.5, y: -0.5, z: -0.5, w: 0.15, d: 0.15, h: 0.15 },
      { x: 0.35, y: -0.5, z: -0.5, w: 0.15, d: 0.15, h: 0.15 },
      { x: -0.5, y: 0.35, z: -0.5, w: 0.15, d: 0.15, h: 0.15 },
      { x: 0.35, y: 0.35, z: -0.5, w: 0.15, d: 0.15, h: 0.15 },
      { x: -0.5, y: -0.5, z: 0.35, w: 0.15, d: 0.15, h: 0.15 },
      { x: 0.35, y: -0.5, z: 0.35, w: 0.15, d: 0.15, h: 0.15 },
      { x: -0.5, y: 0.35, z: 0.35, w: 0.15, d: 0.15, h: 0.15 },
      { x: 0.35, y: 0.35, z: 0.35, w: 0.15, d: 0.15, h: 0.15 }
    ],
    lines: [
      { p1: { x: -0.2, y: -0.2, z: -0.2 }, p2: { x: -0.4, y: -0.4, z: -0.4 } },
      { p1: { x: 0.2, y: -0.2, z: -0.2 }, p2: { x: 0.4, y: -0.4, z: -0.4 } },
      { p1: { x: -0.2, y: 0.2, z: -0.2 }, p2: { x: -0.4, y: 0.4, z: -0.4 } },
      { p1: { x: 0.2, y: 0.2, z: -0.2 }, p2: { x: 0.4, y: 0.4, z: -0.4 } },
      { p1: { x: -0.2, y: -0.2, z: 0.2 }, p2: { x: -0.4, y: -0.4, z: 0.4 } },
      { p1: { x: 0.2, y: -0.2, z: 0.2 }, p2: { x: 0.4, y: -0.4, z: 0.4 } },
      { p1: { x: -0.2, y: 0.2, z: 0.2 }, p2: { x: -0.4, y: 0.4, z: 0.4 } },
      { p1: { x: 0.2, y: 0.2, z: 0.2 }, p2: { x: 0.4, y: 0.4, z: 0.4 } }
    ]
  },
  {
    id: 'static-shape-4',
    name: 'Monolithic Stepped Flange',
    description: 'A stepped solid body comprising structural vertical columns and robust horizontal flanges.',
    boxes: [
      { x: -0.65, y: -0.65, z: -0.5, w: 1.3, d: 1.3, h: 0.25 },
      { x: -0.4, y: -0.4, z: -0.25, w: 0.8, d: 0.8, h: 0.35 },
      { x: -0.2, y: -0.2, z: 0.1, w: 0.4, d: 0.4, h: 0.6 }
    ]
  },
  {
    id: 'static-shape-5',
    name: 'Sheared Channel Splice',
    description: 'An asymmetrical vertical block structure styled with custom wireframe line segments.',
    boxes: [
      { x: -0.5, y: -0.5, z: -0.6, w: 0.3, d: 1.0, h: 1.2 },
      { x: 0.2, y: -0.3, z: -0.6, w: 0.3, d: 0.6, h: 0.6 },
      { x: -0.2, y: -0.2, z: -0.3, w: 0.4, d: 0.4, h: 0.3 }
    ],
    lines: [
      { p1: { x: -0.5, y: -0.5, z: 0.6 }, p2: { x: 0.5, y: 0.3, z: 0.0 } },
      { p1: { x: -0.5, y: 0.5, z: 0.6 }, p2: { x: 0.5, y: 0.3, z: 0.0 } }
    ]
  },
  {
    id: 'static-shape-6',
    name: 'Punched Gate Pier',
    description: 'A monolithic vertical block hollowed with a rectangular traverse portal.',
    boxes: [
      { x: -0.6, y: -0.3, z: -0.6, w: 0.3, d: 0.6, h: 1.2 },
      { x: 0.3, y: -0.3, z: -0.6, w: 0.3, d: 0.6, h: 1.2 },
      { x: -0.6, y: -0.3, z: 0.6, w: 1.2, d: 0.6, h: 0.3 }
    ]
  },
  {
    id: 'static-shape-7',
    name: 'Locking Pocket Panel',
    description: 'An interlocking puzzle face displaying nested slots and structural reinforcing corners.',
    boxes: [
      { x: -0.6, y: -0.6, z: -0.5, w: 1.2, d: 1.2, h: 0.15 },
      { x: -0.5, y: -0.5, z: -0.35, w: 0.25, d: 0.25, h: 0.5 },
      { x: 0.25, y: -0.5, z: -0.35, w: 0.25, d: 0.25, h: 0.5 },
      { x: -0.5, y: 0.25, z: -0.35, w: 0.25, d: 0.25, h: 0.5 },
      { x: 0.25, y: 0.25, z: -0.35, w: 0.25, d: 0.25, h: 0.5 },
      { x: -0.15, y: -0.4, z: -0.35, w: 0.3, d: 0.8, h: 0.3 }
    ]
  },
  {
    id: 'static-shape-8',
    name: 'Voxel Sub-Joint Core',
    description: 'An abstract cluster of mutually perpendicular interlocking coordinate shafts.',
    boxes: [
      { x: -0.25, y: -0.25, z: -0.25, w: 0.5, d: 0.5, h: 0.5 },
      { x: -0.8, y: -0.15, z: -0.15, w: 0.55, d: 0.3, h: 0.3 },
      { x: 0.25, y: -0.15, z: -0.15, w: 0.55, d: 0.3, h: 0.3 },
      { x: -0.15, y: -0.8, z: -0.15, w: 0.3, d: 0.55, h: 0.3 },
      { x: -0.15, y: 0.25, z: -0.15, w: 0.3, d: 0.55, h: 0.3 },
      { x: -0.15, y: -0.15, z: -0.8, w: 0.3, d: 0.3, h: 0.55 },
      { x: -0.15, y: -0.15, z: 0.25, w: 0.3, d: 0.3, h: 0.55 },
      { x: -0.8, y: -0.25, z: -0.25, w: 0.15, d: 0.5, h: 0.5 },
      { x: 0.65, y: -0.25, z: -0.25, w: 0.15, d: 0.5, h: 0.5 },
      { x: -0.25, y: -0.8, z: -0.25, w: 0.5, d: 0.15, h: 0.5 },
      { x: -0.25, y: 0.65, z: -0.25, w: 0.5, d: 0.15, h: 0.5 },
      { x: -0.25, y: -0.25, z: -0.8, w: 0.5, d: 0.5, h: 0.15 },
      { x: -0.25, y: -0.25, z: 0.65, w: 0.5, d: 0.5, h: 0.15 }
    ]
  },
  {
    id: '3d-globe',
    name: '3D Wireframe Globe',
    description: 'An elegant geographical model with latitude rings, longitudinal meridians, an axial rod, and an orbital base stand.',
    boxes: [
      // Base plate of the stand
      { x: -0.35, y: -0.35, z: -0.95, w: 0.7, d: 0.7, h: 0.1 },
      // Stand connection hub
      { x: -0.12, y: -0.12, z: -0.85, w: 0.24, d: 0.24, h: 0.15 }
    ],
    ellipses: [
      // Latitude lines (xy) inside the sphere (R = 0.65)
      { cx: 0, cy: 0, cz: 0.0, rx: 0.65, ry: 0.65, plane: 'xy' }, // Equator
      { cx: 0, cy: 0, cz: 0.22, rx: 0.61, ry: 0.61, plane: 'xy' }, // Tropic (cz=0.22, r=0.61)
      { cx: 0, cy: 0, cz: -0.22, rx: 0.61, ry: 0.61, plane: 'xy' }, // Tropic (cz=-0.22, r=0.61)
      { cx: 0, cy: 0, cz: 0.45, rx: 0.47, ry: 0.47, plane: 'xy' }, // Arctic (cz=0.45, r=0.47)
      { cx: 0, cy: 0, cz: -0.45, rx: 0.47, ry: 0.47, plane: 'xy' }, // Antarctic (cz=-0.45, r=0.47)
      { cx: 0, cy: 0, cz: 0.58, rx: 0.29, ry: 0.29, plane: 'xy' }, // Polar (cz=0.58, r=0.29)
      { cx: 0, cy: 0, cz: -0.58, rx: 0.29, ry: 0.29, plane: 'xy' }, // Polar (cz=-0.58, r=0.29)
      
      // Vertical meridians (great circles) in xz and yz
      { cx: 0, cy: 0, cz: 0.0, rx: 0.65, ry: 0.65, plane: 'xz' }, // 0/180 Meridian
      { cx: 0, cy: 0, cz: 0.0, rx: 0.65, ry: 0.65, plane: 'yz' }, // 90E/90W Meridian

      // Cradle arch (an outer framing ring on the yz plane of radius 0.74)
      { cx: 0, cy: 0, cz: 0.0, rx: 0.74, ry: 0.74, plane: 'yz' }
    ],
    lines: [
      // Axis rod of the globe
      { p1: { x: 0, y: 0, z: -0.78 }, p2: { x: 0, y: 0, z: 0.78 } },
      
      // Stand stem connecting the cradle ring to the base plate
      { p1: { x: 0, y: 0, z: -0.74 }, p2: { x: 0, y: 0, z: -0.85 } }
    ]
  }
];
