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

export function useAchievements({ apiFetch, currentStudentId, onDataChanged } = {}) {
    const achievements = ref([]);
    const expandedAchieves = ref([]);
    const showAchieveModal = ref(false);
    const editingAchieve = ref(null);
    const showDeleteAchieveConfirm = ref(false);
    const pendingDeleteAchieveId = ref(null);
    const deleteAchieveError = ref("");
    const achieveForm = reactive({
        name: "", type: "", date: "", org: "", level: "", description: "", tags: "", attachment: ""
    });
    const errors = reactive({ name: false, type: false, date: false, any: false });

    async function initAchievements() {
        if (apiFetch && currentStudentId?.value) {
            try {
                const data = await apiFetch(`/api/v1/students/${currentStudentId.value}/achievements`);
                achievements.value = Array.isArray(data) ? data : [];
            } catch (e) {
                console.error("initAchievements error", e);
                achievements.value = [];
            }
        } else {
            achievements.value = [];
        }
    }

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

    const saveAchievement = async () => {
        errors.any = !achieveForm.name || !achieveForm.type || !achieveForm.date;
        if (errors.any) return;
        if (apiFetch && currentStudentId?.value) {
            try {
                const body = JSON.stringify({
                    name: achieveForm.name, type: achieveForm.type, date: achieveForm.date,
                    org: achieveForm.org, level: achieveForm.level, description: achieveForm.description,
                    tags: achieveForm.tags
                });
                if (editingAchieve.value?.id) {
                    const updated = await apiFetch(
                        `/api/v1/students/${currentStudentId.value}/achievements/${editingAchieve.value.id}`,
                        { method: "PUT", body }
                    );
                    Object.assign(editingAchieve.value, { ...achieveForm, ...updated });
                } else {
                    const created = await apiFetch(
                        `/api/v1/students/${currentStudentId.value}/achievements`,
                        { method: "POST", body }
                    );
                    achievements.value.push({ ...achieveForm, id: created.id });
                }
            } catch (e) {
                console.error("saveAchievement error", e);
                return;
            }
        } else {
            if (editingAchieve.value) Object.assign(editingAchieve.value, achieveForm);
            else achievements.value.push({ ...achieveForm, id: "a" + Date.now() });
        }
        showAchieveModal.value = false;
        onDataChanged?.();
    };

    const deleteError = ref("");
    const deleteAchievement = (id) => {
        deleteAchieveError.value = "";
        pendingDeleteAchieveId.value = id;
        showDeleteAchieveConfirm.value = true;
    };

    const cancelDeleteAchievement = () => {
        showDeleteAchieveConfirm.value = false;
        pendingDeleteAchieveId.value = null;
        deleteAchieveError.value = "";
    };

    const confirmDeleteAchievement = async () => {
        const id = pendingDeleteAchieveId.value;
        if (apiFetch && currentStudentId?.value) {
            try {
                await apiFetch(
                    `/api/v1/students/${currentStudentId.value}/achievements/${id}`,
                    { method: "DELETE" }
                );
                achievements.value = achievements.value.filter(a => String(a.id) !== String(id));
                expandedAchieves.value = expandedAchieves.value.filter(eid => String(eid) !== String(id));
                showDeleteAchieveConfirm.value = false;
                pendingDeleteAchieveId.value = null;
                onDataChanged?.();
            } catch (e) {
                console.error("deleteAchievement error", e);
                deleteAchieveError.value = "删除失败，请重试：" + (e.message || e);
            }
        } else {
            achievements.value = achievements.value.filter(a => String(a.id) !== String(id));
            expandedAchieves.value = expandedAchieves.value.filter(eid => String(eid) !== String(id));
            showDeleteAchieveConfirm.value = false;
            pendingDeleteAchieveId.value = null;
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
        cancelDeleteAchievement,
        confirmDeleteAchievement,
        showDeleteAchieveConfirm,
        pendingDeleteAchieveId,
        deleteAchieveError,
        handleAttachment,
        previewAttachment,
        cancelAchieveModal
    };
}
