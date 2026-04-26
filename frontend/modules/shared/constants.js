// 全局常量 —— 多人协作时此文件由负责 UI/设计规范的成员维护

export const LOGIN_HIGHLIGHTS = [
    { module: "模块0", title: "登录与认证", desc: "统一入口管理学生与教师身份。" },
    { module: "模块1/2", title: "课程与成就", desc: "围绕学业成绩和成长经历形成数据资产。" },
    { module: "模块3/5", title: "简历与对比", desc: "将个人数据转成可展示、可分析的结果。" }
];

export const MODULE_METADATA = {
    student: {
        home: {
            module: "模块4 · 学生视图",
            heading: "成长总览工作台",
            description: "把课程、成就、简历和对比分析集中到一个学生视图中，方便统一管理个人成长数据。",
            tags: ["数据总览", "成长路径", "模块导航"]
        },
        courses: {
            module: "模块1 · 课程成绩管理",
            heading: "课程录入与 GPA 统计",
            description: "围绕课程成绩、学分和绩点构建清晰的课程管理工作区，突出统计和趋势信息。",
            tags: ["课程列表", "GPA 计算", "趋势图表"]
        },
        achievements: {
            module: "模块2 · 成就与经历管理",
            heading: "成就沉淀与经历归档",
            description: "按奖项、项目、证书、实习等类型归档个人经历，并突出详情、附件和标签信息。",
            tags: ["类型管理", "经历归档", "附件查看"]
        },
        resume: {
            module: "模块3 · 简历生成",
            heading: "简历配置与导出",
            description: "围绕基本信息完整度、内容预览和导出动作组织简历模块，强化配置-预览-导出的闭环。",
            tags: ["完整度检查", "模板切换", "导出预览"]
        },
        compare: {
            module: "模块5 · 大众对比分析",
            heading: "个人与群体多维对比",
            description: "统一管理基准数据导入、维度筛选和对比结论，方便按群体和时间范围做分析。",
            tags: ["基准导入", "维度分析", "图表对比"]
        }
    },
    staff: {
        home: {
            module: "模块4 · 教师视图",
            heading: "教师工作台",
            description: "面向教师展示学生总体情况、关键分析入口和指导动作，减少信息分散。",
            tags: ["角色视图", "指导入口", "学生总览"]
        },
        students: {
            module: "模块4 · 学生展示",
            heading: "学生展示与画像查看",
            description: "以简历卡片视图快速浏览学生核心信息，帮助教师高效了解学生画像。",
            tags: ["学生卡片", "核心信息", "能力画像"]
        },
        compare: {
            module: "模块5 · 教师对比分析",
            heading: "学生群体对比分析",
            description: "支持教师选择学生后执行群体对比分析，并聚焦指导所需的结论和图表。",
            tags: ["对象选择", "群体对比", "指导依据"]
        }
    }
};
