import React, { useState, useEffect, useRef } from 'react';

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

// 分析个人与标的的命理关系（用于35%你与标的、25%ta与标的）
function analyzeAssetMatch(dayMaster, assetWuxing) {
  // 计算此人的财星（克我者为财）
  const myWealth = XIANGKE[dayMaster]; // 我克者为财
  
  // 标的是我的财星 → 大吉
  if (assetWuxing === myWealth) {
    return { score: 100, level: '正财', desc: '天生财星！有机会吃到大肉', tag: '旺', color: '#4ade80' };
  }
  // 标的生我的财星 → 中吉（间接生财）
  if (XIANGSHENG[assetWuxing] === myWealth) {
    return { score: 75, level: '偏财', desc: '间接生财，把握机会能赚', tag: '吉', color: '#22d3ee' };
  }
  // 标的是食伤（我生者）→ 中等，能驾驭但要付出
  if (XIANGSHENG[dayMaster] === assetWuxing) {
    return { score: 60, level: '食伤', desc: '能驾驭它，但需主动出击', tag: '宜', color: '#60a5fa' };
  }
  // 标的与我同属性（比劫）→ 平，竞争关系
  if (dayMaster === assetWuxing) {
    return { score: 45, level: '比肩', desc: '同属性，懂它但竞争大', tag: '平', color: '#a78bfa' };
  }
  // 标的是印星（生我者）→ 小凶，财克印
  if (XIANGSHENG_REV[dayMaster] === assetWuxing) {
    return { score: 30, level: '印星', desc: '财印相克，操作易纠结', tag: '缓', color: '#fbbf24' };
  }
  // 标的是官杀（克我者）→ 凶，压力大
  return { score: 15, level: '七杀', desc: '它克你，容易被收割', tag: '险', color: '#f87171' };
}

// 分析两人的财运贵人关系（25%权重）
function analyzeRelationship(dm1, dm2, assetWuxing) {
  const yourWealth = XIANGKE[dm1]; // 你的财星
  
  let score = 50, insight = null;
  
  // ta的日主就是你的财星 → 大贵人！ta本身带财给你
  if (dm2 === yourWealth) {
    score = 100;
    insight = { type: 'great', title: '财运贵人', desc: `ta属${dm2}正是你的财星，ta的建议自带财气加持` };
  }
  // ta的日主生你的财星 → 贵人，间接助你发财
  else if (XIANGSHENG[dm2] === yourWealth) {
    score = 85;
    insight = { type: 'great', title: '间接贵人', desc: `ta的${dm2}生你的财星${yourWealth}，建议有助于你获财` };
  }
  // ta的日主与标的相同 → ta对这个标的有天然感应
  else if (dm2 === assetWuxing) {
    score = 75;
    insight = { type: 'good', title: '标的共鸣', desc: `ta属${dm2}与${assetWuxing}标的同频，对它有直觉` };
  }
  // 同属性 → 想法相近
  else if (dm1 === dm2) {
    score = 60;
    insight = { type: 'good', title: '同频共振', desc: `都是${dm1}命，投资理念相近，容易达成共识` };
  }
  // ta生你 → 有帮助但不是财运方面
  else if (XIANGSHENG[dm2] === dm1) {
    score = 55;
    insight = { type: 'neutral', title: '能量支持', desc: `ta的${dm2}生你的${dm1}，有好意但未必懂你的财` };
  }
  // 你生ta → 你的能量流向ta
  else if (XIANGSHENG[dm1] === dm2) {
    score = 40;
    insight = { type: 'warn', title: '能量外泄', desc: `你的${dm1}生ta的${dm2}，跟ta合作你付出更多` };
  }
  // ta克你 → 小人，建议可能有坑
  else if (XIANGKE[dm2] === dm1) {
    score = 20;
    insight = { type: 'bad', title: '气场相克', desc: `ta的${dm2}克你的${dm1}，ta的建议可能不适合你` };
  }
  // 你克ta → ta被你压制，建议打折
  else if (XIANGKE[dm1] === dm2) {
    score = 35;
    insight = { type: 'warn', title: '气场压制', desc: `你克ta，ta在你面前可能没说真心话` };
  }
  // 其他关系
  else {
    score = 50;
    insight = { type: 'neutral', title: '关系中性', desc: `${dm1}与${dm2}无直接生克，建议客观参考` };
  }
  
  return { score, insight };
}

