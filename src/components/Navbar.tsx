import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Layers, 
  ListTodo, 
  Package, 
  Calculator, 
  Code2, 
  ExternalLink,
  ShieldCheck,
  User,
  LogOut,
  Sparkles,
  ArrowLeftRight
} from 'lucide-react';
import { AuthUser, Empresa } from '../types';

export type ActiveTab = 
  | 'dashboard'
  | 'empresas'
  | 'complexidade'
  | 'demandas'
  | 'pacotes'
  | 'fechamento'
  | 'codigo_django'
  | 'public_aprovacao'
  | 'public_assinatura'
  | 'portal_cliente';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedPacoteToken?: string;
  totalPacotesAguardando: number;
  currentUser: AuthUser;
  onOpenLoginModal: () => void;
  empresaAtiva?: Empresa;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  totalPacotesAguardando,
  currentUser,
  onOpenLoginModal,
  empresaAtiva,
}) => {
  const isPublicView = activeTab === 'public_aprovacao' || activeTab === 'public_assinatura';
  const isCliente = currentUser.role === 'cliente';

  return (
    <header className="bg-[#111111] text-zinc-200 sticky top-0 z-40 shadow-xl border-b border-white/5 backdrop-blur-md">
      {/* Top Banner / Brand Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => setActiveTab(isCliente ? 'portal_cliente' : 'dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center shadow-lg shadow-black/50">
              <div className="w-4 h-4 border-2 border-[#0a0a0a] rotate-45 flex items-center justify-center"></div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-base sm:text-lg tracking-tight text-white">
                  DevDelivery Pro
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {isCliente ? 'Portal do Cliente' : 'Painel do Desenvolvedor'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 hidden sm:block">
                {isCliente
                  ? `Empresa: ${empresaAtiva?.nome || 'Cliente Conectado'}`
                  : 'Gestão de Entregas, Remuneração Variável & Assinatura Digital'}
              </p>
            </div>
          </div>

          {/* User Profile & Quick Action Badges */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {!isCliente && (
              <button
                onClick={() => setActiveTab('codigo_django')}
                className={`hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                  activeTab === 'codigo_django'
                    ? 'bg-zinc-800 text-white border-white/20 shadow-sm'
                    : 'bg-zinc-900/80 text-zinc-300 border-white/5 hover:border-white/15 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Django (Python)</span>
              </button>
            )}

            {/* Profile Pill & Switcher */}
            <button
              onClick={onOpenLoginModal}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                isCliente
                  ? 'bg-blue-500/10 text-blue-300 border-blue-500/30 hover:bg-blue-500/20'
                  : 'bg-zinc-900 text-zinc-200 border-white/10 hover:border-emerald-500/40'
              }`}
              title="Trocar perfil de acesso (Desenvolvedor vs. Cliente)"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isCliente ? 'bg-blue-400' : 'bg-emerald-400'
                }`}
              />
              <span className="max-w-[130px] truncate font-semibold">
                {isCliente ? empresaAtiva?.nome.split(' ')[0] : 'Desenvolvedor'}
              </span>
              <ArrowLeftRight className="w-3 h-3 text-zinc-400" />
            </button>

            {!isCliente && (
              <button
                onClick={() => setActiveTab('public_assinatura')}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                  activeTab === 'public_assinatura'
                    ? 'bg-emerald-400 text-black shadow-md shadow-emerald-500/20'
                    : 'bg-emerald-500 text-black hover:bg-emerald-400'
                }`}
                title="Simular a tela do cliente de assinatura em Canvas"
              >
                <ExternalLink className="w-3.5 h-3.5 text-black" />
                <span className="hidden sm:inline">Simular</span>
                <span>Assinatura</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Navigation Tabs */}
        {!isPublicView && (
          <nav className="flex space-x-1.5 overflow-x-auto py-2.5 no-scrollbar border-t border-white/5 text-xs sm:text-sm font-medium">
            {isCliente ? (
              <>
                <button
                  onClick={() => setActiveTab('portal_cliente')}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition whitespace-nowrap ${
                    activeTab === 'portal_cliente'
                      ? 'bg-zinc-800 text-white border border-white/10 shadow-xs'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Painel do Cliente ({empresaAtiva?.nome || 'Minha Empresa'})</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition whitespace-nowrap ${
                    activeTab === 'dashboard'
                      ? 'bg-zinc-800 text-white border border-white/10 shadow-xs'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => setActiveTab('empresas')}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition whitespace-nowrap ${
                    activeTab === 'empresas'
                      ? 'bg-zinc-800 text-white border border-white/10 shadow-xs'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Empresas & Responsáveis</span>
                </button>

                <button
                  onClick={() => setActiveTab('complexidade')}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition whitespace-nowrap ${
                    activeTab === 'complexidade'
                      ? 'bg-zinc-800 text-white border border-white/10 shadow-xs'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Tabela de Complexidade</span>
                </button>

                <button
                  onClick={() => setActiveTab('demandas')}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition whitespace-nowrap ${
                    activeTab === 'demandas'
                      ? 'bg-zinc-800 text-white border border-white/10 shadow-xs'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  <ListTodo className="w-3.5 h-3.5" />
                  <span>Demandas & Backlog</span>
                </button>

                <button
                  onClick={() => setActiveTab('pacotes')}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition whitespace-nowrap relative ${
                    activeTab === 'pacotes'
                      ? 'bg-zinc-800 text-white border border-white/10 shadow-xs'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Pacotes & Envio por E-mail</span>
                  {totalPacotesAguardando > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-black">
                      {totalPacotesAguardando}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('fechamento')}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition whitespace-nowrap ${
                    activeTab === 'fechamento'
                      ? 'bg-zinc-800 text-white border border-white/10 shadow-xs'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Fechamento & Saldo Diferido</span>
                </button>

                <button
                  onClick={() => setActiveTab('codigo_django')}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition whitespace-nowrap ${
                    activeTab === 'codigo_django'
                      ? 'bg-zinc-800 text-white border border-white/10 shadow-xs'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Código Django</span>
                </button>
              </>
            )}
          </nav>
        )}

        {/* Public View Helper Bar */}
        {isPublicView && (
          <div className="py-2.5 flex items-center justify-between border-t border-white/5 text-xs">
            <div className="flex items-center space-x-2 text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Você está visualizando a tela pública que o <strong className="text-white">Cliente Final</strong> recebe através do link seguro.</span>
            </div>
            <button
              onClick={() => setActiveTab(isCliente ? 'portal_cliente' : 'dashboard')}
              className="text-emerald-400 hover:text-emerald-300 font-semibold underline flex items-center space-x-1"
            >
              <span>← Voltar ao Painel {isCliente ? 'do Cliente' : 'do Gestor'}</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

