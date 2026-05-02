import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Filter, Plus, Trash2 } from 'lucide-react';

export default function ReportBuilder() {
  const [newReport, setNewReport] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    report_type: 'financial',
    export_formats: ['excel', 'pdf'],
    is_scheduled: false,
    schedule_frequency: 'monthly'
  });
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['custom-reports'],
    queryFn: () => base44.asServiceRole.entities.CustomReport.list('-created_date', 50),
    staleTime: 5 * 60 * 1000
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return base44.asServiceRole.entities.CustomReport.create({
        ...formData,
        created_by: (await base44.auth.me()).email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-reports'] });
      setFormData({ name: '', report_type: 'financial', export_formats: ['excel', 'pdf'], is_scheduled: false, schedule_frequency: 'monthly' });
      setNewReport(false);
    }
  });

  const generateMutation = useMutation({
    mutationFn: async (reportId) => {
      return base44.functions.invoke('generateCustomReport', {
        reportId,
        format: 'excel'
      });
    }
  });

  const typeColors = {
    financial: 'bg-green-100 text-green-800',
    maintenance: 'bg-orange-100 text-orange-800',
    occupancy: 'bg-blue-100 text-blue-800',
    compliance: 'bg-red-100 text-red-800',
    portfolio: 'bg-purple-100 text-purple-800'
  };

  const sampleData = [
    { month: 'Jan', revenue: 4000, expenses: 2400 },
    { month: 'Feb', revenue: 3000, expenses: 1398 },
    { month: 'Mar', revenue: 2000, expenses: 9800 },
    { month: 'Apr', revenue: 2780, expenses: 3908 },
    { month: 'May', revenue: 1890, expenses: 4800 },
    { month: 'Jun', revenue: 2390, expenses: 3800 }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Custom Reports</h2>
        <Button onClick={() => setNewReport(!newReport)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Report
        </Button>
      </div>

      {newReport && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-medium">Report Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Q2 Financial Summary"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Report Type</label>
              <select
                value={formData.report_type}
                onChange={e => setFormData({...formData, report_type: e.target.value})}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg mt-1"
              >
                <option value="financial">Financial</option>
                <option value="maintenance">Maintenance</option>
                <option value="occupancy">Occupancy</option>
                <option value="compliance">Compliance</option>
                <option value="portfolio">Portfolio</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_scheduled}
                onChange={e => setFormData({...formData, is_scheduled: e.target.checked})}
                className="w-4 h-4"
              />
              <label className="text-sm font-medium">Schedule automatically</label>
            </div>

            {formData.is_scheduled && (
              <select
                value={formData.schedule_frequency}
                onChange={e => setFormData({...formData, schedule_frequency: e.target.value})}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={() => createMutation.mutate()}
                disabled={!formData.name || createMutation.isPending}
              >
                Create Report
              </Button>
              <Button variant="outline" onClick={() => setNewReport(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sample Report Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary (Sample)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="hsl(173, 58%, 39%)" />
              <Bar dataKey="expenses" fill="hsl(0, 72%, 51%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Saved Reports */}
      <div className="space-y-3">
        {isLoading ? (
          <p className="text-slate-600">Loading reports...</p>
        ) : reports.length === 0 ? (
          <Card className="p-6 text-center text-slate-600">
            No reports yet. Create one to get started.
          </Card>
        ) : (
          reports.map(report => (
            <Card key={report.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Filter className="w-5 h-5 text-slate-600" />
                    <div>
                      <p className="font-semibold text-slate-900">{report.name}</p>
                      <p className="text-sm text-slate-600">
                        {report.report_type} • {report.is_scheduled ? `${report.schedule_frequency}` : 'Manual'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={typeColors[report.report_type]}>
                    {report.report_type}
                  </Badge>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => generateMutation.mutate(report.id)}
                    disabled={generateMutation.isPending}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}