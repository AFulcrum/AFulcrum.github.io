---
layout: page
title: 简历
---

<div class="resume">

<header class="resume-header">
<div class="title">
<h1>黄坤 · Java 后端 / 全栈 实习</h1>
<p class="subtitle">双非大二 · 以“上线与数据”说话 · 项目驱动成长</p>
</div>
<div class="contact">
<div>📧 <a href="mailto:you@example.com" target="_blank" rel="noreferrer">you@example.com</a></div>
<div>🐙 <a href="https://github.com/AFulcrum" target="_blank" rel="noreferrer">github.com/AFulcrum</a></div>
<div>🔗 <a href="/" target="_blank" rel="noreferrer">个人站点</a></div>
<div>📍 可实习城市 · 到岗时间可协商</div>
</div>
</header>

<section>
<h2>核心亮点</h2>
<p class="muted">技术栈匹配岗位场景，强调“可部署、可演示、可量化”的实战产出</p>
<div class="kpis">
<span class="kpi">已上线项目 1 个（Docker 一键部署）</span>
<span class="kpi">Nginx 反向代理 + HTTPS</span>
<span class="kpi">Redis 缓存/集合计数：P95 ~200ms &rarr; ~20ms</span>
<span class="kpi">MySQL 索引优化：慢 SQL 降至毫秒级</span>
<span class="kpi">技术对比表述：Embedding 模型/HNSW 索引</span>
</div>
</section>

<section class="resume-grid">
<aside>
<h3>技能树</h3>
<ul class="list-compact">
<li>后端：Java、Spring Boot、MyBatis、RESTful API</li>
<li>数据库与缓存：MySQL（索引/事务/锁）、Redis（缓存/Set 计数）</li>
<li>前端：Vue3、Axios、Element-Plus（联调为主）</li>
<li>工程化：Maven、Git、Linux 基本命令、Nginx</li>
<li>部署：Docker / Docker Compose（App + MySQL + Redis + Nginx）</li>
<li>进阶在研：Sharding-JDBC 分表、RocketMQ 削峰、限流/防读扩散</li>
</ul>

<h3>认证与计划</h3>
<ul class="list-compact">
<li>阿里云 ACP（容器方向）— 计划报名 · 绑定项目容器化实践</li>
</ul>

<h3>教育</h3>
<ul class="list-compact">
<li>本科 · 计算机相关专业 · 大二在读</li>
</ul>

<h3>链接</h3>
<ul class="list-compact">
<li>GitHub：<a href="https://github.com/AFulcrum" target="_blank" rel="noreferrer">AFulcrum</a></li>
<li>博客/站点：<a href="/blogs/" >/blogs</a></li>
<li>在线 Demo：<a href="https://example.com" target="_blank" rel="noreferrer">example.com</a></li>
</ul>
</aside>

<main>
<h3>项目矩阵（王炸三连）</h3>

<div class="project">
<div class="project-head">
<strong>校园知识库 / 后台管理平台（若依二次开发）</strong>
<span class="tags">
<span class="badge">Spring Boot 3</span>
<span class="badge">RuoYi</span>
<span class="badge">MyBatis</span>
<span class="badge">MySQL</span>
<span class="badge">Redis</span>
<span class="badge">Vue3</span>
<span class="badge">Docker</span>
<span class="badge">Nginx</span>
</span>
</div>
<ul>
<li>打通权限/菜单/代码生成与业务模型，按模块分层与路由元信息规范化</li>
<li>核心表结构与联合索引：热门/最新查询由 200ms 降至 20ms（P95）</li>
<li>Redis 缓存 + Set 计数/去重：点赞/收藏去数据库化，降低写压力</li>
<li>容器化部署：Dockerfile + docker-compose，Nginx 反代/静态资源托管</li>
</ul>
<div class="links">
<a href="https://example.com" target="_blank" rel="noreferrer">线上演示</a>
<span>·</span>
<a href="https://github.com/yourname/your-repo" target="_blank" rel="noreferrer">源码仓库</a>
</div>
</div>

<div class="project">
<div class="project-head">
<strong>AI 向量检索服务（Embedding 对比 + HNSW）</strong>
<span class="tags">
<span class="badge">Java</span>
<span class="badge">Embedding</span>
<span class="badge">HNSW</span>
<span class="badge">Milvus/FAISS（可替换）</span>
</span>
</div>
<ul>
<li>对比不同 Embedding 模型（示例：通义/OPENAI v3/bge），以召回率/吞吐量为指标</li>
<li>构建 HNSW 索引，低延迟相似度检索；实验环境端到端延迟 ~120ms</li>
<li>批量入库/更新管道：在相同硬件下，入库速度较基线提升 ~45%（示例数据）</li>
<li>以接口封装检索/召回/重排，暴露可观测指标，便于 A/B 对比</li>
</ul>
<div class="links">
<span class="muted">注：为学习/预研型项目，可按需对接业务系统</span>
</div>
</div>

<div class="project">
<div class="project-head">
<strong>高并发票务/抢座（设计与实作迭代中）</strong>
<span class="tags">
<span class="badge">Sharding-JDBC</span>
<span class="badge">RocketMQ</span>
<span class="badge">限流/令牌桶</span>
<span class="badge">Redis 锁</span>
</span>
</div>
<ul>
<li>目标能力：分库分表（避免单表热点）、异步削峰（订单入队/出队）、幂等对账</li>
<li>防止读扩散：缓存层按 Key 设计与过期策略；库存扣减与一致性保障</li>
<li>限流与降级策略：令牌桶 + 拒绝/排队；压测/火焰图用于瓶颈定位</li>
</ul>
<div class="links">
<span class="muted">说明：作为进阶项目逐步实现，面试可用架构设计+验证数据呈现</span>
</div>
</div>

<h3>方法论与工程化</h3>
<div class="timeline">
<div class="tl-item">
<div class="tl-title">项目驱动学习</div>
<div class="tl-body">以“能上线”为验收，所有技术选型都绑定可观测指标（延迟/吞吐/成本）。</div>
</div>
<div class="tl-item">
<div class="tl-title">部署与可运维</div>
<div class="tl-body">Docker/Compose 编排 App+MySQL+Redis+Nginx；日志/健康检查/端口策略标准化。</div>
</div>
<div class="tl-item">
<div class="tl-title">面试表达</div>
<div class="tl-body">不讲“学了什么”，只讲“解决了什么问题”与“数据对比”，如“缓存击穿/雪崩”的防护收益。</div>
</div>
</div>
</main>
</section>

</div>
