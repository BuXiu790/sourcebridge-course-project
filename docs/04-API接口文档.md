# 04 API 接口文档

## 1. 通用约定

- 请求/响应使用 JSON；认证由 Supabase Cookie Session 提供。
- 未配置 Supabase：`503 { error: "Supabase is not configured." }`。
- 未登录：`401 { error: "Authentication required." }`。
- 角色不足：`403 { error: "Insufficient permissions." }`。
- 页面级不存在资源由 App Router 返回 404；数据写入接口按下表返回 400/403/500。
- 所有业务数据还要通过 PostgreSQL RLS，前端隐藏按钮不是权限依据。

## 2. 业务接口

| 方法 | 路径 | 登录 | 角色 | 请求参数 | 成功返回 | 主要错误 |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/rfqs` | 是 | Buyer/Operator/Admin | 完整 `SourcingFormData`：产品、规格、数量、价格、目的地、日期等 | `201 { id, rfqNumber }` | 400 JSON/校验；401；500 保存失败；503 |
| POST | `/api/rfqs/[id]/select-quote` | 是 | RFQ Owner 或 Staff（RLS） | `{ quoteId: UUID }` | `200 { ok: true }` | 400 ID；401；403 非 Owner/报价不属于 RFQ；503 |
| POST | `/api/admin/suppliers` | 是 | Operator/Admin | `{ companyName, contactEmail?, location?, capabilities?, notes?, active? }` | `201 { id }` | 400 公司名；401；403；500；503 |
| PUT | `/api/admin/suppliers/[id]` | 是 | Operator/Admin | 与创建供应商相同 | `200 { id }` | 400；401；403；500（含记录不存在）；503 |
| POST | `/api/admin/rfqs/[id]/quotes` | 是 | Operator/Admin | `{ supplierId, unitPrice, moq, sampleCost, leadTimeDays, packaging, notes? }` | `201 { ok: true }` | 400 字段/供应商；401；403；500 重复或写入失败；503 |
| POST | `/api/admin/rfqs/[id]/status` | 是 | Operator/Admin | `{ status }`，八种 RFQ 状态之一 | `200 { ok: true }` | 400 状态；401；403；500（含记录不存在）；503 |
| POST | `/api/admin/rfqs/[id]/timeline` | 是 | Operator/Admin | `{ title, detail, status? }` | `201 { ok: true }` | 400 必填；401；403；500；503 |
| POST | `/api/admin/profiles/role` | 是 | Admin | `{ email, role }` | `200 { ok: true }` | 400 参数；401；403 RPC 拒绝；503 |

## 3. Auth 路由

| 方法 | 路径 | 说明 | 返回/跳转 |
| --- | --- | --- | --- |
| GET | `/auth/callback` | 用授权码交换 Supabase Session | 成功跳转安全 `next`；失败跳转登录错误提示 |
| GET | `/auth/confirm` | 验证邮件 OTP/Token Hash | 成功跳转目标页面；失败跳转登录 |

Course Release v1.0 的 `/signup` 不调用注册接口，只显示暂停说明。邮箱确认保持启用，待课程提交后配置自定义 SMTP 再开放公众注册。

## 4. 参数校验与异常处理

- RFQ：产品分类不得为空；文本去空格；URL/ASIN 格式检查；数量和价格为正；日期不能是过去。
- Quote：价格为正、MOQ/交期为正整数、样品费非负、包装必填。
- Role：只接受 `buyer/operator/admin`；数据库函数内部校验 Admin。
- 无效 JSON 返回 400，不把数据库内部错误或密钥返回浏览器。
- RLS 过滤可能表现为 0 行更新；接口统一返回业务错误，避免泄露其他用户记录是否存在。
