import React, { useState, useEffect } from 'react';

// 数据定义
const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const WUXING = { '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水' };
const DIZHI_WUXING = { '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水' };

const WUXING_DATA = {
  '木': { emoji: '🌿', gradient: 'linear-gradient(135deg, #134e4a, #14b8a6)', energy: '生长型', style: '稳扎稳打的长线玩家，投资像种树——耐心等它长大' },
  '火': { emoji: '🔥', gradient: 'linear-gradient(135deg, #7c2d12, #f97316)', energy: '冲动型', style: '快进快出追涨杀跌，看到机会就想 all in' },
  '土': { emoji: '⛰️', gradient: 'linear-gradient(135deg, #78350f, #d97706)', energy: '保守型', style: '求稳不求快，喜欢确定性，讨厌大波动' },
  '金': { emoji: '✨', gradient: 'linear-gradient(135deg, #374151, #9ca3af)', energy: '精算型', style: '数据驱动冷静理性，止损止盈执行力拉满' },
  '水': { emoji: '💧', gradient: 'linear-gradient(135deg, #1e3a5f, #3b82f6)', energy: '灵活型', style: '随机应变擅长发现机会，但有时想太多' }
};

const ASSETS = {
  'BTC': { name: '比特币', wuxing: '金', icon: '₿', color: '#f7931a', bg: 'linear-gradient(135deg, #f7931a22, #f7931a11)' },
  'GOLD': { name: '黄金', wuxing: '金', icon: '🥇', color: '#ffd700', bg: 'linear-gradient(135deg, #ffd70022, #ffd70011)' },
  'NVDA': { name: '英伟达', wuxing: '火', icon: '🚀', color: '#76b900', bg: 'linear-gradient(135deg, #76b90022, #76b90011)' },
  'TSLA': { name: '特斯拉', wuxing: '火', icon: '⚡', color: '#e31937', bg: 'linear-gradient(135deg, #e3193722, #e3193711)' },
  'SPY': { name: 'S&P500', wuxing: '土', icon: '📊', color: '#6366f1', bg: 'linear-gradient(135deg, #6366f122, #6366f111)' },
  'HOUSE': { name: '房产', wuxing: '土', icon: '🏠', color: '#ec4899', bg: 'linear-gradient(135deg, #ec489922, #ec489911)' },
};

const XIANGSHENG = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
const XIANGKE = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };
const XIANGSHENG_REV = { '火': '木', '土': '火', '金': '土', '水': '金', '木': '水' };

function getBazi(year, month, day, hour) {
  const baseYear = 1984;
  const yearDiff = year - baseYear;
  const yearGan = TIANGAN[(yearDiff % 10 + 10) % 10];
  const yearZhi = DIZHI[(yearDiff % 12 + 12) % 12];
  const monthIndex = ((year * 12 + month) - (1984 * 12 + 1)) % 60;
  const monthGan = TIANGAN[(monthIndex % 10 + 10) % 10];
  const monthZhi = DIZHI[((month + 1) % 12)];
  const baseDate = new Date(1984, 0, 1);
  const targetDate = new Date(year, month - 1, day);
  const dayDiff = Math.floor((targetDate - baseDate) / (24 * 60 * 60 * 1000));
  const dayGan = TIANGAN[(dayDiff % 10 + 10) % 10];
  const dayZhi = DIZHI[(dayDiff % 12 + 12) % 12];
  const hourIndex = Math.floor((hour + 1) / 2) % 12;
  const hourGan = TIANGAN[((dayDiff % 10) * 2 + hourIndex) % 10];
  const hourZhi = DIZHI[hourIndex];
  return { year: { gan: yearGan, zhi: yearZhi }, month: { gan: monthGan, zhi: monthZhi }, day: { gan: dayGan, zhi: dayZhi }, hour: { gan: hourGan, zhi: hourZhi }, dayMaster: dayGan };
}

