// 课程管理模块 —— 由负责模块1（课程成绩管理）的成员维护
// 负责：课程 CRUD、GPA 计算、学期统计

const { ref, reactive, computed } = window.Vue;

function createInitialCourses() {
    return [
        { id: "c1", name: "数据结构", semester: "2024春", code: "CS201", credit: 4, grade: 88, teacher: "李教授", rank: "5/45" },
        { id: "c2", name: "数据库", semester: "2024春", code: "CS305", credit: 3, grade: 92, teacher: "陈老师", rank: "3/45" }
    ];
}

export function useCourses({ onDataChanged } = {}) {
    const courses = ref([]);
    const expandedCourses = ref([]);
    const gradeScale = ref("gpa4");
    const showCourseModal = ref(false);
    const editingCourse = ref(null);
    const courseForm = reactive({
        name: "", semester: "", code: "", credit: 3, grade: 85, teacher: "", rank: "", note: ""
    });

    function initCourses() {
        courses.value = createInitialCourses();
    }
    initCourses();

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
        Object.assign(courseForm, { name: "", semester: "", code: "", credit: 3, grade: 85, teacher: "", rank: "", note: "" });
        showCourseModal.value = true;
    };

    const editCourse = (course) => {
        editingCourse.value = course;
        Object.assign(courseForm, course);
        showCourseModal.value = true;
    };

    const saveCourse = () => {
        if (!courseForm.name || !courseForm.semester || courseForm.credit == null || courseForm.grade == null) return;
        if (editingCourse.value) Object.assign(editingCourse.value, courseForm);
        else courses.value.unshift({ ...courseForm, id: "c" + Date.now() });
        showCourseModal.value = false;
        onDataChanged?.();
    };

    const deleteCourse = (id) => {
        if (confirm("删除？")) {
            courses.value = courses.value.filter(c => c.id !== id);
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
        courseOverviewStats,
        toggleCourseDetail,
        updateScale,
        openAddCourseModal,
        editCourse,
        saveCourse,
        deleteCourse
    };
}
