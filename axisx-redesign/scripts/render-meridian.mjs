import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const temp = join(root, ".video-render");
const clips = join(root, "public", "meridian", "clips");
const posters = join(root, "public", "meridian", "v4");
const modules = ["detect", "lidar", "prefer", "finance", "agent"];
const langs = ["en", "zh"];
const colors = { bg: "#060a0a", panel: "#0b1211", panel2: "#101a18", line: "#24322f", muted: "#71817d", text: "#edf5f2", aqua: "#73ead5", lime: "#b7ef71", coral: "#f16a55", violet: "#a894ff", yellow: "#f0c86a" };

rmSync(temp, { recursive: true, force: true });
mkdirSync(temp, { recursive: true });
mkdirSync(clips, { recursive: true });
for (const lang of langs) mkdirSync(join(posters, lang), { recursive: true });

const dataUri = (path) => `data:image/jpeg;base64,${readFileSync(path).toString("base64")}`;
const source = {
  en: { detect: dataUri(join(root, "public", "meridian", "detect.jpg")), lidar: dataUri(join(root, "public", "meridian", "lidar.jpg")) },
  zh: { detect: dataUri(join(root, "public", "meridian", "zh", "detect.jpg")), lidar: dataUri(join(root, "public", "meridian", "zh", "lidar.jpg")) },
};
const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const text = (x, y, value, size = 12, fill = colors.text, weight = 400, extra = "") => `<text x="${x}" y="${y}" fill="${fill}" font-family="Arial,'PingFang SC','Microsoft YaHei',sans-serif" font-size="${size}" font-weight="${weight}" ${extra}>${esc(value)}</text>`;
const mono = (x, y, value, size = 9, fill = colors.muted, extra = "") => `<text x="${x}" y="${y}" fill="${fill}" font-family="Consolas,'SFMono-Regular','Microsoft YaHei',monospace" font-size="${size}" letter-spacing="1.1" ${extra}>${esc(value)}</text>`;
const line = (x1, y1, x2, y2, stroke = colors.line, width = 1) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}"/>`;
const rect = (x, y, w, h, fill = "none", stroke = colors.line, rx = 0, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" rx="${rx}" ${extra}/>`;

const ui = {
  en: {
    preview: "PRODUCT DEVELOPMENT PREVIEW", pilot: "INTERNAL PILOT", batch: "BATCH AX-2608-17", rules: "RULESET V3.6", review: "IN REVIEW", queue: "TASK QUEUE", inspector: "INSPECTOR", qa: "QA SIGNAL", saved: "ALL CHANGES SAVED", privacy: "PRIVATE WORKSPACE · PROJECT DATA BOUNDARIES ACTIVE", submit: "SUBMIT FOR QA", score: "QUALITY SCORE", owner: "OWNER", stage: "STAGE", sample: "SAMPLE RATE", confidence: "CONFIDENCE", ready: "READY FOR REVIEW", pass: "QA CHECK PASSED", passSub: "Evidence and task state recorded",
    names: { detect: "2D Detection / Night Mobility", lidar: "3D LiDAR / Urban Junction", prefer: "Preference Ranking / Model Responses", finance: "Financial Intake / Risk Review", agent: "Agent Trajectory / Complex Task" },
  },
  zh: {
    preview: "产品开发预览", pilot: "内部试运行", batch: "批次 AX-2608-17", rules: "规则版本 V3.6", review: "质检中", queue: "任务队列", inspector: "属性与质检", qa: "质量信号", saved: "所有更改已保存", privacy: "私有作业空间 · 项目数据边界已启用", submit: "提交质检", score: "质量评分", owner: "负责人", stage: "作业阶段", sample: "抽检比例", confidence: "置信度", ready: "等待复核", pass: "质检检查通过", passSub: "证据与作业状态已记录",
    names: { detect: "二维检测 / 夜间道路", lidar: "三维点云 / 城市路口", prefer: "偏好排序 / 模型回答", finance: "金融进件 / 风险审核", agent: "Agent 轨迹 / 复杂任务" },
  },
};

function shell(module, lang, state, center) {
  const t = ui[lang];
  const code = String(modules.indexOf(module) + 1).padStart(2, "0");
  const queueItems = Array.from({ length: 6 }, (_, i) => {
    const y = 128 + i * 68;
    const active = i === Math.min(1 + Math.floor(state / 4), 3);
    const status = i < 1 ? "QA" : active ? "ACTIVE" : "READY";
    const p = i < 1 ? 100 : active ? 42 + state * 7 : 18;
    return `${rect(68, y, 172, 57, active ? "#10201d" : "none", active ? "#3b665d" : "none")}${mono(78, y + 18, `AX-${code}-${String(185 + i).padStart(4, "0")}`, 8, active ? colors.text : "#8b9a96")}${mono(202, y + 18, status, 7, active ? colors.aqua : "#5b6c67")}${rect(78, y + 29, 148, 2, "#24322f", "none")}${rect(78, y + 29, Math.min(p, 100) * 1.48, 2, colors.aqua, "none")}${mono(78, y + 46, `${t.owner} · ${["LM", "QZ", "YW", "HX", "AR", "KP"][i]}`, 7, "#5f716c")}`;
  }).join("");
  const score = 78 + state * 3;
  const cursor = [[555,548],[782,258],[864,390],[921,553],[706,436],[893,604]][state];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="${colors.aqua}"/><stop offset="1" stop-color="${colors.lime}"/></linearGradient><radialGradient id="glow"><stop stop-color="#16352f"/><stop offset="1" stop-color="${colors.bg}"/></radialGradient><filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#000" flood-opacity=".55"/></filter><clipPath id="centerClip"><rect x="260" y="112" width="723" height="531"/></clipPath></defs>
    <rect width="1280" height="720" fill="${colors.bg}"/><circle cx="840" cy="360" r="420" fill="url(#glow)" opacity=".34"/>
    <rect width="1280" height="44" fill="#080d0c"/>${line(0,44,1280,44)}
    ${line(25,13,25,31,colors.aqua,2)}${line(16,22,34,22,colors.aqua,2)}${mono(44,27,"AXISX / MERIDIAN",10,colors.text)}
    ${mono(475,27,"OPS BUILD",8,colors.muted)}${mono(554,27,"0.9.4",8,colors.aqua)}${mono(626,27,t.preview,8,colors.muted)}
    <circle cx="1140" cy="22" r="4" fill="${colors.lime}"/><circle cx="1140" cy="22" r="8" fill="none" stroke="${colors.lime}" opacity=".25"/>${mono(1151,27,t.pilot,8,"#b8c5c1")}
    <rect x="0" y="44" width="58" height="642" fill="#080d0c"/>${line(58,44,58,686)}
    ${["AX","01","02","03","QA"].map((v,i)=>`${rect(12,58+i*45,34,34,i===1?"#10201d":"none",i===1?colors.aqua:"none")}${mono(21,79+i*45,v,8,i===1?colors.aqua:"#61716d")}`).join("")}
    ${rect(12,635,34,34,"none","none")}${mono(22,656,"↗",11,"#61716d")}
    <rect x="58" y="44" width="1222" height="54" fill="#090f0e"/>${line(58,98,1280,98)}
    ${mono(76,68,`MODULE / ${code}`,8,colors.aqua)}${text(76,88,t.names[module],13,colors.text,600)}
    ${mono(886,76,t.batch,8)}${mono(1000,76,t.rules,8)}${rect(1158,59,103,24,"none","#3b665d")}${mono(1171,75,t.review,7,colors.aqua)}
    <rect x="58" y="98" width="190" height="545" fill="${colors.panel}"/>${line(248,98,248,643)}${rect(58,98,190,42,"#0b1211","none")}${mono(72,123,t.queue,8,"#9aaba6")}${mono(218,123,"24",8,colors.aqua)}${line(58,140,248,140)}${queueItems}
    <rect x="993" y="98" width="287" height="545" fill="${colors.panel}"/>${line(993,98,993,643)}${mono(1008,123,t.inspector,8,"#9aaba6")}${mono(1201,123,t.qa,7,colors.aqua)}${line(993,140,1280,140)}
    ${rect(1008,155,257,115,"#0c1513")}${mono(1020,176,t.score,7)}${text(1020,224,String(score),32,colors.lime,400)}${rect(1082,191,164,4,"#24322f","none")}${rect(1082,191,Math.min(score,100)*1.64,4,"url(#g)","none")}${mono(1082,220,t.confidence,7)}${mono(1214,220,"HIGH",7,colors.text)}
    ${rect(1008,282,257,205,"#0c1513")}${mono(1020,303,t.stage,7)}${[[t.owner,"R-027"],[t.rules,"V3.6"],[t.sample,"12%"],["STATUS",t.ready]].map((r,i)=>`${line(1020,320+i*39,1250,320+i*39)}${text(1020,343+i*39,r[0],9,"#91a19c")}${mono(1185,343+i*39,r[1],7,i===3?colors.aqua:colors.text)}`).join("")}
    ${rect(1008,503,257,39,colors.aqua,"none")}${mono(1085,528,t.submit,8,"#06100e")}
    ${center}
    <path d="M${cursor[0]} ${cursor[1]} l0 18 5-6 5 10 5-3-6-9 9-1z" fill="#fff" stroke="#07100e" stroke-width="1" filter="url(#shadow)"/><circle cx="${cursor[0]+4}" cy="${cursor[1]+5}" r="${state===3?17:0}" fill="none" stroke="${colors.aqua}" opacity=".65"/>
    ${state>=4?`${rect(748,560,225,61,"#10201a","#54705e",0,'filter="url(#shadow)"')}${mono(764,584,t.pass,8,colors.lime)}${text(764,605,t.passSub,8,"#85958f")}`:""}
    <rect x="58" y="643" width="1222" height="43" fill="#080d0c"/>${line(58,643,1280,643)}${mono(74,669,t.privacy,7,"#5e706b")}<circle cx="786" cy="665" r="3" fill="${colors.lime}"/>${mono(797,669,t.saved,7,"#758681")}${mono(1090,669,"LATENCY 42 MS · SYNC 100%",7,"#5e706b")}
    <rect y="686" width="1280" height="34" fill="#050808"/>${mono(18,708,"MERIDIAN · REAL WORKFLOW CONTEXT · DEVELOPMENT INTERFACE",7,"#34423f")}${mono(1115,708,`FRAME 0${state+1} / 06`,7,"#34423f")}
  </svg>`;
}

function mediaCenter(module, lang, state) {
  if (module === "detect" || module === "lidar") {
    const labels = lang === "zh" ? ["车辆 · 0.97", "车辆 · 0.94", module === "lidar" ? "骑行者 · 0.89" : "行人 · 0.89"] : ["VEHICLE · 0.97", "VEHICLE · 0.94", module === "lidar" ? "CYCLIST · 0.89" : "PEDESTRIAN · 0.89"];
    const boxes = [[330,385,180,144,colors.aqua],[716,350,152,126,colors.yellow],[612,304,66,156,colors.coral]];
    return `<g clip-path="url(#centerClip)"><rect x="248" y="98" width="745" height="545" fill="#070b0b"/><image href="${source[lang][module]}" x="260" y="112" width="723" height="531" preserveAspectRatio="xMidYMid slice" opacity=".8"/>${rect(260,112,723,34,"#080e0d","none")}${mono(274,134,`AX-${module==='detect'?'01':'02'}-0186 / FRAME 00642`,8,colors.text)}${mono(812,134,"ZOOM 100% · GRID ON",7)}${boxes.slice(0,Math.min(state+1,3)).map((b,i)=>`${rect(...b.slice(0,4),"#73ead50a",b[4],0,'stroke-width="2"')}${rect(b[0],b[1]-18,92,18,b[4],"none")}${mono(b[0]+5,b[1]-6,labels[i],7,"#06100e")}`).join("")}${line(260,170+state*66,983,170+state*66,colors.aqua,1)}</g>`;
  }
  if (module === "prefer") {
    const c = lang === "zh" ? { a:"回答 A", b:"回答 B", ta:"结论明确，但缺少关键证据", tb:"论证完整，并说明不确定边界", ev:"证据：B 更符合完整性、可核验性与边界意识要求。", verdict:"当前选择", pick:"回答 B · 更优" } : { a:"RESPONSE A", b:"RESPONSE B", ta:"Direct conclusion, weak evidence", tb:"Complete reasoning with boundaries", ev:"Evidence: B better satisfies completeness, verifiability and boundary awareness.", verdict:"CURRENT VERDICT", pick:"RESPONSE B · PREFERRED" };
    const selected = state >= 2;
    const para = (x,y,width,count) => Array.from({length:count},(_,i)=>rect(x,y+i*18,width-(i%3)*26,4,"#53635e","none")).join("");
    return `${rect(260,112,723,531,"#080e0d")}${rect(260,112,723,34,"#080e0d")}${mono(274,134,"PAIR AX-03-0186 · RUBRIC / HELPFULNESS V2.4",8,colors.text)}${rect(276,164,337,407,"#0c1513",selected?colors.line:colors.aqua)}${rect(630,164,337,407,"#0c1513",selected?colors.violet:colors.line,0,selected?'stroke-width="2"':'')}${mono(292,187,c.a,8,colors.aqua)}${mono(546,187,"MODEL 4.1",7)}${text(292,233,c.ta,14,colors.text,600)}${para(292,258,282,5)}${mono(646,187,c.b,8,selected?colors.violet:colors.aqua)}${mono(900,187,"MODEL 4.2",7)}${text(646,233,c.tb,14,colors.text,600)}${para(646,258,282,5)}${state>=1?`${rect(646,386,288,67,"#181915",colors.yellow)}${text(658,407,c.ev,8,"#d6c79c")}${para(658,421,248,2)}`:""}${rect(276,586,691,40,"#0d1514",colors.line)}${mono(292,611,c.verdict,8)}${mono(812,611,selected?c.pick:"—",8,selected?colors.violet:colors.muted)}`;
  }
  if (module === "finance") {
    const rows = lang === "zh" ? [["申请类型","企业授信","已识别"],["主体名称","远海供应链有限公司","已核验"],["授信金额","¥ 2,800,000","待复核"],["收入证明","最近 12 个月","已匹配"],["风险提示","关联方交易","需关注"]] : [["APPLICATION","SME CREDIT","MATCHED"],["ENTITY","NORTHSTAR SUPPLY CO.","VERIFIED"],["EXPOSURE","$ 420,000","REVIEW"],["INCOME PROOF","LAST 12 MONTHS","MATCHED"],["RISK FLAG","RELATED PARTY","ATTENTION"]];
    return `${rect(260,112,723,531,"#080e0d")}${rect(260,112,723,34,"#080e0d")}${mono(274,134,"DOCUMENT AX-04-0186 · RISK RULESET 3.6",8,colors.text)}${rect(286,172,260,405,"#e8e5dc","none",0,'filter="url(#shadow)"')}${text(308,207,lang==='zh'?"企业授信申请材料":"BUSINESS CREDIT APPLICATION",12,"#27302e",700)}${line(308,221,522,221,"#aca99f",2)}${Array.from({length:13},(_,i)=>rect(308,240+i*22,(i%4===0?125:210),5,(i===4||i===9)?"#e3bd68":"#c8c4b9","none")).join("")}${rows.slice(0,Math.min(state+1,5)).map((r,i)=>`${line(578,184+i*70,950,184+i*70)}${mono(578,204+i*70,r[0],7)}${text(578,229+i*70,r[1],10,colors.text,600)}${mono(872,229+i*70,r[2],7,(i===2||i===4)?colors.yellow:colors.aqua)}`).join("")}`;
  }
  const steps = lang === "zh" ? [["理解任务","确认输入、文件与成功标准"],["制定计划","拆分研究、分析与输出步骤"],["调用工具","检索文件并运行结构化分析"],["生成交付物","形成可复核的完整结果"]] : [["Task intake","Validate inputs, files and success criteria"],["Plan","Decompose research, analysis and output"],["Tool use","Inspect files and run structured analysis"],["Deliverable","Produce a complete reviewable result"]];
  const judge = lang === "zh" ? [["任务有效性","通过"],["工具选择","良好"],["过程完整性","88"],["交付物质量","92"],["评委可靠性","通过"]] : [["Task validity","PASS"],["Tool choice","GOOD"],["Process integrity","88"],["Deliverable quality","92"],["Judge reliability","PASS"]];
  return `${rect(260,112,723,531,"#080e0d")}${rect(260,112,723,34,"#080e0d")}${mono(274,134,"TRACE AX-05-0186 · COMPLEX TASK REVIEW",8,colors.text)}${rect(276,164,403,446,"#0c1513")}${steps.slice(0,Math.min(state+1,4)).map((s,i)=>`${rect(292,181+i*95,30,30,"#0c1816","#3c5a53")}${mono(299,200,`0${i+1}`,8,colors.aqua)}${text(338,195+i*95,s[0],11,colors.text,600)}${text(338,218+i*95,s[1],8,"#748680")}${line(292,248+i*95,663,248+i*95)}`).join("")}${rect(696,164,271,446,"#0c1513")}${rect(714,183,235,118,"#10201d","#2d4c45")}${mono(730,205,lang==='zh'?"综合可靠性":"COMPOSITE RELIABILITY",7)}${text(730,264,String(78+state*3)+".4",42,colors.lime,400)}${judge.map((r,i)=>`${line(714,325+i*46,949,325+i*46)}${text(714,351+i*46,r[0],9,"#91a19c")}${mono(898,351+i*46,r[1],7,colors.aqua)}`).join("")}`;
}

for (const lang of langs) {
  for (const module of modules) {
    const frameDir = join(temp, `${module}-${lang}`);
    mkdirSync(frameDir, { recursive: true });
    for (let state = 0; state < 6; state++) {
      const svgPath = join(frameDir, `frame-${state}.svg`);
      const pngPath = join(frameDir, `frame-${state}.png`);
      writeFileSync(svgPath, shell(module, lang, state, mediaCenter(module, lang, state)));
      execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", svgPath, "-frames:v", "1", pngPath]);
    }
    const inputs = Array.from({ length: 6 }, (_, i) => ["-loop", "1", "-t", "2.4", "-i", join(frameDir, `frame-${i}.png`)]).flat();
    const prep = Array.from({ length: 6 }, (_, i) => `[${i}:v]scale=1280:720,format=yuv420p[v${i}]`).join(";");
    let chain = "[v0][v1]xfade=transition=fade:duration=0.55:offset=1.85[x1]";
    for (let i = 2; i < 6; i++) chain += `;[x${i-1}][v${i}]xfade=transition=fade:duration=0.55:offset=${(1.85*i).toFixed(2)}[x${i}]`;
    const output = join(clips, `${module}-${lang}.mp4`);
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...inputs, "-filter_complex", `${prep};${chain}`, "-map", "[x5]", "-t", "11.65", "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", output]);
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", join(frameDir, "frame-4.png"), "-frames:v", "1", "-q:v", "2", join(posters, lang, `${module}.jpg`)]);
  }
}

for (const lang of langs) {
  const inputs = modules.flatMap((module) => ["-i", join(clips, `${module}-${lang}.mp4`)]);
  const trims = modules.map((_, i) => `[${i}:v]trim=start=1.0:end=5.4,setpts=PTS-STARTPTS[v${i}]`).join(";");
  const concat = modules.map((_, i) => `[v${i}]`).join("") + `concat=n=${modules.length}:v=1:a=0[outv]`;
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...inputs, "-filter_complex", `${trims};${concat}`, "-map", "[outv]", "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", join(clips, `reel-${lang}.mp4`)]);
}

rmSync(temp, { recursive: true, force: true });
console.log("Rendered 10 bilingual module videos, 10 posters and 2 reels.");