// 分析日期择时（15%权重）
function analyzeDateTiming(dateGan, dm1, assetWuxing) {
  const dateW = WUXING[dateGan];
  const yourWealth = XIANGKE[dm1];
  
  let score = 50, text = '';
  
  // 日期生你的财星 → 大吉日
  if (XIANGSHENG[dateW] === yourWealth) {
    score = 100;
    text = `${dateGan}日属${dateW}，生旺你的财星，是行动吉日`;
  }
  // 日期与标的相同 → 能量共振
  else if (dateW === assetWuxing) {
    score = 80;
    text = `${dateGan}日与标的同属${dateW}，能量共振，可以关注`;
  }
  // 日期生你 → 中吉
  else if (XIANGSHENG[dateW] === dm1) {
    score = 70;
    text = `${dateGan}日属${dateW}生你，精力充沛，判断力佳`;
  }
  // 日期生标的 → 小吉
  else if (XIANGSHENG[dateW] === assetWuxing) {
    score = 65;
    text = `${dateGan}日生旺${assetWuxing}标的，标的有上涨能量`;
  }
  // 日期克你 → 凶日
  else if (XIANGKE[dateW] === dm1) {
    score = 20;
    text = `${dateGan}日属${dateW}克你，今日决策易冲动，建议缓几天`;
  }
  // 日期克标的 → 小凶
  else if (XIANGKE[dateW] === assetWuxing) {
    score = 35;
    text = `${dateGan}日克制${assetWuxing}标的，标的短期可能承压`;
  }
  // 中性
  else {
    score = 50;
    text = `${dateGan}日属${dateW}，能量中性，无特别吉凶`;
  }
  
  return { score, text, dateW };
}

// 主计算函数：按权重汇总
function calculateCompatibility(bazi1, bazi2, date, assetKey) {
  const dm1 = WUXING[bazi1.dayMaster], dm2 = WUXING[bazi2.dayMaster];
  const asset = ASSETS[assetKey];
  const assetW = asset.wuxing;
  
  // 1. 你与标的匹配（35%权重）
  const yours = analyzeAssetMatch(dm1, assetW);
  const yoursWeighted = yours.score * 0.35;
  
  // 2. ta与标的匹配（25%权重）
  const theirs = analyzeAssetMatch(dm2, assetW);
  const theirsWeighted = theirs.score * 0.25;
  
  // 3. 两人财运关系（25%权重）
  const relationship = analyzeRelationship(dm1, dm2, assetW);
  const relationWeighted = relationship.score * 0.25;
  
  // 4. 日期择时（15%权重）
  const dateBazi = getBazi(date.getFullYear(), date.getMonth() + 1, date.getDate(), 12);
  const dateTiming = analyzeDateTiming(dateBazi.day.gan, dm1, assetW);
  const dateWeighted = dateTiming.score * 0.15;
  
  // 汇总得分
  const totalScore = Math.round(yoursWeighted + theirsWeighted + relationWeighted + dateWeighted);
  const finalScore = Math.min(98, Math.max(12, totalScore));
  
  // 生成洞察
  const insights = [relationship.insight];
  
  // 添加标的匹配洞察
  if (yours.score >= 75) {
    insights.push({ type: 'great', title: '你有财缘', desc: `你与${asset.name}（${assetW}）命理相合，这是你的财` });
  } else if (yours.score <= 30) {
    insights.push({ type: 'bad', title: '标的不合', desc: `${asset.name}（${assetW}）与你相克，谨慎为上` });
  }
  
  if (theirs.score >= 75 && yours.score < 75) {
    insights.push({ type: 'warn', title: 'ta比你更适合', desc: `ta与${asset.name}更有财缘，但ta的财不等于你的财` });
  } else if (theirs.score >= 75 && yours.score >= 75) {
    insights.push({ type: 'great', title: '双双有财', desc: `你俩都与${asset.name}有缘，这个建议靠谱` });
  }
  
  return { 
    score: finalScore, 
    dm1, 
    dm2, 
    insights: insights.filter(Boolean),
    yours, 
    theirs, 
    relationship,
    dateText: dateTiming.text, 
    dateGan: dateBazi.day.gan,
    // 分项得分（用于展示）
    breakdown: {
      youAsset: Math.round(yours.score),
      theyAsset: Math.round(theirs.score),
      relation: Math.round(relationship.score),
      timing: Math.round(dateTiming.score)
    }
  };
}

