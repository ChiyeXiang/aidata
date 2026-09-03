export const ARCHITECT_OPTIONS = {
  en: {
    domains: [
      ["finance", "Finance", "Source-grounded risk and research"],
      ["legal", "Legal", "Citation, conflict and jurisdiction"],
      ["medical", "Medical", "Evidence abstraction and safety"],
      ["stem", "STEM", "Original expert challenge authoring"],
      ["agent", "Agent", "Trajectory reliability and recovery"],
      ["mle", "MLE / MLS", "Reproducible experiment evaluation"],
      ["program", "ProgramBench", "Behavioral program reconstruction"],
      ["swe", "FrontierSWE", "Repository-level engineering"],
      ["geology", "Geoscience", "Multi-source interpretation"],
      ["education", "Education", "Assessment and learning diagnosis"],
    ],
    programs: [
      ["challenge", "Challenge set", "Discover a capability boundary with original, adversarial or hard tasks."],
      ["golden", "Expert golden set", "Create source-grounded references, rubrics and adjudicated answers."],
      ["trajectory", "Post-training traces", "Capture process evidence, failures, critiques and corrected paths."],
      ["executable", "Executable evaluation", "Evaluate outputs inside a controlled environment with verifiers."],
    ],
    phases: [["diagnose", "Capability diagnosis"], ["prerelease", "Pre-release validation"], ["improvement", "Post-training improvement"]],
    scales: [["pilot", "Method pilot"], ["validation", "Validation release"], ["managed", "Managed program"]],
  },
  zh: {
    domains: [
      ["finance", "金融", "有来源的风控与研究推理"],
      ["legal", "法律", "引用、冲突与法域判断"],
      ["medical", "医学", "证据抽象与安全边界"],
      ["stem", "STEM", "专家原创高难度出题"],
      ["agent", "Agent", "轨迹可靠性与失败恢复"],
      ["mle", "MLE / MLS", "可复现实验评测"],
      ["program", "ProgramBench", "行为级程序重建"],
      ["swe", "FrontierSWE", "仓库级软件工程"],
      ["geology", "地学", "多源资料解释"],
      ["education", "教育", "测评与学习诊断"],
    ],
    programs: [
      ["challenge", "Challenge Set", "通过原创、对抗或高难度任务定位能力边界。"],
      ["golden", "专家 Golden Set", "建立有来源的参考答案、量规与裁决结果。"],
      ["trajectory", "后训练轨迹", "采集过程证据、失败、批评与修正路径。"],
      ["executable", "可执行评测", "在受控环境和验证器中检验模型结果。"],
    ],
    phases: [["diagnose", "能力诊断"], ["prerelease", "发布前验证"], ["improvement", "后训练改进"]],
    scales: [["pilot", "方法试点"], ["validation", "验证版本"], ["managed", "托管项目"]],
  },
};