function analyzeAssetMatch(dayMaster, assetWuxing) {
  if (dayMaster === assetWuxing) return { score: 10, level: '比肩', desc: '同属性，懂它但难暴富', tag: '稳', color: '#a78bfa' };
  if (XIANGSHENG[dayMaster] === assetWuxing) return { score: 8, level: '食伤', desc: '能驾驭它，适合主动操作', tag: '宜', color: '#60a5fa' };
  if (XIANGSHENG_REV[dayMaster] === assetWuxing) return { score: 5, level: '印星', desc: '它能帮你，需要耐心', tag: '缓', color: '#fbbf24' };
  if (XIANGKE[dayMaster] === assetWuxing) return { score: 15, level: '正财', desc: '天生财星！机会吃大肉', tag: '旺', color: '#4ade80' };
  return { score: -5, level: '七杀', desc: '它克你，容易被割', tag: '险', color: '#f87171' };
}

function calculateCompatibility(bazi1, bazi2, date, assetKey) {
  const dm1 = WUXING[bazi1.dayMaster], dm2 = WUXING[bazi2.dayMaster];
  const asset = ASSETS[assetKey];
  let score = 50, insights = [];

  if (dm1 === dm2) { score += 12; insights.push({ type: 'good', title: '同频共振', desc: `都是${dm1}命，投资DNA相似，容易想到一块` }); }
  else if (XIANGSHENG[dm1] === dm2) { score += 18; insights.push({ type: 'great', title: '能量加持', desc: `你的${dm1}生ta的${dm2}，你的建议会放大ta的财运` }); }
  else if (XIANGSHENG[dm2] === dm1) { score += 15; insights.push({ type: 'great', title: '贵人相助', desc: `ta的${dm2}生你的${dm1}，ta的建议对你有加成` }); }
  else if (XIANGKE[dm1] === dm2) { score -= 8; insights.push({ type: 'warn', title: '理念冲突', desc: `${dm1}克${dm2}，你俩看问题角度很不一样` }); }
  else if (XIANGKE[dm2] === dm1) { score -= 12; insights.push({ type: 'bad', title: '能量消耗', desc: `ta的${dm2}克你，盲目跟可能亏更多` }); }
  else { insights.push({ type: 'neutral', title: '各有所长', desc: `${dm1}与${dm2}关系中性，取长补短` }); }

  const yours = analyzeAssetMatch(dm1, asset.wuxing);
  const theirs = analyzeAssetMatch(dm2, asset.wuxing);
  score += yours.score + Math.floor(theirs.score * 0.5);

  const dateBazi = getBazi(date.getFullYear(), date.getMonth() + 1, date.getDate(), 12);
  const dateW = WUXING[dateBazi.day.gan];
  let dateScore = 0, dateText = '';
  if (XIANGSHENG[dateW] === dm1 || XIANGSHENG[dateW] === asset.wuxing) { dateScore = 8; dateText = `${dateBazi.day.gan}日属${dateW}，能量顺畅，timing不错`; }
  else if (XIANGKE[dateW] === dm1) { dateScore = -5; dateText = `${dateBazi.day.gan}日克你，今天决策易冲动，建议冷静几天`; }
  else { dateText = `${dateBazi.day.gan}日能量中性，不好不坏`; }
  score += dateScore;

  return { score: Math.min(98, Math.max(12, score)), dm1, dm2, insights, yours, theirs, dateText, dateGan: dateBazi.day.gan };
}

function getVerdict(score) {
  if (score >= 80) return { text: '神仙搭档', emoji: '🔥', color: '#4ade80', gradient: 'linear-gradient(135deg, #4ade80, #22c55e)', advice: '这建议值得认真听！你俩财运同频，冲就完事' };
  if (score >= 65) return { text: '可以参考', emoji: '👍', color: '#60a5fa', gradient: 'linear-gradient(135deg, #60a5fa, #3b82f6)', advice: '整体还行，但保持独立思考，别无脑跟' };
  if (score >= 50) return { text: '谨慎考虑', emoji: '🤔', color: '#fbbf24', gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)', advice: '契合度一般，多找几个人意见对比下' };
  if (score >= 35) return { text: '不太搭', emoji: '😬', color: '#fb923c', gradient: 'linear-gradient(135deg, #fb923c, #f97316)', advice: 'ta在这标的上不是你财运贵人，换个人问' };
  return { text: '别听', emoji: '🙅', color: '#f87171', gradient: 'linear-gradient(135deg, #f87171, #ef4444)', advice: '你俩八字不合，ta的建议大概率不适合你' };
}

