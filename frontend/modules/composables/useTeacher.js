// 教师模块 —— 由负责模块4/5（教师视图与教师对比分析）的成员维护
// 负责：学生清单管理、学生选择、教师视角对比分析

const { ref, reactive, computed, watch } = window.Vue;

// ── GPA 计算工具（与 useCourses 保持一致）──────────────────
function gradeToGpa(grade) {
    if (grade >= 90) return 4.0;
    if (grade >= 85) return 3.7;
    if (grade >= 82) return 3.3;
    if (grade >= 78) return 3.0;
    if (grade >= 75) return 2.7;
    if (grade >= 72) return 2.3;
    if (grade >= 68) return 2.0;
    return 1.0;
}

function calcStudentGpa(courses) {
    if (!courses || !courses.length) return null;
    let totalPoint = 0, totalCredit = 0;
    courses.forEach(c => {
        const g = Number(c.grade);
        if (!g) return;
        const credit = Number(c.credit) || 1;
        totalPoint += gradeToGpa(g) * credit;
        totalCredit += credit;
    });
    return totalCredit ? (totalPoint / totalCredit).toFixed(2) : null;
}

function buildStudentCard(s, profile) {
    const gpa = calcStudentGpa(profile.courses);
    const courses = profile.courses || [];
    const topCourses = [...courses]
        .sort((a, b) => Number(b.grade) - Number(a.grade))
        .slice(0, 3).map(c => c.name).join("、");
    const achievements = profile.achievements || [];
    const internship = achievements.filter(a => a.type === "internship").map(a => a.name).join("；");
    const project = achievements.filter(a => a.type === "project").map(a => a.name).join("；");
    const awards = achievements.filter(a => a.type === "award" || a.type === "competition").map(a => a.name).join("；");
    const certs = achievements.filter(a => a.type === "cert").map(a => a.name).join("；");
    return {
        id: s.id,
        name: profile.name || s.name || s.student_id,
        studentId: profile.student_id || s.student_id,
        basic: { school: profile.school || s.school, major: profile.major || s.major, jobTarget: profile.job_target },
        gpa: gpa || "—",
        coreCourses: topCourses,
        internship,
        project,
        awards,
        certs,
    };
}

/**
 * @param {{
 *   apiFetch: Function,
 *   showToast: Function,
 *   compareDims: import('vue').Ref,
 *   dimResults: object
 * }} deps
 */
