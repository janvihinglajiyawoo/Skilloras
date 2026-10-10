import React, { useState } from 'react';
import {
  Smartphone,
  Tablet,
  Laptop,
  Maximize2,
  RotateCw,
  Eye,
  Sliders,
  ChevronDown,
  X,
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';

export const DeviceViewportSwitcher: React.FC = () => {
  const { deviceScene, setDeviceScene } = useStudent();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  const scenes: Array<{
    id: 'responsive' | 'mobile' | 'tablet' | 'laptop';
    label: string;
    sublabel: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'responsive',
      label: 'Full Screen',
      sublabel: 'Fluid Responsive',
      icon: <Maximize2 className="w-3.5 h-3.5" />,
    },
    {
      id: 'mobile',
      label: 'Mobile',
      sublabel: '390 × 844',
      icon: <Smartphone className="w-3.5 h-3.5" />,
    },
    {
      id: 'tablet',
      label: 'Tablet',
      sublabel: '768 × 1024',
      icon: <Tablet className="w-3.5 h-3.5" />,
    },
    {
      id: 'laptop',
      label: 'Laptop',
      sublabel: '1024 × 680',
      icon: <Laptop className="w-3.5 h-3.5" />,
    },
  ];

  if (isCollapsed) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-2 bg-[#3D342F] text-white px-3.5 py-2 rounded-full shadow-xl border border-stone-600 hover:bg-[#2A2320] transition-all cursor-pointer text-xs font-bold"
          title="Open Device Scene Switcher"
        >
          <Sliders className="w-3.5 h-3.5 text-[#E87A5D]" />
          <span>Device: {deviceScene.toUpperCase()}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-[#2E2824]/95 backdrop-blur-md text-white rounded-full px-3 py-1.5 shadow-2xl border border-stone-700/80 flex items-center gap-1.5 text-xs font-medium">
        <span className="text-[10px] uppercase font-extrabold tracking-wider text-stone-400 px-2 hidden sm:inline">
          Preview Scene:
        </span>

        {scenes.map((scene) => {
          const isActive = deviceScene === scene.id;
          return (
            <button
              key={scene.id}
              onClick={() => setDeviceScene(scene.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-[#292524] font-bold shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
              }`}
            >
              {scene.icon}
              <span className="text-xs">{scene.label}</span>
              <span
                className={`text-[9px] hidden md:inline ${
                  isActive ? 'text-stone-500' : 'text-stone-400'
                }`}
              >
                ({scene.sublabel})
              </span>
            </button>
          );
        })}

        {/* Minimize button */}
        <button
          onClick={() => setIsCollapsed(true)}
          className="w-6 h-6 rounded-full hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
          title="Minimize toolbar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
