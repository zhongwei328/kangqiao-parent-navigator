const fs = require('fs');
const path = require('path');
var html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
var app = html.match(/\/\/ ===APP_START===([\s\S]*?)\/\/ ===APP_END===/)[1];
app = app.replace(/^\s*\(function\(\)\{/, '').replace(/\}\)\(\);\s*$/, '');
// DOM 桩
var __els = {};
function fakeEl(id){ var store=''; return {id:id,className:'',textContent:'',innerHTML:'',style:{},classList:{add(){},remove(){}},addEventListener(){},appendChild(){},insertAdjacentHTML(){},querySelector(){return fakeEl('q');},querySelectorAll(){return [];}, get value(){return store;}, set value(x){ store=(x==null?'':String(x)); }}; }
global.document = { getElementById:function(id){ if(!__els[id]) __els[id]=fakeEl(id); return __els[id]; }, createElement:function(){ return fakeEl('tmp'); }, querySelectorAll:function(){ return []; } };
global.window = { scrollTo:function(){} };
global.localStorage = (function(){ var s={}; return {getItem:function(k){return (k in s)?s[k]:null;},setItem:function(k,v){s[k]=String(v);},removeItem:function(k){delete s[k];}}; })();
global.AbortController = global.AbortController || function(){ this.signal={}; this.abort=function(){}; };
// fetch 桩：返回带 importance/urgency + 结构化 conclusion 的 AI JSON
global.fetch = function(url, opts){
  global.__lastBody = (opts && opts.body) || '';
  var ai = { conclusion:{ positioning:'IB MYP 平均 6.8/7（优秀），德籍属 Non-JUPAS 国际生池。', edge:['ESTP + 兴趣地图（生物/编程）匹配 STEM 申请方向','MK 金奖×3、AMC8 Top5% 构成竞赛差异化证据'], risks:['港三方向缺口 TOEFL/IELTS 正式成绩（目前仅 TOEFL Junior 865，大学申请不直接采用）','Service as Action 仅 0/7，未达 IB 毕业硬性 7/7'], nextWindow:'本学期报名「状元养成计划」AMC/AMC10 冲刺班，并启动 Service as Action 补项' }, actions:[
    { title:'校内 · 科学(Sciences)课 — 重点提升 B（探究与规律）6/8', reason:'档案科学 Final 6、B6 偏弱，需做实验探究补强。', scope:'校内', importance:'高', urgency:'中' },
    { title:'补满 Service as Action 0/7', reason:'IB 硬性 7/7 未达标。', scope:'校内', importance:'高', urgency:'高' },
    { title:'按 Holland I 代码加入生物社', reason:'档案 Holland=I，兴趣地图含生物。', scope:'校内', importance:'中', urgency:'低' }
  ] };
  return Promise.resolve({ ok:true, status:200, statusText:'OK', json:function(){ return Promise.resolve({ choices:[{ message:{ content: JSON.stringify(ai) } }] }); } });
};
app += '\nglobal.__t={getProfile:getProfile, actionsItems:actionsItems, renderActions:renderActions, aiMeta:aiMeta, callMiniMax:callMiniMax, checkReachability:checkReachability, swot:swot, extracurricular:extracurricular, conclusion:conclusion, direction:direction, roadmap:roadmap, fillFromText:fillFromText, aiConclusionHtml:aiConclusionHtml};';
eval(app);

var pass=0, fail=0;
function ok(name, cond, extra){ console.log((cond?'  ✅ ':'  ❌ ')+name+(extra?'  '+extra:'')); cond?pass++:fail++; }

// Henry 真实档案（SA=0 / 科学 Final6 / 英语 D6）
var p={
  name:'Henry Mu', grade:'7', school:'Kang Chiao', nationality:'德国 / German',
  teacherComment:'',
  direction:['港三全奖','欧陆公立(低免学费)'],
  mbti:'ESTP', holland:'I,S', interestMap:'生物 · 编程 · 辩论',
  toeflJunior:'865', toefl:'', ielts:'', sat:'', saCount:'0', major:'STEM', applyGrade:'12',
  competitions:[{name:'MK',level:'国际',res:'金奖×3'},{name:'AMC8',level:'国际',res:'Top5%'}],
  activities:[{name:'辩论社',role:'队长',desc:'校际辩论'}],
  subjects:{ math:{score:7,a:8,b:8,c:7,d:7}, english:{score:7,a:8,b:7,c:7,d:6}, science:{score:6,a:7,b:6,c:6,d:7}, chinese:{score:7,a:6,b:7,c:8,d:7}, humanities:{score:7,a:7,b:7,c:7,d:8} }
};

