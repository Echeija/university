import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { Eraser, Pen, Trash2 } from 'lucide-react';

interface WhiteboardProps {
  onClose?: () => void;
}

export default function Whiteboard({ onClose }: WhiteboardProps) {
  const [lines, setLines] = useState<any[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState('#10b981');
  const [strokeWidth, setStrokeWidth] = useState(5);
  
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleMouseDown = (e: any) => {
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool, color, strokeWidth, points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    
    if (lastLine) {
      lastLine.points = lastLine.points.concat([point.x, point.y]);
      lines.splice(lines.length - 1, 1, lastLine);
      setLines(lines.concat());
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const clearBoard = () => {
    setLines([]);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
      {/* Toolbar */}
      <div className="h-14 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setTool('pen')}
            className={`p-2 rounded-lg flex items-center justify-center transition-colors ${tool === 'pen' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            title="Pen"
          >
            <Pen className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-lg flex items-center justify-center transition-colors ${tool === 'eraser' ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            title="Eraser"
          >
            <Eraser className="w-5 h-5" />
          </button>
          
          <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-2"></div>
          
          <div className="flex items-center gap-1">
            {['#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#000000', '#ffffff'].map(c => (
              <button
                key={c}
                onClick={() => { setColor(c); setTool('pen'); }}
                className={`w-6 h-6 rounded-full border-2 ${color === c && tool === 'pen' ? 'border-purple-500 scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c, border: c === '#ffffff' ? '1px solid #e2e8f0' : undefined }}
                title={c}
              />
            ))}
          </div>
          
          <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-2"></div>
          
          <input 
            type="range" 
            min="2" 
            max="20" 
            value={strokeWidth} 
            onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
            className="w-24 accent-emerald-500"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={clearBoard}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" /> Clear
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm font-medium"
            >
              Close Whiteboard
            </button>
          )}
        </div>
      </div>
      
      {/* Canvas Area */}
      <div className="flex-1 bg-white cursor-crosshair" ref={containerRef}>
        {dimensions.width > 0 && dimensions.height > 0 && (
          <Stage
            width={dimensions.width}
            height={dimensions.height}
            onMouseDown={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            ref={stageRef}
          >
            <Layer>
              {lines.map((line, i) => (
                <Line
                  key={i}
                  points={line.points}
                  stroke={line.tool === 'eraser' ? '#ffffff' : line.color}
                  strokeWidth={line.tool === 'eraser' ? line.strokeWidth * 3 : line.strokeWidth}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation={
                    line.tool === 'eraser' ? 'destination-out' : 'source-over'
                  }
                />
              ))}
            </Layer>
          </Stage>
        )}
      </div>
    </div>
  );
}
