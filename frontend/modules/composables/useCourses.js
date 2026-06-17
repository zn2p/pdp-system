// 课程管理模块 —— 由负责模块1（课程成绩管理）的成员维护
// 负责：课程 CRUD、GPA 计算、学期统计

const { ref, reactive, computed } = window.Vue;

function createInitialCourses() {
    return [
        { id: "c1", name: "数据结构", semester: "2024春", code: "CS201", credit: 4, grade: 88, teacher: "李教授", rank: "5/45" },
        { id: "c2", name: "数据库", semester: "2024春", code: "CS305", credit: 3, grade: 92, teacher: "陈老师", rank: "3/45" }
    ];
}

export function useCourses({ apiFetch, currentStudentId, onDataChanged } = {}) {
    const courses = ref([]);
    const expandedCourses = ref([]);
    const gradeScale = ref("gpa4");
    const showCourseModal = ref(false);
    const editingCourse = ref(null);
    const courseFormError = ref("");
    const showDeleteConfirm = ref(false);
    const pendingDeleteCourseId = ref(null);
    const deleteError = ref("");
    const courseForm = reactive({
        name: "", semester: "", code: "", credit: null, grade: null, rankMine: "", rankTotal: "", teacher: "", note: ""
    });

    async function initCourses() {
        if (apiFetch && currentStudentId?.value) {
            try {
                const data = await apiFetch(`/api/v1/students/${currentStudentId.value}/courses`);
                courses.value = Array.isArray(data) ? data : [];
            } catch (e) {
                console.error("initCourses error", e);
                courses.value = [];
            }
        } else {
            courses.value = [];
        }
    }

    // ── GPA 工具 ──────────────────────────────────────────────
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

    const getGpaPoint = (course) => gradeToGpa(Number(course.grade)).toFixed(1);

    // ── 统计 computed ─────────────────────────────────────────
    const computedStats = computed(() => {
        if (!courses.value.length) return { totalGpa: "0.00", avgScore: "0.0" };
        let totalPoint = 0, totalCredit = 0, totalScore = 0;
        courses.value.forEach(c => {
            const gpa = gradeToGpa(Number(c.grade));
            totalPoint += gpa * Number(c.credit);
            totalCredit += Number(c.credit);
            totalScore += Number(c.grade);
        });
        return {
            totalGpa: totalCredit ? (totalPoint / totalCredit).toFixed(2) : "0.00",
            avgScore: courses.value.length ? (totalScore / courses.value.length).toFixed(1) : "0.0"
        };
    });

    const computedGPA = computed(() => ({ total: computedStats.value.totalGpa }));
    const totalCredits = computed(() => courses.value.reduce((sum, c) => sum + Number(c.credit), 0));
    const highestCourse = computed(() =>
        courses.value.reduce((best, c) => (!best || Number(c.grade) > Number(best.grade) ? c : best), null)
    );

    // 班级加权百分位：对每门填了排名的课程，用 (mine-0.5)/total 估算百分位，以学分加权求均
    const classRankDisplay = computed(() => {
        const ranked = courses.value.filter(c => {
            const parts = (c.rank || "").split("/");
            return parts.length === 2 && Number(parts[0]) > 0 && Number(parts[1]) > 0;
        });
        if (!ranked.length) return "暂无";
        let weightedSum = 0, totalW = 0;
        ranked.forEach(c => {
            const parts = c.rank.split("/");
            const mine = Number(parts[0]);
            const total = Number(parts[1]);
            const percentile = (mine - 0.5) / total; // 0~1，越小越好
            const w = Number(c.credit) || 1;
            weightedSum += percentile * w;
            totalW += w;
        });
        const pct = Math.round((weightedSum / totalW) * 100);
        return `Top ${pct}%`;
    });

    const leftTitle = computed(() => gradeScale.value === "gpa4" ? "总学期平均绩点" : "总学期平均成绩");
    const rightTitle = computed(() => "本学期GPA");
    const leftValue = computed(() => gradeScale.value === "gpa4" ? computedStats.value.totalGpa : computedStats.value.avgScore);
    const rightValue = computed(() => courses.value.length
        ? gradeToGpa(Number(courses.value[0].grade || 0)).toFixed(2) : "0.00");
    const gpaDisplayValue = computed(() => leftValue.value);
    const gpaDisplayLabel = computed(() => gradeScale.value === "gpa4" ? "GPA" : "平均分");

    const courseOverviewStats = computed(() => [
        { label: "累计课程", value: `${courses.value.length} 门`, desc: "覆盖当前已录入课程记录。" },
        { label: "累计学分", value: `${totalCredits.value}`, desc: "作为 GPA 和成绩统计基础。" },
        { label: "平均成绩", value: `${computedStats.value.avgScore}`, desc: "按当前课程成绩计算均分。" },
        { label: "最高分课程", value: highestCourse.value?.name || "暂无", desc: highestCourse.value ? `${highestCourse.value.grade} 分` : "等待录入成绩" }
    ]);

    // ── 操作函数 ──────────────────────────────────────────────
    const toggleCourseDetail = (id) => {
        const idx = expandedCourses.value.indexOf(id);
        if (idx > -1) expandedCourses.value.splice(idx, 1);
        else expandedCourses.value.push(id);
    };

    const updateScale = () => onDataChanged?.();

    const openAddCourseModal = () => {
        editingCourse.value = null;
        courseFormError.value = "";
        Object.assign(courseForm, { name: "", semester: "", code: "", credit: null, grade: null, rankMine: "", rankTotal: "", teacher: "", note: "" });
        showCourseModal.value = true;
    };

    const editCourse = (course) => {
        editingCourse.value = course;
        courseFormError.value = "";
        const parts = (course.rank || "").split("/");
        Object.assign(courseForm, {
            ...course,
            rankMine: parts[0] || "",
            rankTotal: parts[1] || ""
        });
        showCourseModal.value = true;
    };

    const saveCourse = async () => {
        const missing = [];
        if (!courseForm.name) missing.push("课程名称");
        if (!courseForm.semester) missing.push("学期");
        if (courseForm.credit == null || courseForm.credit === "") missing.push("学分");
        if (courseForm.grade == null || courseForm.grade === "") missing.push("成绩");
        if (missing.length) { courseFormError.value = `请填写必填项：${missing.join("、")}`; return; }
        const credit = Number(courseForm.credit);
        const grade = Number(courseForm.grade);
        if (!Number.isFinite(credit) || credit <= 0) { courseFormError.value = "学分必须是大于 0 的数字"; return; }
        if (!Number.isFinite(grade) || grade <= 0) { courseFormError.value = "成绩必须大于0"; return; }
        if (grade > 100) { courseFormError.value = "成绩不能超过100"; return; }
        courseFormError.value = "";
        if (apiFetch && currentStudentId?.value) {
            try {
                const rank = courseForm.rankMine && courseForm.rankTotal
                    ? `${courseForm.rankMine}/${courseForm.rankTotal}`
                    : (courseForm.rankMine || "");
                const body = JSON.stringify({
                    name: courseForm.name, semester: courseForm.semester, code: courseForm.code,
                    credit, grade,
                    teacher: courseForm.teacher, rank, note: courseForm.note
                });
                if (editingCourse.value?.id) {
                    const updated = await apiFetch(
                        `/api/v1/students/${currentStudentId.value}/courses/${editingCourse.value.id}`,
                        { method: "PUT", body }
                    );
                    // 用表单数据先覆盖，再用后端返回值覆盖（确保 teacher/code/note 等字段同步）
                    const idx = courses.value.findIndex(c => c.id === editingCourse.value.id);
                    if (idx !== -1) {
                        courses.value[idx] = { ...courses.value[idx], ...courseForm, ...updated };
                    }
                } else {
                    const created = await apiFetch(
                        `/api/v1/students/${currentStudentId.value}/courses`,
                        { method: "POST", body }
                    );
                    courses.value.unshift({ ...courseForm, ...created });
                }
            } catch (e) {
                console.error("saveCourse error", e);
                const message = e.message || String(e);
                if (message.includes("grade") || message.includes("成绩")) {
                    courseFormError.value = grade <= 0 ? "成绩必须大于0" : "成绩不能超过100";
                } else if (message.includes("credit") || message.includes("学分")) {
                    courseFormError.value = "学分必须是大于 0 的数字";
                } else {
                    courseFormError.value = "保存失败，请检查网络或重试";
                }
                return;
            }
        } else {
            if (editingCourse.value) {
                const idx = courses.value.findIndex(c => c.id === editingCourse.value.id);
                if (idx !== -1) courses.value[idx] = { ...courses.value[idx], ...courseForm };
            } else {
                courses.value.unshift({ ...courseForm, id: "c" + Date.now() });
            }
        }
        showCourseModal.value = false;
        onDataChanged?.();
    };

    const deleteCourse = (id) => {
        deleteError.value = "";
        pendingDeleteCourseId.value = id;
        showDeleteConfirm.value = true;
    };

    const cancelDeleteCourse = () => {
        showDeleteConfirm.value = false;
        pendingDeleteCourseId.value = null;
        deleteError.value = "";
    };

    const confirmDeleteCourse = async () => {
        const id = pendingDeleteCourseId.value;
        if (apiFetch && currentStudentId?.value) {
            try {
                await apiFetch(
                    `/api/v1/students/${currentStudentId.value}/courses/${id}`,
                    { method: "DELETE" }
                );
                courses.value = courses.value.filter(c => String(c.id) !== String(id));
                showDeleteConfirm.value = false;
                pendingDeleteCourseId.value = null;
                expandedCourses.value = expandedCourses.value.filter(eid => String(eid) !== String(id));
                onDataChanged?.();
            } catch (e) {
                console.error("deleteCourse error", e);
                deleteError.value = "删除失败，请重试：" + (e.message || e);
            }
        } else {
            courses.value = courses.value.filter(c => String(c.id) !== String(id));
            expandedCourses.value = expandedCourses.value.filter(eid => String(eid) !== String(id));
            showDeleteConfirm.value = false;
            pendingDeleteCourseId.value = null;
            onDataChanged?.();
        }
    };

    return {
        courses,
        expandedCourses,
        gradeScale,
        showCourseModal,
        editingCourse,
        courseForm,
        courseFormError,
        showDeleteConfirm,
        pendingDeleteCourseId,
        deleteError,
        initCourses,
        gradeToGpa,
        getGpaPoint,
        computedStats,
        computedGPA,
        totalCredits,
        highestCourse,
        leftTitle,
        rightTitle,
        leftValue,
        rightValue,
        gpaDisplayValue,
        gpaDisplayLabel,
        classRankDisplay,
        courseOverviewStats,
        toggleCourseDetail,
        updateScale,
        openAddCourseModal,
        editCourse,
        saveCourse,
        deleteCourse,
        cancelDeleteCourse,
        confirmDeleteCourse
    };
}
