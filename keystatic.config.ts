import { config, collection, fields } from '@keystatic/core';

// 🌟 聪明的一步：动态获取保存、新建当天的本地日期（格式：YYYY-MM-DD，如：2026-06-03）
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default config({
  storage: {
    kind: 'local',
  },
  collections: {
    posts: collection({
      label: '博客文章',
      path: 'src/content/blog/*',
      slugField: 'title',
      format: { contentField: 'content', entryExtension: 'md' },
      schema: {
        // --- 核心标识 ---
        title: fields.slug({
          name: {
            label: '文章标题',
            defaultValue: '未命名文章'
          },
          slug: {
            label: '文章路由/文件名 (自动生成)',
            description: '点击右侧按钮可手动修改为纯英文文件名，如 building-this-blog'
          }
        }),

        description: fields.text({
          label: '文章简介',
          multiline: true,
          defaultValue: '这是一篇新文章的简介...'
        }),

        // --- 日期管理 ---
        // 🌟 核心改进：调用 getTodayDate() 函数，新建时自动帮你填好当天的日期！
        // 这样新文章在前端就会永远排在第一页的最顶部，再也不用去最后一页翻找了。
        pubDate: fields.text({
          label: '发布日期 (如: 2026-06-03)',
          defaultValue: getTodayDate()
        }),
        updatedDate: fields.text({ label: '更新日期 (选填)', defaultValue: '' }),

        // --- 媒体与分类 ---
        heroImage: fields.text({
          label: '封面图片路径',
          defaultValue: '../../assets/blog/building-this-blog.jpg',
        }),
        category: fields.text({
          label: '文章分类',
          defaultValue: '项目分享'
        }),
        tags: fields.array(fields.text({ label: '标签' }), {
          label: '标签列表',
          itemLabel: props => props.value
        }),

        // --- 状态与置顶控制 ---
        draft: fields.checkbox({ label: '是否为草稿 (打开则前台隐藏)', defaultValue: false }),
        featured: fields.checkbox({ label: '是否为推荐/置顶文章', defaultValue: false }),
        order: fields.integer({ label: '文章排序权重 (数字越小越靠前)', defaultValue: 0 }),

        // --- 附加常用元数据 ---
        author: fields.text({ label: '文章作者 (选填)', defaultValue: 'Admin' }),
        keywords: fields.text({ label: 'SEO 关键词 (选填，逗号隔开)', defaultValue: '' }),
        readingTime: fields.text({ label: '预计阅读时间 (如: 5 mins)', defaultValue: '' }),

        // --- 文章正文配置 ---
        content: fields.mdx({
          label: '文章正文',
          extension: 'md',
        }),
      },
    }),
  },
});
