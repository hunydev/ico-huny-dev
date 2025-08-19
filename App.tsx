
import React from 'react';
import { ImageProcessor } from './components/ImageProcessor';
import { Icon } from './components/Icon';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-800/50">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Icon name="logo" className="w-12 h-12 text-brand-primary" />
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              ICO Quick-Converter
            </h1>
          </div>
          <p className="mt-4 text-lg text-slate-400">
            Upload an image, resize, and download your .ico file in seconds.
          </p>
        </header>
        <main>
          <ImageProcessor />
        </main>
        <footer className="text-center mt-8 text-slate-500 text-sm">
          <p>Powered by React & Tailwind CSS</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
