'use client';
import { useEffect, useState } from 'react';
import QuickAddSheet from '../components/QuickAddSheet';
import TransactionList from '../components/TransactionList';
import TradingCalculator from '../components/TradingCalculator';
import { db, Account } from '../lib/db';
import Link from 'next/link';

export default function Dashboard(){
  const [accounts,setAccounts]=useState<Account[]>([]);
  const [refresh,setRefresh]=useState(0);
  useEffect(()=>{(async()=>{
    const s=await db.settings.get('singleton'); if(!s) await db.settings.put({id:'singleton',baseCurrency:'IDR',locale:'id-ID',initialCash:100000000});
    setAccounts(await db.accounts.toArray());
  })();},[refresh]);
  return (<main className="grid gap-4">
    <header className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold">Dompet Aan</h1>
      <nav className="flex gap-3 text-sm underline">
        <Link href="/journal">Jurnal</Link>
        <Link href="/portfolio">Grafik</Link>
        <Link href="/settings">Settings</Link>
      </nav>
    </header>
    <QuickAddSheet onSaved={()=>setRefresh(v=>v+1)} />
    <TradingCalculator />
    <section className="grid gap-3">
      <h2 className="text-lg font-medium">Transaksi Terbaru</h2>
      <TransactionList refreshKey={refresh} />
    </section>
  </main>);
}
