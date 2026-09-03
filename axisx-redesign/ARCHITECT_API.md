# Project Architect：无数据库与模型接口说明

V16 默认使用浏览器端规则化规划模型，不调用外部接口，不需要账户、数据库或文件存储。用户输入只存在于当前 React 页面状态，刷新后清除。

## 默认静态模式

无需增加任何配置：

```bash
npm ci
npm run build
```

生成的 `dist/` 仍然是标准静态网站，可以直接部署到 `/ai/data/`。Project Architect 会根据领域、项目类型、模型阶段、合作尺度和用户填写的能力边界生成项目蓝图。

## 接入真实模型

真实模型同样不要求数据库，但必须通过独立的安全 API 调用。不要把模型 API Key 写入 Vite 环境变量、React 源码或浏览器请求头。

前端仅配置无密钥的服务端地址：

```bash
VITE_ARCHITECT_API_URL=https://api.example.com/axisx/architect npm run build
```

接口接收：

```json
{
  "lang": "zh",
  "domain": "agent",
  "program": "trajectory",
  "phase": "improvement",
  "scale": "pilot",
  "boundary": "希望验证的能力边界"
}
```

接口应返回与 `src/architect.js` 的 `buildBlueprint()` 相同结构，至少包含：

```json
{
  "blueprint": {
    "title": "项目名称",
    "summary": "能力边界",
    "system": "推荐系统",
    "intent": "项目意图",
    "phase": "阶段策略",
    "taskUnit": "任务单元",
    "experts": ["角色 1"],
    "workflow": ["步骤 1", "步骤 2"],
    "evidence": ["证据 1"],
    "acceptance": ["验收信号 1"],
    "risks": ["风险 1"],
    "pilot": {
      "label": "方法试点",
      "volume": "代表性范围",
      "structure": "试点结构",
      "return": "首轮返回"
    }
  }
}
```

如果模型接口失败、超时或返回结构不完整，前端会自动回退到本地规划模型，页面不会中断。

## 服务端要求

- API Key 只保存在服务器端或 Serverless Secret 中。
- 允许来自正式官网域名的 CORS 请求，不建议开放任意来源。
- 设置请求频率限制、输入长度限制和超时。
- 默认不记录完整项目描述；如需日志，只记录请求状态、耗时和匿名错误信息。
- 医学、法律及客户内部材料应在进入模型前执行脱敏和项目级策略检查。
- 在页面公开声明实际使用的模型供应商、数据处理区域与留存策略。
- 不建议公开版本直接开放文件上传；文件工作区应在后续带身份验证的独立产品中建设。

当前 Nginx 服务器仍只托管静态网站。真实模型接口可以独立部署在 Serverless、Worker 或已有 API 服务上，不需要改变 `/ai/data/` 的 SPA 路由结构。
