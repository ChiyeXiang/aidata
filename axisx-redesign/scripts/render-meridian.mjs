import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const temp = join(root, ".video-render");
const clips = join(root, "public", "meridian", "clips");
const backgrounds = join(root, "public", "meridian", "backgrounds");
const posters = join(root, "public", "meridian", "v10");
const modules = ["finance", "legal", "medical", "stem", "trajectory", "mle", "program", "swe", "geology", "education"];
const langs = ["en", "zh"];
const fps = 8;
const duration = 11;
const frameCount = fps * duration;
const c = { bg: "#050908", panel: "#0a1210", panel2: "#0e1916", line: "#263630", muted: "#74867f", text: "#eef8f3", aqua: "#75ead4", lime: "#caff72", coral: "#ff715b", violet: "#a99aff", yellow: "#f3cb6d", blue: "#68a8ff" };

rmSync(temp, { recursive: true, force: true });
rmSync(posters, { recursive: true, force: true });
mkdirSync(temp, { recursive: true });
mkdirSync(clips, { recursive: true });
rmSync(backgrounds, { recursive: true, force: true });
mkdirSync(backgrounds, { recursive: true });
for (const lang of langs) mkdirSync(join(posters, lang), { recursive: true });

for (const file of ["detect-en.mp4", "detect-zh.mp4", "lidar-en.mp4", "lidar-zh.mp4", "prefer-en.mp4", "prefer-zh.mp4", "finance-en.mp4", "finance-zh.mp4", "agent-en.mp4", "agent-zh.mp4"]) {
  rmSync(join(clips, file), { force: true });
}
for (const file of ["expert-en.mp4", "expert-zh.mp4"]) rmSync(join(clips, file), { force: true });
for (const file of ["detect.jpg", "lidar.jpg", "prefer.jpg", "finance.jpg", "agent.jpg", "speech.jpg", "command.jpg", "video.jpg"]) {
  rmSync(join(root, "public", "meridian", file), { force: true });
}
rmSync(join(root, "public", "meridian", "v4"), { recursive: true, force: true });
rmSync(join(root, "public", "meridian", "v9"), { recursive: true, force: true });
rmSync(join(root, "public", "meridian", "zh"), { recursive: true, force: true });
rmSync(join(root, "public", "work"), { recursive: true, force: true });

const fontDir = join(root, "scripts", "assets");
const fontConfig = join(temp, "fonts.conf");
writeFileSync(fontConfig, `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig><dir>${fontDir}</dir><cachedir>${join(temp, "font-cache")}</cachedir></fontconfig>`);
const renderEnv = { ...process.env, FONTCONFIG_FILE: fontConfig };

