'use client';
import { useEffect, useState } from 'react';
import { db, uid, Account, Category } from '../lib/db';
import { parseMoneyInput } from '../lib/currency';

export default function QuickAddSheet({ onSaved }:{ onSaved?:()=>void }){
  const [accounts,setAccounts]=useState<Account[]>([]); const [categories,setCategories]=useState<Category[]>([]);
  const [direction,setDirection]=useState<'in'|'out'>('out'); const [amount,setAmount]=useState('');
  const [accountId,setAccountId]=useState(''); const [categoryId,setCategoryId]=useState(''); const [note,setNote]=useState('');
  useEffect(()=>{(async()=>{
    if(await db.accounts.count()===0){ await db.accounts.bulkAdd([
      { id: uid(), name: 'Cash', type: 'cash', currency: 'IDR', openingBalance: 0, createdAt: Date.now(), updatedAt: Date.now() },
      { id: uid(), name: 'BCA', type: 'bank', currency: 'IDR', openingBalance: 0, createdAt: Date.now(), updatedAt: Date.now() },
    ]);}
    if(await db.categories.count()===0){ const now=Date.now(); const mk=(name:string,kind:'income'|'expense',color:string,icon:string):Category=>({id:uid(),name,kind,color,icon,createdAt:now,updatedAt:now}); await db.categories.bulkAdd([
      mk('Makan','expense','#ef4444','UtensilsCrossed'), mk('Transport','expense','#3b82f6','Car'), mk('Belanja','expense','#9333ea','ShoppingBag'), mk('Gaji','income','#16a34a','Wallet')
    ]);}
    const accs=await db.accounts.toArray(); const cats=await db.categories.toArray(); setAccounts(accs); setCategories(cats);
    setAccountId(accs[0]?.id||''); setCategoryId(cats.find(c=>c.kind==='expense')?.id||'');
  })();},[]);
  async function save(){ const acc=await db.accounts.get(accountId); if(!acc) return alert('Pilih akun'); const cat=await db.categories.get(categoryId); if(!cat) return alert('Pilih kategori');
    const amt=parseMoneyInput(amount, acc.currency); if(!amt) return alert('Nominal belum diisi');
    await db.transactions.add({ id: uid(), txDate: new Date().toISOString().slice(0,10), amount: amt, direction, categoryId: cat.id, accountId: acc.id, note: note||undefined, createdAt: Date.now(), updatedAt: Date.now() });
    setAmount(''); setNote(''); onSaved?.();
  }
  const catOps=categories.filter(c=>direction==='out'?c.kind==='expense':c.kind==='income');
  return (<div className="rounded-2xl border bg-white p-4 shadow-sm mb-4">
    <div className="flex gap-2 mb-3">
      <button onClick={()=>setDirection('out')} className={`px-3 py-2 rounded-xl border ${direction==='out'?'bg-red-50 border-red-300':'bg-white'}`}>Pengeluaran</button>
      <button onClick={()=>setDirection('in')} className={`px-3 py-2 rounded-xl border ${direction==='in'?'bg-green-50 border-green-300':'bg-white'}`}>Pemasukan</button>
    </div>
    <div className="grid gap-3 md:grid-cols-2">
      <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Nominal (35k)" className="w-full rounded-xl border p-3"/>
      <select value={accountId} onChange={e=>setAccountId(e.target.value)} className="w-full rounded-xl border p-3">{accounts.map(a=><option key={a.id} value={a.id}>{a.name} · {a.currency}</option>)}</select>
      <select value={categoryId} onChange={e=>setCategoryId(e.target.value)} className="w-full rounded-xl border p-3">{catOps.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
      <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Catatan (opsional)" className="w-full rounded-xl border p-3"/>
    </div>
    <div className="mt-3"><button onClick={save} className="px-4 py-2 rounded-xl bg-black text-white">Simpan</button></div>
  </div>);
}