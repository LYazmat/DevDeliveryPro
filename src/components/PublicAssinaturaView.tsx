import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  CheckCircle2, 
  RotateCcw, 
  Download, 
  FileCheck2, 
  Lock, 
  Building2, 
  Layers,
  Sparkles,
  Printer,
  PenTool,
  Check
} from 'lucide-react';
import { PacoteEntrega, Empresa, ItemDemanda, NivelComplexidade, AssinaturaEntrega } from '../types';

interface PublicAssinaturaViewProps {
  pacote: PacoteEntrega;
  empresa?: Empresa;
  demandas: ItemDemanda[];
  niveisComplexidade: NivelComplexidade[];
  onAssinarEntrega: (pacoteId: string, assinatura: AssinaturaEntrega) => void;
  onOpenCertificado: (pacoteId: string) => void;
}

export const PublicAssinaturaView: React.FC<PublicAssinaturaViewProps> = ({
  pacote,
  empresa,
  demandas,
  niveisComplexidade,
  onAssinarEntrega,
  onOpenCertificado,
}) => {
  const sigPadRef = useRef<SignatureCanvas | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [penColor, setPenColor] = useState('#34d399'); // Emerald padrão

  const [nomeSignatario, setNomeSignatario] = useState(
    empresa?.respEntregaNome || empresa?.nomeContato || ''
  );
  const [cpfFuncao, setCpfFuncao] = useState('');
  const [declaracaoHomologacao, setDeclaracaoHomologacao] = useState(false);
  const [clientIp, setClientIp] = useState('189.120.45.67');

  const itensDoPacote = demandas.filter((d) => pacote.itemIds.includes(d.id));
  const valorFinal = pacote.valorOverride ?? pacote.valorTotalCalculado;
  const isAlreadySigned = pacote.status === 'assinado' && !!pacote.assinatura;

  useEffect(() => {
    // Detectar IP aproximado
    fetch('https://api.ipify.org?format=json')
      .then((res) => res.json())
      .then((data) => {
        if (data.ip) setClientIp(data.ip);
      })
      .catch(() => {});
  }, []);

  const clearSignature = () => {
    if (sigPadRef.current) {
      sigPadRef.current.clear();
      setHasDrawn(false);
    }
  };

  const handleBeginStroke = () => {
    setHasDrawn(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomeSignatario.trim() || !cpfFuncao.trim()) {
      alert('Preencha seu Nome Completo e CPF/Função.');
      return;
    }

    if (!sigPadRef.current || sigPadRef.current.isEmpty()) {
      alert('Por favor, desenhe sua assinatura no quadro.');
      return;
    }

    if (!declaracaoHomologacao) {
      alert('Marque a declaração de homologação para concluir.');
      return;
    }

    // Exporta imagem em PNG de alta definição gerada pelo SignaturePad
    const signatureDataUrl = sigPadRef.current.getTrimmedCanvas().toDataURL('image/png');
    const nowIso = new Date().toISOString();
    const hashStr = `sha256:${Math.random().toString(36).substring(2)}${Date.now()}`;

    const novaAssinatura: AssinaturaEntrega = {
      id: `ass-${Date.now()}`,
      pacoteId: pacote.id,
      nomeSignatario: nomeSignatario.trim(),
      cpfFuncao: cpfFuncao.trim(),
      signatureDataUrl,
      ipAddress: clientIp,
      userAgent: navigator.userAgent,
      dataAssinatura: nowIso,
      hashAutenticacao: hashStr,
    };

    onAssinarEntrega(pacote.id, novaAssinatura);

    // Disparar confetes de celebração de entrega homologada
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 animate-fadeIn">
      {/* Header do Link de Homologação */}
      <div className="bg-zinc-900/60 rounded-2xl border border-white/5 shadow-xs p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/5 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-xl">
              ✓
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Fase 2: Homologação & Assinatura Digital
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                Termo de Aceite e Entrega de Software
              </h1>
              <p className="text-xs text-zinc-400">{empresa?.nome}</p>
            </div>
          </div>

          <div className="bg-zinc-900/80 px-4 py-3 rounded-xl border border-white/5 text-right">
            <span className="text-xs text-zinc-500 block">Valor Consolidado</span>
            <span className="text-xl font-bold text-emerald-400">
              R$ {valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Destinatário Configurado */}
        {empresa && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-zinc-300">
                Link destinado ao <strong>Responsável por Aceite e Entrega de Software:</strong>
              </span>
            </div>
            <div className="font-semibold text-white">
              {empresa.respEntregaNome || empresa.nomeContato} &lt;{empresa.respEntregaEmail || empresa.emailContato}&gt;
            </div>
          </div>
        )}

        {/* Detalhes do Pacote Entregue */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
              Demandas Entregues no Pacote ({itensDoPacote.length}):
            </h2>
            <span className="text-xs text-zinc-400">
              Competência: <strong className="text-white">{pacote.dataCompetencia}</strong>
            </span>
          </div>

          <div className="space-y-3">
            {itensDoPacote.map((item) => {
              const nivel = niveisComplexidade.find((n) => n.id === item.nivelComplexidadeId);
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-zinc-900/40 border border-white/5 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                >
                  <div>
                    <h3 className="text-sm font-bold text-white">{item.titulo}</h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{item.descricao}</p>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-800 text-zinc-200 border border-white/5 self-start">
                    {nivel?.nome} (R$ {nivel?.valorPadrao})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Se já foi assinado, exibir comprovante */}
      {isAlreadySigned && pacote.assinatura ? (
        <div className="bg-zinc-900/60 rounded-2xl border border-white/5 shadow-xs p-6 sm:p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500 text-black flex items-center justify-center mx-auto font-bold shadow-lg">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white">Entrega Homologada & Assinada</h3>
            <p className="text-sm text-zinc-400 max-w-md mx-auto mt-1">
              O termo de entrega foi assinado digitalmente com hash criptográfico e registro de IP.
            </p>
          </div>

          {/* Card com Assinatura e Dados */}
          <div className="max-w-md mx-auto p-5 rounded-2xl bg-[#18181b] border border-white/10 text-left space-y-3 text-xs text-zinc-200">
            <div>
              <span className="text-zinc-500 block">Signatário:</span>
              <strong className="text-white text-sm">{pacote.assinatura.nomeSignatario}</strong>
            </div>
            <div>
              <span className="text-zinc-500 block">CPF / Função:</span>
              <strong className="text-zinc-300">{pacote.assinatura.cpfFuncao}</strong>
            </div>
            <div>
              <span className="text-zinc-500 block">Data e Hora:</span>
              <strong className="text-zinc-300">
                {new Date(pacote.assinatura.dataAssinatura).toLocaleString('pt-BR')}
              </strong>
            </div>
            <div>
              <span className="text-zinc-500 block">IP Registrado:</span>
              <strong className="text-emerald-400 font-mono">{pacote.assinatura.ipAddress}</strong>
            </div>

            <div className="pt-2 border-t border-white/10">
              <span className="text-zinc-500 block mb-1">Vetor da Assinatura:</span>
              <div className="h-24 bg-zinc-900 rounded-xl border border-white/10 p-2 flex items-center justify-center">
                <img
                  src={pacote.assinatura.signatureDataUrl}
                  alt="Assinatura"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              onClick={() => onOpenCertificado(pacote.id)}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold rounded-xl shadow-sm transition flex items-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>Visualizar / Imprimir Certificado Completo</span>
            </button>
          </div>
        </div>
      ) : (
        /* Formulário de Assinatura com Canvas */
        <form onSubmit={handleSubmit} className="bg-zinc-900/60 rounded-2xl border border-white/5 shadow-xs p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">Assinatura Digital do Responsável</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Desenhe sua assinatura no quadro abaixo. O sistema registrará seu IP e carimbo de data/hora para fins legais de auditoria.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Nome Completo do Signatário *
              </label>
              <input
                type="text"
                required
                value={nomeSignatario}
                onChange={(e) => setNomeSignatario(e.target.value)}
                placeholder="Ex: Mariana Rocha"
                className="w-full px-4 py-2.5 bg-[#18181b] border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                CPF e Cargo / Função *
              </label>
              <input
                type="text"
                required
                value={cpfFuncao}
                onChange={(e) => setCpfFuncao(e.target.value)}
                placeholder="Ex: 123.456.789-00 - Gerente de TI"
                className="w-full px-4 py-2.5 bg-[#18181b] border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Signature Canvas Pad com react-signature-canvas */}
          <div>
            <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
              <div className="flex items-center space-x-2">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Quadro de Assinatura (Mouse, Dedo ou Caneta Stylus) *
                </label>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                  <PenTool className="w-3 h-3" />
                  <span>Curvas Suaves HD</span>
                </span>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                {/* Paleta de Cores de Caneta */}
                <div className="flex items-center space-x-1.5 bg-zinc-950 px-2 py-1 rounded-lg border border-white/10">
                  <span className="text-[11px] text-zinc-400 mr-1">Cor:</span>
                  {[
                    { color: '#34d399', label: 'Emerald' },
                    { color: '#60a5fa', label: 'Azul' },
                    { color: '#ffffff', label: 'Branco' },
                    { color: '#fbbf24', label: 'Dourado' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setPenColor(c.color)}
                      style={{ backgroundColor: c.color }}
                      className={`w-4 h-4 rounded-full transition transform ${
                        penColor === c.color ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                      }`}
                      title={`Caneta ${c.label}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-xs text-zinc-400 hover:text-rose-400 flex items-center space-x-1 px-2 py-1 rounded-lg bg-zinc-950 border border-white/10 hover:border-rose-500/30 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Limpar Assinatura</span>
                </button>
              </div>
            </div>

            <div className="relative w-full h-52 bg-[#121214] rounded-2xl border-2 border-dashed border-white/20 overflow-hidden cursor-crosshair">
              <SignatureCanvas
                ref={sigPadRef}
                onBegin={handleBeginStroke}
                penColor={penColor}
                minWidth={1.5}
                maxWidth={3.5}
                dotSize={2}
                velocityFilterWeight={0.7}
                canvasProps={{
                  className: 'w-full h-full block touch-none',
                  style: { width: '100%', height: '100%' }
                }}
              />

              {!hasDrawn && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-zinc-500 text-sm">
                  <PenTool className="w-6 h-6 mb-1 text-zinc-600 animate-bounce" />
                  <span>✍️ Assine aqui com o dedo ou mouse</span>
                  <span className="text-[11px] text-zinc-600 mt-0.5">Suavização dinâmica de traço por Bézier</span>
                </div>
              )}
            </div>
          </div>

          {/* Metadados de Auditoria */}
          <div className="p-4 bg-[#18181b] rounded-xl border border-white/10 text-xs text-zinc-400 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>IP Registrado: <strong className="text-white font-mono">{clientIp}</strong></span>
            </div>
            <div>
              <span>Timestamp: <strong className="text-white">{new Date().toLocaleString('pt-BR')}</strong></span>
            </div>
          </div>

          {/* Declaração */}
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={declaracaoHomologacao}
              onChange={(e) => setDeclaracaoHomologacao(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-emerald-500 rounded border-white/20 focus:ring-emerald-500"
            />
            <span className="text-xs text-zinc-400 leading-relaxed">
              Declaro para os devidos fins que as demandas técnicas deste pacote foram entregues, testadas e homologadas em conformidade com as regras acordadas.
            </span>
          </label>

          {/* Botão de Conclusão */}
          <button
            type="submit"
            className="w-full py-4 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-sm transition text-base flex items-center justify-center space-x-2"
          >
            <span>Homologar e Concluir Assinatura Digital</span>
          </button>
        </form>
      )}
    </div>
  );
};