const DOMAINS = {
  finance: {
    code: "FIN",
    en: {
      name: "Financial reasoning",
      boundary: "Reason across long financial materials while preserving temporal scope, policy version, evidence spans and uncertainty.",
      unit: "One decision case combining controlled financial material, a bounded question, evidence spans, counter-evidence and a reviewable judgment.",
      experts: ["Finance-qualified task author", "Evidence and protocol reviewer", "Independent risk adjudicator"],
      evidence: ["Answer and source spans", "Temporal and policy-version map", "Counter-evidence and uncertainty boundary", "High-risk adjudication record"],
      acceptance: ["Evidence-span precision", "Unsupported-claim rate", "Independent expert agreement", "Closure of high-risk disagreement"],
      risks: ["Temporal leakage", "Policy-version drift", "Unsupported inference", "Ambiguous risk boundary"],
    },
    zh: {
      name: "金融推理",
      boundary: "在长篇金融材料中完成推理，同时保留时间边界、政策版本、证据跨度和不确定性。",
      unit: "一个决策案例，由受控金融材料、边界明确的问题、证据跨度、反证和可复核判断组成。",
      experts: ["具备金融背景的任务作者", "证据与协议复核员", "独立风险裁决专家"],
      evidence: ["答案与来源跨度", "时间与政策版本映射", "反证与不确定边界", "高风险裁决记录"],
      acceptance: ["证据跨度准确率", "无依据结论比例", "独立专家一致性", "高风险分歧闭环率"],
      risks: ["时间信息泄漏", "政策版本漂移", "无依据推断", "风险边界不清"],
    },
  },
  legal: {
    code: "LGL",
    en: {
      name: "Legal reasoning",
      boundary: "Resolve long-document clauses and cross-source conflicts without losing jurisdiction, citation or version context.",
      unit: "A sanitized legal issue with governing materials, clause graph, citation spans, conflict class and specialist ruling.",
      experts: ["Jurisdiction-matched legal author", "Citation and version reviewer", "Senior legal adjudicator"],
      evidence: ["Clause and authority citations", "Jurisdiction and version record", "Conflict classification", "Adjudication rationale"],
      acceptance: ["Citation validity", "Issue coverage", "Jurisdictional consistency", "Ruling reproducibility"],
      risks: ["Jurisdiction mismatch", "Superseded authority", "Privilege or confidentiality exposure", "Overstated legal conclusion"],
    },
    zh: {
      name: "法律推理",
      boundary: "处理长文档条款与跨来源冲突，同时保留法域、引用和文本版本语境。",
      unit: "一个脱敏法律问题，由适用材料、条款关系、引用跨度、冲突类型和专业裁决组成。",
      experts: ["法域匹配的法律作者", "引用与版本复核员", "资深法律裁决专家"],
      evidence: ["条款与权威来源引用", "法域和版本记录", "冲突分类", "裁决理由"],
      acceptance: ["引用有效性", "问题覆盖度", "法域一致性", "裁决可复现性"],
      risks: ["法域错配", "失效权威来源", "保密信息暴露", "法律结论过度延伸"],
    },
  },
  medical: {
    code: "MED",
    en: {
      name: "Medical evidence",
      boundary: "Synthesize de-identified medical evidence while preserving population limits, evidence grade and escalation rules.",
      unit: "A de-identified evidence question with PICO structure, graded sources, bounded finding and safety-review state.",
      experts: ["Domain-matched medical author", "Evidence-grade reviewer", "Independent medical safety reviewer"],
      evidence: ["PICO map", "Source provenance and grade", "Population limitations", "Dual-review and escalation record"],
      acceptance: ["Source-grounding rate", "Population-boundary accuracy", "Medical reviewer agreement", "Safety escalation recall"],
      risks: ["Personal data exposure", "Unsupported clinical inference", "Population mismatch", "Missed high-risk escalation"],
    },
    zh: {
      name: "医学证据",
      boundary: "在去标识化前提下综合医学证据，同时保留人群限制、证据等级和升级规则。",
      unit: "一个去标识化证据问题，由 PICO 结构、分级来源、边界化结论和安全复核状态组成。",
      experts: ["专科匹配的医学作者", "证据等级复核员", "独立医学安全复核员"],
      evidence: ["PICO 映射", "来源与证据等级", "适用人群限制", "双评与升级记录"],
      acceptance: ["来源支撑率", "人群边界准确率", "医学复核一致性", "安全升级召回率"],
      risks: ["个人信息暴露", "无依据临床推断", "适用人群错配", "高风险升级遗漏"],
    },
  },
  stem: {
    code: "STM",
    en: {
      name: "Original STEM challenges",
      boundary: "Construct expert-authored problems that remain original, solvable, difficult and independently verifiable.",
      unit: "One unpublished problem with capability target, reference derivation, answer form, rubric, verifier and independent solve.",
      experts: ["Advanced-domain problem author", "Independent expert solver", "Difficulty and contamination reviewer"],
      evidence: ["Reference derivation", "Answer-uniqueness check", "Programmatic or symbolic verifier", "Model-pilot distribution"],
      acceptance: ["Independent solvability", "Verifier agreement", "Target difficulty band", "Searchability and contamination screen"],
      risks: ["Unsolvable prompt", "Ambiguous answer", "Benchmark contamination", "Difficulty collapse"],
    },
    zh: {
      name: "STEM 原创难题",
      boundary: "构造专家原创、可解、足够困难且能够独立验证的问题。",
      unit: "一道未公开题目，包含能力目标、参考推导、答案形式、评分量规、验证器和独立复算。",
      experts: ["高阶学科出题专家", "独立复算专家", "难度与污染风险复核员"],
      evidence: ["参考推导", "答案唯一性检查", "程序化或符号验证器", "模型试跑分布"],
      acceptance: ["独立可解性", "验证器一致性", "目标难度区间", "可检索性与污染筛查"],
      risks: ["题目不可解", "答案存在歧义", "Benchmark 污染", "难度失效"],
    },
  },
  agent: {
    code: "AGT",
    en: {
      name: "Agent trajectories",
      boundary: "Evaluate long-horizon tool use through plans, actions, observations, recovery and stopping behavior—not final answers alone.",
      unit: "One replayable agent run with environment state, node-level trace, failure label, corrected path and final-state evidence.",
      experts: ["Task and environment designer", "Node-level trajectory reviewer", "Failure and recovery adjudicator"],
      evidence: ["Environment snapshot", "Plan-action-observation trace", "Failure root cause", "Corrected or preferred trajectory"],
      acceptance: ["Replay success", "Tool-call validity", "Failure-label agreement", "Recovery-path improvement"],
      risks: ["Non-replayable environment", "Hidden state", "Outcome-only scoring", "Spurious recovery"],
    },
    zh: {
      name: "Agent 轨迹",
      boundary: "通过计划、行动、观察、恢复和停止行为评测长程工具使用，而不只判断最终答案。",
      unit: "一次可复跑的 Agent 运行，包含环境状态、节点级轨迹、失败标签、修正路径和最终状态证据。",
      experts: ["任务与环境设计人员", "节点级轨迹复核员", "失败与恢复裁决人员"],
      evidence: ["环境快照", "计划—行动—观察轨迹", "失败根因", "修正或偏好轨迹"],
      acceptance: ["环境复跑成功率", "工具调用有效性", "失败标签一致性", "恢复路径改进幅度"],
      risks: ["环境不可复跑", "隐藏状态缺失", "只看结果评分", "虚假恢复"],
    },
  },
  mle: {
    code: "MLE",
    en: {
      name: "MLE / MLS evaluation",
      boundary: "Judge machine-learning work through reproducible environments, experiment evidence, artifacts and scientific validity.",
      unit: "One frozen task environment with dataset version, experiment plan, run logs, artifacts, metrics and an independent rerun.",
      experts: ["ML task designer", "Experiment and artifact reviewer", "Independent reproduction reviewer"],
      evidence: ["Environment and data lock", "Experiment and ablation logs", "Artifact and metric lineage", "Independent rerun result"],
      acceptance: ["Environment reproducibility", "Metric correctness", "Artifact completeness", "Independent rerun tolerance"],
      risks: ["Environment drift", "Data leakage", "Metric gaming", "Irreproducible gain"],
    },
    zh: {
      name: "MLE / MLS 评测",
      boundary: "通过可复现环境、实验依据、产物和科学有效性判断机器学习工作。",
      unit: "一个固化任务环境，包含数据版本、实验计划、运行日志、产物、指标和独立复跑。",
      experts: ["ML 任务设计人员", "实验与产物复核员", "独立复现实验人员"],
      evidence: ["环境与数据锁定", "实验和消融日志", "产物与指标血缘", "独立复跑结果"],
      acceptance: ["环境可复现性", "指标正确性", "产物完整性", "独立复跑误差范围"],
      risks: ["环境漂移", "数据泄漏", "指标投机", "增益不可复现"],
    },
  },
  program: {
    code: "PRG",
    en: {
      name: "Program behavior",
      boundary: "Reconstruct software behavior from specifications and tests rather than imitate surface code patterns.",
      unit: "One behavioral specification with candidate implementation, isolated runtime, hidden tests and equivalence evidence.",
      experts: ["Behavior-specification author", "Implementation reviewer", "Hidden-test and equivalence adjudicator"],
      evidence: ["Behavioral contract", "Runtime and dependency lock", "Hidden-test results", "Error and state equivalence trace"],
      acceptance: ["Behavioral equivalence", "Hidden-test pass rate", "Error-contract fidelity", "State consistency"],
      risks: ["Overfit to visible tests", "Dependency leakage", "Incomplete error behavior", "False equivalence"],
    },
    zh: {
      name: "程序行为重建",
      boundary: "基于规格和测试重建软件行为，而不是模仿表层代码模式。",
      unit: "一个行为规格，包含候选实现、隔离运行时、隐藏测试和等价性证据。",
      experts: ["行为规格作者", "实现复核员", "隐藏测试与等价性裁决员"],
      evidence: ["行为契约", "运行时与依赖锁定", "隐藏测试结果", "错误与状态等价轨迹"],
      acceptance: ["行为等价性", "隐藏测试通过率", "错误契约一致性", "状态一致性"],
      risks: ["过拟合可见测试", "依赖泄漏", "错误行为不完整", "虚假等价"],
    },
  },
  swe: {
    code: "SWE",
    en: {
      name: "Repository engineering",
      boundary: "Evaluate long-horizon engineering through issue understanding, repository navigation, patches, tests and runtime effects.",
      unit: "One repository issue with frozen commit, environment, expected behavior, patch, CI evidence and reviewable engineering trajectory.",
      experts: ["Repository task author", "Software-engineering reviewer", "CI and behavior adjudicator"],
      evidence: ["Issue-to-code map", "Patch and reasoning trace", "Unit and regression tests", "CI and runtime evidence"],
      acceptance: ["Issue resolution", "Regression safety", "Test validity", "Repository-state reproducibility"],
      risks: ["Repository leakage", "Test overfitting", "Collateral regression", "Non-reproducible environment"],
    },
    zh: {
      name: "仓库级软件工程",
      boundary: "通过问题理解、仓库定位、补丁、测试和运行影响评测长程工程能力。",
      unit: "一个仓库问题，包含固化提交、环境、预期行为、补丁、CI 证据和可复核工程轨迹。",
      experts: ["仓库任务作者", "软件工程复核员", "CI 与行为裁决员"],
      evidence: ["问题—代码映射", "补丁与推理轨迹", "单元和回归测试", "CI 与运行证据"],
      acceptance: ["问题解决程度", "回归安全性", "测试有效性", "仓库状态可复现性"],
      risks: ["仓库信息泄漏", "测试过拟合", "连带回归", "环境不可复现"],
    },
  },
  geology: {
    code: "GEO",
    en: {
      name: "Geoscience interpretation",
      boundary: "Reconcile logs, cores, maps and reports into an interpretation that preserves source conflict and uncertainty.",
      unit: "One sanitized interpretation package with aligned sources, structural hypothesis, interval decisions and confidence record.",
      experts: ["Geoscience interpreter", "Cross-source correlation reviewer", "Senior uncertainty adjudicator"],
      evidence: ["Source alignment", "Interval and structure interpretation", "Conflict register", "Confidence and uncertainty map"],
      acceptance: ["Cross-source consistency", "Interpretation coverage", "Uncertainty calibration", "Independent specialist agreement"],
      risks: ["Source misalignment", "Overconfident interpolation", "Missing conflict", "Specialist disagreement"],
    },
    zh: {
      name: "地学解释",
      boundary: "对齐测井、岩芯、图件和报告，并保留来源冲突与不确定性。",
      unit: "一个脱敏解释资料包，包含多源对齐、构造假设、层段判断和置信记录。",
      experts: ["地学解释专家", "跨来源关联复核员", "资深不确定性裁决专家"],
      evidence: ["来源对齐", "层段与构造解释", "冲突记录", "置信度与不确定性图谱"],
      acceptance: ["跨来源一致性", "解释覆盖度", "不确定性校准", "独立专家一致性"],
      risks: ["来源错配", "过度插值", "冲突遗漏", "专家意见分歧"],
    },
  },
  education: {
    code: "EDU",
    en: {
      name: "Education assessment",
      boundary: "Measure concept mastery and reasoning quality with curriculum-grounded, explainable and bias-reviewed tasks.",
      unit: "One curriculum-aligned item with concept dependency, reference solution, step rubric, misconception model and calibration evidence.",
      experts: ["Subject-matter item author", "Independent teacher solver", "Assessment and bias reviewer"],
      evidence: ["Curriculum and concept map", "Reference and step rubric", "Misconception taxonomy", "Difficulty and discrimination result"],
      acceptance: ["Curriculum alignment", "Step-rubric agreement", "Difficulty discrimination", "Bias-screen outcome"],
      risks: ["Curriculum mismatch", "Low discrimination", "Rubric ambiguity", "Group bias"],
    },
    zh: {
      name: "教育测评",
      boundary: "使用课程对齐、可解释且经过偏差复核的任务，衡量知识掌握与推理质量。",
      unit: "一道课程对齐题项，包含知识依赖、参考解、步骤量规、误区模型和校准证据。",
      experts: ["学科题项作者", "独立教师复算员", "测评与偏差复核员"],
      evidence: ["课程与知识点映射", "参考解与步骤量规", "典型误区分类", "难度与区分度结果"],
      acceptance: ["课程对齐度", "步骤量规一致性", "难度区分度", "偏差筛查结果"],
      risks: ["课程错配", "区分度不足", "量规歧义", "群体偏差"],
    },
  },
};

