import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { EmpresasView } from './components/EmpresasView';
import { ComplexidadeView } from './components/ComplexidadeView';
import { DemandasView } from './components/DemandasView';
import { PacotesView } from './components/PacotesView';
import { FechamentoView } from './components/FechamentoView';
import { PublicAprovacaoView } from './components/PublicAprovacaoView';
import { PublicAssinaturaView } from './components/PublicAssinaturaView';
import { CertificadoModal } from './components/CertificadoModal';
import { DjangoCodeViewer } from './components/DjangoCodeViewer';
import { ClientePortalView } from './components/ClientePortalView';
import { LoginModal } from './components/LoginModal';
import { 
  INITIAL_EMPRESAS, 
  INITIAL_NIVEIS_COMPLEXIDADE, 
  INITIAL_DEMANDAS, 
  INITIAL_PACOTES 
} from './data/initialData';
import { Empresa, NivelComplexidade, ItemDemanda, PacoteEntrega, AssinaturaEntrega, AuthUser } from './types';

const INITIAL_DEV_USER: AuthUser = {
  role: 'dev',
  nome: 'Desenvolvedor / Gestor Técnico',
  email: 'dev@devdelivery.com.br',
  cargo: 'Tech Lead & Arquiteto',
};

export default function App() {
  // Usuário Autenticado (Desenvolvedor ou Cliente)
  const [currentUser, setCurrentUser] = useState<AuthUser>(() => {
    const saved = localStorage.getItem('dd_auth_user');
    return saved ? JSON.parse(saved) : INITIAL_DEV_USER;
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const savedUser = localStorage.getItem('dd_auth_user');
    if (savedUser) {
      const parsed: AuthUser = JSON.parse(savedUser);
      if (parsed.role === 'cliente') return 'portal_cliente';
    }
    return 'dashboard';
  });

  // Estados com persistência local
  const [empresas, setEmpresas] = useState<Empresa[]>(() => {
    const saved = localStorage.getItem('dd_empresas');
    return saved ? JSON.parse(saved) : INITIAL_EMPRESAS;
  });

  const [niveisComplexidade, setNiveisComplexidade] = useState<NivelComplexidade[]>(() => {
    const saved = localStorage.getItem('dd_niveis');
    return saved ? JSON.parse(saved) : INITIAL_NIVEIS_COMPLEXIDADE;
  });

  const [demandas, setDemandas] = useState<ItemDemanda[]>(() => {
    const saved = localStorage.getItem('dd_demandas');
    return saved ? JSON.parse(saved) : INITIAL_DEMANDAS;
  });

  const [pacotes, setPacotes] = useState<PacoteEntrega[]>(() => {
    const saved = localStorage.getItem('dd_pacotes');
    return saved ? JSON.parse(saved) : INITIAL_PACOTES;
  });

  const [selectedPacoteId, setSelectedPacoteId] = useState<string>(INITIAL_PACOTES[1].id);
  const [modalCertificadoPacoteId, setModalCertificadoPacoteId] = useState<string | null>(null);

  // Sincronizar com localStorage
  useEffect(() => {
    localStorage.setItem('dd_auth_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('dd_empresas', JSON.stringify(empresas));
  }, [empresas]);

  useEffect(() => {
    localStorage.setItem('dd_niveis', JSON.stringify(niveisComplexidade));
  }, [niveisComplexidade]);

  useEffect(() => {
    localStorage.setItem('dd_demandas', JSON.stringify(demandas));
  }, [demandas]);

  useEffect(() => {
    localStorage.setItem('dd_pacotes', JSON.stringify(pacotes));
  }, [pacotes]);

  // Alteração de Usuário
  const handleSelectUser = (newUser: AuthUser) => {
    setCurrentUser(newUser);
    if (newUser.role === 'cliente') {
      setActiveTab('portal_cliente');
    } else {
      setActiveTab('dashboard');
    }
  };

  // Handlers para Empresas
  const handleAddEmpresa = (novaEmpresa: Omit<Empresa, 'id' | 'criadoEm'>) => {
    const nova: Empresa = {
      ...novaEmpresa,
      id: `emp-${Date.now()}`,
      criadoEm: new Date().toISOString().split('T')[0],
    };
    setEmpresas([nova, ...empresas]);
  };

  const handleUpdateEmpresa = (id: string, updates: Partial<Empresa>) => {
    setEmpresas(empresas.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const handleDeleteEmpresa = (id: string) => {
    setEmpresas(empresas.filter((e) => e.id !== id));
  };

  // Handlers para Complexidade
  const handleAddNivel = (novoNivel: Omit<NivelComplexidade, 'id'>) => {
    const novo: NivelComplexidade = {
      ...novoNivel,
      id: `comp-${Date.now()}`,
    };
    setNiveisComplexidade([...niveisComplexidade, novo]);
  };

  const handleUpdateNivel = (id: string, updates: Partial<NivelComplexidade>) => {
    setNiveisComplexidade(niveisComplexidade.map((n) => (n.id === id ? { ...n, ...updates } : n)));
  };

  const handleDeleteNivel = (id: string) => {
    setNiveisComplexidade(niveisComplexidade.filter((n) => n.id !== id));
  };

  // Handlers para Demandas
  const handleAddDemanda = (novaDemanda: Omit<ItemDemanda, 'id' | 'dataCriacao'>) => {
    const nova: ItemDemanda = {
      ...novaDemanda,
      id: `dem-${Date.now()}`,
      dataCriacao: new Date().toISOString().split('T')[0],
    };
    setDemandas([nova, ...demandas]);
  };

  const handleUpdateDemanda = (id: string, updates: Partial<ItemDemanda>) => {
    setDemandas(demandas.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const handleDeleteDemanda = (id: string) => {
    setDemandas(demandas.filter((d) => d.id !== id));
  };

  // Handlers para Pacotes
  const handleAddPacote = (
    novoPacote: Omit<PacoteEntrega, 'id' | 'dataCriacao' | 'tokenAprovacao' | 'tokenAssinatura'>
  ) => {
    const generateUuid = () =>
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });

    const novo: PacoteEntrega = {
      ...novoPacote,
      id: `pac-${Date.now()}`,
      tokenAprovacao: generateUuid(),
      tokenAssinatura: generateUuid(),
      dataCriacao: new Date().toISOString().split('T')[0],
    };

    setPacotes([novo, ...pacotes]);

    // Atualiza o pacoteId nas demandas
    setDemandas(
      demandas.map((d) => (novoPacote.itemIds.includes(d.id) ? { ...d, pacoteId: novo.id } : d))
    );
  };

  const handleUpdatePacote = (id: string, updates: Partial<PacoteEntrega>) => {
    setPacotes(pacotes.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const handleDeletePacote = (id: string) => {
    setPacotes(pacotes.filter((p) => p.id !== id));
  };

  // Handlers Públicos de Aprovação e Assinatura
  const handleSelectPacoteForAprovacao = (pacoteId: string) => {
    setSelectedPacoteId(pacoteId);
    setActiveTab('public_aprovacao');
  };

  const handleSelectPacoteForAssinatura = (pacoteId: string) => {
    setSelectedPacoteId(pacoteId);
    setActiveTab('public_assinatura');
  };

  const handleAprovarEscopo = (pacoteId: string, nomeResponsavel: string) => {
    setPacotes(
      pacotes.map((p) =>
        p.id === pacoteId
          ? {
              ...p,
              status: 'aprovado',
              dataAprovacaoEscopo: new Date().toISOString(),
              aprovadoPorNome: nomeResponsavel,
            }
          : p
      )
    );

    // Atualiza status das demandas para 'em_andamento'
    const targetPacote = pacotes.find((p) => p.id === pacoteId);
    if (targetPacote) {
      setDemandas(
        demandas.map((d) =>
          targetPacote.itemIds.includes(d.id) && d.status === 'pendente'
            ? { ...d, status: 'em_andamento' }
            : d
        )
      );
    }
  };

  const handleAssinarEntrega = (pacoteId: string, assinatura: AssinaturaEntrega) => {
    setPacotes(
      pacotes.map((p) =>
        p.id === pacoteId
          ? {
              ...p,
              status: 'assinado',
              assinatura,
            }
          : p
      )
    );

    // Atualiza status das demandas para 'concluido'
    const targetPacote = pacotes.find((p) => p.id === pacoteId);
    if (targetPacote) {
      setDemandas(
        demandas.map((d) =>
          targetPacote.itemIds.includes(d.id) ? { ...d, status: 'concluido' } : d
        )
      );
    }
  };

  const activePacote = pacotes.find((p) => p.id === selectedPacoteId) || pacotes[0];
  const activeEmpresa = empresas.find((e) => e.id === activePacote?.empresaId);
  const certificadoPacote = pacotes.find((p) => p.id === modalCertificadoPacoteId);
  const certificadoEmpresa = empresas.find((e) => e.id === certificadoPacote?.empresaId);

  const clienteEmpresa = currentUser.empresaId
    ? empresas.find((e) => e.id === currentUser.empresaId) || empresas[0]
    : empresas[0];

  const totalPacotesAguardando = pacotes.filter((p) => p.status === 'entregue').length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-200 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalPacotesAguardando={totalPacotesAguardando}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        empresaAtiva={currentUser.role === 'cliente' ? clienteEmpresa : undefined}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portal Exclusivo do Cliente */}
        {currentUser.role === 'cliente' && activeTab === 'portal_cliente' && (
          <ClientePortalView
            user={currentUser}
            empresa={clienteEmpresa}
            demandas={demandas}
            pacotes={pacotes}
            niveisComplexidade={niveisComplexidade}
            onAddDemanda={handleAddDemanda}
            onSelectPacoteForAprovacao={handleSelectPacoteForAprovacao}
            onSelectPacoteForAssinatura={handleSelectPacoteForAssinatura}
            onOpenCertificado={(id) => setModalCertificadoPacoteId(id)}
          />
        )}

        {/* Visões do Desenvolvedor / Gestor */}
        {currentUser.role === 'dev' && activeTab === 'dashboard' && (
          <DashboardView
            empresas={empresas}
            niveisComplexidade={niveisComplexidade}
            demandas={demandas}
            pacotes={pacotes}
            onSelectPacoteForAssinatura={handleSelectPacoteForAssinatura}
            onSelectPacoteForAprovacao={handleSelectPacoteForAprovacao}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {currentUser.role === 'dev' && activeTab === 'empresas' && (
          <EmpresasView
            empresas={empresas}
            onAddEmpresa={handleAddEmpresa}
            onUpdateEmpresa={handleUpdateEmpresa}
            onDeleteEmpresa={handleDeleteEmpresa}
          />
        )}

        {currentUser.role === 'dev' && activeTab === 'complexidade' && (
          <ComplexidadeView
            niveisComplexidade={niveisComplexidade}
            empresas={empresas}
            onAddNivel={handleAddNivel}
            onUpdateNivel={handleUpdateNivel}
            onDeleteNivel={handleDeleteNivel}
          />
        )}

        {currentUser.role === 'dev' && activeTab === 'demandas' && (
          <DemandasView
            demandas={demandas}
            empresas={empresas}
            niveisComplexidade={niveisComplexidade}
            onAddDemanda={handleAddDemanda}
            onUpdateDemanda={handleUpdateDemanda}
            onDeleteDemanda={handleDeleteDemanda}
          />
        )}

        {currentUser.role === 'dev' && activeTab === 'pacotes' && (
          <PacotesView
            pacotes={pacotes}
            empresas={empresas}
            demandas={demandas}
            niveisComplexidade={niveisComplexidade}
            onAddPacote={handleAddPacote}
            onUpdatePacote={handleUpdatePacote}
            onDeletePacote={handleDeletePacote}
            onSelectPacoteForAssinatura={handleSelectPacoteForAssinatura}
            onSelectPacoteForAprovacao={handleSelectPacoteForAprovacao}
          />
        )}

        {currentUser.role === 'dev' && activeTab === 'fechamento' && (
          <FechamentoView empresas={empresas} pacotes={pacotes} />
        )}

        {currentUser.role === 'dev' && activeTab === 'codigo_django' && <DjangoCodeViewer />}

        {/* Visualizações Públicas dos Links Compartilháveis */}
        {activeTab === 'public_aprovacao' && activePacote && (
          <PublicAprovacaoView
            pacote={activePacote}
            empresa={activeEmpresa}
            demandas={demandas}
            niveisComplexidade={niveisComplexidade}
            onAprovarEscopo={handleAprovarEscopo}
          />
        )}

        {activeTab === 'public_assinatura' && activePacote && (
          <PublicAssinaturaView
            pacote={activePacote}
            empresa={activeEmpresa}
            demandas={demandas}
            niveisComplexidade={niveisComplexidade}
            onAssinarEntrega={handleAssinarEntrega}
            onOpenCertificado={(id) => setModalCertificadoPacoteId(id)}
          />
        )}
      </main>

      {/* Modal de Autenticação / Troca de Perfil */}
      <LoginModal
        isOpen={isLoginModalOpen}
        currentUser={currentUser}
        empresas={empresas}
        onSelectUser={handleSelectUser}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Modal de Certificado */}
      {modalCertificadoPacoteId && certificadoPacote && (
        <CertificadoModal
          pacote={certificadoPacote}
          empresa={certificadoEmpresa}
          demandas={demandas}
          niveisComplexidade={niveisComplexidade}
          onClose={() => setModalCertificadoPacoteId(null)}
        />
      )}
    </div>
  );
}

