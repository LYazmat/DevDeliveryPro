import React, { useState } from 'react';
import { Layers, Plus, Edit2, Trash2, Globe, Building2, DollarSign } from 'lucide-react';
import { NivelComplexidade, Empresa } from '../types';

interface ComplexidadeViewProps {
  niveisComplexidade: NivelComplexidade[];
  empresas: Empresa[];
  onAddNivel: (nivel: Omit<NivelComplexidade, 'id'>) => void;
  onUpdateNivel: (id: string, nivel: Partial<NivelComplexidade>) => void;
  onDeleteNivel: (id: string) => void;
}

export const ComplexidadeView: React.FC<ComplexidadeViewProps> = ({
  niveisComplexidade,
  empresas,
  onAddNivel,
  onUpdateNivel,
  onDeleteNivel,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    valorPadrao: 500,
    empresaId: '' as string | null,
  });

  const openNewModal = () => {
    setEditingId(null);
    setFormData({
      nome: '',
      descricao: '',
      valorPadrao: 500,
      empresaId: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (nivel: NivelComplexidade) => {
    setEditingId(nivel.id);
    setFormData({
      nome: nivel.nome,
      descricao: nivel.descricao,
      valorPadrao: nivel.valorPadrao,
      empresaId: nivel.empresaId || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || formData.valorPadrao < 0) {
      alert('Preencha os campos corretamente.');
      return;
    }

    const payload = {
      ...formData,
      empresaId: formData.empresaId ? formData.empresaId : null,
    };

    if (editingId) {
      onUpdateNivel(editingId, payload);
    } else {
      onAddNivel(payload);
    }
    setIsModalOpen(false);
  };

  // Níveis Globais vs Específicos
  const niveisGlobais = niveisComplexidade.filter((n) => !n.empresaId);
  const niveisCustomizados = niveisComplexidade.filter((n) => !!n.empresaId);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 p-6 rounded-2xl border border-white/5 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Layers className="w-6 h-6 text-emerald-400" />
            <span>Tabela Dinâmica de Complexidade & Valores</span>
          </h2>
          <p className="text-sm text-zinc-400 mt-0.5">
            Faixas de remuneração por nível técnico com suporte a valores globais ou por empresa.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Nível</span>
        </button>
      </div>

      {/* Seção 1: Tabela de Níveis Globais Padrão */}
      <div className="bg-zinc-900/60 rounded-2xl border border-white/5 shadow-xs p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Globe className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Faixas Globais Padrão (Válidas para todos os clientes)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {niveisGlobais.map((nivel) => (
            <div
              key={nivel.id}
              className="p-5 rounded-xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/70 hover:border-white/15 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-zinc-800 text-zinc-200 uppercase tracking-wider border border-white/5">
                    {nivel.nome}
                  </span>
                  <span className="text-lg font-bold text-emerald-400">
                    R$ {nivel.valorPadrao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
                  {nivel.descricao || 'Sem descrição cadastrada.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-end space-x-1">
                <button
                  onClick={() => openEditModal(nivel)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 transition"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Excluir o nível ${nivel.nome}?`)) onDeleteNivel(nivel.id);
                  }}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seção 2: Níveis Customizados por Empresa / Contrato */}
      {niveisCustomizados.length > 0 && (
        <div className="bg-zinc-900/60 rounded-2xl border border-white/5 shadow-xs p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Building2 className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Tabelas Customizadas por Empresa / Contrato Específico</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {niveisCustomizados.map((nivel) => {
              const empresa = empresas.find((e) => e.id === nivel.empresaId);
              return (
                <div
                  key={nivel.id}
                  className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-400 uppercase border border-amber-500/30">
                        {empresa?.nome || 'Empresa'}
                      </span>
                      <span className="text-base font-bold text-white">
                        R$ {nivel.valorPadrao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-zinc-200 mt-2">{nivel.nome}</h4>
                    <p className="text-xs text-zinc-400 mt-1">{nivel.descricao}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-amber-500/10 flex items-center justify-end space-x-1">
                    <button
                      onClick={() => openEditModal(nivel)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteNivel(nivel.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#121212] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-white/10 text-zinc-200">
            <h3 className="text-xl font-bold text-white mb-1">
              {editingId ? 'Editar Nível de Complexidade' : 'Novo Nível de Complexidade'}
            </h3>
            <p className="text-xs text-zinc-400 mb-6">
              Defina o nome da complexidade, valor em R$ e escopo típico.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Nome do Nível *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Baixa, Média, Alta..."
                    className="w-full px-3.5 py-2.5 bg-[#18181b] border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Valor de Remuneração (R$) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="50"
                    value={formData.valorPadrao}
                    onChange={(e) => setFormData({ ...formData, valorPadrao: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-[#18181b] border border-white/10 rounded-xl text-sm text-emerald-400 font-bold focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Empresa Específica (Opcional)
                </label>
                <select
                  value={formData.empresaId || ''}
                  onChange={(e) => setFormData({ ...formData, empresaId: e.target.value || null })}
                  className="w-full px-3.5 py-2.5 bg-[#18181b] border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">Regra Global (Válida para todas)</option>
                  {empresas.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      Específico para: {emp.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Critérios e Escopo Típico
                </label>
                <textarea
                  rows={3}
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Ex: Ajustes pontuais de tela, correções de formulário..."
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
                  {editingId ? 'Salvar Alterações' : 'Criar Nível'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
