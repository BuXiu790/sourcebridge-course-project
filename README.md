# SourceBridge Course Release v1.0

SourceBridge 是一个面向“海外买家从中国采购”场景的跨境采购协作平台，也是一个基于现代前端框架完成的课程期末项目。项目以 Amazon 卖家的采购流程为背景，将采购需求、匿名报价比较、到岸成本估算、打样、生产、质检与运输进度集中在一个可追踪的工作流中。

在线演示：[https://sourcebridge-sourcing-demo.buxiu790.chatgpt.site](https://sourcebridge-sourcing-demo.buxiu790.chatgpt.site)

Public Course Demo：[https://sourcebridge-sourcing-demo.buxiu790.chatgpt.site/demo](https://sourcebridge-sourcing-demo.buxiu790.chatgpt.site/demo)

> 网络提示：演示站点托管在 `chatgpt.site`，部分国内校园网或地区网络可能无法直接访问。遇到连接问题时可更换网络，课程源码、文档和测试证据仍可直接在本仓库查看。

> SourceBridge 是独立的课程原型，与 Amazon 不存在隶属、合作或背书关系。

## 项目背景与解决的问题

传统跨境采购经常依赖邮件、聊天软件和分散表格，容易出现需求版本不一致、报价口径不同、成本遗漏和履约进度不透明。SourceBridge 用一个 RFQ（Request for Quotation）作为业务主线，让买家和采购运营人员围绕同一份结构化数据协作。

## 核心功能

- 邮箱密码登录、退出和会话保持
- `buyer`、`operator`、`admin` 三种角色及服务端权限控制
- Buyer Dashboard 与真实用户 RFQ 数据
- 四步骤采购需求表单、字段校验和错误反馈
- 匿名供应商报价比较与报价选择
- Demo 成本、利润和利润率动态估算
- 打样、生产、质检、运输履约时间线
- 供应商、报价、RFQ 状态和用户角色管理后台
- Supabase PostgreSQL 持久化与 Row Level Security 数据隔离
- 390px 手机端和 1440px 桌面端响应式布局
- 加载、空状态、错误提示和键盘焦点样式

## 技术栈

- Next.js 16、App Router、React 19
- TypeScript 5
- Tailwind CSS 4
- Supabase Auth、PostgreSQL、RLS
- Vinext / Vite 构建与 OpenAI Sites 托管
- Node.js Test Runner、ESLint

Supabase PostgreSQL、MySQL 和 SQLite 都属于关系型数据库，均使用表、字段、主键、外键和 SQL 表达数据关系。选择 PostgreSQL/Supabase 是因为本项目同时需要托管数据库、邮箱认证、会话能力、触发器和数据库级 RLS；相比本地 SQLite 更适合多用户公网应用，相比自行维护 MySQL 服务减少了课程项目的运维工作。

## 页面与角色

- **Buyer**：提交并查看自己的 RFQ、报价、附件和履约时间线，可以选择属于自己 RFQ 的报价。
- **Operator**：查看和处理全部 RFQ，维护供应商、报价、状态和时间线，但不能修改用户角色。
- **Admin**：拥有 Operator 能力，并可通过受保护的后台接口修改已注册用户角色。

| 页面 | 访问权限 | 说明 |
| --- | --- | --- |
| `/` | 匿名 | 首页、工作流程、能力和明确标注的原型目标 |
| `/demo` | 匿名 | 只读课程 Demo；浏览器内报价切换不写数据库 |
| `/login` | 匿名 | 课程演示账号邮箱密码登录 |
| `/signup` | 匿名 | 说明公开注册暂未开放，不渲染注册表单 |
| `/forgot-password` | 匿名 | Supabase 密码找回入口 |
| `/dashboard` | 已登录 | 当前用户的采购需求工作台 |
| `/rfqs/new` | 已登录 | 新建真实 RFQ |
| `/rfqs/[id]` | Owner / Staff | RFQ、报价、附件、成本和时间线 |
| `/admin/**` | Operator / Admin | 运营管理；只有 Admin 可修改角色 |

## 课程工程证据

| 评分证据 | 数量/实现 |
| --- | --- |
| React 可复用组件 | 19 个 `.tsx` 组件，覆盖 Layout、Auth、Dashboard、RFQ、Demo、Admin 和基础 UI |
| 业务 API | 8 个 Next.js Route Handler，覆盖 RFQ、报价、状态、时间线、供应商和角色 |
| PostgreSQL 业务表 | 6 张：`profiles`、`rfqs`、`suppliers`、`supplier_quotes`、`timeline_events`、`attachments` |
| 权限 | 服务端鉴权 + Supabase RLS，真实 Buyer A/B、Operator、Admin 矩阵通过 |
| 自动化测试 | 14/14 通过，并包含生产构建、校验和安全契约 |
| 响应式 | 390px 手机端和 1440px 桌面端通过浏览器验收 |

## 本地运行

要求 Node.js 22.13+ 和 npm。

```bash
npm install
copy .env.example .env.local
npm run dev
```

`.env.local` 只配置公开客户端参数，不得写入 service role key 或数据库密码：

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

访问 [http://localhost:3000](http://localhost:3000)。数据库初始化见 [supabase/README.md](supabase/README.md) 和 [docs/05-部署指南.md](docs/05-部署指南.md)。

## 测试命令

```bash
npm run lint
npx tsc --noEmit
npm test
npm audit --omit=dev
npm run test:live
```

`npm test` 会先执行生产构建，再运行 14 项自动化测试。`npm run test:live` 需要本机受 Git 忽略的普通测试用户会话，不使用 service role key。

公开仓库和 GitHub Actions 不包含 Supabase 真实配置；应用会使用“未配置时安全关闭”模式完成构建与测试。真实多账号集成测试只在受控本地环境运行。

## Demo 数据声明

公开 `/demo`、首页 RFQ 预览、Prototype Service Targets、匿名供应商代码、报价、成本和时间线均为课程演示数据，不是客户订单、真实供应商资料、交易额、服务承诺或经营成绩。登录后的 RFQ 来自 Supabase，并与公开 Demo 数据严格分离。

## 已知限制

- 公开注册在课程提交后、配置自定义 SMTP 之前保持关闭
- 未接入 Amazon API、支付、网页抓取、真实供应商或物流接口
- 文件选择仅演示界面和附件元数据，未实现真实文件上传
- 公开 Demo 的报价选择仅用于前端状态与成本重算演示，不会下单
- 课程账号和密码只保存在本机 `.private/`，不会写入仓库或网站

本公开仓库不包含测试账号、测试邮箱、用户密码、数据库密码、SMTP 密码、Supabase 密钥或 service role key。

## 课程文档

- [需求分析](docs/01-需求分析.md)
- [架构与技术选型](docs/02-架构与技术选型.md)
- [数据库设计](docs/03-数据库设计.md)
- [API 接口文档](docs/04-API接口文档.md)
- [部署指南](docs/05-部署指南.md)
- [测试报告](docs/06-测试报告.md)
- [演示与答辩](docs/07-演示与答辩.md)
