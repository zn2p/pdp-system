// 成就管理模块 —— 由负责模块2（成就与经历管理）的成员维护
// 负责：成就 CRUD、按类型过滤、附件处理

const { ref, reactive, computed } = window.Vue;

function createInitialAchievements() {
    return [
        { id: "a1", name: "算法大赛", type: "竞赛", date: "2024-05", org: "CCF", description: "省级二等奖" },
        { id: "a2", name: "智能推荐", type: "项目", date: "2024.03-2024.08", description: "协同过滤推荐系统" },
        { id: "a3", name: "数据分析师", type: "证书", date: "2024-08", level: "中级" },
        { id: "a4", name: "阿里实习", type: "实习", date: "2024.07-2024.09", description: "后端开发" }
    ];
}

export function useAchievements({ onDataChanged } = {}) {
    const achievements = ref([]);
    const expandedAchieves = ref([]);
    const showAchieveModal = ref(false);
    const editingAchieve = ref(null);
    const achieveForm = reactive({
        name: "", type: "", date: "", org: "", level: "", description: "", tags: "", attachment: ""
    });
    const errors = reactive({ name: false, type: false, date: false, any: false });

    function initAchievements() {
        achievements.value = createInitialAchievements();
    }
    initAchievements();

    // ── 按类型过滤 ────────────────────────────────────────────
    const internshipItems = computed(() => achievements.value.filter(a => a.type === "实习"));
    const projectItems = computed(() => achievements.value.filter(a => a.type === "项目"));
    const awardItems = computed(() => achievements.value.filter(a => a.type === "竞赛" || a.type === "奖项"));
    const certItems = computed(() => achievements.value.filter(a => a.type === "证书"));
    const sortedAchievements = computed(() =>
        [...achievements.value].sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    );

    const achievementOverviewStats = computed(() => [
        { label: "项目经历", value: `${projectItems.value.length} 项`, desc: "突出项目实践经历。" },
        { label: "实习经历", value: `${internshipItems.value.length} 段`, desc: "用于简历和教师视图展示。" },
        { label: "荣誉奖项", value: `${awardItems.value.length} 项`, desc: "沉淀竞赛和获奖信息。" },
        { label: "证书语言", value: `${certItems.value.length} 项`, desc: "展示技能与资质证明。" }
    ]);

    // ── 操作函数 ──────────────────────────────────────────────
    const toggleAchieveDetail = (id) => {
        const idx = expandedAchieves.value.indexOf(id);
        if (idx > -1) expandedAchieves.value.splice(idx, 1);
        else expandedAchieves.value.push(id);
    };

    const openAddAchievementModal = () => {
        editingAchieve.value = null;
        errors.any = false;
        Object.assign(achieveForm, { name: "", type: "", date: "", org: "", level: "", description: "", tags: "", attachment: "" });
        showAchieveModal.value = true;
    };

    const editAchievement = (achievement) => {
        editingAchieve.value = achievement;
        errors.any = false;
        Object.assign(achieveForm, achievement);
        showAchieveModal.value = true;
    };

    const handleAttachment = (e) => {
        if (e.target.files[0]) achieveForm.attachment = e.target.files[0].name;
    };

    const previewAttachment = (achievement) => alert(`预览: ${achievement.attachment}`);

    const cancelAchieveModal = () => {
        errors.any = false;
        showAchieveModal.value = false;
    };

    const saveAchievement = () => {
        errors.any = !achieveForm.name || !achieveForm.type || !achieveForm.date;
        if (errors.any) return;
        if (editingAchieve.value) Object.assign(editingAchieve.value, achieveForm);
        else achievements.value.push({ ...achieveForm, id: "a" + Date.now() });
        showAchieveModal.value = false;
        onDataChanged?.();
    };

    const deleteAchievement = (id) => {
        if (confirm("删除？")) {
            achievements.value = achievements.value.filter(a => a.id !== id);
            onDataChanged?.();
        }
    };

    return {
        achievements,
        expandedAchieves,
        showAchieveModal,
        editingAchieve,
        achieveForm,
        errors,
        initAchievements,
        internshipItems,
        projectItems,
        awardItems,
        certItems,
        sortedAchievements,
        achievementOverviewStats,
        toggleAchieveDetail,
        openAddAchievementModal,
        editAchievement,
        saveAchievement,
        deleteAchievement,
        handleAttachment,
        previewAttachment,
        cancelAchieveModal
    };
}
