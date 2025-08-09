'use client';
import { useEffect, useMemo, useState } from 'react';
import { db } from '../lib/db';
import { recordTodayEquity, listEquitySeries, computeCurrentEquity } from '../lib/portfolio';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function PortfolioChart(){
  const [series,setSeries]=useState<{date:string,equity:number}[]>([]);
  const [idx,setIdx]=useState<{date:string,close:number}[]>([]);

  useEffect(()=>{(async()=>{
    const eq=await listEquitySeries(); setSeries(eq.map(e=>({date:e.date,equity:e.equity})));
    const s=await db.settings.get('singleton'); if(s?.indexCSVUrl){ const res=await fetch('/api/proxy?src='+encodeURIComponent(s.indexCSVUrl)); if(res.ok){ const text=await res.text(); const rows=text.trim().split(/\r?\n/).map(l=>l.split(',')); const h=rows[0].map(x=>x.trim().toLowerCase()); const di=h.findIndex(x=>x.includes('date')); const ci=h.findIndex(x=>x.includes('close')||x.includes('price')); const data=rows.slice(1).map(c=>({date:c[di],close:Number(c[ci])})).filter(r=>r.date&&isFinite(r.close)); setIdx(data); }}
  })();},[]);

  const data = useMemo(()=>{
    if(!series.length) return [];
    const startEq=series[0].equity||1; const idxStart=idx.length?idx[0].close:1; const m=new Map(idx.map(i=>[i.date,i.close]));
    return series.map(s=>({ date:s.date, portfolio:(s.equity/startEq)*100, ihsg: m.has(s.date)&&idxStart? (m.get(s.date)!/idxStart)*100 : null }));
  },[series,idx]);

  return (<div className="rounded-2xl border bg-white p-4 shadow-sm grid gap-3">
    <div className="flex gap-2"><button onClick={async()=>{await recordTodayEquity(); const eq=await listEquitySeries(); setSeries(eq.map(e=>({date:e.date,equity:e.equity})));}} className="px-3 py-2 rounded-xl bg-black text-white">Rekam Equity Hari Ini</button><button onClick={async()=>{const cur=await computeCurrentEquity(); alert('Equity saat ini: '+cur);}} className="px-3 py-2 rounded-xl border">Hitung Equity</button></div>
    <div style={{width:'100%',height:320}}><ResponsiveContainer><LineChart data={data}><XAxis dataKey="date"/><YAxis/><Tooltip/><Legend/><Line type="monotone" dataKey="portfolio" name="Portofolio (Index=100)" dot={false}/><Line type="monotone" dataKey="ihsg" name="IHSG (Index=100)" dot={false}/></LineChart></ResponsiveContainer></div>
  </div>);
}