const PROGRAMS = {
  challenge: {
    en: { name: "Challenge-set program", system: "Capability discovery and adversarial evaluation", intent: "Expose a defined capability boundary with original tasks and a controlled difficulty distribution.", artifacts: ["Capability taxonomy", "Original task set", "Difficulty and failure analysis"] },
    zh: { name: "Challenge Set 项目", system: "能力发现与对抗评测", intent: "使用原创任务和受控难度分布暴露明确的模型能力边界。", artifacts: ["能力分类体系", "原创任务集", "难度与失败分析"] },
  },
  golden: {
    en: { name: "Expert golden-set program", system: "Expert knowledge system", intent: "Establish a high-confidence reference layer for training, evaluation and adjudication.", artifacts: ["Expert references", "Scoring rubric", "Adjudication guide"] },
    zh: { name: "专家 Golden Set 项目", system: "专家知识系统", intent: "为训练、评测和裁决建立高置信度参考层。", artifacts: ["专家参考答案", "评分量规", "裁决指南"] },
  },
  trajectory: {
    en: { name: "Trajectory and post-training program", system: "Agent and post-training data", intent: "Convert process failures, critiques and corrected behavior into trainable evidence.", artifacts: ["Node-level trajectories", "Failure taxonomy", "Critiques and corrected paths"] },
    zh: { name: "轨迹与后训练项目", system: "Agent 与后训练数据", intent: "把过程失败、批评和修正行为转化为可训练证据。", artifacts: ["节点级轨迹", "失败分类体系", "批评与修正路径"] },
  },
  executable: {
    en: { name: "Executable evaluation program", system: "Executable benchmark engineering", intent: "Test capability inside a reproducible environment with explicit verifiers and runtime evidence.", artifacts: ["Frozen environment", "Executable verifier", "Run and release report"] },
    zh: { name: "可执行评测项目", system: "可执行 Benchmark 工程", intent: "在可复现环境中使用明确验证器和运行证据检验模型能力。", artifacts: ["固化环境", "可执行验证器", "运行与版本报告"] },
  },
};

