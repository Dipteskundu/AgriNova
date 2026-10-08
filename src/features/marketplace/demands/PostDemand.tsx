"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/contexts/AuthContext";
import { getLoginUrl } from "@/lib/api";
import { postDemand, type QualityGrade } from "@/lib/marketplaceApi";
import { useT } from "@/components/dashboard/useT";

export function PostDemand() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useAuth();
  const t = useT();

  const [form, setForm] = useState({
    productName: "",
    variety: "",
    quantityKg: 500,
    qualityGrade: "Grade A" as QualityGrade | "Any",
    maxPricePerKgBdt: 0,
    preferredLocation: "",
    deliveryMethod: "delivery" as "delivery" | "pickup",
    deadline: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (field: string, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(getLoginUrl("/dashboard/demands/post"));
      return;
    }
    if (!form.productName || !form.deadline || !form.preferredLocation) {
      showToast("error", t("সব আবশ্যক ফিল্ড পূরণ করুন।", "Please fill all required fields."));
      return;
    }
    setSubmitting(true);
    // A live call now: report the failure instead of showing the success
    // screen regardless of what the API said (validation, auth, network).
    const res = await postDemand({ ...form, buyerName: user.name });
    setSubmitting(false);
    if (!res.success) {
      showToast("error", res.message || t("আপনার ডিমান্ড পোস্ট করা যায়নি।", "Could not post your demand."));
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto mb-5">
          <Icon name="CheckCircle" size={32} />
        </div>
        <h1 className="text-xl font-black text-slate-900 dark:text-[#f0f0f0] mb-2">{t("ডিমান্ড পোস্ট হয়েছে!", "Demand Posted!")}</h1>
        <p className="text-sm text-slate-500 mb-6">
          {t("আপনার ডিমান্ড বোর্ডে প্রকাশিত হয়েছে। মিলে যাওয়া কৃষকরা সরাসরি যোগাযোগ করবেন।", "Your demand has been published to the board. Matched farmers will contact you directly.")}
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => router.push("/dashboard/demands")}>
            {t("ডিমান্ড বোর্ড দেখুন", "View Demand Board")}
          </Button>
          <Button onClick={() => { setDone(false); setForm({ productName:"",variety:"",quantityKg:500,qualityGrade:"Grade A",maxPricePerKgBdt:0,preferredLocation:"",deliveryMethod:"delivery",deadline:"",description:"" }); }}>
            {t("আরেকটি পোস্ট করুন", "Post Another")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/dashboard/demands" className="hover:text-blue-600">{t("ডিমান্ড বোর্ড", "Demand Board")}</Link>
        <Icon name="ChevronRight" size={12} />
        <span className="text-slate-700 dark:text-[#e0e0e0] font-medium">{t("ডিমান্ড পোস্ট করুন", "Post a Demand")}</span>
      </nav>

      <h1 className="text-xl font-bold text-slate-900 dark:text-[#f0f0f0] mb-1">{t("ডিমান্ড পোস্ট করুন", "Post a Demand")}</h1>
      <p className="text-sm text-slate-500 dark:text-[#a0a0a0] mb-6">
        {t("আপনার কী প্রয়োজন তা কৃষকদের জানান। তারা সক্ষম হলে যোগাযোগ করবে।", "Tell farmers exactly what you need. They'll reach out if they can meet your requirements.")}
      </p>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-[#222] p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-600 dark:text-[#a0a0a0] mb-1.5">{t("পণ্যের নাম *", "Product Name *")}</label>
            <input
              value={form.productName}
              onChange={e => set("productName", e.target.value)}
              placeholder={t("যেমন: ধান, টমেটো, আলু", "e.g. Rice (Paddy), Tomato, Potato")}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-[#333] rounded-xl bg-white dark:bg-[#111] text-slate-900 dark:text-[#f0f0f0] placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-[#a0a0a0] mb-1.5">{t("জাত (ঐচ্ছিক)", "Variety (optional)")}</label>
            <input
              value={form.variety}
              onChange={e => set("variety", e.target.value)}
              placeholder={t("যেমন: ব্রি ধান২৯, ডায়ামন্ট", "e.g. BRRI Dhan29, Diamant")}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-[#333] rounded-xl bg-white dark:bg-[#111] text-slate-900 dark:text-[#f0f0f0] placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-[#a0a0a0] mb-1.5">{t("পরিমাণ (কেজি) *", "Quantity Needed (kg) *")}</label>
            <input
              type="number"
              min={1}
              value={form.quantityKg}
              onChange={e => set("quantityKg", Number(e.target.value))}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-[#333] rounded-xl bg-white dark:bg-[#111] text-slate-900 dark:text-[#f0f0f0] focus:outline-none focus:border-blue-400 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-[#a0a0a0] mb-1.5">{t("মানের গ্রেড *", "Quality Grade *")}</label>
            <select
              value={form.qualityGrade}
              onChange={e => set("qualityGrade", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-[#333] rounded-xl bg-white dark:bg-[#111] text-slate-900 dark:text-[#f0f0f0] focus:outline-none focus:border-blue-400 transition-colors"
            >
              <option value="Grade A">{t("গ্রেড এ", "Grade A")}</option>
              <option value="Grade B">{t("গ্রেড বি", "Grade B")}</option>
              <option value="Grade C">{t("গ্রেড সি", "Grade C")}</option>
              <option value="Any">{t("যেকোনো গ্রেড", "Any Grade")}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-[#a0a0a0] mb-1.5">{t("সর্বোচ্চ দাম (৳/কেজি) *", "Max Price (৳/kg) *")}</label>
            <input
              type="number"
              min={0}
              value={form.maxPricePerKgBdt || ""}
              onChange={e => set("maxPricePerKgBdt", Number(e.target.value))}
              placeholder="0"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-[#333] rounded-xl bg-white dark:bg-[#111] text-slate-900 dark:text-[#f0f0f0] placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-[#a0a0a0] mb-1.5">{t("পছন্দের এলাকা *", "Preferred Location *")}</label>
            <input
              value={form.preferredLocation}
              onChange={e => set("preferredLocation", e.target.value)}
              placeholder={t("যেমন: রাজশাহী, যেকোনো জায়গা", "e.g. Rajshahi, Anywhere")}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-[#333] rounded-xl bg-white dark:bg-[#111] text-slate-900 dark:text-[#f0f0f0] placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-[#a0a0a0] mb-1.5">{t("ডেলিভারি মাধ্যম *", "Delivery Method *")}</label>
            <select
              value={form.deliveryMethod}
              onChange={e => set("deliveryMethod", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-[#333] rounded-xl bg-white dark:bg-[#111] text-slate-900 dark:text-[#f0f0f0] focus:outline-none focus:border-blue-400 transition-colors"
            >
              <option value="delivery">{t("আমার ঠিকানায় ডেলিভারি", "Delivery to my address")}</option>
              <option value="pickup">{t("আমি নিজে নিব", "I will pick up")}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-[#a0a0a0] mb-1.5">{t("শেষ সময়সীমা *", "Deadline *")}</label>
            <input
              type="date"
              value={form.deadline}
              min={new Date().toISOString().slice(0, 10)}
              onChange={e => set("deadline", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-[#333] rounded-xl bg-white dark:bg-[#111] text-slate-900 dark:text-[#f0f0f0] focus:outline-none focus:border-blue-400 transition-colors"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-600 dark:text-[#a0a0a0] mb-1.5">{t("বর্ণনা", "Description")}</label>
            <textarea
              value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder={t("কোনো নির্দিষ্ট প্রয়োজন, প্যাকেজিং পছন্দ বা অন্যান্য বিবরণ যোগ করুন...", "Add any specific requirements, packaging preferences, or other details...")}
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-[#333] rounded-xl bg-white dark:bg-[#111] text-slate-900 dark:text-[#f0f0f0] placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors resize-none"
            />
          </div>
        </div>

        {!user && (
          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-400 flex gap-2">
            <Icon name="Info" size={14} className="shrink-0 mt-0.5" />
            <span>{t("ডিমান্ড পোস্ট করতে আপনাকে", "You need to")} <Link href="/login" className="underline font-semibold">{t("লগ ইন", "log in")}</Link> {t("করতে হবে।", "to post a demand.")}</span>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/demands")}>
            {t("বাতিল", "Cancel")}
          </Button>
          <Button type="submit" className="flex-1" loading={submitting}>
            {user ? t("ডিমান্ড পোস্ট করুন", "Post Demand") : t("পোস্ট করতে লগইন করুন", "Login to Post")}
          </Button>
        </div>
      </form>
    </div>
  );
}
