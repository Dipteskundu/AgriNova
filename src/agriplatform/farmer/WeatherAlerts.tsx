import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  AlertTriangle,
  Droplets,
  Wind,
  Sun,
  Thermometer,
  ShieldAlert,
  Calendar,
  Info,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Skeleton } from '@/components/shared/Skeleton';
import { useToast } from '@/components/shared/Toast';
import { getWeatherData } from '@/agriplatform/lib/farmerApi';
import { WeatherData } from '@/agriplatform/types';

export const WeatherAlerts: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getWeatherData();
        if (res.success) {
          setWeather(res.data);
        }
      } catch {
        showToast('error', 'Failed to retrieve meteorological telemetries');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  if (loading || !weather) {
    return (
      <div className="space-y-4">
        <div className="h-64 bg-white rounded-xl border border-slate-200 p-5">
          <Skeleton className="h-6 w-1/3 mb-3" />
          <Skeleton className="h-44 w-full" />
        </div>
      </div>
    );
  }

  const { current, dailyForecast, microclimateAlerts } = weather;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Hyper-Local Weather & Microclimate Alerts</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Station: Bogura Agro-Meteorological Substation • Latitude: 24.8465° N, Longitude: 89.3772° E
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success">Station Live Sync</Badge>
          <span className="text-xs text-slate-400">Updated 10m ago</span>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {microclimateAlerts.length > 0 && (
        <div className="space-y-3">
          {microclimateAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                alert.severity === 'critical'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : alert.severity === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}
            >
              <AlertTriangle
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  alert.severity === 'critical'
                    ? 'text-rose-600'
                    : alert.severity === 'warning'
                    ? 'text-amber-600'
                    : 'text-blue-600'
                }`}
              />
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{alert.title}</span>
                  <Badge
                    variant={
                      alert.severity === 'critical'
                        ? 'danger'
                        : alert.severity === 'warning'
                        ? 'warning'
                        : 'info'
                    }
                  >
                    {alert.severity.toUpperCase()}
                  </Badge>
                  <span className="text-[11px] opacity-75">Valid until: {alert.validUntil}</span>
                </div>
                <p className="text-slate-700">{alert.message}</p>
                <p className="font-semibold text-slate-900">
                  ⚡ Agronomic Action Required: <span className="font-normal">{alert.actionRequired}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current Conditions Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 bg-gradient-to-br from-emerald-700 to-teal-800 text-white border-0">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-emerald-200 font-semibold">
              Current Microclimate
            </span>
            <CloudSun className="w-8 h-8 text-emerald-100" />
          </div>

          <div className="my-6">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black">{current.tempCelsius}°</span>
              <span className="text-lg text-emerald-200 font-semibold">C</span>
            </div>
            <p className="text-sm text-emerald-100 mt-1">{current.condition} (Feels like {current.feelsLike}°C)</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-emerald-600/60 text-xs">
            <div>
              <span className="text-emerald-200 block text-[11px]">Relative Humidity</span>
              <span className="font-bold text-sm">{current.humidityPercent}%</span>
            </div>
            <div>
              <span className="text-emerald-200 block text-[11px]">Wind Velocity</span>
              <span className="font-bold text-sm">{current.windSpeedKmh} km/h</span>
            </div>
            <div>
              <span className="text-emerald-200 block text-[11px]">Rain Probability</span>
              <span className="font-bold text-sm">{current.precipitationProbability}%</span>
            </div>
            <div>
              <span className="text-emerald-200 block text-[11px]">Soil Temperature</span>
              <span className="font-bold text-sm">{current.soilTempCelsius}°C</span>
            </div>
          </div>
        </Card>

        {/* Telemetry Metrics */}
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200/80">
            <Droplets className="w-5 h-5 text-blue-600 mb-2" />
            <span className="text-xs text-slate-400 block font-medium">Precipitation Index</span>
            <span className="text-xl font-black text-slate-900">{current.precipitationProbability}%</span>
            <span className="text-[11px] text-slate-500 block mt-1">Light showers probable</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200/80">
            <Wind className="w-5 h-5 text-teal-600 mb-2" />
            <span className="text-xs text-slate-400 block font-medium">Wind Gusts</span>
            <span className="text-xl font-black text-slate-900">{current.windSpeedKmh} km/h</span>
            <span className="text-[11px] text-slate-500 block mt-1">Gentle North-East breeze</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200/80">
            <Sun className="w-5 h-5 text-amber-500 mb-2" />
            <span className="text-xs text-slate-400 block font-medium">UV Radiation</span>
            <span className="text-xl font-black text-slate-900">{current.uvIndex} (Moderate)</span>
            <span className="text-[11px] text-slate-500 block mt-1">{current.solarRadiationWsqm} W/m² Insolation</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200/80">
            <Thermometer className="w-5 h-5 text-rose-500 mb-2" />
            <span className="text-xs text-slate-400 block font-medium">Topsoil Thermal State</span>
            <span className="text-xl font-black text-slate-900">{current.soilTempCelsius}°C</span>
            <span className="text-[11px] text-slate-500 block mt-1">Optimal for root uptake</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200/80 col-span-2">
            <Info className="w-5 h-5 text-emerald-600 mb-2" />
            <span className="text-xs text-slate-400 block font-medium">Agronomic Spraying Recommendation</span>
            <p className="text-xs text-slate-700 mt-1">
              Favorable conditions for foliar nutrient sprays. Wind speed is under 15 km/h and rain probability remains low for the next 6 hours.
            </p>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast & Daily Advisories */}
      <Card>
        <CardHeader
          title="7-Day Microclimate Forecast & Agronomic Advisories"
          subtitle="Specific farming recommendations based on localized precipitation and temperature"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {dailyForecast.map((day) => (
            <div key={day.date} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col justify-between">
              <div>
                <span className="font-bold text-slate-900 block">{day.dayName}</span>
                <span className="text-[11px] text-slate-400 block">{day.date}</span>

                <div className="my-3 flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-base text-slate-900">{day.tempMax}°</span>
                    <span className="text-xs text-slate-400 ml-1">/ {day.tempMin}°</span>
                  </div>
                  <Badge variant={day.rainProbability > 40 ? 'warning' : 'neutral'}>
                    🌧 {day.rainProbability}%
                  </Badge>
                </div>

                <p className="text-[11px] text-slate-600 font-medium mb-2">{day.condition}</p>
              </div>

              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 bg-white p-2 rounded-lg">
                <span className="font-bold text-slate-800 block text-[10px] uppercase">Advisory</span>
                {day.farmingAdvisory}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