const PHASES = {
  diagnose: {
    en: "Begin with broad failure discovery, then lock the taxonomy only after the first calibration run.",
    zh: "先进行较宽范围的失败发现，完成首轮校准后再固化分类体系。",
  },
  prerelease: {
    en: "Freeze tasks, environment and acceptance gates before the candidate-model run; keep the holdout blind.",
    zh: "在候选模型运行前固化任务、环境与验收门禁，并保持留出集盲测。",
  },
  improvement: {
    en: "Link each accepted failure class to targeted data, corrected behavior and a regression evaluation release.",
    zh: "把每个确认的失败类型连接到定向数据、修正行为和回归评测版本。",
  },
};

const SCALES = {
  pilot: {
    en: { label: "Method pilot", volume: "50–120 representative task units", structure: "One capability boundary · one calibration cohort · one acceptance review", return: "Specification, calibration sample, risk register and scale/no-scale decision" },
    zh: { label: "方法试点", volume: "50–120 个代表性任务单元", structure: "一个能力边界 · 一组校准队列 · 一次验收复盘", return: "任务规格、校准样本、风险清单和是否扩量的判断" },
  },
  validation: {
    en: { label: "Validation release", volume: "300–800 task units across 2–4 controlled strata", structure: "Versioned tasks · blind holdout · independent review · release report", return: "Accepted release, failure distribution and model-comparison evidence" },
    zh: { label: "验证版本", volume: "300–800 个任务单元，覆盖 2–4 个受控分层", structure: "版本化任务 · 盲测留出集 · 独立复核 · 版本报告", return: "验收版本、失败分布和模型比较证据" },
  },
  managed: {
    en: { label: "Managed program", volume: "Versioned batches sized after pilot acceptance", structure: "Dedicated lead · qualified contributor pool · continuous QA · release cadence", return: "Managed production, evidence ledger and recurring benchmark updates" },
    zh: { label: "托管项目", volume: "试点验收后确定版本化批次规模", structure: "专属负责人 · 资格人才池 · 持续质检 · 版本节奏", return: "托管生产、证据台账和持续 Benchmark 更新" },
  },
};

