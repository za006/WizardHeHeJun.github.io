import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

export default defineConfig({
  branch,

  // Get this from tina.io
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  // Get this from tina.io
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  // Uncomment to allow cross-origin requests from non-localhost origins
  // during local development (e.g. GitHub Codespaces, Gitpod, Docker).
  // Use 'private' to allow all private-network IPs (WSL2, Docker, etc.)
  // server: {
  //   allowedOrigins: ['https://your-codespace.github.dev'],
  // },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public",
    },
  },
  // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/r/content-modelling-collections/
  schema: {
    collections: [
      {
        name: "post",
        label: "博客文章",
        path: "src/content/blog", // 👈 确保这里绝对是 / 别写成 \
        format: "md",
        ui: {
          filename: {
            slugify: (values) => {
              return `${values?.title
                ?.toLowerCase()
                ?.replace(/\s+/g, '-')      // 把空格变成横杠
                ?.replace(/[^a-z0-9_-]/g, '') // ⚡ 强力过滤：只允许英文、数字、横杠、下划线，彻底抹除特殊字符！
                || 'new-post'}`;
            },
          },
        },
        defaultItem: () => {
          return {
            title: "new-post-title",
            description: "请在这里输入新文章的简介...",
            pubDate: new Date().toISOString(),
            updatedDate: new Date().toISOString(),
            category: "项目分享",
            tags: ["日常"],
            draft: false,
          };
        },
        fields: [
          {
            type: "boolean",
            name: "draft",
            label: "是否为草稿(打开则前台隐藏)",
          },
          {
            type: "string",
            name: "title",
            label: "文章标题",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "文章简介",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "datetime",
            name: "pubDate",
            label: "发布日期",
            ui: {
              dateFormat: "MMM DD YYYY",
            },
          },
          {
            type: "datetime",
            name: "updatedDate",
            label: "更新日期",
            ui: {
              dateFormat: "MMM DD YYYY",
            },
          },
          {
            type: "image",
            name: "heroImage",
            label: "封面图片",
          },
          {
            type: "string",
            name: "category",
            label: "分类",
          },
          {
            type: "string",
            name: "tags",
            label: "标签列表",
            list: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "文章正文",
            isBody: true,
          },
        ],
      },
    ],
  },
});