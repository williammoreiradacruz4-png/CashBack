import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DepositItem,
  DrawBudget,
  GOAL_AMOUNT,
  INITIAL_DISTRIBUTION,
  LEGACY_STORAGE_KEY,
  LastAction,
  STORAGE_KEY,
  TIER_VALUES,
  TierStat,
} from '../types/challenge';

function createInitialDeposits(): DepositItem[] {
  return INITIAL_DISTRIBUTION.map((valor) => ({ valor, pago: false }));
}

function isValidDepositsArray(parsed: unknown): parsed is DepositItem[] {
  if (!Array.isArray(parsed) || parsed.length !== INITIAL_DISTRIBUTION.length) {
    return false;
  }
  return parsed.every(
    (item): item is DepositItem =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as DepositItem).valor === 'number' &&
      Number.isFinite((item as DepositItem).valor) &&
      (item as DepositItem).valor > 0 &&
      typeof (item as DepositItem).pago === 'boolean'
  );
}

function loadStoredDeposits(): DepositItem[] {
  try {
    const raw =
      window.localStorage.getItem(STORAGE_KEY) ??
      window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return createInitialDeposits();
    const parsed: unknown = JSON.parse(raw);
    return isValidDepositsArray(parsed) ? parsed : createInitialDeposits();
  } catch {
    return createInitialDeposits();
  }
}

export function useDepositChallenge() {
  const [deposits, setDeposits] = useState<DepositItem[]>(() => loadStoredDeposits());
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [lastAction, setLastAction] = useState<LastAction | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(deposits));
    } catch {
      // Ignore storage quota errors gracefully
    }
  }, [deposits]);

  const toggleDeposit = useCallback((index: number) => {
    setDeposits((prev) => {
      const current = prev[index];
      if (!current) return prev;
      setLastAction({
        index,
        valor: current.valor,
        previousPaid: current.pago,
      });
      const next = [...prev];
      next[index] = { ...current, pago: !current.pago };
      return next;
    });
    setHighlightedIndex((curr) => (curr === index ? null : curr));
  }, []);

  const undoLastAction = useCallback(() => {
    if (!lastAction) return;
    setDeposits((prev) => {
      const current = prev[lastAction.index];
      if (!current) return prev;
      const next = [...prev];
      next[lastAction.index] = { ...current, pago: lastAction.previousPaid };
      return next;
    });
    setLastAction(null);
  }, [lastAction]);

  const shuffleDeposits = useCallback(() => {
    setDeposits((prev) => {
      const next = [...prev];
      for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
      }
      return next;
    });
    setHighlightedIndex(null);
    setLastAction(null);
  }, []);

  const resetDeposits = useCallback(() => {
    setDeposits((prev) => prev.map((item) => ({ ...item, pago: false })));
    setHighlightedIndex(null);
    setLastAction(null);
  }, []);

  const restoreDefaultOrder = useCallback(() => {
    setDeposits((prev) => {
      const paidPool = new Map<number, number>();
      for (const item of prev) {
        if (item.pago) {
          paidPool.set(item.valor, (paidPool.get(item.valor) ?? 0) + 1);
        }
      }
      return INITIAL_DISTRIBUTION.map((valor) => {
        const remainingPaid = paidPool.get(valor) ?? 0;
        if (remainingPaid > 0) {
          paidPool.set(valor, remainingPaid - 1);
          return { valor, pago: true };
        }
        return { valor, pago: false };
      });
    });
    setHighlightedIndex(null);
    setLastAction(null);
  }, []);

  const drawRandomPending = useCallback(
    (budget: DrawBudget = 'any'): number | null => {
      const candidates: number[] = [];
      deposits.forEach((item, index) => {
        if (item.pago) return;
        if (budget === 'up_to_50' && item.valor > 50) return;
        if (budget === '75_plus' && item.valor < 75) return;
        candidates.push(index);
      });

      if (candidates.length === 0) {
        setHighlightedIndex(null);
        return null;
      }

      const filtered =
        candidates.length > 1 && highlightedIndex !== null
          ? candidates.filter((idx) => idx !== highlightedIndex)
          : candidates;

      const chosen = filtered[Math.floor(Math.random() * filtered.length)];
      setHighlightedIndex(chosen);
      return chosen;
    },
    [deposits, highlightedIndex]
  );

  const clearHighlight = useCallback(() => {
    setHighlightedIndex(null);
  }, []);

  const markHighlightedPaid = useCallback(() => {
    if (highlightedIndex === null) return;
    const target = deposits[highlightedIndex];
    if (!target || target.pago) {
      setHighlightedIndex(null);
      return;
    }
    toggleDeposit(highlightedIndex);
  }, [deposits, highlightedIndex, toggleDeposit]);

  const exportCsv = useCallback(() => {
    const header = 'Numero,Valor (R$),Status';
    const rows = deposits.map(
      (item, idx) => `${idx + 1},${item.valor},${item.pago ? 'Pago' : 'Pendente'}`
    );
    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'desafio-6000-depositos.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [deposits]);

  const exportBackup = useCallback(() => {
    const data = JSON.stringify(deposits);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-cashback-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [deposits]);

  const importBackup = useCallback(
    async (file: File): Promise<{ ok: boolean; message: string }> => {
      try {
        const text = await file.text();
        const parsed: unknown = JSON.parse(text);
        if (!isValidDepositsArray(parsed)) {
          return { ok: false, message: 'Arquivo de backup inválido.' };
        }
        setDeposits(parsed.map((item) => ({ valor: item.valor, pago: item.pago })));
        setHighlightedIndex(null);
        setLastAction(null);
        return { ok: true, message: 'Backup restaurado com sucesso!' };
      } catch {
        return { ok: false, message: 'Erro ao ler o arquivo.' };
      }
    },
    []
  );

  const stats = useMemo(() => {
    let totalSaved = 0;
    let paidCount = 0;
    const tierMap = new Map<number, { paidCount: number; totalCount: number }>();

    for (const tier of TIER_VALUES) {
      tierMap.set(tier, { paidCount: 0, totalCount: 0 });
    }

    for (const item of deposits) {
      const currentTier = tierMap.get(item.valor) ?? { paidCount: 0, totalCount: 0 };
      currentTier.totalCount += 1;
      if (item.pago) {
        totalSaved += item.valor;
        paidCount += 1;
        currentTier.paidCount += 1;
      }
      tierMap.set(item.valor, currentTier);
    }

    const remaining = Math.max(0, GOAL_AMOUNT - totalSaved);
    const percentExact = (totalSaved / GOAL_AMOUNT) * 100;
    const percentRounded = Math.round(percentExact);
    const pendingCount = deposits.length - paidCount;

    const tierStats: TierStat[] = TIER_VALUES.map((valor) => {
      const entry = tierMap.get(valor) ?? { paidCount: 0, totalCount: 0 };
      return {
        valor,
        paidCount: entry.paidCount,
        totalCount: entry.totalCount,
        savedAmount: entry.paidCount * valor,
        targetAmount: entry.totalCount * valor,
      };
    });

    return {
      totalSaved,
      remaining,
      percentExact,
      percentRounded,
      paidCount,
      pendingCount,
      totalCount: deposits.length,
      tierStats,
      isComplete: paidCount === deposits.length,
    };
  }, [deposits]);

  return {
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
  };
}
