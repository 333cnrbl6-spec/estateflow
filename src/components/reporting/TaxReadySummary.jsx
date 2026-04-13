import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function TaxReadySummary({ data, month }) {
  if (!data) return null;

  const getTaxStatus = (item) => {
    if (item.verified) return 'verified';
    if (item.warning) return 'warning';
    return 'pending';
  };

  return (
    <div className="space-y-4">
      {/* Tax Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Taxable Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              £{data.summary.taxableIncome.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Gross rental income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Allowable Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              £{data.summary.allowableExpenses.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Tax-deductible costs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Taxable Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              £{data.summary.taxableProfit.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Liability basis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Est. Tax (20%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              £{(data.summary.taxableProfit * 0.2).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Basic rate estimate</p>
          </CardContent>
        </Card>
      </div>

      {/* Expense Breakdown for Tax */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Allowable Expenses Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {data.expenseCategories.map((category, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 border rounded hover:bg-muted">
                <div className="flex-1">
                  <p className="font-medium text-sm">{category.name}</p>
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">£{category.amount.toFixed(2)}</p>
                  <Badge variant={category.taxAllowable ? 'default' : 'secondary'} className="text-xs mt-1">
                    {category.taxAllowable ? 'Allowable' : 'Non-allowable'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tax Compliance Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Tax Compliance Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.complianceItems.map((item, idx) => {
              const status = getTaxStatus(item);
              return (
                <div key={idx} className={`flex items-start gap-3 p-3 rounded border ${status === 'warning' ? 'border-yellow-300 bg-yellow-50' : 'border-border'}`}>
                  {status === 'verified' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                    {item.warning && (
                      <p className="text-xs text-yellow-700 mt-1">⚠️ {item.warning}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tax Notes */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-sm text-blue-900">Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>• Figures are for reference only. Consult your accountant for official tax returns.</p>
          <p>• Tax rates vary by personal circumstances (basic/higher rate, NI, etc.)</p>
          <p>• Ensure all expense receipts are retained for 6 years</p>
          <p>• Mortgage interest is allowable; capital repayment is not</p>
        </CardContent>
      </Card>
    </div>
  );
}