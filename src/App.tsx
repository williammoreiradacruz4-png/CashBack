import { useState } from 'react';
import { Undo2 } from 'lucide-react';
import { ConfirmModal } from './components/ConfirmModal';
import { DepositGrid } from './components/DepositGrid';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { ProgressSummaryCard, SidebarTools } from './components/SummarySidebar';
import { useDepositChallenge } from './hooks/useDepositChallenge';
import { DrawBudget, StatusFilter, formatCurrencyBRL } from './types/challenge';

type ModalAction = 'shuffle' | 'reset' | null;

export default function App() {
  const {
    deposits,
    stats,
    highlightedIndex,
    lastAction,
    toggleDeposit,
    undoLastAction,
    shuffleDeposits,
    resetDeposits,
    restoreDefaultOrder,
    drawRandomPending,
    clearHighlight,
    markHighlightedPaid,
    exportCsv,
    exportBackup,
    importBackup,
  } = useDepositChallenge();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [valueFilter, setValueFilter] = useState<number | null>(null);
  const [drawBudget, setDrawBudget] = useState<DrawBudget>('any');
  const [noBudgetMatch, setNoBudgetMatch] = useState(false);
  const [modalAction, setModalAction] = useState<ModalAction>(null);
  const [backupStatus, setBackupStatus] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const handleImportBackup = async (file: File) => {
    const result = await importBackup(file);
    setBackupStatus(result);
    window.setTimeout(() => {
      setBackupStatus((curr) => (curr === result ? null : curr));
    }, 4500);
  };

  const handleDrawRandom = () => {
    const picked = drawRandomPending(drawBudget);
    setNoBudgetMatch(picked === null && !stats.isComplete);
    if (picked !== null) {
      setStatusFilter('all');
      setValueFilter(null);
    }
  };

  const handleDrawBudgetChange = (nextBudget: DrawBudget) => {
    setDrawBudget(nextBudget);
    setNoBudgetMatch(false);
  };

  const handleToggleTierFilter = (tier: number) => {
    setValueFilter((curr) => (curr === tier ? null : tier));
  };

  const handleConfirmModal = () => {
    if (modalAction === 'shuffle') {
      shuffleDeposits();
    } else if (modalAction === 'reset') {
      resetDeposits();
    }
    setModalAction(null);
  };

  const highlightedItem =
    highlightedIndex !== null ? deposits[highlightedIndex] ?? null : null;

  return (
    <div className="min-h-screen bg-[#F3F6FC] text-slate-900">
      {/* Deep Royal Blue Top Bar matching Emblem & PWA theme-color */}
      <header className="border-b border-[#072059] bg-[#0A2E7A] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:gap-8 sm:px-6">
          <a
            href="#top"
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 font-display text-lg font-bold tracking-tight text-white"
          >
            <img
              src="/assets/aistudio/Desafio_do_100_Dep_sito_e793cbe3.png"
              alt="Emblema CashBack Desafio dos 100 Depósitos"
              referrerPolicy="no-referrer"
              className="h-9 w-auto shrink-0 object-contain"
            />
            <span>CashBack</span>
          </a>

          <div className="flex items-center gap-2 shrink-0 sm:gap-3">
            <PWAInstallButton />
            <button
              type="button"
              disabled={stats.isComplete}
              onClick={handleDrawRandom}
              className="min-h-[40px] whitespace-nowrap shrink-0 rounded-lg bg-amber-400 px-3.5 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A2E7A] sm:px-4"
            >
              <span className="sm:hidden">Sortear</span>
              <span className="hidden sm:inline">Sortear depósito</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="top" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Page Heading */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/assets/aistudio/Desafio_do_100_Dep_sito_e793cbe3.png"
              alt="Emblema Desafio do 100 Depósito"
              referrerPolicy="no-referrer"
              className="hidden h-14 w-auto shrink-0 object-contain sm:block"
            />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#0A2E7A] sm:text-3xl [text-wrap:balance]">
                Desafio dos 100 Depósitos
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600 sm:text-sm">
                <span>100 depósitos</span>
                <span aria-hidden="true">·</span>
                <span>R$ 30 a R$ 100</span>
                <span aria-hidden="true">·</span>
                <span>Meta de R$ 6.000</span>
              </div>
            </div>
          </div>

          {lastAction && (
            <button
              type="button"
              onClick={undoLastAction}
              className="inline-flex min-h-[40px] self-start items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-blue-200 bg-white px-3.5 py-2 text-xs font-medium text-[#0A2E7A] transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E44B8] sm:self-auto"
            >
              <Undo2 className="h-3.5 w-3.5 text-[#0E44B8]" aria-hidden="true" />
              <span>
                Desfazer último ({formatCurrencyBRL(lastAction.valor)})
              </span>
            </button>
          )}
        </div>

        {/* Responsive Workspace Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <ProgressSummaryCard
            totalSaved={stats.totalSaved}
            remaining={stats.remaining}
            percentExact={stats.percentExact}
            percentRounded={stats.percentRounded}
            paidCount={stats.paidCount}
            totalCount={stats.totalCount}
            isComplete={stats.isComplete}
          />

          <div className="self-start lg:col-span-8 lg:col-start-1 lg:row-start-1 lg:row-span-2">
            <DepositGrid
              deposits={deposits}
              statusFilter={statusFilter}
              valueFilter={valueFilter}
              highlightedIndex={highlightedIndex}
              paidCount={stats.paidCount}
              pendingCount={stats.pendingCount}
              onStatusFilterChange={setStatusFilter}
              onValueFilterChange={setValueFilter}
              onToggleDeposit={toggleDeposit}
            />
          </div>

          <SidebarTools
            paidCount={stats.paidCount}
            isComplete={stats.isComplete}
            tierStats={stats.tierStats}
            valueFilter={valueFilter}
            drawBudget={drawBudget}
            highlightedIndex={highlightedIndex}
            highlightedItem={highlightedItem}
            noBudgetMatch={noBudgetMatch}
            onDrawBudgetChange={handleDrawBudgetChange}
            onDrawRandom={handleDrawRandom}
            onMarkHighlightedPaid={markHighlightedPaid}
            onClearHighlight={clearHighlight}
            onToggleTierFilter={handleToggleTierFilter}
            onRequestShuffle={() => setModalAction('shuffle')}
            onRestoreOrder={restoreDefaultOrder}
            onExportCsv={exportCsv}
            onExportBackup={exportBackup}
            onImportBackup={handleImportBackup}
            backupStatus={backupStatus}
            onRequestReset={() => setModalAction('reset')}
          />
        </div>
      </main>

      <OfflineIndicator />

      {/* Accessible Confirmation Modal */}
      <ConfirmModal
        isOpen={modalAction !== null}
        title={
          modalAction === 'shuffle'
            ? 'Embaralhar posições da grade?'
            : 'Zerar todos os depósitos?'
        }
        description={
          modalAction === 'shuffle'
            ? 'A ordem das 100 células será misturada aleatoriamente. Os depósitos já marcados como pagos continuam salvos.'
            : 'Todos os depósitos marcados como pagos serão desmarcados e o total guardado voltará para R$ 0.'
        }
        confirmLabel={
          modalAction === 'shuffle' ? 'Embaralhar agora' : 'Zerar tudo'
        }
        tone={modalAction === 'reset' ? 'danger' : 'neutral'}
        onConfirm={handleConfirmModal}
        onCancel={() => setModalAction(null)}
      />
    </div>
  );
}
