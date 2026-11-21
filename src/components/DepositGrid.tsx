import { Check } from 'lucide-react';
import {
  DepositItem,
  StatusFilter,
  TIER_VALUES,
  formatCurrencyBRL,
} from '../types/challenge';

interface DepositGridProps {
  deposits: DepositItem[];
  statusFilter: StatusFilter;
  valueFilter: number | null;
  highlightedIndex: number | null;
  paidCount: number;
  pendingCount: number;
  onStatusFilterChange: (next: StatusFilter) => void;
  onValueFilterChange: (next: number | null) => void;
  onToggleDeposit: (index: number) => void;
}

export function DepositGrid({
  deposits,
  statusFilter,
  valueFilter,
  highlightedIndex,
  paidCount,
  pendingCount,
  onStatusFilterChange,
  onValueFilterChange,
  onToggleDeposit,
}: DepositGridProps) {
  const indexedItems = deposits
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => {
      if (statusFilter === 'paid' && !item.pago) return false;
      if (statusFilter === 'pending' && item.pago) return false;
      if (valueFilter !== null && item.valor !== valueFilter) return false;
      return true;
    });

  const hasActiveFilter = statusFilter !== 'all' || valueFilter !== null;

  return (
    <section
      aria-label="Grade dos 100 depósitos"
      className="rounded-2xl border border-blue-100 bg-white p-5 sm:p-6"
    >
      {/* Header and Filter Controls */}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Grade de Depósitos
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Clique em um valor para registrar ou desmarcar o depósito.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 tabular-nums">
            <span>{indexedItems.length} exibidos</span>
            <span aria-hidden="true">·</span>
            <span>{pendingCount} pendentes</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Status segmented control */}
          <div
            role="group"
            aria-label="Filtrar por status"
            className="inline-flex w-full items-center gap-1 rounded-lg bg-[#EEF3FC] p-1 sm:w-auto"
          >
            <button
              type="button"
              onClick={() => onStatusFilterChange('all')}
              className={`min-h-[36px] flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors sm:flex-initial ${
                statusFilter === 'all'
                  ? 'bg-white text-[#0A2E7A] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({deposits.length})
            </button>
            <button
              type="button"
              onClick={() => onStatusFilterChange('pending')}
              className={`min-h-[36px] flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors sm:flex-initial ${
                statusFilter === 'pending'
                  ? 'bg-white text-[#0A2E7A] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pendentes ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => onStatusFilterChange('paid')}
              className={`min-h-[36px] flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors sm:flex-initial ${
                statusFilter === 'paid'
                  ? 'bg-white text-[#0A2E7A] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pagos ({paidCount})
            </button>
          </div>

          {/* Value filter segmented control */}
          <div
            role="group"
            aria-label="Filtrar por valor"
            className="flex items-center gap-1 overflow-x-auto rounded-lg bg-[#EEF3FC] p-1"
          >
            <button
              type="button"
              onClick={() => onValueFilterChange(null)}
              className={`min-h-[36px] shrink-0 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                valueFilter === null
                  ? 'bg-white text-[#0A2E7A] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            {TIER_VALUES.map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() =>
                  onValueFilterChange(valueFilter === tier ? null : tier)
                }
                className={`min-h-[36px] shrink-0 whitespace-nowrap rounded-md px-2.5 py-1.5 font-mono text-xs font-medium tabular-nums transition-colors ${
                  valueFilter === tier
                    ? 'bg-white text-[#0A2E7A] shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                R${tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid or Empty State */}
      {indexedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-slate-900">
            {statusFilter === 'paid'
              ? 'Nenhum depósito pago neste filtro ainda.'
              : 'Todos os depósitos deste filtro já foram pagos.'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Limpe os filtros para visualizar todas as 100 células do desafio.
          </p>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={() => {
                onStatusFilterChange('all');
                onValueFilterChange(null);
              }}
              className="mt-4 min-h-[40px] whitespace-nowrap rounded-lg border border-blue-200 bg-white px-4 py-2 text-xs font-semibold text-[#0A2E7A] transition-colors hover:bg-blue-50"
            >
              Mostrar todos os depósitos
            </button>
          )}
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-5 gap-2 sm:grid-cols-10">
          {indexedItems.map(({ item, index }) => {
            const isHighlighted = highlightedIndex === index;
            const isPaid = item.pago;

            return (
              <button
                key={index}
                type="button"
                onClick={() => onToggleDeposit(index)}
                aria-pressed={isPaid}
                aria-label={`Depósito número ${index + 1} de ${formatCurrencyBRL(
                  item.valor
                )}, ${isPaid ? 'pago' : 'pendente'}`}
                className={`group relative flex min-h-[48px] w-full aspect-square select-none flex-col items-center justify-center rounded-xl border font-mono text-xs font-semibold tabular-nums transition-all duration-150 active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E44B8] focus-visible:ring-offset-2 sm:text-[13px] ${
                  isPaid
                    ? 'border-[#09328E] bg-[#0E44B8] text-white hover:bg-[#0A3696]'
                    : isHighlighted
                    ? 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-400 ring-offset-1 hover:bg-amber-100'
                    : 'border-blue-100 bg-[#F7FAFF] text-slate-800 hover:border-blue-300 hover:bg-white'
                }`}
              >
                {isPaid && (
                  <Check
                    className="absolute right-1 top-1 h-3 w-3 text-amber-300"
                    strokeWidth={3}
                    aria-hidden="true"
                  />
                )}
                {isHighlighted && !isPaid && (
                  <span className="text-[9px] font-sans font-semibold uppercase tracking-wide text-amber-700">
                    Sugerido
                  </span>
                )}
                <span className={isPaid ? 'line-through opacity-95' : ''}>
                  {item.valor}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Quiet Legend */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-2">
            <span
              className="h-3.5 w-3.5 rounded border border-blue-200 bg-[#F7FAFF]"
              aria-hidden="true"
            />
            Pendente
          </span>
          <span className="inline-flex items-center gap-2">
            <span
              className="inline-flex h-3.5 w-3.5 items-center justify-center rounded border border-[#09328E] bg-[#0E44B8] text-amber-300"
              aria-hidden="true"
            >
              <Check className="h-2.5 w-2.5" strokeWidth={3} />
            </span>
            Pago
          </span>
          {highlightedIndex !== null && (
            <span className="inline-flex items-center gap-2">
              <span
                className="h-3.5 w-3.5 rounded border border-amber-500 bg-amber-50 ring-1 ring-amber-400"
                aria-hidden="true"
              />
              Sugerido
            </span>
          )}
        </div>
        <span>Valores em reais (R$) · Salvo localmente</span>
      </div>
    </section>
  );
}
