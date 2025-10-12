<script setup>
// @ts-nocheck
import { computed } from 'vue'

// 可选：列表布局（竖向 list）或网格布局（grid），默认 grid 以适配首页
const props = defineProps({
    layout: { type: String, default: 'grid' } // 'grid' | 'list'
})

// 扫描博客文章（在 VitePress 环境下由 Vite 解析），并排除 resources 资源目录
const allModules = import.meta.glob('/blogs/posts/**/*.md', { eager: true })
// 兼容性过滤：确保任何位于 resources 目录下的 Markdown 都不会被当作文章
const modules = Object.fromEntries(
    Object.entries(allModules).filter(([p]) => !/\/blogs\/posts\/.*\/resources\//.test(p))
)

const toDate = (d) => {
    // 支持 '2025-01-02' 或 Date 对象；无法解析返回最小值以置后
    if (!d) return new Date(0)
    if (d instanceof Date && !isNaN(d)) return d
    const dt = new Date(String(d))
    return isNaN(dt) ? new Date(0) : dt
}

const pad = (n) => String(n).padStart(2, '0')
const formatDate = (d) => {
    const dt = toDate(d)
    if (isNaN(dt)) return ''
    const y = dt.getFullYear()
    const m = pad(dt.getMonth() + 1)
    const day = pad(dt.getDate())
    return `${y}-${m}-${day}`
}

const fileNameFromPath = (p) => {
    // e.g. /blogs/posts/dir/name.md or /blogs/posts/dir/index.md
    const withoutDocs = p.replace(/^\/docs\//, '')
    const parts = withoutDocs.split('/')
    const last = parts[parts.length - 1]
    if (last === 'index.md') {
        // use parent dir
        const parent = parts[parts.length - 2] || ''
        return decodeURIComponent(parent || '')
    }
    const base = last.replace(/\.md$/, '')
    return decodeURIComponent(base || '')
}

const normalizePage = (path, mod) => {
    const fm = (mod && mod.frontmatter) || {}
    const url = path
        .replace(/^\/docs/, '')
        .replace(/index\.md$/, '')
        .replace(/\.md$/, '.html')

    // 优先顺序：frontmatter.title > mod.title > 首个 headers 标题 > 文件名/目录名 > 未命名
    let title = fm.title || mod?.title
    if (!title) {
        const headers = mod?.headers
        if (Array.isArray(headers) && headers.length) {
            // 找第一个 h1 或 h2，若无则用第一个 header 的 text
            const h1 = headers.find(h => h?.level === 1)
            title = h1?.title || headers[0]?.title || headers[0]?.text
        }
    }
    if (!title) title = fileNameFromPath(path)
    if (!title) title = '未命名'

    // 仅使用 frontmatter.date，未填写则留空
    const date = fm.date || ''
    const description = fm.description || ''
    const tags = Array.isArray(fm.tags) ? fm.tags : []

    return { url, title, frontmatter: { ...fm, description, tags }, date }
}

const posts = computed(() => {
    const pages = Object.entries(modules).map(([path, mod]) => normalizePage(path, mod))
    return pages.sort((a, b) => toDate(b.date) - toDate(a.date))
})
</script>

<template>
    <div class="blog-list" :data-layout="props.layout" aria-live="polite">
        <div v-if="!posts.length" class="empty">暂无文章，稍后再来～</div>
        <div v-else :class="props.layout === 'list' ? 'list' : 'grid'">
            <a v-for="p in posts" :key="p.url" class="card" :href="p.url" :aria-label="p.title">
                <div class="meta">
                    <span v-if="p.frontmatter?.date" class="date">发布于 {{ formatDate(p.frontmatter.date) }}</span>
                    <span v-if="p.frontmatter?.tags?.length" class="tags">
                        <span v-for="t in p.frontmatter.tags" :key="t" class="tag">{{ t }}</span>
                    </span>
                </div>
                <h3 class="title">{{ p.frontmatter?.title || p.title }}</h3>
                <p v-if="p.frontmatter?.description" class="desc">{{ p.frontmatter.description }}</p>
            </a>
        </div>
    </div>
</template>

<style scoped>
.blog-list {
    margin-top: 24px;
}

.empty {
    color: var(--vp-c-text-2);
}

.grid {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    align-items: stretch;
}

.list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 760px;
    margin: 0 auto;
    /* 居中 */
    width: 100%;
    padding: 0 16px;
    /* 小屏留白 */
}

.card {
    background: var(--vp-c-bg-soft);
    border: 1px solid var(--vp-c-divider);
    padding: 16px;
    border-radius: 12px;
    text-decoration: none;
    color: inherit;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: border-color .2s, transform .2s, box-shadow .2s;
}

.card:hover {
    border-color: var(--vp-c-brand-1);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}

.meta {
    display: flex;
    gap: 8px;
    align-items: center;
    color: var(--vp-c-text-2);
    font-size: 12px;
}

.tags {
    margin-left: auto;
    display: inline-flex;
    gap: 6px;
    flex-wrap: wrap;
}

.tag {
    background: var(--vp-c-bg);
    border: 1px solid var(--vp-c-divider);
    padding: 2px 6px;
    border-radius: 999px;
}

.title {
    margin: 8px 0 4px;
    font-size: 18px;
}

.desc {
    margin: 0;
    color: var(--vp-c-text-2);
}

/* 在 list 布局下的适配：更紧凑的标题与描述排版 */
.list .card {
    padding: 14px 16px;
}

.list .title {
    margin: 4px 0 2px;
    font-size: 16px;
}

.list .meta {
    font-size: 12px;
}

.list .desc {
    font-size: 14px;
}
</style>
