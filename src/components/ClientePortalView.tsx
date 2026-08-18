import React, { useState } from 'react';
import { 
  Building2, 
  Package, 
  ListTodo, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  FileCheck2, 
  Plus, 
  ExternalLink,
  Layers,
  ArrowRight,
  TrendingUp,
  FileText,
  UserCheck,
  Mail
} from 'lucide-react';
import { Empresa, NivelComplexidade, ItemDemanda, PacoteEntrega, AuthUser, StatusDemanda } from '../types';

interface ClientePortalViewProps {
  user: AuthUser;
  empresa: Empresa;
  demandas: ItemDemanda[];
  pacotes: PacoteEntrega[];
  niveisComplexidade: NivelComplexidade[];
  onAddDemanda: (demanda: Omit<ItemDemanda, 'id' | 'dataCriacao'>) => void;
  onSelectPacoteForAprovacao: (pacoteId: string) => void;
  onSelectPacoteForAssinatura: (pacoteId: string) => void;
  onOpenCertificado: (pacoteId: string) => void;
}

export const ClientePortalView: React.FC<ClientePortalViewProps> = ({
  user,
  empresa,
  demandas,
  pacotes,
  niveisComplexidade,
  onAddDemanda,
  onSelectPacoteForAprovacao,
  onSelectPacoteForAssinatura,
  onOpenCertificado,
}) => {
  const [subTab, setSubTab] = useState<'visao_geral' | 'demandas' | 'pacotes' | 'extrato'>('visao_geral');
  const [isNewDemandaModalOpen, setIsNewDemandaModalOpen] = useState(false);
  const [filterStatusDemanda, setFilterStatusDemanda] = useState<string>('all');

  // Filtrar apenas demandas e pacotes da empresa do cliente
  const minhasDemandas = demandas.filter((d) => d.empresaId === empresa.id);
  const meusPacotes = pacotes.filter((p) => p.empresaId === empresa.id);

  // Nova solicitação de demanda pelo cliente
  const [newDemandaForm, setNewDemandaForm] = useState({
    titulo: '',
    descricao: '',
    nivelComplexidadeId: niveisComplexidade[0]?.id || '',
  });

  // Cálculos financeiros do cliente
  const competenciaAtual = '2026-08';
  const pacotesMes = meusPacotes.filter((p) => p.dataCompetencia === competenciaAtual);
  const pacotesAssinadosMes = pacotesMes.filter((p) => p.status === 'assinado');
  
  const totalEntregueMes = pacotesAssinadosMes.reduce(
    (acc, p) => acc + (p.valorOverride ?? p.valorTotalCalculado),
    0
  );
  const faturavelMes = Math.min(totalEntregueMes, empresa.tetoMensal);
  const saldoDiferido = Math.max(0, totalEntregueMes - empresa.tetoMensal);
  const percentualTeto = empresa.tetoMensal > 0 ? Math.min(100, Math.round((totalEntregueMes / empresa.tetoMensal) * 100)) : 0;

  const pacotesAguardandoAprovacao = meusPacotes.filter((p) => p.status === 'solicitado');
  const pacotesAguardandoAssinatura = meusPacotes.filter((p) => p.status === 'entregue');

  const handleCreateDemanda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDemandaForm.titulo.trim()) {
      alert('Informe o título da solicitação.');
      return;
    }

    onAddDemanda({
      titulo: newDemandaForm.titulo,
      descricao: newDemandaForm.descricao,
      empresaId: empresa.id,
      nivelComplexidadeId: newDemandaForm.nivelComplexidadeId,
      status: 'pendente',
    });

    setNewDemandaForm({
      titulo: '',
      descricao: '',
      nivelComplexidadeId: niveisComplexidade[0]?.id || '',
    });
    setIsNewDemandaModalOpen(false);
  };

  const filteredDemandas = minhasDemandas.filter((d) => {
    if (filterStatusDemanda !== 'all' && d.status !== filterStatusDemanda) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Banner de Boas-Vindas do Portal do Cliente */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-[#121815] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Portal do Cliente Contratante</span>
              </span>
              <span className="text-xs text-zinc-500 font-mono">CNPJ: {empresa.cnpj}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {empresa.nome}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Conectado como <strong className="text-white">{user.nome}</strong> ({user.email})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsNewDemandaModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Solicitar Nova Demanda</span>
            </button>
          </div>
        </div>

        {/* Responsáveis Designados na Empresa */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-zinc-950/60 rounded-xl border border-white/5 flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                Responsável por Aprovação Prévia de Demandas:
              </span>
              <strong className="text-white text-xs block mt-0.5">
                {empresa.respAprovacaoNome || 'Não configurado'}
              </strong>
              <span className="text-zinc-400 text-[11px]">{empresa.respAprovacaoEmail || empresa.emailContato}</span>
            </div>
          </div>

          <div className="p-3 bg-zinc-950/60 rounded-xl border border-white/5 flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                Responsável por Aceite e Entrega de Software:
              </span>
              <strong className="text-white text-xs block mt-0.5">
                {empresa.respEntregaNome || 'Não configurado'}
              </strong>
              <span className="text-zinc-400 text-[11px]">{empresa.respEntregaEmail || empresa.emailContato}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-navegação do Cliente */}
      <div className="flex space-x-2 border-b border-white/10 pb-3 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setSubTab('visao_geral')}
          className={`px-4 py-2 rounded-xl transition flex items-center space-x-2 ${
            subTab === 'visao_geral'
              ? 'bg-zinc-800 text-white border border-white/10 shadow-xs'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
          }`}
        >
          <span>Visão Geral & Pendências</span>
          {(pacotesAguardandoAprovacao.length > 0 || pacotesAguardandoAssinatura.length > 0) && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => setSubTab('demandas')}
          className={`px-4 py-2 rounded-xl transition flex items-center space-x-2 ${
            subTab === 'demandas'
              ? 'bg-zinc-800 text-white border border-white/10 shadow-xs'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
          }`}
        >
          <ListTodo className="w-3.5 h-3.5" />
          <span>Minhas Demandas ({minhasDemandas.length})</span>
        </button>

        <button
          onClick={() => setSubTab('pacotes')}
          className={`px-4 py-2 rounded-xl transition flex items-center space-x-2 ${
            subTab === 'pacotes'
              ? 'bg-zinc-800 text-white border border-white/10 shadow-xs'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Meus Pacotes de Entrega ({meusPacotes.length})</span>
        </button>

        <button
          onClick={() => setSubTab('extrato')}
          className={`px-4 py-2 rounded-xl transition flex items-center space-x-2 ${
            subTab === 'extrato'
              ? 'bg-zinc-800 text-white border border-white/10 shadow-xs'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Extrato & Teto Contratual</span>
        </button>
      </div>

      {/* Conteúdo das Sub-abas */}

      {/* 1. VISÃO GERAL */}
      {subTab === 'visao_geral' && (
        <div className="space-y-6">
          {/* Cards de Alerta de Ações Pendentes */}
          {(pacotesAguardandoAprovacao.length > 0 || pacotesAguardandoAssinatura.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pacotesAguardandoAprovacao.map((p) => (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Aprovação Prévia Pendente
                      </span>
                      <span className="text-xs text-zinc-400">Competência: {p.dataCompetencia}</span>
                    </div>
                    <h3 className="text-base font-bold text-white">{p.titulo}</h3>
                    <p className="text-xs text-zinc-300">
                      O desenvolvedor montou este pacote para sua avaliação. Revise os itens e aprove o escopo para autorizar o início do desenvolvimento.
                    </p>
                  </div>

                  <button
                    onClick={() => onSelectPacoteForAprovacao(p.id)}
                    className="mt-4 w-full py-2.5 px-4 bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2 shadow-sm"
                  >
                    <span>Revisar & Aprovar Escopo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {pacotesAguardandoAssinatura.map((p) => (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Homologação & Assinatura Digital
                      </span>
                      <span className="text-xs text-zinc-400">Competência: {p.dataCompetencia}</span>
                    </div>
                    <h3 className="text-base font-bold text-white">{p.titulo}</h3>
                    <p className="text-xs text-zinc-300">
                      As demandas deste pacote foram entregues e estão prontas para homologação final e assinatura do termo de aceite.
                    </p>
                  </div>

                  <button
                    onClick={() => onSelectPacoteForAssinatura(p.id)}
                    className="mt-4 w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2 shadow-sm"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Homologar & Assinar Digitalmente</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-zinc-900/60 p-5 rounded-2xl border border-white/5">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                Teto Contratual Mensal
              </span>
              <span className="text-2xl font-bold text-white mt-1 block">
                R$ {empresa.tetoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden my-3">
                <div
                  className={`h-full rounded-full ${percentualTeto >= 100 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                  style={{ width: `${percentualTeto}%` }}
                />
              </div>
              <span className="text-xs text-zinc-400">
                {percentualTeto}% consumido no mês ({competenciaAtual})
              </span>
            </div>

            <div className="bg-zinc-900/60 p-5 rounded-2xl border border-white/5">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                Faturável Efetivo no Mês
              </span>
              <span className="text-2xl font-bold text-emerald-400 mt-1 block">
                R$ {faturavelMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <p className="text-xs text-zinc-500 mt-3">
                Baseado em {pacotesAssinadosMes.length} pacote(s) homologado(s)
              </p>
            </div>

            <div className="bg-zinc-900/60 p-5 rounded-2xl border border-white/5">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
                Saldo Diferido (Excedente)
              </span>
              <span className="text-2xl font-bold text-amber-400 mt-1 block">
                R$ {saldoDiferido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <p className="text-xs text-zinc-500 mt-3">
                {saldoDiferido > 0 ? 'Transfere para o próximo mês sem juros' : 'Dentro da franquia mensal'}
              </p>
            </div>
          </div>

          {/* Últimas Demandas em Andamento */}
          <div className="bg-zinc-900/60 rounded-2xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Demandas Recentes em Execução</h3>
              <button
                onClick={() => setSubTab('demandas')}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Ver todas ({minhasDemandas.length})
              </button>
            </div>

            <div className="divide-y divide-white/5">
              {minhasDemandas.slice(0, 4).map((dem) => {
                const nivel = niveisComplexidade.find((n) => n.id === dem.nivelComplexidadeId);
                return (
                  <div key={dem.id} className="py-3.5 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-white">{dem.titulo}</h4>
                      <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{dem.descricao}</p>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-white/5">
                        {nivel?.nome} (R$ {nivel?.valorPadrao})
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          dem.status === 'concluido'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : dem.status === 'em_andamento'
                            ? 'bg-blue-500/10 text-blue-400'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {dem.status === 'concluido'
                          ? 'Concluído'
                          : dem.status === 'em_andamento'
                          ? 'Em Andamento'
                          : 'Pendente'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. MINHAS DEMANDAS */}
      {subTab === 'demandas' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/60 p-4 rounded-xl border border-white/5 text-xs">
            <div className="flex items-center space-x-3">
              <span className="font-semibold text-zinc-400 uppercase">Filtrar Status:</span>
              <select
                value={filterStatusDemanda}
                onChange={(e) => setFilterStatusDemanda(e.target.value)}
                className="px-3 py-1.5 bg-[#18181b] border border-white/10 rounded-lg text-white font-medium focus:outline-none"
              >
                <option value="all">Todas as Demandas ({minhasDemandas.length})</option>
                <option value="pendente">Pendentes</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="concluido">Concluídas</option>
              </select>
            </div>

            <button
              onClick={() => setIsNewDemandaModalOpen(true)}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg transition flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Solicitação</span>
            </button>
          </div>

          <div className="bg-zinc-900/60 rounded-2xl border border-white/5 divide-y divide-white/5">
            {filteredDemandas.map((dem) => {
              const nivel = niveisComplexidade.find((n) => n.id === dem.nivelComplexidadeId);
              return (
                <div key={dem.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-900/90 transition">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500">ID: {dem.id} • Criado em {dem.dataCriacao}</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{dem.titulo}</h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{dem.descricao}</p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-800 text-zinc-200 border border-white/5">
                      {nivel?.nome} (R$ {nivel?.valorPadrao})
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        dem.status === 'concluido'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : dem.status === 'em_andamento'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {dem.status === 'concluido' ? 'Concluído' : dem.status === 'em_andamento' ? 'Em Execução' : 'Pendente'}
                    </span>
                  </div>
                </div>
              );
            })}
            {filteredDemandas.length === 0 && (
              <div className="p-8 text-center text-xs text-zinc-500">
                Nenhuma demanda encontrada para o filtro selecionado.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. MEUS PACOTES */}
      {subTab === 'pacotes' && (
        <div className="space-y-4">
          {meusPacotes.map((pacote) => {
            const itensDoPacote = demandas.filter((d) => pacote.itemIds.includes(d.id));
            const valorFinal = pacote.valorOverride ?? pacote.valorTotalCalculado;

            return (
              <div key={pacote.id} className="bg-zinc-900/60 rounded-2xl border border-white/5 p-6 hover:border-white/15 transition space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                      Competência {pacote.dataCompetencia}
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">{pacote.titulo}</h3>
                    {pacote.observacoes && (
                      <p className="text-xs text-zinc-400 italic mt-0.5">{pacote.observacoes}</p>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 uppercase block">Valor Consolidado</span>
                    <span className="text-lg font-bold text-emerald-400">
                      R$ {valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Itens do Pacote */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                    Demandas Entregues / Agrupadas ({itensDoPacote.length}):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {itensDoPacote.map((item) => {
                      const nivel = niveisComplexidade.find((n) => n.id === item.nivelComplexidadeId);
                      return (
                        <div key={item.id} className="p-3 bg-zinc-900/40 rounded-xl border border-white/5 text-xs flex justify-between gap-2">
                          <div>
                            <strong className="text-zinc-200 block">{item.titulo}</strong>
                            <span className="text-[11px] text-zinc-500">{item.descricao}</span>
                          </div>
                          <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300">
                            {nivel?.nome}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Ações de Homologação / Assinatura */}
                <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-zinc-500">Status:</span>
                    <span className="font-bold text-white capitalize">{pacote.status}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {pacote.status === 'solicitado' && (
                      <button
                        onClick={() => onSelectPacoteForAprovacao(pacote.id)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition flex items-center space-x-1.5"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>Aprovar Escopo</span>
                      </button>
                    )}

                    {pacote.status === 'entregue' && (
                      <button
                        onClick={() => onSelectPacoteForAssinatura(pacote.id)}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition flex items-center space-x-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Assinar Termo de Aceite</span>
                      </button>
                    )}

                    {pacote.status === 'assinado' && (
                      <button
                        onClick={() => onOpenCertificado(pacote.id)}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-emerald-500/30 font-bold rounded-xl transition flex items-center space-x-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Visualizar Certificado Digital</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. EXTRATO FINANCEIRO */}
      {subTab === 'extrato' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/60 p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white">Regras de Faturamento do Contrato</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Sua empresa possui um teto mensal acordado de <strong className="text-emerald-400">R$ {empresa.tetoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>. 
              Demandas e pacotes entregues no mês são faturados até esse limite. Qualquer valor excedente é diferido automaticamente para as próximas competências sem custos adicionais.
            </p>

            <div className="p-4 bg-zinc-950 rounded-xl border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-zinc-500 block">Total Produzido no Mês:</span>
                <strong className="text-white text-base">R$ {totalEntregueMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div>
                <span className="text-zinc-500 block">Faturável no Mês (Cap):</span>
                <strong className="text-emerald-400 text-base">R$ {faturavelMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div>
                <span className="text-zinc-500 block">Saldo Excedente Diferido:</span>
                <strong className="text-amber-400 text-base">R$ {saldoDiferido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nova Demanda Solicitada pelo Cliente */}
      {isNewDemandaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#121212] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-white/10 text-zinc-200">
            <h3 className="text-xl font-bold text-white mb-1">Solicitar Nova Demanda / Feature</h3>
            <p className="text-xs text-zinc-400 mb-6">
              Envie a descrição do requisito para o desenvolvedor analisar e enquadrar na complexidade.
            </p>

            <form onSubmit={handleCreateDemanda} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Título da Solicitação *
                </label>
                <input
                  type="text"
                  required
                  value={newDemandaForm.titulo}
                  onChange={(e) => setNewDemandaForm({ ...newDemandaForm, titulo: e.target.value })}
                  placeholder="Ex: Novo relatório de conciliação diária"
                  className="w-full px-3.5 py-2.5 bg-[#18181b] border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Sugestão de Complexidade
                </label>
                <select
                  value={newDemandaForm.nivelComplexidadeId}
                  onChange={(e) => setNewDemandaForm({ ...newDemandaForm, nivelComplexidadeId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#18181b] border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none"
                >
                  {niveisComplexidade.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.nome} (R$ {n.valorPadrao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                    </option>
                  ))}
                </select>

                {/* Descrição dinâmica do nível de complexidade selecionado */}
                {(() => {
                  const selectedNivel = niveisComplexidade.find(
                    (n) => n.id === newDemandaForm.nivelComplexidadeId
                  );
                  if (!selectedNivel) return null;
                  return (
                    <div className="mt-2 p-3 bg-zinc-950/80 border border-emerald-500/20 rounded-xl text-xs flex items-start space-x-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-emerald-400">{selectedNivel.nome}</span>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            R$ {selectedNivel.valorPadrao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <p className="text-zinc-300 leading-relaxed">
                          {selectedNivel.descricao}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Descrição dos Requisitos & Detalhes
                </label>
                <textarea
                  rows={3}
                  value={newDemandaForm.descricao}
                  onChange={(e) => setNewDemandaForm({ ...newDemandaForm, descricao: e.target.value })}
                  placeholder="Explique o que precisa ser feito, telas envolvidas, regras de negócio..."
                  className="w-full px-3.5 py-2.5 bg-[#18181b] border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsNewDemandaModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold shadow-sm transition"
                >
                  Enviar Solicitação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
