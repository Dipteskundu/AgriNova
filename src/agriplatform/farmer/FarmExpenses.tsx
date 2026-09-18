import React, { useState, useEffect, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Filter,
  DollarSign,
  Calendar,
  CreditCard,
  Layers,
  ArrowUpRight,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { FormInput, FormSelect, FormTextarea } from '@/components/shared/FormInput';
import { Skeleton } from '@/components/shared/Skeleton';
import { useToast } from '@/components/shared/Toast';
import { getFarmExpenses, getCropBatches, addFarmExpense } from '@/agriplatform/lib/farmerApi';
import { FarmExpense, CropBatch } from '@/agriplatform/types';

export const FarmExpenses: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<FarmExpense[]>([]);
  const [cropBatches, setCropBatches] = useState<CropBatch[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    cropBatchId: '',
    category: 'Fertilizers' as FarmExpense['category'],
    amountBdt: 5000,
    date: new Date().toISOString().split('T')[0],
    description: '',
    fieldOrFarm: 'Plot A1 - South Karatoya',
    paymentMethod: 'Cash' as FarmExpense['paymentMethod'],
    receiptReference: '',
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [expRes, batchesRes] = await Promise.all([
          getFarmExpenses(),
          getCropBatches(),
        ]);
        if (expRes.success && batchesRes.success) {
          setExpenses(expRes.data);
          setCropBatches(batchesRes.data);
          if (batchesRes.data.length > 0) {
            setNewExpense((prev) => ({ ...prev, cropBatchId: batchesRes.data[0].id }));
          }
        }
      } catch {
        showToast('error', 'Failed to load expense ledger');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const batch = cropBatches.find((b) => b.id === newExpense.cropBatchId);
    try {
      const res = await addFarmExpense({
        date: newExpense.date,
        category: newExpense.category,
        fieldOrFarm: newExpense.fieldOrFarm,
        cropName: batch?.cropName,
        description: newExpense.description,
        amountBdt: Number(newExpense.amountBdt),
        paymentMethod: newExpense.paymentMethod,
        receiptReference: newExpense.receiptReference || undefined,
      });
      if (res.success) {
        setExpenses([res.data, ...expenses]);
        setIsAddModalOpen(false);
        setNewExpense({
          cropBatchId: cropBatches[0]?.id || '',
          category: 'Fertilizers',
          amountBdt: 5000,
          date: new Date().toISOString().split('T')[0],
          description: '',
          fieldOrFarm: 'Plot A1 - South Karatoya',
          paymentMethod: 'Cash',
          receiptReference: '',
        });
        showToast('success', 'Expense recorded successfully');
      }
    } catch {
      showToast('error', 'Failed to record expense');
    }
  };

  const filteredExpenses = useMemo(() => {
    if (categoryFilter === 'All') return expenses;
    return expenses.filter((e) => e.category === categoryFilter);
  }, [expenses, categoryFilter]);

  const totalSpent = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + curr.amountBdt, 0);
  }, [expenses]);

  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amountBdt;
    });
    return map;
  }, [expenses]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-64 bg-white rounded-xl border border-slate-200 p-5">
          <Skeleton className="h-6 w-1/3 mb-3" />
          <Skeleton className="h-44 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Farm Operating Expenses Ledger</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total Operational Input Outlay: <span className="font-bold text-emerald-700">৳{totalSpent.toLocaleString()}</span> across {expenses.length} disbursements.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setIsAddModalOpen(true)}
        >
          Record Expense Voucher
        </Button>
      </div>

      {/* Category Breakdown Bar Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Fertilizers', amount: categoryTotals['Fertilizers'] || 0, color: 'text-emerald-700' },
          { label: 'Seeds & Seedlings', amount: categoryTotals['Seeds & Seedlings'] || 0, color: 'text-blue-700' },
          { label: 'Labor Wages', amount: categoryTotals['Labor Wages'] || 0, color: 'text-amber-700' },
          { label: 'Irrigation Energy', amount: categoryTotals['Irrigation Energy'] || 0, color: 'text-purple-700' },
        ].map((c) => (
          <div key={c.label} className="p-3 bg-white rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-400 block font-medium">{c.label}</span>
            <span className={`text-base font-extrabold ${c.color} block mt-0.5`}>
              ৳{c.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <h3 className="font-bold text-sm text-slate-900">Itemized Expense History</h3>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
          >
            <option value="All">All Categories ({expenses.length})</option>
            <option value="Fertilizers">Fertilizers</option>
            <option value="Seeds & Seedlings">Seeds & Seedlings</option>
            <option value="Labor Wages">Labor Wages</option>
            <option value="Machinery & Fuel">Machinery & Fuel</option>
            <option value="Irrigation Energy">Irrigation Energy</option>
            <option value="Pesticides">Pesticides</option>
            <option value="Transport & Storage">Transport & Storage</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="p-4 font-bold text-slate-600 uppercase">Disbursement Details</th>
                <th className="p-4 font-bold text-slate-600 uppercase">Category</th>
                <th className="p-4 font-bold text-slate-600 uppercase">Field / Crop</th>
                <th className="p-4 font-bold text-slate-600 uppercase">Payment Method</th>
                <th className="p-4 font-bold text-slate-600 uppercase text-right">Amount (BDT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4">
                    <span className="font-bold text-slate-900 block">{exp.description}</span>
                    <span className="text-[11px] text-slate-400">
                      {exp.date} {exp.receiptReference && `• Ref: ${exp.receiptReference}`}
                    </span>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={
                        exp.category === 'Fertilizers'
                          ? 'success'
                          : exp.category === 'Seeds & Seedlings'
                          ? 'info'
                          : exp.category === 'Labor Wages'
                          ? 'warning'
                          : 'neutral'
                      }
                    >
                      {exp.category}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-slate-800">{exp.fieldOrFarm}</span>
                    {exp.cropName && (
                      <span className="text-[11px] text-slate-400 block">{exp.cropName}</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-600">
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-slate-400" />
                      <span>{exp.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-extrabold text-slate-900 text-sm">
                      ৳{exp.amountBdt.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record Farm Operating Expense"
        subtitle="Log fertilizer, seed, machinery, or labor wage disbursements"
        maxWidth="lg"
      >
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormSelect
              id="category"
              label="Expense Category"
              value={newExpense.category}
              onChange={(e) =>
                setNewExpense({
                  ...newExpense,
                  category: e.target.value as FarmExpense['category'],
                })
              }
              options={[
                { value: 'Fertilizers', label: 'Fertilizers & Soil Amendments' },
                { value: 'Seeds & Seedlings', label: 'Seeds & Seedlings' },
                { value: 'Labor Wages', label: 'Labor Wages & Tillage' },
                { value: 'Machinery & Fuel', label: 'Machinery Rental & Diesel' },
                { value: 'Irrigation Energy', label: 'Electricity / Diesel Irrigation' },
                { value: 'Pesticides', label: 'Pesticides & Crop Protection' },
                { value: 'Transport & Storage', label: 'Transport & Storage Fees' },
                { value: 'Other', label: 'Other Miscellaneous' },
              ]}
            />

            <FormInput
              id="amount"
              label="Disbursement Amount (BDT)"
              type="number"
              value={newExpense.amountBdt}
              onChange={(e) => setNewExpense({ ...newExpense, amountBdt: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              id="date"
              label="Transaction Date"
              type="date"
              value={newExpense.date}
              onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
              required
            />

            <FormSelect
              id="paymentMethod"
              label="Payment Method"
              value={newExpense.paymentMethod}
              onChange={(e) =>
                setNewExpense({
                  ...newExpense,
                  paymentMethod: e.target.value as FarmExpense['paymentMethod'],
                })
              }
              options={[
                { value: 'Cash', label: 'Cash Payment' },
                { value: 'Mobile Banking (bKash/Nagad)', label: 'Mobile Banking (bKash / Nagad)' },
                { value: 'Bank Transfer', label: 'Direct Bank Transfer' },
              ]}
            />
          </div>

          <FormInput
            id="fieldOrFarm"
            label="Field or Farm Allocation"
            value={newExpense.fieldOrFarm}
            onChange={(e) => setNewExpense({ ...newExpense, fieldOrFarm: e.target.value })}
            required
          />

          <FormTextarea
            id="description"
            label="Disbursement Description"
            placeholder="e.g. 5 bags of Diammonium Phosphate (DAP) from Upazila BADC dealer..."
            value={newExpense.description}
            onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
            required
            rows={2}
          />

          <FormInput
            id="receipt"
            label="Voucher or Receipt Reference (Optional)"
            placeholder="e.g. REC-84920"
            value={newExpense.receiptReference}
            onChange={(e) => setNewExpense({ ...newExpense, receiptReference: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Expense Entry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
