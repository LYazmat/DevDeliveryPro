import React, { useState } from 'react';
import { Building2, Plus, Edit2, Trash2, Mail, Phone, User, DollarSign, Check, ShieldCheck, FileCheck2 } from 'lucide-react';
import { Empresa } from '../types';

interface EmpresasViewProps {
  empresas: Empresa[];
  onAddEmpresa: (empresa: Omit<Empresa, 'id' | 'criadoEm'>) => void;
  onUpdateEmpresa: (id: string, empresa: Partial<Empresa>) => void;
  onDeleteEmpresa: (id: string) => void;
}

export const EmpresasView: React.FC<EmpresasViewProps> = ({
  empresas,
  onAddEmpresa,
  onUpdateEmpresa,
  onDeleteEmpresa,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    emailContato: '',
    nomeContato: '',
    telefoneContato: '',
    tetoMensal: 3000,
    respAprovacaoNome: '',
    respAprovacaoEmail: '',
    respEntregaNome: '',
    respEntregaEmail: '',
  });

  const openNewModal = () => {
    setEditingId(null);
    setFormData({
      nome: '',
      cnpj: '',
      emailContato: '',
      nomeContato: '',
      telefoneContato: '',
      tetoMensal: 3000,
      respAprovacaoNome: '',
      respAprovacaoEmail: '',
      respEntregaNome: '',
      respEntregaEmail: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Empresa) => {
    setEditingId(emp.id);
    setFormData({
      nome: emp.nome,
      cnpj: emp.cnpj,
      emailContato: emp.emailContato,
      nomeContato: emp.nomeContato,
      telefoneContato: emp.telefoneContato,
      tetoMensal: emp.tetoMensal,
      respAprovacaoNome: emp.respAprovacaoNome || '',
      respAprovacaoEmail: emp.respAprovacaoEmail || '',
      respEntregaNome: emp.respEntregaNome || '',
      respEntregaEmail: emp.respEntregaEmail || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.cnpj) {
      alert('Preencha os campos obrigatórios (Razão Social e CNPJ)');
      return;
    }

    if (editingId) {
      onUpdateEmpresa(editingId, formData);
    } else {
      onAddEmpresa(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 p-6 rounded-2xl border border-white/5 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-emerald-400" />
            <span>Empresas & Clientes Contratantes</span>
          </h2>
          <p className="text-sm text-zinc-400 mt-0.5">
            Cadastro multi-empresa com teto mensal (Cap) e definição dos responsáveis por Aprovação Prévia e Aceite/Entrega.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Empresa</span>
        </button>
      </div>

      {/* Grid de Empresas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {empresas.map((emp) => (
          <div
            key={emp.id}
            className="bg-zinc-900/60 rounded-2xl border border-white/5 shadow-xs p-6 flex flex-col justify-between hover:border-white/15 transition space-y-4"
          >
            <div>
              {/* Badge de Teto */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    Teto Mensal (Cap)
                  </span>
                  <span className="text-base font-bold text-emerald-400">
                    R$ {emp.tetoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white leading-snug">{emp.nome}</h3>
              <span className="text-xs font-mono text-zinc-400 block mt-1">CNPJ: {emp.cnpj}</span>

              {/* Informações Gerais de Contato */}
              <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5 text-xs text-zinc-400">
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span className="truncate text-zinc-300">{emp.emailContato}</span>
                </div>
                {emp.telefoneContato && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span>{emp.telefoneContato}</span>
                  </div>
                )}
              </div>

              {/* Seção Destacada: Responsáveis por Fluxo (Aprovação Prévia e Aceite/Entrega) */}
              <div className="mt-4 pt-4 border-t border-white/5 space-y-2 text-xs">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Responsáveis pelas Assinaturas:
                </span>

                {/* Responsável 1: Aprovação Prévia */}
                <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-blue-500/20 space-y-0.5">
                  <div className="flex items-center space-x-1 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                    <FileCheck2 className="w-3 h-3" />
                    <span>1. Aprovação Prévia de Demandas</span>
                  </div>
                  <div className="text-zinc-200 font-semibold truncate">
                    {emp.respAprovacaoNome || emp.nomeContato || 'Não configurado'}
                  </div>
                  <div className="text-zinc-400 text-[11px] truncate">
                    {emp.respAprovacaoEmail || emp.emailContato}
                  </div>
                </div>

                {/* Responsável 2: Aceite e Entrega */}
                <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-emerald-500/20 space-y-0.5">
                  <div className="flex items-center space-x-1 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-3 h-3" />
                    <span>2. Aceite & Entrega de Software</span>
                  </div>
                  <div className="text-zinc-200 font-semibold truncate">
                    {emp.respEntregaNome || emp.nomeContato || 'Não configurado'}
                  </div>
                  <div className="text-zinc-400 text-[11px] truncate">
                    {emp.respEntregaEmail || emp.emailContato}
                  </div>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-end space-x-2">
              <button
                onClick={() => openEditModal(emp)}
                className="p-2 rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 transition"
                title="Editar dados da empresa"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`Deseja remover a empresa "${emp.nome}"?`)) {
                    onDeleteEmpresa(emp.id);
                  }
                }}
                className="p-2 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
                title="Excluir empresa"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Criação / Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121212] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-white/10 text-zinc-200 my-8">
            <h3 className="text-xl font-bold text-white mb-1">
              {editingId ? 'Editar Empresa & Responsáveis' : 'Cadastrar Nova Empresa'}
            </h3>
            <p className="text-xs text-zinc-400 mb-6">
              Defina os dados contratuais e os emails dos responsáveis por Aprovação Prévia e Aceite/Entrega.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Bloco 1: Dados Gerais & Contrato */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  1. Dados Cadastrais & Contrato
                </span>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Razão Social / Nome Fantasia *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: TechFin Soluções Digitais Ltda"
                    className="w-full px-3.5 py-2.5 bg-[#18181b] border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      CNPJ *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.cnpj}
                      onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                      placeholder="00.000.000/0001-00"
                      className="w-full px-3.5 py-2.5 bg-[#18181b] border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Teto Mensal Contratual (R$) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="100"
                      value={formData.tetoMensal}
                      onChange={(e) => setFormData({ ...formData, tetoMensal: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 bg-[#18181b] border border-white/10 rounded-xl text-sm text-emerald-400 font-semibold focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      E-mail Geral da Empresa *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.emailContato}
                      onChange={(e) => setFormData({ ...formData, emailContato: e.target.value })}
                      placeholder="contato@empresa.com"
                      className="w-full px-3.5 py-2.5 bg-[#18181b] border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Telefone / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={formData.telefoneContato}
                      onChange={(e) => setFormData({ ...formData, telefoneContato: e.target.value })}
                      placeholder="(11) 99999-9999"
                      className="w-full px-3.5 py-2.5 bg-[#18181b] border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Bloco 2: Responsável por Aprovação Prévia de Demandas */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-blue-500/20 space-y-3">
                <div className="flex items-center space-x-2">
                  <FileCheck2 className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                    2. Responsável por Aprovação Prévia de Demandas
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Os links de aprovação de escopo e início das demandas serão enviados para este responsável.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={formData.respAprovacaoNome}
                      onChange={(e) => setFormData({ ...formData, respAprovacaoNome: e.target.value })}
                      placeholder="Ex: Carlos Eduardo Mendes"
                      className="w-full px-3.5 py-2 bg-[#18181b] border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      E-mail para Envio do Link
                    </label>
                    <input
                      type="email"
                      value={formData.respAprovacaoEmail}
                      onChange={(e) => setFormData({ ...formData, respAprovacaoEmail: e.target.value })}
                      placeholder="aprovacao@empresa.com"
                      className="w-full px-3.5 py-2 bg-[#18181b] border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Bloco 3: Responsável por Aceite e Entrega de Software */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-emerald-500/20 space-y-3">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    3. Responsável por Aceite e Entrega de Software
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Os links de homologação final e assinatura digital do termo de entrega serão enviados para este responsável.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={formData.respEntregaNome}
                      onChange={(e) => setFormData({ ...formData, respEntregaNome: e.target.value })}
                      placeholder="Ex: Fernando Souza"
                      className="w-full px-3.5 py-2 bg-[#18181b] border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      E-mail para Envio do Link
                    </label>
                    <input
                      type="email"
                      value={formData.respEntregaEmail}
                      onChange={(e) => setFormData({ ...formData, respEntregaEmail: e.target.value })}
                      placeholder="entrega@empresa.com"
                      className="w-full px-3.5 py-2 bg-[#18181b] border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
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
                  {editingId ? 'Salvar Alterações' : 'Cadastrar Empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

