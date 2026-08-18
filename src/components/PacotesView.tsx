import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Layers, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle,
  FileCheck2,
  Trash2,
  Edit2,
  Mail
} from 'lucide-react';
import { PacoteEntrega, Empresa, ItemDemanda, NivelComplexidade, StatusPacote } from '../types';
import { DisparoEmailModal, TipoDisparo } from './DisparoEmailModal';

interface PacotesViewProps {
  pacotes: PacoteEntrega[];
  empresas: Empresa[];
  demandas: ItemDemanda[];
  niveisComplexidade: NivelComplexidade[];
  onAddPacote: (pacote: Omit<PacoteEntrega, 'id' | 'dataCriacao' | 'tokenAprovacao' | 'tokenAssinatura'>) => void;
  onUpdatePacote: (id: string, pacote: Partial<PacoteEntrega>) => void;
  onDeletePacote: (id: string) => void;
  onSelectPacoteForAssinatura: (pacoteId: string) => void;
  onSelectPacoteForAprovacao: (pacoteId: string) => void;
}

export const PacotesView: React.FC<PacotesViewProps> = ({
  pacotes,
  empresas,
  demandas,
  niveisComplexidade,
  onAddPacote,
  onUpdatePacote,
  onDeletePacote,
  onSelectPacoteForAssinatura,
  onSelectPacoteForAprovacao,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [emailModalData, setEmailModalData] = useState<{ tipo: TipoDisparo; pacote: PacoteEntrega; empresa: Empresa } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    titulo: '',
    empresaId: empresas[0]?.id || '',
    dataCompetencia: '2026-08',
    itemIds: [] as string[],
    valorOverride: '' as string | number,
    status: 'rascunho' as StatusPacote,
    observacoes: '',
  });

  const openNewModal = () => {
    setEditingId(null);
    setFormData({
      titulo: '',
      empresaId: empresas[0]?.id || '',
      dataCompetencia: '2026-08',
      itemIds: [],
      valorOverride: '',
      status: 'rascunho',
      observacoes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pac: PacoteEntrega) => {
    setEditingId(pac.id);
    setFormData({
      titulo: pac.titulo,
      empresaId: pac.empresaId,
      dataCompetencia: pac.dataCompetencia,
      itemIds: pac.itemIds,
      valorOverride: pac.valorOverride ?? '',
      status: pac.status,
      observacoes: pac.observacoes || '',
    });
    setIsModalOpen(true);
  };

  // Cálculo automático do maior nível de complexidade
  const calcularMaiorNivel = (selectedItemIds: string[]) => {
    if (selectedItemIds.length === 0) return 0;
    const itensSelecionados = demandas.filter((d) => selectedItemIds.includes(d.id));
    let maiorValor = 0;
    itensSelecionados.forEach((item) => {
      const nivel = niveisComplexidade.find((n) => n.id === item.nivelComplexidadeId);
      if (nivel && nivel.valorPadrao > maiorValor) {
        maiorValor = nivel.valorPadrao;
      }
    });
    return maiorValor;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || !formData.empresaId) {
      alert('Preencha o título e selecione a empresa.');
      return;
    }

    const valorTotalCalculado = calcularMaiorNivel(formData.itemIds);
    const overrideVal = formData.valorOverride !== '' ? parseFloat(String(formData.valorOverride)) : null;

    const payload = {
      titulo: formData.titulo,
      empresaId: formData.empresaId,
      dataCompetencia: formData.dataCompetencia,
      itemIds: formData.itemIds,
      valorTotalCalculado,
      valorOverride: overrideVal,
      status: formData.status,
      observacoes: formData.observacoes,
    };

    if (editingId) {
      onUpdatePacote(editingId, payload);
    } else {
      onAddPacote(payload);
    }
    setIsModalOpen(false);
  };

  const toggleItemSelection = (itemId: string) => {
    setFormData((prev) => {
      const exists = prev.itemIds.includes(itemId);
      const newItems = exists ? prev.itemIds.filter((id) => id !== itemId) : [...prev.itemIds, itemId];
      return { ...prev, itemIds: newItems };
    });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  // Itens disponíveis para a empresa selecionada no modal
  const demandasDaEmpresa = demandas.filter((d) => d.empresaId === formData.empresaId);
  const valorCalculadoPreview = calcularMaiorNivel(formData.itemIds);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 p-6 rounded-2xl border border-white/5 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Package className="w-6 h-6 text-emerald-400" />
            <span>Pacotes de Entrega & Agrupamento de Demandas</span>
          </h2>
          <p className="text-sm text-zinc-400 mt-0.5">
            Agrupamento de itens com <strong className="text-zinc-200">regra do maior nível de complexidade</strong> e geração de links públicos.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Novo Pacote de Entrega</span>
        </button>
      </div>

      {/* Lista de Pacotes */}
      <div className="space-y-4">
        {pacotes.map((pacote) => {
          const empresa = empresas.find((e) => e.id === pacote.empresaId);
          const itensDoPacote = demandas.filter((d) => pacote.itemIds.includes(d.id));
          const valorFinal = pacote.valorOverride ?? pacote.valorTotalCalculado;

          return (
            <div
              key={pacote.id}
              className="bg-zinc-900/60 rounded-2xl border border-white/5 shadow-xs p-6 hover:border-white/15 transition"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      {empresa?.nome || 'Empresa'}
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-xs text-zinc-400 font-medium">
                      Competência: {pacote.dataCompetencia}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mt-1">{pacote.titulo}</h3>
                  {pacote.observacoes && (
                    <p className="text-xs text-zinc-400 mt-0.5 italic">{pacote.observacoes}</p>
                  )}
                </div>

                {/* Box de Valor com Destaque para Regra do Maior Nível */}
                <div className="flex items-center space-x-4 shrink-0 bg-zinc-900/80 p-3 rounded-xl border border-white/5">
                  <div className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[11px] font-semibold text-zinc-400 uppercase">
                        {pacote.valorOverride ? 'Valor Override Manual' : 'Valor pelo Maior Nível'}
                      </span>
                    </div>
                    <span className="text-xl font-bold text-emerald-400">
                      R$ {valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="border-l border-white/10 pl-3">
                    <span className="text-[11px] text-zinc-500 block">Status:</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold capitalize ${
                        pacote.status === 'assinado'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : pacote.status === 'entregue'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : pacote.status === 'solicitado'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : pacote.status === 'aprovado'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {pacote.status === 'solicitado' ? 'Aguardando Aprovação' : pacote.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Itens Agrupados no Pacote */}
              <div className="py-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-2">
                  Demandas Agrupadas ({itensDoPacote.length}):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {itensDoPacote.map((item) => {
                    const nivel = niveisComplexidade.find((n) => n.id === item.nivelComplexidadeId);
                    return (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-lg bg-zinc-900/40 border border-white/5 text-xs flex items-start justify-between gap-2"
                      >
                        <div className="min-w-0 pr-1">
                          <span className="font-semibold text-zinc-200 block truncate">{item.titulo}</span>
                          <span className="text-[11px] text-zinc-400 line-clamp-1">{item.descricao}</span>
                        </div>
                        <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-200 border border-white/5">
                          {nivel?.nome} (R$ {nivel?.valorPadrao})
                        </span>
                      </div>
                    );
                  })}
                  {itensDoPacote.length === 0 && (
                    <span className="text-xs text-zinc-500 italic">Nenhum item agrupado neste pacote.</span>
                  )}
                </div>
              </div>

              {/* Barra de Ações & Links Públicos de Acesso */}
              <div className="pt-4 border-t border-white/5 flex flex-col xl:flex-row xl:items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Bloco Fase 1: Solicitação / Aprovação Prévia */}
                  <div className="flex items-center space-x-1 bg-zinc-950/60 p-1 rounded-xl border border-blue-500/20">
                    <button
                      onClick={() => onSelectPacoteForAprovacao(pacote.id)}
                      className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 font-semibold transition"
                      title="Simular visualização pública do cliente para aprovação de escopo"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Fase 1: Aprovação</span>
                    </button>

                    {empresa && (
                      <button
                        onClick={() => setEmailModalData({ tipo: 'aprovacao', pacote, empresa })}
                        className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-semibold transition"
                        title={`Enviar link por e-mail para ${empresa.respAprovacaoNome || empresa.nomeContato} (${empresa.respAprovacaoEmail || empresa.emailContato})`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Enviar E-mail</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleCopy(`https://app.devdelivery.com.br/solicitacao/${pacote.tokenAprovacao}`, `aprov-${pacote.id}`)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                      title="Copiar Link de Solicitação"
                    >
                      {copiedToken === `aprov-${pacote.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <span className="text-zinc-700 hidden sm:inline">|</span>

                  {/* Bloco Fase 2: Homologação & Assinatura Digital */}
                  <div className="flex items-center space-x-1 bg-zinc-950/60 p-1 rounded-xl border border-emerald-500/20">
                    <button
                      onClick={() => onSelectPacoteForAssinatura(pacote.id)}
                      className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-semibold transition"
                      title="Simular tela de assinatura digital do cliente com Canvas"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Fase 2: Assinatura</span>
                    </button>

                    {empresa && (
                      <button
                        onClick={() => setEmailModalData({ tipo: 'assinatura', pacote, empresa })}
                        className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold transition"
                        title={`Enviar link por e-mail para ${empresa.respEntregaNome || empresa.nomeContato} (${empresa.respEntregaEmail || empresa.emailContato})`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Enviar E-mail</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleCopy(`https://app.devdelivery.com.br/assinar/${pacote.tokenAssinatura}`, `assin-${pacote.id}`)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                      title="Copiar Link de Assinatura"
                    >
                      {copiedToken === `assin-${pacote.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end xl:self-auto">
                  <button
                    onClick={() => openEditModal(pacote)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 transition"
                    title="Editar pacote"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir o pacote "${pacote.titulo}"?`)) onDeletePacote(pacote.id);
                    }}
                    className="p-2 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
                    title="Excluir pacote"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Disparo de E-mail */}
      {emailModalData && (
        <DisparoEmailModal
          tipo={emailModalData.tipo}
          pacote={emailModalData.pacote}
          empresa={emailModalData.empresa}
          demandas={demandas}
          niveisComplexidade={niveisComplexidade}
          onClose={() => setEmailModalData(null)}
        />
      )}

      {/* Modal de Criação / Edição do Pacote */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#121212] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto text-zinc-200">
            <h3 className="text-xl font-bold text-white mb-1">
              {editingId ? 'Editar Pacote de Entrega' : 'Criar Pacote de Entrega Agrupado'}
            </h3>
            <p className="text-xs text-zinc-400 mb-6">
              Vincule múltiplas demandas a um pacote. O sistema calcula automaticamente o valor com base no item de maior complexidade.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Título do Pacote / Sprint *
                </label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ex: Pacote Sprint 02 - Módulo Financeiro & Pipelines"
                  className="w-full px-3.5 py-2.5 bg-[#18181b] border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Empresa / Cliente *
                  </label>
                  <select
                    value={formData.empresaId}
                    onChange={(e) => setFormData({ ...formData, empresaId: e.target.value, itemIds: [] })}
                    className="w-full px-3.5 py-2.5 bg-[#18181b] border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none"
                  >
                    {empresas.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Mês de Competência *
                  </label>
                  <input
                    type="month"
                    required
                    value={formData.dataCompetencia}
                    onChange={(e) => setFormData({ ...formData, dataCompetencia: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#18181b] border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Seleção de Demandas com Cálculo em Tempo Real */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Selecione as Demandas a Agrupar ({formData.itemIds.length} selecionadas)
                  </label>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    Maior Complexidade: R$ {valorCalculadoPreview.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-[#18181b] rounded-xl border border-white/10">
                  {demandasDaEmpresa.map((dem) => {
                    const isChecked = formData.itemIds.includes(dem.id);
                    const nivel = niveisComplexidade.find((n) => n.id === dem.nivelComplexidadeId);
                    return (
                      <label
                        key={dem.id}
                        className={`flex items-start justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                          isChecked
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-white font-semibold'
                            : 'bg-zinc-900/60 border-white/5 text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        <div className="flex items-start space-x-2 min-w-0 pr-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleItemSelection(dem.id)}
                            className="mt-0.5 w-4 h-4 text-emerald-500 rounded border-white/20 focus:ring-emerald-500"
                          />
                          <div>
                            <span>{dem.titulo}</span>
                            <span className="block text-[10px] text-zinc-400 font-normal truncate">{dem.descricao}</span>
                          </div>
                        </div>
                        <span className="shrink-0 px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300 font-bold border border-white/5">
                          {nivel?.nome} (R$ {nivel?.valorPadrao})
                        </span>
                      </label>
                    );
                  })}
                  {demandasDaEmpresa.length === 0 && (
                    <span className="text-xs text-zinc-500 italic block text-center py-4">
                      Nenhuma demanda cadastrada para esta empresa.
                    </span>
                  )}
                </div>
              </div>

              {/* Override Manual Opcional */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Status do Pacote
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusPacote })}
                    className="w-full px-3.5 py-2.5 bg-[#18181b] border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="rascunho">Rascunho</option>
                    <option value="solicitado">Solicitado (Aguardando Aprovação Escopo)</option>
                    <option value="aprovado">Aprovado (Em Desenvolvimento)</option>
                    <option value="entregue">Entregue (Aguardando Assinatura)</option>
                    <option value="assinado">Assinado & Homologado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Valor Manual / Override Aprovado (R$)
                  </label>
                  <input
                    type="number"
                    step="50"
                    value={formData.valorOverride}
                    onChange={(e) => setFormData({ ...formData, valorOverride: e.target.value })}
                    placeholder={`Padrão Calculado: R$ ${valorCalculadoPreview}`}
                    className="w-full px-3.5 py-2.5 bg-[#18181b] border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Observações Gerais
                </label>
                <textarea
                  rows={2}
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Instruções de homologação, observações sobre escopo..."
                  className="w-full px-3.5 py-2.5 bg-[#18181b] border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold shadow-sm transition"
                >
                  {editingId ? 'Salvar Alterações' : 'Salvar Pacote de Entrega'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
