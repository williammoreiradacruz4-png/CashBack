import { type ChangeEvent, useRef } from 'react';
import {
  ArrowUpDown,
  Check,
  Dices,
  Download,
  FileDown,
  FileUp,
  RotateCcw,
  Shuffle,
  Trophy,
} from 'lucide-react';
import {
  DepositItem,
  DrawBudget,
  GOAL_AMOUNT,
  TierStat,
  formatCurrencyBRL,
} from '../types/challenge';

interface ProgressSummaryCardProps {
  totalSaved: number;
  remaining: number;
  percentExact: number;
  percentRounded: number;
  paidCount: number;
  totalCount: number;
  isComplete: boolean;
}

export function ProgressSummaryCard({
  totalSaved,
  remaining,
  percentExact,
  percentRounded,
  paidCount,
  totalCount,
  isComplete,
}: ProgressSummaryCardProps) {
  return (
    <section
      aria-label="Resumo do progresso"
      className="self-start rounded-2xl border border-[#092869] bg-gradient-to-br from-[#0A2E7A] via-[#0E3FA3] to-[#134CC2] p-5 text-white sm:p-6 lg:col-span-4 lg:col-start-9 lg:row-start-1"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-blue-100">
          Total guardado
        </span>
        <span className="font-mono text-sm font-semibold text-amber-300 tabular-nums">
          {percentRounded}% da meta
        </span>
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <p className="font-mono text-3xl font-bold tracking-tight text-white tabular-nums sm:text-4xl">
          {formatCurrencyBRL(totalSaved)}
        </p>
        <span className="font-mono text-sm text-blue-200/80 tabular-nums">
          / {formatCurrencyBRL(GOAL_AMOUNT)}
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={percentRounded}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso total do desafio"
        className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/15"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, percentExact)}%` }}
        />
      </div>

      <div className="mt-5 grid grid-cols-3 divide-x divide-white/15 border-t border-white/15 pt-4">
        <div className="pr-3">
          <div className="text-xs text-blue-200">Guardado</div>
          <div className="mt-0.5 font-mono text-sm font-semibold text-amber-300 tabular-nums sm:text-base">
            {formatCurrencyBRL(totalSaved)}
          </div>
        </div>
        <div className="px-3">
          <div className="text-xs text-blue-200">Falta</div>
          <div className="mt-0.5 font-mono text-sm font-semibold text-white tabular-nums sm:text-base">
            {formatCurrencyBRL(remaining)}
          </div>
        </div>
        <div className="pl-3">
          <div className="text-xs text-blue-200">Depósitos</div>
          <div className="mt-0.5 font-mono text-sm font-semibold text-white tabular-nums sm:text-base">
            {paidCount}/{totalCount}
          </div>
        </div>
      </div>

      {isComplete && (
        <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-amber-300/40 bg-amber-400/15 px-4 py-3 text-sm font-medium text-amber-100">
          <Trophy className="h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
          <span>Meta concluída: todos os 100 depósitos foram realizados.</span>
        </div>
      )}
    </section>
  );
}

interface SidebarToolsProps {
  paidCount: number;
  isComplete: boolean;
  tierStats: TierStat[];
  valueFilter: number | null;
  drawBudget: DrawBudget;
  highlightedIndex: number | null;
  highlightedItem: DepositItem | null;
  noBudgetMatch: boolean;
  onDrawBudgetChange: (budget: DrawBudget) => void;
  onDrawRandom: () => void;
  onMarkHighlightedPaid: () => void;
  onClearHighlight: () => void;
  onToggleTierFilter: (tier: number) => void;
  onRequestShuffle: () => void;
  onRestoreOrder: () => void;
  onExportCsv: () => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  backupStatus: { ok: boolean; message: string } | null;
  onRequestReset: () => void;
}