console.log('\n=== 本地行动：优先级 + 信息来源/链接 ===');
var html = global.__t.renderActions(global.__t.actionsItems(p), '');
var items = (html.match(/<li>/g)||[]).length;
var reasons = (html.match(/<span class="reason">/g)||[]).length;
var sources = (html.match(/<span class="source">/g)||[]).length;
var links = (html.match(/<a href="https/g)||[]).length;
console.log(html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' '));
ok('每条行动都有原因', items===reasons, '(li='+items+', reasons='+reasons+')');
ok('每条行动都有信息来源(📌)', items===sources, '(sources='+sources+')');
ok('学科/SA 行动带有参考链接', links>=2, '(links='+links+')');
ok('链接指向 IB MYP 官方课程页', /ibo\.org\/programmes\/middle-years-programme\/curriculum/.test(html));
ok('链接指向康桥官网(SA)', /kunshan\.kcis\.org\.cn/.test(html));

// 优先级顺序：SA(高/高) 应排第一
console.log('\n=== 优先级排序（SA 紧急高 应第一）===');
var order = (html.match(/<b>(.*?)<\/b>/g)||[]).map(function(s){return s.replace(/<[^>]+>/g,'');});
console.log('  顺序: '+order.map(function(t,i){return 'P'+(i+1)+' '+t;}).join(' | '));
ok('P1 为 Service as Action（紧急高）', /Service as Action/.test(order[0]||''));

// 具体学科课程 + 标准中文名
console.log('\n=== 具体校内课程 + 四标准中文名 ===');
ok('含「校内 · XX课（English）— … 重点提升」', /校内 · .+课（.+）— .*重点提升/.test(html));
ok('含按科目 IB rubric 的标准中文名(探究与设计/使用语言/分析/批判性思考)', /探究与设计|使用语言|分析|批判性思考/.test(html));
ok('校内课程行动点名康桥真实项目(状元养成计划/语言中心)', /状元养成计划|语言中心/.test(html));
ok('学科行动挂康桥官网项目链接(含项目名)', /康桥昆山校区 · 状元养成计划|康桥昆山校区 · 语言中心/.test(html));

// 本地结论：显式英语标化缺口 + SA 完成度
console.log('\n=== 本地结论：英语标化缺口 / SA 完成度 ===');
var avg = '6.8';
var c1 = global.__t.conclusion(p, avg);
console.log('  [Henry] '+c1.replace(/<[^>]+>/g,''));
ok('结论含「英语标化」段', /英语标化/.test(c1));
ok('仅有 TOEFL Junior 时说明其不被直接采用', /TOEFL Junior 865/.test(c1) && /不直接采用/.test(c1));
ok('按方向(港三)推出 TOEFL/IELTS 缺口', /缺口 = TOEFL \/ IELTS 正式成绩/.test(c1));
ok('结论含「Service as Action」段', /Service as Action/.test(c1));
ok('SA 0/7 标为最高优先级风险项', /0\/7/.test(c1) && /最高优先级风险项/.test(c1));
ok('结论仍保留 MBTI/Holland/兴趣地图', /ESTP/.test(c1) && /I,S/.test(c1) && /生物/.test(c1));

// 变体 A：美Top30 且无 SAT → 缺口应含 SAT/ACT
var pA = JSON.parse(JSON.stringify(p)); pA.direction=['美Top30']; pA.toefl='105';
var cA = global.__t.conclusion(pA, avg);
console.log('  [变体A 美Top30/有TOEFL无SAT] '+cA.replace(/<[^>]+>/g,''));
ok('已录入 TOEFL 时列出成绩', /已录入 TOEFL 105/.test(cA));
ok('美Top30 缺 SAT → 缺口含 SAT / ACT', /缺口 = SAT \/ ACT/.test(cA));

// 变体 B：标化齐 + SA 达标 → 应显示"已覆盖"与"满足"
var pB = JSON.parse(JSON.stringify(p)); pB.toefl='110'; pB.sat='1520'; pB.saCount='7'; pB.direction=['美Top30'];
var cB = global.__t.conclusion(pB, avg);
console.log('  [变体B 标化齐/SA达标] '+cB.replace(/<[^>]+>/g,''));
ok('标化齐 → 提示已覆盖、以刷分冲高为主', /已覆盖所选方向的标化要求/.test(cB));
ok('SA 7/7 → 提示满足 IB MYP 毕业要求', /已完成 7\/7，满足/.test(cB));

// 变体 C：SA 未录入 → 应提示需核实
var pC = JSON.parse(JSON.stringify(p)); pC.saCount='';
ok('SA 未录入 → 提示需向班导/升学办核实', /未录入完成度/.test(global.__t.conclusion(pC, avg)));

// 路线图：逐年列到 G12，起点=当前年级，高亮申请目标年级
console.log('\n=== 路线图：逐年列到 G12（起点=当前年级，高亮申请目标年级）===');
var pR1 = JSON.parse(JSON.stringify(p)); pR1.grade='7'; pR1.applyGrade='12';
var rm1 = global.__t.roadmap(pR1);
console.log('  [G7→G12] '+rm1.replace(/<[^>]+>/g,' ').replace(/\s+/g,' '));
var yrCount1 = (rm1.match(/<li/g)||[]).length;
ok('路线图为逐年：G7..G12 共 6 个年级节点', yrCount1===6, '(li='+yrCount1+')');
ok('起点=录入当前年级 G7（非硬编码）', rm1.indexOf('G7（当前')>=0);
ok('末节点=G12', rm1.indexOf('G12（')>=0);
ok('含「申请目标年级」节点(G12)', rm1.indexOf('G12（')>=0 && rm1.indexOf('申请目标年级')>=0);
ok('申请目标年级节点高亮(timeline-app)', rm1.indexOf('class="timeline-app"')>=0);
ok('G11 含 40+ 水位提示(近三届 18%-23%)', rm1.indexOf('40+')>=0 && rm1.indexOf('18%-23%')>=0);
var pR2 = JSON.parse(JSON.stringify(p)); pR2.grade='9'; pR2.applyGrade='10';
var rm2 = global.__t.roadmap(pR2);
console.log('  [G9→G10] '+rm2.replace(/<[^>]+>/g,' ').replace(/\s+/g,' '));
ok('applyGrade=10 → 高亮 G10 且列到 G12', rm2.indexOf('G10（申请目标年级）')>=0 && rm2.indexOf('<b>G12</b>')>=0);
ok('applyGrade 未录入 → 仍列到 G12，无申请目标年级高亮', (function(){ var r=global.__t.roadmap({grade:'8',applyGrade:''}); return r.indexOf('<b>G12</b>')>=0 && r.indexOf('申请目标年级')<0; })());

// AI 路径：renderActions(norm) + aiMeta 补链接
console.log('\n=== AI 路径：normalize + 优先级 + aiMeta 补链接 ===');
global.__t.callMiniMax(p,'fake-key').then(function(ai){
  var norm = ai.actions.map(function(it){ var m=global.__t.aiMeta(it,p); return { title:it.title, reason:it.reason||'', scope:(it.scope==='校外'?'校外':'校内'), imp:it.importance||'中', urg:it.urgency||'中', source:m.source, links:m.links }; });
  var ah = global.__t.renderActions(norm, '');
  var aitems=(ah.match(/<li>/g)||[]).length, areasons=(ah.match(/<span class="reason">/g)||[]).length, asources=(ah.match(/<span class="source">/g)||[]).length, alinks=(ah.match(/<a href="https/g)||[]).length;
  console.log(ah.replace(/<[^>]+>/g,' ').replace(/\s+/g,' '));
  ok('AI 行动每条有原因', aitems===areasons, '('+aitems+'/'+areasons+')');
  ok('AI 行动每条有信息来源', aitems===asources);
  ok('AI 学科/SA 行动自动补真实链接', alinks>=2, '(links='+alinks+')');
  ok('AI 学科行动链接=IB 官方', /ibo\.org\/programmes\/middle-years-programme\/curriculum/.test(ah));
  // 优先级：SA(高/高) 先于 科学(高/中) 先于 生物社(中/低)
  var ao=(ah.match(/<b>(.*?)<\/b>/g)||[]).map(function(s){return s.replace(/<[^>]+>/g,'');});
  var iSA=ao.findIndex(function(t){return /Service as Action/.test(t);});
  var iSc=ao.findIndex(function(t){return /科学/.test(t);});
  var iBio=ao.findIndex(function(t){return /生物社/.test(t);});
  ok('AI 优先级 SA 先于 科学 先于 生物社', iSA>=0&&iSc>=0&&iBio>=0&&iSA<iSc&&iSc<iBio, '('+iSA+','+iSc+','+iBio+')');

  // P0 提示词规则：反幻觉 / 家长可读 / 结论结构化
  console.log('\n=== P0/P1/P2 提示词规则（来自 fetch body）===');
  var pm = ''; try { var _b = JSON.parse(global.__lastBody); pm = _b.messages.map(function(m){return m.content||'';}).join('\n'); }catch(e){ pm = global.__lastBody || ''; } // 解码后的 system+user 内容（避免 JSON 转义干扰）
  var body2=''; try{ body2 = JSON.parse(global.__lastBody); }catch(e){}
  ok('P0-1 反幻觉：含 严禁编造 / 白名单 / 未录入', /严禁推断或编造/.test(pm) && /白名单/.test(pm) && /未录入/.test(pm));
  ok('P0-1 白名单含康桥真实项目(状元养成计划/语言中心)', /状元养成计划/.test(pm) && /语言中心/.test(pm));
  ok('P0-2 家长可读：含 家长 / 白话解释 / 禁止绝对化', /家长/.test(pm) && /白话解释/.test(pm) && /禁止绝对化/.test(pm));
  ok('P0-3 结论结构化：含 positioning/edge/risks/nextWindow', /positioning/.test(pm) && /"edge"/.test(pm) && /"risks"/.test(pm) && /nextWindow/.test(pm));
  ok('P0-3 已弃用旧版一段式结论', !/一段中文竞争力总览结论（必须综合/.test(pm));
  ok('P1-5 时间窗：提示词含 yearsToApply 约束', /yearsToApply/.test(pm));
  ok('P1-5 档案 JSON 注入 yearsToApply(申请目标年级-当前年级)', /"yearsToApply"/.test(pm));
  ok('P1-4 竞争基准：提示词含【竞争基准】与康桥 35-36/40+', /【竞争基准/.test(pm) && /35-36/.test(pm) && /40\+/.test(pm));
  ok('P1-4 要求量化「距目标校还差多少」', /距目标校/.test(pm) && /还差多少/.test(pm));
  ok('P1-6 请求体含 temperature=0.3（结论可复现）', body2 && body2.temperature===0.3);
  ok('P1-6 请求体 max_tokens=2048（结构化结论避免截断）', body2 && body2.max_tokens===2048);
  ok('P2-7 拆 system/user 角色：messages[0]=system', body2 && body2.messages && body2.messages[0] && body2.messages[0].role==='system');
  ok('P2-7 拆 system/user 角色：messages[1]=user(档案JSON)', body2 && body2.messages && body2.messages[1] && body2.messages[1].role==='user');
  ok('P2-7 输出前自检：system 含【输出前自检】五项核对', /输出前自检/.test(pm) && /覆盖：学科均分/.test(pm) && /档案中不存在的奖项/.test(pm));
  ok('P2-8 正反示例：system 含 ✅好 / ❌坏 示例', /正反示例/.test(pm) && /✅ 好/.test(pm) && /❌ 坏/.test(pm));

  // P0-3 结构化结论渲染
  console.log('\n=== P0-3 结构化结论渲染（aiConclusionHtml）===');
  var ch = global.__t.aiConclusionHtml(ai);
  console.log(ch.replace(/<[^>]+>/g,' ').replace(/\s+/g,' '));
  ok('渲染含 定位 / 差异化竞争力 / 核心风险 / 本学期最该动', /定位/.test(ch) && /差异化竞争力/.test(ch) && /核心风险/.test(ch) && /本学期最该动的一件事/.test(ch));
  ok('核心风险含英语标化缺口', /TOEFL|IELTS|标化/.test(ch));
  ok('核心风险含 Service as Action 完成度', /Service as Action/.test(ch));
  var chOld = global.__t.aiConclusionHtml({conclusion:'旧版字符串结论。'});
  ok('向后兼容：旧字符串结论仍渲染为 <p>', /^<p>旧版字符串结论。<\/p>$/.test(chOld));

  // nextWindow 回显标签文字 → 渲染时须清洗，不得重复「本学期最该动的一件事」
  var chDup = global.__t.aiConclusionHtml({conclusion:{positioning:'x',edge:['e'],risks:['r'],nextWindow:'本学期最该动的一件事：报名「状元养成计划」AMC/AMC10 冲刺班'}});
  var nwCount = (chDup.match(/本学期最该动的一件事/g)||[]).length;
  ok('nextWindow 回显标签被清洗(仅剩1处=字段标题)', nwCount===1, '(count='+nwCount+')');

  // 连通性自检：可达→true；网络失败→false（避免干等 30s）
  console.log('\n=== 连通性自检 checkReachability ===');
  global.__t.checkReachability('any-key').then(function(reachOk){
    ok('fetch 桩返回可达 → checkReachability 返回 true', reachOk===true);
    global.fetch = function(){ return Promise.reject(new Error('Failed to fetch')); };
    return global.__t.checkReachability('any-key');
  }).then(function(reachFail){
    ok('模拟网络失败 → checkReachability 返回 false（触发提前回退本地）', reachFail===false);

    // base_resp 业务错误识别（真实 bug：HTTP 200 但 Key 无效，须从 base_resp 取出真实错误）
    global.fetch = function(url, opts){
      return Promise.resolve({ ok:true, status:200, statusText:'OK', json:function(){ return Promise.resolve({ base_resp:{ status_code:1004, status_msg:'login fail: Please carry the API secret key' } }); } });
    };
    global.__t.callMiniMax(p,'bad-key').then(function(e){
      console.log('  捕获: '+(e&&e.error||'null'));
      ok('Key 无效(1004) → 错误明确指向 Key 无效/过期', !!(e&&e.error) && /1004/.test(e.error) && /Key 无效或已过期/.test(e.error));
      runExtractionSuite();
      console.log('\n==== 结果: '+pass+' 通过 / '+fail+' 失败 ====');
      process.exit(fail?1:0);
    });
  });
});

// === PDF 提取回归：G6 + G7 跨格式（防止"换报告评语/分数丢失"回归）===
function runExtractionSuite(){
  console.log('\n=== PDF 提取回归：G6 + G7 跨格式 ===');
  function runFixture(file, exp){
    var text = fs.readFileSync(path.join(__dirname, 'fixtures', file), 'utf8');
    for(var k in __els) delete __els[k];
    var r = global.__t.fillFromText(text);
    var tc = __els['teacherComment'] ? __els['teacherComment'].value : '';
    ok(file+' 识别姓名 Henry Mu', (__els['name']?__els['name'].value:'')==='Henry Mu');
    ok(file+' 年级='+exp.grade, (__els['grade']?__els['grade'].value:'')===exp.grade);
    ok(file+' 学校含 Kang Chiao', /Kang Chiao/.test(__els['school']?__els['school'].value:''));
    ok(file+' 抓到老师评语(含 '+exp.comments.join('/')+')', exp.comments.every(function(c){ return tc.indexOf(c)>=0; }));
    ok(file+' 数学 Final/ABCD='+exp.math.score+'/'+exp.math.a+exp.math.b+exp.math.c+exp.math.d,
      (__els['subject_score_math']?__els['subject_score_math'].value:'')===exp.math.score &&
      (__els['subject_a_math']?__els['subject_a_math'].value:'')===exp.math.a &&
      (__els['subject_b_math']?__els['subject_b_math'].value:'')===exp.math.b &&
      (__els['subject_c_math']?__els['subject_c_math'].value:'')===exp.math.c &&
      (__els['subject_d_math']?__els['subject_d_math'].value:'')===exp.math.d);
    ok(file+' 科学 Final/ABCD='+exp.science.score+'/'+exp.science.a+exp.science.b+exp.science.c+exp.science.d,
      (__els['subject_score_science']?__els['subject_score_science'].value:'')===exp.science.score &&
      (__els['subject_a_science']?__els['subject_a_science'].value:'')===exp.science.a &&
      (__els['subject_b_science']?__els['subject_b_science'].value:'')===exp.science.b &&
      (__els['subject_c_science']?__els['subject_c_science'].value:'')===exp.science.c &&
      (__els['subject_d_science']?__els['subject_d_science'].value:'')===exp.science.d);
    ok(file+' 英语 D(使用语言)='+exp.englishD, (__els['subject_d_english']?__els['subject_d_english'].value:'')===exp.englishD);
    var prof = global.__t.getProfile();
    ok(file+' SWOT 引用老师评语(已结合)', /已结合老师评语/.test(global.__t.swot(prof)));
  }
  runFixture('henry_g6_report.txt', { grade:'6', comments:['社会情感课','音乐课'],
    math:{score:'7',a:'7',b:'7',c:'7',d:'7'}, science:{score:'6',a:'8',b:'6',c:'6',d:'7'}, englishD:'7' });
  runFixture('henry_g7_report.txt', { grade:'7', comments:['英语课','数学课'],
    math:{score:'7',a:'8',b:'8',c:'7',d:'7'}, science:{score:'6',a:'7',b:'6',c:'6',d:'7'}, englishD:'6' });
}
