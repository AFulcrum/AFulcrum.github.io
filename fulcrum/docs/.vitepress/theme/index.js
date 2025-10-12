// @ts-nocheck
import DefaultTheme from "vitepress/theme";
import BlogList from "./components/BlogList.vue";
import "./styles/custom.css";

export default {
  ...DefaultTheme,
  enhanceApp(ctx) {
    // 保留默认增强逻辑
    DefaultTheme?.enhanceApp?.(ctx);
    // 注册自定义组件
    ctx.app.component("BlogList", BlogList);
  },
};
