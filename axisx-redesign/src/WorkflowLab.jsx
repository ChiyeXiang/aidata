import React, { useEffect, useState } from "react";
import { WORKFLOW_DEMOS } from "./lab";
import { SITE_EMAIL } from "./content";

const BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

function ContactLink({ route, children }) {
  const href = `${BASE}${route.lang === "zh" ? "/zh" : ""}/contact`;
  return <a className="button-link light" href={href} onClick={(event) => { event.preventDefault(); route.navigate("/contact", route.lang); }}>{children}<span>↗</span></a>;
}

function FinanceCanvas({ copy, stage }) {
  return <div className="lab-canvas finance-canvas">
    <div className="lab-canvas-head"><div><span>CONTROLLED MATERIAL PACK</span><h3>{copy.materialTitle}</h3></div><b>V1.3 / DEMO</b></div>
    <p className="lab-canvas-lead">{copy.materialLead}</p>
    <div className="finance-ledger">{copy.rows.map(([label, value, note], index) => <div className={stage === Math.min(index, 3) ? "is-current" : ""} key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small></div>)}</div>
    <div className="finance-findings"><header><span>FINDINGS / EVIDENCE MAP</span><b>{Math.min(3, Math.max(1, stage))} / 3 BOUND</b></header>{copy.findings.map(([id, finding, source], index) => <div className={stage >= index + 1 ? "is-complete" : ""} key={id}><span>{id}</span><p>{finding}</p><code>{source}</code></div>)}</div>
  </div>;
}

function MedicalCanvas({ copy, stage }) {
  return <div className="lab-canvas medical-canvas">
    <div className="lab-canvas-head"><div><span>EVIDENCE QUESTION / DEMO</span><h3>MED-EQ-018</h3></div><b>NO PATIENT DATA</b></div>
    <p className="medical-question">{copy.question}</p>
    <div className="pico-grid">{copy.pico.map(([key, value], index) => <div className={stage >= 1 && index <= stage ? "is-current" : ""} key={key}><strong>{key}</strong><p>{value}</p></div>)}</div>
    <div className="medical-sources"><header><span>SOURCE</span><span>TYPE</span><span>GRADE</span><span>USE</span></header>{copy.sources.map((row, index) => <div className={stage >= 2 && index <= stage - 1 ? "is-complete" : ""} key={row[0]}>{row.map((cell) => <span key={cell}>{cell}</span>)}</div>)}</div>
  </div>;
}