function getVerdict(score) {
  if (score >= 80) return { text: '神仙搭档', emoji: '🔥', color: '#4ade80', gradient: 'linear-gradient(135deg, #4ade80, #22c55e)', advice: '天时地利人和！这个建议值得认真考虑，冲就完事' };
  if (score >= 65) return { text: '可以参考', emoji: '👍', color: '#60a5fa', gradient: 'linear-gradient(135deg, #60a5fa, #3b82f6)', advice: '整体不错，但记得保持独立判断，别无脑跟' };
  if (score >= 50) return { text: '谨慎考虑', emoji: '🤔', color: '#fbbf24', gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)', advice: '契合度一般，建议多做研究，或换个人问问' };
  if (score >= 35) return { text: '不太搭', emoji: '😬', color: '#fb923c', gradient: 'linear-gradient(135deg, #fb923c, #f97316)', advice: '命理上不太适合听ta这个建议，三思而后行' };
  return { text: '别听', emoji: '🙅', color: '#f87171', gradient: 'linear-gradient(135deg, #f87171, #ef4444)', advice: '你俩在这事上八字不合，ta的建议大概率不适合你' };
}

export default function HeCaiApp() {
  const [step, setStep] = useState(0);
  const [you, setYou] = useState({ year: 1995, month: 6, day: 15, hour: 10 });
  const [them, setThem] = useState({ year: 1993, month: 3, day: 22, hour: 14 });
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [asset, setAsset] = useState('BTC');
  const [result, setResult] = useState(null);
  const [animScore, setAnimScore] = useState(0);
  const [showShareCard, setShowShareCard] = useState(false);
  const shareCardRef = useRef(null);

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

  const handleShare = async () => {
    setShowShareCard(true);
  };

  const downloadCard = async () => {
    if (!shareCardRef.current) return;
    try {
      const html2canvas = (await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm')).default;
      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: '#0a0a0a',
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `合财测试-${result.score}分.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      // Fallback: 直接截图提示
      alert('请长按卡片保存图片，或截图分享～');
    }
  };

  const shareToSocial = async () => {
    const text = `我的合财测试得分 ${result.score} 分！${result.verdict.text} ${result.verdict.emoji}\n\n${WUXING_DATA[result.dm1].emoji} 我是${WUXING_DATA[result.dm1].energy}\n${WUXING_DATA[result.dm2].emoji} ta是${WUXING_DATA[result.dm2].energy}\n\n测测你该不该听朋友的投资建议 👉 hecai.trade`;
    if (navigator.share) {
      try {
        await navigator.share({ title: '合财测试', text });
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(text);
      alert('已复制到剪贴板！');
    }
  };

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
        
        /* Share Card Modal */
        .share-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.9);
          backdrop-filter: blur(10px);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .share-card {
          width: 340px;
          background: linear-gradient(165deg, #1a1025 0%, #0f0a15 50%, #0a0510 100%);
          border-radius: 24px;
          padding: 32px 24px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 25px 80px rgba(124, 58, 237, 0.3), 0 0 0 1px rgba(255,255,255,0.1);
        }
        
        .share-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(ellipse at 30% 20%, rgba(124, 58, 237, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at 70% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }
        
        .share-card-content {
          position: relative;
          z-index: 1;
        }
        
        .share-card-header {
          text-align: center;
          margin-bottom: 24px;
        }
        
        .share-card-logo {
          font-size: 2.5rem;
          margin-bottom: 8px;
        }
        
        .share-card-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #a1a1aa;
          letter-spacing: 0.1em;
        }
        
        .share-card-score {
          text-align: center;
          margin-bottom: 24px;
        }
        
        .share-score-num {
          font-size: 5rem;
          font-weight: 800;
          line-height: 1;
          background: var(--card-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .share-score-label {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .share-card-personas {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .share-persona {
          text-align: center;
          padding: 16px;
          background: rgba(255,255,255,0.05);
          border-radius: 16px;
          flex: 1;
        }
        
        .share-persona-emoji {
          font-size: 2rem;
          margin-bottom: 6px;
        }
        
        .share-persona-label {
          font-size: 0.65rem;
          color: #71717a;
          margin-bottom: 4px;
        }
        
        .share-persona-type {
          font-size: 0.9rem;
          font-weight: 600;
        }
        
        .share-card-asset {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 14px;
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          margin-bottom: 20px;
        }
        
        .share-asset-icon {
          font-size: 1.8rem;
        }
        
        .share-asset-name {
          font-size: 1rem;
          font-weight: 600;
        }
        
        .share-card-footer {
          text-align: center;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        
        .share-card-url {
          font-size: 0.85rem;
          color: #a78bfa;
          font-weight: 500;
        }
        
        .share-card-slogan {
          font-size: 0.7rem;
          color: #52525b;
          margin-top: 6px;
        }
        
        .share-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          width: 340px;
        }
        
        .share-actions button {
          flex: 1;
          padding: 14px;
          border-radius: 12px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-download {
          background: #fff;
          color: #000;
          border: none;
        }
        
        .btn-download:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255,255,255,0.2);
        }
        
        .btn-copy {
          background: transparent;
          color: #fff;
          border: 1px solid rgba(255,255,255,0.2);
        }
        
        .btn-copy:hover {
          background: rgba(255,255,255,0.1);
        }
        
        .btn-close-share {
          margin-top: 16px;
          background: none;
          border: none;
          color: #71717a;
          font-size: 0.85rem;
          cursor: pointer;
          padding: 10px 20px;
        }
        
        .btn-close-share:hover {
          color: #fff;
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
                <SelectWheel label="时" value={you.hour} onChange={v => setYou({...you, hour: v})} options={[[0,'23-1点'],[2,'1-3点'],[4,'3-5点'],[6,'5-7点'],[8,'7-9点'],[10,'9-11点'],[12,'11-13点'],[14,'13-15点'],[16,'15-17点'],[18,'17-19点'],[20,'19-21点'],[22,'21-23点']].map(([v,n]) => ({v, l: n}))} />
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
                <SelectWheel label="时" value={them.hour} onChange={v => setThem({...them, hour: v})} options={[[0,'23-1点'],[2,'1-3点'],[4,'3-5点'],[6,'5-7点'],[8,'7-9点'],[10,'9-11点'],[12,'11-13点'],[14,'13-15点'],[16,'15-17点'],[18,'17-19点'],[20,'19-21点'],[22,'21-23点']].map(([v,n]) => ({v, l: n}))} />
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
              <button className="btn-share" onClick={handleShare}>生成分享卡片 📤</button>
            </div>

            <p className="disclaimer">⚠️ 本测试仅供娱乐，不构成任何投资建议<br/>投资有风险，入市需谨慎</p>
          </>
        )}
      </div>

      {/* 分享卡片弹窗 */}
      {showShareCard && result && (
        <div className="share-overlay" onClick={(e) => e.target === e.currentTarget && setShowShareCard(false)}>
          <div className="share-card" ref={shareCardRef} style={{'--card-gradient': result.verdict.gradient}}>
            <div className="share-card-content">
              <div className="share-card-header">
                <div className="share-card-logo">💰</div>
                <div className="share-card-title">合 财 测 试</div>
              </div>
              
              <div className="share-card-score">
                <div className="share-score-num">{result.score}</div>
                <div className="share-score-label" style={{color: result.verdict.color}}>
                  {result.verdict.emoji} {result.verdict.text}
                </div>
              </div>
              
              <div className="share-card-personas">
                <div className="share-persona">
                  <div className="share-persona-emoji">{WUXING_DATA[result.dm1].emoji}</div>
                  <div className="share-persona-label">我</div>
                  <div className="share-persona-type">{WUXING_DATA[result.dm1].energy}</div>
                </div>
                <div className="share-persona">
                  <div className="share-persona-emoji">{WUXING_DATA[result.dm2].emoji}</div>
                  <div className="share-persona-label">ta</div>
                  <div className="share-persona-type">{WUXING_DATA[result.dm2].energy}</div>
                </div>
              </div>
              
              <div className="share-card-asset">
                <span className="share-asset-icon">{ASSETS[asset].icon}</span>
                <span className="share-asset-name">讨论标的：{ASSETS[asset].name}</span>
              </div>
              
              <div className="share-card-footer">
                <div className="share-card-url">hecai.trade</div>
                <div className="share-card-slogan">测测该不该听朋友的投资建议</div>
              </div>
            </div>
          </div>
          
          <div className="share-actions">
            <button className="btn-download" onClick={downloadCard}>保存图片 📥</button>
            <button className="btn-copy" onClick={shareToSocial}>复制文案 📋</button>
          </div>
          
          <button className="btn-close-share" onClick={() => setShowShareCard(false)}>关闭</button>
        </div>
      )}
    </div>
  );
}
