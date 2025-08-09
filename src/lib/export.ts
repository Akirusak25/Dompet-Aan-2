'use client';import * as XLSX from 'xlsx';import { db } from './db';import { toBase } from './currency';
export async function exportCsvXlsx(){
  const [txs, accs, cats, s] = await Promise.all([db.transactions.toArray(), db.accounts.toArray(), db.categories.toArray(), db.settings.get('singleton')]);
  const accMap = new Map(accs.map(a=>[a.id,a])); const catMap=new Map(cats.map(c=>[c.id,c])); const base=s?.baseCurrency||'IDR';
  const rows = await Promise.all(txs.map(async t=>{ const acc=accMap.get(t.accountId); const cat=catMap.get(t.categoryId);
    const cur=acc?.currency||'IDR'; const { baseAmount } = await toBase(t.amount, cur, base);
    return { date: t.txDate, account: acc?.name||'', category: cat?.name||'', type: t.direction, amount: t.amount, currency: cur, amount_base: baseAmount, base_currency: base, notes: t.note||'', tags:'' };
  }));
  const hdr = Object.keys(rows[0]||{date:'',account:'',category:'',type:'',amount:'',currency:'',amount_base:'',base_currency:'',notes:'',tags:''});
  const csv = [hdr.join(','), ...rows.map(r=>hdr.map(h=>{ const v=(r as any)[h]; return typeof v==='string' && (v.includes(',')||v.includes('"')) ? '"'+v.replace(/"/g,'""')+'"' : String(v); }).join(','))].join('\n');
  const a = document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download='dompet-aan.csv'; a.click();
  const ws=XLSX.utils.json_to_sheet(rows); const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'Transactions'); XLSX.writeFile(wb,'dompet-aan.xlsx');
}