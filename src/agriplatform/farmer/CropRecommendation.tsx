import React, { useState, useEffect } from 'react';
import { tr } from "@/agriplatform/lib/localize";
import {
  Sparkles,
  TrendingUp,
  Droplets,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Filter,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { FormInput, FormSelect } from '@/components/shared/FormInput';
import { Skeleton } from '@/components/shared/Skeleton';
import { useToast } from '@/components/shared/Toast';
import { getCropRecommendations } from '@/agriplatform/lib/farmerApi';
import { CropRecommendationItem, CropRecommendationInput } from '@/agriplatform/types';
import { FarmerModuleKey } from '@/agriplatform/layout/AppLayout';
import { useLanguage } from '@/agriplatform/lib/LanguageContext';

interface CropRecommendationProps {
  onNavigate?: (module: FarmerModuleKey) => void;
}

export const CropRecommendation: React.FC<CropRecommendationProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<CropRecommendationItem[]>([]);
  const [inputForm, setInputForm] = useState<CropRecommendationInput>({
    soilType: 'Alluvial Clay Loam',
    nitrogen: 135,
    phosphorus: 24,
    potassium: 110,
    ph: 6.6,
    rainfallMm: 350,
    temperatureCelsius: 28,
    season: 'Rabi (Winter)',
    targetLandSizeAcres: 4.2,
  });

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const res = await getCropRecommendations(inputForm);
      if (res.success) {
        setRecommendations(res.data);
      }
    } catch {
      showToast('error', tr('Failed to run recommendation engine'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    loadRecommendations();
    showToast('success', tr('Recommendation generated based on soil chemistry'));
  };

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              {language === 'bn' ? 'এআই ফসল পরামর্শ ও লাভজনকতা নির্ধারণ' : 'Crop Suitability & ROI Recommendation'}
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            {language === 'bn'
              ? 'মাটির নাইট্রোজেন, ফসফরাস, পটাশ, পিএইচ মাত্রা এবং আবহাওয়ার পূর্বাভাস বিশ্লেষণ করে সেরা ফসল নির্ধারণ করা হয়।'
              : 'Agronomic algorithms evaluate soil NPK, pH, forecasted seasonal weather, and market price margins.'}
          </p>
        </div>

        {onNavigate && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('comparison')}
            >
              {language === 'bn' ? 'পাশাপাশি ফসলের তুলনা' : 'Side-by-Side Comparison'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('ai_result')}
            >
              {language === 'bn' ? 'মাটি রোগ নির্ণয়' : 'AI Soil Diagnostics'}
            </Button>
          </div>
        )}
      </div>

      {/* Input Parameters Form Card */}
      <Card>
        <CardHeader
          title={language === 'bn' ? 'মাটির উপাদান ও মৌসুমের তথ্য' : 'Input Soil Chemistry & Season Parameters'}
          subtitle={language === 'bn' ? 'আপনার জমির পরিমাপ ও মাটির মান অনুযায়ী সঠিক পরামর্শ পান' : 'Adjust values to run predictive agronomic simulations for your plots'}
        />

        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <FormSelect
              id="season"
              label={language === 'bn' ? 'ফসল চাষের মৌসুম' : 'Cropping Season'}
              value={inputForm.season}
              onChange={(e) =>
                setInputForm({
                  ...inputForm,
                  season: e.target.value as CropRecommendationInput['season'],
                })
              }
              options={[
                { value: 'Rabi (Winter)', label: language === 'bn' ? 'রবি (শীতকাল) - কার্তিক থেকে ফাল্গুন' : 'Rabi (Winter) - Nov to Mar' },
                { value: 'Kharif-1 (Early Summer)', label: language === 'bn' ? 'খরিপ-১ (গ্রীষ্মকাল) - চৈত্র থেকে জ্যৈষ্ঠ' : 'Kharif-1 (Early Summer) - Apr to Jun' },
                { value: 'Kharif-2 (Monsoon)', label: language === 'bn' ? 'খরিপ-২ (বর্ষাকাল) - আষাঢ় থেকে আশ্বিন' : 'Kharif-2 (Monsoon) - Jul to Oct' },
              ]}
            />

            <FormInput
              id="soilType"
              label={language === 'bn' ? 'মাটির ধরণ' : 'Soil Classification'}
              value={inputForm.soilType}
              onChange={(e) => setInputForm({ ...inputForm, soilType: e.target.value })}
            />

            <FormInput
              id="targetAcreage"
              label={language === 'bn' ? 'জমির পরিমাণ (একর)' : 'Target Land Size (Acres)'}
              type="number"
              step="0.1"
              value={inputForm.targetLandSizeAcres}
              onChange={(e) =>
                setInputForm({ ...inputForm, targetLandSizeAcres: Number(e.target.value) })
              }
            />

            <FormInput
              id="ph"
              label={language === 'bn' ? 'মাটির পিএইচ (pH)' : 'Soil pH Level'}
              type="number"
              step="0.1"
              value={inputForm.ph}
              onChange={(e) => setInputForm({ ...inputForm, ph: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
            <FormInput
              id="nitrogen"
              label={language === 'bn' ? 'নাইট্রোজেন N (কেজি/হেক্টর)' : 'Nitrogen N (kg/ha)'}
              type="number"
              value={inputForm.nitrogen}
              onChange={(e) => setInputForm({ ...inputForm, nitrogen: Number(e.target.value) })}
            />
            <FormInput
              id="phosphorus"
              label={language === 'bn' ? 'ফসফরাস P (কেজি/হেক্টর)' : 'Phosphorus P (kg/ha)'}
              type="number"
              value={inputForm.phosphorus}
              onChange={(e) => setInputForm({ ...inputForm, phosphorus: Number(e.target.value) })}
            />
            <FormInput
              id="potassium"
              label={language === 'bn' ? 'পটাশিয়াম K (কেজি/হেক্টর)' : 'Potassium K (kg/ha)'}
              type="number"
              value={inputForm.potassium}
              onChange={(e) => setInputForm({ ...inputForm, potassium: Number(e.target.value) })}
            />
            <FormInput
              id="rainfall"
              label={language === 'bn' ? 'বৃষ্টিপাতের পূর্বাভাস (মিমি)' : 'Rainfall Forecast (mm)'}
              type="number"
              value={inputForm.rainfallMm}
              onChange={(e) => setInputForm({ ...inputForm, rainfallMm: Number(e.target.value) })}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="sm" icon={Sparkles} loading={loading}>
              {language === 'bn' ? 'পরামর্শ যাচাই করুন' : 'Run Recommendation Model'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Recommended Output List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          {language === 'bn'
            ? 'উপযুক্ততা ও সম্ভাব্য লাভের ভিত্তিতে সেরা ফসল তালিকা'
            : 'Recommended Crop Varieties Ranked by Suitability & Net Return'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((item, idx) => (
            <Card
              key={item.id}
              className="flex flex-col justify-between hover:border-emerald-300 transition-all border-slate-200"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">{tr('#')}{idx + 1}
                      </span>
                      <h4 className="text-base font-bold text-slate-900">{item.cropName}</h4>
                    </div>
                    <p className="text-xs text-slate-500 italic mt-0.5">{item.scientificName}</p>
                    <p className="text-xs text-emerald-800 font-semibold mt-1">
                      {language === 'bn' ? 'অনুমোদিত জাত: ' : 'Recommended Seed: '}{item.recommendedVariety}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-sm">
                      <Sparkles className="w-4 h-4" />
                      {item.suitabilityScore}% {language === 'bn' ? 'উপযুক্ত' : 'Match'}
                    </div>
                    <span
                      className={`text-[10px] block mt-1 font-semibold ${
                        item.riskFactor === 'Low'
                          ? 'text-emerald-600'
                          : item.riskFactor === 'Medium'
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {item.riskFactor === 'Low'
                        ? (language === 'bn' ? 'কম ঝুঁকি' : 'Low Risk')
                        : item.riskFactor === 'Medium'
                        ? (language === 'bn' ? 'মাঝারি ঝুঁকি' : 'Medium Risk')
                        : (language === 'bn' ? 'বেশি ঝুঁকি' : 'High Risk')}
                    </span>
                  </div>
                </div>

                {/* Economics Matrix */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs mt-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">
                      {language === 'bn' ? 'সম্ভাব্য ফলন / একর' : 'Est. Yield / Acre'}
                    </span>
                    <span className="font-bold text-slate-800">{item.estimatedYieldKgPerAcre.toLocaleString()}{tr('kg')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">
                      {language === 'bn' ? 'নিট লাভ / একর' : 'Net Profit / Acre'}
                    </span>
                    <span className="font-bold text-emerald-700">৳{item.estimatedProfitPerAcre.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">
                      {language === 'bn' ? 'মুনাফা হার' : 'Projected ROI'}
                    </span>
                    <span className="font-bold text-indigo-700">+{item.roiPercentage}%</span>
                  </div>
                </div>

                {/* Key Advantages */}
                <div className="mt-3.5 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block">
                    {language === 'bn' ? 'কৃষিগত সুযোগ ও সুবিধা:' : 'Agronomic Benefits:'}
                  </span>
                  {item.keyAdvantages.map((adv, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{adv}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100 text-xs text-slate-700">
                  <span className="font-semibold text-emerald-800">
                    {language === 'bn' ? 'জলবায়ু সহনশীলতা: ' : 'Climate Resilience: '}
                  </span>
                  {item.climateResilience}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{language === 'bn' ? `পাকতে সময়: ${item.maturityPeriodDays} দিন` : `Maturity: ${item.maturityPeriodDays} Days`}</span>
                <span>{language === 'bn' ? `পানি: ${item.waterRequirementMm} মিমি` : `Water: ${item.waterRequirementMm} mm`}</span>
                <span className="font-semibold text-slate-800">{language === 'bn' ? `বাজারদর: ৳${item.expectedMarketPricePerKg}/কেজি` : `Mkt: ৳${item.expectedMarketPricePerKg}/kg`}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
