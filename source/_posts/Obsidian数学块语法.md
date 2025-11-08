---
title: Obsidian数学块语法
categories: Markdown
date: 2025-11-25
tags:
  - Markdown
  - Obsidian
mathjax: true
---
> 讲解Obsidian中关于数学块的使用方法

# 基本数学公式插入

## 行内公式

使用单个美元符号 `$...$` 包裹公式：
```markdown
这是一个行内公式 $E=mc^2$ 的例子。
```
效果：这是一个行内公式 $E=mc^2$ 的例子。

## 块级公式

使用双美元符号 `$$...$$` 包裹公式（单独一行）：
```markdown
$$
\int_a^b f(x)dx = F(b) - F(a)
$$
```
效果：
$$
\int_a^b f(x)dx = F(b) - F(a)
$$

# 常用数学符号与表达式

## 希腊字母

| 符号  | LaTeX 代码 | 符号  | LaTeX 代码 |
| --- | -------- | --- | -------- |
| α   | `\alpha` | β   | `\beta`  |
| γ   | `\gamma` | Γ   | `\Gamma` |
| θ   | `\theta` | Θ   | `\Theta` |
| π   | `\pi`    | Π   | `\Pi`    |
| σ   | `\sigma` | Σ   | `\Sigma` |
| ω   | `\omega` | Ω   | `\Omega` |
## 运算符

| 符号  | LaTeX 代码 | 符号  | LaTeX 代码  |
| --- | -------- | --- | --------- |
| +   | `+`      | −   | `-`       |
| ×   | `\times` | ÷   | `\div`    |
| ±   | `\pm`    | ∓   | `\mp`     |
| ≤   | `\leq`   | ≥   | `\geq`    |
| ≠   | `\neq`   | ≈   | `\approx` |
| ∈   | `\in`    | ∉   | `\notin`  |
| ∩   | `\cap`   | ∪   | `\cup`    |
## 关系符号

| 语法 | 显示 | 语法 | 显示 |
|------|------|------|------|
| `\leq` | $\leq$ | `\geq` | $\geq$ |
| `\neq` | $\neq$ | `\approx` | $\approx$ |
| `\equiv` | $\equiv$ | `\propto` | $\propto$ |
| `\in` | $\in$ | `\notin` | $\notin$ |

## 空格处理

LaTeX 默认会忽略空格，需要使用特定命令显示空格：

| 命令       | 空格大小 | 示例            | 效果          |
| -------- | ---- | ------------- | ----------- |
| `\,`     | 小空格  | `$a\,b$`      | $a\,b$      |
| `\:`     | 中空格  | `$a\:b$`      | $a\:b$      |
| `\;`     | 大空格  | `$a\;b$`      | $a\;b$      |
| `\quad`  | 1em  | `$a\quad b$`  | $a\quad b$  |
| `\qquad` | 2em  | `$a\qquad b$` | $a\qquad b$ |
| `\!`     | 负空格  | `$a\!b$`      | $a\!b$      |

## 求和、积分、极限

|符号|LaTeX 代码|示例|
|---|---|---|
|∑|`\sum`|`\sum_{i=1}^n i^2` → $\sum_{i=1}^n i^2$|
|∫|`\int`|`\int_{a}^{b} x^2 \, dx` → $\int_{a}^{b} x^2 , dx$|
|lim|`\lim`|`\lim_{x \to \infty} f(x)` → $\lim_{x \to \infty} f(x)$|

## 补充

$\infty$ ： `\infty`

# 高级数学表达式

## 上下标

```latex
$x^2 + y^{n+1} = z_{ij}$
```
效果：$x^2 + y^{n+1} = z_{ij}$

## 分式

```latex
$\frac{a}{b}$ 或 $\dfrac{a}{b}$ (显示大小)
$$
\frac{x+1}{x-1}
$$
```
效果：$\frac{a}{b}$ 和 $\dfrac{a}{b}$

$$
\frac{x+1}{x-1}
$$

## 根式
```latex
$\sqrt{x}$  $\sqrt[n]{x}$
$$
\sqrt{\frac{a}{b}}
$$
```
效果：$\sqrt{x}$ 和 $\sqrt[n]{x}$

$$
\sqrt{\frac{a}{b}}
$$

## 矩阵
```latex
$$
\begin{matrix}
a & b \\
c & d 
\end{matrix}
$$

$$
\begin{bmatrix}
1 & 2 \\
3 & 4
\end{bmatrix}
$$

$$
\begin{pmatrix}
x & y \\
z & w
\end{pmatrix}
$$
```
$$
\begin{matrix}
a & b \\
c & d 
\end{matrix}
$$

$$
\begin{bmatrix}
1 & 2 \\
3 & 4
\end{bmatrix}
$$

$$
\begin{pmatrix}
x & y \\
z & w
\end{pmatrix}
$$
## 多行公式
```latex
$$
\begin{align}
f(x) &= (x+1)^2 \\
     &= x^2 + 2x + 1
\end{align}
$$
```
$$
\begin{align}
f(x) &= (x+1)^2 \\
     &= x^2 + 2x + 1
\end{align}
$$
# 实用技巧

1. **公式编号**：
```latex
$$
e^{i\pi} + 1 = 0 \tag{1}
$$
```
$$
e^{i\pi} + 1 = 0 \tag{1}
$$

2. **条件表达式**：
```latex
$$
f(n) = 
\begin{cases} 
n/2 & \text{如果 } n \text{ 是偶数} \\
3n+1 & \text{如果 } n \text{ 是奇数}
\end{cases}
$$
```
$$
f(n) = 
\begin{cases} 
n/2 & \text{如果 } n \text{ 是偶数} \\
3n+1 & \text{如果 } n \text{ 是奇数}
\end{cases}
$$


3. **化学方程式**（需要 mhchem 扩展）：
```latex
$\ce{H2O}$  $\ce{SO4^2-}$
```
$\ce{H2O}$  $\ce{SO4^2-}$

4. **引用公式**（结合 Obsidian 的笔记链接功能）：
```markdown
如公式 [[#^eq1]] 所示...

$$
E=mc^2 \label{eq1} ^eq1
$$
```
$$
E=mc^2 \label{eq1} ^eq1
$$
# 高级用法

## 箭头

- `\to` → $\to$
    
- `\Rightarrow` → $\Rightarrow$
    
- `\Leftrightarrow` → $\Leftrightarrow$

## 导数

- `f'(x)` → $f'(x)$
    
- `\frac{dy}{dx}` → $\frac{dy}{dx}$

## 概率统计

- `P(A)` → $P(A)$
    
- `\mathbb{E}[X]` → $\mathbb{E}[X]$
    
- `\sigma^2` → $\sigma^2$

## 逻辑符号

- `\forall` → $\forall$
    
- `\exists` → $\exists$
    
- `\neg` → $\neg$

# 常见问题解决

1. **公式不渲染**：
   - 确保在设置中启用了数学公式渲染
   - 检查美元符号是否配对
   - 避免在公式中使用特殊字符（如未转义的_）

2. **空格不显示**：
   - 使用 `\,`, `\:`, `\;` 等空格命令
   - 或者使用 `\text{ }` 包裹空格：`$a\text{ }b$`

3. **字体样式**：
   - 粗体：`\mathbf{x}` → $\mathbf{x}$
   - 斜体：`\mathit{x}` → $\mathit{x}$
   - 黑板粗体：`\mathbb{R}` → $\mathbb{R}$







