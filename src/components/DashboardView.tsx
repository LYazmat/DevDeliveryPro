import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Layers, 
  Package, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink,
  Building2,
  FileCheck2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Empresa, NivelComplexidade, ItemDemanda, PacoteEntrega } from '../types';

interface DashboardViewProps {
  empresas: Empresa[];
  niveisComplexidade: NivelComplexidade[];
  demandas: ItemDemanda[];
  pacotes: PacoteEntrega[];
  onSelectPacoteForAssinatura: (pacoteId: string) => void;
  onSelectPacoteForAprovacao: (pacoteId: string) => void;
  onNavigateToTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  empresas,
  demandas,
  pacotes,
  onSelectPacoteForAssinatura,
  onSelectPacoteForAprovacao,
  onNavigateToTab,
}) => {
  const [selectedCompetencia, setSelectedCompetencia] = useState<string>('2026-08');

  // Filtrar pacotes da competência selecionada
  const pacotesCompetencia = pacotes.filter(p => p.dataCompetencia === selectedCompetencia);

  // Cálculos por empresa na competência
  const resumoEmpresas = empresas.map(emp => {
    const pacotesEmp = pacotesCompetencia.filter(p => p.empresaId === emp.id && p.status === 'assinado');
    const totalEntregue = pacotesEmp.reduce((acc, p) => acc + (p.valorOverride ?? p.valorTotalCalculado), 0);
    const faturavelMes = Math.min(totalEntregue, emp.tetoMensal);
    const saldoDiferido = Math.max(0, totalEntregue - emp.tetoMensal);
    const percentualTeto = emp.tetoMensal > 0 ? Math.min(100, Math.round((totalEntregue / emp.tetoMensal) * 100)) : 0;

    return {
      empresa: emp,
      totalEntregue,
      faturavelMes,
      saldoDiferido,
      percentualTeto,
      pacotesAssinadosCount: pacotesEmp.length,
      pacotesTotalCount: pacotesCompetencia.filter(p => p.empresaId === emp.id).length,
    };
  });

  const totalGeralEntregue = resumoEmpresas.reduce((acc, r) => acc + r.totalEntregue, 0);
  const totalGeralFaturavel = resumoEmpresas.reduce((acc, r) => acc + r.faturavelMes, 0);
  const totalGeralDiferido = resumoEmpresas.reduce((acc, r) => acc + r.saldoDiferido, 0);

  const totalAguardandoAssinatura = pacotes.filter(p => p.status === 'entregue').length;
  const totalAguardandoAprovacao = pacotes.filter(p => p.status === 'solicitado').length;
  const totalDemandasConcluidas = demandas.filter(d => d.status === 'concluido').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header com Filtro de Competência */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 p-6 rounded-2xl border border-white/5 shadow-xs backdrop-blur-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Dashboard de Faturamento & Entregas
          </h2>
          <p className="text-sm text-zinc-400 mt-0.5">
            Acompanhamento multi-empresa com regras de teto mensal (Cap), saldo diferido e assinaturas.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Competência:</label>
          <select
            value={selectedCompetencia}
            onChange={(e) => setSelectedCompetencia(e.target.value)}
            className="px-3.5 py-2 bg-[#161616] border border-white/10 rounded-xl text-sm font-semibold text-white focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none cursor-pointer"
          >
            <option value="2026-08">Agosto / 2026 (Atual)</option>
            <option value="2026-07">Julho / 2026</option>
            <option value="2026-06">Junho / 2026</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Faturamento Efetivo do Mês */}
        <div className="bg-zinc-900/60 p-6 rounded-2xl border border-white/5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Faturável no Mês</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-bold text-white">
              R$ {totalGeralFaturavel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <p className="text-xs text-zinc-500 mt-1 flex items-center space-x-1">
              <span>Limitado pelos tetos contratuais</span>
            </p>
          </div>
        </div>

        {/* Card 2: Saldo Diferido (Excedente) */}
        <div className="bg-zinc-900/60 p-6 rounded-2xl border border-white/5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Saldo Diferido</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-bold text-amber-400">
              R$ {totalGeralDiferido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <p className="text-xs text-zinc-500 mt-1">
              Excedente a faturar no próximo mês
            </p>
          </div>
        </div>

        {/* Card 3: Total Produzido/Entregue */}
        <div className="bg-zinc-900/60 p-6 rounded-2xl border border-white/5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Valor Bruto Entregue</span>
            <div className="w-10 h-10 rounded-xl bg-zinc-800 text-zinc-300 border border-white/5 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-bold text-white">
              R$ {totalGeralEntregue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <p className="text-xs text-zinc-500 mt-1">
              Soma total dos pacotes homologados
            </p>
          </div>
        </div>

        {/* Card 4: Demandas & Assinaturas Pendentes */}
        <div className="bg-zinc-900/60 p-6 rounded-2xl border border-white/5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Ações Pendentes</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold text-white">
              {totalAguardandoAssinatura}
            </span>
            <span className="text-xs text-zinc-400">aguardando assinatura digital</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {totalAguardandoAprovacao} aguardando aprovação de escopo
          </p>
        </div>
      </div>

      {/* Grid: Acompanhamento por Empresa vs Teto Mensal & Pacotes Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Coluna 1: Empresas & Utilização do Teto Mensal (7 cols) */}
        <div className="lg:col-span-7 bg-zinc-900/60 rounded-2xl border border-white/5 shadow-xs p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Controle de Teto Mensal por Cliente</h3>
              <p className="text-xs text-zinc-400">Consumo da franquia mensal e cálculo automático de saldo diferido.</p>
            </div>
            <button
              onClick={() => onNavigateToTab('fechamento')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
            >
              <span>Ver Fechamento Completo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-6">
            {resumoEmpresas.map(({ empresa, totalEntregue, faturavelMes, saldoDiferido, percentualTeto, pacotesAssinadosCount }) => (
              <div key={empresa.id} className="p-4 rounded-xl bg-zinc-900/40 border border-white/5 hover:border-white/10 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-bold text-sm text-white">{empresa.nome}</span>
                  </div>
                  <div className="text-xs text-zinc-400 flex items-center space-x-2">
                    <span>Teto: <strong className="text-zinc-200">R$ {empresa.tetoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                    <span>•</span>
                    <span>{pacotesAssinadosCount} pacote(s) homologado(s)</span>
                  </div>
                </div>

                {/* Barra de Progresso do Teto */}
                <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden my-2.5">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      percentualTeto >= 100 ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${percentualTeto}%` }}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-zinc-400 pt-1">
                  <span>Entregue: <strong className="text-white">R$ {totalEntregue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> ({percentualTeto}%)</span>
                  <span>Faturável: <strong className="text-emerald-400 font-semibold">R$ {faturavelMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                  {saldoDiferido > 0 ? (
                    <span className="text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                      Diferido: +R$ {saldoDiferido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  ) : (
                    <span className="text-emerald-400/80">Dentro do teto</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coluna 2: Pacotes de Entrega & Links de Acesso Rápido (5 cols) */}
        <div className="lg:col-span-5 bg-zinc-900/60 rounded-2xl border border-white/5 shadow-xs p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Pacotes & Links Públicos</h3>
              <p className="text-xs text-zinc-400">Links seguros para aprovação de escopo e assinatura.</p>
            </div>
            <button
              onClick={() => onNavigateToTab('pacotes')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Ver todos
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[420px] pr-1">
            {pacotes.slice(0, 5).map(pacote => {
              const empresa = empresas.find(e => e.id === pacote.empresaId);
              const valor = pacote.valorOverride ?? pacote.valorTotalCalculado;

              return (
                <div key={pacote.id} className="p-3.5 rounded-xl border border-white/5 bg-zinc-900/40 hover:border-white/15 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
                        {empresa?.nome || 'Empresa'}
                      </span>
                      <h4 className="text-sm font-bold text-white line-clamp-1 mt-0.5">
                        {pacote.titulo}
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-zinc-200 bg-zinc-800 border border-white/5 px-2 py-1 rounded-lg shrink-0">
                      R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Status Badge & Actions */}
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                    {pacote.status === 'assinado' && (
                      <span className="inline-flex items-center text-emerald-400 font-semibold space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Homologado & Assinado</span>
                      </span>
                    )}
                    {pacote.status === 'entregue' && (
                      <span className="inline-flex items-center text-amber-400 font-semibold space-x-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Aguardando Assinatura</span>
                      </span>
                    )}
                    {pacote.status === 'solicitado' && (
                      <span className="inline-flex items-center text-zinc-300 font-semibold space-x-1">
                        <AlertCircle className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Aguardando Aprovação</span>
                      </span>
                    )}
                    {pacote.status === 'aprovado' && (
                      <span className="inline-flex items-center text-indigo-400 font-semibold space-x-1">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Em Desenvolvimento</span>
                      </span>
                    )}
                    {pacote.status === 'rascunho' && (
                      <span className="text-zinc-500 font-medium">Rascunho</span>
                    )}

                    <div className="flex items-center space-x-2">
                      {pacote.status === 'solicitado' && (
                        <button
                          onClick={() => onSelectPacoteForAprovacao(pacote.id)}
                          className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-white/10 transition flex items-center space-x-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Link Aprovação</span>
                        </button>
                      )}
                      {(pacote.status === 'entregue' || pacote.status === 'assinado') && (
                        <button
                          onClick={() => onSelectPacoteForAssinatura(pacote.id)}
                          className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition flex items-center space-x-1"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>{pacote.status === 'assinado' ? 'Ver Certificado' : 'Link Assinatura'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Regra de Negócio Explicativa */}
      <div className="p-5 rounded-2xl bg-[#111111] border border-white/10 text-zinc-200 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
              Regras do Sistema Multi-Empresa
            </span>
            <span className="text-xs text-zinc-600">•</span>
            <span className="text-xs text-zinc-400 font-medium">100% aderente ao Django Models</span>
          </div>
          <p className="text-sm text-zinc-300">
            <strong className="text-white">1. Regra do Maior Nível:</strong> Pacotes agrupados são precificados automaticamente pela demanda de maior complexidade.<br className="hidden sm:inline" />
            <strong className="text-white">2. Teto Mensal & Saldo Diferido:</strong> Entregas que excedem o teto do cliente são acumuladas automaticamente para o mês subsequente.
          </p>
        </div>
        <button
          onClick={() => onNavigateToTab('codigo_django')}
          className="px-4 py-2.5 bg-emerald-500 text-black hover:bg-emerald-400 font-bold text-xs rounded-xl shadow-md transition shrink-0"
        >
          Explorar Código Django & models.py
        </button>
      </div>
    </div>
  );
};
