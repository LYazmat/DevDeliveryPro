import React, { useState } from 'react';
import { DJANGO_FILES, DjangoFile } from '../data/djangoCodebase';
import { Code2, Copy, Check, Download, FileCode, Terminal, BookOpen } from 'lucide-react';

export const DjangoCodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<DjangoFile>(DJANGO_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([selectedFile.code], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = selectedFile.filename.split('/').pop() || 'django_file.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 p-6 rounded-2xl border border-white/5 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Code2 className="w-6 h-6 text-emerald-400" />
            <span>Repositório de Código Django (Python)</span>
          </h2>
          <p className="text-sm text-zinc-400 mt-0.5">
            Estrutura pronta para produção: modelos, views com cálculo de maior nível, URLs, formulários e template com Canvas.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl border border-white/10 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado!' : 'Copiar Arquivo'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>Baixar {selectedFile.filename.split('/').pop()}</span>
          </button>
        </div>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar com Lista de Arquivos (4 cols) */}
        <div className="lg:col-span-4 bg-zinc-900/60 rounded-2xl border border-white/5 shadow-xs p-4 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-3 py-2 block">
            Arquivos do Projeto Django
          </span>

          {DJANGO_FILES.map((file) => {
            const isSelected = selectedFile.filename === file.filename;
            return (
              <button
                key={file.filename}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left p-3 rounded-xl transition flex items-start space-x-3 text-xs ${
                  isSelected
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold shadow-xs'
                    : 'hover:bg-zinc-800/60 text-zinc-400 font-medium'
                }`}
              >
                <FileCode className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-zinc-500'}`} />
                <div className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-xs text-zinc-200">{file.filename}</span>
                  <span className="block text-[11px] text-zinc-500 font-normal truncate mt-0.5">
                    {file.description}
                  </span>
                </div>
              </button>
            );
          })}

          <div className="mt-4 pt-4 border-t border-white/5 p-3 bg-zinc-950/60 rounded-xl text-xs text-zinc-400 border border-white/5">
            <div className="flex items-center space-x-1 font-semibold text-zinc-200 mb-1">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Comandos de Migração:</span>
            </div>
            <pre className="bg-[#0a0a0a] text-emerald-400 p-2.5 rounded-lg text-[11px] font-mono mt-1 overflow-x-auto border border-white/5">
              python manage.py makemigrations{'\n'}python manage.py migrate
            </pre>
          </div>
        </div>

        {/* Editor de Código Visualizador (8 cols) */}
        <div className="lg:col-span-8 bg-[#0d0d0e] rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col">
          {/* Barra Superior do Código */}
          <div className="bg-[#141417] px-5 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
              <span className="ml-3 text-xs font-mono text-zinc-300 font-semibold">{selectedFile.filename}</span>
            </div>
            <span className="text-[11px] font-mono uppercase bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-white/5">
              {selectedFile.language}
            </span>
          </div>

          {/* Área de Visualização do Código */}
          <div className="p-6 overflow-x-auto max-h-[600px] overflow-y-auto font-mono text-xs text-zinc-300 leading-relaxed">
            <pre>
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
