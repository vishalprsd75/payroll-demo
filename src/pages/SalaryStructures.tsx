import { useState } from 'react';
import {
  IndianRupee, Layers, Calculator, Info,
  CheckCircle2, ArrowRight, X
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useStore } from '../store';
import { formatCurrency, cn } from '../utils/format';
import type { SalaryStructure } from '../types';

export default function SalaryStructures() {
  const { salaryStructures } = useStore();
  const [selectedStructure, setSelectedStructure] = useState<SalaryStructure | null>(null);

  // ─── Salary Explorer State ────────────────────────────────────────────────
  const [basicInput, setBasicInput] = useState<number>(50000);

  // Dynamic calculations for the explorer
  const explorerBasic = Number(basicInput) || 0;
  const explorerHRA = Math.round(explorerBasic * 0.40);
  const explorerConv = 1600;
  const explorerSpecial = Math.round(explorerBasic * 0.20);
  const explorerGross = explorerBasic + explorerHRA + explorerConv + explorerSpecial;

  const explorerPF = Math.min(Math.round(explorerBasic * 0.12), 1800);
  const explorerPT = explorerGross > 25000 ? 200 : explorerGross > 15000 ? 150 : 0;
  const explorerAnnualGross = explorerGross * 12;
  const explorerTDS = explorerAnnualGross > 1000000 ? Math.round((explorerAnnualGross * 0.20) / 12) :
    explorerAnnualGross > 750000 ? Math.round((explorerAnnualGross * 0.15) / 12) :
    explorerAnnualGross > 500000 ? Math.round((explorerAnnualGross * 0.10) / 12) :
    explorerAnnualGross > 300000 ? Math.round((explorerAnnualGross * 0.05) / 12) : 0;
  const explorerESI = explorerGross <= 21000 ? Math.round(explorerGross * 0.0075) : 0;

  const explorerDeductions = explorerPF + explorerPT + explorerTDS + explorerESI;
  const explorerNet = explorerGross - explorerDeductions;
  const explorerCTC = explorerGross * 12 + explorerPF * 12 + Math.round(explorerBasic * 0.0481) * 12;

  // Pie chart data for explorer
  const explorerChartData = [
    { name: 'Basic', value: explorerBasic, color: '#0D9488' },
    { name: 'HRA', value: explorerHRA, color: '#14B8A6' },
    { name: 'Special Allowance', value: explorerSpecial, color: '#5EEAD4' },
    { name: 'Conveyance', value: explorerConv, color: '#99F6E4' },
    { name: 'Deductions (PF, PT, TDS)', value: explorerDeductions, color: '#F59E0B' },
  ].filter(d => d.value > 0);

  const structuresList = Object.values(salaryStructures);

  const formatStructureTitle = (name: string) => {
    return name
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-meridian-600" />
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">Compensation Architecture</h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Standardized salary grades, statutory deduction matrix, and real-time CTC simulator
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-500 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
          <Layers size={14} className="text-meridian-600" />
          <span>{structuresList.length} Standard Templates Active</span>
        </div>
      </div>

      {/* ─── Interactive Salary Explorer ───────────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-meridian-50 text-meridian-700 flex items-center justify-center">
              <Calculator size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">Interactive Salary Simulator</h2>
              <p className="text-xs text-stone-500">Calculate gross, statutory compliance, and in-hand net in real-time</p>
            </div>
          </div>
          <span className="hidden sm:inline-flex text-[11px] font-medium text-stone-500 bg-stone-50 px-2.5 py-1 rounded border border-stone-200">
            India Statutory Rules (PF, PT, TDS)
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-6">
          {/* Controls & Input */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">
                Monthly Basic Salary (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="10000"
                  max="500000"
                  step="1000"
                  value={basicInput}
                  onChange={e => setBasicInput(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-mono font-semibold text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-meridian-600 transition-all"
                />
              </div>
              <input
                type="range"
                min="15000"
                max="150000"
                step="2500"
                value={basicInput}
                onChange={e => setBasicInput(Number(e.target.value))}
                className="w-full mt-3 accent-meridian-600 cursor-pointer"
              />
            </div>

            {/* Quick Component Summary */}
            <div className="space-y-2 pt-2 border-t border-stone-100 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>HRA (40% of Basic)</span>
                <span className="font-mono text-stone-800">{formatCurrency(explorerHRA)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Special Allowance (20% of Basic)</span>
                <span className="font-mono text-stone-800">{formatCurrency(explorerSpecial)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Fixed Conveyance</span>
                <span className="font-mono text-stone-800">{formatCurrency(explorerConv)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Employee PF (12% capped)</span>
                <span className="font-mono text-amber-700">-{formatCurrency(explorerPF)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Professional Tax</span>
                <span className="font-mono text-amber-700">-{formatCurrency(explorerPT)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Estimated Monthly TDS</span>
                <span className="font-mono text-amber-700">-{formatCurrency(explorerTDS)}</span>
              </div>
            </div>
          </div>

          {/* Chart & Results Display */}
          <div className="lg:col-span-7 bg-stone-50 rounded-xl p-5 border border-stone-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-5">
              <div className="bg-white p-3 rounded-lg border border-stone-200">
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Gross Pay</span>
                <span className="text-sm font-bold text-stone-900 font-mono mt-0.5 block">{formatCurrency(explorerGross)}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-stone-200">
                <span className="text-[10px] uppercase font-bold text-amber-600 block tracking-wider">Deductions</span>
                <span className="text-sm font-bold text-amber-700 font-mono mt-0.5 block">-{formatCurrency(explorerDeductions)}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-meridian-200 bg-meridian-50/50">
                <span className="text-[10px] uppercase font-bold text-meridian-800 block tracking-wider">Net in Hand</span>
                <span className="text-sm font-bold text-meridian-800 font-mono mt-0.5 block">{formatCurrency(explorerNet)}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-stone-200">
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Annual CTC</span>
                <span className="text-sm font-bold text-stone-900 font-mono mt-0.5 block">{formatCurrency(explorerCTC)}</span>
              </div>
            </div>

            {/* Visual stacked distribution */}
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={explorerChartData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={45}
                      paddingAngle={2}
                    >
                      {explorerChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-stone-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488]" /> Net Salary Take-home
                  </span>
                  <span className="font-bold text-stone-800">
                    {Math.round((explorerNet / explorerGross) * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-stone-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> Statutory Deductions
                  </span>
                  <span className="font-bold text-stone-800">
                    {Math.round((explorerDeductions / explorerGross) * 100)}%
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 pt-1">
                  *Simulation calculates standard Section 80C PF deductions and Indian Tax slab estimates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Structure Templates Grid ──────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-stone-900">Standard Salary Grade Templates</h2>
          <span className="text-xs text-stone-500">Click any card to inspect full statutory breakdown</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {structuresList.map(structure => (
            <div
              key={structure.id}
              onClick={() => setSelectedStructure(structure)}
              className="bg-white rounded-xl border border-stone-200 p-5 hover:border-meridian-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-stone-900 group-hover:text-meridian-700 transition-colors">
                      {formatStructureTitle(structure.name)}
                    </h3>
                    <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider">
                      Grade: {structure.id.replace('ss-', '')}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-stone-50 group-hover:bg-meridian-50 flex items-center justify-center text-stone-400 group-hover:text-meridian-600 transition-colors">
                    <ArrowRight size={14} />
                  </div>
                </div>

                <div className="mt-5 space-y-2.5 border-t border-stone-100 pt-4 text-xs">
                  <div className="flex justify-between items-center text-stone-600">
                    <span>Monthly Gross</span>
                    <span className="font-mono font-semibold text-stone-800">{formatCurrency(structure.grossSalary)}</span>
                  </div>
                  <div className="flex justify-between items-center text-stone-600">
                    <span>Total Deductions</span>
                    <span className="font-mono text-amber-700">-{formatCurrency(structure.totalDeductions)}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold pt-1 border-t border-stone-50">
                    <span className="text-stone-900">Net Take-Home</span>
                    <span className="font-mono text-meridian-700 text-sm">{formatCurrency(structure.netSalary)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                <span>Annual Package</span>
                <span className="font-mono font-semibold text-stone-700">{formatCurrency(structure.annualCTC)} CTC</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Detail Modal / Drawer ─────────────────────────────────────── */}
      {selectedStructure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-stone-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  {formatStructureTitle(selectedStructure.name)} Salary Breakdown
                </h3>
                <p className="text-xs text-stone-500">Component breakdown and statutory deductions</p>
              </div>
              <button
                onClick={() => setSelectedStructure(null)}
                className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Summary KPIs */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Gross Salary</span>
                  <span className="text-sm font-bold text-stone-900 font-mono mt-0.5 block">
                    {formatCurrency(selectedStructure.grossSalary)}
                  </span>
                </div>
                <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200">
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">Total Deductions</span>
                  <span className="text-sm font-bold text-amber-800 font-mono mt-0.5 block">
                    -{formatCurrency(selectedStructure.totalDeductions)}
                  </span>
                </div>
                <div className="p-3 bg-meridian-50 rounded-lg border border-meridian-200">
                  <span className="text-[10px] uppercase font-bold text-meridian-800 block">Net in Hand</span>
                  <span className="text-sm font-bold text-meridian-800 font-mono mt-0.5 block">
                    {formatCurrency(selectedStructure.netSalary)}
                  </span>
                </div>
              </div>

              {/* Earnings Table */}
              <div>
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Earnings Components</h4>
                <div className="border border-stone-200 rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-stone-50 text-stone-600 border-b border-stone-200">
                      <tr>
                        <th className="px-3 py-2 text-left">Component</th>
                        <th className="px-3 py-2 text-left">Rule</th>
                        <th className="px-3 py-2 text-right">Monthly Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {selectedStructure.components.filter(c => c.type === 'earning').map(c => {
                        const amount = c.category === 'basic' ? c.value :
                          c.calculationType === 'percentage_of_basic' ? Math.round((selectedStructure.components.find(x => x.category === 'basic')?.value || 0) * (c.value / 100)) : c.value;
                        return (
                          <tr key={c.id}>
                            <td className="px-3 py-2 font-medium text-stone-800">{c.name}</td>
                            <td className="px-3 py-2 text-stone-500">{c.description || (c.calculationType === 'fixed' ? 'Fixed Allowance' : `${c.value}% of Basic`)}</td>
                            <td className="px-3 py-2 text-right font-mono text-stone-900">{formatCurrency(amount)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Deductions Table */}
              <div>
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Statutory Deductions</h4>
                <div className="border border-stone-200 rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-stone-50 text-stone-600 border-b border-stone-200">
                      <tr>
                        <th className="px-3 py-2 text-left">Component</th>
                        <th className="px-3 py-2 text-left">Statutory Basis</th>
                        <th className="px-3 py-2 text-right">Monthly Deduction</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {selectedStructure.components.filter(c => c.type === 'deduction').map(c => (
                        <tr key={c.id}>
                          <td className="px-3 py-2 font-medium text-stone-800">{c.name}</td>
                          <td className="px-3 py-2 text-stone-500">{c.description || (c.isStatutory ? 'Mandatory Statutory Deduction' : 'Voluntary')}</td>
                          <td className="px-3 py-2 text-right font-mono text-amber-700">-{formatCurrency(c.value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Annual CTC summary */}
              <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-stone-800 block">Annual Cost to Company (CTC)</span>
                  <span className="text-stone-500">Gross × 12 + Employer PF + Gratuity reserve</span>
                </div>
                <span className="text-base font-bold font-mono text-stone-900">{formatCurrency(selectedStructure.annualCTC)}</span>
              </div>
            </div>

            <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end">
              <button
                onClick={() => setSelectedStructure(null)}
                className="px-4 py-2 bg-meridian-600 text-white rounded-lg text-xs font-medium hover:bg-meridian-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

