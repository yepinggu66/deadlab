/**
 * DEADLAB · 遥测与审讯引擎 (Telemetry & Inquisitor v2.1.0)
 * 提供：
 *   1. 冷酷投资人证据审讯室 (Inquisitor Engine): 对抗式质询与证据打折解锁
 *   2. GitHub 活体脉搏心电图算法 (Vital Pulse Engine): 提交失温指数与动态波形生成
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DEADLAB_TELEMETRY = factory();
    if (typeof window !== 'undefined') window.DEADLAB_TELEMETRY = root.DEADLAB_TELEMETRY;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  // ---------------------------------------------------------------------------
  // 1. 冷酷投资人证据审讯室 (Inquisitor Engine)
  // ---------------------------------------------------------------------------

  /**
   * 审阅商业计划书、PRD 或落地页文案，抛出尖锐三问与初始证据打折
   * @param {string} text 文案或计划
   * @param {string} url 落地页 URL (可选)
   */
  function auditCommercialCase(text, url) {
    text = (text || '').trim();
    url = (url || '').trim();
    const fullText = (text + ' ' + url).toLowerCase();

    // 默认自填假设 (初始全部处于未核验状态，打 5 折锁定在 0~1)
    const baseLv = { need: 0, cap: 1, econ: 0, dist: 0, dep: 0, stam: 1 };
    const questions = [];
    const evidenceDeficits = [];

    // 1. 需求验证审讯 (Demand)
    const hasPreorder = /preorder|deposit|paying customer|order|revenue|mrr|arr|定金|预售|付费用户|意向金|已收/i.test(fullText);
    const hasWaitlist = /waitlist|subscribe|email|候补|预约|邮箱/i.test(fullText);
    if (hasPreorder) {
      baseLv.need = 2;
    } else if (hasWaitlist) {
      baseLv.need = 1;
      questions.push({
        dim: 'need',
        q: '【需求真实度存疑】检测到你有预约名单，但过去 30 天内是否有任何陌生人为你支付过定金？',
        hint: '在商业世界里，“鼓掌”不等于“付钱”。没有金钱承诺的需求 80% 会在上线时蒸发。',
        requiredProof: '提供至少 3 位非亲友付费意向记录或预售订单截图',
        unlockTarget: 2
      });
      evidenceDeficits.push('缺乏真金白银的预付凭证 (Pre-payment proof missing)');
    } else {
      baseLv.need = 0;
      questions.push({
        dim: 'need',
        q: '【自嗨型立项警告】你的计划中充斥着美好愿景，但没有发现任何经过验证的痛点证据。凭什么认定用户真的愿意掏钱？',
        hint: '停掉代码编写，先做 10 个深度客户访谈，或用单页测试购买转化。',
        requiredProof: '提供真实客户访谈纪要，或落地页付费按钮点击率证明',
        unlockTarget: 1
      });
      evidenceDeficits.push('零付费验证，自嗨风险极高');
    }

    // 2. 单位经济审讯 (Unit Economics)
    const mentionsPricing = /pricing|\$|¥|￥|per month|\/mo|按月|按年|定价|收费|订阅/i.test(fullText);
    const mentionsCost = /cogs|token|api cost|gpu|margin|成本|算力|毛利|单次消耗/i.test(fullText);
    if (mentionsPricing && mentionsCost) {
      baseLv.econ = 2;
    } else if (mentionsPricing) {
      baseLv.econ = 1;
      questions.push({
        dim: 'econ',
        q: '【毛利倒挂风险】你写了定价，但没有测算过单次用户调用的实际算力/API成本与获客成本。',
        hint: '如果单用户获客成本（CAC）超过客单价的 1/3，且算力账单无法限流，规模越大亏损越惨。',
        requiredProof: '核算单用户月均 Token/服务器消耗成本，并确保净毛利 > 60%',
        unlockTarget: 2
      });
      evidenceDeficits.push('单用户算力与运营成本底线未核实');
    } else {
      baseLv.econ = 0;
      questions.push({
        dim: 'econ',
        q: '【商业闭环缺失】未发现任何清晰的收费模式或成本底线，你在用做慈善的心态做商业产品吗？',
        hint: '若无法验证单次交付的经济正循环，任何流量涌入都将直接转化为致命失血。',
        requiredProof: '确立明确的收费阶梯（Pricing Tier）与单次保本边际',
        unlockTarget: 1
      });
      evidenceDeficits.push('无收费闭环设计');
    }

    // 3. 生态依赖与防绞杀审讯 (Moat & Dependency)
    const isThinWrapper = /wrapper|gpt-4|claude|gemini|openai|套壳|调用模型/i.test(fullText);
    const hasMoat = /proprietary|fine-tuned|data moat|workflow|私有数据|微调|行业壁垒|专有工作流/i.test(fullText);
    if (hasMoat) {
      baseLv.dep = 2;
    } else if (isThinWrapper) {
      baseLv.dep = 0;
      questions.push({
        dim: 'dep',
        q: '【上游天命绞杀】产品高度依附单一上游 API。若下周官方发布会直接内置该能力，你的不可替代性在哪？',
        hint: '单纯的 prompt 包装没有护城河。必须沉淀专有工作流资产、私域数据或与垂直业务深度绑定。',
        requiredProof: '设计多模型降级容灾方案，或拥有上游无法轻易复制的私有流程资产',
        unlockTarget: 2
      });
      evidenceDeficits.push('高危单点依赖，极易被官方发版抹杀');
    } else {
      baseLv.dep = 1;
    }

    // 4. 分发与获客审讯 (Distribution)
    const hasChannel = /seo|newsletter|community|podcast|channel|私域|播客|社群|自媒体|合作/i.test(fullText);
    const hasAudience = /followers|subscribers|粉丝|关注者|存量用户/i.test(fullText);
    if (hasChannel && hasAudience) {
      baseLv.dist = 2;
    } else if (hasChannel) {
      baseLv.dist = 1;
    } else {
      baseLv.dist = 0;
      questions.push({
        dim: 'dist',
        q: '【获客真空死局】你没有专属的分发阵地。产品上线后，第一批 100 个精准付费用户从哪里来？',
        hint: '“酒香不怕巷子深”在 2026 年是独立开发者的第一谎言。好代码死于无人知晓的概率 > 90%。',
        requiredProof: '列出已建立连接的 3 个精准垂类发布渠道或首批种子用户触达名单',
        unlockTarget: 2
      });
      evidenceDeficits.push('零分发入口，存在严重获客盲区');
    }

    // 5. 创始人续航审讯 (Runway)
    const hasTeamOrRunway = /full-time|runway|months|funded|全职|资金|储备|能撑/i.test(fullText);
    baseLv.stam = hasTeamOrRunway ? 2 : 1;

    // 6. 交付能力 (Execution)
    const hasTechStack = /next\.js|react|python|rust|docker|api|架构|已上线|demo/i.test(fullText);
    baseLv.cap = hasTechStack ? 2 : 1;

    return {
      baseLv,
      questions,
      evidenceDeficits,
      discountRate: Math.round((questions.length / 4) * 50) + '%',
      summary: `冷酷投资人审阅了材料，发现 ${questions.length} 处严重证据缺口。在补充有效凭证前，系统已强制对六爻进行【证据置信度折扣锁定】。`
    };
  }

  // ---------------------------------------------------------------------------
  // 2. GitHub 活体脉搏心电图算法 (Vital Pulse Engine)
  // ---------------------------------------------------------------------------

  /**
   * 分析 GitHub 仓库真实提交数据与活跃度，计算失温指数与心电波形
   * @param {Object} data { commits: Array, repo: Object, issues?: Array }
   */
  function computeVitalPulse(data) {
    const commits = data.commits || [];
    const repo = data.repo || {};
    const issues = data.issues || [];

    const now = Date.now();
    let daysSinceLastCommit = 999;

    if (commits.length > 0) {
      const lastCommitDate = new Date(commits[0].commit ? commits[0].commit.committer.date : commits[0].date).getTime();
      daysSinceLastCommit = Math.max(0, (now - lastCommitDate) / (1000 * 60 * 60 * 24));
    } else if (repo.pushed_at) {
      daysSinceLastCommit = Math.max(0, (now - new Date(repo.pushed_at).getTime()) / (1000 * 60 * 60 * 24));
    }

    // 计算失温指数 (Hypothermia Score, 0 ~ 100)
    let hypothermiaScore = 0;
    if (daysSinceLastCommit < 7) {
      hypothermiaScore = Math.min(20, daysSinceLastCommit * 2);
    } else if (daysSinceLastCommit < 21) {
      hypothermiaScore = 20 + (daysSinceLastCommit - 7) * 2; // 20 ~ 48
    } else if (daysSinceLastCommit < 45) {
      hypothermiaScore = 50 + (daysSinceLastCommit - 21) * 1.5; // 50 ~ 86
    } else {
      hypothermiaScore = Math.min(100, 85 + (daysSinceLastCommit - 45) * 0.5); // 85 ~ 100
    }

    // 状态分类
    let status = 'HEALTHY';
    let statusLabel = '心跳强劲 · 活跃发版';
    let color = '#2A7553'; // 苍松墨绿
    let stamRecommended = 3;

    if (hypothermiaScore >= 80) {
      status = 'ARREST';
      statusLabel = '心跳骤停 · 项目进入植物人状态';
      color = '#C3272B'; // 朱砂红 (警报)
      stamRecommended = 0;
    } else if (hypothermiaScore >= 50) {
      status = 'SEVERE';
      statusLabel = '重症失温 · 创始人精力濒临透支';
      color = '#D49B45'; // 琥珀黄
      stamRecommended = 1;
    } else if (hypothermiaScore >= 25) {
      status = 'MILD';
      statusLabel = '慢性失温 · 提交速率持续放缓';
      color = '#A67C2E'; // 泥金古雅
      stamRecommended = 2;
    }

    // 动态生成心电图波形点阵 (ECG Waveform SVG Points)
    // 根据失温指数调整心跳频率和振幅
    const svgPath = generateEcgPath(hypothermiaScore);

    return {
      repoName: repo.full_name || 'Unknown/Repo',
      stars: repo.stargazers_count || 0,
      openIssues: repo.open_issues_count || issues.length,
      daysSinceLastCommit: Math.round(daysSinceLastCommit),
      hypothermiaScore: Math.round(hypothermiaScore),
      status,
      statusLabel,
      color,
      stamRecommended,
      svgPath,
      alertMessage: daysSinceLastCommit >= 21
        ? `【脉搏预警】该仓库已连续 ${Math.round(daysSinceLastCommit)} 天无有效代码提交，代码失温指数达 ${Math.round(hypothermiaScore)}%。续航爻强制降为 lv=${stamRecommended}。`
        : `【脉搏良好】最近提交于 ${Math.round(daysSinceLastCommit)} 天前，心跳节律稳定。`
    };
  }

  /**
   * 生成心电图 SVG 路径 (平滑基线 + P-Q-R-S-T 尖峰)
   */
  function generateEcgPath(hypothermiaScore) {
    const width = 600;
    const height = 90;
    const midY = 45;
    const isArrest = hypothermiaScore >= 85;

    if (isArrest) {
      // 几乎平直的微弱颤动线 (濒死心电)
      return `M 0,${midY} L 180,${midY} L 200,${midY-2} L 220,${midY+2} L 400,${midY} L 430,${midY-1} L 600,${midY}`;
    }

    // 根据失温指数调节振幅 (越健康尖峰越高)
    const peakHeight = Math.max(12, 40 - (hypothermiaScore * 0.3));
    const segments = [];
    segments.push(`M 0,${midY}`);

    const beats = hypothermiaScore > 50 ? 3 : 5; // 健康时心跳更密
    const step = width / beats;

    for (let i = 0; i < beats; i++) {
      const startX = i * step;
      segments.push(`L ${startX + step * 0.2},${midY}`);
      segments.push(`L ${startX + step * 0.28},${midY - peakHeight * 0.2}`); // P 波
      segments.push(`L ${startX + step * 0.35},${midY}`);
      segments.push(`L ${startX + step * 0.42},${midY + peakHeight * 0.25}`); // Q 波
      segments.push(`L ${startX + step * 0.48},${midY - peakHeight}`); // R 尖峰
      segments.push(`L ${startX + step * 0.54},${midY + peakHeight * 0.4}`); // S 波
      segments.push(`L ${startX + step * 0.62},${midY}`);
      segments.push(`L ${startX + step * 0.72},${midY - peakHeight * 0.3}`); // T 波
      segments.push(`L ${startX + step},${midY}`);
    }

    return segments.join(' ');
  }

  return {
    auditCommercialCase,
    computeVitalPulse,
    generateEcgPath
  };
});
