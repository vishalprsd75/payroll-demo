import { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  BarChart3, TrendingUp, IndianRupee, Download,
  Layers, Filter, Calendar
} from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency, formatNumber, getStatusColor, cn } from '../utils/format';
import { MONTHS } from '../data';

export default function Reports() {
  const { payrollRuns, employees, departments } = useStore();
  const [selectedDept, setSelectedDept] = useState('all');

  // 1. Cost Trend across past runs
  const trendData = payrollRuns.slice().reverse().map(run => ({
    name: `${MONTHS[run.month - 1].slice(0, 3)} ${run.year}`,
    gross: run.totalGross,
    net: run.totalNet,
    deductions: run.totalDeductions,
  }));

  // 2. Department breakdown for current run (October)
  const currentRun = payrollRuns[0];
  const deptDataMap: Record<string, number> = {};
  departments.forEach(d => { deptDataMap[d.name] = 0; });

  currentRun.items.forEach(item => {
    deptDataMap[item.department] = (deptDataMap[item.department] || 0) + item.grossSalary;
  });

  const deptBarData = Object.entries(deptDataMap).map(([dept, total]) => ({
    department: dept.replace('&', '+'),
    amount: total,
  }));

  // 3. Salary Distribution
  const salaryBrackets = [
    { label: '< ₹30,000', count: 0 },
    { label: '₹30k - ₹50k', count: 0 },
    { label: '₹50k - ₹75k', count: 0 },
    { label: '₹75k - ₹1L', count: 0 },
    { label: '> ₹1,00,000', count: 0 },
  ];

  employees.forEach(emp => {
    const gross = emp.salaryStructure?.grossSalary || 0;
    if (gross < 30000) salaryBrackets[0].count++;
    else if (gross <= 50000) salaryBrackets[1].count++;
    else if (gross <= 75000) salaryBrackets[2].count++;
    else if (gross <= 100000) salaryBrackets[3].count++;
    else salaryBrackets[4].count++;
  });

  // 4. Deductions Breakdown (Current Month)
  const totalPF = currentRun.items.reduce((s, i) => s + i.pfDeduction, 0);
  const totalPT = currentRun.items.reduce((s, i) => s + i.professionalTax, 0);
  const totalTDS = currentRun.items.reduce((s, i) => s + i.tds, 0);
  const totalESI = currentRun.items.reduce((s, i) => s + i.esiDeduction, 0);
  const totalLOP = currentRun.items.reduce((s, i) => s + i.lopDeduction, 0);

  const deductionsPieData = [
    { name: 'Provident Fund (PF)', value: totalPF, color: '#0D9488' },
    { name: 'Income Tax (TDS)', value: totalTDS, color: '#F59E0B' },
    { name: 'Professional Tax (PT)', value: totalPT, color: '#6366F1' },
    { name: 'Loss of Pay (LOP)', value: totalLOP, color: '#EC4899' },
    ...(totalESI > 0 ? [{ name: 'Employee ESI', value: totalESI, color: '#8B5CF6' }] : []),
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-meridian-600" />
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">Executive Payroll Analytics</h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Financial variance reports, statutory tax exposure, and headcount cost allocation
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Download size={14} className="text-meridian-600" />
          Print / Export Report
        </button>
      </div>

      {/* ─── Top Level Metric Summary ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">Oct 2026 Disbursal</span>
          <span className="text-xl font-extrabold text-stone-900 font-mono mt-1 block">
            {formatCurrency(currentRun.totalNet)}
          </span>
          <span className="text-[10px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
            <TrendingUp size={12} /> +2.1% vs previous month
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">Monthly Gross CTC</span>
          <span className="text-xl font-extrabold text-stone-900 font-mono mt-1 block">
            {formatCurrency(currentRun.totalGross)}
          </span>
          <span className="text-[10px] text-stone-400 mt-1 block">Across 30 active personnel</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Statutory Withholdings</span>
          <span className="text-xl font-extrabold text-amber-800 font-mono mt-1 block">
            {formatCurrency(currentRun.totalDeductions)}
          </span>
          <span className="text-[10px] text-stone-500 mt-1 block">PF, PT & TDS remittances</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">Average Monthly CTC</span>
          <span className="text-xl font-extrabold text-stone-900 font-mono mt-1 block">
            {formatCurrency(Math.round(currentRun.totalGross / currentRun.totalEmployees))}
          </span>
          <span className="text-[10px] text-stone-400 mt-1 block">Standard median compensation</span>
        </div>
      </div>

      {/* ─── Visual Charts Row 1: Trend & Department Breakdown ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Line Chart */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900">4-Month Expenditure Trend</h3>
              <p className="text-xs text-stone-500">Gross compensation vs net employee payout (₹)</p>
            </div>
            <span className="text-xs font-mono text-stone-400">Jul - Oct 2026</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#a8a29e" />
                <YAxis
                  tick={{ fontSize: 10 }}
                  stroke="#a8a29e"
                  tickFormatter={val => `₹${(val / 100000).toFixed(1)}L`}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), '']}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="gross"
                  name="Gross CTC"
                  stroke="#0D9488"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0D9488' }}
                />
                <Line
                  type="monotone"
                  dataKey="net"
                  name="Net Disbursal"
                  stroke="#10B981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#10B981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Department Allocation</h3>
              <p className="text-xs text-stone-500">Gross monthly salary distribution across units</p>
            </div>
            <span className="text-xs font-mono text-stone-400">October 2026</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptBarData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                <XAxis dataKey="department" tick={{ fontSize: 10 }} stroke="#a8a29e" />
                <YAxis
                  tick={{ fontSize: 10 }}
                  stroke="#a8a29e"
                  tickFormatter={val => `₹${(val / 100000).toFixed(1)}L`}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Gross Amount']}
                />
                <Bar dataKey="amount" fill="#0D9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─── Visual Charts Row 2: Deductions & Salary Brackets ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deductions Pie */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Statutory Deductions Composition</h3>
              <p className="text-xs text-stone-500">Proportion of PF, income tax TDS, and statutory levies</p>
            </div>
            <span className="text-xs font-bold text-amber-700 font-mono">
              Total {formatCurrency(currentRun.totalDeductions)}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around h-64 gap-4">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deductionsPieData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {deductionsPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => formatCurrency(Number(val))} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 text-xs">
              {deductionsPieData.map(item => (
                <div key={item.name} className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-stone-600">{item.name}</span>
                  </div>
                  <span className="font-mono font-semibold text-stone-800">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Salary Bands Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Headcount Salary Brackets</h3>
              <p className="text-xs text-stone-500">Employee count categorized by gross monthly tiers</p>
            </div>
            <span className="text-xs font-mono text-stone-400">30 Personnel</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={salaryBrackets}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 40, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                <XAxis type="number" stroke="#a8a29e" tick={{ fontSize: 10 }} />
                <YAxis dataKey="label" type="category" stroke="#a8a29e" tick={{ fontSize: 10 }} />
                <Tooltip formatter={(val: any) => [`${val} Employees`, 'Count']} />
                <Bar dataKey="count" fill="#14B8A6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─── Historical Summary Table ──────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900">Monthly Run Audit Ledger</h3>
          <span className="text-xs text-stone-400">Complete historical payroll reconciliation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Payroll Cycle</th>
                <th className="px-4 py-3 text-center">Employees</th>
                <th className="px-4 py-3 text-right">Gross Total</th>
                <th className="px-4 py-3 text-right">Statutory Deductions</th>
                <th className="px-4 py-3 text-right">Net Disbursed</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {payrollRuns.map(run => (
                <tr key={run.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="px-4 py-3 font-semibold text-stone-900">
                    {MONTHS[run.month - 1]} {run.year}
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-stone-600">
                    {run.totalEmployees}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-stone-800">
                    {formatCurrency(run.totalGross)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-amber-700">
                    -{formatCurrency(run.totalDeductions)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-meridian-800">
                    {formatCurrency(run.totalNet)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize', getStatusColor(run.status))}>
                      {run.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