function AgentCanvas({ copy, stage, traceMode, onTraceMode }) {
  const activeNodes = traceMode === "corrected" ? copy.correctedNodes : copy.nodes;
  return <div className="lab-canvas agent-canvas">
    <div className="lab-canvas-head"><div><span>TRACE REVIEW / ENV-3</span><h3>RUN-0042</h3></div><b>REPLAYABLE DEMO</b></div>
    <p className="agent-task">{copy.task}</p>
    <div className="trace-mode-switch"><button type="button" className={traceMode === "original" ? "active" : ""} onClick={() => onTraceMode("original")}>ORIGINAL / 7 CALLS</button><button type="button" className={traceMode === "corrected" ? "active" : ""} onClick={() => onTraceMode("corrected")}>CORRECTED / 6 CALLS</button></div>
    <div className="agent-trace">{activeNodes.map(([type, detail, state], index) => <div className={`${state === "FAIL" ? "is-fail" : ""} ${stage === index ? "is-current" : ""} ${stage > index ? "is-complete" : ""}`} key={`${traceMode}-${type}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><strong>{type}</strong><p>{detail}</p><b>{state}</b></div>)}</div>
    <div className="trace-compare">{copy.compare.map(([label, calls, result], index) => <div className={index === 1 && stage >= 4 ? "selected" : ""} key={label}><span>{label}</span><strong>{calls}</strong><small>{result}</small></div>)}</div>
  </div>;
}

function SweCanvas({ copy, stage }) {
  return <div className="lab-canvas swe-canvas">
    <div className="lab-canvas-head"><div><span>REPOSITORY RUN / FROZEN SNAPSHOT</span><h3>ISSUE-87</h3></div><b>COMMIT 8F1C2D</b></div>
    <p className="swe-issue">{copy.issue}</p>
    <div className="swe-workbench"><div className="swe-files"><header>CHANGE SET</header>{copy.files.map(([flag, file]) => <div key={file}><b>{flag}</b><span>{file}</span></div>)}</div><pre className="swe-diff">{copy.diff.map((line, index) => <code className={stage >= 2 && index <= stage + 1 ? "is-current" : ""} key={`${line}-${index}`}>{line}</code>)}</pre></div>
    <div className="swe-tests">{copy.tests.map(([suite, count, state], index) => <div className={stage >= 3 && index <= stage - 2 ? "is-complete" : ""} key={suite}><span>{suite}</span><strong>{count}</strong><b>{state}</b></div>)}</div>
    <pre className="swe-log">{copy.logLines.map((line, index) => <code className={stage >= Math.min(5, index + 1) ? "is-visible" : ""} key={line}>{line}</code>)}</pre>
  </div>;
}

function Canvas({ demo, lang, stage, traceMode, onTraceMode }) {
  const copy = demo[lang];
  if (demo.id === "finance") return <FinanceCanvas copy={copy} stage={stage} />;
  if (demo.id === "medical") return <MedicalCanvas copy={copy} stage={stage} />;
  if (demo.id === "agent") return <AgentCanvas copy={copy} stage={stage} traceMode={traceMode} onTraceMode={onTraceMode} />;
  return <SweCanvas copy={copy} stage={stage} />;
}

export function WorkflowLabPage({ route }) {
  const { lang } = route;
  const zh = lang === "zh";
  const [demoId, setDemoId] = useState("finance");
  const [stage, setStage] = useState(0);
  const [running, setRunning] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [traceMode, setTraceMode] = useState("original");
  const [mobilePanel, setMobilePanel] = useState("task");
  const demo = WORKFLOW_DEMOS.find((item) => item.id === demoId) || WORKFLOW_DEMOS[0];
  const copy = demo[lang];

  useEffect(() => { setStage(0); setElapsed(0); setRunning(true); setTraceMode("original"); setMobilePanel("task"); }, [demoId, lang]);
  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(() => { setElapsed((value) => value + 1); setStage((value) => (value + 1) % copy.stages.length); }, 1350);
    return () => window.clearInterval(timer);
  }, [running, demoId, copy.stages.length]);

  return <main className="workflow-lab-page">
    <section className="lab-intro"><div><div className="eyebrow">AXISX / WORKFLOW LAB</div><h1>{zh ? "用任务逻辑，而不是概念图解释交付。" : "Explain delivery through task logic—not concept imagery."}</h1></div><div className="lab-intro-note"><span><i />{zh ? "脱敏工作流演示 · 不含客户数据" : "SANITIZED WORKFLOW DEMO · NO CLIENT DATA"}</span><p>{zh ? "四套浏览器内演示展示材料、版本、复核和 QA 如何进入同一条作业链。每套业务使用独立的对象、规则与验收结构。" : "Four browser-side demos show how materials, versions, review and QA enter one operating chain. Each domain uses its own object, rules and acceptance structure."}</p></div></section>
    <section className="lab-demo-switcher">{WORKFLOW_DEMOS.map((item, index) => <button className={`lab-demo-tab ${item.accent} ${item.id === demoId ? "active" : ""}`} type="button" onClick={() => setDemoId(item.id)} key={item.id}><span>0{index + 1} / {item.code}</span><strong>{item[lang].short}</strong><small>{item.id === demoId ? (zh ? "正在显示" : "ACTIVE DEMO") : (zh ? "打开" : "OPEN")}</small></button>)}</section>
    <section className={`lab-shell accent-${demo.accent}`}>
      <header className="lab-shell-head"><div><span className="pulse" /><strong>{copy.name}</strong><small>{demo.code} / DEMO-RUN-01</small></div><div className="lab-run-state"><span>{running ? (zh ? "本地模拟运行中" : "LOCAL SIMULATION RUNNING") : (zh ? "已暂停" : "PAUSED")}</span><b>00:{String(elapsed % 60).padStart(2, "0")}</b><button type="button" onClick={() => setRunning((value) => !value)}>{running ? (zh ? "暂停" : "PAUSE") : (zh ? "继续" : "RESUME")}</button></div><div className="lab-progress"><span style={{ width: `${((stage + 1) / copy.stages.length) * 100}%` }} /></div></header>
      <nav className="lab-mobile-nav" aria-label={zh ? "演示面板" : "Demo panels"}>{[["task", zh ? "任务界面" : "TASK"], ["steps", zh ? "执行步骤" : "STEPS"], ["qa", "QA"]].map(([key, label]) => <button className={mobilePanel === key ? "active" : ""} type="button" onClick={() => setMobilePanel(key)} key={key}>{label}</button>)}</nav>
      <div className={`lab-shell-grid mobile-${mobilePanel}`}>
        <aside className="lab-stages"><header><span>01 / {zh ? "执行队列" : "OPERATING QUEUE"}</span><b>PROTOCOL V1.0</b></header>{copy.stages.map((name, index) => <button className={`lab-stage ${index === stage ? "active" : ""} ${index < stage ? "complete" : ""}`} type="button" onClick={() => { setStage(index); setRunning(false); }} key={name}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{name}</strong><small>{copy.stageNotes[index]}</small></div><i /></button>)}</aside>
        <Canvas demo={demo} lang={lang} stage={stage} traceMode={traceMode} onTraceMode={setTraceMode} />
        <aside className="lab-inspector"><header><span>02 / QA INSPECTOR</span><b>{demo.code}</b></header><div className="lab-current-step"><span>{zh ? "当前步骤" : "CURRENT STEP"}</span><strong>{copy.stages[stage]}</strong><p>{copy.stageNotes[stage]}</p></div><div className="lab-qa-grid">{copy.qa.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><div className="lab-version-history"><span>{zh ? "版本记录" : "VERSION HISTORY"}</span>{copy.versionHistory.map(([version, note], index) => <p className={index === copy.versionHistory.length - 1 ? "current" : ""} key={version}><b>{version}</b>{note}</p>)}</div><div className="lab-review-panel"><span>{zh ? "复核分歧与裁决" : "REVIEW & RULING"}</span>{copy.review.map(([role, state, reason], index) => <div className={index === 2 ? "ruling" : ""} key={role}><b>{role}</b><strong>{state}</strong><p>{reason}</p></div>)}</div><div className="lab-activity"><span>{zh ? "本地运行记录" : "LOCAL RUN RECORD"}</span>{copy.activity.slice(0, stage + 1).map((item, index) => <p key={item}><b>{String(index + 1).padStart(2, "0")}</b>{item}</p>)}</div></aside>
      </div>
      <footer className="lab-disclosure"><span>DEMO / FICTIONAL DATA</span><p>{copy.disclosure}</p><button type="button" onClick={() => { setStage(0); setElapsed(0); setRunning(true); }}>{zh ? "重新运行" : "REPLAY DEMO"} ↗</button></footer>
    </section>
    <section className="lab-method"><div className="lab-method-head"><div className="eyebrow">03 / {zh ? "演示边界" : "DEMO BOUNDARIES"}</div><h2>{zh ? "足够真实，可以讨论方法；足够明确，不会冒充事实。" : "Real enough to discuss method. Explicit enough not to impersonate fact."}</h2><p>{zh ? "仿真数据的职责是呈现字段关系、判断条件、异常路径和验收证据，而不是创造不存在的客户、项目或业绩。" : "Synthetic data should reveal field relationships, decision conditions, exception paths and acceptance evidence—not invent clients, engagements or performance."}</p></div><div className="lab-method-grid">{(zh ? [["业务逻辑", "每套演示使用不同的任务对象、证据结构和 QA 机制。"], ["材料版本", "示例材料、规则、环境和提交均使用明确的虚构编号。"], ["可复核性", "判断必须回到来源跨度、运行日志、测试或独立复核。"], ["公开边界", "演示不使用客户 Logo、真实材料、个人信息或未经许可的关系。"]] : [["Domain logic", "Each demo uses a distinct task object, evidence model and QA mechanism."], ["Material versions", "Example packs, rules, environments and commits use explicit fictional identifiers."], ["Reviewability", "Judgments resolve to source spans, run logs, tests or independent review."], ["Public boundary", "No client logos, real materials, personal data or unapproved relationships appear."]]).map(([title, body], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>
    <section className="lab-cta"><div><span>{zh ? "从演示进入真实项目" : "FROM DEMO TO PROJECT"}</span><h2>{zh ? "用一组样本校准任务与验收。" : "Calibrate the task and acceptance on a real sample."}</h2></div><div><p>{zh ? "把目标能力、可分享的样本、运行环境和安全边界发给我们。正式生产的规模、角色与控制将在查看材料后共同确认。" : "Send the target capability, shareable samples, runtime and security boundaries. Production volume, roles and controls are confirmed together after material review."}</p><ContactLink route={route}>{zh ? "发送合作邮件" : "Send a collaboration brief"}</ContactLink><a className="lab-email" href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a></div></section>
  </main>;
}

export function TrustPage({ route }) {
  const zh = route.lang === "zh";
  const siteFacts = zh ? [["纯静态网站", "公开站点没有账户、业务数据库或服务器端表单。"], ["本地项目架构器", "默认规划逻辑在浏览器内运行；输入不上传、不落库，刷新后清除。"], ["不接收网页文件", "站点没有上传入口；合作材料由使用者通过自己的邮件客户端发送。"], ["演示明确标识", "Workflow Lab 的机构、材料与数值均为虚构示例，不冒充客户系统或线上日志。"]] : [["Static public site", "The public site has no accounts, business database or server-side form."], ["Local project architect", "Planning logic runs in the browser by default; inputs are not uploaded or stored and clear on refresh."], ["No web file intake", "The site has no upload control; visitors send collaboration material through their own email client."], ["Explicit demo labeling", "Workflow Lab organizations, materials and values are fictional examples—not client systems or live logs."]];
  const controls = zh ? [["范围先行", "生产前确认任务单位、允许材料与工具、角色、验收方式和升级联系人。"], ["版本化执行", "SOP、样本、量规、环境与反馈使用明确版本，变更进入批次记录。"], ["角色分离", "生产、领域复核、QA 与裁决按项目需要分离，人员先通过任务资格筛选。"], ["证据化质量", "抽检、分歧、返修和裁决保留理由与状态，结果可以回到来源或运行证据。"], ["留存逐项约定", "访问、允许复用、返还、留存和删除方式在生产前按项目确认。"], ["关系审慎披露", "客户、机构和合作 Logo 只在关系存在且获准公开时使用。"]] : [["Scope before production", "Confirm task units, permitted materials and tools, roles, acceptance logic and escalation contacts."], ["Versioned execution", "SOPs, samples, rubrics, environments and feedback use explicit versions, with changes recorded by batch."], ["Role separation", "Production, specialist review, QA and adjudication are separated where required; contributors qualify on the task."], ["Evidence-based quality", "Sampling, disagreement, rework and rulings retain rationale and state so outcomes resolve to evidence."], ["Project-specific retention", "Access, permitted reuse, return, retention and deletion are confirmed before production."], ["Careful disclosure", "Client, institution and partner logos appear only when the relationship exists and public use is permitted."]];
  return <main className="trust-page">
    <section className="trust-hero"><div className="eyebrow">{zh ? "安全与信任 / TRUST" : "SECURITY & TRUST"}</div><h1>{zh ? "只写现在真正能做到的机制。" : "State the mechanisms that exist today."}</h1><p>{zh ? "这里区分公开网站已经实现的机制，以及可以写入具体项目的运营控制。安全、材料、工具和留存边界仍需在生产前逐项确认。" : "This page separates mechanisms implemented on the public site from operational controls that can be written into a specific project. Security, material, tool and retention boundaries are still confirmed before production."}</p><span className="trust-scope">{zh ? "公开机制说明 · 2026.09" : "PUBLIC IMPLEMENTATION SCOPE · 2026.09"}</span></section>
    <section className="trust-section"><div className="trust-section-head"><span>01 / {zh ? "网站现状" : "PUBLIC SITE"}</span><h2>{zh ? "没有后台，也把边界说清楚。" : "No backend, with explicit boundaries."}</h2></div><div className="trust-grid">{siteFacts.map(([title, body], index) => <article className="trust-card" key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>
    <section className="trust-section trust-ops-section"><div className="trust-section-head"><span>02 / {zh ? "项目运营控制" : "PROJECT CONTROLS"}</span><h2>{zh ? "把要求写进任务、版本和证据。" : "Put requirements into tasks, versions and evidence."}</h2></div><div className="trust-ops-grid">{controls.map(([title, body], index) => <article className="trust-card" key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>
    <section className="trust-boundaries"><div><span>03 / {zh ? "声明边界" : "CLAIM BOUNDARIES"}</span><h2>{zh ? "不把运营方法包装成认证。" : "Do not package operating methods as certification."}</h2></div><p>{zh ? "本站不声称 AxisX 已取得未公开核实的 ISO 27001、SOC 2 或其他认证；医学、法律与金融演示只说明数据工作方法，不提供诊断、法律意见或投资建议。" : "The site does not claim ISO 27001, SOC 2 or other certifications not publicly verified for AxisX. Medical, legal and financial demos explain data-work methods and provide no diagnosis, legal opinion or investment advice."}</p></section>
    <section className="lab-cta"><div><span>{zh ? "项目边界" : "PROJECT BOUNDARIES"}</span><h2>{zh ? "在生产前把控制写清楚。" : "Define controls before production."}</h2></div><div><p>{zh ? "如需讨论材料访问、工具限制、角色、验收与留存方式，请通过邮件发送项目概况。" : "To discuss material access, tool restrictions, roles, acceptance and retention, send a project brief by email."}</p><ContactLink route={route}>{zh ? "发送项目概况" : "Send a project brief"}</ContactLink></div></section>
  </main>;
}
