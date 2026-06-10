import React, { useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  NavLink,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';
import { CompositionGrid } from './components/CompositionGrid';
import { InspectorWorkspace } from './components/InspectorWorkspace';
import { INSPECTOR_DEFAULT_SHAPE_ID } from './data/composition';
import { buildInspectorPath, WORKBENCH_PATHS } from './lib/workbench-routing';
import { StyleOptions } from './types';

const initialOptions: StyleOptions = {
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
  scale: 100,
  rotationX: 35.264,
  rotationY: 0,
  rotationZ: 45,
  backgroundColor: '#000000',
  backgroundOpacity: 1,
  modelFillOpacity: 0.35,
  strokeOpacity: 1,
};

function WorkbenchShell() {
  const navigate = useNavigate();
  const [options, setOptions] = useState<StyleOptions>(initialOptions);

  const handleCopyAllSheet = () => {
    const svgElement = document.getElementById('svg-composition-board');
    if (!svgElement) return;
    const clone = svgElement.cloneNode(true) as SVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    navigator.clipboard.writeText(clone.outerHTML);
  };

  const handleDownloadAllSheet = () => {
    const svgElement = document.getElementById('svg-composition-board');
    if (!svgElement) return;
    const clone = svgElement.cloneNode(true) as SVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const blob = new Blob([clone.outerHTML], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const trigger = document.createElement('a');
    trigger.href = url;
    trigger.download = 'isometric_composed_blueprint_sheet.svg';
    document.body.appendChild(trigger);
    trigger.click();
    document.body.removeChild(trigger);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="min-h-screen bg-black text-neutral-300 flex flex-col p-6 sm:p-10 lg:p-12 font-sans bg-canvas-dots"
      id="app-root"
    >
      <header className="flex flex-col md:flex-row justify-between items-baseline border-b border-dashed border-neutral-700 pb-6 mb-8 w-full max-w-7xl mx-auto">
        <div className="flex flex-col mb-4 md:mb-0">
          <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-[#ff9ecf]/75 mb-1">
            // Specimen No. 142 - Active Vectors
          </span>
          <h1 className="text-3xl md:text-4xl font-mono font-light tracking-tighter leading-none text-neutral-200">
            Isometric_Archive
          </h1>
        </div>

        <nav className="flex gap-6 sm:gap-8 text-[11px] font-mono uppercase tracking-[0.18em] font-medium">
          <NavLink
            to={WORKBENCH_PATHS.board}
            className={({ isActive }) =>
              `pb-1 border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-[#ff9ecf]/75 text-[#ff9ecf]'
                  : 'border-transparent text-neutral-500 hover:text-neutral-300'
              }`
            }
          >
            [Composition Grid]
          </NavLink>
          <NavLink
            to={buildInspectorPath(INSPECTOR_DEFAULT_SHAPE_ID, 185, 500)}
            className={({ isActive }) =>
              `pb-1 border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-[#ff9ecf]/75 text-[#ff9ecf]'
                  : 'border-transparent text-neutral-500 hover:text-neutral-300'
              }`
            }
          >
            [Shape Inspector]
          </NavLink>
        </nav>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto">
        <Routes>
          <Route path="/" element={<Navigate to={WORKBENCH_PATHS.board} replace />} />
          <Route
            path={WORKBENCH_PATHS.board}
            element={
              <CompositionGrid
                options={options}
                onSelectCell={(cell) => navigate(buildInspectorPath(cell.shapeId, cell.x, cell.y))}
                onCopySheet={handleCopyAllSheet}
                onDownloadSheet={handleDownloadAllSheet}
              />
            }
          />
          <Route
            path={WORKBENCH_PATHS.inspector}
            element={<InspectorWorkspace options={options} setOptions={setOptions} />}
          />
          <Route path="*" element={<Navigate to={WORKBENCH_PATHS.board} replace />} />
        </Routes>
      </main>

      <footer className="bg-black text-neutral-700 py-6 text-center text-xs mt-12 border-t border-dashed border-neutral-800">
        <p className="font-mono">
          // Isometric SVG Workbench © 2026 - revision 2.5.0
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <WorkbenchShell />
    </BrowserRouter>
  );
}