export function useTeacher({ apiFetch, showToast, compareDims, dimResults }) {
    const teacherStudents = ref([]);
    const selectedStudentId = ref(null);
    const showAddStudentModal = ref(false);
    const newStudent = reactive({ name: "", studentId: "" });
    const availableStudents = ref([]);
    const selectedPickStudentId = ref(null);
    const studentPickerQuery = ref("");
    const addStudentError = ref("");
    const teacherComparisonResult = ref(false);
    const teacherComparisonMessage = ref("");
    const teacherComparisonError = ref("");
    const teacherDimResults = reactive({});
    const teacherDimResultsData = reactive({});
    const teacherCompareRunning = ref(false);
    const teacherCompareGroup = ref("同专业");
    const teacherTimeRange = ref("全部");
    const teacherSemesters = ref(["全部"]);
    const showRemoveConfirmId = ref(null);

    function initTeacher() {
        teacherStudents.value = [];
        selectedStudentId.value = null;
        teacherComparisonResult.value = false;
        teacherComparisonMessage.value = "";
        teacherComparisonError.value = "";
        teacherTimeRange.value = "全部";
        teacherSemesters.value = ["全部"];
        showRemoveConfirmId.value = null;
        Object.keys(teacherDimResults).forEach(k => delete teacherDimResults[k]);
        Object.keys(teacherDimResultsData).forEach(k => delete teacherDimResultsData[k]);
    }

    // ── Computed ──────────────────────────────────────────────
    const selectedStudent = computed(() =>
        teacherStudents.value.find(s => s.id === selectedStudentId.value)
    );

    const filteredAvailableStudents = computed(() => {
        const q = studentPickerQuery.value.trim().toLowerCase();
        const alreadyIds = new Set(teacherStudents.value.map(s => s.id));
        return availableStudents.value.filter(s =>
            !alreadyIds.has(s.student_record_id) &&
            (!q || (s.name || "").toLowerCase().includes(q) || (s.student_id || "").toLowerCase().includes(q))
        );
    });

    const teacherHomeCards = computed(() => [
        { label: "学生展示", value: `${teacherStudents.value.length} 人`, desc: "快速查看学生画像和简历卡片。", page: "students" },
        { label: "对比分析", value: `${compareDims.value.length} 维`, desc: "执行学生与群体的多维度对比。", page: "compare" }
    ]);

    const teacherStudentStats = computed(() => {
        const avgGpa = teacherStudents.value.length
            ? (teacherStudents.value.reduce((sum, s) => sum + (parseFloat(s.gpa) || 0), 0) / teacherStudents.value.length).toFixed(2)
            : "0.00";
        return [
            { label: "学生总数", value: `${teacherStudents.value.length} 人`, desc: "当前教师可查看的学生档案数。" },
            { label: "平均 GPA", value: avgGpa, desc: "学生群体当前平均绩点。" },
            { label: "高潜学生", value: `${teacherStudents.value.filter(s => (parseFloat(s.gpa) || 0) >= 3.7).length} 人`, desc: "GPA 较高的学生数量。" },
            { label: "待补充档案", value: `${teacherStudents.value.filter(s => !s.project || !s.awards).length} 人`, desc: "简历信息仍需完善的学生。" }
        ];
    });

    const teacherCompareStats = computed(() => [
        { label: "已选学生", value: selectedStudent.value?.name || "未选择", desc: "当前对比分析对象。" },
        { label: "对比维度", value: `${compareDims.value.length} 项`, desc: "教师视图下统一查看分析口径。" },
        { label: "基准文件", value: "通用基准", desc: "与学生模块共用基准数据库。" },
        { label: "分析状态", value: teacherComparisonResult.value ? "已生成" : "待执行", desc: "当前是否已有教师分析结论。" }
    ]);

    // ── 加载所选学生的课程学期列表 ─────────────────────────────
    const loadTeacherStudentSemesters = async (studentDbId) => {
        if (!studentDbId) { teacherSemesters.value = ["全部"]; return; }
        try {
            const profile = await apiFetch(`/api/v1/students/${studentDbId}`);
            const sems = new Set();
            (profile.courses || []).forEach(c => { if (c.semester) sems.add(c.semester); });
            teacherSemesters.value = ["全部", ...Array.from(sems).sort()];
        } catch (e) {
            teacherSemesters.value = ["全部"];
        }
    };

    // Auto-reload semesters when selected student changes
    watch(selectedStudentId, (newId) => {
        teacherTimeRange.value = "全部";
        teacherComparisonResult.value = false;
        Object.keys(teacherDimResults).forEach(k => delete teacherDimResults[k]);
        Object.keys(teacherDimResultsData).forEach(k => delete teacherDimResultsData[k]);
        loadTeacherStudentSemesters(newId);
    });

    // ── 操作函数 ──────────────────────────────────────────────
    // ── 加载完整学生清单（含档案详情）──────────────────────────
    const loadMyStudents = async () => {
        teacherStudents.value = [];
        selectedStudentId.value = null;
        showRemoveConfirmId.value = null;
        try {
            const list = await apiFetch("/api/v1/teachers/my-students");
            const profiles = await Promise.all(
                list.map(s => apiFetch(`/api/v1/students/${s.id}`).catch(() => ({})))
            );
            teacherStudents.value = list.map((s, i) => buildStudentCard(s, profiles[i]));
            if (!selectedStudentId.value && list.length) selectedStudentId.value = list[0].id;
        } catch (e) {
            teacherStudents.value = [];
            selectedStudentId.value = null;
            console.warn("loadMyStudents error", e);
        }
    };

    const openAddStudentModal = async () => {
        selectedPickStudentId.value = null;
        studentPickerQuery.value = "";
        addStudentError.value = "";
        showAddStudentModal.value = true;
        try {
            availableStudents.value = await apiFetch("/api/v1/teachers/available-students");
        } catch (e) {
            addStudentError.value = "加载学生列表失败: " + (e.message || e);
        }
    };

    const addNewStudent = async () => {
        if (!selectedPickStudentId.value) return;
        addStudentError.value = "";
        try {
            const s = await apiFetch("/api/v1/teachers/my-students", {
                method: "POST",
                body: JSON.stringify({ student_record_id: selectedPickStudentId.value })
            });
            const profile = await apiFetch(`/api/v1/students/${s.id}`);
            teacherStudents.value.push(buildStudentCard(s, profile));
            showAddStudentModal.value = false;
            showToast(`已将 ${s.name} 添加到学生清单`);
        } catch (e) {
            const msg = e.message || "";
            addStudentError.value = msg.includes("409") ? "该学生已在您的清单中" : "添加失败: " + msg;
        }
    };

    const removeStudent = async (studentId) => {
        try {
            await apiFetch(`/api/v1/teachers/my-students/${studentId}`, { method: "DELETE" });
            teacherStudents.value = teacherStudents.value.filter(s => s.id !== studentId);
            if (selectedStudentId.value === studentId)
                selectedStudentId.value = teacherStudents.value[0]?.id ?? null;
            showRemoveConfirmId.value = null;
            showToast("已移除学生");
        } catch (e) {
            if ((e.message || "").includes("404")) {
                teacherStudents.value = teacherStudents.value.filter(s => s.id !== studentId);
                if (selectedStudentId.value === studentId)
                    selectedStudentId.value = teacherStudents.value[0]?.id ?? null;
                showRemoveConfirmId.value = null;
                showToast("该学生已不在清单中，已同步列表");
                return;
            }
            showRemoveConfirmId.value = null;
            showToast("移除失败：" + (e.message || e), "error");
        }
    };

    const runTeacherComparison = async ({ onComplete } = {}) => {
        const student = selectedStudent.value;
        if (!student?.id) {
            teacherComparisonError.value = "请先选择学生";
            return;
        }
        teacherCompareRunning.value = true;
        teacherComparisonError.value = "";
        try {
            const res = await apiFetch("/api/v1/compare/run", {
                method: "POST",
                body: JSON.stringify({
                    student_id: student.id,
                    group: teacherCompareGroup.value,
                    time_range: teacherTimeRange.value,
                    dims: compareDims?.value || ["gpa"],
                }),
            });
            teacherComparisonMessage.value = res.message;
            Object.entries(res.dims).forEach(([dim, d]) => {
                const bm = d.benchmark;
                const personal = d.personal;
                const hasData = bm !== null && bm !== undefined;
                const unit = d.unit || "";
                let text;
                if (!hasData) {
                    text = `个人：${personal}${unit}（暂无群体基准数据）`;
                } else if (personal > bm) {
                    text = `个人 ${personal}${unit}，群体均值 ${bm}${unit}，高于均值 ${(personal - bm).toFixed(2)}${unit}`;
                } else if (personal < bm) {
                    text = `个人 ${personal}${unit}，群体均值 ${bm}${unit}，低于均值 ${(bm - personal).toFixed(2)}${unit}`;
                } else {
                    text = `个人 ${personal}${unit}，与群体均值持平（${bm}${unit}）`;
                }
                if (dimResults) dimResults[dim] = text;
                teacherDimResults[dim] = text;
                teacherDimResultsData[dim] = { personal, benchmark: hasData ? bm : 0, label: d.label, unit };
            });
            teacherComparisonResult.value = true;
            onComplete?.();
        } catch (e) {
            teacherComparisonError.value = e.message || "对比分析失败，请稍后重试";
        } finally {
            teacherCompareRunning.value = false;
        }
    };

    return {
        teacherStudents,
        selectedStudentId,
        selectedStudent,
        showAddStudentModal,
        newStudent,
        availableStudents,
        selectedPickStudentId,
        studentPickerQuery,
        filteredAvailableStudents,
        addStudentError,
        teacherComparisonResult,
        teacherComparisonMessage,
        teacherComparisonError,
        teacherDimResults,
        teacherDimResultsData,
        teacherCompareRunning,
        teacherCompareGroup,
        teacherTimeRange,
        teacherSemesters,
        teacherHomeCards,
        teacherStudentStats,
        teacherCompareStats,
        initTeacher,
        loadMyStudents,
        openAddStudentModal,
        addNewStudent,
        removeStudent,
        showRemoveConfirmId,
        loadTeacherStudentSemesters,
        runTeacherComparison,
    };
}
