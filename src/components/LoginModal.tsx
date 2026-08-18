import React, { useState } from 'react';
import { User, Building2, Code2, Check, ShieldCheck, FileCheck2, ArrowRight, X, Lock } from 'lucide-react';
import { AuthUser, Empresa } from '../types';

interface LoginModalProps {
  currentUser: AuthUser;
  empresas: Empresa[];
  onSelectUser: (user: AuthUser) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  currentUser,
  empresas,
  onSelectUser,
  onClose,
  isOpen,
}) => {
  const [selectedRole, setSelectedRole] = useState<'dev' | 'cliente'>(currentUser.role);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>(
    currentUser.empresaId || empresas[0]?.id || ''
  );
  const [selectedResponsavelType, setSelectedResponsavelType] = useState<'aprovacao' | 'entrega'>('aprovacao');

  if (!isOpen) return null;

  const handleLoginDev = () => {
    onSelectUser({
      role: 'dev',
      nome: 'Desenvolvedor / Gestor Técnico',
      email: 'dev@devdelivery.com.br',
      cargo: 'Tech Lead & Arquiteto',
    });
    onClose();
  };

  const handleLoginCliente = (empresa: Empresa, tipo: 'aprovacao' | 'entrega') => {
    const nome = tipo === 'aprovacao'
      ? (empresa.respAprovacaoNome || empresa.nomeContato || 'Representante do Cliente')
      : (empresa.respEntregaNome || empresa.nomeContato || 'Representante do Cliente');

    const email = tipo === 'aprovacao'
      ? (empresa.respAprovacaoEmail || empresa.emailContato)
      : (empresa.respEntregaEmail || empresa.emailContato);

    const cargo = tipo === 'aprovacao'
      ? 'Responsável por Aprovação Prévia de Demandas'
      : 'Responsável por Aceite e Entrega de Software';

    onSelectUser({
      role: 'cliente',
      empresaId: empresa.id,
      nome,
      email,
      cargo,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#121212] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-white/10 relative my-8 text-zinc-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-xl mx-auto mb-2">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Autenticação & Seleção de Perfil
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Alterne entre a visão global do <strong className="text-white">Desenvolvedor</strong> e o portal restrito de cada <strong className="text-emerald-400">Cliente</strong>.
          </p>
        </div>

        {/* Seletor de Tipo de Perfil */}
        <div className="grid grid-cols-2 gap-3 mb-6 p-1 bg-zinc-950 rounded-2xl border border-white/5">
          <button
            type="button"
            onClick={() => setSelectedRole('dev')}
            className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
              selectedRole === 'dev'
                ? 'bg-zinc-800 text-white border border-white/10 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span>Perfil Desenvolvedor</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('cliente')}
            className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
              selectedRole === 'cliente'
                ? 'bg-zinc-800 text-white border border-white/10 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>Perfil Cliente Contratante</span>
          </button>
        </div>

        {/* Conteúdo: Perfil Desenvolvedor */}
        {selectedRole === 'dev' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Desenvolvedor / Gestor Geral</h3>
                  <p className="text-xs text-zinc-400">Acesso completo ao painel administrativo</p>
                </div>
              </div>

              <div className="text-xs text-zinc-400 pt-2 border-t border-white/5 space-y-1">
                <div>✓ Gerenciamento de todas as empresas e tetos mensais</div>
                <div>✓ Configuração global da tabela de complexidade</div>
                <div>✓ Criação e agrupamento de pacotes com links de assinatura</div>
                <div>✓ Acompanhamento do fechamento mensal de todos os clientes</div>
                <div>✓ Repositório de código Django Python</div>
              </div>
            </div>

            <button
              onClick={handleLoginDev}
              className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-sm transition flex items-center justify-center space-x-2"
            >
              <span>Entrar como Desenvolvedor / Gestor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Conteúdo: Perfil Cliente */}
        {selectedRole === 'cliente' && (
          <div className="space-y-4">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Selecione a Empresa e o Responsável:
            </span>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {empresas.map((emp) => {
                const isSelected = selectedEmpresaId === emp.id;
                return (
                  <div
                    key={emp.id}
                    className={`p-4 rounded-2xl border transition ${
                      isSelected
                        ? 'bg-zinc-900/90 border-emerald-500/30'
                        : 'bg-zinc-900/40 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-bold text-sm text-white">{emp.nome}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">Teto: R$ {emp.tetoMensal}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-2 border-t border-white/5">
                      {/* Botão Responsável Aprovação */}
                      <button
                        type="button"
                        onClick={() => handleLoginCliente(emp, 'aprovacao')}
                        className="p-2.5 rounded-xl bg-zinc-950/80 hover:bg-blue-500/10 border border-white/5 hover:border-blue-500/30 text-left transition group"
                      >
                        <div className="flex items-center space-x-1 text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                          <FileCheck2 className="w-3 h-3" />
                          <span>Aprovação Prévia</span>
                        </div>
                        <span className="text-xs font-bold text-white block truncate group-hover:text-blue-300">
                          {emp.respAprovacaoNome || emp.nomeContato}
                        </span>
                        <span className="text-[10px] text-zinc-500 block truncate">
                          {emp.respAprovacaoEmail || emp.emailContato}
                        </span>
                      </button>

                      {/* Botão Responsável Entrega */}
                      <button
                        type="button"
                        onClick={() => handleLoginCliente(emp, 'entrega')}
                        className="p-2.5 rounded-xl bg-zinc-950/80 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 text-left transition group"
                      >
                        <div className="flex items-center space-x-1 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Aceite & Entrega</span>
                        </div>
                        <span className="text-xs font-bold text-white block truncate group-hover:text-emerald-300">
                          {emp.respEntregaNome || emp.nomeContato}
                        </span>
                        <span className="text-[10px] text-zinc-500 block truncate">
                          {emp.respEntregaEmail || emp.emailContato}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
