import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { CASES, COPY, DOMAINS, FUTURE, PROCESS, QUALITY, SERVICES, SITE_EMAIL, STATS } from "./content";
import "./styles.css";

const BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
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
      ".contact-aside", ".email-panel", ".detail-body > div",
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
      const target = Number(raw.replace(/[^0-9.]/g, ""));
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
    let frame = 0;
    const updateParallax = () => {
      frame = 0;
      if (!hero || window.innerWidth <= 880) return;
      const shift = Math.min(26, window.scrollY * 0.045);
      hero.style.setProperty("--hero-shift", `${shift}px`);
      hero.style.setProperty("--hero-grid-shift", `${shift * -0.36}px`);
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
          {t.nav.map(([label, to]) => <Link key={to} to={to} lang={lang} navigate={navigate}>{label}</Link>)}
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

function VideoPanel({ src, poster, label, auto = false, lang = "en" }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(auto);
  const toggle = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      try { await video.play(); } catch { return; }
    } else {
      video.pause();
    }
  };
  return (
    <div className={`video-shell ${playing ? "is-playing" : ""}`}>
      <div className="video-chrome">
        <span><i />{lang === "zh" ? "产品开发预览" : "PRODUCT DEVELOPMENT PREVIEW"}</span>
        <b>BUILD 0.9 / INTERNAL</b>
      </div>
      <video
        ref={videoRef}
        src={asset(src)}
        poster={asset(poster)}
        muted
        loop
        playsInline
        preload="metadata"
        autoPlay={auto}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button type="button" className="video-toggle" onClick={toggle} aria-label={playing ? (lang === "zh" ? "暂停视频" : "Pause video") : (lang === "zh" ? "播放视频" : "Play video")}>
        <span>{playing ? "Ⅱ" : "▶"}</span>
        <strong>{label}</strong>
        <small>{playing ? (lang === "zh" ? "暂停" : "PAUSE") : (lang === "zh" ? "播放" : "PLAY")}</small>
      </button>
    </div>
  );
}

