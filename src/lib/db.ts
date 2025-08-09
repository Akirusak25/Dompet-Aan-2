import Dexie, { Table } from 'dexie';
export type UUID = string; export type Money = number;
export interface Settings { id: 'singleton'; baseCurrency: string; locale: string; initialCash: number; priceCSVUrl?: string; indexCSVUrl?: string; }
export interface Account { id: UUID; name: string; type: 'cash'|'ewallet'|'bank'; currency: string; openingBalance: Money; createdAt: number; updatedAt: number; }
export interface Category { id: UUID; name: string; kind: 'income'|'expense'; color: string; icon: string; createdAt: number; updatedAt: number; }
export interface Transaction { id: UUID; txDate: string; amount: Money; direction: 'in'|'out'; categoryId: UUID; accountId: UUID; note?: string; isTransfer?: boolean; transferPeerTxId?: UUID|null; fxRateToBase?: number; baseAmount?: Money; createdAt: number; updatedAt: number; }
export interface Tag { id: UUID; name: string; } export interface TagMap { id: UUID; txId: UUID; tagId: UUID; }
export interface Budget { id: UUID; periodStart: string; periodEnd: string; categoryId: UUID; amount: Money; alertThreshold: number; }
export interface FxRate { id: UUID; date: string; from: string; to: string; rate: number; createdAt: number; }
export interface JournalTrade { id: UUID; date: string; symbol: string; side: 'buy'|'sell'; qty: number; entry: Money; stopLoss?: Money; trailingPercent?: number; fee?: Money; exitDate?: string; exitPrice?: Money; note?: string; createdAt: number; updatedAt: number; }
export interface EquitySnapshot { id: UUID; date: string; equity: Money; }
export class AppDB extends Dexie {
  settings!: Table<Settings, string>; accounts!: Table<Account, string>; categories!: Table<Category, string>;
  transactions!: Table<Transaction, string>; tags!: Table<Tag, string>; tagMaps!: Table<TagMap, string>;
  budgets!: Table<Budget, string>; fxRates!: Table<FxRate, string>; journal!: Table<JournalTrade, string>; equity!: Table<EquitySnapshot, string>;
  constructor(){ super('dompet-aan');
    this.version(3).stores({
      settings:'id', accounts:'id, name, type, currency, createdAt, updatedAt', categories:'id, name, kind, createdAt, updatedAt',
      transactions:'id, txDate, direction, categoryId, accountId, createdAt, updatedAt, isTransfer',
      tags:'id, name', tagMaps:'id, txId, tagId', budgets:'id, periodStart, periodEnd, categoryId',
      fxRates:'id, date, from, to', journal:'id, date, symbol', equity:'id, date'
    });
  }
}
export const db = new AppDB(); export const uid = () => (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));