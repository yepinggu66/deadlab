/* DEADLAB engine — 六爻模型 + 六十四卦，供各页面复用 */
(function (g) {
  const T = {乾:[1,1,1],兑:[1,1,0],离:[1,0,1],震:[1,0,0],巽:[0,1,1],坎:[0,1,0],艮:[0,0,1],坤:[0,0,0]};
  const HEX = [
    ["乾","乾","乾为天","一次编译通过"],["坤","坤","坤为地","需求全接"],["坎","震","水雷屯","初始化即崩"],
    ["艮","坎","山水蒙","文档缺失"],["坎","乾","水天需","等产品确认"],["乾","坎","天水讼","甩锅大会"],
    ["坤","坎","地水师","全员上线"],["坎","坤","水地比","结对编程"],["巽","乾","风天小畜","攒够一次发版"],
    ["乾","兑","天泽履","踩到线上"],["坤","乾","地天泰","灰度零事故"],["乾","坤","天地否","联调不通"],
    ["乾","离","天火同人","开源有人 PR"],["离","乾","火天大有","一夜爆火"],["坤","艮","地山谦","没人 star"],
    ["震","坤","雷地豫","提前交付"],["兑","震","泽雷随","跟着竞品改"],["艮","巽","山风蛊","祖传代码"],
    ["坤","兑","地泽临","用户来了"],["巽","坤","风地观","只看不买"],["离","震","火雷噬嗑","咬咬牙重构"],
    ["艮","离","山火贲","皮肤好看"],["艮","坤","山地剥","功能被砍"],["坤","震","地雷复","回滚"],
    ["乾","震","天雷无妄","无妄之 bug"],["艮","乾","山天大畜","技术债到期"],["艮","震","山雷颐","自己吃自己"],
    ["兑","巽","泽风大过","过度设计"],["坎","坎","坎为水","深夜宕机"],["离","离","离为火","服务器烧了"],
    ["兑","艮","泽山咸","用户心动"],["震","巽","雷风恒","长期维护"],["乾","艮","天山遁","转身跑路"],
    ["震","乾","雷天大壮","猛加需求"],["离","坤","火地晋","顺利晋升"],["坤","离","地火明夷","背锅"],
    ["巽","离","风火家人","小团队"],["离","兑","火泽睽","前后端吵架"],["坎","艮","水山蹇","卡在支付"],
    ["震","坎","雷水解","问题自解"],["艮","兑","山泽损","砍功能省钱"],["巽","震","风雷益","性能起飞"],
    ["兑","乾","泽天夬","一键删除"],["乾","巽","天风姤","遇上甲方"],["兑","坤","泽地萃","用户聚集"],
    ["坤","巽","地风升","稳步增长"],["兑","坎","泽水困","预算见底"],["坎","巽","水风井","共用一个 API"],
    ["兑","离","泽火革","推翻重做"],["离","巽","火风鼎","立新架构"],["震","震","震为雷","半夜惊醒"],
    ["艮","艮","艮为山","停止维护"],["巽","艮","风山渐","慢慢变好"],["震","兑","雷泽归妹","嫁给外包"],
    ["震","离","雷火丰","流量洪峰"],["离","艮","火山旅","出差演示"],["巽","巽","巽为风","需求风吹"],
    ["兑","兑","兑为泽","用户好评"],["巽","坎","风水涣","团队散了"],["坎","兑","水泽节","限流"],
    ["巽","兑","风泽中孚","用户信任"],["震","艮","雷山小过","小 bug 不断"],["坎","离","水火既济","上线即完成"],
    ["离","坎","火水未济","永远差一点"]
  ];
  const HEXMAP = {};
  HEX.forEach((h,i)=>{ HEXMAP[[...T[h[1]],...T[h[0]]].join("")] = i; });

  const VARS = [
    {k:'need', yao:'初', name:'需求', q:'有人真的痛吗', lv:['自嗨','有人问','有人付钱','供不应求'], cause:'demo'},
    {k:'cap',  yao:'二', name:'能力', q:'做得对吗', lv:['做不出','能跑但常错','基本可信','稳定可用'], cause:'trust'},
    {k:'econ', yao:'三', name:'经济', q:'越用越赚还是越亏', lv:['越用越亏','勉强持平','有毛利','很赚'], cause:'cost'},
    {k:'dist', yao:'四', name:'分发', q:'人从哪来', lv:['没入口','几个熟人','稳定流量','自己会涨'], cause:'dist'},
    {k:'dep',  yao:'五', name:'依赖', q:'上游会不会吃掉你', lv:['全靠上游','单点依赖','有备选','自主'], cause:'dep'},
    {k:'stam', yao:'上', name:'续航', q:'你还能撑多久', lv:['快撑不住','还能半年','能撑两年','长期主义'], cause:'burn'}
  ];
  const CAUSES = {
    demo:{n:'演示很酷，没人用', s:'上线 4 周，周活 < 20，且没人第二次打开', t:'停更两周，去做 10 个用户访谈'},
    trust:{n:'准确率不够，用户不敢用', s:'每 5 次任务出 1 次明显错误，用户开始手动复核', t:'砍掉不确定场景，只留可验证的任务'},
    cost:{n:'越用越亏，成本高于客单价', s:'单用户月成本 > 客单价 30%，且用量还在涨', t:'换小模型 / 涨价 / 加限流'},
    dist:{n:'没人知道它存在', s:'发布 3 次，累计注册 < 100，自然流量为 0', t:'停开发，先做一条能传播的 demo'},
    dep:{n:'被上游一口吃掉', s:'上游一次版本更新，核心能力失效 48 小时', t:'加抽象层 + 多模型路由'},
    burn:{n:'维护不动了', s:'连续 6 周没有提交，issue 堆积 > 30', t:'砍到只剩一个功能，或找人接手'}
  };
  const CKEYS = Object.keys(CAUSES);
  const BASE = {demo:.030, trust:.024, cost:.020, dist:.030, dep:.016, burn:.022};
  const K = 0.62;

  function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;}}
  function fnv1a(s){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193);}return h>>>0;}
  const shape = m => 1.25 - 0.018*m;
  const factor = lv => { const f=(3-lv)/3; return 0.14 + 1.7*Math.pow(f,1.7); };

  function runSim(lv, N, seed){
    N = N || 5000;
    const rnd = mulberry32(seed || fnv1a(JSON.stringify(lv)));
    const surv = new Array(25).fill(0);
    const deaths = {}; CKEYS.forEach(k=>deaths[k]=0);
    const outs = {'小生意':0,'被上游收编':0,'苟活':0,'开源走红':0};
    let deadCount = 0;
    const hs = new Array(6).fill(0);
    for(let i=0;i<N;i++){
      let dead = 0, cause = null;
      for(let m=1;m<=24;m++){
        let total = 0;
        for(let j=0;j<6;j++){
          const h = BASE[CKEYS[j]] * shape(m) * factor(lv[VARS[j].k]) * K;
          hs[j] = h; total += h;
        }
        if(rnd() < total){
          let r = rnd()*total, idx = 5;
          for(let j=0;j<6;j++){ r -= hs[j]; if(r<=0){ idx=j; break; } }
          cause = CKEYS[idx]; dead = m; break;
        }
      }
      for(let t=0;t<=24;t++){ if(!dead || t < dead) surv[t]++; }
      if(dead){ deaths[cause]++; deadCount++; }
      else {
        const r = rnd();
        if(lv.need>=2 && lv.dist>=2 && lv.econ>=2) outs['小生意']++;
        else if(lv.dep<=1) outs['被上游收编']++;
        else if(r<0.5) outs['苟活']++;
        else outs['开源走红']++;
      }
    }
    const s = surv.map(c=>c/N);
    let median = 24;
    for(let t=0;t<=24;t++){ if(s[t] <= 0.5){ median = t; break; } }
    const causeShare = {};
    CKEYS.forEach(k=>causeShare[k] = deadCount ? deaths[k]/deadCount : 0);
    const outTop = Object.entries(outs).sort((a,b)=>b[1]-a[1])[0];
    return {s, median, causeShare, deadCount, outTop, N, survivors:N-deadCount, s12:s[12], s24:s[24]};
  }

  function bitsOf(lv){ return VARS.map(v => lv[v.k] >= 2 ? 1 : 0); }
  function hexOf(lv){ return HEX[HEXMAP[bitsOf(lv).join("")]]; }
  function verseOf(lv){
    const weak = VARS.filter(v=>lv[v.k] <= 1);
    const strong = VARS.filter(v=>lv[v.k] >= 2);
    if(!weak.length) return "六爻纯阳。六个维度全在阳位——这种卦一般不是算出来的，是吹出来的。";
    if(!strong.length) return "六爻皆阴。六个维度全空——此局从第一步就该停。";
    return weak.length + " 爻在阴位（" + weak.map(v=>v.name).join("、") + "），" +
           strong.length + " 爻在阳位。阴处就是最先裂开的地方。";
  }
  const VETO_LABEL = {copy:'版权', lic:'牌照', plat:'平台'};
  function forecast(lv, veto, N, seed){
    const on = Object.keys(veto||{}).filter(k=>veto[k]);
    if(on.length){
      return {vetoed:true, vetoes:on, s:new Array(25).fill(0), s12:0, s24:0, median:0,
              causeShare:{}, deadCount:N||5000, survivors:0, outTop:['—',0], N:N||5000};
    }
    return Object.assign(runSim(lv, N, seed), {vetoed:false, vetoes:[]});
  }
  function D(fn){ return fn; }
  g.DEADLAB = {T, HEX, HEXMAP, VARS, CAUSES, CKEYS, BASE, K, runSim, bitsOf, hexOf, verseOf, forecast, VETO_LABEL, mulberry32, fnv1a};
})(window);
