
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Loader2, Image as ImageIcon, Upload, Trash2 } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File, prompt: string) => Promise<void>;
}

export const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setPreview('');
      setPrompt('');
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  // Clean up object URL
  useEffect(() => {
      return () => {
          if (preview) URL.revokeObjectURL(preview);
      }
  }, [preview]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const f = e.target.files[0];
          if (f.size > 5 * 1024 * 1024) {
              setError("Image size too large (max 5MB)");
              return;
          }
          setFile(f);
          setPreview(URL.createObjectURL(f));
          setError('');
      }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!file || isLoading) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      await onSubmit(file, prompt);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Generation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  const clearFile = () => {
      setFile(null);
      setPreview('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col border-4 border-violet-100 animate-in fade-in zoom-in duration-200 scale-95 sm:scale-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-violet-50 bg-gradient-to-r from-violet-50 to-fuchsia-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-100 text-violet-600">
                <ImageIcon size={24} strokeWidth={2.5} />
            </div>
            <div>
                <h2 className="text-xl font-extrabold text-slate-800">
                    Image to Voxel
                </h2>
                <p className="text-xs font-bold uppercase tracking-wide text-violet-400">
                    POWERED BY GEMINI VISION
                </p>
            </div>
          </div>
          <button 
            onClick={!isLoading ? onClose : undefined}
            className="p-2 rounded-xl bg-white/50 text-slate-400 hover:bg-white hover:text-slate-700 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 bg-white flex flex-col gap-4">
          
          {/* File Upload Area */}
          <div 
            onClick={!file ? triggerFileSelect : undefined}
            className={`
                relative w-full aspect-video rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden group
                ${file 
                    ? 'border-violet-200 bg-slate-50' 
                    : 'border-slate-300 hover:border-violet-400 hover:bg-violet-50 cursor-pointer'}
            `}
          >
              {preview ? (
                  <>
                    <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                    <button 
                        onClick={(e) => { e.stopPropagation(); clearFile(); }}
                        className="absolute top-2 right-2 p-2 bg-rose-500 text-white rounded-lg shadow-lg hover:bg-rose-600 transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                  </>
              ) : (
                  <>
                    <div className="p-4 rounded-full bg-slate-100 text-slate-400 mb-3 group-hover:scale-110 transition-transform group-hover:bg-violet-200 group-hover:text-violet-600">
                        <Upload size={32} />
                    </div>
                    <p className="text-sm font-bold text-slate-500 group-hover:text-violet-600">Click to upload an image</p>
                    <p className="text-xs text-slate-400">JPG, PNG (Max 5MB)</p>
                  </>
              )}
              <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
              />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Optional Instructions
            </label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Focus on the face, make it colorful..."
              disabled={isLoading}
              className="w-full h-20 resize-none bg-slate-50 border-2 border-slate-200 rounded-xl p-3 font-medium text-slate-700 focus:outline-none focus:ring-4 focus:border-violet-400 focus:ring-violet-100 transition-all placeholder:text-slate-400 text-sm"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
              <X size={16} /> {error}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button 
              onClick={handleSubmit}
              disabled={!file || isLoading}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm transition-all
                ${isLoading 
                  ? 'bg-slate-200 text-slate-400 cursor-wait' 
                  : 'bg-violet-500 hover:bg-violet-600 shadow-lg shadow-violet-500/30 active:scale-95'}
              `}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={18} fill="currentColor" />
                  Generate 3D Model
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
