// 简历生成模块 —— 由负责模块3（简历生成）的成员维护
// 负责：基本信息维护、简历完整度、模板选择、导出

const { ref, reactive, computed } = window.Vue;

export function useResume({ apiFetch, currentStudentId, projectItems, internshipItems, awardItems, certItems }) {
    const showBasicModal = ref(false);
    const showPreviewModal = ref(false);
    const resumeTemplate = ref("single");
    const skillTagInput = ref("");
    const basicInfoSaving = ref(false);
    const basicInfoError = ref("");

    const basicInfo = reactive({
        name: "",
        gender: "",
        phone: "",
        email: "",
        jobTarget: "",
        school: "",
        major: "",
        degree: "",
        gradYear: "",
        photo: ""
    });
    const skillTags = ref([]);

    // ── 从后端 profile 数据填充 ────────────────────────────────
    function loadProfile(profile) {
        basicInfo.name     = profile.name      || "";
        basicInfo.phone    = profile.phone     || "";
        basicInfo.email    = profile.email     || "";
        basicInfo.school   = profile.school    || "";
        basicInfo.major    = profile.major     || "";
        basicInfo.jobTarget = profile.job_target || "";
        basicInfo.degree   = profile.degree    || "";
        basicInfo.gradYear = profile.grad_year || "";
        // 从 localStorage 恢复照片（base64 太大不存后端）
        const sid = profile.id || currentStudentId?.value || "guest";
        const savedPhoto = localStorage.getItem(`pdp_resume_photo_${sid}`);
        basicInfo.photo = savedPhoto || "";
        skillTags.value    = profile.skill_tags
            ? profile.skill_tags.split(",").map(t => t.trim()).filter(Boolean)
            : [];
    }

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

    // ── 概览统计 ──────────────────────────────────────────────
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
    const openBasicInfoModal = () => {
        basicInfoError.value = "";
        showBasicModal.value = true;
    };

    const saveBasicInfo = async () => {
        basicInfoError.value = "";
        if (apiFetch && currentStudentId?.value) {
            basicInfoSaving.value = true;
            try {
                await apiFetch(`/api/v1/students/${currentStudentId.value}/profile`, {
                    method: "PUT",
                    body: JSON.stringify({
                        name:       basicInfo.name,
                        school:     basicInfo.school,
                        major:      basicInfo.major,
                        phone:      basicInfo.phone,
                        email:      basicInfo.email,
                        job_target: basicInfo.jobTarget,
                        degree:     basicInfo.degree,
                        grad_year:  basicInfo.gradYear,
                        skill_tags: skillTags.value.join(","),
                    }),
                });
            } catch (e) {
                basicInfoError.value = "保存失败：" + (e.message || e);
                basicInfoSaving.value = false;
                return;
            }
            basicInfoSaving.value = false;
        }
        showBasicModal.value = false;
    };

    const addSkillTag = (tag) => {
        const t = (tag || "").trim();
        if (t && !skillTags.value.includes(t)) skillTags.value.push(t);
        skillTagInput.value = "";
    };

    const removeSkillTag = (tag) => {
        skillTags.value = skillTags.value.filter(t => t !== tag);
    };

    const handlePhoto = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            basicInfo.photo = ev.target.result;
            // 持久化照片到 localStorage（按学生ID区分）
            const key = `pdp_resume_photo_${currentStudentId?.value || 'guest'}`;
            try { localStorage.setItem(key, ev.target.result); } catch(e) { /* 超出配额时静默忽略 */ }
        };
        reader.readAsDataURL(file);
    };

    const previewFullResume = () => { showPreviewModal.value = true; };

    const exportResume = () => {
        const area = document.getElementById("resume-print-area");
        if (!area) { alert("找不到简历预览区，请确认当前在简历页。"); return; }
        const css = `
            body { font-family: Arial,'Microsoft YaHei',sans-serif; padding: 32px; max-width: 820px; margin: 0 auto; color: #141413; line-height: 1.6; }
            h2 { text-align: center; margin: 0 0 4px; }
            .resume-section { margin-bottom: 20px; }
            .resume-section h3 { font-size: 14pt; border-bottom: 2px solid #333; padding-bottom: 5px; margin-bottom: 10px; color: #141413; }
            .resume-double { display: grid; grid-template-columns: 200px 1fr; gap: 24px; }
            .tag { background: #f0ece4; padding: 2px 8px; border-radius: 10px; font-size: 10pt; margin: 2px; display: inline-block; }
            .resume-date { color: #5e5d59; font-size: 10pt; }
            .resume-item-title { font-weight: bold; }
            .text-muted { color: #9e9894; }
            p, span, div, strong { color: #141413; }
        `;
        const win = window.open("", "_blank");
        if (!win) { alert("请允许浏览器弹出窗口以导出简历（地址栏右侧有弹窗拦截提示）。"); return; }
        win.document.write(`<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><title>${basicInfo.name || "简历"}_简历</title><style>${css}</style></head><body>${area.innerHTML}</body></html>`);
        win.document.close();
        win.focus();
        win.print();
    };

    return {
        showBasicModal,
        showPreviewModal,
        resumeTemplate,
        basicInfo,
        skillTags,
        skillTagInput,
        basicInfoSaving,
        basicInfoError,
        missingFields,
        filledProfileFields,
        profileCompletionRate,
        exportFileName,
        resumeChecklist,
        resumeOverviewStats,
        loadProfile,
        openBasicInfoModal,
        saveBasicInfo,
        addSkillTag,
        removeSkillTag,
        handlePhoto,
        previewFullResume,
        exportResume,
    };
}

