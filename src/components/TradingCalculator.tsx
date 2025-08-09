'use client';import { useMemo, useState } from 'react';
export default function TradingCalculator(){
  const [account,setAccount]=useState('100000000'); const [riskPct,setRiskPct]=useState('1'); const [entry,setEntry]=useState('1000'); const [stop,setStop]=useState('950'); const [target,setTarget]=useState('1100');
  const p=useMemo(()=>{ const a=+account||0, r=(+riskPct||0)/100, e=+entry||0, s=+stop||0, t=+target||0; const ru=Math.max(0,e-s), wu=Math.max(0,t-e), risk=Math.round(a*r); const size=ru>0?Math.floor(risk/ru):0; const rr=ru>0?wu/ru:0; const exp=size*wu; return {ru,wu,risk,size,rr,exp}; },[account,riskPct,entry,stop,target]);
  return (<div className="rounded-2xl border bg-white p-4 shadow-sm grid gap-3"><h2 className="text-lg font-medium">Kalkulator Risk/Reward</h2>
    <div className="grid md:grid-cols-5 gap-2">
      <input className="border rounded-xl p-2" value={account} onChange={e=>setAccount(e.target.value)} placeholder="Modal (minor unit)"/>
      <input className="border rounded-xl p-2" value={riskPct} onChange={e=>setRiskPct(e.target.value)} placeholder="% Risk"/>
      <input className="border rounded-xl p-2" value={entry} onChange={e=>setEntry(e.target.value)} placeholder="Entry"/>
      <input className="border rounded-xl p-2" value={stop} onChange={e=>setStop(e.target.value)} placeholder="Stop loss"/>
      <input className="border rounded-xl p-2" value={target} onChange={e=>setTarget(e.target.value)} placeholder="Target"/>
    </div>
    <div className="text-sm text-neutral-700">Risk/unit: <b>{p.ru}</b> · Reward/unit: <b>{p.wu}</b> · R:R: <b>{p.rr.toFixed(2)}</b><br/>Risk: <b>{p.risk}</b> · Position size: <b>{p.size}</b> · Potential P&amp;L: <b>{p.exp}</b></div>
  </div>);
}