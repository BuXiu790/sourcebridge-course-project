# Changelog

## Course Release v1.1 — 2026-07-11

面向课堂公开演示增加安全受限的 Buyer 自助注册。

### 新增

- `/signup` 公开 Buyer 注册表单，包含邮箱、两次密码、隐私确认和显示/隐藏密码
- 服务端注册接口及友好的重复邮箱、限频、网络、配置和注册关闭错误处理
- 注册后即时会话、数据库自动 Buyer Profile、刷新后会话保持
- 每个 Buyer 最多 5 条 RFQ，服务端预检与 PostgreSQL 触发器双重强制
- Buyer 可安全修改自己的非特权 Profile 字段，角色字段由触发器保护
- 公开注册真实验收脚本和 18 项自动化测试

### Course Demo 安全约束

- Supabase Email + Password 与公开注册开启，匿名登录关闭
- 因未配置自定义 SMTP，课程版本暂时关闭邮箱确认并禁用密码恢复入口
- 注册客户端不能选择角色；数据库忽略 Auth metadata 中的角色声明，默认固定为 Buyer
- 商业化前必须配置自定义 SMTP、重新启用邮箱确认并恢复可靠的密码找回
- 不包含支付、Amazon API、真实供应商或商业获客功能

## Course Release v1.0 — 2026-07-11

面向前端框架技术实践期末项目的首个稳定课程版本。

### 课程交付能力

- Next.js App Router、TypeScript、Tailwind CSS 响应式前端
- 19 个可复用 React 组件
- Supabase 邮箱登录、持久会话和三角色权限
- Buyer Dashboard、四步骤 RFQ、报价、成本、时间线
- Operator/Admin 供应商、报价、状态、时间线和角色管理
- 六张 PostgreSQL 业务表、RLS、触发器、索引和完整性约束
- 匿名公开首页及 `/demo` 只读演示
- 14 项自动化测试和真实四账号权限矩阵验收
- 完整中文需求、架构、数据库、API、部署、测试和答辩文档

### 发布约束

- 公众注册在自定义 SMTP 配置前保持暂停
- 测试账号和密码仅保存在本机 `.private/`
- 不包含支付、Amazon API、真实供应商、网页抓取或商业获客功能
- 所有公开 RFQ、报价、成本、时间线和指标均明确标注为 Demo/Illustrative
