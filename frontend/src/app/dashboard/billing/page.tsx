"use client";

import { useState } from 'react';

interface Invoice { id: string; date: string; amount: string; status: 'paid'|'pending' }

export default function BillingPage() {
  const [invoices] = useState<Invoice[]>([
    { id: 'INV-1001', date: '2025-09-01', amount: '$120.00', status: 'paid' },
    { id: 'INV-1002', date: '2025-08-15', amount: '$75.00', status: 'paid' },
    { id: 'INV-1003', date: '2025-07-21', amount: '$45.00', status: 'pending' },
  ]);

  function exportCSV() {
    const csv = ['id,date,amount,status', ...invoices.map(i => `${i.id},${i.date},${i.amount},${i.status}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'invoices.csv'; document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Facturación</h1>
          <p className="text-sm text-gray-600">Lista de facturas y recibos.</p>
        </div>
        <div>
          <button onClick={exportCSV} className="px-4 py-2 bg-blue-600 text-white rounded">Exportar CSV</button>
        </div>
      </div>

      <div className="mt-6">
        <table className="w-full text-left">
          <thead>
            <tr className="text-sm text-gray-500">
              <th className="p-2">ID</th>
              <th className="p-2">Fecha</th>
              <th className="p-2">Monto</th>
              <th className="p-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id} className="border-t">
                <td className="p-2 font-medium">{inv.id}</td>
                <td className="p-2">{inv.date}</td>
                <td className="p-2">{inv.amount}</td>
                <td className="p-2">{inv.status === 'paid' ? <span className="text-green-600">Pagada</span> : <span className="text-yellow-600">Pendiente</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
