import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, FileText, Layers, Building2, User, ArrowRight } from 'lucide-react';
import { PacoteEntrega, Empresa, ItemDemanda, NivelComplexidade } from '../types';

interface PublicAprovacaoViewProps {
  pacote: PacoteEntrega;
  empresa?: Empresa;
  demandas: ItemDemanda[];
  niveisComplexidade: NivelComplexidade[];
  onAprovarEscopo: (pacoteId: string, nomeResponsavel: string) => void;
}

export const PublicAprovacaoView: React.FC<PublicAprovacaoViewProps> = ({
  pacote,
  empresa,
  demandas,
  niveisComplexidade,
  onAprovarEscopo,
}) => {
  const [nomeResponsavel, setNomeResponsavel] = useState(
    empresa?.respAprovacaoNome || empresa?.nomeContato || ''
  );
  const [concordancia, setConcordancia] = useState(false);
  const [isSuccess, setIsSuccess] = useState(pacote.status !== 'rascunho' && pacote.status !== 'solicitado');

  const itensDoPacote = demandas.filter((d) => pacote.itemIds.includes(d.id));
  const valorFinal = pacote.valorOverride ?? pacote.valorTotalCalculado;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeResponsavel.trim()) {
      alert('Por favor, informe seu nome completo.');
      return;
    }
    if (!concordancia) {
      alert('Você precisa marcar a caixa de concordância com o escopo.');
      return;
    }

    onAprovarEscopo(pacote.id, nomeResponsavel);
    setIsSuccess(true);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 animate-fadeIn">
      {/* Header do Link Público */}
      <div className="bg-zinc-900/60 rounded-2xl border border-white/5 shadow-xs p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/5 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-xl">
              📋
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                Fase 1: Solicitação & Validação Prévia de Escopo
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                Aprovação Prévia de Demandas
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
          <div className="mt-4 p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-zinc-300">
                Link destinado ao <strong>Responsável por Aprovação Prévia:</strong>
              </span>
            </div>
            <div className="font-semibold text-white">
              {empresa.respAprovacaoNome || empresa.nomeContato} &lt;{empresa.respAprovacaoEmail || empresa.emailContato}&gt;
            </div>
          </div>
        )}

        {/* Detalhes do Pacote */}
        <div className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200 mb-3">
            Pacote: {pacote.titulo} (Competência {pacote.dataCompetencia})
          </h2>
          {pacote.observacoes && (
            <p className="text-xs text-zinc-300 bg-zinc-900/80 p-3 rounded-xl border border-white/5 mb-4">
              <strong className="text-white">Observações da Equipe Técnica:</strong> {pacote.observacoes}
            </p>
          )}

          {/* Lista de Itens para Aprovação */}
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
                    Nível {nivel?.nome} (R$ {nivel?.valorPadrao})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Formulário de Aprovação ou Confirmação de Sucesso */}
      {isSuccess ? (
        <div className="bg-emerald-500/10 rounded-2xl border border-emerald-500/20 p-8 text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-500 text-black flex items-center justify-center mx-auto mb-4 font-bold">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-emerald-400">Escopo Aprovado com Sucesso!</h3>
          <p className="text-sm text-zinc-300 max-w-md mx-auto mt-2">
            O time de desenvolvimento foi notificado e já iniciou a execução das demandas deste pacote.
          </p>
          <div className="mt-4 text-xs text-zinc-400">
            Aprovado por: <strong className="text-white">{pacote.aprovadoPorNome || nomeResponsavel}</strong>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-zinc-900/60 rounded-2xl border border-white/5 shadow-xs p-6 sm:p-8">
          <h3 className="text-lg font-bold text-white mb-1">Confirmação de Início & Aceite de Escopo</h3>
          <p className="text-xs text-zinc-400 mb-6">
            Por favor, preencha seus dados para autorizar formalmente o início do desenvolvimento.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Nome do Responsável pela Aprovação *
              </label>
              <input
                type="text"
                required
                value={nomeResponsavel}
                onChange={(e) => setNomeResponsavel(e.target.value)}
                placeholder="Ex: Carlos Eduardo Mendes"
                className="w-full px-4 py-2.5 bg-[#18181b] border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <label className="flex items-start space-x-3 cursor-pointer pt-2">
              <input
                type="checkbox"
                required
                checked={concordancia}
                onChange={(e) => setConcordancia(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-emerald-500 rounded border-white/20 focus:ring-emerald-500"
              />
              <span className="text-xs text-zinc-400 leading-relaxed">
                Declaro que revisei o escopo técnico e a complexidade das demandas listadas acima e autorizo o início do desenvolvimento com a cobrança baseada no maior nível de complexidade do pacote.
              </span>
            </label>

            <button
              type="submit"
              className="w-full mt-4 py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-sm transition text-sm flex items-center justify-center space-x-2"
            >
              <span>Aprovar Escopo & Autorizar Início</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
