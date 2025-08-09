'use client';
import { useEffect, useState } from 'react';
import { db, JournalTrade, uid } from '../lib/db';
import { fetchPricesFromSheet } from '../lib/pricing';

export default function TradingJournal(){
  const [rows,setRows]=useState<JournalTrade[]>([]);
  const [prices,setPrices]=useState<Record<string, number>>({});
  const [lastUpdated,setLastUpdated]=useState<string>('—');

  const [date,setDate]=useState(()=>new Date().toISOString().slice(0,10));
  const [symbol,setSymbol]=useState('BBCA.JK');
  const [side,setSide]=useState<'buy'|'sell'>('buy');
  const [qty,setQty]=useState('100');
  const [entry,setEntry]=useState('1000');
  const [stopLoss,setStopLoss]=useState('950');
  const [trailingPercent,setTrailingPercent]=useState('5');
  const [fee,setFee]=useState('0');
  const [note,setNote]=useState('');

  useEffect(()=>{(async()=>{
    setRows(await db.journal.orderBy('date').reverse().toArray());
    await refreshPrices();
  })();},[]);

  useEffect(()=>{ const id=setInterval(()=>{refreshPrices();},5*60*1000); return ()=>clearInterval(id); },[]);

  async function refreshPrices(){ const p=await fetchPricesFromSheet(); setPrices(p); setLastUpdated(new Date().toLocaleString('id-ID')); }

  async function addRow(){ const r:JournalTrade={ id:uid(), date, symbol:symbol.toUpperCase(), side, qty:Number(qty), entry:Math.round(Number(entry)), stopLoss:stopLoss?Math.round(Number(stopLoss)):undefined, trailingPercent:trailingPercent?Number(trailingPercent):undefined, fee:fee?Math.round(Number(fee)):0, note: note||undefined, createdAt:Date.now(), updatedAt:Date.now() }; await db.journal.add(r); setRows(await db.journal.orderBy('date').reverse().toArray()); }
  async function delRow(id:string){ await db.journal.delete(id); setRows(await db.journal.orderBy('date').reverse().toArray()); }

  return (<div className="grid gap-4">
    <div className="rounded-2xl border bg-white p-4 shadow-sm grid gap-3">
      <h2 className="text-lg font-medium">Tambah Entri Jurnal</h2>
      <div className="grid md:grid-cols-5 gap-2">
        <input type="date" className="border rounded-xl p-2" value={date} onChange={e=>setDate(e.target.value)}/>
        <input className="border rounded-xl p-2" placeholder="Symbol (BBCA.JK)" value={symbol} onChange={e=>setSymbol(e.target.value)}/>
        <select className="border rounded-xl p-2" value={side} onChange={e=>setSide(e.target.value as any)}><option value="buy">Buy</option><option value="sell">Sell</option></select>
        <input className="border rounded-xl p-2" placeholder="Qty" value={qty} onChange={e=>setQty(e.target.value)}/>
        <input className="border rounded-xl p-2" placeholder="Entry" value={entry} onChange={e=>setEntry(e.target.value)}/>
        <input className="border rounded-xl p-2" placeholder="Stop Loss" value={stopLoss} onChange={e=>setStopLoss(e.target.value)}/>
        <input className="border rounded-xl p-2" placeholder="Trailing % (opsional)" value={trailingPercent} onChange={e=>setTrailingPercent(e.target.value)}/>
        <input className="border rounded-xl p-2" placeholder="Fee (opsional)" value={fee} onChange={e=>setFee(e.target.value)}/>
        <input className="border rounded-xl p-2 md:col-span-2" placeholder="Catatan (opsional)" value={note} onChange={e=>setNote(e.target.value)}/>
      </div>
      <div className="flex gap-2">
        <button onClick={addRow} className="px-4 py-2 rounded-xl bg-black text-white">Simpan</button>
        <button onClick={refreshPrices} className="px-4 py-2 rounded-xl border">Refresh Harga</button>
        <span className="text-xs text-neutral-500 self-center">Terakhir: {lastUpdated}</span>
      </div>
    </div>

    <div className="rounded-2xl border bg-white p-2 md:p-4 shadow-sm overflow-x-auto">
      <table className="w-full text-sm"><thead><tr className="text-left text-neutral-500">
        <th className="p-2">Tanggal</th><th className="p-2">Symbol</th><th className="p-2">Side</th><th className="p-2">Qty</th><th className="p-2">Entry</th><th className="p-2">Stop</th><th className="p-2">Trailing %</th><th className="p-2">Last</th><th className="p-2">Unreal P&L</th><th className="p-2">Aksi</th>
      </tr></thead><tbody>
      {rows.map(r=>{ const last = prices[r.symbol]; const pnl = typeof last==='number' ? (r.side==='buy' ? (last - r.entry)*r.qty : (r.entry - last)*r.qty) : undefined;
        return (<tr key={r.id} className="border-t">
          <td className="p-2">{r.date}</td><td className="p-2">{r.symbol}</td><td className="p-2">{r.side}</td><td className="p-2">{r.qty}</td>
          <td className="p-2">{r.entry}</td><td className="p-2">{r.stopLoss??'—'}</td><td className="p-2">{r.trailingPercent??'—'}</td>
          <td className="p-2">{typeof last==='number'? last : '—'}</td>
          <td className={`p-2 ${typeof pnl==='number' && pnl<0 ? 'text-red-600':'text-green-700'}`}>{typeof pnl==='number'? Math.round(pnl) : '—'}</td>
          <td className="p-2"><button onClick={()=>delRow(r.id)} className="text-xs underline">hapus</button></td>
        </tr>);
      })}
      {rows.length===0&&(<tr><td className="p-4 text-center text-neutral-500" colSpan={10}>Belum ada entri</td></tr>)}
      </tbody></table>
    </div>
  </div>);
}