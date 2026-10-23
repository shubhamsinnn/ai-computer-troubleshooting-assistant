import React, { useState, useEffect } from 'react';
import { 
  Scan, 
  Upload, 
  Image as ImageIcon, 
  Cpu, 
  Clock, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  Car,
  Footprints,
  Bike,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from './StatusBadge';

export default function ObjectDetectionView() {
  const [loading, setLoading] = useState(false);
  const [confidence, setConfidence] = useState(0.35);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Load sample on initial view mount so the user has immediate visual feedback
  useEffect(() => {
    loadSampleScene('highway');
  }, []);

  const loadSampleScene = async (sceneName) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.detectSample(sceneName, confidence);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to analyze sample scene');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setLoading(true);
    setError(null);

    try {
      const data = await api.detectImage(file, confidence);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Error processing uploaded image');
    } finally {
      setLoading(false);
    }
  };

  const handleReanalyzeWithConfidence = async (newConf) => {
    setConfidence(newConf);
    if (selectedFile) {
      setLoading(true);
      try {
        const data = await api.detectImage(selectedFile, newConf);
        setResult(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      loadSampleScene('highway');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            <Scan className="w-5 h-5 text-cyan-400" />
            AI Computer Vision & Object Perception Pipeline
          </h2>
          <p className="text-xs text-slate-400">
            Real-time multi-class object detection for road agents: vehicles, pedestrians, trucks, buses, cyclists, and traffic signals.
          </p>
        </div>

        {/* Model status chip */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">Inference Engine:</span>
          <span className="bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 px-3 py-1 rounded-full font-semibold flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            {result?.model_used || 'YOLOv8n Neural Network'}
          </span>
        </div>
      </div>

      {/* Control Strip: Presets & Upload */}
      <div className="hud-glass rounded-2xl p-4 border-slate-800 flex flex-wrap items-center justify-between gap-4">
        
        {/* Sample Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-slate-400 uppercase">Test Presets:</span>
          <button
            onClick={() => loadSampleScene('highway')}
            disabled={loading}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Car className="w-3.5 h-3.5" />
            Highway Corridor
          </button>

          <button
            onClick={() => loadSampleScene('urban')}
            disabled={loading}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Footprints className="w-3.5 h-3.5" />
            Urban Pedestrian Crossing
          </button>
        </div>

        {/* Confidence Threshold Slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">Confidence:</span>
          <input
            type="range"
            min="0.15"
            max="0.85"
            step="0.05"
            value={confidence}
            onChange={(e) => handleReanalyzeWithConfidence(parseFloat(e.target.value))}
            className="w-28 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="text-xs font-mono font-bold text-cyan-400 w-10">
            {Math.round(confidence * 100)}%
          </span>
        </div>

        {/* Upload Custom Road Image Button */}
        <div>
          <label className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-black font-semibold text-xs font-mono rounded-xl cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all">
            <Upload className="w-4 h-4" />
            <span>Upload Road Image / Frame</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/50 text-red-200 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Detection View Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Annotated Image View (Left / 7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="hud-glass rounded-2xl p-4 border-slate-800 relative min-h-[380px] flex flex-col justify-between overflow-hidden">
            
            {/* Top metadata badge */}
            <div className="flex items-center justify-between text-xs font-mono mb-3">
              <span className="text-slate-400 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                Inference Frame (Annotated Bounding Boxes)
              </span>
              <span className="text-slate-400">
                Res: {result?.image_dimensions ? `${result.image_dimensions.width}x${result.image_dimensions.height}` : '720x480'}
              </span>
            </div>

            {/* Image container */}
            <div className="relative rounded-xl overflow-hidden bg-black/80 border border-slate-800 flex items-center justify-center min-h-[320px]">
              {loading && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-2 text-cyan-300 font-mono text-xs">
                  <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span>Executing YOLOv8 Neural Inference...</span>
                </div>
              )}

              {result?.annotated_image ? (
                <img
                  src={result.annotated_image}
                  alt="Processed Road Object Detection"
                  className="w-full h-auto max-h-[440px] object-contain rounded-lg"
                />
              ) : (
                <div className="text-center p-8 text-slate-500 font-mono text-xs">
                  Select a preset sample or upload an image to begin computer vision detection.
                </div>
              )}
            </div>

            {/* Bottom inference stats */}
            <div className="flex items-center justify-between text-xs font-mono pt-3 border-t border-slate-800/80 text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Latency: <strong className="text-white">{result?.inference_time_ms || 28} ms</strong>
              </span>
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Detected: <strong className="text-emerald-400">{result?.total_detections || 0} objects</strong>
              </span>
              <span className="text-[11px] text-slate-500">
                PyTorch CUDA/CPU Accelerated
              </span>
            </div>

          </div>
        </div>

        {/* Detections Breakdown & Safety Assessment (Right / 5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Class Breakdown Chips */}
          <div className="hud-glass rounded-2xl p-5 border-slate-800 space-y-3">
            <span className="text-xs font-mono text-slate-300 uppercase font-semibold block">
              Identified Road Entities Breakdown
            </span>

            <div className="grid grid-cols-2 gap-2">
              {Object.entries(result?.class_counts || {}).map(([cls, count]) => (
                <div key={cls} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between font-mono text-xs">
                  <span className="capitalize text-slate-300">{cls}</span>
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                    {count}
                  </span>
                </div>
              ))}
              {(!result?.class_counts || Object.keys(result.class_counts).length === 0) && (
                <div className="col-span-2 text-center py-4 text-xs font-mono text-slate-500">
                  No objects detected at current confidence threshold.
                </div>
              )}
            </div>
          </div>

          {/* Detections List & Bounding Box Details */}
          <div className="hud-glass rounded-2xl p-5 border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 uppercase font-semibold">
                Detected Objects Radar Log
              </span>
              <span className="text-slate-500">
                {result?.detections?.length || 0} entries
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {result?.detections?.map((d, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 text-xs font-mono flex items-center justify-between transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold uppercase">{d.class_name}</span>
                      <span className="text-[10px] text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-1.5 rounded">
                        {Math.round(d.confidence * 100)}%
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Box: [{d.box.join(', ')}]
                    </div>
                  </div>

                  <div>
                    <StatusBadge status={d.danger_level} size="sm" />
                  </div>
                </div>
              ))}

              {(!result?.detections || result.detections.length === 0) && (
                <div className="text-center py-6 text-xs text-slate-500 font-mono">
                  No detection bounding boxes active.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
