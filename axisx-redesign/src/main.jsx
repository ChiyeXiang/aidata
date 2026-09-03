import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { CASES, COPY, DOMAINS, FUTURE, NETWORK_PROOF, PROCESS, PRODUCT_SYSTEMS, QUALITY, SERVICES, SITE_EMAIL, STATS } from "./content";
import { ARCHITECT_OPTIONS, buildBlueprint } from "./architect";
import { WORKFLOW_DEMOS } from "./lab";
import { TrustPage, WorkflowLabPage } from "./WorkflowLab";
import "./styles.css";

const BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
const ARCHITECT_API_URL = import.meta.env.VITE_ARCHITECT_API_URL || "";
const asset = (path) => `${BASE}${path}`;

function routeFromLocation() {
  let relative = window.location.pathname;
  if (BASE && relative.startsWith(BASE)) relative = relative.slice(BASE.length);
  if (!relative || relative === "/") return { lang: "en", path: "/" };
  const lang = relative === "/zh" || relative.startsWith("/zh/") ? "zh" : "en";
  let path = lang === "zh" ? relative.slice(3) : relative;
  if (!path) path = "/";
  return { lang, path: path.replace(/\/$/, "") || "/" };
}

function hrefFor(path, lang) {
  const prefix = lang === "zh" ? "/zh" : "";
  const clean = path === "/" ? "" : path;
  return `${BASE}${prefix}${clean}` || "/";
}

function useRoute() {
  const [route, setRoute] = useState(routeFromLocation);
  useEffect(() => {
    const update = () => setRoute(routeFromLocation());
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);
  const navigate = (path, lang = route.lang) => {
    const href = hrefFor(path, lang);
    window.history.pushState({}, "", href);
    setRoute(routeFromLocation());
    window.scrollTo({ top: 0, behavior: "auto" });
  };
  return { ...route, navigate };
}

function useMotionSystem(routeKey) {
  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealSelector = [
      ".page-hero-copy", ".page-hero-image", ".section-head", ".stat", ".service-card",
      ".case-card", ".process-strip > li", ".talent-intro", ".talent-row",
      ".future-preview-copy", ".future-preview-action", ".platform-copy", ".platform-visual",
      ".evidence-card", ".module-card", ".horizon-card", ".domain-card",
      ".delivery-output-strip > article", ".case-method-grid > article", ".dual-brand",
      ".contact-aside", ".email-panel", ".detail-body > div", ".partnership-head", ".partnership-grid > article",
      ".network-proof-grid > article", ".product-system", ".pilot-grid > article", ".pilot-action",
      ".architect-context", ".architect-controls", ".architect-output", ".architect-step", ".architect-evidence-panel",
      ".lab-intro", ".lab-demo-tab", ".lab-stage", ".lab-canvas", ".lab-inspector", ".trust-card", ".trust-boundary",
      ".buyer-path", ".method-principle", ".data-object-card", ".method-cycle > article", ".flagship-step", ".flagship-panel",
    ].join(",");
    const items = [...document.querySelectorAll(revealSelector)];

    root.classList.add("motion-enhanced");
    items.forEach((item) => {
      const siblings = item.parentElement ? [...item.parentElement.children] : [];
      const order = Math.max(0, siblings.indexOf(item));
      item.classList.add("reveal-item");
      item.style.setProperty("--reveal-order", String(Math.min(order, 6)));
    });

    const animateStat = (stat) => {
      const valueNode = stat.querySelector("strong[data-stat-value]");
      if (!valueNode || valueNode.dataset.animated === "true") return;
      valueNode.dataset.animated = "true";
      const raw = valueNode.dataset.statValue || valueNode.textContent || "";
      const numeric = raw.replace(/[^0-9.]/g, "");
      if (!numeric) return;
      const target = Number(numeric);
      if (!Number.isFinite(target)) return;
      const prefix = raw.match(/^[^0-9]*/)?.[0] || "";
      const suffix = raw.match(/[^0-9.,]*$/)?.[0] || "";
      const grouped = raw.includes(",");
      const start = performance.now();
      const duration = 820;
      const draw = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(target * eased);
        valueNode.textContent = `${prefix}${grouped ? current.toLocaleString("en-US") : current}${suffix}`;
        if (progress < 1) requestAnimationFrame(draw);
      };
      valueNode.textContent = `${prefix}0${suffix}`;
      requestAnimationFrame(draw);
    };

    if (reducedMotion) {
      items.forEach((item) => item.classList.add("is-inview"));
      return () => root.classList.remove("motion-enhanced");
    }

    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => {
        item.classList.add("is-inview");
        if (item.classList.contains("stat")) animateStat(item);
      });
      return () => root.classList.remove("motion-enhanced");
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-inview");
        if (entry.target.classList.contains("stat")) animateStat(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -7%" });
    items.forEach((item) => observer.observe(item));

    const hero = document.querySelector(".hero");
    const backdrop = document.querySelector(".page-backdrop");
    let frame = 0;
    const updateParallax = () => {
      frame = 0;
      if (window.innerWidth <= 880) return;
      const shift = Math.min(26, window.scrollY * 0.045);
      if (hero) {
        hero.style.setProperty("--hero-shift", `${shift}px`);
        hero.style.setProperty("--hero-grid-shift", `${shift * -0.36}px`);
      }
      if (backdrop) backdrop.style.setProperty("--backdrop-scroll", `${Math.min(52, window.scrollY * 0.022)}px`);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateParallax);
    };
    updateParallax();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
      root.classList.remove("motion-enhanced");
    };
  }, [routeKey]);
}

function Link({ to, lang, navigate, className = "", children, ariaLabel }) {
  return (
    <a
      href={hrefFor(to, lang)}
      className={className}
      aria-label={ariaLabel}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        navigate(to, lang);
      }}
    >
      {children}
    </a>
  );
}

function Mark({ light = true }) {
  return <img className="brand-mark" src={asset(light ? "/brand/mark-on-dark.png" : "/brand/mark.png")} alt="" />;
}

function Header({ route }) {
  const { lang, path, navigate } = route;
  const t = COPY[lang];
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path, lang]);
  const languagePath = path;
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" lang={lang} navigate={navigate} className="brand-lockup" ariaLabel={lang === "zh" ? "子午象限首页" : "AxisX home"}>
          <Mark />
          <span className="brand-type">
            <strong>{t.brand}</strong>
            <small>{t.brandSub}</small>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label={lang === "zh" ? "主导航" : "Primary navigation"}>
          {t.nav.map(([label, to]) => (
            <Link key={to} to={to} lang={lang} navigate={navigate} className={path === to || path.startsWith(`${to}/`) ? "active" : ""}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link to={languagePath} lang={lang === "zh" ? "en" : "zh"} navigate={navigate} className="language-link">
            {t.language}
          </Link>
          <Link to="/contact" lang={lang} navigate={navigate} className="header-cta">
            {t.contact}<span aria-hidden="true">↗</span>
          </Link>
          <button className="menu-button" type="button" aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
            <span /><span />
          </button>
        </div>
      </div>
      {open && (
        <div className="mobile-nav">
          {t.nav.map(([label, to], index) => (
            <Link key={to} to={to} lang={lang} navigate={navigate}>
              <span>0{index + 1}</span>{label}
            </Link>
          ))}
          <div className="mobile-nav-label">{lang === "zh" ? "更多" : "MORE"}</div>
          {t.secondaryNav.map(([label, to], index) => (
            <Link key={to} to={to} lang={lang} navigate={navigate}>
              <span>0{index + 6}</span>{label}
            </Link>
          ))}
          <Link to={languagePath} lang={lang === "zh" ? "en" : "zh"} navigate={navigate}>{t.language}</Link>
          <Link to="/contact" lang={lang} navigate={navigate} className="mobile-contact">{t.contact}</Link>
        </div>
      )}
    </header>
  );
}

function Footer({ route }) {
  const { lang, navigate } = route;
  const t = COPY[lang];
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Mark />
          <p>{lang === "zh" ? "面向专家数据、模型后训练与复杂评测的托管式中国交付网络。" : "A managed China delivery network for expert data, post-training and complex evaluation."}</p>
        </div>
        <div className="footer-nav">
          {[...t.nav, ...t.secondaryNav].map(([label, to]) => <Link key={to} to={to} lang={lang} navigate={navigate}>{label}</Link>)}
        </div>
        <div className="footer-contact">
          <small>{lang === "zh" ? "商务合作" : "Global business"}</small>
          <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a>
          <Link to="/contact" lang={lang} navigate={navigate}>{t.contact} ↗</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} {lang === "zh" ? "子午象限 · AxisX" : "AxisX Human Compute"}</span>
        <span>{lang === "zh" ? "项目材料、客户信息与商务条款按项目保密义务处理。" : "Project materials and commercial terms are handled under project-specific confidentiality obligations."}</span>
      </div>
    </footer>
  );
}

function Eyebrow({ children, index }) {
  return <div className="eyebrow">{index && <span>{index}</span>}{children}</div>;
}

function SectionHead({ index, eyebrow, title, lead, inverse = false }) {
  return (
    <div className={`section-head ${inverse ? "inverse" : ""}`}>
      <Eyebrow index={index}>{eyebrow}</Eyebrow>
      <div className="section-head-grid">
        <h2>{title}</h2>
        {lead && <p>{lead}</p>}
      </div>
    </div>
  );
}

