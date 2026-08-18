import React, { useState } from 'react';
import { ListTodo, Plus, Edit2, Trash2, CheckCircle2, Clock, PlayCircle, Building2, Layers } from 'lucide-react';
import { ItemDemanda, Empresa, NivelComplexidade, StatusDemanda } from '../types';

interface DemandasViewProps {
  demandas: ItemDemanda[];
  empresas: Empresa[];
  niveisComplexidade: NivelComplexidade[];
  onAddDemanda: (demanda: Omit<ItemDemanda, 'id' | 'dataCriacao'>) => void;
  onUpdateDemanda: (id: string, demanda: Partial<ItemDemanda>) => void;
  onDeleteDemanda: (id: string) => void;
}

export const DemandasView: React.FC<DemandasViewProps> = ({
  demandas,
  empresas,
  niveisComplexidade,
  onAddDemanda,
  onUpdateDemanda,
  onDeleteDemanda,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterEmpresa, setFilterEmpresa] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    empresaId: empresas[0]?.id || '',
    nivelComplexidadeId: niveisComplexidade[0]?.id || '',
    status: 'pendente' as StatusDemanda,
  });

  const openNewModal = () => {
    setEditingId(null);
    setFormData({
      titulo: '',
      descricao: '',
      empresaId: empresas[0]?.id || '',
      nivelComplexidadeId: niveisComplexidade[0]?.id || '',
      status: 'pendente',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (dem: ItemDemanda) => {
    setEditingId(dem.id);
    setFormData({
      titulo: dem.titulo,
      descricao: dem.descricao,
      empresaId: dem.empresaId,
      nivelComplexidadeId: dem.nivelComplexidadeId,
      status: dem.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || !formData.empresaId || !formData.nivelComplexidadeId) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    if (editingId) {
      onUpdateDemanda(editingId, formData);
    } else {
      onAddDemanda(formData);
    }
    setIsModalOpen(false);
  };

  const filteredDemandas = demandas.filter((dem) => {
    if (filterEmpresa !== 'all' && dem.empresaId !== filterEmpresa) return false;
    if (filterStatus !== 'all' && dem.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 p-6 rounded-2xl border border-white/5 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <ListTodo className="w-6 h-6 text-emerald-400" />
            <span>Itens de Demanda & Backlog Técnico</span>
          </h2>
          <p className="text-sm text-zinc-400 mt-0.5">
            Cadastro de funcionalidades, pipelines e correções com atribuição de complexidade.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Demanda</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 bg-zinc-900/60 p-4 rounded-xl border border-white/5 text-xs">
        <span className="font-semibold text-zinc-400 uppercase">Filtrar por:</span>
        <select
          value={filterEmpresa}
          onChange={(e) => setFilterEmpresa(e.target.value)}
          className="px-3 py-1.5 bg-[#18181b] border border-white/10 rounded-lg text-white font-medium focus:outline-none"
        >
          <option value="all">Todas as Empresas</option>
          {empresas.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.nome}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 bg-[#18181b] border border-white/10 rounded-lg text-white font-medium focus:outline-none"
        >
          <option value="all">Todos os Status</option>
          <option value="pendente">Pendente</option>
          <option value="em_andamento">Em Andamento</option>
          <option value="concluido">Concluído</option>
        </select>

        <span className="text-zinc-500 ml-auto">
          Exibindo <strong className="text-zinc-300">{filteredDemandas.length}</strong> de <strong className="text-zinc-300">{demandas.length}</strong> itens
        </span>
      </div>

      {/* Lista de Demandas */}
      <div className="bg-zinc-900/60 rounded-2xl border border-white/5 shadow-xs overflow-hidden">
        <div className="divide-y divide-white/5">
          {filteredDemandas.map((dem) => {
            const empresa = empresas.find((e) => e.id === dem.empresaId);
            const nivel = niveisComplexidade.find((n) => n.id === dem.nivelComplexidadeId);

            return (
              <div
                key={dem.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-900/90 transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                      {empresa?.nome || 'Empresa'}
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-xs text-zinc-500 font-mono">ID: {dem.id}</span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">{dem.titulo}</h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">{dem.descricao}</p>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-zinc-800 text-zinc-200 border border-white/5">
                      <Layers className="w-3 h-3 mr-1 text-emerald-400" />
                      {nivel?.nome || 'Nível'} (R$ {nivel?.valorPadrao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                    </span>

                    {dem.status === 'pendente' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-zinc-800 text-zinc-300">
                        <Clock className="w-3 h-3 mr-1 text-zinc-400" />
                        Pendente
                      </span>
                    )}
                    {dem.status === 'em_andamento' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <PlayCircle className="w-3 h-3 mr-1 text-blue-400" />
                        Em Andamento
                      </span>
                    )}
                    {dem.status === 'concluido' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />
                        Concluído
                      </span>
                    )}

                    {dem.pacoteId && (
                      <span className="text-[11px] font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md">
                        Vinculado a Pacote
                      </span>
                    )}
                  </div>
                </div>

                {/* Ações Rápidas */}
                <div className="flex items-center space-x-2 shrink-0 md:self-center">
                  <select
                    value={dem.status}
                    onChange={(e) => onUpdateDemanda(dem.id, { status: e.target.value as StatusDemanda })}
                    className="text-xs px-2.5 py-1.5 bg-[#18181b] border border-white/10 rounded-lg text-white font-medium focus:outline-none"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluido">Concluído</option>
                  </select>

                  <button
                    onClick={() => openEditModal(dem)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 transition"
                    title="Editar demanda"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir a demanda "${dem.titulo}"?`)) onDeleteDemanda(dem.id);
                    }}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
                    title="Excluir demanda"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#121212] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-white/10 text-zinc-200">
            <h3 className="text-xl font-bold text-white mb-1">
              {editingId ? 'Editar Item de Demanda' : 'Novo Item de Demanda'}
            </h3>
            <p className="text-xs text-zinc-400 mb-6">
              Descreva os requisitos técnicos da demanda e o nível de complexidade atribuído.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Título da Demanda / Feature *
                </label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ex: Pipeline ETL de integração com Banco Central"
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
                    onChange={(e) => setFormData({ ...formData, empresaId: e.target.value })}
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
                    Nível de Complexidade *
                  </label>
                  <select
                    value={formData.nivelComplexidadeId}
                    onChange={(e) => setFormData({ ...formData, nivelComplexidadeId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#18181b] border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none"
                  >
                    {niveisComplexidade.map((nivel) => (
                      <option key={nivel.id} value={nivel.id}>
                        {nivel.nome} (R$ {nivel.valorPadrao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                      </option>
                    ))}
                  </select>

                  {/* Descrição dinâmica da complexidade */}
                  {(() => {
                    const selectedNivel = niveisComplexidade.find(
                      (n) => n.id === formData.nivelComplexidadeId
                    );
                    if (!selectedNivel) return null;
                    return (
                      <div className="mt-2 p-2.5 bg-zinc-950/80 border border-emerald-500/20 rounded-xl text-xs flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <p className="text-zinc-300 leading-relaxed text-[11px]">
                          {selectedNivel.descricao}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Status de Execução
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusDemanda })}
                  className="w-full px-3.5 py-2.5 bg-[#18181b] border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="pendente">Pendente</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluido">Concluído</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Detalhamento Técnico / Escopo
                </label>
                <textarea
                  rows={3}
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva o escopo da entrega, endpoints, telas afetadas..."
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
                  {editingId ? 'Salvar Alterações' : 'Criar Demanda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
