import React, { useState } from 'react';
import { Calculator, Building2, TrendingUp, DollarSign, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { Empresa, PacoteEntrega } from '../types';

interface FechamentoViewProps {
  empresas: Empresa[];
  pacotes: PacoteEntrega[];
}

export const FechamentoView: React.FC<FechamentoViewProps> = ({ empresas, pacotes }) => {
  const [selectedCompetencia, setSelectedCompetencia] = useState('2026-08');

  // Competências disponíveis para simulação
  const competencias = ['2026-08', '2026-07', '2026-06'];

  // Para cada empresa, calcular histórico de entregas e saldo diferido
  const relatorioFechamento = empresas.map((empresa) => {
    // Pacotes assinados na competência atual
    const pacotesMes = pacotes.filter(
      (p) => p.empresaId === empresa.id && p.dataCompetencia === selectedCompetencia && p.status === 'assinado'
    );

    const totalEntregue = pacotesMes.reduce(
      (acc, p) => acc + (p.valorOverride ?? p.valorTotalCalculado),
      0
    );

    const teto = empresa.tetoMensal;
    const faturavel = Math.min(totalEntregue, teto);
    const saldoDiferido = Math.max(0, totalEntregue - teto);

    return {
      empresa,
      pacotesMes,
      totalEntregue,
      teto,
      faturavel,
      saldoDiferido,
    };
  });

  const totalEntregueGeral = relatorioFechamento.reduce((acc, r) => acc + r.totalEntregue, 0);
  const totalFaturavelGeral = relatorioFechamento.reduce((acc, r) => acc + r.faturavel, 0);
  const totalDiferidoGeral = relatorioFechamento.reduce((acc, r) => acc + r.saldoDiferido, 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 p-6 rounded-2xl border border-white/5 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Calculator className="w-6 h-6 text-emerald-400" />
            <span>Fechamento Mensal & Saldo Diferido (Cap)</span>
          </h2>
          <p className="text-sm text-zinc-400 mt-0.5">
            Cálculo automatizado do teto de faturamento mensal por cliente e saldo diferido cumulativo.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Competência:</label>
          <select
            value={selectedCompetencia}
            onChange={(e) => setSelectedCompetencia(e.target.value)}
            className="px-3.5 py-2 bg-[#18181b] border border-white/10 rounded-xl text-sm font-semibold text-white focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:outline-none"
          >
            {competencias.map((comp) => (
              <option key={comp} value={comp}>
                {comp === '2026-08' ? 'Agosto / 2026 (Atual)' : comp === '2026-07' ? 'Julho / 2026' : 'Junho / 2026'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards de Fechamento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-zinc-900/60 p-6 rounded-2xl border border-white/5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Valor Bruto Entregue</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-white">
              R$ {totalEntregueGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <DollarSign className="w-6 h-6 text-zinc-500" />
          </div>
          <p className="text-xs text-zinc-500 mt-1">Soma de todos os pacotes homologados e assinados.</p>
        </div>

        <div className="bg-zinc-900/60 p-6 rounded-2xl border border-white/5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Total Faturável no Mês</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-400">
              R$ {totalFaturavelGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-xs text-zinc-400 mt-1">Respeitando o teto máximo contratual de cada cliente.</p>
        </div>

        <div className="bg-zinc-900/60 p-6 rounded-2xl border border-white/5 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Saldo Diferido para Próximo Mês</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-amber-400">
              R$ {totalDiferidoGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <TrendingUp className="w-6 h-6 text-amber-400" />
          </div>
          <p className="text-xs text-zinc-400 mt-1">Excedente acumulado a faturar nas próximas competências.</p>
        </div>
      </div>

      {/* Detalhamento por Empresa */}
      <div className="bg-zinc-900/60 rounded-2xl border border-white/5 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Extrato de Fechamento por Empresa / Contrato</h3>
            <p className="text-xs text-zinc-400">Detalhamento linha a linha do faturamento mensal.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-zinc-900/90 border-b border-white/5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                <th className="py-3 px-6">Empresa / CNPJ</th>
                <th className="py-3 px-4">Teto Mensal (Cap)</th>
                <th className="py-3 px-4">Total Entregue</th>
                <th className="py-3 px-4">Faturável (Mês)</th>
                <th className="py-3 px-4">Saldo Diferido</th>
                <th className="py-3 px-6 text-right">Status do Fechamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {relatorioFechamento.map(({ empresa, totalEntregue, teto, faturavel, saldoDiferido, pacotesMes }) => (
                <tr key={empresa.id} className="hover:bg-zinc-900/90 transition">
                  <td className="py-4 px-6">
                    <div className="font-bold text-white">{empresa.nome}</div>
                    <div className="text-xs text-zinc-400 font-mono">{empresa.cnpj}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {pacotesMes.length} pacote(s) homologado(s)
                    </div>
                  </td>
                  <td className="py-4 px-4 font-semibold text-zinc-300">
                    R$ {teto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-4 font-bold text-white">
                    R$ {totalEntregue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-4 font-bold text-emerald-400">
                    R$ {faturavel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-4">
                    {saldoDiferido > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        + R$ {saldoDiferido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-500 font-medium">R$ 0,00</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    {saldoDiferido > 0 ? (
                      <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                        Teto Excedido (Diferido)
                      </span>
                    ) : totalEntregue > 0 ? (
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        100% Faturável
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-500">Sem entregas no mês</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
