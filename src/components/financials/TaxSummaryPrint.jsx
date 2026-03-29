import React from 'react';
import { format } from 'date-fns';

// Print-optimised tax summary sheet — rendered hidden, printed via CSS
export default function TaxSummaryPrint({ data, month, year, companyName }) {
  const fmt = (n) => `£${(n || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div id="tax-summary-print" style={{ display: 'none' }}>
      <style>{`
        @media print {
          body > *:not(#tax-summary-print) { display: none !important; }
          #tax-summary-print { display: block !important; font-family: 'Arial', sans-serif; padding: 32px; color: #111; }
          .print-header { border-bottom: 3px solid #1e3a5f; padding-bottom: 16px; margin-bottom: 24px; }
          .print-logo { font-size: 22px; font-weight: 700; color: #1e3a5f; }
          .print-title { font-size: 16px; color: #475569; margin-top: 4px; }
          .print-meta { font-size: 12px; color: #64748b; margin-top: 2px; }
          .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #1e3a5f; margin: 20px 0 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 8px; }
          th { background: #f1f5f9; padding: 8px 10px; text-align: left; font-weight: 600; font-size: 11px; }
          td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; }
          .total-row td { font-weight: 700; background: #f8fafc; border-top: 2px solid #1e3a5f; }
          .net-row td { font-weight: 700; font-size: 14px; background: #1e3a5f; color: white; }
          .right { text-align: right; }
          .green { color: #166534; }
          .red { color: #991b1b; }
          .disclaimer { margin-top: 32px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
          .summary-box { display: flex; gap: 16px; margin-bottom: 20px; }
          .summary-item { flex: 1; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; }
          .summary-item .label { font-size: 10px; text-transform: uppercase; color: #64748b; letter-spacing: 1px; }
          .summary-item .value { font-size: 18px; font-weight: 700; margin-top: 4px; }
        }
      `}</style>

      <div className="print-header">
        <div className="print-logo">Premiso</div>
        <div className="print-title">Monthly Tax-Ready Financial Summary</div>
        <div className="print-meta">
          Period: {month} {year} &nbsp;|&nbsp; Generated: {format(new Date(), 'dd MMM yyyy HH:mm')}
          {companyName && <> &nbsp;|&nbsp; Company: {companyName}</>}
        </div>
      </div>

      {/* KPI Summary boxes */}
      <div className="summary-box">
        <div className="summary-item">
          <div className="label">Gross Rental Income</div>
          <div className="value green">{fmt(data.totalIncome)}</div>
        </div>
        <div className="summary-item">
          <div className="label">Total Allowable Expenses</div>
          <div className="value red">{fmt(data.totalExpenses)}</div>
        </div>
        <div className="summary-item">
          <div className="label">Pending / Unpaid</div>
          <div className="value" style={{ color: '#92400e' }}>{fmt(data.totalPending)}</div>
        </div>
        <div className="summary-item">
          <div className="label">Net Taxable Profit</div>
          <div className="value" style={{ color: data.netProfit >= 0 ? '#166534' : '#991b1b' }}>{fmt(data.netProfit)}</div>
        </div>
      </div>

      {/* Income by Property */}
      <div className="section-title">Rental Income — By Property</div>
      <table>
        <thead>
          <tr>
            <th>Property</th>
            <th className="right">Transactions</th>
            <th className="right">Amount (£)</th>
          </tr>
        </thead>
        <tbody>
          {data.incomeByProperty.map((row, i) => (
            <tr key={i}>
              <td>{row.name}</td>
              <td className="right">{row.count}</td>
              <td className="right green">{fmt(row.amount)}</td>
            </tr>
          ))}
          <tr className="total-row">
            <td>TOTAL INCOME</td>
            <td className="right">{data.incomeByProperty.reduce((s, r) => s + r.count, 0)}</td>
            <td className="right">{fmt(data.totalIncome)}</td>
          </tr>
        </tbody>
      </table>

      {/* Expenses by Category */}
      <div className="section-title">Allowable Expenses — By Category (Paid)</div>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th className="right">Transactions</th>
            <th className="right">Amount (£)</th>
          </tr>
        </thead>
        <tbody>
          {data.expenseByType.map((row, i) => (
            <tr key={i}>
              <td>{row.name}</td>
              <td className="right">{row.count}</td>
              <td className="right red">{fmt(row.amount)}</td>
            </tr>
          ))}
          <tr className="total-row">
            <td>TOTAL EXPENSES</td>
            <td className="right">{data.expenseByType.reduce((s, r) => s + r.count, 0)}</td>
            <td className="right">{fmt(data.totalExpenses)}</td>
          </tr>
        </tbody>
      </table>

      {/* Pending Expenses */}
      {data.pendingExpenses.length > 0 && (
        <>
          <div className="section-title">Pending / Unpaid Expenses (Not yet deductible)</div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Property</th>
                <th>Due Date</th>
                <th className="right">Amount (£)</th>
              </tr>
            </thead>
            <tbody>
              {data.pendingExpenses.map((row, i) => (
                <tr key={i}>
                  <td>{row.description}</td>
                  <td>{row.property}</td>
                  <td>{row.due_date || '—'}</td>
                  <td className="right">{fmt(row.amount)}</td>
                </tr>
              ))}
              <tr className="total-row">
                <td colSpan={3}>TOTAL PENDING</td>
                <td className="right">{fmt(data.totalPending)}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      {/* Transaction Detail */}
      <div className="section-title">Full Transaction Log</div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Type</th>
            <th>Status</th>
            <th className="right">Income (£)</th>
            <th className="right">Expense (£)</th>
          </tr>
        </thead>
        <tbody>
          {data.transactions.map((t, i) => (
            <tr key={i}>
              <td>{t.date}</td>
              <td>{t.description}</td>
              <td>{t.type}</td>
              <td>{t.status}</td>
              <td className="right green">{t.direction === 'income' ? fmt(t.amount) : ''}</td>
              <td className="right red">{t.direction === 'expense' ? fmt(t.amount) : ''}</td>
            </tr>
          ))}
          <tr className="net-row">
            <td colSpan={4}>NET PROFIT / LOSS</td>
            <td className="right">{fmt(data.totalIncome)}</td>
            <td className="right">{fmt(data.totalExpenses)}</td>
          </tr>
        </tbody>
      </table>

      <div className="disclaimer">
        This summary is generated by Premiso for informational purposes only. It does not constitute tax advice. All figures should be verified by a qualified accountant or tax adviser before submission to HMRC. Allowable deductions are subject to HMRC rules under the Property Income Manual (PIM). This document was generated on {format(new Date(), 'dd MMMM yyyy')} and relates to transactions recorded in Premiso for the period shown above.
      </div>
    </div>
  );
}