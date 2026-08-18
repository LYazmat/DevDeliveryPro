import React from 'react';
import { X, Printer, ShieldCheck, Download, CheckCircle2, Lock, QrCode } from 'lucide-react';
import { PacoteEntrega, Empresa, ItemDemanda, NivelComplexidade } from '../types';

interface CertificadoModalProps {
  pacote: PacoteEntrega;
  empresa?: Empresa;
  demandas: ItemDemanda[];
  niveisComplexidade: NivelComplexidade[];
  onClose: () => void;
}

export const CertificadoModal: React.FC<CertificadoModalProps> = ({
  pacote,
  empresa,
  demandas,
  niveisComplexidade,
  onClose,
}) => {
  const itens = demandas.filter((d) => pacote.itemIds.includes(d.id));
  const valorFinal = pacote.valorOverride ?? pacote.valorTotalCalculado;
  const assinatura = pacote.assinatura;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#121212] rounded-2xl max-w-3xl w-full p-6 sm:p-10 shadow-2xl border border-white/10 relative my-8 text-zinc-200">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificado Formal */}
        <div className="border-2 border-emerald-500/30 p-6 sm:p-8 rounded-2xl relative overflow-hidden bg-zinc-900/90">
          {/* Watermark de Fundo */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <ShieldCheck className="w-96 h-96 text-emerald-400" />
          </div>

          {/* Cabeçalho do Certificado */}
          <div className="text-center pb-6 border-b border-white/10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2 shadow-md">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
              Certificado de Homologação & Entrega Digital
            </h1>
            <p className="text-xs text-emerald-400 uppercase tracking-widest mt-1 font-semibold">
              Registro de Auditoria Criptográfica • DevDelivery Pro
            </p>
          </div>

          {/* Dados Principais */}
          <div className="py-6 space-y-4 text-xs text-zinc-300 leading-relaxed">
            <p className="text-sm">
              Certificamos que as demandas constantes no pacote{' '}
              <strong className="text-white">"{pacote.titulo}"</strong> foram formalmente testadas,
              homologadas e aceitas pela empresa contratante{' '}
              <strong className="text-white">{empresa?.nome}</strong> (CNPJ: {empresa?.cnpj}), com competência em{' '}
              <strong className="text-emerald-400">{pacote.dataCompetencia}</strong>.
            </p>

            {/* Tabela de Itens */}
            <div className="border border-white/10 rounded-xl overflow-hidden my-4 bg-zinc-900/40">
              <div className="bg-zinc-800/80 px-4 py-2 font-bold text-zinc-200 uppercase tracking-wider text-[11px]">
                Itens de Software Entregues:
              </div>
              <div className="divide-y divide-white/5">
                {itens.map((item) => {
                  const nivel = niveisComplexidade.find((n) => n.id === item.nivelComplexidadeId);
                  return (
                    <div key={item.id} className="p-3 flex justify-between items-center text-xs">
                      <div>
                        <strong className="text-white">{item.titulo}</strong>
                        <p className="text-[11px] text-zinc-400">{item.descricao}</p>
                      </div>
                      <span className="shrink-0 font-semibold text-emerald-400">
                        {nivel?.nome} (R$ {nivel?.valorPadrao})
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="bg-zinc-800/60 px-4 py-2.5 border-t border-white/10 flex justify-between font-bold text-white">
                <span>Valor Consolidado (Maior Nível / Override):</span>
                <span className="text-emerald-400">R$ {valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Metadados e Assinatura */}
            {assinatura ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/10">
                <div className="space-y-1.5 text-[11px]">
                  <span className="font-bold text-white uppercase block">Metadados de Integridade:</span>
                  <div>Signatário: <strong className="text-zinc-100">{assinatura.nomeSignatario}</strong></div>
                  <div>CPF / Função: <strong className="text-zinc-300">{assinatura.cpfFuncao}</strong></div>
                  <div>IP Registrado: <strong className="font-mono text-emerald-400">{assinatura.ipAddress}</strong></div>
                  <div>Data do Aceite: <strong className="text-zinc-300">{new Date(assinatura.dataAssinatura).toLocaleString('pt-BR')}</strong></div>
                  <div className="break-all text-[10px] text-zinc-500 font-mono pt-1">
                    Hash SHA-256: {assinatura.hashAutenticacao}
                  </div>
                </div>

                <div className="text-center flex flex-col items-center justify-end">
                  <div className="w-48 h-20 bg-zinc-950 border border-white/10 rounded-xl p-2 flex items-center justify-center mb-1">
                    <img
                      src={assinatura.signatureDataUrl}
                      alt="Assinatura Digital"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="border-t border-white/20 w-48 pt-1">
                    <span className="text-[11px] font-bold text-white block">{assinatura.nomeSignatario}</span>
                    <span className="text-[10px] text-zinc-400 block">{assinatura.cpfFuncao}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-zinc-500 italic">
                Aguardando assinatura digital do cliente.
              </div>
            )}
          </div>
        </div>

        {/* Ações de Impressão */}
        <div className="flex items-center justify-end space-x-3 mt-6 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition"
          >
            Fechar
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold rounded-xl shadow-sm transition flex items-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Salvar em PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
