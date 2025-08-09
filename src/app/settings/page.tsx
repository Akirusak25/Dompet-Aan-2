'use client';
import { useEffect, useState } from 'react';
import { db } from '../../lib/db';

export default function SettingsPage(){
  const [baseCurrency,setBaseCurrency]=useState('IDR');
  const [initialCash,setInitialCash]=useState('100000000');
  const [priceCSVUrl,setPriceCSVUrl]=useState('');
  const [indexCSVUrl,setIndexCSVUrl]=useState('');

  useEffect(()=>{(async()=>{
    const s=await db.settings.get('singleton');
    if(!s) await db.settings.put({id:'singleton',baseCurrency:'IDR',locale:'id-ID',initialCash:100000000});
    const ss=await db.settings.get('singleton');
    setBaseCurrency(ss?.baseCurrency??'IDR'); setInitialCash(String(ss?.initialCash??100000000));
    setPriceCSVUrl(ss?.priceCSVUrl??''); setIndexCSVUrl(ss?.indexCSVUrl??'');
  })();},[]);

  async function saveAll(){
    await db.settings.put({id:'singleton',baseCurrency,locale:'id-ID',initialCash:Number(initialCash||0),priceCSVUrl,indexCSVUrl});
    alert('Settings disimpan');
  }

  return (<main className="grid gap-6">
    <h1 className="text-2xl font-semibold">Settings</h1>
    <section className="rounded-2xl border bg-white p-4 shadow-sm grid gap-3">
      <h2 className="font-medium">Base Currency & Modal Awal</h2>
      <div className="grid md:grid-cols-3 gap-2">
        <input className="border rounded-xl p-2" value={baseCurrency} onChange={e=>setBaseCurrency(e.target.value.toUpperCase())} placeholder="Base (IDR)"/>
        <input className="border rounded-xl p-2" value={initialCash} onChange={e=>setInitialCash(e.target.value)} placeholder="Initial cash (minor unit)"/>
        <button onClick={saveAll} className="px-4 py-2 rounded-xl bg-black text-white">Simpan</button>
      </div>
    </section>
    <section className="rounded-2xl border bg-white p-4 shadow-sm grid gap-3">
      <h2 className="font-medium">Harga Saham via Google Sheets (CSV)</h2>
      <p className="text-sm text-neutral-600">Buat Google Sheet dengan kolom <b>symbol, price</b>, publish as CSV, lalu tempel URL di sini.</p>
      <input className="border rounded-xl p-2" value={priceCSVUrl} onChange={e=>setPriceCSVUrl(e.target.value)} placeholder="https://docs.google.com/spreadsheets/..." />
      <button onClick={saveAll} className="px-4 py-2 rounded-xl bg-black text-white">Simpan URL Harga</button>
    </section>
    <section className="rounded-2xl border bg-white p-4 shadow-sm grid gap-3">
      <h2 className="font-medium">Data IHSG (CSV)</h2>
      <p className="text-sm text-neutral-600">CSV kolom <b>date, close</b>. Bisa dari Google Sheets (publish to web).</p>
      <input className="border rounded-xl p-2" value={indexCSVUrl} onChange={e=>setIndexCSVUrl(e.target.value)} placeholder="https://..." />
      <button onClick={saveAll} className="px-4 py-2 rounded-xl bg-black text-white">Simpan URL IHSG</button>
    </section>
  </main>);
}
