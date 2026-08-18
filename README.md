# Sistema de Gestão de Entregas & Remuneração Multi-Empresas

Plataforma integrada (Frontend Interativo em React 19 + Especificação de Backend Django 5.x) para gestão de demandas de software por sprints/pacotes, cálculo financeiro inteligente pelo maior nível de complexidade, governança de teto mensal com saldo diferido, e fluxo de aprovação e homologação em 2 fases com assinatura digital touchscreen.

---

## 🌟 Principais Funcionalidades

### 1. Multi-Empresas & Governança por Papéis
- **Gestão por Cliente:** Cadastro completo de empresas com CNPJ, limite de faturamento mensal (*Teto/Cap*) e contatos principais.
- **Responsáveis Especializados por Fase:**
  - **Fase 1 (Aprovação Prévia de Demandas):** Responsável técnico/financeiro que valida o escopo e orçamento antes de iniciar o desenvolvimento.
  - **Fase 2 (Aceite & Entrega de Software):** Responsável que homologa as funcionalidades entregues e realiza a assinatura digital.
- **Visualização em Dois Papéis:**
  - **Visão Desenvolvedor / Administrador:** Dashboard financeiro consolidado, gestão de empresas, tabela de níveis de complexidade, criação de pacotes e disparo de links.
  - **Portal do Cliente:** Visão restrita e transparente com saldo diferido, solicitação de novas demandas com descrição dinâmica de complexidade e acompanhamento de entregas.

### 2. Cálculo Inteligente por Nível de Complexidade
- Cada demanda recebe uma classificação de complexidade (ex.: Baixa: R$ 300, Média: R$ 800, Alta: R$ 1.600, Crítica: R$ 2.800).
- **Regra de Agrupamento em Pacotes:** Ao vincular múltiplos itens de software a um pacote de entrega, o sistema adota automaticamente o **maior nível de complexidade** entre os itens incluídos, garantindo remuneração justa pelo esforço dominante com opção de override manual se necessário.

### 3. Teto Mensal e Saldo Diferido Automático
- O faturamento mensal de cada empresa é limitado ao seu **Teto Mensal**.
- Caso o total de pacotes entregues no mês ultrapasse o teto contratual, o excedente é automaticamente transferido como **Saldo Diferido** para abatimento nas competências subsequentes, sem perdas financeiras.

### 4. Fluxo Seguro em 2 Fases com Links Públicos
- **Fase 1 - Aprovação de Escopo:** Link com token criptográfico (UUID) enviado para o responsável por aprovação revisar os itens e autorizar o início do ciclo.
- **Fase 2 - Homologação & Assinatura Digital:** Link seguro com token UUID onde o cliente testa a entrega e assina diretamente na tela (smartphone, tablet ou mouse).
- **Quadro de Assinatura com Alta Precisão (`react-signature-canvas` / `SignaturePad`):** Suavização por curvas de Bézier, sensibilidade ao traço, seletor de paleta de cores e geração de Hash SHA-256 com carimbo de data/hora, endereço IP e User-Agent para auditoria jurídica.

### 5. Central de Exportação de Código Django
- Aba interativa **"Código Django (Backend)"** contendo toda a arquitetura Django pronta para produção:
  - `models.py` (Multi-tenant, regras de saldo diferido, tokens e hashes)
  - `services.py` (Disparo de e-mails transacionais para responsáveis de cada fase)
  - `views.py` (Class-Based Views para dashboard, links públicos e APIs)
  - `forms.py` (Formulários tipados com widgets Tailwind e seletor de complexidade)
  - `admin.py` (Interface administrativa customizada com botões de recálculo e links de acesso rápido)
  - `templates/gestao_entregas/assinar_entrega.html` (Template responsivo com SignaturePad)
  - `requirements.txt` e `settings.py`

---

## 🛠️ Tecnologias Utilizadas

### Frontend (Aplicação Web Interativa)
- **React 19** + **TypeScript**
- **Vite 6**
- **Tailwind CSS v4**
- **Lucide React** (Ícones)
- **Motion** (Transições e animações fluidas)
- **react-signature-canvas** (Quadro de assinatura de alta fidelidade)
- **Canvas Confetti** (Feedback visual de homologação concluída)

### Backend (Especificação Django)
- **Python 3.11+** / **Django 5.x**
- **PostgreSQL / SQLite**
- **Pillow** (Processamento de assinaturas e imagens)
- **SignaturePad JS** (Integração no template Django)

---

## 🚀 Como Executar o Projeto

### Frontend (React + Vite)

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Iniciar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   A aplicação estará disponível em: `http://localhost:3000`

3. **Build de produção:**
   ```bash
   npm run build
   ```

---

### Backend Django (Opcional - Arquivos disponíveis na aba "Código Django")

1. **Criar e ativar o ambiente virtual:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # No Windows: venv\Scripts\activate
   ```

2. **Instalar dependências Python:**
   ```bash
   pip install Django Pillow django-environ gunicorn psycopg2-binary
   ```

3. **Executar migrações do banco de dados:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Criar superusuário administrador:**
   ```bash
   python manage.py createsuperuser
   ```

5. **Iniciar o servidor Django:**
   ```bash
   python manage.py runserver
   ```
   Acesse em: `http://127.0.0.1:8000/`

---

## 📋 Estrutura de Diretórios

```text
├── src/
│   ├── components/
│   │   ├── ClientePortalView.tsx       # Portal do Cliente (solicitação e acompanhamento)
│   │   ├── DashboardView.tsx           # Visão consolidada de faturamento e saldo diferido
│   │   ├── DemandasView.tsx            # Gestão e criação de demandas e pacotes
│   │   ├── DjangoCodeViewer.tsx        # Visualizador e exportador dos arquivos Django
│   │   ├── EmpresasView.tsx            # Cadastro e configuração de empresas/tetos
│   │   ├── NiveisComplexidadeView.tsx  # Tabela de preços e complexidades
│   │   └── PublicAssinaturaView.tsx    # Tela pública de homologação e assinatura digital
│   ├── data/
│   │   ├── djangoCodebase.ts           # Código completo do ecossistema Django
│   │   └── initialData.ts              # Dados iniciais e estruturas de exemplo
│   ├── types.ts                        # Definições de tipos TypeScript
│   ├── App.tsx                         # Componente raiz e roteamento de abas
│   └── main.tsx                        # Ponto de entrada React
├── metadata.json                       # Configurações e metadados da aplicação
├── package.json                        # Dependências e scripts do projeto
├── vite.config.ts                      # Configuração do Vite e Tailwind CSS
└── README.md                           # Documentação do projeto
```

---

## 📄 Licença

Este projeto é desenvolvido para uso corporativo e gestão ágil de entregas de software.
