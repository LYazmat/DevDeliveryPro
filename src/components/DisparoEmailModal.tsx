import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, Copy, Check, X, ShieldCheck, FileCheck, ExternalLink, Building2 } from 'lucide-react';
import { PacoteEntrega, Empresa, ItemDemanda, NivelComplexidade } from '../types';

export type TipoDisparo = 'aprovacao' | 'assinatura';

interface DisparoEmailModalProps {
  tipo: TipoDisparo;
  pacote: PacoteEntrega;
  empresa: Empresa;
  demandas: ItemDemanda[];
  niveisComplexidade: NivelComplexidade[];
  onClose: () => void;
}

export const DisparoEmailModal: React.FC<DisparoEmailModalProps> = ({
  tipo,
  pacote,
  empresa,
  demandas,
  niveisComplexidade,
  onClose,
}) => {
  const [enviado, setEnviado] = useState(false);
  const [copied, setCopied] = useState(false);

  const isAprovacao = tipo === 'aprovacao';

  const destinatarioNome = isAprovacao
    ? empresa.respAprovacaoNome || empresa.nomeContato
    : empresa.respEntregaNome || empresa.nomeContato;

  const destinatarioEmail = isAprovacao
    ? empresa.respAprovacaoEmail || empresa.emailContato
    : empresa.respEntregaEmail || empresa.emailContato;

  const linkAcao = isAprovacao
    ? `https://app.devdelivery.com.br/solicitacao/${pacote.tokenAprovacao}`
    : `https://app.devdelivery.com.br/assinar/${pacote.tokenAssinatura}`;

  const assunto = isAprovacao
    ? `[Aprovação Prévia de Escopo] Novo Pacote de Demandas - ${pacote.titulo}`
    : `[Homologação & Assinatura Digital] Termo de Aceite de Software - ${pacote.titulo}`;

  const itensDoPacote = demandas.filter((d) => pacote.itemIds.includes(d.id));
  const valorFinal = pacote.valorOverride ?? pacote.valorTotalCalculado;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(linkAcao);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimularEnvio = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviado(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#121212] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-white/10 relative my-8 text-zinc-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho */}
        <div className="flex items-center space-x-3 mb-6">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl border ${
              isAprovacao
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}
          >
            {isAprovacao ? <FileCheck className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <div>
            <span
              className={`text-[11px] font-bold uppercase tracking-wider ${
                isAprovacao ? 'text-blue-400' : 'text-emerald-400'
              }`}
            >
              {isAprovacao
                ? 'Fase 1: Disparo para Responsável por Aprovação Prévia'
                : 'Fase 2: Disparo para Responsável por Aceite & Entrega'}
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5">
              {isAprovacao ? 'Enviar Link de Aprovação Prévia' : 'Enviar Link de Assinatura & Homologação'}
            </h2>
          </div>
        </div>

        {enviado ? (
          <div className="bg-zinc-900/80 rounded-2xl border border-emerald-500/30 p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-black flex items-center justify-center mx-auto font-bold shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">E-mail Disparado com Sucesso!</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                A mensagem com o link tokenizado foi enviada para o endereço configurado no cadastro da empresa.
              </p>
            </div>

            <div className="p-4 bg-zinc-950 rounded-xl border border-white/5 text-left text-xs space-y-1.5 max-w-md mx-auto">
              <div>
                <span className="text-zinc-500">Destinatário Oficial:</span>{' '}
                <strong className="text-white">{destinatarioNome}</strong>
              </div>
              <div>
                <span className="text-zinc-500">E-mail de Destino:</span>{' '}
                <strong className="text-emerald-400">{destinatarioEmail}</strong>
              </div>
              <div>
                <span className="text-zinc-500">Papel Institucional:</span>{' '}
                <span className="text-zinc-300 font-semibold">
                  {isAprovacao ? 'Responsável por Aprovação Prévia' : 'Responsável por Aceite e Entrega'}
                </span>
              </div>
              <div>
                <span className="text-zinc-500">Status da Entrega:</span>{' '}
                <span className="text-emerald-400 font-mono">250 OK - Message queued for delivery</span>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl shadow-sm transition"
              >
                Concluir & Fechar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSimularEnvio} className="space-y-4">
            {/* Destinatário Configurado no Cadastro */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Configuração de Destinatário (Empresa: {empresa.nome})
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/5 font-semibold">
                  {isAprovacao ? 'Aprovação Prévia' : 'Aceite & Entrega'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-zinc-500 block">Responsável Designado:</span>
                  <strong className="text-white text-sm">{destinatarioNome || 'Não definido'}</strong>
                </div>
                <div>
                  <span className="text-zinc-500 block">E-mail de Destino:</span>
                  <strong className="text-emerald-400 text-sm">{destinatarioEmail || 'Não definido'}</strong>
                </div>
              </div>
            </div>

            {/* Preview do E-mail */}
            <div className="rounded-xl border border-white/10 bg-zinc-950 overflow-hidden text-xs">
              <div className="bg-zinc-900/90 px-4 py-2.5 border-b border-white/10 flex items-center justify-between text-zinc-400">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-zinc-200">Visualização da Mensagem</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">HTML Email Template</span>
              </div>

              <div className="p-4 space-y-3 text-zinc-300">
                <div>
                  <span className="text-zinc-500">De:</span>{' '}
                  <span className="text-zinc-300 font-medium">DevDelivery Pro &lt;notificacoes@devdelivery.com.br&gt;</span>
                </div>
                <div>
                  <span className="text-zinc-500">Para:</span>{' '}
                  <strong className="text-white">{destinatarioNome}</strong> &lt;{destinatarioEmail}&gt;
                </div>
                <div>
                  <span className="text-zinc-500">Assunto:</span>{' '}
                  <strong className="text-white">{assunto}</strong>
                </div>

                <div className="p-3.5 bg-zinc-900/80 rounded-xl border border-white/5 space-y-2 leading-relaxed">
                  <p>
                    Olá <strong className="text-white">{destinatarioNome}</strong>,
                  </p>
                  <p>
                    {isAprovacao
                      ? `Um novo pacote de demandas técnicas foi consolidado para a empresa ${empresa.nome} com competência em ${pacote.dataCompetencia}. Solicitamos sua validação de escopo para início do desenvolvimento.`
                      : `As demandas técnicas do pacote "${pacote.titulo}" foram concluídas e disponibilizadas para homologação. Solicitamos a conferência dos itens e a assinatura digital do termo de aceite.`}
                  </p>

                  <div className="p-2.5 bg-zinc-950 rounded-lg border border-white/5 text-[11px] space-y-1">
                    <div>
                      <strong>Pacote:</strong> {pacote.titulo}
                    </div>
                    <div>
                      <strong>Total de Demandas:</strong> {itensDoPacote.length} itens
                    </div>
                    <div>
                      <strong>Valor Consolidado:</strong> R${' '}
                      {valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="pt-2 text-center">
                    <span className="inline-block px-4 py-2 rounded-lg bg-emerald-500 text-black font-bold text-xs">
                      {isAprovacao ? 'Revisar & Aprovar Escopo' : 'Acessar & Assinar Termo de Aceite'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Link Direto com Copiar */}
            <div className="p-3 bg-zinc-900/60 rounded-xl border border-white/5 flex items-center justify-between gap-2 text-xs">
              <div className="truncate text-zinc-400 font-mono">
                <span className="text-zinc-500">Link Seguro: </span>
                <span className="text-emerald-400">{linkAcao}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="shrink-0 flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 font-semibold transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold shadow-sm transition flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Disparar E-mail para {destinatarioNome.split(' ')[0]}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
