'use client';
import { useEffect, useState } from 'react'; import { db } from '../lib/db'; import { formatMoney } from '../lib/currency';
type Row = { id:string; date:string; account:string; currency:string; category:string; direction:'in'|'out'; amount:number; note?:string; };
export default function TransactionList({ refreshKey=0 }:{ refreshKey?:number }){
  const [rows,setRows]=useState<Row[]>([]);
  useEffect(()=>{(async()=>{
    const [txs,accs,cats]=await Promise.all([db.transactions.orderBy('createdAt').reverse().toArray(), db.accounts.toArray(), db.categories.toArray()]);
    const accMap=new Map(accs.map(a=>[a.id,a])); const catMap=new Map(cats.map(c=>[c.id,c]));
    setRows(txs.map(t=>({ id:t.id, date:t.txDate, account: accMap.get(t.accountId)?.name||'—', currency: accMap.get(t.accountId)?.currency||'IDR', category: catMap.get(t.categoryId)?.name||'—', direction:t.direction, amount:t.amount, note:t.note })));
  })();},[refreshKey]);
  async function remove(id:string){ await db.transactions.delete(id); setRows(r=>r.filter(x=>x.id!==id)); }
  return (<div className="rounded-2xl border bg-white p-2 md:p-4 shadow-sm overflow-x-auto">
    <table className="w-full text-sm"><thead><tr className="text-left text-neutral-500"><th className="p-2">Tanggal</th><th className="p-2">Akun</th><th className="p-2">Kategori</th><th className="p-2">Nominal</th><th className="p-2">Catatan</th><th className="p-2"></th></tr></thead>
    <tbody>{rows.map(r=>(<tr key={r.id} className="border-t"><td className="p-2">{r.date}</td><td className="p-2">{r.account} · {r.currency}</td><td className="p-2">{r.category}</td><td className={`p-2 ${r.direction==='out'?'text-red-600':'text-green-700'}`}>{r.direction==='out'?'-':'+'} {formatMoney(r.amount,r.currency)}</td><td className="p-2">{r.note||'—'}</td><td className="p-2 text-right"><button onClick={()=>remove(r.id)} className="text-xs underline">hapus</button></td></tr>))}
    {rows.length===0&&(<tr><td className="p-4 text-center text-neutral-500" colSpan={6}>Belum ada transaksi</td></tr>)}
    </tbody></table></div>);
}