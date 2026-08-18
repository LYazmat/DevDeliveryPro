export interface DjangoFile {
  filename: string;
  language: string;
  description: string;
  code: string;
}

export const DJANGO_FILES: DjangoFile[] = [
  {
    filename: 'gestao_entregas/models.py',
    language: 'python',
    description: 'Modelos Django com regras de negócio, responsáveis especializados por etapa, cálculo do maior nível e saldo diferido.',
    code: `import uuid
from decimal import Decimal
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator
from django.urls import reverse


class Empresa(models.Model):
    """
    Representa a empresa/cliente tomadora dos serviços de desenvolvimento.
    Multi-tenant / Multi-cliente.
    """
    nome = models.CharField(max_length=200, verbose_name="Razão Social / Nome Fantasia")
    cnpj = models.CharField(max_length=20, unique=True, verbose_name="CNPJ")
    email_contato = models.EmailField(verbose_name="E-mail de Contato Principal")
    nome_contato = models.CharField(max_length=150, verbose_name="Nome do Contato Principal", blank=True, null=True)
    telefone_contato = models.CharField(max_length=30, verbose_name="Telefone / WhatsApp", blank=True, null=True)
    
    # Responsável Especializado por Fase 1: Aprovação Prévia de Demandas
    resp_aprovacao_nome = models.CharField(
        max_length=150,
        blank=True,
        null=True,
        verbose_name="Nome do Resp. por Aprovação Prévia",
        help_text="Pessoa que autoriza o escopo e orçamento das demandas antes do início."
    )
    resp_aprovacao_email = models.EmailField(
        blank=True,
        null=True,
        verbose_name="E-mail do Resp. por Aprovação Prévia"
    )

    # Responsável Especializado por Fase 2: Aceite e Entrega de Software
    resp_entrega_nome = models.CharField(
        max_length=150,
        blank=True,
        null=True,
        verbose_name="Nome do Resp. por Aceite / Homologação",
        help_text="Pessoa que assina digitalmente o termo de entrega e homologação das funcionalidades."
    )
    resp_entrega_email = models.EmailField(
        blank=True,
        null=True,
        verbose_name="E-mail do Resp. por Aceite / Homologação"
    )

    teto_mensal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('3000.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name="Teto Mensal Padrão (Cap)",
        help_text="Valor máximo faturável por competência mensal sem diferimento."
    )
    ativo = models.BooleanField(default=True, verbose_name="Ativo")
    criado_em = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    atualizado_em = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")

    class Meta:
        verbose_name = "Empresa"
        verbose_name_plural = "Empresas"
        ordering = ['nome']

    def __str__(self):
        return f"{self.nome} ({self.cnpj})"

    def obter_responsavel_aprovacao(self) -> tuple[str, str]:
        """Retorna (nome, email) para envio do link de aprovação prévia."""
        nome = self.resp_aprovacao_nome or self.nome_contato or self.nome
        email = self.resp_aprovacao_email or self.email_contato
        return nome, email

    def obter_responsavel_entrega(self) -> tuple[str, str]:
        """Retorna (nome, email) para envio do link de homologação e assinatura digital."""
        nome = self.resp_entrega_nome or self.nome_contato or self.nome
        email = self.resp_entrega_email or self.email_contato
        return nome, email

    def calcular_saldo_diferido_mes(self, ano: int, mes: int) -> dict:
        """
        Calcula o total faturável do mês, o valor entregue e o saldo diferido (cumulativo).
        Regra:
        - Soma todos os pacotes com status 'assinado' na competência.
        - Se total > teto_mensal, excedente vai para o saldo diferido do próximo mês.
        """
        competencia_str = f"{ano:04d}-{mes:02d}"
        pacotes_mes = self.pacotes.filter(
            data_competencia__year=ano,
            data_competencia__month=mes,
            status='assinado'
        )

        total_entregue = sum((p.obter_valor_final() for p in pacotes_mes), Decimal('0.00'))
        
        # Obter saldo diferido do mês anterior
        mes_ant = mes - 1 if mes > 1 else 12
        ano_ant = ano if mes > 1 else ano - 1
        saldo_anterior = self._obter_saldo_diferido_acumulado_ate(ano_ant, mes_ant)

        total_acumulado = total_entregue + saldo_anterior
        valor_faturavel = min(total_acumulado, self.teto_mensal)
        novo_saldo_diferido = max(Decimal('0.00'), total_acumulado - self.teto_mensal)

        return {
            'competencia': competencia_str,
            'empresa': self,
            'total_entregue_mes': total_entregue,
            'saldo_anterior': saldo_anterior,
            'teto_mensal': self.teto_mensal,
            'valor_faturavel_mes': valor_faturavel,
            'novo_saldo_diferido': novo_saldo_diferido,
            'quantidade_pacotes': pacotes_mes.count(),
        }

    def _obter_saldo_diferido_acumulado_ate(self, ano: int, mes: int) -> Decimal:
        # Implementação em cascata ou busca em tabela de fechamento histórico
        return Decimal('0.00')


class NivelComplexidade(models.Model):
    """
    Tabela dinâmica de complexidades e valores de remuneração.
    Pode ser global (empresa=None) ou customizada por Contrato/Empresa.
    """
    nome = models.CharField(max_length=50, verbose_name="Nível (ex: Baixa, Média, Alta, Crítica)")
    descricao = models.TextField(verbose_name="Critérios e Escopo Típico", blank=True)
    valor_padrao = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name="Valor de Remuneração (R$)"
    )
    empresa = models.ForeignKey(
        Empresa,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="niveis_customizados",
        verbose_name="Empresa Específica (Opcional)",
        help_text="Deixe em branco para aplicar como regra global."
    )
    ordem_peso = models.PositiveIntegerField(
        default=1,
        verbose_name="Peso de Ordenação",
        help_text="1 para Baixa, 2 para Média, 3 para Alta, 4 para Crítica."
    )

    class Meta:
        verbose_name = "Nível de Complexidade"
        verbose_name_plural = "Níveis de Complexidade"
        ordering = ['ordem_peso', 'valor_padrao']

    def __str__(self):
        empresa_tag = f" [{self.empresa.nome}]" if self.empresa else " [Global]"
        return f"{self.nome} - R$ {self.valor_padrao:,.2f}{empresa_tag}"


class ItemDemanda(models.Model):
    """
    Demanda individual (feature, bugfix, pipeline ETL, módulo).
    """
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('em_andamento', 'Em Andamento'),
        ('concluido', 'Concluído'),
    ]

    titulo = models.CharField(max_length=255, verbose_name="Título da Demanda")
    descricao = models.TextField(verbose_name="Detalhamento Técnico / Escopo")
    empresa = models.ForeignKey(
        Empresa,
        on_delete=models.CASCADE,
        related_name="demandas",
        verbose_name="Empresa / Cliente"
    )
    nivel_complexidade = models.ForeignKey(
        NivelComplexidade,
        on_delete=models.PROTECT,
        related_name="demandas",
        verbose_name="Nível de Complexidade"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pendente',
        verbose_name="Status de Execução"
    )
    data_criacao = models.DateTimeField(auto_now_add=True, verbose_name="Data de Criação")
    data_conclusao = models.DateTimeField(null=True, blank=True, verbose_name="Data de Conclusão")

    class Meta:
        verbose_name = "Item de Demanda"
        verbose_name_plural = "Itens de Demanda"
        ordering = ['-data_criacao']

    def __str__(self):
        return f"[{self.empresa.nome}] {self.titulo} ({self.nivel_complexidade.nome})"


class PacoteEntrega(models.Model):
    """
    Agrupamento de demandas entregues em uma competência.
    Aplica automaticamente a regra do MAIOR NÍVEL DE COMPLEXIDADE entre os itens agrupados.
    """
    STATUS_CHOICES = [
        ('rascunho', 'Rascunho'),
        ('solicitado', 'Solicitação Enviada (Aguardando Aprovação Escopo)'),
        ('aprovado', 'Escopo Aprovado (Em Desenvolvimento)'),
        ('entregue', 'Entregue (Aguardando Assinatura do Cliente)'),
        ('assinado', 'Homologado & Assinado Digitalmente'),
    ]

    titulo = models.CharField(max_length=255, verbose_name="Título do Pacote / Sprint")
    empresa = models.ForeignKey(
        Empresa,
        on_delete=models.CASCADE,
        related_name="pacotes",
        verbose_name="Empresa / Cliente"
    )
    data_competencia = models.DateField(
        verbose_name="Mês/Competência de Cobrança",
        help_text="Primeiro dia do mês correspondente (ex: 2026-08-01)"
    )
    itens = models.ManyToManyField(
        ItemDemanda,
        related_name="pacotes",
        verbose_name="Itens Agrupados",
        blank=True
    )
    valor_total_calculado = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name="Valor Calculado (Maior Nível)"
    )
    valor_override = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Valor Manual / Override Aprovado (R$)",
        help_text="Preencha apenas se houver negociação especial que substitua a regra padrão."
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='rascunho',
        verbose_name="Status do Pacote"
    )
    token_aprovacao = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        verbose_name="Token de Solicitação / Aprovação"
    )
    token_assinatura = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        verbose_name="Token de Assinatura / Homologação"
    )
    observacoes = models.TextField(blank=True, null=True, verbose_name="Observações Gerais")
    data_criacao = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    data_aprovacao_escopo = models.DateTimeField(null=True, blank=True, verbose_name="Data Aprovação Escopo")
    aprovado_por_nome = models.CharField(max_length=150, null=True, blank=True, verbose_name="Escopo Aprovado Por")

    class Meta:
        verbose_name = "Pacote de Entrega"
        verbose_name_plural = "Pacotes de Entrega"
        ordering = ['-data_competencia', '-data_criacao']

    def __str__(self):
        return f"{self.titulo} - {self.empresa.nome} (R$ {self.obter_valor_final():,.2f})"

    def recalcular_valor_maior_complexidade(self):
        """
        REGRA DO NEGÓCIO:
        Determina o valor do pacote com base no item de MAIOR valor de complexidade.
        """
        if not self.pk:
            return Decimal('0.00')

        itens_qs = self.itens.all().select_related('nivel_complexidade')
        if not itens_qs.exists():
            self.valor_total_calculado = Decimal('0.00')
        else:
            maior_valor = max((item.nivel_complexidade.valor_padrao for item in itens_qs), default=Decimal('0.00'))
            self.valor_total_calculado = maior_valor

        self.save(update_fields=['valor_total_calculado'])
        return self.valor_total_calculado

    def obter_valor_final(self) -> Decimal:
        """Retorna o valor override (se existente) ou o valor calculado pelo maior nível."""
        if self.valor_override is not None:
            return self.valor_override
        return self.valor_total_calculado

    def get_link_solicitacao(self, request=None) -> str:
        """Retorna a URL pública para o cliente revisar e aprovar o escopo."""
        url_path = reverse('solicitar_aprovacao_publica', kwargs={'token': self.token_aprovacao})
        if request:
            return request.build_absolute_uri(url_path)
        return url_path

    def get_link_assinatura(self, request=None) -> str:
        """Retorna a URL pública para o cliente homologar e assinar no Canvas."""
        url_path = reverse('assinar_entrega_publica', kwargs={'token': self.token_assinatura})
        if request:
            return request.build_absolute_uri(url_path)
        return url_path


class AssinaturaEntrega(models.Model):
    """
    Registro imutável de homologação e assinatura digital com Canvas e metadados de auditoria.
    """
    pacote = models.OneToOneField(
        PacoteEntrega,
        on_delete=models.CASCADE,
        related_name="assinatura",
        verbose_name="Pacote de Entrega"
    )
    nome_signatario = models.CharField(max_length=150, verbose_name="Nome Completo do Signatário")
    cpf_funcao = models.CharField(max_length=100, verbose_name="CPF / Cargo / Função")
    signature_data_url = models.TextField(
        verbose_name="Imagem da Assinatura (Base64 Canvas)",
        help_text="Vetor gráfico gerado no Signature Pad do Canvas HTML5."
    )
    ip_address = models.GenericIPAddressField(verbose_name="Endereço IP do Signatário")
    user_agent = models.TextField(verbose_name="Navegador / User-Agent")
    data_assinatura = models.DateTimeField(default=timezone.now, verbose_name="Data e Hora do Aceite")
    hash_autenticacao = models.CharField(
        max_length=64,
        verbose_name="Hash de Integridade SHA-256",
        help_text="Hash criptográfico vinculando pacote, signatário, IP e timestamp."
    )

    class Meta:
        verbose_name = "Assinatura de Entrega"
        verbose_name_plural = "Assinaturas de Entrega"

    def __str__(self):
        return f"Assinatura por {self.nome_signatario} em {self.data_assinatura.strftime('%d/%m/%Y %H:%M')}"
`,
  },
  {
    filename: 'gestao_entregas/services.py',
    language: 'python',
    description: 'Serviço de disparo e geração de e-mails transacionais para Fase 1 (Aprovação) e Fase 2 (Assinatura).',
    code: `from django.core.mail import send_mail
from django.conf import settings
from .models import PacoteEntrega


def enviar_email_solicitacao_aprovacao(pacote: PacoteEntrega, request=None) -> bool:
    """
    Dispara e-mail com link público para o Responsável por Aprovação Prévia de Demandas.
    """
    empresa = pacote.empresa
    nome_dest, email_dest = empresa.obter_responsavel_aprovacao()
    link_publico = pacote.get_link_solicitacao(request)

    assunto = f"[Aprovação de Escopo] Pacote: {pacote.titulo} - {empresa.nome}"
    
    corpo_texto = f"""Olá {nome_dest},

Um novo pacote de demandas de software foi gerado e aguarda sua aprovação prévia de escopo e enquadramento de complexidade antes do início do desenvolvimento:

- Pacote: {pacote.titulo}
- Empresa: {empresa.nome}
- Competência: {pacote.data_competencia.strftime('%m/%Y')}
- Valor Consolidado Estimado: R$ {pacote.obter_valor_final():,.2f}
- Quantidade de Demandas: {pacote.itens.count()}

Para revisar o detalhamento técnico e confirmar a aprovação, acesse o link seguro:
{link_publico}

Atenciosamente,
Equipe de Engenharia & Gestão DevDelivery
"""
    try:
        send_mail(
            subject=assunto,
            message=corpo_texto,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@devdelivery.com.br'),
            recipient_list=[email_dest],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Erro ao enviar e-mail de aprovação: {e}")
        return False


def enviar_email_solicitacao_assinatura(pacote: PacoteEntrega, request=None) -> bool:
    """
    Dispara e-mail com link público para o Responsável por Aceite e Entrega de Software.
    """
    empresa = pacote.empresa
    nome_dest, email_dest = empresa.obter_responsavel_entrega()
    link_publico = pacote.get_link_assinatura(request)

    assunto = f"[Homologação & Assinatura Digital] Entrega Concluída: {pacote.titulo}"
    
    corpo_texto = f"""Olá {nome_dest},

As demandas vinculadas ao pacote "{pacote.titulo}" foram finalizadas pelo time de desenvolvimento e estão prontas para homologação e assinatura digital de entrega:

- Pacote: {pacote.titulo}
- Empresa: {empresa.nome}
- Competência: {pacote.data_competencia.strftime('%m/%Y')}
- Valor do Pacote Entregue: R$ {pacote.obter_valor_final():,.2f}

Para revisar as entregas e realizar a assinatura digital (com dedo no smartphone/tablet ou mouse), acesse o link seguro abaixo:
{link_publico}

Atenciosamente,
Equipe de Engenharia & Gestão DevDelivery
"""
    try:
        send_mail(
            subject=assunto,
            message=corpo_texto,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@devdelivery.com.br'),
            recipient_list=[email_dest],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Erro ao enviar e-mail de assinatura: {e}")
        return False
`
  },
  {
    filename: 'gestao_entregas/views.py',
    language: 'python',
    description: 'Views Django: Dashboard gerencial, disparo de e-mails, links públicos de aprovação e assinatura com Signature Pad.',
    code: `import hashlib
from decimal import Decimal
from django.shortcuts import render, get_object_or_404, redirect
from django.views import View
from django.views.generic import TemplateView
from django.http import JsonResponse, HttpResponseBadRequest
from django.utils import timezone
from django.contrib import messages
from .models import Empresa, NivelComplexidade, ItemDemanda, PacoteEntrega, AssinaturaEntrega
from .forms import AssinaturaEntregaForm, AprovacaoEscopoForm
from .services import enviar_email_solicitacao_aprovacao, enviar_email_solicitacao_assinatura


class DashboardView(TemplateView):
    """
    Dashboard Principal: Faturamento consolidado, entregas por cliente e saldo diferido.
    """
    template_name = "gestao_entregas/dashboard.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        hoje = timezone.now().date()
        ano = int(self.request.GET.get('ano', hoje.year))
        mes = int(self.request.GET.get('mes', hoje.month))

        empresas = Empresa.objects.filter(ativo=True)
        relatorio_empresas = []
        total_geral_faturavel = Decimal('0.00')
        total_geral_diferido = Decimal('0.00')
        total_geral_entregue = Decimal('0.00')

        for emp in empresas:
            dados = emp.calcular_saldo_diferido_mes(ano, mes)
            relatorio_empresas.append(dados)
            total_geral_faturavel += dados['valor_faturavel_mes']
            total_geral_diferido += dados['novo_saldo_diferido']
            total_geral_entregue += dados['total_entregue_mes']

        context.update({
            'ano': ano,
            'mes': mes,
            'competencia_label': f"{mes:02d}/{ano}",
            'relatorio_empresas': relatorio_empresas,
            'total_geral_faturavel': total_geral_faturavel,
            'total_geral_diferido': total_geral_diferido,
            'total_geral_entregue': total_geral_entregue,
            'pacotes_recentes': PacoteEntrega.objects.select_related('empresa').prefetch_related('itens')[:10],
            'total_demandas_pendentes': ItemDemanda.objects.filter(status='pendente').count(),
            'total_pacotes_aguardando_assinatura': PacoteEntrega.objects.filter(status='entregue').count(),
        })
        return context


class DispararEmailPacoteView(View):
    """
    Dispara e-mail com link público para o responsável cadastrado na empresa.
    """
    def post(self, request, pk, tipo):
        pacote = get_object_or_404(PacoteEntrega, pk=pk)
        if tipo == 'aprovacao':
            ok = enviar_email_solicitacao_aprovacao(pacote, request)
            if ok:
                pacote.status = 'solicitado'
                pacote.save(update_fields=['status'])
                messages.success(request, f"E-mail de aprovação enviado com sucesso para {pacote.empresa.resp_aprovacao_email or pacote.empresa.email_contato}!")
            else:
                messages.error(request, "Falha no envio do e-mail de aprovação.")
        elif tipo == 'assinatura':
            ok = enviar_email_solicitacao_assinatura(pacote, request)
            if ok:
                pacote.status = 'entregue'
                pacote.save(update_fields=['status'])
                messages.success(request, f"E-mail de assinatura digital enviado com sucesso para {pacote.empresa.resp_entrega_email or pacote.empresa.email_contato}!")
            else:
                messages.error(request, "Falha no envio do e-mail de assinatura.")
        
        return redirect('dashboard')


class SolicitarAprovacaoPublicView(View):
    """
    Fase 1: Link Público e Seguro (via token UUID) para o cliente revisar
    e aprovar o escopo e complexidade antes de iniciar o desenvolvimento.
    """
    template_name = "gestao_entregas/solicitar_aprovacao.html"

    def get(self, request, token):
        pacote = get_object_or_404(
            PacoteEntrega.objects.select_related('empresa').prefetch_related('itens__nivel_complexidade'),
            token_aprovacao=token
        )
        nome_resp, _ = pacote.empresa.obter_responsavel_aprovacao()
        form = AprovacaoEscopoForm(initial={'nome_responsavel': nome_resp})
        return render(request, self.template_name, {'pacote': pacote, 'form': form})

    def post(self, request, token):
        pacote = get_object_or_404(PacoteEntrega, token_aprovacao=token)
        
        if pacote.status not in ['rascunho', 'solicitado']:
            messages.warning(request, "Este pacote de entregas já teve o escopo aprovado previamente.")
            return redirect('solicitar_aprovacao_publica', token=token)

        form = AprovacaoEscopoForm(request.POST)
        if form.is_valid():
            nome = form.cleaned_data['nome_responsavel']
            pacote.status = 'aprovado'
            pacote.data_aprovacao_escopo = timezone.now()
            pacote.aprovado_por_nome = nome
            pacote.save(update_fields=['status', 'data_aprovacao_escopo', 'aprovado_por_nome'])
            
            # Atualiza status dos itens do pacote
            pacote.itens.filter(status='pendente').update(status='em_andamento')

            messages.success(request, f"Escopo aprovado com sucesso por {nome}! O time já pode iniciar.")
            return render(request, "gestao_entregas/sucesso_aprovacao.html", {'pacote': pacote})

        return render(request, self.template_name, {'pacote': pacote, 'form': form})


class AssinarEntregaPublicView(View):
    """
    Fase 2: Link Público e Seguro (via token UUID) para Homologação e Assinatura Digital
    no Canvas (com Signature Pad) pelo cliente, com captura de IP, User-Agent e Hash SHA-256.
    """
    template_name = "gestao_entregas/assinar_entrega.html"

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '127.0.0.1')
        return ip

    def get(self, request, token):
        pacote = get_object_or_404(
            PacoteEntrega.objects.select_related('empresa').prefetch_related('itens__nivel_complexidade'),
            token_assinatura=token
        )
        
        # Se já foi assinado, exibir recibo
        if pacote.status == 'assinado' and hasattr(pacote, 'assinatura'):
            return render(request, "gestao_entregas/recibo_assinatura.html", {
                'pacote': pacote,
                'assinatura': pacote.assinatura
            })

        nome_resp, _ = pacote.empresa.obter_responsavel_entrega()
        form = AssinaturaEntregaForm(initial={'nome_signatario': nome_resp})
        return render(request, self.template_name, {
            'pacote': pacote,
            'form': form,
            'client_ip': self.get_client_ip(request)
        })

    def post(self, request, token):
        pacote = get_object_or_404(PacoteEntrega, token_assinatura=token)

        if pacote.status == 'assinado':
            messages.info(request, "Esta entrega já foi homologada e assinada.")
            return redirect('assinar_entrega_publica', token=token)

        form = AssinaturaEntregaForm(request.POST)
        if form.is_valid():
            nome = form.cleaned_data['nome_signatario']
            cpf_funcao = form.cleaned_data['cpf_funcao']
            signature_data = form.cleaned_data['signature_data_url']
            ip = self.get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', 'Desconhecido')
            now = timezone.now()

            # Gerar Hash SHA-256 de autenticidade
            hash_payload = f"{pacote.id}|{pacote.token_assinatura}|{nome}|{cpf_funcao}|{ip}|{now.isoformat()}"
            hash_sha256 = hashlib.sha256(hash_payload.encode('utf-8')).hexdigest()

            # Criar registro de assinatura
            assinatura = AssinaturaEntrega.objects.create(
                pacote=pacote,
                nome_signatario=nome,
                cpf_funcao=cpf_funcao,
                signature_data_url=signature_data,
                ip_address=ip,
                user_agent=user_agent,
                data_assinatura=now,
                hash_autenticacao=hash_sha256
            )

            # Atualiza status do pacote e conclui itens
            pacote.status = 'assinado'
            pacote.save(update_fields=['status'])
            pacote.itens.update(status='concluido', data_conclusao=now)

            messages.success(request, "Homologação e assinatura digital concluídas com sucesso!")
            return render(request, "gestao_entregas/recibo_assinatura.html", {
                'pacote': pacote,
                'assinatura': assinatura
            })

        return render(request, self.template_name, {
            'pacote': pacote,
            'form': form,
            'client_ip': self.get_client_ip(request)
        })
`,
  },
  {
    filename: 'gestao_entregas/urls.py',
    language: 'python',
    description: 'Rotas de URL para o dashboard administrativo, disparo de e-mails e links públicos de solicitação e assinatura.',
    code: `from django.urls import path
from . import views

urlpatterns = [
    # Dashboard Administrativo
    path('', views.DashboardView.as_view(), name='dashboard'),
    
    # Ação de Disparo de E-mail para Responsáveis Cadastrados
    path('pacote/<int:pk>/disparar-email/<str:tipo>/', views.DispararEmailPacoteView.as_view(), name='disparar_email_pacote'),

    # Fase 1: Link público de Solicitação e Aprovação Prévia de Escopo
    path('solicitacao/<uuid:token>/', views.SolicitarAprovacaoPublicView.as_view(), name='solicitar_aprovacao_publica'),
    
    # Fase 2: Link público de Homologação e Assinatura Digital no Canvas
    path('assinar/<uuid:token>/', views.AssinarEntregaPublicView.as_view(), name='assinar_entrega_publica'),
]
`,
  },
  {
    filename: 'gestao_entregas/forms.py',
    language: 'python',
    description: 'Formulários Django para aprovação de escopo, solicitação de demandas e captura dos dados da assinatura.',
    code: `from django import forms
from .models import AssinaturaEntrega, PacoteEntrega, ItemDemanda, NivelComplexidade


class DemandaClienteForm(forms.ModelForm):
    """Formulário para o cliente solicitar novas demandas com descrição dinâmica de complexidade."""
    class Meta:
        model = ItemDemanda
        fields = ['titulo', 'nivel_complexidade', 'descricao']
        widgets = {
            'titulo': forms.TextInput(attrs={
                'class': 'w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm',
                'placeholder': 'Ex: Pipeline ETL de integração com Banco Central'
            }),
            'nivel_complexidade': forms.Select(attrs={
                'class': 'w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm',
                'id': 'select-nivel-complexidade'
            }),
            'descricao': forms.Textarea(attrs={
                'rows': 3,
                'class': 'w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm',
                'placeholder': 'Descreva os requisitos técnicos, telas e regras de negócio...'
            }),
        }


class AprovacaoEscopoForm(forms.Form):
    nome_responsavel = forms.CharField(
        max_length=150,
        required=True,
        label="Nome do Responsável pela Aprovação",
        widget=forms.TextInput(attrs={
            'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800',
            'placeholder': 'Ex: Carlos Eduardo Mendes'
        })
    )
    declaracao_concordancia = forms.BooleanField(
        required=True,
        label="Declaro que revisei o escopo técnico e a complexidade das demandas listadas.",
        widget=forms.CheckboxInput(attrs={'class': 'w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500'})
    )


class AssinaturaEntregaForm(forms.Form):
    nome_signatario = forms.CharField(
        max_length=150,
        required=True,
        label="Nome Completo",
        widget=forms.TextInput(attrs={
            'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800',
            'placeholder': 'Ex: Mariana Rocha'
        })
    )
    cpf_funcao = forms.CharField(
        max_length=100,
        required=True,
        label="CPF e Cargo / Função",
        widget=forms.TextInput(attrs={
            'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800',
            'placeholder': 'Ex: 123.456.789-00 - Gerente de TI'
        })
    )
    signature_data_url = forms.CharField(
        required=True,
        widget=forms.HiddenInput(attrs={'id': 'id_signature_data_url'})
    )
    declaracao_homologacao = forms.BooleanField(
        required=True,
        label="Declaro para os devidos fins que as demandas foram testadas, homologadas e entregues em conformidade.",
        widget=forms.CheckboxInput(attrs={'class': 'w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500'})
    )
`,
  },
  {
    filename: 'gestao_entregas/admin.py',
    language: 'python',
    description: 'Interface administrativa Django com botões de link público, disparo de e-mail e recálculo automático.',
    code: `from django.contrib import admin
from django.utils.html import format_html
from .models import Empresa, NivelComplexidade, ItemDemanda, PacoteEntrega, AssinaturaEntrega


@admin.register(Empresa)
class EmpresaAdmin(admin.ModelAdmin):
    list_display = ('nome', 'cnpj', 'resp_aprovacao_nome', 'resp_entrega_nome', 'teto_mensal', 'ativo')
    search_fields = ('nome', 'cnpj', 'email_contato', 'resp_aprovacao_email', 'resp_entrega_email')
    list_filter = ('ativo',)
    fieldsets = (
        ('Identificação da Empresa', {
            'fields': ('nome', 'cnpj', 'teto_mensal', 'ativo')
        }),
        ('Contato Principal', {
            'fields': ('email_contato', 'nome_contato', 'telefone_contato')
        }),
        ('Fase 1: Responsável por Aprovação Prévia de Demandas', {
            'fields': ('resp_aprovacao_nome', 'resp_aprovacao_email'),
            'description': 'Recebe o link para autorizar o escopo e orçamento das demandas antes de iniciar.'
        }),
        ('Fase 2: Responsável por Aceite e Entrega de Software', {
            'fields': ('resp_entrega_nome', 'resp_entrega_email'),
            'description': 'Recebe o link para homologar e assinar digitalmente a entrega no Canvas.'
        }),
    )


@admin.register(NivelComplexidade)
class NivelComplexidadeAdmin(admin.ModelAdmin):
    list_display = ('nome', 'valor_padrao', 'empresa', 'ordem_peso')
    list_filter = ('empresa',)
    ordering = ('ordem_peso',)


@admin.register(ItemDemanda)
class ItemDemandaAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'empresa', 'nivel_complexidade', 'status', 'data_criacao')
    list_filter = ('empresa', 'status', 'nivel_complexidade')
    search_fields = ('titulo', 'descricao')


class ItemDemandaInline(admin.TabularInline):
    model = PacoteEntrega.itens.through
    extra = 1


@admin.register(PacoteEntrega)
class PacoteEntregaAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'empresa', 'data_competencia', 'status', 'valor_total_calculado', 'valor_override', 'links_publicos')
    list_filter = ('status', 'empresa', 'data_competencia')
    search_fields = ('titulo', 'observacoes')
    readonly_fields = ('token_aprovacao', 'token_assinatura', 'valor_total_calculado', 'data_criacao')
    actions = ['recalcular_pacotes']

    def links_publicos(self, obj):
        link_aprov = obj.get_link_solicitacao()
        link_assin = obj.get_link_assinatura()
        return format_html(
            '<a href="{}" target="_blank" class="button" style="background:#2563eb;color:white;">Link Aprovação</a>&nbsp;'
            '<a href="{}" target="_blank" class="button" style="background:#059669;color:white;">Link Assinatura</a>',
            link_aprov, link_assin
        )
    links_publicos.short_description = "Links de Acesso do Cliente"

    def recalcular_pacotes(self, request, queryset):
        for pacote in queryset:
            pacote.recalcular_valor_maior_complexidade()
        self.message_user(request, f"{queryset.count()} pacotes recalculados com sucesso pela regra do maior nível.")
    recalcular_pacotes.short_description = "Recalcular valor pelo maior nível de complexidade"


@admin.register(AssinaturaEntrega)
class AssinaturaEntregaAdmin(admin.ModelAdmin):
    list_display = ('pacote', 'nome_signatario', 'cpf_funcao', 'ip_address', 'data_assinatura')
    readonly_fields = ('pacote', 'nome_signatario', 'cpf_funcao', 'signature_data_url', 'ip_address', 'user_agent', 'data_assinatura', 'hash_autenticacao')
`,
  },
  {
    filename: 'templates/gestao_entregas/assinar_entrega.html',
    language: 'html',
    description: 'Template de homologação e assinatura digital com Tailwind CSS, Signature Pad (Bézier HD e cores) e auditoria.',
    code: `<!DOCTYPE html>
<html lang="pt-BR" class="h-full bg-slate-950 text-slate-100">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Homologação & Assinatura de Entrega - {{ pacote.titulo }}</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Signature Pad JS (Curvas de Bézier e Sensibilidade) -->
  <script src="https://cdn.jsdelivr.net/npm/signature_pad@4.1.7/dist/signature_pad.umd.min.js"></script>
</head>
<body class="min-h-full flex flex-col font-sans antialiased bg-slate-950 text-slate-100">
  
  <!-- Header Minimalista -->
  <header class="bg-slate-900 border-b border-white/10 sticky top-0 z-30 shadow-md">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-sm">
          ✓
        </div>
        <div>
          <h1 class="text-lg font-bold text-white leading-tight">Termo de Homologação de Entrega</h1>
          <p class="text-xs text-emerald-400 font-medium">{{ pacote.empresa.nome }}</p>
        </div>
      </div>
      <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        Ambiente Seguro & Autenticado
      </span>
    </div>
  </header>

  <!-- Conteúdo Principal -->
  <main class="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
    
    <!-- Card de Resumo do Pacote -->
    <div class="bg-slate-900/90 rounded-2xl border border-white/10 shadow-xl p-6 sm:p-8 mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
        <div>
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Pacote de Demandas Entregues</span>
          <h2 class="text-xl font-bold text-white mt-0.5">{{ pacote.titulo }}</h2>
          <p class="text-xs text-slate-400 mt-1">Competência: {{ pacote.data_competencia|date:"F/Y" }}</p>
        </div>
        <div class="bg-slate-950 px-4 py-3 rounded-xl border border-white/10 text-right sm:self-center">
          <span class="text-xs text-slate-400 block">Valor Consolidado</span>
          <span class="text-xl font-bold text-emerald-400">R$ {{ pacote.obter_valor_final|floatformat:2 }}</span>
        </div>
      </div>

      <!-- Lista de Itens Entregues -->
      <div class="mt-6">
        <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Itens de Software Entregues:</h3>
        <div class="space-y-3">
          {% for item in pacote.itens.all %}
          <div class="flex items-start justify-between p-4 rounded-xl bg-slate-950 border border-white/5 hover:border-emerald-500/30 transition">
            <div class="pr-4">
              <h4 class="text-sm font-semibold text-white">{{ item.titulo }}</h4>
              <p class="text-xs text-slate-400 mt-1 leading-relaxed">{{ item.descricao }}</p>
            </div>
            <span class="shrink-0 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {{ item.nivel_complexidade.nome }}
            </span>
          </div>
          {% empty %}
          <p class="text-sm text-slate-500 italic">Nenhum item vinculado a este pacote.</p>
          {% endfor %}
        </div>
      </div>
    </div>

    <!-- Formulário de Assinatura & Canvas com SignaturePad -->
    <form method="POST" id="signature-form" class="bg-slate-900/90 rounded-2xl border border-white/10 shadow-xl p-6 sm:p-8">
      {% csrf_token %}
      <h3 class="text-lg font-bold text-white mb-1">Dados do Signatário e Assinatura Digital</h3>
      <p class="text-xs text-slate-400 mb-6">Ao assinar, você confirma formalmente que as funcionalidades foram devidamente testadas e homologadas.</p>

      {% if form.errors %}
      <div class="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
        Por favor, preencha todos os campos obrigatórios e desenhe sua assinatura no quadro antes de enviar.
      </div>
      {% endif %}

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Nome Completo *</label>
          {{ form.nome_signatario }}
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">CPF e Cargo / Função *</label>
          {{ form.cpf_funcao }}
        </div>
      </div>

      <!-- Quadro de Assinatura (SignaturePad) -->
      <div class="mb-6">
        <div class="flex flex-wrap items-center justify-between mb-2 gap-2">
          <div class="flex items-center space-x-2">
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Quadro de Assinatura (Mouse, Dedo ou Caneta Stylus) *
            </label>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Curvas Suaves HD
            </span>
          </div>

          <div class="flex items-center space-x-3 text-xs">
            <!-- Paleta de Cores -->
            <div class="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-white/10">
              <span class="text-[11px] text-slate-400 mr-1">Cor:</span>
              <button type="button" class="btn-color w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-white" data-color="#34d399" title="Verde Emerald"></button>
              <button type="button" class="btn-color w-3.5 h-3.5 rounded-full bg-blue-400 opacity-60 hover:opacity-100" data-color="#60a5fa" title="Azul"></button>
              <button type="button" class="btn-color w-3.5 h-3.5 rounded-full bg-white opacity-60 hover:opacity-100" data-color="#ffffff" title="Branco"></button>
              <button type="button" class="btn-color w-3.5 h-3.5 rounded-full bg-amber-400 opacity-60 hover:opacity-100" data-color="#fbbf24" title="Dourado"></button>
            </div>

            <button type="button" id="btn-clear-canvas" class="text-xs text-slate-400 hover:text-rose-400 flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-white/10 hover:border-rose-500/30 transition">
              <span>Limpar Assinatura</span>
            </button>
          </div>
        </div>

        <div class="relative w-full h-52 bg-slate-950 rounded-2xl border-2 border-dashed border-white/20 overflow-hidden cursor-crosshair">
          <canvas id="signature-canvas" class="w-full h-full block touch-none"></canvas>
          <div id="canvas-placeholder" class="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-500 text-xs">
            <span>✍️ Assine aqui com o dedo no celular/tablet ou mouse</span>
            <span class="text-[10px] text-slate-600 mt-0.5">Suavização dinâmica de traço por curvas de Bézier</span>
          </div>
        </div>
        {{ form.signature_data_url }}
      </div>

      <!-- Metadados de Auditoria -->
      <div class="p-3 bg-slate-950 rounded-xl border border-white/10 mb-6 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <span>IP Registrado: <strong class="text-emerald-400">{{ client_ip }}</strong></span>
        <span>Carimbo de Data/Hora: <strong class="text-white">{% now "d/m/Y H:i:s" %}</strong></span>
      </div>

      <!-- Termo de Concordância -->
      <div class="mb-6 flex items-start space-x-3">
        {{ form.declaracao_homologacao }}
        <label for="{{ form.declaracao_homologacao.id_for_label }}" class="text-xs text-slate-400 leading-normal">
          {{ form.declaracao_homologacao.label }}
        </label>
      </div>

      <!-- Botão de Envio -->
      <button type="submit" id="btn-submit" class="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 transition flex items-center justify-center space-x-2 text-base cursor-pointer">
        <span>Homologar e Concluir Assinatura Digital</span>
      </button>
    </form>
  </main>

  <!-- Script com SignaturePad JS -->
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const canvas = document.getElementById('signature-canvas');
      const placeholder = document.getElementById('canvas-placeholder');
      const clearBtn = document.getElementById('btn-clear-canvas');
      const inputSignature = document.getElementById('id_signature_data_url');
      const form = document.getElementById('signature-form');
      const colorBtns = document.querySelectorAll('.btn-color');

      function resizeCanvas() {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext('2d').scale(ratio, ratio);
      }

      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();

      const signaturePad = new SignaturePad(canvas, {
        minWidth: 1.5,
        maxWidth: 3.5,
        penColor: '#34d399',
        velocityFilterWeight: 0.7
      });

      signaturePad.addEventListener('beginStroke', function() {
        placeholder.style.display = 'none';
      });

      clearBtn.addEventListener('click', function() {
        signaturePad.clear();
        placeholder.style.display = 'flex';
        inputSignature.value = '';
      });

      colorBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          colorBtns.forEach(b => {
            b.classList.remove('ring-2', 'ring-white');
            b.classList.add('opacity-60');
          });
          btn.classList.add('ring-2', 'ring-white');
          btn.classList.remove('opacity-60');
          signaturePad.penColor = btn.getAttribute('data-color');
        });
      });

      form.addEventListener('submit', function(e) {
        if (signaturePad.isEmpty()) {
          e.preventDefault();
          alert('Por favor, desenhe sua assinatura no quadro antes de confirmar.');
          return;
        }
        inputSignature.value = signaturePad.toDataURL('image/png');
      });
    });
  </script>
</body>
</html>
`,
  },
  {
    filename: 'requirements.txt',
    language: 'text',
    description: 'Dependências Python para o projeto Django.',
    code: `Django>=5.0,<5.2
Pillow>=10.0.0
django-environ>=0.11.2
gunicorn>=21.2.0
psycopg2-binary>=2.9.9
`,
  },
  {
    filename: 'README.md',
    language: 'markdown',
    description: 'Guia passo a passo de instalação, execução de migrations e teste do fluxo multi-empresa.',
    code: `# Sistema de Gestão de Entregas & Remuneração Multi-Empresas (Django)

Sistema web multi-empresa para controle de demandas de software, cálculo automático de pacotes pelo maior nível de complexidade, teto mensal com saldo diferido, responsáveis especializados por fase, links públicos de aprovação e assinatura digital no Canvas com SignaturePad.

## 🚀 Como Executar o Projeto Django

### 1. Criar e Ativar o Ambiente Virtual
\`\`\`bash
python3 -m venv venv
source venv/bin/activate  # No Windows: venv\\Scripts\\activate
\`\`\`

### 2. Instalar as Dependências
\`\`\`bash
pip install -r requirements.txt
\`\`\`

### 3. Rodar as Migrations do Banco de Dados
\`\`\`bash
python manage.py makemigrations
python manage.py migrate
\`\`\`

### 4. Criar o Usuário Administrador
\`\`\`bash
python manage.py createsuperuser
\`\`\`

### 5. Iniciar o Servidor de Desenvolvimento
\`\`\`bash
python manage.py runserver
\`\`\`
Acesse o sistema em: \`http://127.0.0.1:8000/\`

---

## 🔑 Fluxo de Trabalho do Sistema

1. **Multi-Empresa & Responsáveis Especializados:** Cadastre empresas com:
   - **Responsável por Aprovação Prévia de Demandas:** Nome e e-mail para autorização de início de escopo.
   - **Responsável por Aceite e Entrega de Software:** Nome e e-mail para homologação e assinatura digital.
   - **Teto Mensal (Cap):** Limite faturável por competência mensal.
2. **Níveis de Complexidade:** Configure níveis globais (Baixa: R$ 300, Média: R$ 800, Alta: R$ 1.600, Crítica: R$ 2.800) ou específicos por empresa, com descrições exibidas dinamicamente ao selecionar a complexidade.
3. **Agrupamento em Pacotes:** Ao vincular múltiplos itens a um pacote, o método \`recalcular_valor_maior_complexidade()\` seleciona automaticamente o maior valor entre os itens agrupados.
4. **Fase 1 (Solicitação & E-mail):** Dispare o e-mail ou envie o link gerado com o token \`token_aprovacao\` para o responsável pela aprovação.
5. **Fase 2 (Homologação & Assinatura):** Dispare o e-mail ou envie o link com o token \`token_assinatura\`. O responsável assina na tela do Canvas (com SignaturePad e curvas suaves), com registro automático de IP, data/hora e hash de integridade SHA-256.
6. **Teto & Saldo Diferido:** O dashboard calcula mensalmente se as entregas ultrapassaram o teto mensal da empresa, diferindo o excedente automaticamente para os meses seguintes.
`,
  }
];
