import React, { useState, useEffect } from 'react';
import { tr } from "@/agriplatform/lib/localize";
import {
  ShoppingCart,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Eye,
  Truck,
  ShieldAlert,
  ArrowRight,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { Skeleton } from '@/components/shared/Skeleton';
import { useToast } from '@/components/shared/Toast';
import { getOrderAuditsAdmin } from '@/agriplatform/lib/adminApi';
import { OrderAuditAdminView } from '@/agriplatform/types';

export const OrdersManagement: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderAuditAdminView[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [escrowFilter, setEscrowFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<OrderAuditAdminView | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getOrderAuditsAdmin();
        if (res.success) {
          setOrders(res.data);
        }
      } catch {
        showToast('error', tr('Failed to load wholesale orders'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.produceItem.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEscrow = escrowFilter === 'All' || o.escrowStatus === escrowFilter;
    return matchesSearch && matchesEscrow;
  });

  const totalValue = orders.reduce((acc, o) => acc + o.totalValueBdt, 0);
  const inEscrowValue = orders
    .filter((o) => o.escrowStatus === 'Held in Escrow')
    .reduce((acc, o) => acc + o.totalValueBdt, 0);

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
          <h2 className="text-lg font-bold text-slate-900">{tr('National Wholesale Orders & Escrow Audit')}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{tr('Monitor institutional agricultural procurement contracts, delivery status, and escrow releases.')}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{tr('Live Escrow Audited:')}<strong>৳{inEscrowValue.toLocaleString()}{tr('BDT')}</strong></span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">{tr('Total Orders Tracked')}</span>
          <span className="text-xl font-black text-slate-900">{orders.length}</span>
          <span className="text-[10px] text-slate-500 block">{tr('Institutional & Mandi')}</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">{tr('Total Contract Value')}</span>
          <span className="text-xl font-black text-emerald-700">৳{(totalValue / 100000).toFixed(2)}{tr('Lakh')}</span>
          <span className="text-[10px] text-emerald-600 block">{tr('Digitally secured')}</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">{tr('Active in Transit')}</span>
          <span className="text-xl font-black text-blue-600">
            {orders.filter((o) => o.fulfillmentStatus === 'In Transit').length}
          </span>
          <span className="text-[10px] text-slate-500 block">{tr('GPS monitored freight')}</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">{tr('Disputed Orders')}</span>
          <span className="text-xl font-black text-red-600">
            {orders.filter((o) => o.escrowStatus === 'Disputed').length}
          </span>
          <span className="text-[10px] text-slate-500 block">{tr('In arbitration queue')}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={tr('Search order code, buyer, farmer or produce...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
          />
        </div>

        <select
          value={escrowFilter}
          onChange={(e) => setEscrowFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
        >
          <option value="All">{tr('All Escrow Statuses')}</option>
          <option value="Held in Escrow">{tr('Held in Escrow')}</option>
          <option value="Released to Farmer">{tr('Released to Farmer')}</option>
          <option value="Disputed">{tr('Disputed')}</option>
          <option value="Refunded">{tr('Refunded')}</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="p-4 font-bold text-slate-600 uppercase">{tr('Order Code')}</th>
                <th className="p-4 font-bold text-slate-600 uppercase">{tr('Produce & Volume')}</th>
                <th className="p-4 font-bold text-slate-600 uppercase">{tr('Buyer vs Farmer')}</th>
                <th className="p-4 font-bold text-slate-600 uppercase">{tr('Contract Value')}</th>
                <th className="p-4 font-bold text-slate-600 uppercase">{tr('Escrow State')}</th>
                <th className="p-4 font-bold text-slate-600 uppercase">{tr('Fulfillment')}</th>
                <th className="p-4 font-bold text-slate-600 uppercase">{tr('Logistics')}</th>
                <th className="p-4 font-bold text-slate-600 uppercase text-right">{tr('Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-900">{order.orderCode}</td>
                  <td className="p-4">
                    <span className="font-semibold text-slate-800 block">{order.produceItem}</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {order.volumeKg.toLocaleString()}{tr('kg (')}{(order.volumeKg / 1000).toFixed(1)}{tr('MT)')}</span>
                  </td>
                  <td className="p-4">
                    <div className="space-y-0.5">
                      <span className="text-slate-800 font-medium block">{tr('🏢')}{order.buyerName}</span>
                      <span className="text-slate-500 text-[11px] block">{tr('🌾')}{order.farmerName}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-900">
                    ৳{order.totalValueBdt.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={
                        order.escrowStatus === 'Released to Farmer'
                          ? 'success'
                          : order.escrowStatus === 'Held in Escrow'
                          ? 'warning'
                          : order.escrowStatus === 'Disputed'
                          ? 'danger'
                          : 'neutral'
                      }
                    >
                      {order.escrowStatus}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      {order.fulfillmentStatus}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 text-[11px]">{order.logisticsPartner}</td>
                  <td className="p-4 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      icon={Eye}
                      onClick={() => setSelectedOrder(order)}
                    >{tr('Audit')}</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedOrder && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedOrder(null)}
          title={`Order Escrow Audit - ${selectedOrder.orderCode}`}
          subtitle={`Placed on ${selectedOrder.orderDate}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-500">{tr('Order Reference:')}</span>
                <span className="font-mono font-bold text-slate-800">{selectedOrder.orderCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{tr('Produce:')}</span>
                <span className="font-bold text-slate-800">{selectedOrder.produceItem}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{tr('Consignment Weight:')}</span>
                <span className="font-bold text-slate-800 font-mono">{selectedOrder.volumeKg.toLocaleString()}{tr('kg')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{tr('Buyer Institution:')}</span>
                <span className="font-bold text-slate-800">{selectedOrder.buyerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{tr('Producer Farmer:')}</span>
                <span className="font-bold text-slate-800">{selectedOrder.farmerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{tr('Carrier / Fleet:')}</span>
                <span className="font-bold text-slate-800">{selectedOrder.logisticsPartner}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-500 font-semibold">{tr('Total Escrow Fund:')}</span>
                <span className="font-bold text-emerald-800 font-mono text-sm">
                  ৳{selectedOrder.totalValueBdt.toLocaleString()}{tr('BDT')}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>{tr('Close Audit')}</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