function Stats({ lang, dark = false }) {
  return (
    <div className={`stats-grid ${dark ? "dark" : ""}`}>
      {STATS[lang].map(([value, label], index) => (
        <div className="stat" key={label}>
          <span className="stat-index">0{index + 1}</span>
          <strong data-stat-value={value} aria-label={value}>{value}</strong>
          <p>{label}</p>
        </div>
      ))}
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

function CaseCard({ item, lang, navigate, featured = false, index = 0 }) {
  const copy = item[lang];
  const image = lang === "en" && item.imageEn ? item.imageEn : item.image;
  return (
    <Link to={`/work/${item.slug}`} lang={lang} navigate={navigate} className={`case-card ${item.tone} ${featured ? "featured" : ""}`}>
      <div className="case-image-wrap">
        <img src={asset(image)} alt="" loading="lazy" />
        <span className="case-tag">{copy.tag}</span>
        <span className="case-sequence">CASE / {String(index + 1).padStart(2, "0")}</span>
      </div>
      <div className="case-content">
        <div className="case-model">
          <span>{lang === "zh" ? "交付组织" : "DELIVERY MODEL"}</span>
          <strong>{copy.deliveryModel}</strong>
        </div>
        <h3>{copy.title}</h3>
        <p>{copy.body}</p>
        <div className="case-evidence-list">
          {copy.proof.map((point, pointIndex) => <span key={point}><b>0{pointIndex + 1}</b>{point}</span>)}
        </div>
        <div className="case-metrics">
          {item.metrics.map(([value, label]) => <span key={`${value}-${label}`}><strong>{value}</strong><small>{label}</small></span>)}
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
    ["L1", "标准化生产层", "职业院校 / 受训本科", "基础视觉、语音、OCR、结构化作业"],
    ["L2", "通用评测层", "优质本科 / 研究生", "偏好排序、对话评测、一般推理与多模态"],
    ["L3", "专家判断层", "硕博 / 行业专业人才", "垂类 Golden Set、长上下文、高阶评测"],
  ] : [
    ["L1", "Structured production", "Vocational / trained undergraduate", "Vision, speech, OCR and structured operations"],
    ["L2", "General evaluation", "Strong undergraduate / graduate", "Preference, dialogue, reasoning and multimodal evals"],
    ["L3", "Expert judgment", "Graduate / industry specialist", "Vertical golden sets, long context and advanced evals"],
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

function HomePage({ route }) {
  const { lang, navigate } = route;
  const t = COPY[lang].home;
  return (
    <>
      <main>
        <section className="hero">
          <div className="hero-media"><img src={asset("/brand/ops-floor-v5.png")} alt="" /></div>
          <div className="hero-grid-overlay" aria-hidden="true" />
          <div className="hero-content">
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <h1>{t.title.split("\n").map((line, i) => <React.Fragment key={line}>{i > 0 && <br />}{line}</React.Fragment>)}</h1>
            <div className="hero-lower">
              <div className="hero-copy">
                <p>{t.lead}</p>
                <div className="button-row">
                  <ButtonLink to="/contact" lang={lang} navigate={navigate} tone="light">{t.primary}</ButtonLink>
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

        <section className="paper-section services-section">
          <SectionHead index="01" eyebrow={lang === "zh" ? "核心能力" : "CAPABILITIES"} title={t.servicesTitle} lead={t.servicesLead} />
          <ServiceGrid lang={lang} limit={6} />
          <div className="section-action"><ButtonLink to="/services" lang={lang} navigate={navigate}>{lang === "zh" ? "查看完整能力" : "View all capabilities"}</ButtonLink></div>
        </section>

        <section className="ink-section cases-section">
          <SectionHead index="02" eyebrow={lang === "zh" ? "交付证据" : "DELIVERY EVIDENCE"} title={t.casesTitle} lead={t.casesLead} inverse />
          <div className="featured-cases">
            {[CASES[0], CASES[1], CASES[2], CASES[4]].map((item, index) => <CaseCard key={item.slug} item={item} lang={lang} navigate={navigate} index={index} />)}
          </div>
          <div className="section-action"><ButtonLink to="/work" lang={lang} navigate={navigate} tone="light">{COPY[lang].common.allCases}</ButtonLink></div>
        </section>

        <section className="paper-section process-section">
          <SectionHead index="03" eyebrow={lang === "zh" ? "托管交付" : "MANAGED DELIVERY"} title={t.processTitle} lead={t.processLead} />
          <ProcessStrip lang={lang} />
        </section>

        <section className="paper-section talent-section">
          <div className="talent-intro">
            <Eyebrow index="04">{lang === "zh" ? "人才 × 难度" : "TALENT × DIFFICULTY"}</Eyebrow>
            <h2>{lang === "zh" ? "学历只是起点，任务难度决定配置。" : "Education is a starting point. Task difficulty determines the team."}</h2>
            <p>{lang === "zh" ? "统一使用“专家库”会放大成本和质量波动。我们按任务把标准化生产、通用评测与专业判断拆成不同层级。" : "A single undifferentiated expert pool increases cost and quality variance. We separate structured production, general evaluation and specialist judgment."}</p>
          </div>
          <TalentMatrix lang={lang} />
        </section>

        <section className="future-preview">
          <div className="future-preview-index">05 / ROADMAP</div>
          <div className="future-preview-copy">
            <Eyebrow>{lang === "zh" ? "未来方向" : "DIRECTION OF TRAVEL"}</Eyebrow>
            <h2>{lang === "zh" ? "交付不是终点，模型反馈闭环才是。" : "Delivery is not the endpoint. Model feedback is."}</h2>
          </div>
          <div className="future-preview-action">
            <p>{lang === "zh" ? "从专家 Sandbox、Golden Set 到合成数据验证与 Agent 可靠性评测。" : "From expert sandboxes and golden sets to synthetic-data verification and agent reliability."}</p>
            <ButtonLink to="/future" lang={lang} navigate={navigate} tone="light">{lang === "zh" ? "查看未来方向" : "View the roadmap"}</ButtonLink>
          </div>
        </section>

        <section className="platform-section">
          <div className="platform-copy">
            <Eyebrow index="06">OPERATIONS LAYER</Eyebrow>
            <h2>{t.platformTitle}</h2>
            <p>{t.platformBody}</p>
            <ButtonLink to="/meridian" lang={lang} navigate={navigate} tone="light">{lang === "zh" ? "查看子午台" : "Explore Meridian"}</ButtonLink>
          </div>
          <div className="platform-visual">
            <img src={asset(lang === "zh" ? "/meridian/v4/zh/detect.jpg" : "/meridian/v4/en/detect.jpg")} alt={lang === "zh" ? "子午台二维检测作业界面" : "Meridian 2D detection workspace"} loading="lazy" />
            <span>MERIDIAN / WORKSPACE 01</span>
          </div>
        </section>
      </main>
      <CTA route={route} />
    </>
  );
}

function PageHero({ eyebrow, title, lead, image, tag }) {
  return (
    <section className={`page-hero ${image ? "with-image" : ""}`}>
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
    ["/meridian/v4/zh/prefer.jpg", "模型后训练", "把偏好变成可解释证据", "答案选择、理由、量规维度与规则版本共同保留，便于训练与误差分析复用。"],
    ["/meridian/v4/zh/lidar.jpg", "多模态生产", "二维与三维在同一质量口径下协同", "类别、遮挡、朝向与空间匹配进入统一作业和抽检链路。"],
    ["/meridian/v4/zh/finance.jpg", "专家数据", "专业材料从抽取走向复核", "结构化字段、风险证据与领域判断均可追踪到任务和审核状态。"],
  ] : [
    ["/meridian/v4/en/prefer.jpg", "POST-TRAINING", "Turn preference into explainable evidence", "Choices, rationales, rubric dimensions and rule versions stay attached for training and error analysis."],
    ["/meridian/v4/en/lidar.jpg", "MULTIMODAL", "Coordinate 2D and 3D under one quality model", "Classes, occlusion, heading and spatial alignment enter a shared production and sampling loop."],
    ["/meridian/v4/en/finance.jpg", "EXPERT DATA", "Move professional documents from extraction to review", "Structured fields, risk evidence and domain judgment remain traceable to task and review state."],
  ];
  return (
    <main>
      <PageHero eyebrow={zh ? "能力体系 / CAPABILITIES" : "CAPABILITY SYSTEM"} title={zh ? "围绕模型表现组织人类判断" : "Human judgment organized around model performance"} lead={zh ? "从专家数据、模型后训练到 Agent 评测与多模态生产，我们按项目组合能力，而不是用同一类人处理所有任务。" : "From expert data and post-training to agent evaluation and multimodal production, capabilities are composed around the task—not forced through one generic workforce."} image={zh ? "/meridian/v4/zh/prefer.jpg" : "/meridian/v4/en/prefer.jpg"} />
      <section className="paper-section page-section"><ServiceGrid lang={lang} /></section>
      <EvidenceGallery index="02" eyebrow={zh ? "作业证据" : "WORK EVIDENCE"} title={zh ? "不只说明能做什么 也展示任务如何发生" : "Show how the work happens—not only what we offer"} lead={zh ? "优先用真实产品界面、规则状态和质检记录表达能力，减少空泛的概念图。" : "Product interfaces, rule states and QA records make capability concrete without relying on abstract imagery."} items={evidence} />
      <section className="ink-section fit-section">
        <SectionHead index="03" eyebrow={zh ? "任务适配" : "TASK FIT"} title={zh ? "我们最适合承接什么" : "Where AxisX fits best"} lead={zh ? "高价值、规则明确、需要专业判断，或者需要持续质量闭环的项目。" : "High-value work with clear rules, specialist judgment and a continuing quality loop."} inverse />
        <div className="fit-table">
          {(zh ? [
            ["垂类监督微调与参考答案", "金融、科学、代码、语言、法学研究", "专家答案、推理与金标"],
            ["偏好排序与量规打分", "模型后训练与比较评测", "人类偏好、理由与错误标签"],
            ["长上下文专家问答", "研究、文档密集与多源材料", "任务、上下文、答案与逐轮量规"],
            ["复杂任务 / Agent 评测", "含文件、工具和长程轨迹", "任务有效性、过程、输出与评委审阅"],
            ["合成数据筛选与验证", "大规模机器生成训练语料", "去重、纠错、难度与人类确认"],
            ["多模态与具身数据", "视觉、语音、2D/3D、视频动作", "规模化生产与分层 QA"],
          ] : [
            ["Vertical SFT & references", "Finance, science, coding, language, legal-study contexts", "Expert answers, reasoning and gold outputs"],
            ["Preference & rubric scoring", "Post-training and comparative evaluation", "Human preference, rationale and error labels"],
            ["Long-context expert QA", "Research, documents and multi-source material", "Tasks, context, answers and turn-level rubrics"],
            ["Complex-task / agent evals", "Files, tools and long-horizon trajectories", "Task validity, process, output and judge review"],
            ["Synthetic-data validation", "Machine-generated training corpora at scale", "De-duplication, correction, difficulty and confirmation"],
            ["Multimodal & embodied data", "Vision, speech, 2D/3D and video action", "Scaled production with tiered QA"],
          ]).map((row, i) => <div className="fit-row" key={row[0]}><span>0{i + 1}</span><h3>{row[0]}</h3><p>{row[1]}</p><p>{row[2]}</p></div>)}
        </div>
      </section>
      <CTA route={route} />
    </main>
  );
}

function DeliveryPage({ route }) {
  const { lang } = route;
  const zh = lang === "zh";
  return (
    <main>
      <PageHero eyebrow={zh ? "托管交付 / DELIVERY" : "MANAGED DELIVERY"} title={zh ? "交付的是达标结果 不是人员名单" : "Accepted output—not a roster of people"} lead={zh ? "客户不需要自行招募、培训和管理大规模兼职团队。我们把校准标准转化为人员、生产、质检与返修机制。" : "Clients do not need to recruit, train and run a large part-time workforce. We convert calibration into qualification, production, QA and rework."} image="/brand/delivery-base.png" />
      <section className="paper-section page-section">
        <SectionHead index="01" eyebrow={zh ? "工作方式" : "OPERATING MODEL"} title={zh ? "从真实试标开始，再弹性扩容" : "Start with a real trial, then scale elastically"} lead={zh ? "不在项目开始前承诺一个空泛的人数。先用真实任务验证标准与人员，再扩展产能。" : "We do not start with a vague headcount promise. Real task samples validate the rules and workforce before capacity expands."} />
        <ProcessStrip lang={lang} />
      </section>
      <section className="delivery-visual-section">
        <div className="delivery-photo"><img src={asset("/brand/ops-floor-v5.png")} alt="" loading="lazy" /><span>{zh ? "多任务数据运营场景" : "MULTI-WORKFLOW DATA OPERATIONS"}</span></div>
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
      <PageHero eyebrow={zh ? "代表案例 / WORK" : "REPRESENTATIVE WORK"} title={zh ? "复杂专家判断与规模化生产 可以共用一套交付纪律" : "Expert judgment and scaled production can share one delivery discipline"} lead={zh ? "案例用于说明团队组织、任务理解与质量控制能力。具体客户名称仅在获得授权或必要的项目语境下披露。" : "These cases demonstrate team design, task understanding and quality control. Client names are disclosed only when authorized or required by project context."} image={zh ? "/meridian/v4/zh/lidar.jpg" : "/meridian/v4/en/lidar.jpg"} />
      <section className="paper-section work-grid-section">
        <div className="work-grid">
          {CASES.map((item, i) => <CaseCard key={item.slug} item={item} lang={lang} navigate={navigate} featured={i === 0 || i === 3} index={i} />)}
        </div>
        <p className="legal-note">{zh ? "数据与指标为代表项目口径，仅用于说明既有交付经验；不构成对未来项目结果的承诺。" : "Metrics reflect representative project scopes and illustrate prior delivery experience; they are not guarantees of future project outcomes."}</p>
      </section>
      <CTA route={route} />
    </main>
  );
}

function WorkDetailPage({ route, slug }) {
  const { lang, navigate } = route;
  const item = CASES.find((entry) => entry.slug === slug);
  if (!item) return <NotFound route={route} />;
  const t = item[lang];
  const zh = lang === "zh";
  return (
    <main>
      <section className={`case-detail-hero ${item.tone}`}>
        <div className="case-detail-copy">
          <Link to="/work" lang={lang} navigate={navigate} className="back-link">← {zh ? "返回案例" : "Back to work"}</Link>
          <Eyebrow>{t.tag}</Eyebrow>
          <h1>{t.title}</h1>
          <p>{t.summary}</p>
          <div className="detail-metrics">{item.metrics.map(([value, label]) => <span key={label}><strong>{value}</strong><small>{label}</small></span>)}</div>
        </div>
        <div className="case-detail-image"><img src={asset(lang === "en" && item.imageEn ? item.imageEn : item.image)} alt="" /></div>
      </section>
      <section className="paper-section detail-body">
        <div>
          <Eyebrow index="01">{zh ? "项目方法" : "DELIVERY METHOD"}</Eyebrow>
          <h2>{zh ? "任务理解先于规模扩张" : "Task understanding before scale"}</h2>
        </div>
        <div className="detail-narrative">
          <p>{t.body}</p>
          <div className="proof-list">{t.proof.map((point, i) => <div key={point}><span>0{i + 1}</span><p>{point}</p></div>)}</div>
          <div className="case-method-grid">
            {(zh ? [
              ["范围", "先界定任务单位、输入边界与不可接受结果"],
              ["校准", "用真实样本对齐规则、人员与质检口径"],
              ["生产", "按版本、批次和角色组织交付过程"],
              ["验收", "以证据化抽检、返修与批次标准闭环"],
            ] : [
              ["Scope", "Define task units, input boundaries and unacceptable outcomes"],
              ["Calibrate", "Align rules, workforce and QA on real samples"],
              ["Produce", "Operate through explicit versions, batches and roles"],
              ["Accept", "Close with evidence-based sampling, rework and batch criteria"],
            ]).map(([title, body], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}
          </div>
        </div>
      </section>
      <CTA route={route} />
    </main>
  );
}

function MeridianPage({ route }) {
  const { lang } = route;
  const zh = lang === "zh";
  const modules = zh ? [
    ["二维检测", "/meridian/v4/zh/detect.jpg", "/meridian/clips/detect-zh.mp4", "任务队列、画布、类别与遮挡属性在同一界面完成。"],
    ["三维点云", "/meridian/v4/zh/lidar.jpg", "/meridian/clips/lidar-zh.mp4", "点云图层、立方体、朝向与密度检查形成结构化流程。"],
    ["偏好排序", "/meridian/v4/zh/prefer.jpg", "/meridian/clips/prefer-zh.mp4", "并列比较模型答案，记录选择、理由与量规证据。"],
    ["金融进件", "/meridian/v4/zh/finance.jpg", "/meridian/clips/finance-zh.mp4", "围绕专业材料完成风险点识别、标签与复核。"],
    ["Agent 轨迹", "/meridian/v4/zh/agent.jpg", "/meridian/clips/agent-zh.mp4", "从任务设定到工具过程与最终交付物进行分层审阅。"],
  ] : [
    ["2D detection", "/meridian/v4/en/detect.jpg", "/meridian/clips/detect-en.mp4", "File queue, canvas, classes and occlusion attributes in one production view."],
    ["3D LiDAR", "/meridian/v4/en/lidar.jpg", "/meridian/clips/lidar-en.mp4", "Point-cloud layers, cuboids, heading and density checks in a structured flow."],
    ["Preference ranking", "/meridian/v4/en/prefer.jpg", "/meridian/clips/prefer-en.mp4", "Compare model answers and capture choice, rationale and rubric evidence."],
    ["Finance intake", "/meridian/v4/en/finance.jpg", "/meridian/clips/finance-en.mp4", "Risk identification, structured labels and review around professional documents."],
    ["Agent traces", "/meridian/v4/en/agent.jpg", "/meridian/clips/agent-en.mp4", "Layered review from task setup and tool use to the final deliverable."],
  ];
  return (
    <main>
      <PageHero eyebrow={zh ? "子午台 / MERIDIAN" : "MERIDIAN / OPERATIONS LAYER"} title={zh ? "交付背后的作业与质量控制层" : "The production and quality layer behind delivery"} lead={zh ? "子午台正在把任务分发、作业界面、抽检、返修与进度逐步接入同一运营链路。当前页面展示开发中原型与代表性交付场景，不代表所有模块已经完整上线，也不作为独立 SaaS 对外销售。" : "Meridian is progressively bringing assignment, production, sampling, rework and progress into one operating chain. This page shows work-in-progress prototypes in representative delivery scenarios; not every module is fully live, and Meridian is not sold as standalone SaaS."} tag={zh ? "开发中 · 内部试运行" : "IN DEVELOPMENT · INTERNAL PILOT"} />
      <section className="meridian-feature">
        <div className="meridian-reel">
          <VideoPanel src={zh ? "/meridian/clips/reel-zh.mp4" : "/meridian/clips/reel-en.mp4"} poster={zh ? "/meridian/v4/zh/detect.jpg" : "/meridian/v4/en/detect.jpg"} label={zh ? "子午台工作流概览" : "Meridian workflow reel"} lang={lang} auto />
        </div>
        <div className="meridian-copy">
          <Eyebrow index="01">WORKFLOW, NOT A GALLERY</Eyebrow>
          <h2>{zh ? "界面只是表层，真正重要的是作业状态。" : "The interface is visible. Workflow state is what matters."}</h2>
          <p>{zh ? "每条任务需要知道由谁处理、依据哪个规则版本、经过哪一层质检、为什么返修，以及是否达到提交条件。" : "Every task needs a clear owner, rule version, QA stage, rework reason and submission state."}</p>
          <ul>{(zh ? ["任务与人员分配", "项目版本与规则提示", "抽检、复核与返修状态", "批次进度与质量记录"] : ["Task and contributor assignment", "Project version and rule prompts", "Sampling, review and rework state", "Batch progress and quality records"]).map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
      </section>
      <section className="paper-section module-section">
        <SectionHead index="02" eyebrow={zh ? "作业模块" : "WORK MODULES"} title={zh ? "一套运营逻辑，适配不同数据类型" : "One operating logic across multiple data types"} />
        <div className="module-grid">{modules.map(([title, image, video, body], index) => <article className="module-card" key={title}><VideoPanel src={video} poster={image} label={`${String(index + 1).padStart(2, "0")} / ${title}`} lang={lang} /><span>MERIDIAN / MODULE {String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
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
    ["/meridian/v4/zh/detect.jpg", "规则执行", "规则必须出现在作业现场", "类别、属性和边界条件在任务界面中直接可见，降低口径记忆偏差。"],
    ["/meridian/v4/zh/prefer.jpg", "双路审阅", "判断与理由一起进入复核", "不仅记录选择，也记录理由、量规与独立审阅状态。"],
    ["/meridian/v4/zh/finance.jpg", "证据链", "专业结论能够回到原始材料", "风险标签、字段与复核结论保持上下文，便于抽检和裁决。"],
  ] : [
    ["/meridian/v4/en/detect.jpg", "RULE EXECUTION", "Rules must appear where work happens", "Classes, attributes and edge conditions stay visible in the task surface to reduce interpretation drift."],
    ["/meridian/v4/en/prefer.jpg", "INDEPENDENT REVIEW", "Judgment and rationale travel together", "The record captures not only a choice, but its rationale, rubric and review state."],
    ["/meridian/v4/en/finance.jpg", "EVIDENCE CHAIN", "Professional conclusions return to source material", "Risk labels, fields and review conclusions retain enough context for sampling and adjudication."],
  ];
  return (
    <main>
      <PageHero eyebrow={zh ? "质量与治理 / QUALITY" : "QUALITY & GOVERNANCE"} title={zh ? "质量不是最后一道检查 而是整条生产链" : "Quality lives across the production chain"} lead={zh ? "资格筛选、校准、版本、抽检、交叉复核、返修与裁决共同决定交付结果。" : "Qualification, calibration, versioning, sampling, cross-review, rework and adjudication jointly determine the result."} image="/photos/review.jpg" />
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
    ["/meridian/v4/zh/lidar.jpg", "方向概念", "虚拟场景与仿真数据", "把真实采集难覆盖的状态、稀有事件与边界条件引入可控的数据生产，再以人类语义复核约束真实性。"],
    ["/meridian/v4/zh/prefer.jpg", "方向概念", "合成数据的人类验证层", "生成并不等于可用。覆盖度、难度、去重、事实与专业判断需要进入明确的确认流程。"],
    ["/meridian/v4/zh/agent.jpg", "方向概念", "Benchmark 与持续评测", "让挑战集、量规、评委和失败分类随模型版本持续演进，形成可比较的能力基线。"],
  ] : [
    ["/meridian/v4/en/lidar.jpg", "DIRECTIONAL CONCEPT", "Virtual scenes and simulation data", "Bring rare states and edge conditions into controlled production, with human semantic review where realism matters."],
    ["/meridian/v4/en/prefer.jpg", "DIRECTIONAL CONCEPT", "A human validation layer for synthetic data", "Generation does not equal usability. Coverage, difficulty, de-duplication, factuality and expert judgment need explicit confirmation."],
    ["/meridian/v4/en/agent.jpg", "DIRECTIONAL CONCEPT", "Benchmarks and continuous evaluation", "Evolve challenge sets, rubrics, judges and failure taxonomies with model versions to maintain a comparable capability baseline."],
  ];
  return (
    <main className="future-page">
      <PageHero eyebrow={t.hero.eyebrow} title={t.hero.title} lead={t.hero.lead} tag={t.hero.tag} />
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
      <EvidenceGallery index="02" eyebrow={zh ? "未来数据形态" : "FUTURE DATA MODES"} title={zh ? "从采集更多走向构造更难的问题" : "Move from collecting more to constructing harder problems"} lead={zh ? "未来竞争力来自场景覆盖、合成验证与持续 Benchmark 的组合，而不是单一数据类型或一次性交付。" : "Future advantage comes from combining scene coverage, synthetic validation and continuous benchmarks—not one data type or one-off delivery."} items={directionSignals} />
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
      <CTA route={route} />
    </main>
  );
}

function AboutPage({ route }) {
  const { lang } = route;
  const zh = lang === "zh";
  const evidence = zh ? [
    ["/photos/campus.jpg", "人才网络", "高校关系只是起点", "真正进入项目仍需通过任务相关的资格筛选、试标与版本化培训。"],
    ["/photos/seminar.jpg", "校准机制", "专业判断需要形成共同口径", "领域人员、运营与 QA 通过样本、量规和边界案例建立可执行标准。"],
    ["/brand/ops-floor-v5.png", "托管运营", "多种任务在同一交付纪律下运行", "项目负责人统一管理分配、答疑、质检、返修与批次验收。"],
  ] : [
    ["/photos/campus.jpg", "TALENT NETWORK", "University relationships are a starting point", "Project entry still depends on task-specific qualification, trial work and versioned training."],
    ["/photos/seminar.jpg", "CALIBRATION", "Professional judgment needs a shared standard", "Domain contributors, operations and QA align through samples, rubrics and edge cases."],
    ["/brand/ops-floor-v5.png", "MANAGED OPERATIONS", "Different workflows run under one delivery discipline", "A delivery lead manages assignment, clarification, QA, rework and batch acceptance."],
  ];
  return (
    <main>
      <PageHero eyebrow={zh ? "公司 / COMPANY" : "COMPANY"} title={zh ? "把中国分层人才网络组织成人类智能计算能力" : "A layered China talent network organized as Human Compute"} lead={zh ? "子午象限连接高校人才、领域专家与 AI 企业真实任务；AxisX 是面向国际客户的交付界面。两者共享同一套人才、运营与质量体系。" : "Our China operation connects university talent and domain specialists with real AI industry work. AxisX is the delivery interface for international clients, backed by the same talent, operations and quality system."} image="/photos/campus.jpg" />
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

function ContactPage({ route }) {
  const { lang } = route;
  const zh = lang === "zh";
  const subject = encodeURIComponent(zh ? "[子午象限] 项目合作咨询" : "[AxisX] Project enquiry");
  const body = encodeURIComponent(zh
    ? "您好，\n\n公司/团队：\n项目领域与任务类型：\n预计体量与周期：\n现有 SOP / 样本 / 验收标准：\n其他说明：\n\n如有材料，请直接作为附件添加到本邮件。"
    : "Hello,\n\nCompany / team:\nDomain and task type:\nExpected volume and timeline:\nCurrent SOP / samples / acceptance criteria:\nOther notes:\n\nPlease attach any relevant materials directly to this email.");
  const emailHref = `mailto:${SITE_EMAIL}?subject=${subject}&body=${body}`;
  return (
    <main>
      <PageHero eyebrow={zh ? "项目需求 / CONTACT" : "PROJECT BRIEF"} title={zh ? "先让我们看一个真实任务" : "Start with a real task"} lead={zh ? "发送 SOP、样本、预期体量与验收标准。我们将在 24 小时内返回初步可行性判断与下一步建议。" : "Share an SOP, samples, expected volume and acceptance criteria. We will return an initial feasibility view and next step within 24 hours."} image="/brand/documents-desk.jpg" />
      <section className="contact-section">
        <aside className="contact-aside">
          <Eyebrow index="01">WHAT TO SEND</Eyebrow>
          <h2>{zh ? "有用的项目信息" : "Useful project information"}</h2>
          {(zh ? ["现行 SOP 与边界案例", "领域、任务类型与语言", "试标和量产体量", "交付周期与并发要求", "金标、量规或验收阈值", "希望的商务计价方式"] : ["Current SOP and edge cases", "Domain, task type and language", "Trial and production volume", "Timeline and concurrency", "Gold examples, rubric or threshold", "Preferred commercial model"]).map((item, i) => <div className="contact-list-item" key={item}><span>0{i + 1}</span><p>{item}</p></div>)}
          <div className="direct-email"><small>{zh ? "直接邮件" : "Direct email"}</small><a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a></div>
        </aside>
        <div className="email-panel">
          <div className="form-head"><span>DIRECT / EMAIL</span><h2>{zh ? "直接发送项目邮件" : "Send a project email"}</h2><p>{zh ? "网站不收集、不上传也不留存您的项目信息。点击后将打开您的邮件客户端，并自动填入建议的信息结构。" : "The site does not collect, upload or retain your project information. The button opens your email client with a suggested brief structure."}</p></div>
          <div className="email-panel-body">
            <small>{zh ? "收件邮箱" : "TO"}</small>
            <a className="email-address" href={emailHref}>{SITE_EMAIL}</a>
            <p>{zh ? "建议在邮件中写明公司或团队、任务类型、预计体量、交付周期和验收标准；SOP 与样本可直接添加为邮件附件。" : "Include your company or team, task type, expected volume, timeline and acceptance criteria. SOPs and samples can be attached directly."}</p>
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

function App() {
  const route = useRoute();
  const { lang, path } = route;
  useMotionSystem(`${lang}:${path}`);
  const page = useMemo(() => {
    if (path === "/") return <HomePage route={route} />;
    if (path === "/services") return <ServicesPage route={route} />;
    if (path === "/delivery") return <DeliveryPage route={route} />;
    if (path === "/work") return <WorkPage route={route} />;
    if (path.startsWith("/work/")) return <WorkDetailPage route={route} slug={path.slice(6)} />;
    if (path === "/meridian") return <MeridianPage route={route} />;
    if (path === "/quality") return <QualityPage route={route} />;
    if (path === "/future") return <FuturePage route={route} />;
    if (path === "/about") return <AboutPage route={route} />;
    if (path === "/contact") return <ContactPage route={route} />;
    return <NotFound route={route} />;
  }, [lang, path]);

  useEffect(() => {
    const zh = lang === "zh";
    document.documentElement.lang = zh ? "zh-CN" : "en";
    document.title = zh ? "子午象限 · AxisX — AI 数据与评测交付" : "AxisX — Expert Data & Evaluation Delivery";
  }, [lang, path]);

  return <><Header route={route} /><div key={`${lang}:${path}`} className="route-signal" aria-hidden="true" />{page}<Footer route={route} /></>;
}

createRoot(document.getElementById("root")).render(<App />);
