import { useState, useMemo } from 'react';
import type { ToolId } from '../types';
import { CalendarDays, Activity, Landmark, Percent, TrendingUp, RefreshCcw } from 'lucide-react';

interface CalculatorWorkspaceProps {
  toolId: ToolId;
}

export function CalculatorWorkspace({ toolId }: CalculatorWorkspaceProps) {
  // Age Calc
  const [dob, setDob] = useState('');
  
  // BMI Calc
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');

  // Loan Calc
  const [principal, setPrincipal] = useState('');
  const [interest, setInterest] = useState('');
  const [months, setMonths] = useState('');

  // Discount Calc
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');

  // Margin Calc
  const [cost, setCost] = useState('');
  const [revenue, setRevenue] = useState('');

  const reset = () => {
    setDob('');
    setHeightCm('');
    setWeightKg('');
    setPrincipal('');
    setInterest('');
    setMonths('');
    setPrice('');
    setDiscount('');
    setCost('');
    setRevenue('');
  };

  const ageResult = useMemo(() => {
    if (toolId !== 'age-calculator' || !dob) return null;
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return null;
    const now = new Date();
    
    let years = now.getFullYear() - birthDate.getFullYear();
    let m = now.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
      years--;
      m += (m < 0 ? 12 : 0);
    }
    
    const diff = now.getTime() - birthDate.getTime();
    if (diff < 0) return { error: 'Date must be in the past' };

    const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = (years * 12) + m;

    return { years, totalMonths, totalWeeks, totalDays };
  }, [dob, toolId]);

  const bmiResult = useMemo(() => {
    if (toolId !== 'bmi-calculator' || !heightCm || !weightKg) return null;
    const h = parseFloat(heightCm) / 100;
    const w = parseFloat(weightKg);
    if (h <= 0 || w <= 0) return null;

    const bmi = w / (h * h);
    let category = 'Normal';
    let color = 'text-green-500';
    if (bmi < 18.5) { category = 'Underweight'; color = 'text-blue-500'; }
    else if (bmi >= 25 && bmi < 29.9) { category = 'Overweight'; color = 'text-orange-500'; }
    else if (bmi >= 30) { category = 'Obese'; color = 'text-rose-500'; }

    return { score: bmi.toFixed(1), category, color };
  }, [heightCm, weightKg, toolId]);

  const loanResult = useMemo(() => {
    if (toolId !== 'loan-calculator' || !principal || !interest || !months) return null;
    const p = parseFloat(principal);
    const r = parseFloat(interest) / 100 / 12; // monthly interest rate
    const n = parseFloat(months);
    if (p <= 0 || n <= 0) return null;

    let monthly = 0;
    let total = 0;
    if (r === 0) {
      monthly = p / n;
      total = p;
    } else {
      monthly = p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      total = monthly * n;
    }

    return { monthly: monthly.toFixed(2), total: total.toFixed(2), totalInterest: (total - p).toFixed(2) };
  }, [principal, interest, months, toolId]);

  const discountResult = useMemo(() => {
    if (toolId !== 'discount-calculator' || !price || !discount) return null;
    const p = parseFloat(price);
    const d = parseFloat(discount);
    if (p <= 0 || d < 0 || d > 100) return null;

    const saved = p * (d / 100);
    const finalPrice = p - saved;

    return { finalPrice: finalPrice.toFixed(2), saved: saved.toFixed(2) };
  }, [price, discount, toolId]);

  const marginResult = useMemo(() => {
    if (toolId !== 'margin-calculator' || !cost || !revenue) return null;
    const c = parseFloat(cost);
    const r = parseFloat(revenue);
    if (c <= 0 || r <= 0) return null;

    const profit = r - c;
    const margin = (profit / r) * 100;
    const markup = (profit / c) * 100;

    return { profit: profit.toFixed(2), margin: margin.toFixed(2), markup: markup.toFixed(2) };
  }, [cost, revenue, toolId]);


  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[600px] bg-slate-50 dark:bg-slate-950 p-6">
      
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shrink-0">
              {toolId === 'age-calculator' && <CalendarDays className="w-6 h-6" />}
              {toolId === 'bmi-calculator' && <Activity className="w-6 h-6" />}
              {toolId === 'loan-calculator' && <Landmark className="w-6 h-6" />}
              {toolId === 'discount-calculator' && <Percent className="w-6 h-6" />}
              {toolId === 'margin-calculator' && <TrendingUp className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {toolId === 'age-calculator' && 'Age Calculator'}
                {toolId === 'bmi-calculator' && 'BMI Calculator'}
                {toolId === 'loan-calculator' && 'Loan Calculator'}
                {toolId === 'discount-calculator' && 'Discount Calculator'}
                {toolId === 'margin-calculator' && 'Margin & Markup Calculator'}
              </h2>
              <p className="text-sm font-medium text-slate-500">Smart local calculator</p>
            </div>
          </div>
          <button 
            onClick={reset}
            className="text-slate-400 hover:text-indigo-500 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-900/50 p-2.5 rounded-xl transition-colors"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Inputs Column */}
          <div className="flex-1 flex flex-col gap-5">
            {toolId === 'age-calculator' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Date of Birth</label>
                <input 
                  type="date" 
                  value={dob} 
                  onChange={e => setDob(e.target.value)} 
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold focus:border-indigo-500 focus:outline-none" 
                />
              </div>
            )}

            {toolId === 'bmi-calculator' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Height (cm)</label>
                  <input type="number" min="0" value={heightCm} onChange={e => setHeightCm(e.target.value)} placeholder="175" className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold focus:border-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Weight (kg)</label>
                  <input type="number" min="0" value={weightKg} onChange={e => setWeightKg(e.target.value)} placeholder="70" className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold focus:border-indigo-500 focus:outline-none" />
                </div>
              </>
            )}

            {toolId === 'loan-calculator' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Principal Amount</label>
                  <input type="number" min="0" value={principal} onChange={e => setPrincipal(e.target.value)} placeholder="50000" className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold focus:border-indigo-500 focus:outline-none" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Interest Rate (%)</label>
                    <input type="number" min="0" value={interest} onChange={e => setInterest(e.target.value)} placeholder="5.5" className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold focus:border-indigo-500 focus:outline-none" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Term (Months)</label>
                    <input type="number" min="0" value={months} onChange={e => setMonths(e.target.value)} placeholder="60" className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold focus:border-indigo-500 focus:outline-none" />
                  </div>
                </div>
              </>
            )}

            {toolId === 'discount-calculator' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Original Price</label>
                  <input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} placeholder="99.99" className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold focus:border-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Discount (%)</label>
                  <input type="number" min="0" max="100" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="20" className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold focus:border-indigo-500 focus:outline-none" />
                </div>
              </>
            )}

            {toolId === 'margin-calculator' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Cost to Produce/Buy</label>
                  <input type="number" min="0" value={cost} onChange={e => setCost(e.target.value)} placeholder="50" className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold focus:border-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Revenue (Selling Price)</label>
                  <input type="number" min="0" value={revenue} onChange={e => setRevenue(e.target.value)} placeholder="120" className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold focus:border-indigo-500 focus:outline-none" />
                </div>
              </>
            )}
          </div>

          {/* Results Column */}
          <div className="w-full md:w-1/2 shrink-0 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-center">
            
            {toolId === 'age-calculator' && ageResult && !('error' in ageResult) && (
              <div className="text-center space-y-4">
                <p className="text-5xl font-black text-indigo-600">{ageResult.years}</p>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Years Old</p>
                <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-4" />
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center"><p className="text-lg font-bold text-slate-800 dark:text-slate-200">{ageResult.totalMonths}</p><p className="text-[10px] uppercase font-bold text-slate-400">Months</p></div>
                  <div className="text-center border-x border-slate-200 dark:border-slate-800"><p className="text-lg font-bold text-slate-800 dark:text-slate-200">{ageResult.totalWeeks}</p><p className="text-[10px] uppercase font-bold text-slate-400">Weeks</p></div>
                  <div className="text-center"><p className="text-lg font-bold text-slate-800 dark:text-slate-200">{ageResult.totalDays}</p><p className="text-[10px] uppercase font-bold text-slate-400">Days</p></div>
                </div>
              </div>
            )}
            {toolId === 'age-calculator' && ageResult && 'error' in ageResult && <p className="text-rose-500 text-center font-bold">{ageResult.error}</p>}
            
            {toolId === 'bmi-calculator' && bmiResult && (
              <div className="text-center space-y-4">
                <p className={`text-6xl font-black ${bmiResult.color}`}>{bmiResult.score}</p>
                <p className={`text-xl font-black uppercase tracking-widest ${bmiResult.color}`}>{bmiResult.category}</p>
              </div>
            )}

            {toolId === 'loan-calculator' && loanResult && (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Monthly Payment</p>
                  <p className="text-4xl font-black text-indigo-600">${loanResult.monthly}</p>
                </div>
                <div className="w-full h-px bg-slate-200 dark:bg-slate-800" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-500">Total Interest</span>
                  <span className="text-lg font-black text-slate-800 dark:text-slate-200">${loanResult.totalInterest}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-500">Total Paid</span>
                  <span className="text-lg font-black text-slate-800 dark:text-slate-200">${loanResult.total}</span>
                </div>
              </div>
            )}

            {toolId === 'discount-calculator' && discountResult && (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Final Price</p>
                  <p className="text-5xl font-black text-emerald-500">${discountResult.finalPrice}</p>
                </div>
                <div className="w-full h-px bg-slate-200 dark:bg-slate-800" />
                <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">You Save</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">${discountResult.saved}</span>
                </div>
              </div>
            )}

            {toolId === 'margin-calculator' && marginResult && (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Gross Profit</p>
                  <p className="text-4xl font-black text-emerald-500">${marginResult.profit}</p>
                </div>
                <div className="w-full h-px bg-slate-200 dark:bg-slate-800" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-500">Margin</span>
                  <span className="text-xl font-black text-slate-800 dark:text-slate-200">{marginResult.margin}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-500">Markup</span>
                  <span className="text-xl font-black text-slate-800 dark:text-slate-200">{marginResult.markup}%</span>
                </div>
              </div>
            )}

            {!ageResult && !bmiResult && !loanResult && !discountResult && !marginResult && (
              <div className="text-center opacity-50">
                <p className="text-sm font-bold text-slate-400">Enter values to see results</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