export default function HeCaiApp() {
  const [step, setStep] = useState(0);
  const [you, setYou] = useState({ year: 1995, month: 6, day: 15, hour: 10 });
  const [them, setThem] = useState({ year: 1993, month: 3, day: 22, hour: 14 });
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [asset, setAsset] = useState('BTC');
  const [result, setResult] = useState(null);
  const [animScore, setAnimScore] = useState(0);

  useEffect(() => {
    if (result && step === 1) {
      let current = 0;
      const interval = setInterval(() => {
        current += 2;
        if (current >= result.score) { setAnimScore(result.score); clearInterval(interval); }
        else setAnimScore(current);
      }, 20);
      return () => clearInterval(interval);
    }
  }, [result, step]);

  const calculate = () => {
    const b1 = getBazi(you.year, you.month, you.day, you.hour);
    const b2 = getBazi(them.year, them.month, them.day, them.hour);
    const r = calculateCompatibility(b1, b2, new Date(date), asset);
    setResult({ ...r, verdict: getVerdict(r.score) });
    setAnimScore(0);
    setStep(1);
  };

  const SelectWheel = ({ value, options, onChange, label }) => (
    <div className="select-wrapper">
      <span className="select-label">{label}</span>
      <select value={value} onChange={e => onChange(+e.target.value)}>
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        .app {
          min-height: 100vh;
          background: #050505;
          font-family: 'Outfit', -apple-system, sans-serif;
          color: #fff;
          overflow-x: hidden;
          position: relative;
        }
        
        .app::before {
          content: '';
          position: fixed;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: 
            radial-gradient(ellipse at 20% 20%, rgba(124, 58, 237, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 60%);
          animation: bgMove 20s ease-in-out infinite;
          pointer-events: none;
        }
        
        @keyframes bgMove {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(2%, 2%) rotate(1deg); }
          66% { transform: translate(-1%, 1%) rotate(-1deg); }
        }
        
        .container {
          max-width: 480px;
          margin: 0 auto;
          padding: 20px;
          position: relative;
          z-index: 1;
        }
        
        .header {
          text-align: center;
          padding: 50px 0 40px;
        }
        
        .logo {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
          background: linear-gradient(135deg, #7c3aed, #ec4899);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          box-shadow: 0 20px 40px rgba(124, 58, 237, 0.3);
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .title {
          font-size: 2.2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #fff 0%, #a78bfa 50%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }
        
        .subtitle {
          color: #71717a;
          font-size: 0.95rem;
          margin-top: 8px;
          font-weight: 400;
        }
        
        .section {
          background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 24px;
          margin-bottom: 16px;
        }
        
        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        
        .section-icon {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(236, 72, 153, 0.2));
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
        }
        
        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
        }
        
        .section-subtitle {
          font-size: 0.75rem;
          color: #71717a;
        }
        
        .select-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        
        .select-wrapper {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .select-label {
          font-size: 0.7rem;
          color: #52525b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        select {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 12px 8px;
          color: #fff;
          font-family: 'Outfit', sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          -webkit-appearance: none;
        }
        
        select:hover { background: rgba(255,255,255,0.08); }
        select:focus { outline: none; border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.2); }
        select option { background: #18181b; }
        
        input[type="date"] {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 14px 16px;
          color: #fff;
          font-family: 'Outfit', sans-serif;
          font-size: 1rem;
          cursor: pointer;
        }
        
        input[type="date"]:focus { outline: none; border-color: #7c3aed; }
        
        .asset-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        
        .asset-card {
          background: rgba(255,255,255,0.03);
          border: 2px solid transparent;
          border-radius: 16px;
          padding: 18px 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .asset-card::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.3s;
        }
        
        .asset-card:hover { transform: translateY(-4px); background: rgba(255,255,255,0.06); }
        
        .asset-card.selected {
          border-color: var(--asset-color);
          background: var(--asset-bg);
          box-shadow: 0 8px 32px rgba(124, 58, 237, 0.2);
        }
        
        .asset-icon {
          font-size: 2rem;
          margin-bottom: 8px;
          filter: grayscale(0.3);
          transition: filter 0.3s;
        }
        
        .asset-card.selected .asset-icon { filter: grayscale(0); }
        
        .asset-name {
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .asset-tag {
          font-size: 0.65rem;
          color: #71717a;
          padding: 2px 8px;
          background: rgba(255,255,255,0.05);
          border-radius: 20px;
          display: inline-block;
        }
        
        .btn-main {
          width: 100%;
          padding: 18px;
          border: none;
          border-radius: 16px;
          font-family: 'Outfit', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          background: linear-gradient(135deg, #7c3aed, #ec4899);
          color: #fff;
          transition: all 0.3s;
          box-shadow: 0 10px 40px rgba(124, 58, 237, 0.4);
          margin-top: 10px;
        }
        
        .btn-main:hover { transform: translateY(-2px); box-shadow: 0 15px 50px rgba(124, 58, 237, 0.5); }
        .btn-main:active { transform: translateY(0); }
        
        /* Result Page */
        .result-header {
          text-align: center;
          padding: 40px 20px;
          position: relative;
        }
        
        .score-orbit {
          width: 200px;
          height: 200px;
          margin: 0 auto 24px;
          position: relative;
        }
        
        .orbit-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 3px solid rgba(255,255,255,0.05);
        }
        
        .orbit-progress {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: conic-gradient(var(--verdict-color) calc(var(--progress) * 3.6deg), transparent 0);
          -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 6px), #fff calc(100% - 5px));
          mask: radial-gradient(farthest-side, transparent calc(100% - 6px), #fff calc(100% - 5px));
          transition: --progress 0.5s;
        }
        
        .orbit-glow {
          position: absolute;
          inset: -20px;
          border-radius: 50%;
          background: radial-gradient(circle, var(--verdict-color) 0%, transparent 70%);
          opacity: 0.2;
          filter: blur(20px);
        }
        
        .score-center {
          position: absolute;
          inset: 20px;
          background: rgba(5, 5, 5, 0.8);
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .score-num {
          font-size: 4rem;
          font-weight: 800;
          line-height: 1;
          background: var(--verdict-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .score-label {
          font-size: 1.2rem;
          font-weight: 600;
          margin-top: 4px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .verdict-advice {
          color: #a1a1aa;
          font-size: 0.95rem;
          line-height: 1.6;
          max-width: 300px;
          margin: 0 auto;
        }
        
        .insight-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 12px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        
        .insight-badge {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }
        
        .insight-badge.great { background: linear-gradient(135deg, rgba(74, 222, 128, 0.2), rgba(34, 197, 94, 0.1)); }
        .insight-badge.good { background: linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(124, 58, 237, 0.1)); }
        .insight-badge.neutral { background: linear-gradient(135deg, rgba(161, 161, 170, 0.2), rgba(113, 113, 122, 0.1)); }
        .insight-badge.warn { background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.1)); }
        .insight-badge.bad { background: linear-gradient(135deg, rgba(248, 113, 113, 0.2), rgba(239, 68, 68, 0.1)); }
        
        .insight-content { flex: 1; }
        .insight-title { font-weight: 600; font-size: 1rem; margin-bottom: 4px; }
        .insight-desc { color: #a1a1aa; font-size: 0.85rem; line-height: 1.5; }
        
        .persona-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .persona-card {
          border-radius: 20px;
          padding: 20px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .persona-card::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.15;
        }
        
        .persona-emoji { font-size: 2.5rem; margin-bottom: 10px; position: relative; z-index: 1; }
        .persona-label { font-size: 0.7rem; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.1em; position: relative; z-index: 1; }
        .persona-type { font-size: 1.1rem; font-weight: 700; margin: 6px 0; position: relative; z-index: 1; }
        .persona-desc { font-size: 0.75rem; color: rgba(255,255,255,0.6); line-height: 1.4; position: relative; z-index: 1; }
        
        .match-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 12px;
        }
        
        .match-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 16px;
        }
        
        .match-icon { font-size: 2.5rem; }
        .match-info h3 { font-size: 1.2rem; font-weight: 700; }
        .match-info p { font-size: 0.8rem; color: #71717a; }
        
        .match-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        
        .match-label { color: #a1a1aa; font-size: 0.9rem; }
        
        .match-value {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .match-tag {
          padding: 4px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        .match-desc { font-size: 0.75rem; color: #71717a; }
        
        .date-card {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(124, 58, 237, 0.05));
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 16px;
          padding: 16px 20px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        
        .date-icon { font-size: 1.5rem; }
        .date-text { flex: 1; }
        .date-title { font-weight: 600; font-size: 0.9rem; }
        .date-desc { font-size: 0.8rem; color: #a1a1aa; margin-top: 2px; }
        
        .action-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 24px;
        }
        
        .btn-ghost {
          padding: 14px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          background: transparent;
          color: #a1a1aa;
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-ghost:hover { background: rgba(255,255,255,0.05); color: #fff; border-color: rgba(255,255,255,0.2); }
        
        .btn-share {
          padding: 14px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(135deg, #7c3aed, #ec4899);
          color: #fff;
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-share:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(124, 58, 237, 0.4); }
        
        .disclaimer {
          text-align: center;
          font-size: 0.7rem;
          color: #52525b;
          margin-top: 30px;
          padding: 20px;
          line-height: 1.6;
        }
      `}</style>

      <div className="container">
        {step === 0 ? (
          <>
            <header className="header">
              <div className="logo">💰</div>
              <h1 className="title">合财测试</h1>
              <p className="subtitle">ta的理财建议适合你吗？用八字算一算</p>
            </header>

            <section className="section">
              <div className="section-header">
                <div className="section-icon">👤</div>
                <div>
                  <div className="section-title">你的生辰八字</div>
                  <div className="section-subtitle">输入阳历出生日期</div>
                </div>
              </div>
              <div className="select-grid">
                <SelectWheel label="年" value={you.year} onChange={v => setYou({...you, year: v})} options={Array.from({length:50}, (_,i) => ({v: 2006-i, l: 2006-i}))} />
                <SelectWheel label="月" value={you.month} onChange={v => setYou({...you, month: v})} options={Array.from({length:12}, (_,i) => ({v: i+1, l: `${i+1}月`}))} />
                <SelectWheel label="日" value={you.day} onChange={v => setYou({...you, day: v})} options={Array.from({length:31}, (_,i) => ({v: i+1, l: i+1}))} />
                <SelectWheel label="时" value={you.hour} onChange={v => setYou({...you, hour: v})} options={[[0,'子'],[2,'丑'],[4,'寅'],[6,'卯'],[8,'辰'],[10,'巳'],[12,'午'],[14,'未'],[16,'申'],[18,'酉'],[20,'戌'],[22,'亥']].map(([v,n]) => ({v, l: `${n}时`}))} />
              </div>
            </section>

            <section className="section">
              <div className="section-header">
                <div className="section-icon">👥</div>
                <div>
                  <div className="section-title">给你建议的人</div>
                  <div className="section-subtitle">那个让你买XX的朋友</div>
                </div>
              </div>
              <div className="select-grid">
                <SelectWheel label="年" value={them.year} onChange={v => setThem({...them, year: v})} options={Array.from({length:50}, (_,i) => ({v: 2006-i, l: 2006-i}))} />
                <SelectWheel label="月" value={them.month} onChange={v => setThem({...them, month: v})} options={Array.from({length:12}, (_,i) => ({v: i+1, l: `${i+1}月`}))} />
                <SelectWheel label="日" value={them.day} onChange={v => setThem({...them, day: v})} options={Array.from({length:31}, (_,i) => ({v: i+1, l: i+1}))} />
                <SelectWheel label="时" value={them.hour} onChange={v => setThem({...them, hour: v})} options={[[0,'子'],[2,'丑'],[4,'寅'],[6,'卯'],[8,'辰'],[10,'巳'],[12,'午'],[14,'未'],[16,'申'],[18,'酉'],[20,'戌'],[22,'亥']].map(([v,n]) => ({v, l: `${n}时`}))} />
              </div>
            </section>

            <section className="section">
              <div className="section-header">
                <div className="section-icon">📅</div>
                <div>
                  <div className="section-title">讨论日期</div>
                  <div className="section-subtitle">哪天聊的这事</div>
                </div>
              </div>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </section>

            <section className="section">
              <div className="section-header">
                <div className="section-icon">📈</div>
                <div>
                  <div className="section-title">聊的是什么</div>
                  <div className="section-subtitle">选择投资标的</div>
                </div>
              </div>
              <div className="asset-grid">
                {Object.entries(ASSETS).map(([k, a]) => (
                  <div 
                    key={k} 
                    className={`asset-card ${asset === k ? 'selected' : ''}`}
                    style={{'--asset-color': a.color, '--asset-bg': a.bg}}
                    onClick={() => setAsset(k)}
                  >
                    <div className="asset-icon">{a.icon}</div>
                    <div className="asset-name">{a.name}</div>
                    <div className="asset-tag">{a.wuxing}属性</div>
                  </div>
                ))}
              </div>
            </section>

            <button className="btn-main" onClick={calculate}>开始测算 ✨</button>
          </>
        ) : result && (
          <>
            <div className="result-header" style={{'--verdict-color': result.verdict.color, '--verdict-gradient': result.verdict.gradient, '--progress': animScore}}>
              <div className="score-orbit">
                <div className="orbit-glow"></div>
                <div className="orbit-ring"></div>
                <div className="orbit-progress"></div>
                <div className="score-center">
                  <div className="score-num">{animScore}</div>
                  <div className="score-label">{result.verdict.emoji} {result.verdict.text}</div>
                </div>
              </div>
              <p className="verdict-advice">{result.verdict.advice}</p>
            </div>

            {result.insights.map((ins, i) => (
              <div key={i} className="insight-card">
                <div className={`insight-badge ${ins.type}`}>
                  {ins.type === 'great' ? '🌟' : ins.type === 'good' ? '✨' : ins.type === 'warn' ? '⚠️' : ins.type === 'bad' ? '💥' : '➡️'}
                </div>
                <div className="insight-content">
                  <div className="insight-title">{ins.title}</div>
                  <div className="insight-desc">{ins.desc}</div>
                </div>
              </div>
            ))}

            <div className="persona-grid">
              <div className="persona-card" style={{background: WUXING_DATA[result.dm1].gradient}}>
                <div className="persona-emoji">{WUXING_DATA[result.dm1].emoji}</div>
                <div className="persona-label">你的财运人格</div>
                <div className="persona-type">{WUXING_DATA[result.dm1].energy}</div>
                <div className="persona-desc">{WUXING_DATA[result.dm1].style}</div>
              </div>
              <div className="persona-card" style={{background: WUXING_DATA[result.dm2].gradient}}>
                <div className="persona-emoji">{WUXING_DATA[result.dm2].emoji}</div>
                <div className="persona-label">ta的财运人格</div>
                <div className="persona-type">{WUXING_DATA[result.dm2].energy}</div>
                <div className="persona-desc">{WUXING_DATA[result.dm2].style}</div>
              </div>
            </div>

            <div className="match-card">
              <div className="match-header">
                <span className="match-icon">{ASSETS[asset].icon}</span>
                <div className="match-info">
                  <h3>{ASSETS[asset].name}</h3>
                  <p>五行属{ASSETS[asset].wuxing}</p>
                </div>
              </div>
              <div className="match-row">
                <span className="match-label">你的匹配度</span>
                <div className="match-value">
                  <span className="match-tag" style={{background: `${result.yours.color}22`, color: result.yours.color}}>{result.yours.tag}</span>
                  <span className="match-desc">{result.yours.desc}</span>
                </div>
              </div>
              <div className="match-row">
                <span className="match-label">ta的匹配度</span>
                <div className="match-value">
                  <span className="match-tag" style={{background: `${result.theirs.color}22`, color: result.theirs.color}}>{result.theirs.tag}</span>
                  <span className="match-desc">{result.theirs.desc}</span>
                </div>
              </div>
            </div>

            <div className="date-card">
              <span className="date-icon">📆</span>
              <div className="date-text">
                <div className="date-title">{date} · {result.dateGan}日</div>
                <div className="date-desc">{result.dateText}</div>
              </div>
            </div>

            <div className="action-grid">
              <button className="btn-ghost" onClick={() => setStep(0)}>重新测算</button>
              <button className="btn-share" onClick={() => {
                const t = `我的合财测试得分 ${result.score} 分！${result.verdict.text} ${result.verdict.emoji}\n快来测测该不该听朋友的投资建议～`;
                navigator.share ? navigator.share({title: '合财测试', text: t}) : (navigator.clipboard.writeText(t), alert('已复制!'));
              }}>分享结果 📤</button>
            </div>

            <p className="disclaimer">⚠️ 本测试仅供娱乐，不构成任何投资建议<br/>投资有风险，入市需谨慎</p>
          </>
        )}
      </div>
    </div>
  );
}
