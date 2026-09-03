# AxisX 官网 V16 完整交付

本包同时包含可继续开发的 Vite + React 源码，以及可直接上传到 Nginx 的静态网站。

## 直接上线

将：

```text
axisx-deploy-v16/site/
```

内的全部内容上传到：

```text
/var/www/ziwuxx.com/ai/data/
```

再参考 `axisx-deploy-v16/nginx.example.conf` 配置 SPA fallback。

## 继续开发

进入：

```text
axisx-redesign/
```

执行：

```bash
npm ci
npm run dev
npm run build
npm run preview
```

构建结果位于 `axisx-redesign/dist/`。

## V16 重点

- 默认英文，右上角切换中文。
- 桌面主导航收敛为能力、案例、Meridian、Workflow Lab 与公司；数据方法、交付、架构、质量、Trust 与 Roadmap 进入二级导航。
- 首页保留可解释的人才与院校网络数字及统计口径。
- 首页新增面向模型研究、数据运营与采购负责人的三个角色入口。
- 新增中英文数据方法页面，解释能力增量、任务有效性、过程证据、复现与裁决方法。
- 金融、法律、医学、STEM、Agent、MLE / MLS、ProgramBench、FrontierSWE、地学与教育案例及视频。
- STEM 与 Agent 增加旗舰案例档案，展示执行步骤、返修门槛、交付组成与模型工作流用途。
- 四套交互 Workflow Lab 增加版本记录、独立复核分歧和裁决；Agent 可切换原始/修正轨迹，SWE 展示连续测试日志。
- 移动端 Workflow Lab 以“任务 / 步骤 / QA”三层切换，避免三个长面板连续堆叠。
- 十个代表案例统一为能力缺口、评测对象、任务设计、代表规模、QA 协议、证据包与公开边界七项采购评估结构。
- 新增 Trust 页面，区分公开站点机制与项目级运营控制。
- Workflow Lab 全部使用明确标注的虚构示例数据，不冒充客户项目或实时线上日志。
- 证据编号仅作为追溯字段展示，不可点击展开材料；站内不提供案例、蓝图或材料的复制、打印、下载与导出入口。
- 页面不使用人物办公场景、装饰性机器人图片或未经许可的合作 Logo。
- 所有视频静音自动循环，没有播放器控件。
- 纯静态 Vite + React，无业务数据库、认证系统或 SSR 服务。

详细技术说明见 `axisx-redesign/给技术人员.md`。