const WORKFLOW = {
  en: ["Define capability boundary and unacceptable outcomes", "Create task specification, evidence schema and edge cases", "Qualify authors, reviewers and verification roles", "Run calibration and revise rules before scaling", "Operate blind review, rerun and adjudication gates", "Return accepted assets, evidence ledger and release findings"],
  zh: ["界定能力边界与不可接受结果", "建立任务规格、证据结构和边界案例", "筛选作者、复核和验证角色", "运行校准批次并在扩量前修订规则", "执行盲审、复跑与裁决门禁", "交付验收资产、证据台账与版本结论"],
};

export function buildBlueprint(lang, input) {
  const domainRoot = DOMAINS[input.domain] || DOMAINS.stem;
  const domain = domainRoot[lang];
  const program = (PROGRAMS[input.program] || PROGRAMS.challenge)[lang];
  const scale = (SCALES[input.scale] || SCALES.pilot)[lang];
  const phase = PHASES[input.phase]?.[lang] || PHASES.diagnose[lang];
  const note = String(input.boundary || "").trim();
  const day = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return {
    id: `AX-${domainRoot.code}-${day}`,
    title: `${domain.name} / ${program.name}`,
    summary: note || domain.boundary,
    system: program.system,
    intent: program.intent,
    phase,
    taskUnit: domain.unit,
    experts: domain.experts,
    workflow: WORKFLOW[lang],
    evidence: [...domain.evidence, ...program.artifacts],
    acceptance: domain.acceptance,
    risks: domain.risks,
    pilot: scale,
    disclaimer: lang === "zh"
      ? "本蓝图由浏览器内的规则化规划模型生成，只用于初步讨论。任务量、周期、人员配置、合规要求和验收阈值需在查看实际样本后确认。网站不会上传或保存本次输入。"
      : "This blueprint is generated by a browser-side rules-based planning model for initial discussion only. Volume, timing, staffing, controls and acceptance thresholds require confirmation against real samples. The site does not upload or retain this input.",
  };
}
