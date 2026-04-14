import { Card } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export default function FinancialSummaryCard({ financialData }) {
  const { totalRents = 0, totalExpenses = 0, netCashFlow = 0 } = financialData;

  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const cashFlowColor = netCashFlow >= 0 ? 'text-green-700' : 'text-red-700';
  const bgColor = netCashFlow >= 0 ? 'from-green-50 to-emerald-50 border-green-200' : 'from-red-50 to-orange-50 border-red-200';

  return (
    <Card className={`p-6 bg-gradient-to-br ${bgColor}`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">Net Cash Flow</p>
        <TrendingUp className={`w-4 h-4 ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
      </div>
      <p className={`text-3xl font-bold mb-4 ${cashFlowColor}`}>
        £{formatCurrency(Math.abs(netCashFlow))}
      </p>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Rents Collected:</span>
          <span className="font-medium text-green-700">+£{formatCurrency(totalRents)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Expenses:</span>
          <span className="font-medium text-red-700">-£{formatCurrency(totalExpenses)}</span>
        </div>
      </div>
    </Card>
  );
}