// 简历生成模块 —— 由负责模块3（简历生成）的成员维护
// 负责：基本信息维护、简历完整度、模板选择、导出

const { ref, reactive, computed } = window.Vue;

/**
 * @param {{
 *   projectItems: import('vue').ComputedRef,
 *   internshipItems: import('vue').ComputedRef,
 *   awardItems: import('vue').ComputedRef,
 *   certItems: import('vue').ComputedRef
 * }} achievementRefs - 来自 useAchievements 的成就分类计算属性
 */
export function useResume({ projectItems, internshipItems, awardItems, certItems }) {
    const showBasicModal = ref(false);
    const showPreviewModal = ref(false);
    const resumeTemplate = ref("single");
    const basicInfo = reactive({
        name: "王语涵",
        gender: "女",
        phone: "138-0000-1234",
        email: "yuhan@edu.cn",
        jobTarget: "Java/Python开发工程师",
        school: "杭州电子科技大学",
        major: "计算机科学与技术",
        degree: "本科",
        gradYear: "2021.09-2025.07",
        photo: ""
    });
    const skillTags = ref(["Python", "Java", "SQL", "数据分析", "Vue.js"]);

    // ── 完整度 ────────────────────────────────────────────────
    const requiredProfileFields = [
        ["name", "姓名"],
        ["phone", "电话"],
        ["email", "邮箱"],
        ["school", "学校名称"],
        ["major", "专业"]
    ];

    const missingFields = computed(() =>
        requiredProfileFields
            .filter(([key]) => !String(basicInfo[key] || "").trim())
            .map(([, label]) => label)
    );
    const filledProfileFields = computed(() => requiredProfileFields.length - missingFields.value.length);
    const profileCompletionRate = computed(() =>
        Math.round((filledProfileFields.value / requiredProfileFields.length) * 100)
    );
    const exportFileName = computed(() => `${basicInfo.name || "简历"}_简历.pdf`);

    // ── 简历概览统计（依赖成就数据）────────────────────────────
    const resumeChecklist = computed(() => [
        { label: "基本信息", value: `${filledProfileFields.value}/${requiredProfileFields.length}` },
        { label: "技能标签", value: `${skillTags.value.length} 项` },
        { label: "项目/实习", value: `${projectItems.value.length + internshipItems.value.length} 条` },
        { label: "获奖/证书", value: `${awardItems.value.length + certItems.value.length} 条` }
    ]);

    const resumeOverviewStats = computed(() => [
        { label: "教育背景", value: missingFields.value.length ? "待补充" : "已完成" },
        { label: "技能标签", value: `${skillTags.value.length} 项` },
        { label: "项目经历", value: `${projectItems.value.length} 项` },
        { label: "实习经历", value: `${internshipItems.value.length} 项` },
        { label: "奖项证书", value: `${awardItems.value.length + certItems.value.length} 项` }
    ]);

    // ── 操作函数 ──────────────────────────────────────────────
    const openBasicInfoModal = () => { showBasicModal.value = true; };
    const saveBasicInfo = () => { showBasicModal.value = false; };
    const handlePhoto = (e) => { if (e.target.files[0]) basicInfo.photo = e.target.files[0].name; };
    const previewFullResume = () => { showPreviewModal.value = true; };
    const exportResume = (format) => alert(`导出${format}: ${exportFileName.value}`);

    return {
        showBasicModal,
        showPreviewModal,
        resumeTemplate,
        basicInfo,
        skillTags,
        missingFields,
        filledProfileFields,
        profileCompletionRate,
        exportFileName,
        resumeChecklist,
        resumeOverviewStats,
        openBasicInfoModal,
        saveBasicInfo,
        handlePhoto,
        previewFullResume,
        exportResume
    };
}
