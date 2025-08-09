
## 基本语法结构

所有 Dataview 查询都需要包含在代码块中，并指定语言为 `dataview`：

````markdown
```dataview
[查询类型] [字段]
[条件]
[排序/分组/限制]
```
````

## 查询类型

### 1. LIST 查询 - 列出符合条件的笔记

````markdown
```dataview
LIST
FROM "文件夹"
WHERE 条件
```
````

示例：
````markdown
```dataview
LIST
FROM "Daily Notes"
WHERE file.day = date(2023-10-01)
```
````

### 2. TABLE 查询 - 以表格形式展示数据

````markdown
```dataview
TABLE 字段1, 字段2 AS "自定义列名"
FROM "文件夹"
WHERE 条件
```
````

示例：
````markdown
```dataview
TABLE file.name AS "笔记名", author AS "作者", rating AS "评分"
FROM "Books"
WHERE rating > 3
```
````

### 3. TASK 查询 - 列出任务

````markdown
```dataview
TASK
FROM "文件夹"
WHERE 条件
```
````

示例：
````markdown
```dataview
TASK
FROM "Projects"
WHERE !completed AND due < date(now)
```
````

## 常用查询条件

### 文件属性筛选

````markdown
```dataview
LIST
WHERE file.name = "特定文件名"
WHERE file.path = "完整路径"
WHERE file.folder = "文件夹路径"
WHERE file.size > 1000  # 文件大小(bytes)
WHERE file.ctime > date(2023-01-01)  # 创建时间
WHERE file.mtime > date(2023-01-01)  # 修改时间
```
````

### 元数据筛选

````markdown
```dataview
LIST
WHERE author = "John Doe"
WHERE rating >= 4
WHERE status = "in-progress"
WHERE tags = "#important"
```
````

### 日期筛选

````markdown
```dataview
LIST
WHERE due = date(2023-12-31)
WHERE due < date(now)  # 过期任务
WHERE due > date(now) AND due < date(now) + dur(7 days)  # 未来7天内到期
```
````

## 高级查询功能

### 排序

````markdown
```dataview
TABLE file.name, rating
FROM "Books"
SORT rating DESC
```
````

### 分组

````markdown
```dataview
TABLE rows.file.name
FROM "Books"
GROUP BY author
```
````

### 限制结果数量

````markdown
```dataview
TABLE file.name
LIMIT 5
```
````

### 内联字段

可以在笔记中直接定义字段：

```markdown
---
author: John Doe
rating: 5
tags: [book, fiction]
---
```

### 计算字段

````markdown
```dataview
TABLE file.name, rating, rating * 2 AS "双倍评分"
FROM "Books"
```
````

### 链接处理

````markdown
```dataview
TABLE file.link AS "笔记", author
FROM "Books"
```
````

## 实用查询示例

### 查找所有未完成的任务

````markdown
```dataview
TASK
WHERE !completed
```
````

### 查找最近修改的笔记

````markdown
```dataview
TABLE file.mtime AS "最后修改时间"
SORT file.mtime DESC
LIMIT 10
```
````

### 按标签分组笔记

````markdown
```dataview
LIST
FROM ""
GROUP BY file.tags
```
````

### 查找包含特定关键词的笔记

````markdown
```dataview
LIST FROM "Daily Notes"
WHERE contains(file.name, "会议") OR contains(text, "项目")
```
````

## JavaScript 查询 (高级)

对于更复杂的查询，可以使用 DataviewJS：

````markdown
```dataviewjs
dv.table(["文件", "创建时间"], 
    dv.pages('"文件夹"')
    .sort(b => b.file.ctime)
    .map(b => [b.file.link, b.file.ctime.toLocaleString()])
)
```
````

## 注意事项

1. 确保在 Obsidian 设置中已启用 Dataview 插件
2. 元数据字段区分大小写
3. 日期格式必须使用 `date(YYYY-MM-DD)` 或 `date(YYYY-MM-DD HH:MM)`
4. 对于复杂的查询，建议先在简单的查询上测试

通过掌握这些 Dataview 查询技巧，你可以极大地提升在 Obsidian 中组织和检索信息的效率。