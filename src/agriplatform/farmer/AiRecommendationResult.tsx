import React, { useState, useEffect } from 'react';
import { tr } from "@/agriplatform/lib/localize";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FlaskConical,
  Sprout,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Skeleton } from '@/components/shared/Skeleton';
import { useToast } from '@/components/shared/Toast';
import { getAiRecommendationDiagnostic } from '@/agriplatform/lib/farmerApi';
import { AiRecommendationDiagnostic } from '@/agriplatform/types';
import { FarmerModuleKey } from '@/agriplatform/layout/AppLayout';

interface AiRecommendationResultProps {
  onNavigate?: (module: FarmerModuleKey) => void;
}

export const AiRecommendationResult: React.FC<AiRecommendationResultProps> = ({
  onNavigate,
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [diagnostic, setDiagnostic] = useState<AiRecommendationDiagnostic | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getAiRecommendationDiagnostic();
        if (res.success) {
          setDiagnostic(res.data);
        }
      } catch {
        showToast('error', tr('Failed to retrieve AI agronomic diagnostic'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  if (loading || !diagnostic) {
    return (
      <div className="space-y-4">
        <div className="h-64 bg-white rounded-xl border border-slate-200 p-5">
          <Skeleton className="h-6 w-1/3 mb-3" />
          <Skeleton className="h-44 w-full" />
        </div>
      </div>
    );
  }

  const {
    soilDeficiencies,
    recommendedFertilizers,
    riskFactors,
    agronomicRationale,
    yieldPotentialPrediction,
  } = diagnostic;

  return (
    <div className="space-y-6">
      {/* Top AI Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-700/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />{tr('Machine Learning Agronomy Model • Confidence')}{yieldPotentialPrediction.confidenceLevel}%
            </div>
            <h2 className="text-xl font-black">{tr('AI Soil & Crop Diagnostic Synthesis')}</h2>
            <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">{tr('Synthesized by comparing soil telemetry (pH 6.4, N-18kg, P-24kg, K-42kg) with historical regional harvest logs across Bogura district.')}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/20 text-center shrink-0">
            <span className="text-[11px] text-emerald-200 block uppercase font-medium">{tr('Predicted Yield Potential')}</span>
            <span className="text-2xl font-black text-white">
              {yieldPotentialPrediction.minimumYield} - {yieldPotentialPrediction.maximumYield}{' '}
              <span className="text-sm font-normal text-emerald-200">{tr(yieldPotentialPrediction.unit)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Agronomic Rationale */}
      <Card>
        <CardHeader
          title={tr('Agronomic Synthesis & Rationale')}
          subtitle={tr('Model diagnosis on soil chemistry, seasonal suitability, and moisture retention')}
        />
        <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-950 leading-relaxed">
          {tr(agronomicRationale)}
        </div>
      </Card>

      {/* Soil Deficiencies Table */}
      <Card>
        <CardHeader
          title={tr('Soil Chemical Deficiencies & Macronutrient Balance')}
          subtitle={tr('Real-time test reading compared against optimal baseline thresholds')}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-3 font-bold text-slate-600 uppercase">{tr('Nutrient Parameter')}</th>
                <th className="p-3 font-bold text-slate-600 uppercase">{tr('Current Sensor Level')}</th>
                <th className="p-3 font-bold text-slate-600 uppercase">{tr('Agronomic Target')}</th>
                <th className="p-3 font-bold text-slate-600 uppercase">{tr('Deficiency Status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {soilDeficiencies.map((item) => (
                <tr key={item.nutrient} className="hover:bg-slate-50/60">
                  <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                    <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
                    {tr(item.nutrient)}
                  </td>
                  <td className="p-3 font-mono text-slate-700">{item.currentLevel}</td>
                  <td className="p-3 font-mono text-slate-500">{item.optimalLevel}</td>
                  <td className="p-3">
                    <Badge
                      variant={
                        item.status === 'Deficient'
                          ? 'danger'
                          : item.status === 'Sufficient'
                          ? 'success'
                          : 'warning'
                      }
                    >
                      {tr(item.status)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Fertilizer Regimen & Risk Mitigations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fertilizer Regimen */}
        <Card>
          <CardHeader
            title={tr('Prescriptive Fertilizer Dosing Schedule')}
            subtitle={tr('Calculated to correct soil deficiencies over 90-day growth cycle')}
          />

          <div className="space-y-3 text-xs">
            {recommendedFertilizers.map((fert) => (
              <div key={fert.name} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-slate-900 text-sm">{tr(fert.name)}</h4>
                  <Badge variant="info">{fert.dosagePerAcre}</Badge>
                </div>
                <p className="text-[11px] text-slate-500 mb-1">
                  <span className="font-semibold text-slate-700">{tr('Application Window:')}</span> {tr(fert.applicationWindow)}
                </p>
                <p className="text-[11px] text-slate-600">{tr(fert.purpose)}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Risk Factors & Mitigations */}
        <Card>
          <CardHeader
            title={tr('Microclimate & Disease Risk Radar')}
            subtitle={tr('Simulated agronomic risks and proactive field countermeasures')}
          />

          <div className="space-y-3 text-xs">
            {riskFactors.map((risk) => (
              <div key={risk.factor} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-bold text-slate-900">{tr(risk.factor)}</h4>
                  <Badge
                    variant={
                      risk.impact === 'High'
                        ? 'danger'
                        : risk.impact === 'Medium'
                        ? 'warning'
                        : 'neutral'
                    }
                  >
                    {tr(risk.impact)}{tr('Risk')}</Badge>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-800">{tr('Countermeasure:')}</span> {tr(risk.mitigationStrategy)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Action Footer */}
      {onNavigate && (
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 flex items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">{tr('Ready to execute this crop recommendation?')}</h4>
            <p className="text-xs text-slate-500">{tr('Apply this fertilizer regimen directly to your field batch or compare against alternative winter crops.')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('comparison')}
            >{tr('Compare Other Crops')}</Button>
            <Button
              variant="primary"
              size="sm"
              icon={ArrowRight}
              onClick={() => onNavigate('crops')}
            >{tr('Create Crop Batch')}</Button>
          </div>
        </div>
      )}
    </div>
  );
};