const esc = (v) => String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const text = (x, y, v, size = 12, fill = c.text, weight = 400, extra = "") => `<text x="${x}" y="${y}" fill="${fill}" font-family="'Noto Sans SC Thin',Arial,sans-serif" font-size="${size}" font-weight="${weight}" ${extra}>${esc(v)}</text>`;
const mono = (x, y, v, size = 9, fill = c.muted, extra = "") => `<text x="${x}" y="${y}" fill="${fill}" font-family="'Noto Sans SC Thin',Consolas,monospace" font-size="${size}" letter-spacing="1.05" ${extra}>${esc(v)}</text>`;
const line = (x1, y1, x2, y2, stroke = c.line, width = 1) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}"/>`;
const rect = (x, y, w, h, fill = "none", stroke = c.line, rx = 0, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" rx="${rx}" ${extra}/>`;
const bar = (x, y, w, pct, color = c.aqua) => `${rect(x, y, w, 4, "#25332f", "none")}${rect(x, y, w * pct, 4, color, "none")}`;

const ui = {
  en: {
    preview: "PRODUCT DEVELOPMENT PREVIEW", pilot: "INTERNAL PILOT", batch: "BATCH AX-2609-04", rules: "PROTOCOL V4.1", queue: "ACTIVE WORK", inspector: "ACCEPTANCE", qa: "QA SIGNAL", saved: "EVIDENCE SYNCED", privacy: "PRIVATE WORKSPACE · PROJECT DATA BOUNDARIES ACTIVE", submit: "SUBMIT FOR ADJUDICATION", score: "EVIDENCE COVERAGE", owner: "OWNER", stage: "REVIEW STAGE", sample: "BLIND SAMPLE", ready: "READY FOR REVIEW", pass: "QA GATE PASSED", passSub: "Task, evidence and runtime state recorded", complete: "COMPLETE", active: "IN PROGRESS", queued: "QUEUED", review: "IN REVIEW", confidence: "CONFIDENCE", high: "HIGH", state: "STATE",
    names: { finance: "Finance / Long-context Evidence Review", legal: "Legal / Citation & Conflict Review", medical: "Medical / Evidence & Safety", stem: "STEM / Original Challenge Authoring", trajectory: "Agent / Trajectory Reliability", mle: "MLE · MLS / Experiment Evaluation", program: "ProgramBench / Behavioral Reconstruction", swe: "DeepSWE · FrontierSWE / Repository Evaluation", geology: "Geoscience / Multi-source Interpretation", education: "Education / Assessment Calibration" },
  },
  zh: {
    preview: "产品开发预览", pilot: "内部试运行", batch: "批次 AX-2609-04", rules: "作业协议 V4.1", queue: "进行中任务", inspector: "验收控制", qa: "质量信号", saved: "证据已同步", privacy: "私有作业空间 · 项目数据边界已启用", submit: "提交裁决", score: "证据覆盖度", owner: "负责人", stage: "复核阶段", sample: "盲审比例", ready: "等待复核", pass: "质检门禁通过", passSub: "任务、证据与运行状态已记录", complete: "已完成", active: "执行中", queued: "待处理", review: "复核中", confidence: "置信度", high: "高", state: "状态",
    names: { finance: "金融 / 长上下文证据审阅", legal: "法律 / 引用与冲突审阅", medical: "医学 / 循证与安全", stem: "STEM / 原创高难度出题", trajectory: "Agent / 轨迹可靠性", mle: "MLE · MLS / 实验评测", program: "ProgramBench / 行为级程序重建", swe: "DeepSWE · FrontierSWE / 仓库级评测", geology: "地学 / 多源资料解释", education: "教育 / 评测与难度校准" },
  },
};

const moduleThemes = {
  finance: { accent: c.yellow, glow: "#4b3814", label: "CREDIT EVIDENCE", inspector: { en: "CREDIT QA", zh: "信贷验收" }, queue: { en: ["INGEST", "POLICY MAP", "EVIDENCE", "RISK QA", "RULING"], zh: ["材料接入", "政策映射", "证据抽取", "风险复核", "形成裁决"] } },
  legal: { accent: "#e8a95c", glow: "#4b2b16", label: "CLAUSE REVIEW", inspector: { en: "LEGAL QA", zh: "法律验收" }, queue: { en: ["SCOPE", "EXTRACT", "COMPARE", "CITE", "RULING"], zh: ["法域界定", "条款抽取", "冲突比较", "引用核验", "专业裁决"] } },
  medical: { accent: c.coral, glow: "#4a201b", label: "SAFETY EVIDENCE", inspector: { en: "SAFETY QA", zh: "安全验收" }, queue: { en: ["DE-IDENTIFY", "PICO MAP", "GRADE", "DUAL QA", "SAFETY"], zh: ["去标识化", "PICO 映射", "证据分级", "医学双评", "安全门禁"] } },
  stem: { accent: c.lime, glow: "#304619", label: "CHALLENGE LAB", inspector: { en: "VALIDITY", zh: "有效性验收" }, queue: { en: ["AUTHOR", "SOLVE", "VERIFY", "MODEL PILOT", "RELEASE"], zh: ["专家出题", "独立复算", "验证器", "模型试跑", "发布门禁"] } },
  trajectory: { accent: c.blue, glow: "#183457", label: "AGENT TRACE", inspector: { en: "TRACE QA", zh: "轨迹验收" }, queue: { en: ["CAPTURE", "SEGMENT", "DIAGNOSE", "REPLAY", "RULING"], zh: ["运行采集", "节点切分", "失败归因", "环境复跑", "形成裁决"] } },
  mle: { accent: c.violet, glow: "#30265a", label: "EXPERIMENT OPS", inspector: { en: "RUN QA", zh: "实验验收" }, queue: { en: ["FREEZE", "LAUNCH", "COMPARE", "RERUN", "ACCEPT"], zh: ["环境固化", "实验运行", "指标比较", "独立复跑", "验收归档"] } },
  program: { accent: c.aqua, glow: "#17463d", label: "BEHAVIOR BENCH", inspector: { en: "TEST QA", zh: "测试验收" }, queue: { en: ["SPEC", "IMPLEMENT", "HIDDEN TEST", "TRACE", "ACCEPT"], zh: ["规格推断", "实现重建", "隐藏测试", "行为追踪", "验收归档"] } },
  swe: { accent: "#77d8ff", glow: "#173e51", label: "REPOSITORY OPS", inspector: { en: "CI QA", zh: "工程验收" }, queue: { en: ["ISSUE", "REPO MAP", "PATCH", "CI RUN", "RULING"], zh: ["问题理解", "仓库定位", "补丁生成", "CI 运行", "工程裁决"] } },
  geology: { accent: "#d8b45f", glow: "#453819", label: "GEO INTERPRET", inspector: { en: "GEO QA", zh: "地学验收" }, queue: { en: ["ALIGN", "CORRELATE", "INTERPRET", "CONFLICT QA", "RELEASE"], zh: ["资料对齐", "层位关联", "地质解释", "冲突复核", "成果发布"] } },
  education: { accent: "#c6a2ff", glow: "#392557", label: "ASSESSMENT LAB", inspector: { en: "ITEM QA", zh: "测评验收" }, queue: { en: ["BLUEPRINT", "AUTHOR", "CALIBRATE", "BIAS QA", "RELEASE"], zh: ["蓝图设计", "题项编制", "难度校准", "偏差复核", "发布门禁"] } },
};

function shell(module, lang, progress, center) {
  const t = ui[lang];
  const theme = moduleThemes[module];
  const code = String(modules.indexOf(module) + 1).padStart(2, "0");
  const queue = theme.queue[lang];
  const queueItems = queue.map((name, i) => {
    const y = 151 + i * 82;
    const stageProgress = Math.max(0, Math.min(1, progress * 5 - i));
    const active = stageProgress > 0 && stageProgress < 1;
    const done = stageProgress >= 1;
    return `${rect(70, y, 166, 64, active ? "#11221d" : "none", active ? theme.accent : "none")}${mono(82, y + 19, `0${i + 1} / ${name}`, 7, active ? theme.accent : "#72837d")}${mono(82, y + 42, done ? t.complete : active ? t.active : t.queued, 7, done ? c.lime : active ? c.text : "#45534f")}${bar(82, y + 52, 138, done ? 1 : active ? Math.max(.08, stageProgress) : .08, done ? c.lime : theme.accent)}`;
  }).join("");
  const score = Math.round(78 + progress * 19);
  const cursorRoutes = {
    finance: [[450, 284], [660, 323], [835, 270], [876, 418], [1119, 520]], legal: [[410, 240], [632, 334], [845, 247], [863, 454], [1118, 520]], medical: [[432, 278], [664, 382], [842, 304], [879, 466], [1118, 520]], stem: [[435, 318], [640, 420], [824, 310], [895, 478], [1118, 520]], trajectory: [[400, 248], [611, 404], [842, 241], [861, 470], [1118, 520]], mle: [[413, 235], [628, 350], [825, 296], [860, 488], [1118, 520]], program: [[401, 246], [621, 278], [826, 430], [882, 518], [1118, 520]], swe: [[398, 270], [665, 299], [842, 407], [886, 517], [1118, 520]], geology: [[429, 251], [628, 429], [834, 276], [887, 470], [1118, 520]], education: [[420, 275], [640, 362], [836, 260], [890, 477], [1118, 520]],
  };
  const route = cursorRoutes[module];
  const cursorProgress = Math.min(.999, progress) * (route.length - 1);
  const cursorIndex = Math.floor(cursorProgress);
  const cursorMix = cursorProgress - cursorIndex;
  const cursorNext = route[Math.min(route.length - 1, cursorIndex + 1)];
  const cursor = [route[cursorIndex][0] + (cursorNext[0] - route[cursorIndex][0]) * cursorMix, route[cursorIndex][1] + (cursorNext[1] - route[cursorIndex][1]) * cursorMix];
  const sync = Math.min(100, Math.round(progress * 118));
  const seconds = String(18 + Math.floor(progress * 11)).padStart(2, "0");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="${theme.accent}"/><stop offset="1" stop-color="${c.lime}"/></linearGradient><radialGradient id="glow"><stop stop-color="${theme.glow}"/><stop offset="1" stop-color="${c.bg}"/></radialGradient><filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#000" flood-opacity=".58"/></filter></defs>
    <rect width="1280" height="720" fill="${c.bg}"/><circle cx="830" cy="340" r="440" fill="url(#glow)" opacity=".28"/>
    <rect width="1280" height="44" fill="#070d0b"/>${line(0, 44, 1280, 44)}${line(25, 13, 25, 31, theme.accent, 2)}${line(16, 22, 34, 22, theme.accent, 2)}${mono(44, 27, "AXISX / MERIDIAN", 10, c.text)}${mono(470, 27, theme.label, 8, theme.accent)}${mono(578, 27, "1.2.0", 8, c.lime)}${mono(650, 27, t.preview, 8)}<circle cx="1140" cy="22" r="4" fill="${theme.accent}"/><circle cx="1140" cy="22" r="8" fill="none" stroke="${theme.accent}" opacity=".25"/>${mono(1151, 27, t.pilot, 8, "#b8c5c1")}
    <rect x="0" y="44" width="58" height="642" fill="#070d0b"/>${line(58, 44, 58, 686)}${["AX", "01", "02", "EV", "QA"].map((v, i) => `${rect(12, 58 + i * 45, 34, 34, i === 3 ? "#11221d" : "none", i === 3 ? theme.accent : "none")}${mono(20, 79 + i * 45, v, 8, i === 3 ? theme.accent : "#61716d")}`).join("")}
    <rect x="58" y="44" width="1222" height="54" fill="#08100e"/>${line(58, 98, 1280, 98)}${mono(76, 68, `MODULE / ${code}`, 8, theme.accent)}${text(76, 88, t.names[module], 13, c.text, 600)}${mono(876, 76, t.batch, 8)}${mono(1000, 76, t.rules, 8)}${rect(1154, 59, 107, 24, "none", theme.accent)}${mono(1166, 75, t.review, 7, theme.accent)}
    <rect x="58" y="98" width="190" height="545" fill="${c.panel}"/>${line(248, 98, 248, 643)}${mono(72, 123, t.queue, 8, "#9aaba6")}${mono(216, 123, "05", 8, theme.accent)}${line(58, 140, 248, 140)}${queueItems}
    <rect x="993" y="98" width="287" height="545" fill="${c.panel}"/>${line(993, 98, 993, 643)}${mono(1008, 123, theme.inspector[lang], 8, "#9aaba6")}${mono(1201, 123, t.qa, 7, theme.accent)}${line(993, 140, 1280, 140)}
    ${rect(1008, 155, 257, 115, "#0c1613")}${mono(1020, 176, t.score, 7)}${text(1020, 224, String(score), 32, theme.accent, 400)}${bar(1082, 191, 164, Math.min(score, 100) / 100, theme.accent)}${mono(1082, 220, t.confidence, 7)}${mono(1208, 220, t.high, 7, c.text)}
    ${rect(1008, 282, 257, 205, "#0c1613")}${[[t.owner, "R-027"], [t.rules, "V4.1"], [t.sample, "18%"], [t.state, t.ready]].map((r, i) => `${line(1020, 320 + i * 39, 1250, 320 + i * 39)}${text(1020, 343 + i * 39, r[0], 9, "#91a19c")}${mono(1176, 343 + i * 39, r[1], 7, i === 3 ? theme.accent : c.text)}`).join("")}
    ${rect(1008, 503, 257, 39, theme.accent, "none")}${mono(1054, 528, t.submit, 8, "#06100e")}${center}
    <path d="M${cursor[0]} ${cursor[1]} l0 18 5-6 5 10 5-3-6-9 9-1z" fill="#fff" stroke="#07100e" stroke-width="1" filter="url(#shadow)"/><circle cx="${cursor[0] + 4}" cy="${cursor[1] + 5}" r="${progress > .61 && progress < .67 ? 17 : 0}" fill="none" stroke="${theme.accent}" opacity=".65"/>
    ${progress >= .78 ? `${rect(744, 560, 229, 61, "#10201a", "#54705e", 0, 'filter="url(#shadow)"')}${mono(760, 584, t.pass, 8, c.lime)}${text(760, 605, t.passSub, 8, "#85958f")}` : ""}
    <rect x="58" y="643" width="1222" height="43" fill="#070d0b"/>${line(58, 643, 1280, 643)}${mono(74, 669, t.privacy, 7, "#5e706b")}<circle cx="786" cy="665" r="3" fill="${c.lime}"/>${mono(797, 669, sync >= 100 ? t.saved : lang === "zh" ? `证据同步 ${sync}%` : `EVIDENCE SYNC ${sync}%`, 7, "#758681")}${mono(1060, 669, `RUN 0042 · 14:32:${seconds}`, 7, "#5e706b")}
    <rect y="686" width="1280" height="34" fill="#040706"/>${mono(18, 708, "MERIDIAN · BENCHMARK OPERATIONS · DEVELOPMENT INTERFACE", 7, "#34423f")}${mono(1095, 708, `LIVE RUN · ${Math.round(progress * 100)}%`, 7, "#34423f")}
  </svg>`;
}

function expertCenter(lang, state) {
  const zh = lang === "zh";
  const active = Math.min(Math.floor(state / 2), 2);
  const domains = zh ? [["金融", "FINANCE"], ["法律", "LEGAL"], ["医学", "MEDICAL"]] : [["FINANCE", "RISK"], ["LEGAL", "CITATION"], ["MEDICAL", "SAFETY"]];
  const docs = zh ? [
    ["授信政策与财务材料", "现金流覆盖率低于阈值", "证据 08 · 风险规则 4.1"],
    ["合同条款与法规检索", "责任限制与适用法冲突", "证据 14 · 法域已确认"],
    ["指南与医学文献摘要", "结论需升级医学双评", "证据 06 · 无个人信息"],
  ] : [
    ["Credit policy & financial material", "Coverage ratio below threshold", "EVIDENCE 08 · RISK RULE 4.1"],
    ["Contract clauses & regulatory research", "Liability and governing-law conflict", "EVIDENCE 14 · JURISDICTION SET"],
    ["Guidance & medical literature", "Conclusion escalated to dual medical review", "EVIDENCE 06 · NO PERSONAL DATA"],
  ];
  const d = docs[active];
  return `${rect(260, 112, 723, 531, "#07100e")}${rect(276, 130, 691, 54, "#0b1512")}${domains.map((x, i) => `${rect(289 + i * 219, 142, 202, 30, i === active ? "#173027" : "#0d1714", i === active ? c.lime : c.line)}${mono(305 + i * 219, 162, `${x[0]} / ${x[1]}`, 8, i === active ? c.lime : c.muted)}`).join("")}
    ${rect(276, 201, 432, 383, "#e6e3d9", "none")}${text(299, 229, d[0], 13, "#18221e", 700)}${line(299, 242, 684, 242, "#9e9d94", 2)}${Array.from({ length: 13 }, (_, i) => `${rect(299, 263 + i * 20, 356 - (i % 4) * 38, 5, i === 4 || i === 8 ? "#e2bc61" : "#c4c1b6", "none")}${i === 4 || i === 8 ? mono(650, 270 + i * 20, `E${String(i).padStart(2, "0")}`, 7, "#6e551b") : ""}`).join("")}
    ${rect(724, 201, 243, 383, "#0c1714")}${mono(742, 225, zh ? "专家结论" : "EXPERT FINDING", 8, c.aqua)}${text(742, 257, d[1], 12, c.text, 600)}${Array.from({ length: 4 }, (_, i) => rect(742, 278 + i * 17, 189 - i * 19, 4, "#52645e", "none")).join("")}${rect(742, 366, 205, 58, "#151914", c.yellow)}${mono(756, 388, d[2], 7, c.yellow)}${mono(756, 410, zh ? "来源已绑定 · 置信度 0.91" : "SOURCE LINKED · CONFIDENCE 0.91", 7, c.text)}${line(742, 449, 947, 449)}${[[zh ? "来源完整" : "PROVENANCE", "PASS"], [zh ? "专业复核" : "DOMAIN REVIEW", active === 2 ? "DUAL" : "PASS"], [zh ? "安全边界" : "SAFETY BOUNDARY", "SET"]].map((r, i) => `${text(742, 476 + i * 34, r[0], 8, c.muted)}${mono(897, 476 + i * 34, r[1], 7, c.lime)}`).join("")}`;
}

function financeCenter(lang, state, progress) {
  const zh = lang === "zh";
  const evidenceY = 286 + Math.round(progress * 126);
  const rows = zh ? [["营收增长", "+18.4%", "财报 E07"], ["现金覆盖", "0.82×", "政策 R4.1"], ["债务期限", "14 个月", "附注 E12"], ["风险结论", "升级复核", "证据 3/3"]] : [["REVENUE GROWTH", "+18.4%", "FILING E07"], ["CASH COVERAGE", "0.82×", "POLICY R4.1"], ["DEBT MATURITY", "14 MONTHS", "NOTE E12"], ["RISK FINDING", "ESCALATE", "EVIDENCE 3/3"]];
  return `${rect(260, 112, 723, 531, "#07100e")}${mono(278, 136, "FIN AX-11-0426 · 58K TOKENS · CREDIT MEMO REVIEW", 8, c.text)}
    ${rect(276, 155, 414, 451, "#e8e5da", "none")}${mono(294, 179, zh ? "受控材料 / 2025 年度包" : "CONTROLLED PACK / FY2025", 8, "#52615c")}${text(294, 211, zh ? "授信政策与年度财务材料" : "Credit policy & annual financials", 14, "#15221e", 700)}${line(294, 227, 672, 227, "#aaa99f")}
    ${Array.from({ length: 15 }, (_, i) => `${rect(294, 248 + i * 21, 344 - (i % 5) * 24, 5, Math.abs(248 + i * 21 - evidenceY) < 16 ? "#d8ad4f" : "#c2c0b6", "none")}${Math.abs(248 + i * 21 - evidenceY) < 16 ? mono(636, 255 + i * 21, `E${String(7 + i).padStart(2, "0")}`, 7, "#6a521b") : ""}`).join("")}
    ${rect(706, 155, 261, 451, "#0b1512")}${mono(724, 179, zh ? "信贷判断 / 证据模式" : "CREDIT FINDING / EVIDENCE MODE", 8, c.aqua)}${rows.map((row, i) => `${rect(724, 199 + i * 76, 225, 62, i === Math.min(state, 3) ? "#12241e" : "#0d1916", i === Math.min(state, 3) ? c.yellow : c.line)}${mono(737, 218 + i * 76, row[0], 7, c.muted)}${text(737, 244 + i * 76, row[1], 13, i === 3 ? c.coral : c.text, 650)}${mono(861, 244 + i * 76, row[2], 7, i <= state ? c.lime : c.muted)}`).join("")}${mono(724, 532, zh ? "证据覆盖" : "EVIDENCE COVERAGE", 7)}${bar(724, 548, 225, .38 + progress * .6, c.lime)}${mono(724, 578, zh ? "反证检查" : "COUNTER-EVIDENCE", 7)}${mono(875, 578, progress > .66 ? "PASS" : "RUNNING", 7, progress > .66 ? c.lime : c.yellow)}`;
}

function legalCenter(lang, state, progress) {
  const zh = lang === "zh";
  const clauses = zh ? [["12.4", "责任限制", "冲突"], ["14.2", "适用法律", "已核验"], ["18.1", "终止与存续", "待复核"], ["S-03", "数据处理附件", "已关联"]] : [["12.4", "LIMITATION", "CONFLICT"], ["14.2", "GOVERNING LAW", "VERIFIED"], ["18.1", "TERMINATION", "REVIEW"], ["S-03", "DATA SCHEDULE", "LINKED"]];
  const active = Math.min(3, Math.floor(progress * 4));
  return `${rect(260, 112, 723, 531, "#07100e")}${mono(278, 136, "LEGAL AX-12-0138 · JURISDICTION CN/HK · TEXT VERSION 7", 8, c.text)}
    ${rect(276, 155, 405, 451, "#e9e6dc", "none")}${mono(294, 179, zh ? "主协议 / 第 12—18 条" : "MASTER AGREEMENT / CLAUSES 12—18", 8, "#596560")}${text(294, 211, zh ? "责任、适用法与存续条款审阅" : "Liability, governing law & survival", 14, "#16221e", 700)}${line(294, 227, 663, 227, "#aaa99f")}${Array.from({ length: 14 }, (_, i) => `${rect(294, 250 + i * 22, 330 - (i % 4) * 28, 5, i === 3 + active * 2 ? "#efc670" : "#c3c0b6", "none")}${i === 3 + active * 2 ? rect(289, 239 + i * 22, 378, 26, "none", "#9d7426") : ""}`).join("")}
    ${rect(697, 155, 270, 451, "#0b1512")}${mono(715, 179, zh ? "条款关系图" : "CLAUSE RELATION MAP", 8, c.aqua)}${clauses.map((row, i) => `${rect(715, 198 + i * 76, 234, 62, i === active ? "#272016" : "#0e1916", i === active ? c.yellow : c.line)}${mono(728, 218 + i * 76, row[0], 8, i === active ? c.yellow : c.aqua)}${text(778, 218 + i * 76, row[1], 8, c.text, 600)}${mono(728, 245 + i * 76, row[2], 7, row[2].includes("冲突") || row[2] === "CONFLICT" ? c.coral : row[2].includes("待") || row[2] === "REVIEW" ? c.yellow : c.lime)}`).join("")}${line(715, 516, 949, 516)}${mono(715, 540, zh ? "引用一致率" : "CITATION AGREEMENT", 7)}${text(715, 577, `${(91.2 + progress * 5.6).toFixed(1)}%`, 22, c.lime, 500)}${mono(835, 577, progress > .76 ? (zh ? "进入裁决" : "TO RULING") : (zh ? "核验中" : "VERIFYING"), 7, progress > .76 ? c.coral : c.yellow)}`;
}

function medicalCenter(lang, state, progress) {
  const zh = lang === "zh";
  const sources = zh ? [["指南 G-14", "高", "一致"], ["综述 R-08", "中", "支持"], ["试验 T-21", "高", "限定人群"], ["病例材料", "—", "已去标识"]] : [["GUIDELINE G-14", "HIGH", "CONSISTENT"], ["REVIEW R-08", "MOD", "SUPPORT"], ["TRIAL T-21", "HIGH", "POPULATION LIMIT"], ["CASE MATERIAL", "—", "DE-IDENTIFIED"]];
  const active = Math.min(3, Math.floor(progress * 4));
  return `${rect(260, 112, 723, 531, "#07100e")}${mono(278, 136, "MED AX-13-0362 · PICO EVIDENCE · NO PHI", 8, c.text)}${rect(276, 155, 691, 78, "#0b1512")}${[["P", zh ? "目标人群" : "POPULATION"], ["I", zh ? "干预" : "INTERVENTION"], ["C", zh ? "对照" : "COMPARATOR"], ["O", zh ? "结局" : "OUTCOME"]].map((x, i) => `${rect(290 + i * 165, 172, 151, 44, i <= active ? "#10251f" : "#0d1815", i <= active ? c.aqua : c.line)}${mono(302 + i * 165, 190, x[0], 8, c.aqua)}${text(322 + i * 165, 201, x[1], 8, c.text)}`).join("")}
    ${rect(276, 249, 436, 357, "#0b1512")}${mono(294, 273, zh ? "来源与证据等级" : "SOURCE & EVIDENCE GRADE", 8, c.aqua)}${sources.map((row, i) => `${rect(294, 292 + i * 61, 400, 48, i === active ? "#151f1a" : "#0e1815", i === active ? c.yellow : c.line)}${text(307, 313 + i * 61, row[0], 9, c.text, 600)}${mono(307, 332 + i * 61, row[1], 7, i < 3 ? c.lime : c.muted)}${mono(494, 332 + i * 61, row[2], 7, i === 2 ? c.yellow : c.aqua)}`).join("")}${mono(294, 558, zh ? "来源覆盖" : "PROVENANCE COVERAGE", 7)}${bar(294, 574, 400, .45 + progress * .52, c.lime)}
    ${rect(728, 249, 239, 357, "#0b1512")}${mono(746, 273, zh ? "安全审阅" : "SAFETY REVIEW", 8, c.aqua)}${text(746, 316, zh ? "高风险结论" : "HIGH-RISK FINDING", 10, c.text, 650)}${rect(746, 337, 203, 58, "#241817", c.coral)}${mono(760, 359, zh ? "需要医学双评" : "DUAL MEDICAL REVIEW", 8, c.coral)}${mono(760, 381, zh ? "不输出诊断建议" : "NO DIAGNOSTIC OUTPUT", 7, c.text)}${line(746, 420, 949, 420)}${[[zh ? "复核 A" : "REVIEW A", progress > .48], [zh ? "复核 B" : "REVIEW B", progress > .69], [zh ? "升级理由" : "RATIONALE", progress > .82]].map((x, i) => `${text(746, 453 + i * 43, x[0], 8, c.muted)}${mono(879, 453 + i * 43, x[1] ? "PASS" : "PENDING", 7, x[1] ? c.lime : c.yellow)}`).join("")}`;
}

function stemCenter(lang, state) {
  const zh = lang === "zh";
  const active = Math.min(state, 4);
  const domains = zh ? ["数学", "物理", "化学", "生物", "计算机"] : ["MATH", "PHYSICS", "CHEM", "BIO", "CS"];
  const prompts = zh ? [
    ["谱图上的极值构造", "证明最优界并给出唯一性条件"],
    ["非线性振子耦合", "推导稳定域与临界频率"],
    ["反应网络平衡", "求解约束下的可辨识参数"],
    ["群体动力学反演", "从稀疏观测恢复转移结构"],
    ["随机算法下界", "构造反例并证明复杂度界"],
  ] : [
    ["Extremal spectral construction", "Prove the tight bound and uniqueness conditions"],
    ["Coupled nonlinear oscillators", "Derive the stability region and critical frequency"],
    ["Reaction-network equilibrium", "Resolve identifiable parameters under constraints"],
    ["Population-dynamics inversion", "Recover transition structure from sparse observations"],
    ["Randomized algorithm lower bound", "Construct a counterexample and prove the bound"],
  ];
  const d = prompts[active];
  const modelPass = ["18%", "12%", "9%", "7%", "5%", "4%"][state];
  return `${rect(260, 112, 723, 531, "#07100e")}${mono(278, 136, "STEM AX-02-0317 · ORIGINAL CHALLENGE AUTHORING", 8, c.text)}
    ${rect(276, 155, 691, 50, "#0b1512")}${domains.map((name, i) => `${rect(288 + i * 132, 166, 119, 27, i === active ? "#1a3024" : "#0d1714", i === active ? c.lime : c.line)}${mono(301 + i * 132, 184, name, 7, i === active ? c.lime : c.muted)}`).join("")}
    ${rect(276, 221, 425, 385, "#e8e5da", "none")}${mono(296, 245, zh ? "原创题面 / 未公开" : "ORIGINAL PROMPT / UNPUBLISHED", 8, "#56645f")}${text(296, 278, d[0], 16, "#13211d", 700)}${text(296, 305, d[1], 10, "#35433e", 500)}
    ${line(296, 326, 681, 326, "#aaa99f")}${mono(296, 351, zh ? "条件与符号系统" : "CONDITIONS & NOTATION", 7, "#69736f")}${mono(296, 385, "for x in Omega: F(x, lambda) = 0", 12, "#16221e")}${mono(296, 418, "lambda* = argmin L(lambda), det(J) != 0", 10, "#16221e")}${Array.from({ length: 5 }, (_, i) => rect(296, 447 + i * 22, 338 - (i % 3) * 37, 5, i === 2 ? "#d9ad4f" : "#c5c2b7", "none")).join("")}
    ${rect(717, 221, 250, 179, "#0b1512")}${mono(735, 245, zh ? "难度校准" : "DIFFICULTY CALIBRATION", 8, c.aqua)}${text(735, 285, modelPass, 28, c.lime, 500)}${mono(807, 279, zh ? "模型通过率" : "MODEL PASS RATE", 7)}${bar(735, 305, 210, Math.max(.04, parseInt(modelPass) / 25), c.lime)}${mono(735, 334, zh ? "等级" : "TIER", 7)}${mono(858, 334, state >= 3 ? "FRONTIER" : "ADVANCED", 8, state >= 3 ? c.coral : c.yellow)}${mono(735, 365, zh ? "专家复算" : "EXPERT SOLVE", 7)}${mono(858, 365, state >= 2 ? "2 / 2" : "1 / 2", 8, state >= 2 ? c.lime : c.yellow)}
    ${rect(717, 417, 250, 189, "#0b1512")}${mono(735, 441, zh ? "有效性门禁" : "VALIDITY GATES", 8, c.aqua)}${[[zh ? "答案唯一" : "UNIQUE ANSWER", state >= 1], [zh ? "参考解完整" : "REFERENCE DERIVATION", state >= 2], [zh ? "验证器" : "PROGRAMMATIC VERIFIER", state >= 3], [zh ? "可检索性" : "SEARCHABILITY SCREEN", state >= 4]].map((r, i) => `${line(735, 460 + i * 32, 947, 460 + i * 32)}${text(735, 483 + i * 32, r[0], 8, c.muted)}${mono(895, 483 + i * 32, r[1] ? "PASS" : "RUN", 7, r[1] ? c.lime : c.yellow)}`).join("")}`;
}

function trajectoryCenter(lang, state) {
  const zh = lang === "zh";
  const steps = zh ? [["计划", "拆分文件、检索与验证"], ["工具调用", "read_document · 8 files"], ["观察", "发现规则版本冲突"], ["修正", "回退并限定来源版本"], ["交付", "生成可复核结果"]] : [["PLAN", "Split files, research and verification"], ["TOOL CALL", "read_document · 8 files"], ["OBSERVATION", "Conflicting rule versions found"], ["RECOVERY", "Rollback and constrain source version"], ["DELIVER", "Produce reviewable result"]];
  const visible = Math.min(state + 1, steps.length);
  return `${rect(260, 112, 723, 531, "#07100e")}${mono(278, 136, "TRACE AX-02-0441 · 18 STEPS · 06 TOOLS · 01 RECOVERY", 8, c.text)}${rect(276, 155, 430, 451, "#0b1512")}${steps.slice(0, visible).map((s, i) => `${rect(294, 177 + i * 76, 28, 28, i === 3 ? "#2d201d" : "#10241e", i === 3 ? c.coral : c.aqua)}${mono(301, 196 + i * 76, `0${i + 1}`, 8, i === 3 ? c.coral : c.aqua)}${text(338, 189 + i * 76, s[0], 10, c.text, 700)}${text(338, 211 + i * 76, s[1], 8, c.muted)}${i < 4 ? line(308, 207 + i * 76, 308, 245 + i * 76, i === 2 ? c.coral : c.line, 2) : ""}`).join("")}${rect(722, 155, 245, 214, "#0b1512")}${mono(740, 179, zh ? "当前事件" : "ACTIVE EVENT", 8, c.aqua)}${text(740, 215, steps[Math.min(state, 4)][0], 18, c.text, 600)}${mono(740, 244, zh ? "节点可靠性" : "NODE RELIABILITY", 7)}${text(740, 285, state < 3 ? "0.82" : "0.94", 34, state < 3 ? c.yellow : c.lime, 400)}${bar(740, 306, 205, state < 3 ? .82 : .94, state < 3 ? c.yellow : c.lime)}${rect(722, 386, 245, 220, "#0b1512")}${mono(740, 410, zh ? "失败分类" : "FAILURE TAXONOMY", 8, c.aqua)}${[[zh ? "任务" : "TASK", "PASS"], [zh ? "规划" : "PLAN", "PASS"], [zh ? "工具" : "TOOL", state >= 2 ? "REVIEW" : "—"], [zh ? "执行" : "EXECUTION", state >= 3 ? "RECOVERED" : "—"], [zh ? "结果" : "OUTCOME", state >= 4 ? "PASS" : "PENDING"]].map((r, i) => `${line(740, 428 + i * 31, 947, 428 + i * 31)}${text(740, 450 + i * 31, r[0], 8, c.muted)}${mono(868, 450 + i * 31, r[1], 7, r[1] === "REVIEW" ? c.yellow : r[1] === "RECOVERED" ? c.aqua : c.lime)}`).join("")}`;
}

function mleCenter(lang, state) {
  const zh = lang === "zh";
  const runs = [["BASELINE", ".782", "PASS"], ["FEATURE SET A", ".811", "PASS"], ["ABLATION B", ".804", "PASS"], ["METHOD V3", ".836", state >= 3 ? "VERIFIED" : "RUNNING"]];
  return `${rect(260, 112, 723, 531, "#07100e")}${mono(278, 136, "ML EVAL AX-03-0294 · REPRODUCIBLE RUN PACK", 8, c.text)}${rect(276, 155, 433, 255, "#0b1512")}${mono(292, 179, zh ? "实验运行" : "EXPERIMENT RUNS", 8, c.aqua)}${runs.map((r, i) => `${line(292, 199 + i * 47, 691, 199 + i * 47)}${mono(292, 229 + i * 47, `RUN 0${i + 1}`, 7)}${text(360, 229 + i * 47, r[0], 9, c.text)}${mono(584, 229 + i * 47, r[1], 8, c.yellow)}${mono(632, 229 + i * 47, i <= state ? r[2] : "QUEUED", 7, i <= state ? c.lime : c.muted)}`).join("")}${rect(725, 155, 242, 255, "#0b1512")}${mono(742, 179, zh ? "指标变化" : "METRIC DELTA", 8, c.aqua)}${[.58, .72, .67, state >= 3 ? .9 : .74].map((v, i) => `${rect(747 + i * 46, 355 - v * 150, 23, v * 150, i === 3 ? c.lime : "#315147", "none")}${mono(749 + i * 46, 376, `R${i + 1}`, 7)}`).join("")}${line(742, 355, 945, 355)}${rect(276, 429, 691, 177, "#0b1512")}${mono(292, 453, zh ? "验收证据" : "ACCEPTANCE EVIDENCE", 8, c.aqua)}${[[zh ? "环境锁定" : "ENVIRONMENT LOCK", "sha256:7f3…"], [zh ? "数据版本" : "DATA VERSION", "dataset-v2.4"], [zh ? "运行日志" : "RUN LOGS", "4 / 4"], [zh ? "产物检查" : "ARTIFACT CHECK", state >= 4 ? "PASS" : "REVIEW"], [zh ? "独立复跑" : "INDEPENDENT RERUN", state >= 5 ? "MATCH" : "PENDING"]].map((r, i) => `${rect(292 + (i % 3) * 218, 470 + Math.floor(i / 3) * 57, 202, 43, "#0e1b17", c.line)}${text(303 + (i % 3) * 218, 487 + Math.floor(i / 3) * 57, r[0], 8, c.muted)}${mono(303 + (i % 3) * 218, 505 + Math.floor(i / 3) * 57, r[1], 7, r[1] === "PENDING" || r[1] === "REVIEW" ? c.yellow : c.lime)}`).join("")}`;
}

function programCenter(lang, state) {
  const zh = lang === "zh";
  const tests = [["CLI", 1], ["FILES", state >= 1 ? 1 : 0], ["ERRORS", state >= 2 ? 1 : 0], ["STATE", state >= 3 ? 1 : 0], ["EDGE", state >= 4 ? 1 : 0]];
  const code = ["class ArchiveEngine:", "  def open(self, path):", "    header = parse_header(path)", "    return self.index(header)", "", "  def extract(self, target):", "    validate_boundary(target)", "    return write_payload(target)"];
  return `${rect(260, 112, 723, 531, "#07100e")}${mono(278, 136, "PROGRAM AX-04-0158 · BEHAVIORAL RECONSTRUCTION", 8, c.text)}${rect(276, 155, 253, 451, "#0b1512")}${mono(294, 179, zh ? "行为规格" : "BEHAVIOR SPEC", 8, c.aqua)}${(zh ? ["命令行接口与返回码", "归档读写与目录结构", "损坏输入的错误行为", "持久状态与并发边界", "隐藏测试不可见"] : ["CLI surface and exit codes", "Archive I/O and directory shape", "Corrupt-input error behavior", "Persistent state and concurrency", "Hidden tests remain unseen"]).map((x, i) => `${rect(294, 200 + i * 63, 217, 47, state >= i ? "#10211c" : "#0d1714", state >= i ? "#365f52" : c.line)}${mono(305, 219 + i * 63, `0${i + 1}`, 7, state >= i ? c.lime : c.muted)}${text(337, 229 + i * 63, x, 8, c.text)}`).join("")}${rect(545, 155, 422, 282, "#08100e")}${mono(563, 179, "candidate/src/engine.py", 8, c.violet)}${code.map((x, i) => `${mono(563, 207 + i * 26, String(i + 1).padStart(2, "0"), 7, "#45534f")}${mono(592, 207 + i * 26, x, 8, i === 0 || i === 5 ? c.aqua : x.includes("return") ? c.yellow : c.text)}`).join("")}${rect(545, 453, 422, 153, "#0b1512")}${mono(563, 477, zh ? "隐藏行为测试" : "HIDDEN BEHAVIOR TESTS", 8, c.aqua)}${tests.map((r, i) => `${rect(563 + i * 76, 496, 63, 70, r[1] ? "#11251e" : "#151a17", r[1] ? c.lime : c.line)}${mono(574 + i * 76, 518, r[0], 7, r[1] ? c.lime : c.muted)}${text(579 + i * 76, 552, r[1] ? "✓" : "·", 18, r[1] ? c.lime : c.muted, 700)}`).join("")}`;
}

function sweCenter(lang, state) {
  const zh = lang === "zh";
  const files = ["src/runtime.ts", "src/config.ts", "tests/runtime.spec.ts", "tests/regression.spec.ts"];
  const diff = ["@@ -118,6 +118,14 @@", "+ const pending = registry.active();", "+ await Promise.all(pending.map(cancel));", "+ registry.clear();", "  await server.close();", "+ assertNoDanglingHandles();"];
  return `${rect(260, 112, 723, 531, "#07100e")}${mono(278, 136, "REPO AX-05-0087 · LONG-HORIZON ENGINEERING", 8, c.text)}${rect(276, 155, 211, 451, "#0b1512")}${mono(294, 179, zh ? "仓库变更" : "REPOSITORY CHANGE", 8, c.aqua)}${mono(294, 208, "axis-runtime / 8f1c2d", 7, c.text)}${files.map((f, i) => `${text(301, 252 + i * 42, i < 2 ? "M" : "+", 9, i < 2 ? c.yellow : c.lime, 700)}${mono(322, 252 + i * 42, f, 7, state >= i ? c.text : c.muted)}`).join("")}${line(294, 436, 469, 436)}${mono(294, 460, zh ? "变更范围" : "CHANGE SCOPE", 7)}${text(294, 491, "+84 / -17", 17, c.lime, 500)}${mono(294, 524, zh ? "4 文件 · 2 测试套件" : "4 FILES · 2 TEST SUITES", 7, c.text)}${rect(503, 155, 464, 281, "#08100e")}${mono(521, 179, "src/runtime.ts · PATCH", 8, c.violet)}${diff.map((x, i) => `${mono(521, 211 + i * 31, String(118 + i).padStart(3, "0"), 7, "#45534f")}${rect(557, 191 + i * 31, 392, 28, x.startsWith("+") ? "#0d211a" : "none", "none")}${mono(568, 211 + i * 31, x, 8, x.startsWith("+") ? c.lime : x.startsWith("@@") ? c.violet : c.text)}`).join("")}${rect(503, 453, 464, 153, "#0b1512")}${mono(521, 477, zh ? "验证器结果" : "VERIFIER RESULTS", 8, c.aqua)}${[["UNIT", state >= 1], ["REGRESSION", state >= 2], ["BEHAVIOR", state >= 3], ["CLEANUP", state >= 4]].map((r, i) => `${rect(521 + i * 106, 497, 92, 69, r[1] ? "#11251e" : "#151a17", r[1] ? c.lime : c.line)}${mono(535 + i * 106, 520, r[0], 7, r[1] ? c.lime : c.muted)}${mono(535 + i * 106, 548, r[1] ? "PASS" : "RUNNING", 7, r[1] ? c.lime : c.yellow)}`).join("")}`;
}

function geologyCenter(lang, state, progress) {
  const zh = lang === "zh";
  const depth = 2480 + Math.round(progress * 184);
  const active = Math.min(3, Math.floor(progress * 4));
  const intervals = zh ? [["K2-3", "砂岩", "高置信"], ["K2-4", "泥岩夹层", "需复核"], ["K3-1", "砂岩", "跨井对齐"], ["K3-2", "断层邻近", "不确定"]] : [["K2-3", "SANDSTONE", "HIGH CONF."], ["K2-4", "SHALE BAND", "REVIEW"], ["K3-1", "SANDSTONE", "CROSS-WELL"], ["K3-2", "NEAR FAULT", "UNCERTAIN"]];
  return `${rect(260, 112, 723, 531, "#07100e")}${mono(278, 136, "GEO AX-18-0724 · WELL B-17 / B-21 · SOURCE PACK V3", 8, c.text)}
    ${rect(276, 155, 282, 451, "#0b1512")}${mono(294, 179, zh ? "测井与层位对齐" : "LOG & INTERVAL ALIGNMENT", 8, c.aqua)}${mono(294, 208, `${depth} m`, 12, c.yellow)}${line(336, 226, 336, 574, "#43554f")}${line(436, 226, 436, 574, "#43554f")}${mono(303, 241, "GR", 7)}${mono(403, 241, "RES", 7)}
    <path d="M336 250 C312 270 365 291 325 311 S365 352 316 374 S358 418 324 442 S366 487 322 512 S360 548 332 575" fill="none" stroke="${c.lime}" stroke-width="3"/><path d="M436 250 C465 275 411 301 454 328 S414 372 462 398 S418 447 450 472 S420 523 446 575" fill="none" stroke="${c.aqua}" stroke-width="3"/>${rect(290, 252 + progress * 250, 252, 34, "rgba(243,203,109,.12)", c.yellow)}
    ${rect(574, 155, 393, 244, "#0b1512")}${mono(592, 179, zh ? "构造解释 / 脱敏图件" : "STRUCTURAL INTERPRETATION / SANITIZED", 8, c.aqua)}${[0,1,2,3,4].map((i) => `<path d="M592 ${235 + i * 29} C660 ${205 + i * 37} 746 ${272 + i * 18} 949 ${221 + i * 34}" fill="none" stroke="${i === active ? c.yellow : "#385049"}" stroke-width="${i === active ? 3 : 1}"/>`).join("")}<path d="M782 199 L754 371" stroke="${c.coral}" stroke-width="3" stroke-dasharray="6 5"/>${mono(790, 215, zh ? "推测断层 F-3" : "INFERRED FAULT F-3", 7, c.coral)}
    ${rect(574, 415, 393, 191, "#0b1512")}${mono(592, 439, zh ? "跨来源解释" : "CROSS-SOURCE INTERPRETATION", 8, c.aqua)}${intervals.map((r, i) => `${line(592, 456 + i * 33, 949, 456 + i * 33)}${mono(592, 478 + i * 33, r[0], 7, i === active ? c.yellow : c.text)}${text(650, 478 + i * 33, r[1], 8, c.text)}${mono(847, 478 + i * 33, r[2], 7, r[2].includes("复核") || r[2] === "REVIEW" || r[2].includes("不确定") || r[2] === "UNCERTAIN" ? c.yellow : c.lime)}`).join("")}`;
}

function educationCenter(lang, state, progress) {
  const zh = lang === "zh";
  const active = Math.min(3, Math.floor(progress * 4));
  const checks = zh ? [["课程目标", "已对齐"], ["原创性", "通过"], ["步骤量规", "4 / 4"], ["偏差检查", "运行中"]] : [["CURRICULUM TARGET", "ALIGNED"], ["ORIGINALITY", "PASS"], ["STEP RUBRIC", "4 / 4"], ["BIAS CHECK", "RUNNING"]];
  const curve = 118 + progress * 52;
  return `${rect(260, 112, 723, 531, "#07100e")}${mono(278, 136, "EDU AX-19-1642 · ITEM AUTHORING · CALIBRATION COHORT C", 8, c.text)}
    ${rect(276, 155, 423, 451, "#e8e5da", "none")}${mono(294, 179, zh ? "原创任务 / 物理 · 能量守恒" : "ORIGINAL ITEM / PHYSICS · ENERGY", 8, "#596560")}${text(294, 213, zh ? "诊断推理路径，而不只判断最终答案" : "Diagnose the path—not only the answer", 13, "#15221e", 700)}${line(294, 229, 681, 229, "#aaa99f")}${mono(294, 260, "E = 1/2 mv² + mgh", 14, "#16221e")}${Array.from({ length: 6 }, (_, i) => rect(294, 292 + i * 24, 342 - (i % 3) * 33, 5, i === active ? "#d8ad4f" : "#c4c1b6", "none")).join("")}${mono(294, 455, zh ? "步骤级评分量规" : "STEP-LEVEL RUBRIC", 8, "#596560")}${["01", "02", "03", "04"].map((x, i) => `${rect(294 + i * 92, 477, 78, 60, i <= active ? "#dfe8d2" : "#d1cec4", i <= active ? "#698c30" : "#aaa99f")}${mono(307 + i * 92, 499, x, 7, "#48564f")}${mono(307 + i * 92, 522, i <= active ? "PASS" : "CHECK", 7, i <= active ? "#527a17" : "#746d5b")}`).join("")}${mono(294, 570, zh ? "典型误区：忽略参考系变化" : "MISCONCEPTION: FRAME SHIFT OMITTED", 7, "#8a641c")}
    ${rect(715, 155, 252, 188, "#0b1512")}${mono(733, 179, zh ? "知识依赖图" : "KNOWLEDGE DEPENDENCY", 8, c.aqua)}${[[759,235],[838,209],[900,257],[814,297]].map((n, i) => `${i ? line(759,235,n[0],n[1],i <= active ? c.aqua : c.line,2) : ""}<circle cx="${n[0]}" cy="${n[1]}" r="${i === active ? 18 : 12}" fill="${i <= active ? "#173027" : "#101a17"}" stroke="${i <= active ? c.lime : c.line}"/>${mono(n[0]-8,n[1]+3,`K${i+1}`,6,i<=active?c.lime:c.muted)}`).join("")}
    ${rect(715, 359, 252, 247, "#0b1512")}${mono(733, 383, zh ? "难度与区分度" : "DIFFICULTY & DISCRIMINATION", 8, c.aqua)}${line(739, 540, 941, 540)}${line(739, 414, 739, 540)}<path d="M739 532 C778 528 790 512 814 486 S855 ${curve} 941 421" fill="none" stroke="${c.violet}" stroke-width="3"/>${line(853, 414, 853, 540, c.yellow, 1)}${mono(860, 433, zh ? "目标难度" : "TARGET", 7, c.yellow)}${checks.map((r, i) => `${mono(733, 565 + i * 0, "", 1)}${i < 3 ? `${mono(733 + i * 72, 576, r[0].slice(0,10), 6, c.muted)}${mono(733 + i * 72, 593, r[1], 6, i <= active ? c.lime : c.yellow)}` : ""}`).join("")}`;
}

function moduleCenter(module, lang, state, progress) {
  if (module === "finance") return financeCenter(lang, state, progress);
  if (module === "legal") return legalCenter(lang, state, progress);
  if (module === "medical") return medicalCenter(lang, state, progress);
  if (module === "stem") return stemCenter(lang, state);
  if (module === "trajectory") return trajectoryCenter(lang, state);
  if (module === "mle") return mleCenter(lang, state);
  if (module === "program") return programCenter(lang, state);
  if (module === "swe") return sweCenter(lang, state);
  if (module === "geology") return geologyCenter(lang, state, progress);
  return educationCenter(lang, state, progress);
}

for (const lang of langs) {
  for (const module of modules) {
    const frameDir = join(temp, `${module}-${lang}`);
    mkdirSync(frameDir, { recursive: true });
    for (let frame = 0; frame < frameCount; frame++) {
      const progress = frame / (frameCount - 1);
      const state = Math.min(5, Math.floor(progress * 6));
      const svgPath = join(frameDir, `frame-${String(frame).padStart(3, "0")}.svg`);
      writeFileSync(svgPath, shell(module, lang, progress, moduleCenter(module, lang, state, progress)));
    }
    const output = join(clips, `${module}-${lang}.mp4`);
    const videoArgs = ["-y", "-loglevel", "error", "-framerate", String(fps), "-i", join(frameDir, "frame-%03d.svg"), "-vf", "scale=1280:720,format=yuv420p", "-r", "24", "-t", String(duration), "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", output];
    execFileSync("ffmpeg", videoArgs, { env: renderEnv });
    try {
      execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1", output]);
    } catch {
      execFileSync("ffmpeg", videoArgs, { env: renderEnv });
    }
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", join(frameDir, `frame-${String(Math.floor(frameCount * .72)).padStart(3, "0")}.svg`), "-frames:v", "1", "-q:v", "2", join(posters, lang, `${module}.jpg`)], { env: renderEnv });
  }
}

for (const lang of langs) {
  const inputs = modules.flatMap((module) => ["-i", join(clips, `${module}-${lang}.mp4`)]);
  const trims = modules.map((_, i) => `[${i}:v]trim=start=1.0:end=3.4,setpts=PTS-STARTPTS[v${i}]`).join(";");
  const concat = modules.map((_, i) => `[v${i}]`).join("") + `concat=n=${modules.length}:v=1:a=0[outv]`;
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...inputs, "-filter_complex", `${trims};${concat}`, "-map", "[outv]", "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", join(clips, `reel-${lang}.mp4`)]);
}

const backgroundPairs = {
  home: ["stem", "finance"],
  services: ["legal", "trajectory"],
  work: ["swe", "medical"],
  meridian: ["trajectory", "program"],
  future: ["mle", "geology"],
};

for (const lang of langs) {
  for (const [name, [first, second]] of Object.entries(backgroundPairs)) {
    const output = join(backgrounds, `${name}-${lang}.mp4`);
    const treatment = "scale=1408:792,crop=1280:720:64:36,eq=saturation=.72:contrast=1.08:brightness=-.02";
    execFileSync("ffmpeg", [
      "-y", "-loglevel", "error",
      "-i", join(clips, `${first}-${lang}.mp4`),
      "-i", join(clips, `${second}-${lang}.mp4`),
      "-filter_complex", `[0:v]trim=start=0.2:end=6.2,setpts=PTS-STARTPTS,${treatment}[a];[1:v]trim=start=0.2:end=6.2,setpts=PTS-STARTPTS,${treatment}[b];[a][b]xfade=transition=fadeblack:duration=0.6:offset=5.4,format=yuv420p[out]`,
      "-map", "[out]", "-t", "11", "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "22", "-pix_fmt", "yuv420p", "-movflags", "+faststart", output,
    ]);
  }
}

for (const lang of langs) {
  for (const module of modules) {
    execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1", join(clips, `${module}-${lang}.mp4`)]);
  }
  execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1", join(clips, `reel-${lang}.mp4`)]);
  for (const name of Object.keys(backgroundPairs)) {
    execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1", join(backgrounds, `${name}-${lang}.mp4`)]);
  }
}

rmSync(temp, { recursive: true, force: true });
console.log("Rendered 20 bilingual continuous workflow videos, 20 posters, 2 reels and 10 background videos.");