export function SidebarTools({
  paidCount,
  isComplete,
  tierStats,
  valueFilter,
  drawBudget,
  highlightedIndex,
  highlightedItem,
  noBudgetMatch,
  onDrawBudgetChange,
  onDrawRandom,
  onMarkHighlightedPaid,
  onClearHighlight,
  onToggleTierFilter,
  onRequestShuffle,
  onRestoreOrder,
  onExportCsv,
  onExportBackup,
  onImportBackup,
  backupStatus,
  onRequestReset,
}: SidebarToolsProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportBackup(file);
    }
    event.target.value = '';
  };
  return (
    <div className="flex flex-col gap-6 self-start lg:col-span-4 lg:col-start-9 lg:row-start-2">
      {/* Quick Deposit Draw */}
      <section
        aria-label="Sortear próximo depósito"
        className="rounded-2xl border border-blue-100 bg-white p-5 sm:p-6"
      >
        <h2 className="text-base font-semibold text-slate-900">
          Sortear Próximo Depósito
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Escolha uma faixa de valor e sorteie um depósito pendente.
        </p>

        <div
          role="group"
          aria-label="Faixa de valor para sorteio"
          className="mt-4 grid grid-cols-3 gap-1 rounded-lg bg-[#EEF3FC] p-1"
        >
          <button
            type="button"
            onClick={() => onDrawBudgetChange('any')}
            className={`min-h-[36px] whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
              drawBudget === 'any'
                ? 'bg-white text-[#0A2E7A] shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Qualquer
          </button>
          <button
            type="button"
            onClick={() => onDrawBudgetChange('up_to_50')}
            className={`min-h-[36px] whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
              drawBudget === 'up_to_50'
                ? 'bg-white text-[#0A2E7A] shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Até R$ 50
          </button>
          <button
            type="button"
            onClick={() => onDrawBudgetChange('75_plus')}
            className={`min-h-[36px] whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
              drawBudget === '75_plus'
                ? 'bg-white text-[#0A2E7A] shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            R$ 75+
          </button>
        </div>

        <button
          type="button"
          disabled={isComplete}
          onClick={onDrawRandom}
          className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#0E44B8] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0A3696] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E44B8] focus-visible:ring-offset-2"
        >
          <Dices className="h-4 w-4 text-amber-300" aria-hidden="true" />
          <span>
            {highlightedIndex !== null ? 'Sortear outro' : 'Sortear depósito'}
          </span>
        </button>

        {noBudgetMatch && (
          <p className="mt-3 text-xs text-slate-600">
            Não há depósitos pendentes nessa faixa de valor. Tente outra faixa.
          </p>
        )}

        {highlightedIndex !== null && highlightedItem && !highlightedItem.pago && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3.5">
            <div>
              <div className="text-xs font-medium text-amber-800">
                Célula #{highlightedIndex + 1}
              </div>
              <div className="font-mono text-lg font-bold text-amber-950 tabular-nums">
                {formatCurrencyBRL(highlightedItem.valor)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClearHighlight}
                className="min-h-[36px] whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium text-amber-900 transition-colors hover:bg-amber-100"
              >
                Limpar
              </button>
              <button
                type="button"
                onClick={onMarkHighlightedPaid}
                className="inline-flex min-h-[36px] items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#0E44B8] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#0A3696]"
              >
                <Check className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
                <span>Pagar</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Tier Breakdown Ledger */}
      <section
        aria-label="Distribuição por valor"
        className="rounded-2xl border border-blue-100 bg-white p-5 sm:p-6"
      >
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-900">
            Resumo por Valor
          </h2>
          <span className="text-xs text-slate-500">Clique para filtrar</span>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {tierStats.map((tier) => {
            const isSelected = valueFilter === tier.valor;
            const tierPct = Math.round((tier.paidCount / tier.totalCount) * 100);

            return (
              <button
                key={tier.valor}
                type="button"
                onClick={() => onToggleTierFilter(tier.valor)}
                aria-pressed={isSelected}
                className={`-mx-2 flex w-[calc(100%+1rem)] items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-[#F7FAFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E44B8] ${
                  isSelected ? 'bg-blue-50/80' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                      {formatCurrencyBRL(tier.valor)}
                    </span>
                    <span className="font-mono text-xs text-slate-500 tabular-nums">
                      {tier.paidCount}/{tier.totalCount} pagos
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#0E44B8] transition-all duration-300"
                      style={{ width: `${tierPct}%` }}
                    />
                  </div>
                </div>
                <span className="w-20 shrink-0 text-right font-mono text-xs font-medium text-slate-700 tabular-nums">
                  {formatCurrencyBRL(tier.savedAmount)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Utility Actions */}
      <section
        aria-label="Gerenciar desafio"
        className="rounded-2xl border border-blue-100 bg-white p-5 sm:p-6"
      >
        <h2 className="text-base font-semibold text-slate-900">
          Gerenciar Grade
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
          <button
            type="button"
            onClick={onRequestShuffle}
            className="flex min-h-[42px] items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-[#F7FAFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E44B8]"
          >
            <Shuffle className="h-4 w-4 text-[#0E44B8]" aria-hidden="true" />
            <span>Embaralhar Valores</span>
          </button>
          <button
            type="button"
            onClick={onRestoreOrder}
            className="flex min-h-[42px] items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-[#F7FAFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E44B8]"
          >
            <ArrowUpDown className="h-4 w-4 text-[#0E44B8]" aria-hidden="true" />
            <span>Ordenar Valores</span>
          </button>
          <button
            type="button"
            onClick={onExportBackup}
            className="flex min-h-[42px] items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-[#F7FAFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E44B8]"
          >
            <FileDown className="h-4 w-4 text-[#0E44B8]" aria-hidden="true" />
            <span>Salvar Backup</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex min-h-[42px] items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-[#F7FAFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E44B8]"
          >
            <FileUp className="h-4 w-4 text-[#0E44B8]" aria-hidden="true" />
            <span>Restaurar Backup</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Selecionar arquivo JSON de backup"
          />
          <button
            type="button"
            onClick={onExportCsv}
            className="flex min-h-[42px] items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-[#F7FAFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E44B8]"
          >
            <Download className="h-4 w-4 text-[#0E44B8]" aria-hidden="true" />
            <span>Exportar CSV</span>
          </button>
          <button
            type="button"
            onClick={onRequestReset}
            disabled={paidCount === 0}
            className="flex min-h-[42px] items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-red-200 bg-red-50/70 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Zerar Tudo</span>
          </button>
        </div>

        {backupStatus && (
          <p
            role="status"
            className={`mt-3 rounded-xl border px-3 py-2 text-xs font-medium ${
              backupStatus.ok
                ? 'border-blue-200 bg-blue-50 text-[#0A2E7A]'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {backupStatus.message}
          </p>
        )}
      </section>
    </div>
  );
}
