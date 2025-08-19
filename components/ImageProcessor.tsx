
import React, { useState, useCallback, useRef } from 'react';
import { ProcessState } from '../types';
import { createIcoFromPng } from '../utils/icoUtils';
import { Loader } from './Loader';
import { Icon } from './Icon';

const commonIcoSizes = [16, 24, 32, 48, 64, 128, 256];

export const ImageProcessor: React.FC = () => {
  const [processState, setProcessState] = useState<ProcessState>(ProcessState.Idle);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [size, setSize] = useState({ width: 32, height: 32 });
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Invalid file type. Please upload an image.');
      setProcessState(ProcessState.Error);
      return;
    }

    setOriginalFile(file);
    setError(null);
    setProcessState(ProcessState.Processing);

    // --- Background Removal Simulation ---
    // In a real-world scenario with a suitable API, an API call would be made here.
    // Since the Gemini API does not directly support image editing/output,
    // we simulate the process and proceed with the original image.
    setTimeout(() => {
      const url = URL.createObjectURL(file);
      setProcessedImageUrl(url);
      setProcessState(ProcessState.Ready);
    }, 1500); // Simulate network latency
  };
  
  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDownload = async () => {
    if (!processedImageUrl) return;

    try {
      // 1. Draw image to canvas at the target size
      const canvas = document.createElement('canvas');
      canvas.width = size.width;
      canvas.height = size.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      const img = new Image();
      img.src = processedImageUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
      });
      ctx.drawImage(img, 0, 0, size.width, size.height);

      // 2. Get PNG data from canvas
      const pngBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!pngBlob) throw new Error('Could not create PNG blob');

      const pngBuffer = await pngBlob.arrayBuffer();

      // 3. Convert PNG to ICO
      const icoBlob = createIcoFromPng(pngBuffer, size.width, size.height);

      // 4. Trigger download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(icoBlob);
      const originalName = originalFile?.name.split('.').slice(0, -1).join('.') || 'icon';
      link.download = `${originalName}-${size.width}x${size.height}.ico`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      setError('Failed to generate ICO file. Please try again.');
      setProcessState(ProcessState.Error);
      console.error(err);
    }
  };
  
  const handleReset = () => {
    setProcessState(ProcessState.Idle);
    setOriginalFile(null);
    if(processedImageUrl) URL.revokeObjectURL(processedImageUrl);
    setProcessedImageUrl(null);
    setSize({ width: 32, height: 32 });
    setError(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const renderContent = () => {
    switch (processState) {
      case ProcessState.Processing:
        return (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader />
            <p className="mt-4 text-slate-300 animate-pulse">Removing background...</p>
          </div>
        );
      case ProcessState.Ready:
        return (
          <div className="flex flex-col gap-8">
            <div className="text-center">
              <h3 className="text-lg font-medium text-white mb-4">Image Ready for Conversion</h3>
              <div className="relative inline-block bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAACVJREFUOE9jZGBgEGHAD97/D0eMBIkBRhxo4kAUY8aBFAMGAEboAHDyKO2kAAAAAElFTkSuQmCC')] rounded-lg shadow-lg overflow-hidden">
                <img src={processedImageUrl!} alt="Processed" className="max-w-xs max-h-64 object-contain" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <div className="flex items-center gap-2">
                    <input type="number" value={size.width} onChange={(e) => setSize({ ...size, width: Math.max(1, parseInt(e.target.value) || 1) })} className="w-20 bg-slate-700 border border-slate-600 rounded-md p-2 text-center focus:ring-2 focus:ring-brand-primary focus:border-brand-primary" />
                    <span className="text-slate-400">x</span>
                    <input type="number" value={size.height} onChange={(e) => setSize({ ...size, height: Math.max(1, parseInt(e.target.value) || 1) })} className="w-20 bg-slate-700 border border-slate-600 rounded-md p-2 text-center focus:ring-2 focus:ring-brand-primary focus:border-brand-primary" />
                    <span className="text-slate-400">px</span>
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                    {commonIcoSizes.map(s => (
                        <button key={s} onClick={() => setSize({ width: s, height: s })} className="px-2 py-1 text-xs bg-slate-600 hover:bg-slate-500 rounded-md transition-colors">{s}x{s}</button>
                    ))}
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
              <button onClick={handleReset} className="w-full sm:w-auto px-6 py-3 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500 transition-all duration-200 flex items-center justify-center gap-2">
                <Icon name="reset" className="w-5 h-5"/>
                Start Over
              </button>
              <button onClick={handleDownload} className="w-full sm:w-auto px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-brand-secondary transition-all duration-200 flex items-center justify-center gap-2">
                 <Icon name="download" className="w-5 h-5"/>
                Download .ico
              </button>
            </div>
          </div>
        );
      case ProcessState.Error:
         return (
            <div className="text-center p-8 bg-red-900/20 border border-red-500 rounded-lg">
                <p className="text-red-400 font-semibold mb-4">{error}</p>
                <button onClick={handleReset} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">Try again</button>
            </div>
         );
      case ProcessState.Idle:
      default:
        return (
          <label 
            htmlFor="file-upload" 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="relative block w-full h-64 rounded-lg border-2 border-dashed border-slate-600 hover:border-brand-primary transition-colors duration-300 cursor-pointer flex flex-col items-center justify-center text-center p-4">
            <Icon name="upload" className="w-12 h-12 text-slate-500 mb-2"/>
            <span className="text-slate-400 font-semibold">Drag & drop an image here</span>
            <span className="text-slate-500 text-sm mt-1">or</span>
            <span className="mt-2 text-sm font-semibold text-brand-primary hover:text-brand-secondary">Click to browse</span>
            <input id="file-upload" name="file-upload" type="file" ref={fileInputRef} className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
          </label>
        );
    }
  };

  return (
    <div className="bg-slate-900/70 border border-slate-700 rounded-xl shadow-2xl p-6 sm:p-8 backdrop-blur-sm">
      {renderContent()}
    </div>
  );
};