function EvidenceGallery({ index, eyebrow, title, lead, items }) {
  return (
    <section className="evidence-section paper-section">
      <SectionHead index={index} eyebrow={eyebrow} title={title} lead={lead} />
      <div className="evidence-grid">
        {items.map(([image, label, itemTitle, body], itemIndex) => (
          <article className={`evidence-card ${itemIndex === 0 ? "primary" : ""}`} key={itemTitle}>
            <div className="evidence-image"><img src={asset(image)} alt={itemTitle} loading="lazy" /></div>
            <div className="evidence-copy">
              <span>{String(itemIndex + 1).padStart(2, "0")} / {label}</span>
              <h3>{itemTitle}</h3>
              <p>{body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ButtonLink({ to, lang, navigate, children, tone = "dark" }) {
  return <Link to={to} lang={lang} navigate={navigate} className={`button-link ${tone}`}>{children}<span aria-hidden="true">↗</span></Link>;
}

function LoopVideo({ src, poster, label = "", className = "" }) {
  const videoRef = useRef(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !("IntersectionObserver" in window)) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    }, { threshold: 0.08, rootMargin: "240px 0px" });
    observer.observe(video);
    return () => observer.disconnect();
  }, [src]);
  return (
    <div className={`loop-video ${className}`}>
      <video
        ref={videoRef}
        src={asset(src)}
        poster={poster ? asset(poster) : undefined}
        aria-label={label || undefined}
        aria-hidden={label ? undefined : true}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        disablePictureInPicture
        disableRemotePlayback
        tabIndex={-1}
      />
    </div>
  );
}

function Stats({ lang, dark = false }) {
  const proof = NETWORK_PROOF[lang];
  return (
    <div className={`stats-system ${dark ? "dark" : ""}`}>
      <div className={`stats-grid ${dark ? "dark" : ""}`}>
        {STATS[lang].map(([value, label], index) => (
          <div className="stat" key={label}>
            <span className="stat-index">0{index + 1}</span>
            <strong data-stat-value={value} aria-label={value}>{value}</strong>
            <p>{label}</p>
          </div>
        ))}
      </div>
      <div className="stats-caption"><span className="pulse" /><strong>{proof.asOf}</strong><p>{proof.note}</p></div>
      <div className="network-proof-grid">
        {proof.rules.map(([title, body], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}
      </div>
    </div>
  );
}

function ServiceGrid({ lang, limit }) {
  const items = limit ? SERVICES[lang].slice(0, limit) : SERVICES[lang];
  return (
    <div className="service-grid">
      {items.map((service) => (
        <article className="service-card" key={service.id}>
          <div className="service-top"><span>{service.id}</span><small>{service.label}</small></div>
          <h3>{service.title}</h3>
          <p>{service.body}</p>
          <ul>{service.items.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
      ))}
    </div>
  );
}

function ProductSystems({ lang }) {
  return (
    <div className="product-system-grid">
      {PRODUCT_SYSTEMS[lang].map((system) => (
        <article className={`product-system ${system.tone}`} key={system.id}>
          <div className="product-system-meta"><span>{system.id}</span><small>{system.label}</small></div>
          <h3>{system.title}</h3>
          <p>{system.body}</p>
          <strong>{system.output}</strong>
          <ul>{system.items.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
      ))}
    </div>
  );
}

function PilotPath({ route }) {
  const { lang, navigate } = route;
  const zh = lang === "zh";
  const steps = zh ? [
    ["适合启动", "已有明确能力缺口、样本或运行环境，需要专家作者、轨迹证据或可执行验证。"],
    ["需要提供", "目标能力、现有样本、环境或 Benchmark、验收阈值，以及安全与保密边界。"],
    ["首轮返回", "任务规格、校准样本、风险清单、质量方案和可扩大规模的交付判断。"],
  ] : [
    ["Best fit", "A defined capability gap, sample or runtime that needs expert authorship, trajectory evidence or executable verification."],
    ["What to share", "Target capability, current samples, environment or benchmark, acceptance threshold, and security boundaries."],
    ["First return", "Task specification, calibration sample, risk register, QA design and a decision on scalable delivery."],
  ];
  return (
    <section className="pilot-section paper-section">
      <SectionHead index="05" eyebrow={zh ? "试点启动" : "PILOT ENTRY"} title={zh ? "先用一个可验证的小批次确认方法" : "Prove the method with a verifiable pilot"} lead={zh ? "典型项目从能力边界、少量样本和验收方式开始。试点通过后，再扩大专家、任务与运行并发；具体周期和规模按项目确定。" : "Programs typically begin with a capability boundary, a small sample and an acceptance method. Expert, task and run concurrency expand only after the pilot proves valid; timing and volume remain scope-specific."} />
      <div className="pilot-grid">{steps.map(([title, body], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
      <div className="pilot-action"><p>{zh ? "适合私有 Benchmark、专家 Golden Set、Agent 轨迹、可复现实验与仓库级工程评测。" : "Designed for private benchmarks, expert golden sets, agent trajectories, reproducible experiments and repository-level evaluation."}</p><ButtonLink to="/architect" lang={lang} navigate={navigate}>{zh ? "生成试点蓝图" : "Build a pilot blueprint"}</ButtonLink></div>
    </section>
  );
}

function CaseCard({ item, lang, navigate, featured = false, index = 0 }) {
  const copy = item[lang];
  const image = lang === "en" && item.imageEn ? item.imageEn : item.image;
  const video = lang === "en" && item.videoEn ? item.videoEn : item.video;
  const metrics = item.metrics?.[lang] || item.metrics;
  return (
    <Link to={`/work/${item.slug}`} lang={lang} navigate={navigate} className={`case-card ${item.tone} ${featured ? "featured" : ""}`}>
      <div className="case-image-wrap">
        {video ? <LoopVideo src={video} poster={image} label={lang === "zh" ? `${copy.title} 脱敏操作演示` : `${copy.title} sanitized workflow demo`} className="case-loop" /> : <img src={asset(image)} alt="" loading="lazy" />}
        <span className="case-tag">{copy.tag}</span>
        <span className="case-sequence">CASE / {String(index + 1).padStart(2, "0")}</span>
      </div>
      <div className="case-content">
        <div className="case-model">
          <span>{lang === "zh" ? "交付组织" : "DELIVERY MODEL"}</span>
          <strong>{copy.deliveryModel}</strong>
        </div>
        <h3>{copy.title}</h3>
        <p>{copy.summary}</p>
        <div className="case-evidence-list">
          {copy.proof.map((point, pointIndex) => <span key={point}><b>0{pointIndex + 1}</b>{point}</span>)}
        </div>
        <div className="case-metrics">
          {metrics.map(([value, label]) => <span key={`${value}-${label}`}><strong>{value}</strong><small>{label}</small></span>)}
        </div>
        <span className="case-arrow">↗</span>
      </div>
    </Link>
  );
}

function ProcessStrip({ lang }) {
  return (
    <ol className="process-strip">
      {PROCESS[lang].map(([no, title, body]) => (
        <li key={no}>
          <span>{no}</span>
          <h3>{title}</h3>
          <p>{body}</p>
        </li>
      ))}
    </ol>
  );
}

function TalentMatrix({ lang }) {
  const zh = lang === "zh";
  const rows = zh ? [
    ["L1", "领域作者层", "金融 / 法律 / 医学 / STEM 专家", "原创出题、参考答案、证据推导与专业边界"],
    ["L2", "评测研究层", "研究生 / ML 研究人员 / 高阶评测员", "难度校准、模型试跑、轨迹审阅与失败归因"],
    ["L3", "验证工程层", "ML / 软件 / Benchmark 工程师", "MLE、MLS、ProgramBench、DeepSWE、FrontierSWE 与程序化验证"],
  ] : [
    ["L1", "Domain authors", "Finance / legal / medical / STEM specialists", "Original authoring, reference answers, evidence derivation and professional boundaries"],
    ["L2", "Evaluation research", "Graduate / ML researchers / advanced evaluators", "Difficulty calibration, model pilots, trajectory review and failure attribution"],
    ["L3", "Verification engineering", "ML / software / benchmark engineers", "MLE, MLS, ProgramBench, DeepSWE, FrontierSWE and programmatic verification"],
  ];
  return (
    <div className="talent-matrix">
      {rows.map(([level, title, people, work]) => (
        <div className="talent-row" key={level}>
          <span className="talent-level">{level}</span>
          <h3>{title}</h3>
          <p>{people}</p>
          <p>{work}</p>
        </div>
      ))}
    </div>
  );
}

function PartnershipSection({ route, index = "07" }) {
  const { lang, navigate } = route;
  const zh = lang === "zh";
  const partners = zh ? [
    ["模型团队", "共同定位能力盲区，构造私有 Challenge Set 与模型反馈回路。"],
    ["研究机构", "联合设计高难度 STEM、ML Science 与可复现实验任务。"],
    ["专业行业", "将金融、法律、医学知识转化为有来源、有边界的评测资产。"],
    ["Benchmark 团队", "补充专家作者、验证工程、运行与独立裁决能力。"],
  ] : [
    ["Model teams", "Locate capability blind spots and co-build private challenge sets and feedback loops."],
    ["Research institutions", "Design hard STEM, ML science and reproducible experimental tasks together."],
    ["Expert industries", "Turn finance, legal and medical knowledge into source-grounded evaluation assets."],
    ["Benchmark teams", "Extend expert authoring, verification engineering, execution and independent adjudication."],
  ];
  return (
    <section className="partnership-section">
      <div className="partnership-head">
        <Eyebrow index={index}>{zh ? "开放合作" : "OPEN COLLABORATION"}</Eyebrow>
        <h2>{zh ? "共同定义模型接下来必须解决的问题。" : "Define what models must solve next—together."}</h2>
        <p>{zh ? "我们欢迎以真实能力缺口为起点的合作：不是采购更多数据，而是共同建立更难、更有效、能够持续演进的评测与训练资产。" : "We welcome collaborations that begin with a real capability gap—not a request for more data, but a shared effort to build harder, valid and continuously evolving evaluation and training assets."}</p>
      </div>
      <div className="partnership-grid">{partners.map(([title, body], i) => <article key={title}><span>0{i + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
      <ButtonLink to="/contact" lang={lang} navigate={navigate} tone="light">{zh ? "讨论一个能力边界" : "Discuss a capability boundary"}</ButtonLink>
    </section>
  );
}

function CTA({ route }) {
  const { lang, navigate } = route;
  const t = COPY[lang].common;
  return (
    <section className="cta-section">
      <div className="cta-cross" aria-hidden="true"><span /><span /></div>
      <Eyebrow>{lang === "zh" ? "START A CONVERSATION" : "START A CONVERSATION"}</Eyebrow>
      <div className="cta-grid">
        <h2>{t.contactTitle}</h2>
        <div>
          <p>{t.contactBody}</p>
          <div className="button-row">
            <ButtonLink to="/contact" lang={lang} navigate={navigate} tone="light">{COPY[lang].contact}</ButtonLink>
            <a className="text-link light" href={`mailto:${SITE_EMAIL}`}>{t.email} ↗</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkflowLabPreview({ route }) {
  const { lang, navigate } = route;
  const zh = lang === "zh";
  return (
    <section className="lab-preview">
      <div className="lab-preview-copy">
        <Eyebrow index="04">{zh ? "交互工作流演示" : "INTERACTIVE WORKFLOW DEMOS"}</Eyebrow>
        <h2>{zh ? "看见任务如何进入证据与 QA。" : "See work move into evidence and QA."}</h2>
        <p>{zh ? "四套浏览器内演示分别对应金融证据、医学安全、Agent 轨迹和仓库工程，完整展示材料版本、执行路径、复核分歧与 QA 状态。" : "Four browser-side demos cover finance evidence, medical safety, agent trajectories and repository engineering—showing material versions, operating paths, reviewer disagreement and QA state."}</p>
        <ButtonLink to="/lab" lang={lang} navigate={navigate} tone="light">{zh ? "打开交互演示" : "Open workflow lab"}</ButtonLink>
      </div>
      <div className="lab-preview-console" aria-label={zh ? "演示模块列表" : "Demo module list"}>
        <header><span className="pulse" /><b>{zh ? "工作流演示正在运行" : "WORKFLOW DEMO RUNNING"}</b><small>NO CLIENT DATA</small></header>
        {WORKFLOW_DEMOS.map((demo, index) => (
          <div className={`lab-preview-row ${demo.accent}`} key={demo.id}>
            <span>{demo.code}</span><strong>{demo[lang].short}</strong><i style={{ "--demo-progress": `${54 + index * 11}%` }} /><small>{zh ? "示例 QA" : "DEMO QA"}</small>
          </div>
        ))}
        <footer>{zh ? "脱敏结构演示 · 页面刷新后重置" : "SANITIZED STRUCTURAL DEMO · RESETS ON REFRESH"}</footer>
      </div>
    </section>
  );
}

function BuyerPaths({ route }) {
  const { lang, navigate } = route;
  const zh = lang === "zh";
  const paths = zh ? [
    {
      role: "模型与研究团队",
      question: "模型究竟缺失哪一项能力？",
      body: "从错误簇和现有 Benchmark 的盲区出发，建立原创 Challenge Set、可执行验证与模型回归证据。",
      signals: ["能力切片与难度分层", "专家参考与验证器", "版本间能力变化"],
      action: "查看 STEM 旗舰案例",
      to: "/work/stem-challenge-sets",
      tone: "research",
    },
    {
      role: "数据与运营团队",
      question: "复杂任务如何稳定进入生产？",
      body: "把作者资格、任务版本、运行环境、双路复核、返修和批次验收组织进同一交付链路。",
      signals: ["人员与任务资格", "过程状态与 QA", "返修、裁决与批次"],
      action: "查看交付体系",
      to: "/delivery",
      tone: "operations",
    },
    {
      role: "采购与项目负责人",
      question: "试点是否可验收、可扩大？",
      body: "先对齐能力边界、样本、验证方式与安全要求，再确定小批次试点的角色、证据和接受标准。",
      signals: ["范围与责任边界", "交付物与验收信号", "安全、保密与扩量条件"],
      action: "建立试点蓝图",
      to: "/architect",
      tone: "procurement",
    },
  ] : [
    {
      role: "MODEL & RESEARCH TEAMS",
      question: "Which capability is actually missing?",
      body: "Start from error clusters and benchmark blind spots, then build original challenge sets, executable validation and regression evidence.",
      signals: ["Capability slices and difficulty tiers", "Expert references and verifiers", "Capability change across releases"],
      action: "View the STEM flagship case",
      to: "/work/stem-challenge-sets",
      tone: "research",
    },
    {
      role: "DATA & OPERATIONS TEAMS",
      question: "How does complex work enter production?",
      body: "Connect contributor qualification, task versions, runtime, independent review, rework and batch acceptance in one delivery chain.",
      signals: ["Contributor and task qualification", "Operating state and QA", "Rework, rulings and batches"],
      action: "See the delivery system",
      to: "/delivery",
      tone: "operations",
    },
    {
      role: "PROCUREMENT & PROGRAM LEADS",
      question: "Can the pilot be accepted and scaled?",
      body: "Align the capability boundary, samples, validation method and security requirements before fixing roles, evidence and acceptance for a pilot.",
      signals: ["Scope and accountability", "Deliverables and acceptance signals", "Security, confidentiality and scale gates"],
      action: "Build a pilot blueprint",
      to: "/architect",
      tone: "procurement",
    },
  ];
  return (
    <section className="buyer-paths-section paper-section">
      <SectionHead index="01" eyebrow={zh ? "按角色进入" : "START BY ROLE"} title={zh ? "同一个项目，不同团队需要看见不同的证据" : "One program. Different evidence for each decision-maker."} lead={zh ? "选择与你当前决策最接近的入口。页面不会替代正式范围确认，而是帮助团队更快形成同一套问题。" : "Choose the path closest to the decision in front of you. These views do not replace formal scoping; they help teams begin with the same questions."} />
      <div className="buyer-paths-grid">
        {paths.map((path, index) => (
          <Link to={path.to} lang={lang} navigate={navigate} className={`buyer-path ${path.tone}`} key={path.role}>
            <div className="buyer-path-meta"><span>0{index + 1}</span><small>{path.role}</small></div>
            <h3>{path.question}</h3>
            <p>{path.body}</p>
            <ul>{path.signals.map((signal) => <li key={signal}>{signal}</li>)}</ul>
            <strong>{path.action}<i aria-hidden="true">↗</i></strong>
          </Link>
        ))}
      </div>
    </section>
  );
}

function HomePage({ route }) {
  const { lang, navigate } = route;
  const t = COPY[lang].home;
  return (
    <>
      <main>
        <section className="hero">
        <div className="hero-media"><LoopVideo src={lang === "zh" ? "/meridian/backgrounds/home-zh.mp4" : "/meridian/backgrounds/home-en.mp4"} className="hero-background-video" /></div>
          <div className="hero-grid-overlay" aria-hidden="true" />
          <div className="hero-content">
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <h1>{t.title.split("\n").map((line, i) => <React.Fragment key={line}>{i > 0 && <br />}{line}</React.Fragment>)}</h1>
            <div className="hero-lower">
              <div className="hero-copy">
                <p>{t.lead}</p>
                <div className="button-row">
                  <ButtonLink to="/lab" lang={lang} navigate={navigate} tone="light">{t.primary}</ButtonLink>
                  <Link to="/work" lang={lang} navigate={navigate} className="text-link light">{t.secondary} ↗</Link>
                </div>
              </div>
              <div className="delivery-stack">
                <div className="stack-head"><span>AXIS / 01</span><strong>{t.stackTitle}</strong></div>
                {t.stack.map((item, index) => <div className="stack-row" key={item}><span>0{index + 1}</span><p>{item}</p><i /></div>)}
              </div>
            </div>
            <div className="hero-proof"><span className="pulse" />{t.proof}</div>
          </div>
        </section>

        <section className="paper-section stats-section"><Stats lang={lang} /></section>

        <BuyerPaths route={route} />

        <section className="paper-section services-section">
          <SectionHead index="02" eyebrow={lang === "zh" ? "核心能力" : "CAPABILITIES"} title={t.servicesTitle} lead={t.servicesLead} />
          <ProductSystems lang={lang} />
          <div className="section-action"><ButtonLink to="/services" lang={lang} navigate={navigate}>{lang === "zh" ? "查看完整能力" : "View all capabilities"}</ButtonLink></div>
        </section>

        <section className="ink-section cases-section">
          <SectionHead index="03" eyebrow={lang === "zh" ? "交付证据" : "DELIVERY EVIDENCE"} title={t.casesTitle} lead={t.casesLead} inverse />
          <div className="featured-cases">
            {[CASES[3], CASES[4], CASES[0], CASES[7]].map((item, index) => <CaseCard key={item.slug} item={item} lang={lang} navigate={navigate} index={index} />)}
          </div>
          <div className="section-action"><ButtonLink to="/work" lang={lang} navigate={navigate} tone="light">{COPY[lang].common.allCases}</ButtonLink></div>
        </section>

        <WorkflowLabPreview route={route} />

        <PilotPath route={route} />

        <section className="paper-section process-section">
          <SectionHead index="06" eyebrow={lang === "zh" ? "托管交付" : "MANAGED DELIVERY"} title={t.processTitle} lead={t.processLead} />
          <ProcessStrip lang={lang} />
        </section>

        <section className="paper-section talent-section">
          <div className="talent-intro">
            <Eyebrow index="07">{lang === "zh" ? "人才 × 难度" : "TALENT × DIFFICULTY"}</Eyebrow>
            <h2>{lang === "zh" ? "专业背景只是门槛，真实任务决定角色。" : "Credentials are the gate. Real tasks determine the role."}</h2>
            <p>{lang === "zh" ? "受监管领域、Agent 轨迹和代码 Benchmark 需要不同的人才与验证方式。我们将专家、评测员、任务作者、验证工程师和裁决者分层组织。" : "Regulated domains, agent trajectories and coding benchmarks require different talent and verification. We separate specialists, evaluators, task authors, verification engineers and adjudicators."}</p>
          </div>
          <TalentMatrix lang={lang} />
        </section>

        <section className="future-preview">
          <div className="future-preview-index">08 / ROADMAP</div>
          <div className="future-preview-copy">
            <Eyebrow>{lang === "zh" ? "未来方向" : "DIRECTION OF TRAVEL"}</Eyebrow>
            <h2>{lang === "zh" ? "交付不是终点，模型反馈闭环才是。" : "Delivery is not the endpoint. Model feedback is."}</h2>
          </div>
          <div className="future-preview-action">
            <p>{lang === "zh" ? "从 STEM Challenge Set、受监管领域 Sandbox 和 Agent 轨迹，到 MLE、MLS 与可执行软件智能评测。" : "From STEM challenge sets, regulated-domain sandboxes and agent trajectories to MLE, MLS and executable software-intelligence evaluation."}</p>
            <ButtonLink to="/future" lang={lang} navigate={navigate} tone="light">{lang === "zh" ? "查看未来方向" : "View the roadmap"}</ButtonLink>
          </div>
        </section>

        <section className="platform-section">
          <div className="platform-copy">
            <Eyebrow index="09">OPERATIONS LAYER</Eyebrow>
            <h2>{t.platformTitle}</h2>
            <p>{t.platformBody}</p>
            <ButtonLink to="/meridian" lang={lang} navigate={navigate} tone="light">{lang === "zh" ? "查看子午台" : "Explore Meridian"}</ButtonLink>
          </div>
          <div className="platform-visual">
            <LoopVideo src={lang === "zh" ? "/meridian/clips/stem-zh.mp4" : "/meridian/clips/stem-en.mp4"} poster={lang === "zh" ? "/meridian/v10/zh/stem.jpg" : "/meridian/v10/en/stem.jpg"} label={lang === "zh" ? "子午台 STEM Challenge Set 工作流" : "Meridian STEM challenge-set workflow"} />
            <span>MERIDIAN / BENCHMARK OPS</span>
          </div>
        </section>
        <PartnershipSection route={route} index="10" />
      </main>
      <CTA route={route} />
    </>
  );
}

function PageHero({ eyebrow, title, lead, image, video, poster, tag }) {
  return (
    <section className={`page-hero ${image ? "with-image" : ""} ${video ? "with-video" : ""}`}>
      {video && <div className="page-hero-media"><LoopVideo src={video} poster={poster} className="hero-background-video" /></div>}
      <div className="page-hero-copy">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1>{title}</h1>
        <p>{lead}</p>
        {tag && <div className="status-tag"><span className="pulse" />{tag}</div>}
      </div>
      {image && <div className="page-hero-image"><img src={asset(image)} alt="" /></div>}
    </section>
  );
}

function ServicesPage({ route }) {
  const { lang } = route;
  const zh = lang === "zh";
  const evidence = zh ? [
    ["/meridian/v10/zh/stem.jpg", "STEM Challenge Set", "原创难题必须同时可解、够难、可验证", "题面、参考推导、评分量规、验证器、独立复算和污染风险筛查进入同一任务记录。"],
    ["/meridian/v10/zh/trajectory.jpg", "Agent 轨迹", "把过程错误转化为后训练信号", "计划、工具调用、观察、回退与修正逐节点关联，支持失败归因和更优轨迹构造。"],
    ["/meridian/v10/zh/swe.jpg", "可执行 Benchmark", "工程结论必须在环境中成立", "任务、容器、补丁、测试、日志与验证器进入同一运行和裁决记录。"],
  ] : [
    ["/meridian/v10/en/stem.jpg", "STEM CHALLENGE SETS", "Original problems must be solvable, difficult and verifiable", "Prompts, reference derivations, rubrics, verifiers, independent solves and contamination-risk screens enter one task record."],
    ["/meridian/v10/en/trajectory.jpg", "AGENT TRAJECTORIES", "Turn process failures into post-training signals", "Plans, tool calls, observations, recovery and corrections stay connected for attribution and improved paths."],
    ["/meridian/v10/en/swe.jpg", "EXECUTABLE BENCHMARKS", "Engineering outcomes must hold inside the environment", "Tasks, containers, patches, tests, logs and verifiers enter one run and adjudication record."],
  ];
  return (
    <main>
      <PageHero eyebrow={zh ? "能力体系 / CAPABILITIES" : "CAPABILITY SYSTEM"} title={zh ? "构造更难的问题，也建立可信的答案" : "Construct harder questions—and trustworthy answers"} lead={zh ? "能力覆盖 STEM 原创难题、金融法律医学专家数据、Agent 轨迹，以及 MLE、MLS、ProgramBench、DeepSWE 与 FrontierSWE 型评测交付。" : "Capabilities span original STEM challenge sets, finance, legal and medical expert data, agent trajectories, and MLE, MLS, ProgramBench, DeepSWE and FrontierSWE-style evaluation delivery."} video={zh ? "/meridian/backgrounds/services-zh.mp4" : "/meridian/backgrounds/services-en.mp4"} poster={zh ? "/meridian/v10/zh/stem.jpg" : "/meridian/v10/en/stem.jpg"} />
      <section className="paper-section page-section"><ServiceGrid lang={lang} /></section>
      <EvidenceGallery index="02" eyebrow={zh ? "作业证据" : "WORK EVIDENCE"} title={zh ? "不只说明能做什么 也展示任务如何发生" : "Show how the work happens—not only what we offer"} lead={zh ? "优先用真实产品界面、规则状态和质检记录表达能力，减少空泛的概念图。" : "Product interfaces, rule states and QA records make capability concrete without relying on abstract imagery."} items={evidence} />
      <section className="ink-section fit-section">
        <SectionHead index="03" eyebrow={zh ? "任务适配" : "TASK FIT"} title={zh ? "我们最适合承接什么" : "Where AxisX fits best"} lead={zh ? "高价值、规则明确、需要专业判断，或者需要持续质量闭环的项目。" : "High-value work with clear rules, specialist judgment and a continuing quality loop."} inverse />
        <div className="fit-table">
          {(zh ? [
            ["STEM 原创 Challenge Set", "数学、物理、化学、生物与计算机高难度推理", "原创题面、参考推导、量规、验证器、难度与污染筛查"],
            ["受监管领域专家数据", "金融、法律、医学长上下文任务", "专家答案、来源证据、安全边界与 Golden Set"],
            ["Agent 轨迹与后训练", "含文件、浏览器、代码与多步工具", "关键节点、失败归因、修正轨迹与评委复核"],
            ["MLE-Bench 型评测", "数据准备、建模、实验与指标优化", "环境、运行记录、产物、分数与独立复跑"],
            ["MLS-Bench 型评测", "方法改进、消融、泛化与规模验证", "假设、实现、实验、证据与科学性裁决"],
            ["ProgramBench 任务", "从行为规格与可执行程序重建系统", "任务包、隐藏测试、等价性与完整性验收"],
            ["DeepSWE / FrontierSWE", "原创仓库级长程软件工程任务", "容器、补丁、测试、轨迹与程序化验证"],
            ["地学与教育垂类办公", "多源地质解释、课程知识与学习诊断", "来源对齐、专家判断、原创任务与证据化量规"],
          ] : [
            ["Original STEM challenge sets", "Hard reasoning across math, physics, chemistry, biology and CS", "Original prompt, reference derivation, rubric, verifier, difficulty and contamination screen"],
            ["Regulated-domain expert data", "Finance, legal and medical long-context work", "Expert answers, source evidence, safety boundaries and golden sets"],
            ["Agent trajectories & post-training", "Files, browsers, code and multi-step tools", "Critical nodes, root cause, corrected paths and judge review"],
            ["MLE-Bench-style evaluation", "Data preparation, modeling, experiments and metric optimization", "Environment, run record, artifacts, score and independent rerun"],
            ["MLS-Bench-style evaluation", "Method improvement, ablation, generalization and scaling", "Hypothesis, implementation, experiments, evidence and scientific adjudication"],
            ["ProgramBench tasks", "Rebuild systems from behavior specs and executables", "Task pack, hidden tests, equivalence and completeness acceptance"],
            ["DeepSWE / FrontierSWE", "Original long-horizon repository engineering", "Container, patch, tests, trajectory and programmatic verification"],
            ["Geoscience & education workflows", "Multi-source interpretation, curriculum knowledge and learning diagnosis", "Source alignment, specialist judgment, original tasks and evidence-backed rubrics"],
          ]).map((row, i) => <div className="fit-row" key={row[0]}><span>0{i + 1}</span><h3>{row[0]}</h3><p>{row[1]}</p><p>{row[2]}</p></div>)}
        </div>
        <p className="legal-note">{zh ? "STEM Challenge Set 以及 MLE-Bench、MLS-Bench、ProgramBench、DeepSWE 与 FrontierSWE 在此用于描述可对齐的前沿任务方法；除非另有明确说明，不代表与任何公开 Benchmark 存在官方合作。具体数据、环境、授权与评分方式以项目范围为准。" : "STEM challenge sets and the MLE-Bench, MLS-Bench, ProgramBench, DeepSWE and FrontierSWE references describe frontier task methods we can align delivery to; unless explicitly stated, they do not imply official affiliation with a public benchmark. Data, environments, licensing and scoring remain scope-specific."}</p>
      </section>
      <CTA route={route} />
    </main>
  );
}

function MethodologyPage({ route }) {
  const { lang } = route;
  const zh = lang === "zh";
  const principles = zh ? [
    ["能力增量优先", "数据价值来自它能否识别、训练或验证一项具体能力，而不是来自条目数量本身。", "CAPABILITY DELTA"],
    ["任务成立优先", "任务必须清晰、可解、可区分，并对目标能力形成必要而非偶然的压力。", "TASK VALIDITY"],
    ["过程证据优先", "来源跨度、参考推导、工具轨迹、运行日志和复核理由共同支撑结论。", "OPERATING EVIDENCE"],
    ["复现能力优先", "环境、依赖、数据版本、验证器和随机性边界需要允许关键结论被独立复跑。", "REPRODUCIBILITY"],
    ["分歧可解释", "高质量系统不隐藏分歧，而是记录判断差异、责任层级与最终裁决。", "ADJUDICATION"],
  ] : [
    ["Capability delta first", "Data earns value by identifying, training or validating a specific capability—not through row count alone.", "CAPABILITY DELTA"],
    ["Task validity first", "A task must be clear, solvable and discriminative, applying necessary rather than accidental pressure to the target capability.", "TASK VALIDITY"],
    ["Operating evidence first", "Source spans, reference derivations, tool traces, runtime logs and reviewer rationale support the conclusion together.", "OPERATING EVIDENCE"],
    ["Reproducibility first", "Environment, dependencies, data versions, verifiers and randomness boundaries must allow critical results to be independently rerun.", "REPRODUCIBILITY"],
    ["Explain disagreement", "A quality system does not hide disagreement. It retains divergent judgments, responsibility and the final ruling.", "ADJUDICATION"],
  ];
  const anatomy = zh ? [
    ["任务规格", "目标能力、输入边界、允许工具、完成条件与明确的失败定义。"],
    ["参考与量规", "专家参考、关键步骤、部分得分、边界案例和不可接受行为。"],
    ["验证机制", "来源核验、符号或数值检查、隐藏测试、环境复跑或专业复核。"],
    ["运行证据", "模型版本、输入版本、行动—观察链、日志、产物和验证结果。"],
    ["判断记录", "独立评审、置信度、分歧原因、升级路径和最终裁决。"],
    ["版本状态", "草拟、校准、返修、接受、弃用，以及每次状态变化的依据。"],
  ] : [
    ["Task specification", "Target capability, input boundary, allowed tools, completion conditions and explicit failure definitions."],
    ["Reference and rubric", "Expert reference, critical steps, partial credit, edge cases and unacceptable behavior."],
    ["Verification mechanism", "Source checks, symbolic or numerical validation, hidden tests, environment reruns or specialist review."],
    ["Run evidence", "Model and input versions, action–observation chain, logs, artifacts and verifier results."],
    ["Judgment record", "Independent reviews, confidence, disagreement, escalation and final adjudication."],
    ["Version state", "Draft, calibration, rework, accepted or retired—with evidence for every transition."],
  ];
  const cycle = zh ? [
    ["01", "定义边界", "从模型错误、业务风险或现有评测盲区中确定目标能力。"],
    ["02", "构造任务", "由符合资格的作者生成任务、参考、量规和验证逻辑。"],
    ["03", "独立验证", "通过复算、复跑、盲审或隐藏测试确认任务与答案成立。"],
    ["04", "模型压力测试", "识别捷径、污染、歧义、评委偏差和环境不稳定。"],
    ["05", "形成版本", "按接受、返修或弃用状态组成可审计的发布批次。"],
    ["06", "回到模型", "用失败分布决定下一批任务、训练样本和评测版本。"],
  ] : [
    ["01", "Define the boundary", "Locate the target capability in model errors, operating risk or a gap in the current evaluation."],
    ["02", "Construct the task", "Qualified authors produce the task, reference, rubric and verification logic together."],
    ["03", "Verify independently", "Independent solves, reruns, blind review or hidden tests establish task and answer validity."],
    ["04", "Stress the model", "Expose shortcuts, contamination, ambiguity, judge bias and unstable environments."],
    ["05", "Release a version", "Accepted, rework and retired states form an auditable benchmark release."],
    ["06", "Return to the model", "Failure distributions determine the next tasks, training data and evaluation version."],
  ];
  return (
    <main className="methodology-page">
      <PageHero eyebrow={zh ? "数据方法 / DATA METHOD" : "DATA METHOD / AXISX"} title={zh ? "好数据是模型改进的最小可验证单元" : "Good data is the smallest verifiable unit of model improvement"} lead={zh ? "我们不把数据理解为待加工的内容集合，而把它理解为由任务、参考、验证、运行和裁决共同组成的能力证据。" : "We do not treat data as content awaiting processing. We treat it as capability evidence composed of a task, reference, verification, run and judgment."} video={zh ? "/meridian/backgrounds/services-zh.mp4" : "/meridian/backgrounds/services-en.mp4"} poster={zh ? "/meridian/v10/zh/program.jpg" : "/meridian/v10/en/program.jpg"} />
      <section className="method-thesis paper-section">
        <div className="method-thesis-index">01 / {zh ? "判断框架" : "OPERATING THESIS"}</div>
        <blockquote>{zh ? "规模回答能生产多少，方法回答生产的东西为什么值得进入模型。" : "Scale answers how much can be produced. Method explains why the result deserves to enter a model."}</blockquote>
        <p>{zh ? "同样一条任务，可以只是文本，也可以成为训练信号、诊断工具或版本决策依据。差异来自能力定义是否清楚，任务是否成立，证据是否闭环，以及复核能否解释分歧。" : "The same task can remain text—or become a training signal, diagnostic instrument or release decision. The difference is whether the capability is defined, the task is valid, the evidence closes and review can explain disagreement."}</p>
      </section>
      <section className="method-principles-section ink-section">
        <SectionHead index="02" eyebrow={zh ? "五项原则" : "FIVE PRINCIPLES"} title={zh ? "在扩大规模以前，先证明数据有效" : "Prove the data is valid before scaling it"} lead={zh ? "不同领域采用不同验证方式，但以下五项原则不变。" : "Verification changes by domain. These five principles do not."} inverse />
        <div className="method-principles-grid">{principles.map(([title, body, code], index) => <article className="method-principle" key={title}><span>{String(index + 1).padStart(2, "0")} / {code}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
      </section>
      <section className="data-object-section paper-section">
        <SectionHead index="03" eyebrow={zh ? "数据单元" : "DATA OBJECT"} title={zh ? "一条可验收数据应包含什么" : "What an acceptable data unit contains"} lead={zh ? "不是所有项目都需要完全相同的字段，但复杂任务通常需要覆盖以下六个层面。" : "Not every program uses the same schema, but complex work normally covers these six layers."} />
        <div className="data-object-grid">{anatomy.map(([title, body], index) => <article className="data-object-card" key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
      </section>
      <section className="method-cycle-section">
        <div className="method-cycle-head"><Eyebrow index="04">{zh ? "持续评测闭环" : "CONTINUOUS EVALUATION LOOP"}</Eyebrow><h2>{zh ? "数据发布不是终点" : "A data release is not the endpoint"}</h2><p>{zh ? "真正有效的生产系统会用模型失败重新定义下一轮任务，而不是反复扩大同一种题目的数量。" : "An effective production system uses model failures to redefine the next task release instead of repeatedly scaling one task pattern."}</p></div>
        <div className="method-cycle">{cycle.map(([no, title, body]) => <article key={no}><span>{no}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
      </section>
      <section className="method-boundary paper-section"><span>05 / {zh ? "项目边界" : "PROGRAM BOUNDARY"}</span><p>{zh ? "具体任务需要根据样本、模型阶段、运行环境、数据权利与安全要求重新校准。公开页面说明的是方法，不替代项目级验收标准，也不暗示未经确认的客户关系或认证。" : "Every task is recalibrated to samples, model stage, runtime, data rights and security requirements. This public method does not replace project-specific acceptance criteria or imply unconfirmed client relationships or certifications."}</p></section>
      <CTA route={route} />
    </main>
  );
}

function DeliveryPage({ route }) {
  const { lang } = route;
  const zh = lang === "zh";
  return (
    <main>
      <PageHero eyebrow={zh ? "托管交付 / DELIVERY" : "MANAGED DELIVERY"} title={zh ? "交付任务、环境、证据与裁决" : "Deliver tasks, environments, evidence and adjudication"} lead={zh ? "复杂评测不应只交付一份结果表。我们把专家资格、原创性、参考解、运行环境、轨迹、验证器、复核与版本记录一并纳入验收。" : "Complex evaluation programs should deliver more than an output table. Expert qualification, originality, references, runtime environments, trajectories, verifiers, review and version records all enter acceptance."} video={zh ? "/meridian/backgrounds/home-zh.mp4" : "/meridian/backgrounds/home-en.mp4"} poster={zh ? "/meridian/v10/zh/finance.jpg" : "/meridian/v10/en/finance.jpg"} />
      <section className="paper-section page-section">
        <SectionHead index="01" eyebrow={zh ? "工作方式" : "OPERATING MODEL"} title={zh ? "先验证任务与环境，再扩大并行运行" : "Validate the task and environment before scaling runs"} lead={zh ? "先确认任务可解、评分可区分、环境可复现和专家适配，再按批次扩展并发。" : "Solvability, score discrimination, environment reproducibility and expert fit are established before run concurrency expands."} />
        <ProcessStrip lang={lang} />
      </section>
      <section className="delivery-visual-section">
        <div className="delivery-photo"><LoopVideo src={zh ? "/meridian/clips/reel-zh.mp4" : "/meridian/clips/reel-en.mp4"} poster={zh ? "/meridian/v10/zh/stem.jpg" : "/meridian/v10/en/stem.jpg"} label={zh ? "多任务评测运营场景" : "Multi-workflow evaluation operations"} /><span>{zh ? "多任务评测运营场景" : "MULTI-WORKFLOW EVALUATION OPERATIONS"}</span></div>
        <div className="delivery-principles">
          <Eyebrow index="02">DELIVERY CONTROL</Eyebrow>
          {(zh ? [
            ["统一接口", "项目问题由交付负责人汇总，避免贡献者无序直连客户。"],
            ["版本管理", "规则、样本和反馈使用明确版本，防止不同批次口径漂移。"],
            ["分层产能", "生产、领域复核与 QA 使用不同资格标准，按难度配置。"],
            ["异常闭环", "效率、质量、规则或系统问题有明确的升级与返修路径。"],
          ] : [
            ["One interface", "A delivery lead consolidates questions instead of exposing clients to unmanaged contributor traffic."],
            ["Version control", "Rules, samples and feedback use explicit versions to prevent batch-to-batch drift."],
            ["Tiered capacity", "Production, domain review and QA use distinct qualification standards."],
            ["Exception closure", "Quality, throughput, rule and system issues follow defined escalation and rework paths."],
          ]).map(([title, body], i) => <div className="principle" key={title}><span>0{i + 1}</span><h3>{title}</h3><p>{body}</p></div>)}
        </div>
      </section>
      <section className="paper-section page-section">
        <SectionHead index="03" eyebrow={zh ? "人才分层" : "TALENT LAYERS"} title={zh ? "任务难度决定人才与 QA 配置" : "Task difficulty determines talent and QA"} />
        <TalentMatrix lang={lang} />
        <div className="delivery-output-strip">
          {(zh ? [
            ["SOP 版本", "明确本批次执行规则与边界案例"],
            ["生产记录", "保留任务、人员、时间与状态信息"],
            ["QA 证据", "抽检、问题归因与返修结果可追踪"],
            ["验收批次", "按约定结构提交达标结果与复盘"],
          ] : [
            ["SOP version", "Rules and edge cases fixed for the active batch"],
            ["Production record", "Task, owner, timing and state retained"],
            ["QA evidence", "Sampling, issue attribution and rework traceable"],
            ["Accepted batch", "Qualified output and review delivered in the agreed structure"],
          ]).map(([title, body], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>
      <CTA route={route} />
    </main>
  );
}

function WorkPage({ route }) {
  const { lang, navigate } = route;
  const zh = lang === "zh";
  return (
    <main>
      <PageHero eyebrow={zh ? "代表案例 / WORK" : "REPRESENTATIVE WORK"} title={zh ? "从高难度问题到可复核的模型证据" : "From hard questions to reviewable model evidence"} lead={zh ? "以下案例覆盖 STEM、金融、法律、医学、Agent、机器学习、软件工程、地学与教育。每项均说明脱敏对象、执行过程、代表规模和结果证据；客户名称仅在获得授权时披露。" : "Cases span STEM, finance, legal, medical, agents, machine learning, software engineering, geoscience and education. Each documents the sanitized object, operating method, representative scale and outcome evidence; client names are disclosed only when authorized."} video={zh ? "/meridian/backgrounds/work-zh.mp4" : "/meridian/backgrounds/work-en.mp4"} poster={zh ? "/meridian/v10/zh/swe.jpg" : "/meridian/v10/en/swe.jpg"} />
      <section className="paper-section work-grid-section">
        <div className="work-grid">
          {CASES.map((item, i) => <CaseCard key={item.slug} item={item} lang={lang} navigate={navigate} featured={i === 3 || i === 7} index={i} />)}
        </div>
        <p className="legal-note">{zh ? "案例采用代表性脱敏交付结构：客户身份、输入内容及部分规模指标已移除或区间化，仅用于说明项目方法与既有交付经验，不构成对未来结果的承诺。" : "Cases use representative sanitized delivery structures. Client identities, source content and selected volumes have been removed or banded to explain operating methods and prior delivery experience; results are not guarantees of future performance."}</p>
      </section>
      <CTA route={route} />
    </main>
  );
}

function FlagshipCaseFile({ data, lang }) {
  if (!data) return null;
  const zh = lang === "zh";
  return (
    <section className="flagship-case-file">
      <div className="flagship-head">
        <span>03 / {data.label}</span>
        <h2>{zh ? "把一个项目拆到可以被技术团队质询" : "A case file a technical team can interrogate"}</h2>
        <p>{data.thesis}</p>
      </div>
      <div className="flagship-workflow">
        {data.workflow.map(([title, body], index) => <article className="flagship-step" key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{body}</p></article>)}
      </div>
      <div className="flagship-panels">
        <article className="flagship-panel reject">
          <span>04 / {zh ? "返修或剔除条件" : "REWORK OR REJECTION GATES"}</span>
          <h3>{zh ? "哪些问题不会进入最终批次" : "What does not enter the accepted batch"}</h3>
          <ul>{data.failureGates.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
        <article className="flagship-panel handoff">
          <span>05 / {zh ? "交付组成" : "HANDOFF PACKAGE"}</span>
          <h3>{zh ? "最终交付不只有一列答案" : "The handoff is more than an answer column"}</h3>
          <ul>{data.handoff.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
      </div>
      <div className="flagship-use"><span>06 / {zh ? "进入模型工作流" : "MODEL-WORKFLOW USE"}</span><p>{data.use}</p></div>
    </section>
  );
}

function WorkDetailPage({ route, slug }) {
  const { lang, navigate } = route;
  const item = CASES.find((entry) => entry.slug === slug);
  if (!item) return <NotFound route={route} />;
  const t = item[lang];
  const zh = lang === "zh";
  const image = lang === "en" && item.imageEn ? item.imageEn : item.image;
  const video = lang === "en" && item.videoEn ? item.videoEn : item.video;
  const metrics = item.metrics?.[lang] || item.metrics;
  const profile = t.profile.map((entry) => entry[1]);
  const procurementBrief = zh ? [
    ["能力缺口", t.summary],
    ["评测对象", profile[0]],
    ["任务设计", profile[1]],
    ["代表规模", profile[2]],
    ["QA 协议", `${t.deliveryModel}；${t.proof[2]}`],
    ["证据包", `${t.proof[0]}；${t.proof[1]}；${profile[3]}`],
    ["公开边界", "客户身份、原始材料及部分规模已移除或区间化；本页用于说明交付方法，不构成未来结果承诺。"],
  ] : [
    ["Capability gap", t.summary],
    ["Evaluation object", profile[0]],
    ["Task design", profile[1]],
    ["Operating scale", profile[2]],
    ["QA protocol", `${t.deliveryModel}; ${t.proof[2]}`],
    ["Evidence package", `${t.proof[0]}; ${t.proof[1]}; ${profile[3]}`],
    ["Disclosure", "Client identity, original material and selected volumes are removed or banded. This brief explains delivery method and does not guarantee future results."],
  ];
  return (
    <main>
      <section className={`case-detail-hero ${item.tone}`}>
        <div className="case-detail-copy">
          <Link to="/work" lang={lang} navigate={navigate} className="back-link">← {zh ? "返回案例" : "Back to work"}</Link>
          <Eyebrow>{t.tag}</Eyebrow>
          <h1>{t.title}</h1>
          <p>{t.summary}</p>
          <div className="detail-metrics">{metrics.map(([value, label]) => <span key={label}><strong>{value}</strong><small>{label}</small></span>)}</div>
        </div>
        <div className="case-detail-image">{video ? <LoopVideo src={video} poster={image} label={zh ? `${t.title} 脱敏操作演示` : `${t.title} sanitized workflow demo`} /> : <img src={asset(image)} alt="" />}</div>
      </section>
      <section className="paper-section detail-body">
        <div>
          <Eyebrow index="01">{zh ? "项目方法" : "DELIVERY METHOD"}</Eyebrow>
          <h2>{zh ? "任务理解先于规模扩张" : "Task understanding before scale"}</h2>
        </div>
        <div className="detail-narrative">
          <p>{t.body}</p>
          <div className="proof-list">{t.proof.map((point, i) => <div key={point}><span>0{i + 1}</span><p>{point}</p></div>)}</div>
          <div className="case-procurement-head"><span>02 / {zh ? "采购评估结构" : "PROCUREMENT REVIEW STRUCTURE"}</span><p>{zh ? "同一套结构用于对齐算法、数据、采购和安全团队的评估问题。" : "One structure aligns the questions asked by model, data, procurement and security teams."}</p></div>
          <div className="case-procurement-grid">
            {procurementBrief.map(([label, body], index) => <article className={index === 6 ? "disclosure" : ""} key={label}><span>{String(index + 1).padStart(2, "0")} / {label}</span><p>{body}</p></article>)}
          </div>
        </div>
      </section>
      {t.flagship && <section className="flagship-case-wrap paper-section"><FlagshipCaseFile data={t.flagship} lang={lang} /></section>}
      <CTA route={route} />
    </main>
  );
}

function MeridianPage({ route }) {
  const { lang } = route;
  const zh = lang === "zh";
  const modules = zh ? [
    ["金融推理与证据链", "/meridian/v10/zh/finance.jpg", "/meridian/clips/finance-zh.mp4", "在财报、政策与风险条款之间保留结论、反证、引用跨度和金融复核状态。"],
    ["法律长文档审阅", "/meridian/v10/zh/legal.jpg", "/meridian/clips/legal-zh.mp4", "按法域和文本版本处理条款冲突、引用核验与专业裁决。"],
    ["医学证据与安全", "/meridian/v10/zh/medical.jpg", "/meridian/clips/medical-zh.mp4", "管理 PICO 证据、指南一致性、高风险升级与双重医学复核。"],
    ["STEM 原创难题工场", "/meridian/v10/zh/stem.jpg", "/meridian/clips/stem-zh.mp4", "管理专家出题、参考推导、答案唯一性、验证器、模型难度校准与污染风险筛查。"],
    ["Agent 轨迹与失败归因", "/meridian/v10/zh/trajectory.jpg", "/meridian/clips/trajectory-zh.mp4", "逐节点审阅计划、工具调用、观察、回退、修正与最终结果。"],
    ["MLE / MLS 实验评测", "/meridian/v10/zh/mle.jpg", "/meridian/clips/mle-zh.mp4", "统一管理数据、环境、实验运行、产物、指标和独立复跑。"],
    ["ProgramBench 任务运行", "/meridian/v10/zh/program.jpg", "/meridian/clips/program-zh.mp4", "以行为规格、可执行参考和隐藏测试验收完整程序重建。"],
    ["DeepSWE / FrontierSWE", "/meridian/v10/zh/swe.jpg", "/meridian/clips/swe-zh.mp4", "面向真实仓库审阅多文件补丁、测试、长程轨迹与验证器结果。"],
    ["地学多源解释", "/meridian/v10/zh/geology.jpg", "/meridian/clips/geology-zh.mp4", "对齐测井、岩芯、层位、图件与历史报告，保留深度区间、来源版本与不确定性。"],
    ["教育任务与学习诊断", "/meridian/v10/zh/education.jpg", "/meridian/clips/education-zh.mp4", "连接课程知识图谱、原创题目、步骤量规、误区模型与难度校准。"],
  ] : [
    ["Financial reasoning & evidence", "/meridian/v10/en/finance.jpg", "/meridian/clips/finance-en.mp4", "Answers, counter-evidence, citation spans and finance review across statements, policy and risk clauses."],
    ["Legal long-document review", "/meridian/v10/en/legal.jpg", "/meridian/clips/legal-en.mp4", "Clause conflicts, citations and adjudication controlled by jurisdiction and text version."],
    ["Medical evidence & safety", "/meridian/v10/en/medical.jpg", "/meridian/clips/medical-en.mp4", "PICO evidence, guideline consistency, high-risk escalation and dual medical review."],
    ["STEM challenge-set foundry", "/meridian/v10/en/stem.jpg", "/meridian/clips/stem-en.mp4", "Manage expert authoring, reference derivations, answer uniqueness, verifiers, model difficulty calibration and contamination-risk screening."],
    ["Agent trajectory & failure attribution", "/meridian/v10/en/trajectory.jpg", "/meridian/clips/trajectory-en.mp4", "Node-level review of planning, tool calls, observations, recovery, correction and outcome."],
    ["MLE / MLS experiment evaluation", "/meridian/v10/en/mle.jpg", "/meridian/clips/mle-en.mp4", "Data, environments, experiment runs, artifacts, metrics and independent reruns in one record."],
    ["ProgramBench task runs", "/meridian/v10/en/program.jpg", "/meridian/clips/program-en.mp4", "Behavioral specs, executable references and hidden tests for full-program reconstruction."],
    ["DeepSWE / FrontierSWE", "/meridian/v10/en/swe.jpg", "/meridian/clips/swe-en.mp4", "Multi-file patches, tests, long-horizon traces and verifier results for real repositories."],
    ["Multi-source geoscience", "/meridian/v10/en/geology.jpg", "/meridian/clips/geology-en.mp4", "Align logs, core, intervals, maps and reports with depth, source version and uncertainty retained."],
    ["Education tasks & diagnosis", "/meridian/v10/en/education.jpg", "/meridian/clips/education-en.mp4", "Connect curriculum knowledge graphs, original items, step rubrics, misconceptions and difficulty calibration."],
  ];
  return (
    <main>
      <PageHero eyebrow={zh ? "子午台 / MERIDIAN" : "MERIDIAN / BENCHMARK OPERATIONS"} title={zh ? "原创任务、专家判断与可执行验证的控制层" : "The control layer for original work, expert judgment and executable verification"} lead={zh ? "子午台正在把 STEM 出题、任务版本、来源证据、可执行环境、运行轨迹、验证器、独立复核与批次验收接入同一运营链路。当前页面展示开发中原型与代表性任务场景，不代表所有模块已经完整上线，也不作为独立 SaaS 销售。" : "Meridian is progressively connecting STEM authoring, task versions, source evidence, executable environments, run trajectories, verifiers, independent review and batch acceptance. These are in-development prototypes in representative task scenarios; not every module is fully live, and Meridian is not sold as standalone SaaS."} video={zh ? "/meridian/backgrounds/meridian-zh.mp4" : "/meridian/backgrounds/meridian-en.mp4"} poster={zh ? "/meridian/v10/zh/trajectory.jpg" : "/meridian/v10/en/trajectory.jpg"} tag={zh ? "开发中 · 内部试运行" : "IN DEVELOPMENT · INTERNAL PILOT"} />
      <section className="meridian-feature">
        <div className="meridian-reel">
          <LoopVideo src={zh ? "/meridian/clips/reel-zh.mp4" : "/meridian/clips/reel-en.mp4"} poster={zh ? "/meridian/v10/zh/stem.jpg" : "/meridian/v10/en/stem.jpg"} label={zh ? "子午台 Benchmark 工作流概览" : "Meridian benchmark operations reel"} />
        </div>
        <div className="meridian-copy">
          <Eyebrow index="01">WORKFLOW, NOT A GALLERY</Eyebrow>
          <h2>{zh ? "界面只是表层，真正重要的是证据能否闭环。" : "The interface is visible. Evidence closure is what matters."}</h2>
          <p>{zh ? "每条专家结论、Agent 决策、实验指标与代码验收都需要知道依据、环境、执行者、复核层级和最终裁决。" : "Every expert claim, agent decision, experiment metric and code acceptance needs its evidence, environment, owner, review layer and final ruling."}</p>
          <ul>{(zh ? ["任务、环境与角色分配", "来源、规则与验证器版本", "独立复核、复跑与裁决", "批次进度与可审计证据"] : ["Task, environment and role assignment", "Source, rule and verifier versions", "Independent review, rerun and adjudication", "Batch progress and auditable evidence"]).map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
      </section>
      <section className="paper-section module-section">
        <SectionHead index="02" eyebrow={zh ? "作业模块" : "WORK MODULES"} title={zh ? "十套差异化工作流，共用一条可审计证据链" : "Ten differentiated workflows on one auditable evidence chain"} />
        <div className="module-grid">{modules.map(([title, image, video, body], index) => <article className="module-card" key={title}><LoopVideo src={video} poster={image} label={`${String(index + 1).padStart(2, "0")} / ${title}`} /><span>MERIDIAN / MODULE {String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
      </section>
      <CTA route={route} />
    </main>
  );
}

function QualityPage({ route }) {
  const { lang } = route;
  const zh = lang === "zh";
  const stages = zh ? [
    ["01", "输入质量", "指令、环境与任务是否可理解、可执行、可评测。"],
    ["02", "过程与轨迹", "规划、工具使用、迭代和自检是否合理。"],
    ["03", "输出质量", "结果是否完整、准确、专业且可直接使用。"],
    ["04", "评测可靠性", "原始评分、失败归因与评委行为是否可信。"],
  ] : [
    ["01", "Input quality", "Whether instructions, environment and task are understandable, executable and evaluable."],
    ["02", "Process & trajectory", "Whether planning, tool use, iteration and self-check are reasonable."],
    ["03", "Output quality", "Whether the result is complete, accurate, professional and usable."],
    ["04", "Evaluation reliability", "Whether original scoring, failure attribution and judge behavior can be trusted."],
  ];
  const evidence = zh ? [
    ["/meridian/v10/zh/stem.jpg", "推导证据", "高难度题不是写出来就有效", "独立复算、答案唯一性、参考推导、验证器与模型难度校准共同证明题目成立。"],
    ["/meridian/v10/zh/trajectory.jpg", "过程证据", "结果正确不代表过程可靠", "关键决策、工具调用、观察、回退与修正进入逐节点审阅。"],
    ["/meridian/v10/zh/swe.jpg", "运行证据", "工程结论必须通过环境验证", "补丁、测试、日志、验证器与复跑结果共同支撑裁决。"],
  ] : [
    ["/meridian/v10/en/stem.jpg", "DERIVATION EVIDENCE", "A difficult prompt is not automatically a valid task", "Independent solves, answer uniqueness, reference derivations, verifiers and model calibration establish task validity."],
    ["/meridian/v10/en/trajectory.jpg", "PROCESS EVIDENCE", "A correct outcome does not prove a reliable process", "Critical decisions, tool calls, observations, recovery and corrections enter node-level review."],
    ["/meridian/v10/en/swe.jpg", "RUNTIME EVIDENCE", "Engineering conclusions must survive environment verification", "Patches, tests, logs, verifiers and reruns support the ruling together."],
  ];
  return (
    <main>
      <PageHero eyebrow={zh ? "质量与治理 / QUALITY" : "QUALITY & GOVERNANCE"} title={zh ? "质量不是最后一道检查 而是整条生产链" : "Quality lives across the production chain"} lead={zh ? "资格筛选、校准、版本、抽检、交叉复核、返修与裁决共同决定交付结果。" : "Qualification, calibration, versioning, sampling, cross-review, rework and adjudication jointly determine the result."} video={zh ? "/meridian/backgrounds/work-zh.mp4" : "/meridian/backgrounds/work-en.mp4"} poster={zh ? "/meridian/v10/zh/stem.jpg" : "/meridian/v10/en/stem.jpg"} />
      <section className="paper-section page-section">
        <SectionHead index="01" eyebrow={zh ? "六项控制" : "SIX CONTROLS"} title={zh ? "为降低交付波动而设计" : "Designed to reduce delivery variance"} />
        <div className="quality-grid">{QUALITY[lang].map(([title, body], i) => <article key={title}><span>0{i + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
      </section>
      <section className="ink-section evaluation-section">
        <SectionHead index="02" eyebrow={zh ? "高阶评测" : "ADVANCED EVALUATION"} title={zh ? "复杂 AI 工作的四阶段审阅" : "Four-stage review of complex AI work"} lead={zh ? "不只判断答案对错，也判断任务、过程与原始评测是否可靠。" : "Review not only the answer, but the task, process and reliability of the original evaluation."} inverse />
        <div className="stage-grid">{stages.map(([no, title, body]) => <article key={no}><span>{no}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
        <div className="qa-model">{zh ? "独立审阅 A + 独立审阅 B → 质检裁决 C → 人类确认" : "Independent review A + independent review B → QA adjudication C → human confirmation"}</div>
      </section>
      <EvidenceGallery index="03" eyebrow={zh ? "质量证据" : "QUALITY EVIDENCE"} title={zh ? "把判断留在可审阅的记录里" : "Keep judgment in a reviewable record"} lead={zh ? "质量系统需要让规则、操作、理由和裁决彼此关联，而不是只留下一个最终分数。" : "A quality system connects rules, actions, rationales and adjudication instead of leaving only a final score."} items={evidence} />
      <section className="paper-section note-section"><p>{zh ? "我们不声称尚未就具体项目建立的认证、控制或合规能力。安全、保密、访问与留存要求在生产前按项目界定并写入执行规则。" : "We do not claim certifications or controls that have not been established for a specific project. Security, confidentiality, access and retention requirements are scoped before production and written into operating rules."}</p></section>
      <CTA route={route} />
    </main>
  );
}

function FuturePage({ route }) {
  const { lang } = route;
  const t = FUTURE[lang];
  const zh = lang === "zh";
  const directionSignals = zh ? [
    ["/meridian/v10/zh/stem.jpg", "方向概念", "持续演进的 Challenge Set 工场", "让原创问题、参考推导、验证器、难度与污染控制随模型能力共同升级。"],
    ["/meridian/v10/zh/mle.jpg", "方向概念", "可复现的 ML 研究运行", "让环境、实验、产物、指标和泛化证据可复跑、可比较、可裁决。"],
    ["/meridian/v10/zh/swe.jpg", "方向概念", "持续演进的软件智能 Benchmark", "让原创任务、验证器、轨迹与失败分类随模型能力共同升级。"],
  ] : [
    ["/meridian/v10/en/stem.jpg", "DIRECTIONAL CONCEPT", "A continuously evolving challenge-set foundry", "Advance original problems, reference derivations, verifiers, difficulty and contamination controls with model capability."],
    ["/meridian/v10/en/mle.jpg", "DIRECTIONAL CONCEPT", "Reproducible ML research runs", "Make environments, experiments, artifacts, metrics and generalization evidence rerunnable and adjudicable."],
    ["/meridian/v10/en/swe.jpg", "DIRECTIONAL CONCEPT", "Continuously evolving software-intelligence benchmarks", "Advance original tasks, verifiers, trajectories and failure taxonomies with model capability."],
  ];
  return (
    <main className="future-page">
      <PageHero eyebrow={t.hero.eyebrow} title={t.hero.title} lead={t.hero.lead} video={zh ? "/meridian/backgrounds/future-zh.mp4" : "/meridian/backgrounds/future-en.mp4"} poster={zh ? "/meridian/v10/zh/mle.jpg" : "/meridian/v10/en/mle.jpg"} tag={t.hero.tag} />
      <section className="future-thesis">
        <span>AXIS / 2030</span>
        <p>{t.thesis}</p>
      </section>
      <section className="future-horizons">
        <div className="horizon-line" aria-hidden="true"><i /><i /><i /></div>
        {t.horizons.map((item) => (
          <article className="horizon-card" key={item.no}>
            <div className="horizon-meta"><span>{item.no}</span><b>{item.phase}</b></div>
            <h2>{item.title}</h2>
            <p>{item.body}</p>
            <ul>{item.items.map((point) => <li key={point}>{point}</li>)}</ul>
          </article>
        ))}
      </section>
      <EvidenceGallery index="02" eyebrow={zh ? "未来数据形态" : "FUTURE DATA MODES"} title={zh ? "从生产更多走向构造更难、验证更深" : "Move from producing more to constructing harder, verifying deeper"} lead={zh ? "未来竞争力来自专家 Sandbox、可复现实验、长程轨迹与持续 Benchmark 的组合。" : "Future advantage comes from regulated-domain sandboxes, reproducible experiments, long-horizon trajectories and continuous benchmarks."} items={directionSignals} />
      <section className="future-bets paper-section">
        <SectionHead index="03" eyebrow={zh ? "重点建设方向" : "FOCUS AREAS"} title={zh ? "未来能力不会靠一个功能完成" : "The future is a connected operating system—not one feature"} lead={zh ? "每项能力都必须与真实项目、数据边界和可测量的质量改进结合。" : "Each capability must remain grounded in real projects, explicit data boundaries and measurable quality improvement."} />
        <div className="bets-grid">
          {t.bets.map(([title, body], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>
      <section className="roadmap-note">
        <span>{zh ? "路线图说明" : "ROADMAP NOTE"}</span>
        <p>{zh ? "本页描述的是产品与运营体系的建设方向。具体模块、时间与可用范围会根据项目验证、客户要求和合规边界调整。" : "This page describes product and operating-system direction. Module scope, timing and availability will evolve with project validation, client requirements and applicable controls."}</p>
      </section>
      <PartnershipSection route={route} index="04" />
      <CTA route={route} />
    </main>
  );
}

function AboutPage({ route }) {
  const { lang } = route;
  const zh = lang === "zh";
  const evidence = zh ? [
    ["/meridian/v10/zh/education.jpg", "人才网络", "院校关系只是人才触达的起点", "真正进入项目仍需通过任务相关的资格筛选、试标与版本化培训。"],
    ["/meridian/v10/zh/geology.jpg", "校准机制", "专业判断需要形成共同口径", "领域人员、运营与 QA 通过样本、量规和边界案例建立可执行标准。"],
    ["/meridian/v10/zh/trajectory.jpg", "托管运营", "多种任务在同一交付纪律下运行", "项目负责人统一管理分配、答疑、质检、返修与批次验收。"],
  ] : [
    ["/meridian/v10/en/education.jpg", "TALENT NETWORK", "Institutional reach is a starting point", "Project entry still depends on task-specific qualification, trial work and versioned training."],
    ["/meridian/v10/en/geology.jpg", "CALIBRATION", "Professional judgment needs a shared standard", "Domain contributors, operations and QA align through samples, rubrics and edge cases."],
    ["/meridian/v10/en/trajectory.jpg", "MANAGED OPERATIONS", "Different workflows run under one delivery discipline", "A delivery lead manages assignment, clarification, QA, rework and batch acceptance."],
  ];
  return (
    <main>
      <PageHero eyebrow={zh ? "公司 / COMPANY" : "COMPANY"} title={zh ? "把专家知识组织成模型进步的基础设施" : "Specialist knowledge organized as model-improvement infrastructure"} lead={zh ? "子午象限连接 STEM、金融、法律、医学专家，ML 研究人员与软件工程师；AxisX 是面向国际客户的合作与交付界面。两者共享同一套原创任务、环境、验证、运营与质量体系。" : "Our China operation connects STEM, finance, legal and medical specialists with ML researchers and software engineers. AxisX is the collaboration and delivery interface for international clients, backed by the same original-task, environment, verification, operations and quality system."} video={zh ? "/meridian/backgrounds/services-zh.mp4" : "/meridian/backgrounds/services-en.mp4"} poster={zh ? "/meridian/v10/zh/finance.jpg" : "/meridian/v10/en/finance.jpg"} />
      <section className="paper-section page-section"><Stats lang={lang} /></section>
      <section className="dual-brand-section">
        <div className="dual-brand dark"><span>AXISX</span><h2>{zh ? "国际交付界面" : "International delivery interface"}</h2><p>{zh ? "接收任务、完成校准、管理生产与质量，并向客户交付达标结果。" : "Receive the brief, calibrate standards, manage production and quality, and return accepted work."}</p></div>
        <div className="dual-brand light"><span>{zh ? "子午象限" : "AXISX CHINA"}</span><h2>{zh ? "中国人才与 AI 产业协同平台" : "China talent × AI industry platform"}</h2><p>{zh ? "连接高校供给、专业人才、产业项目与托管式运营。" : "Connect university supply, specialist talent, industry projects and managed operations."}</p></div>
      </section>
      <section className="paper-section domain-section">
        <SectionHead index="02" eyebrow={zh ? "领域覆盖" : "DOMAIN COVERAGE"} title={zh ? "专业知识必须进入生产与质检" : "Domain knowledge must enter production and QA"} lead={zh ? "领域匹配不以简历关键词结束，而以真实任务资格筛选确认。" : "Domain fit does not end with résumé keywords; it is validated on real project tasks."} />
        <div className="domain-grid">{DOMAINS[lang].map((domain, i) => <div key={domain}><span>0{i + 1}</span><p>{domain}</p></div>)}</div>
      </section>
      <EvidenceGallery index="03" eyebrow={zh ? "组织方式" : "HOW IT WORKS"} title={zh ? "从人才关系到可交付的生产系统" : "From talent relationships to a delivery system"} lead={zh ? "国际化交付的关键不是人数，而是能否把人员、规则、工具和责任边界组织清楚。" : "International delivery depends less on headcount than on organizing people, rules, tools and accountability clearly."} items={evidence} />
      <CTA route={route} />
    </main>
  );
}

function ArchitectPage({ route }) {
  const { lang } = route;
  const zh = lang === "zh";
  const options = ARCHITECT_OPTIONS[lang];
  const defaultInput = { domain: "stem", program: "challenge", phase: "diagnose", scale: "pilot", boundary: "" };
  const [input, setInput] = useState(defaultInput);
  const [lastInput, setLastInput] = useState(defaultInput);
  const [blueprint, setBlueprint] = useState(() => buildBlueprint(lang, defaultInput));
  const [engine, setEngine] = useState(ARCHITECT_API_URL ? "ready" : "local");
  const [generating, setGenerating] = useState(false);
  const dirty = JSON.stringify(input) !== JSON.stringify(lastInput);
  const selectedDomain = options.domains.find(([value]) => value === input.domain);
  const selectedProgram = options.programs.find(([value]) => value === input.program);
  const localOnly = !ARCHITECT_API_URL;

  useEffect(() => {
    const next = { ...defaultInput };
    setInput(next);
    setLastInput(next);
    setBlueprint(buildBlueprint(lang, next));
    setEngine(ARCHITECT_API_URL ? "ready" : "local");
  }, [lang]);

  const update = (field, value) => {
    setInput((current) => ({ ...current, [field]: value }));
  };

  const handleGenerate = async (event) => {
    event.preventDefault();
    setGenerating(true);
    const localBlueprint = buildBlueprint(lang, input);
    if (!ARCHITECT_API_URL) {
      setBlueprint(localBlueprint);
      setLastInput({ ...input });
      setEngine("local");
      setGenerating(false);
      return;
    }
    try {
      const response = await fetch(ARCHITECT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang, ...input }),
      });
      if (!response.ok) throw new Error("Architect API unavailable");
      const data = await response.json();
      const modelBlueprint = data.blueprint || data;
      if (!modelBlueprint?.title || !Array.isArray(modelBlueprint?.workflow) || !Array.isArray(modelBlueprint?.acceptance)) throw new Error("Invalid blueprint response");
      const modelDisclaimer = zh
        ? "本蓝图由已配置的无状态模型接口生成，只用于初步讨论。任务量、周期、人员配置、合规要求和验收阈值需在查看实际样本后确认；输入处理与留存遵循该接口的部署策略。"
        : "This blueprint is generated by the configured stateless model endpoint for initial discussion only. Volume, timing, staffing, controls and acceptance thresholds require confirmation against real samples; input processing and retention follow that endpoint's deployment policy.";
      setBlueprint({ ...localBlueprint, ...modelBlueprint, id: modelBlueprint.id || localBlueprint.id, disclaimer: modelBlueprint.disclaimer || modelDisclaimer });
      setEngine("model");
    } catch {
      setBlueprint(localBlueprint);
      setEngine("fallback");
    } finally {
      setLastInput({ ...input });
      setGenerating(false);
    }
  };

  const mailBody = [
    zh ? "您好，我通过 AxisX Project Architect 生成了一份初步项目蓝图。" : "Hello, I generated an initial brief with AxisX Project Architect.",
    "",
    `${blueprint.id} · ${blueprint.title}`,
    `${zh ? "能力边界" : "Capability boundary"}: ${blueprint.summary}`,
    `${zh ? "推荐系统" : "Recommended system"}: ${blueprint.system}`,
    `${zh ? "建议试点" : "Suggested pilot"}: ${blueprint.pilot.volume}`,
    "",
    zh ? "希望进一步讨论任务样本、验收方式与合作边界。" : "I would like to discuss task samples, acceptance design and collaboration boundaries.",
  ].join("\n");
  const emailHref = `mailto:${SITE_EMAIL}?subject=${encodeURIComponent(`[AxisX Architect] ${blueprint.title}`)}&body=${encodeURIComponent(mailBody)}`;
  const engineLabel = engine === "model"
    ? (zh ? "无状态模型模式" : "STATELESS MODEL MODE")
    : engine === "fallback"
      ? (zh ? "本地回退模式" : "LOCAL FALLBACK MODE")
      : (zh ? "本地规划模式" : "LOCAL PLANNING MODE");

  return (
    <main className="architect-page">
      <section className="architect-intro">
        <div>
          <Eyebrow>AXISX / PROJECT ARCHITECT</Eyebrow>
          <h1>{zh ? "把模糊需求变成可验证的项目蓝图" : "Turn an ambiguous need into a verifiable project blueprint"}</h1>
        </div>
        <div className="architect-context">
          <span><i />{engineLabel}</span>
          <p>{localOnly
            ? (zh ? "当前版本在浏览器内运行，不上传、不保存输入，也不需要账户或数据库。它根据 AxisX 的任务设计与质量方法生成初步方案，供双方校准，不替代正式项目评估。" : "This version runs in the browser with no account, upload or database. It applies AxisX task-design and quality methods to produce an initial plan for calibration—not a substitute for formal scoping.")
            : (zh ? "当前版本通过无状态模型接口生成方案，不使用网站数据库。输入会发送至已配置的模型服务，具体处理与留存规则以该接口的部署策略为准。" : "This version generates plans through a stateless model endpoint without a site database. Input is sent to the configured model service and remains subject to that endpoint's processing and retention policy.")}</p>
        </div>
      </section>

      <section className="architect-workspace">
        <form className="architect-controls" onSubmit={handleGenerate}>
          <div className="architect-control-head">
            <span>01 / {zh ? "项目输入" : "PROJECT INPUT"}</span>
            <strong>{dirty ? (zh ? "有未生成的修改" : "CHANGES NOT GENERATED") : (zh ? "蓝图已同步" : "BLUEPRINT IN SYNC")}</strong>
          </div>

          <fieldset className="architect-domain-field">
            <legend>{zh ? "选择任务领域" : "Choose a task domain"}</legend>
            <div className="architect-domain-grid">
              {options.domains.map(([value, label]) => (
                <label key={value} className={input.domain === value ? "selected" : ""}>
                  <input type="radio" name="architect-domain" value={value} checked={input.domain === value} onChange={() => update("domain", value)} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <p>{selectedDomain?.[2]}</p>
          </fieldset>

          <label className="architect-select-field">
            <span>{zh ? "项目类型" : "PROGRAM TYPE"}</span>
            <select value={input.program} onChange={(event) => update("program", event.target.value)}>
              {options.programs.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
            <small>{selectedProgram?.[2]}</small>
          </label>

          <div className="architect-select-row">
            <label className="architect-select-field">
              <span>{zh ? "模型阶段" : "MODEL PHASE"}</span>
              <select value={input.phase} onChange={(event) => update("phase", event.target.value)}>
                {options.phases.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
              </select>
            </label>
            <label className="architect-select-field">
              <span>{zh ? "合作尺度" : "ENGAGEMENT SCALE"}</span>
              <select value={input.scale} onChange={(event) => update("scale", event.target.value)}>
                {options.scales.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
              </select>
            </label>
          </div>

          <label className="architect-text-field">
            <span>{zh ? "希望验证的能力边界（可选）" : "CAPABILITY BOUNDARY TO TEST (OPTIONAL)"}</span>
            <textarea maxLength="600" rows="5" value={input.boundary} onChange={(event) => update("boundary", event.target.value)} placeholder={zh ? "例如：模型能够完成任务，但在长程工具调用中经常无法从错误状态恢复……" : "Example: The model completes the task, but often fails to recover from an incorrect state during long-horizon tool use…"} />
            <small>{input.boundary.length} / 600 · {zh ? "仅保存在当前页面内存" : "HELD ONLY IN THIS PAGE SESSION"}</small>
          </label>

          <button className="architect-generate" type="submit" disabled={generating}>
            <span>{generating ? (zh ? "正在构造蓝图" : "CONSTRUCTING BLUEPRINT") : (dirty ? (zh ? "更新项目蓝图" : "UPDATE BLUEPRINT") : (zh ? "重新生成蓝图" : "REGENERATE BLUEPRINT"))}</span>
            <b>↗</b>
          </button>
          <p className="architect-privacy"><i />{localOnly
            ? (zh ? "无登录 · 无数据库 · 无文件上传 · 刷新后输入清除" : "NO LOGIN · NO DATABASE · NO FILE UPLOAD · INPUT CLEARS ON REFRESH")
            : (zh ? "无登录 · 无网站数据库 · 无文件上传 · 使用已配置模型接口" : "NO LOGIN · NO SITE DATABASE · NO FILE UPLOAD · CONFIGURED MODEL ENDPOINT")}</p>
        </form>

        <section className="architect-output" aria-live="polite" aria-busy={generating}>
          <header className="architect-output-head">
            <div><span>02 / {zh ? "建议蓝图" : "PROPOSED BLUEPRINT"}</span><strong>{blueprint.id}</strong></div>
            <span className={`architect-engine ${engine}`}><i />{engineLabel}</span>
          </header>

          <div className="architect-output-title">
            <span>{blueprint.system}</span>
            <h2>{blueprint.title}</h2>
            <p>{blueprint.summary}</p>
          </div>

          <div className="architect-overview">
            <article><span>{zh ? "项目意图" : "PROGRAM INTENT"}</span><p>{blueprint.intent}</p></article>
            <article><span>{zh ? "任务单元" : "TASK UNIT"}</span><p>{blueprint.taskUnit}</p></article>
            <article><span>{zh ? "阶段策略" : "PHASE STRATEGY"}</span><p>{blueprint.phase}</p></article>
          </div>

          <div className="architect-workflow">
            <span className="architect-block-label">03 / {zh ? "执行路径" : "OPERATING PATH"}</span>
            <div>{blueprint.workflow.map((step, index) => <article className="architect-step" key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></article>)}</div>
          </div>

          <div className="architect-evidence-grid">
            {[
              [zh ? "专家配置" : "EXPERT STACK", blueprint.experts],
              [zh ? "证据包" : "EVIDENCE PACKAGE", blueprint.evidence],
              [zh ? "验收信号" : "ACCEPTANCE SIGNALS", blueprint.acceptance],
              [zh ? "主要风险" : "PRIMARY RISKS", blueprint.risks],
            ].map(([title, items], panelIndex) => (
              <article className="architect-evidence-panel" key={title}>
                <span>{String(panelIndex + 4).padStart(2, "0")} / {title}</span>
                <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
            ))}
          </div>

          <div className="architect-pilot">
            <div><span>08 / {zh ? "建议试点" : "SUGGESTED PILOT"}</span><h3>{blueprint.pilot.label}</h3></div>
            <div><strong>{blueprint.pilot.volume}</strong><p>{blueprint.pilot.structure}</p><p>{blueprint.pilot.return}</p></div>
          </div>

          <p className="architect-disclaimer">{blueprint.disclaimer}</p>
          <div className="architect-output-actions">
            <p>{zh ? "下一步通过邮件确认样本、验收方式与项目边界。" : "Continue by email to confirm samples, acceptance and project boundaries."}</p>
            <a href={emailHref}>{zh ? "发送合作邮件" : "EMAIL AXISX"}<span>↗</span></a>
          </div>
        </section>
      </section>
    </main>
  );
}

function ContactPage({ route }) {
  const { lang } = route;
  const zh = lang === "zh";
  const subject = encodeURIComponent(zh ? "[子午象限] 项目合作咨询" : "[AxisX] Project enquiry");
  const body = encodeURIComponent(zh
    ? "您好，\n\n公司/团队：\n希望突破的模型能力边界：\n任务领域（STEM / 金融 / 法律 / 医学 / Agent / ML / SWE）：\n现有样本、环境或 Benchmark：\n期望的验证方式与时间：\n其他说明：\n\n如有材料，请直接作为附件添加到本邮件。"
    : "Hello,\n\nCompany / team:\nModel capability boundary to investigate:\nDomain (STEM / finance / legal / medical / agent / ML / SWE):\nExisting samples, environment or benchmark:\nPreferred validation and timing:\nOther notes:\n\nPlease attach relevant materials directly to this email.");
  const emailHref = `mailto:${SITE_EMAIL}?subject=${subject}&body=${body}`;
  return (
    <main>
      <PageHero eyebrow={zh ? "合作 / CONTACT" : "COLLABORATION BRIEF"} title={zh ? "从一个尚未被解决的能力边界开始" : "Start with a capability boundary that remains unsolved"} lead={zh ? "发送目标能力、现有样本或 Benchmark、运行环境与验证逻辑。我们会据此判断任务边界、所需专家与可验证的试点路径。" : "Share the target capability, current samples or benchmark, runtime environment and validation logic. We will use them to assess the task boundary, specialist stack and a verifiable pilot path."} video={zh ? "/meridian/backgrounds/future-zh.mp4" : "/meridian/backgrounds/future-en.mp4"} poster={zh ? "/meridian/v10/zh/stem.jpg" : "/meridian/v10/en/stem.jpg"} />
      <section className="contact-section">
        <aside className="contact-aside">
          <Eyebrow index="01">WHAT TO SEND</Eyebrow>
          <h2>{zh ? "有用的项目信息" : "Useful project information"}</h2>
          {(zh ? ["希望突破的模型能力边界", "领域、任务类型与语言", "现有题目、样本或运行环境", "期望的难度、验证与时间", "参考解、量规或验收阈值", "合作方式与保密边界"] : ["The model capability boundary", "Domain, task type and language", "Existing tasks, samples or runtime", "Target difficulty, validation and timing", "References, rubric or acceptance threshold", "Collaboration model and confidentiality boundary"]).map((item, i) => <div className="contact-list-item" key={item}><span>0{i + 1}</span><p>{item}</p></div>)}
          <div className="direct-email"><small>{zh ? "直接邮件" : "Direct email"}</small><a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a></div>
        </aside>
        <div className="email-panel">
          <div className="form-head"><span>DIRECT / EMAIL</span><h2>{zh ? "直接发送项目邮件" : "Send a project email"}</h2><p>{zh ? "网站不收集、不上传也不留存您的项目信息。点击后将打开您的邮件客户端，并自动填入建议的信息结构。" : "The site does not collect, upload or retain your project information. The button opens your email client with a suggested brief structure."}</p></div>
          <div className="email-panel-body">
            <small>{zh ? "收件邮箱" : "TO"}</small>
            <a className="email-address" href={emailHref}>{SITE_EMAIL}</a>
            <p>{zh ? "建议写明公司或团队、目标能力边界、现有任务或环境、期望难度与验证方式；样本、SOP 或 Benchmark 说明可直接添加为附件。" : "Include your company or team, target capability boundary, existing tasks or environment, desired difficulty and validation method. Samples, SOPs or benchmark notes can be attached directly."}</p>
            <a className="submit-button" href={emailHref}>{zh ? "打开邮件并发送资料" : "Open email and attach brief"}<span>↗</span></a>
            <span className="privacy-note">{zh ? "无需填写网页表格 · 无后台数据库 · 不在网站保存材料" : "No web form · No backend database · No materials stored on site"}</span>
          </div>
        </div>
      </section>
    </main>
  );
}

function NotFound({ route }) {
  const { lang, navigate } = route;
  return <main className="not-found"><span>404 / OFF AXIS</span><h1>{lang === "zh" ? "这个页面不在坐标轴上。" : "This page is off the axis."}</h1><ButtonLink to="/" lang={lang} navigate={navigate} tone="light">{lang === "zh" ? "返回首页" : "Return home"}</ButtonLink></main>;
}

function PageBackdrop({ lang, path }) {
  const zh = lang === "zh";
  const caseSlug = path.startsWith("/work/") ? path.slice(6) : "";
  const caseItem = caseSlug ? CASES.find((item) => item.slug === caseSlug) : null;
  const pages = {
    "/": ["home", zh ? "/meridian/v10/zh/stem.jpg" : "/meridian/v10/en/stem.jpg"],
    "/services": ["services", zh ? "/meridian/v10/zh/finance.jpg" : "/meridian/v10/en/finance.jpg"],
    "/methodology": ["methodology", zh ? "/meridian/v10/zh/program.jpg" : "/meridian/v10/en/program.jpg"],
    "/delivery": ["delivery", zh ? "/meridian/v10/zh/trajectory.jpg" : "/meridian/v10/en/trajectory.jpg"],
    "/work": ["work", zh ? "/meridian/v10/zh/swe.jpg" : "/meridian/v10/en/swe.jpg"],
    "/meridian": ["meridian", zh ? "/meridian/v10/zh/program.jpg" : "/meridian/v10/en/program.jpg"],
    "/quality": ["quality", zh ? "/meridian/v10/zh/stem.jpg" : "/meridian/v10/en/stem.jpg"],
    "/future": ["future", zh ? "/meridian/v10/zh/mle.jpg" : "/meridian/v10/en/mle.jpg"],
    "/architect": ["architect", zh ? "/meridian/v10/zh/trajectory.jpg" : "/meridian/v10/en/trajectory.jpg"],
    "/lab": ["lab", zh ? "/meridian/v10/zh/trajectory.jpg" : "/meridian/v10/en/trajectory.jpg"],
    "/trust": ["trust", zh ? "/meridian/v10/zh/stem.jpg" : "/meridian/v10/en/stem.jpg"],
    "/about": ["about", zh ? "/meridian/v10/zh/education.jpg" : "/meridian/v10/en/education.jpg"],
    "/contact": ["contact", zh ? "/meridian/v10/zh/finance.jpg" : "/meridian/v10/en/finance.jpg"],
  };
  const caseImage = caseItem ? (lang === "en" && caseItem.imageEn ? caseItem.imageEn : caseItem.image) : null;
  const [key, image] = caseImage ? ["case", caseImage] : (pages[path] || ["system", zh ? "/meridian/v10/zh/program.jpg" : "/meridian/v10/en/program.jpg"]);
  return (
    <div className={`page-backdrop page-backdrop-${key}`} data-backdrop={key} aria-hidden="true">
      <div className="page-backdrop-image"><img src={asset(image)} alt="" /></div>
      <div className="page-backdrop-grid" />
      <div className="page-backdrop-orbit"><i /><i /><i /></div>
    </div>
  );
}

function App() {
  const route = useRoute();
  const { lang, path } = route;
  useMotionSystem(`${lang}:${path}`);
  const page = useMemo(() => {
    if (path === "/") return <HomePage route={route} />;
    if (path === "/services") return <ServicesPage route={route} />;
    if (path === "/methodology") return <MethodologyPage route={route} />;
    if (path === "/delivery") return <DeliveryPage route={route} />;
    if (path === "/work") return <WorkPage route={route} />;
    if (path.startsWith("/work/")) return <WorkDetailPage route={route} slug={path.slice(6)} />;
    if (path === "/meridian") return <MeridianPage route={route} />;
    if (path === "/quality") return <QualityPage route={route} />;
    if (path === "/future") return <FuturePage route={route} />;
    if (path === "/lab") return <WorkflowLabPage route={route} />;
    if (path === "/architect") return <ArchitectPage route={route} />;
    if (path === "/trust") return <TrustPage route={route} />;
    if (path === "/about") return <AboutPage route={route} />;
    if (path === "/contact") return <ContactPage route={route} />;
    return <NotFound route={route} />;
  }, [lang, path]);

  useEffect(() => {
    const zh = lang === "zh";
    document.documentElement.lang = zh ? "zh-CN" : "en";
    const pageTitles = {
      "/methodology": zh ? "数据方法 · 子午象限 AxisX" : "Data Method · AxisX",
      "/architect": zh ? "项目架构师 · 子午象限 AxisX" : "Project Architect · AxisX",
      "/lab": zh ? "交互工作流演示 · 子午象限 AxisX" : "Workflow Lab · AxisX",
      "/trust": zh ? "安全与信任 · 子午象限 AxisX" : "Security & Trust · AxisX",
    };
    document.title = pageTitles[path] || (zh ? "子午象限 · AxisX — AI 数据与评测交付" : "AxisX — Expert Data & Evaluation Delivery");
  }, [lang, path]);

  return <><Header route={route} /><div key={`${lang}:${path}`} className="route-signal" aria-hidden="true" /><PageBackdrop key={`backdrop:${lang}:${path}`} lang={lang} path={path} /><div className="site-page-content">{page}</div><Footer route={route} /></>;
}

createRoot(document.getElementById("root")).render(<App />);
