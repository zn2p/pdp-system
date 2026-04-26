import { LOGIN_HIGHLIGHTS, MODULE_METADATA, createInitialAchievements, createInitialCourses, createInitialTeacherStudents } from "./constants.js";

const { ref, reactive, computed, nextTick, watch } = window.Vue;

export function useAppState() {
    const isLoggedIn = ref(false);
    const currentUser = ref({ name: "张三", displayName: "张三" });
    const currentRole = ref("student");
    const loginForm = reactive({ username: "", password: "", role: "student", displayName: "" });
    const currentPage = ref("home");
    const courses = ref([]);
    const achievements = ref([]);
    const expandedCourses = ref([]);
    const expandedAchieves = ref([]);
    const gradeScale = ref("gpa4");
    const showCourseModal = ref(false);
    const editingCourse = ref(null);
    const courseForm = reactive({ name: "", semester: "", code: "", credit: 3, grade: 85, teacher: "", rank: "", note: "" });
    const showAchieveModal = ref(false);
    const editingAchieve = ref(null);
    const achieveForm = reactive({ name: "", type: "", date: "", org: "", level: "", description: "", tags: "", attachment: "" });
    const errors = reactive({ name: false, type: false, date: false, any: false });
    const comparisonResult = ref(false);
    const compareGroup = ref("同专业");
    const compareDims = ref(["gpa"]);
    const timeRange = ref("全部");
    const granularity = ref("按学期");
    const benchmarkFile = ref(null);
    const benchmarkGroup = ref("同专业");
    const benchmarkTimeRange = ref("");
    const importStatus = ref(null);
    const comparisonMessage = ref("");
    const comparisonError = ref("");
    const dimResults = reactive({});
    const showBasicModal = ref(false);
    const showPreviewModal = ref(false);
    const resumeTemplate = ref("single");
    const basicInfo = reactive({ name: "王语涵", gender: "女", phone: "138-0000-1234", email: "yuhan@edu.cn", jobTarget: "Java/Python开发工程师", school: "杭州电子科技大学", major: "计算机科学与技术", degree: "本科", gradYear: "2021.09-2025.07", photo: "" });
    const skillTags = ref(["Python", "Java", "SQL", "数据分析", "Vue.js"]);
    const teacherStudents = ref([]);
    const selectedStudentId = ref("s1");
    const selectedStudent = computed(() => teacherStudents.value.find((student) => student.id === selectedStudentId.value));
    const showAddStudentModal = ref(false);
    const newStudent = reactive({ name: "", studentId: "" });
    const teacherComparisonResult = ref(false);
    const teacherComparisonMessage = ref("");
    const teacherComparisonError = ref("");
    const token = ref(localStorage.getItem("pdp_token") || "");
    const chartInstances = {};

    const API_BASE = window.__API_BASE__ || "http://127.0.0.1:8000";

    function initData() {
        courses.value = createInitialCourses();
        achievements.value = createInitialAchievements();
        teacherStudents.value = createInitialTeacherStudents();
    }

    initData();

    const menuItems = computed(() => currentRole.value === "student"
        ? [
            { key: "home", label: "首页", icon: "fas fa-home" },
            { key: "courses", label: "课程管理", icon: "fas fa-book" },
            { key: "achievements", label: "成就管理", icon: "fas fa-trophy" },
            { key: "resume", label: "简历生成", icon: "fas fa-file-alt" },
            { key: "compare", label: "大众对比", icon: "fas fa-chart-bar" }
        ]
        : [
            { key: "home", label: "首页", icon: "fas fa-home" },
            { key: "students", label: "学生展示", icon: "fas fa-users" },
            { key: "compare", label: "对比分析", icon: "fas fa-chart-line" }
        ]);
    const pageTitle = computed(() => menuItems.value.find((item) => item.key === currentPage.value)?.label);
    const roleDisplayName = computed(() => currentRole.value === "student" ? "学生" : "教师");
    const activeModule = computed(() => MODULE_METADATA[currentRole.value]?.[currentPage.value] || {
        module: "模块",
        heading: pageTitle.value || "工作区",
        description: "当前页面已按模块组织。",
        tags: ["模块化", "可维护", "可扩展"]
    });

    const gradeToGpa = (grade) => {
        if (grade >= 90) return 4.0;
        if (grade >= 85) return 3.7;
        if (grade >= 82) return 3.3;
        if (grade >= 78) return 3.0;
        if (grade >= 75) return 2.7;
        if (grade >= 72) return 2.3;
        if (grade >= 68) return 2.0;
        return 1.0;
    };

    const computedStats = computed(() => {
        if (!courses.value.length) return { totalGpa: "0.00", avgScore: "0.0" };
        let totalPoint = 0;
        let totalCredit = 0;
        let totalScore = 0;
        courses.value.forEach((course) => {
            const gpa = gradeToGpa(Number(course.grade));
            totalPoint += gpa * Number(course.credit);
            totalCredit += Number(course.credit);
            totalScore += Number(course.grade);
        });
        return {
            totalGpa: totalCredit ? (totalPoint / totalCredit).toFixed(2) : "0.00",
            avgScore: courses.value.length ? (totalScore / courses.value.length).toFixed(1) : "0.0"
        };
    });

    const computedGPA = computed(() => ({ total: computedStats.value.totalGpa }));
    const leftTitle = computed(() => gradeScale.value === "gpa4" ? "总学期平均绩点" : "总学期平均成绩");
    const rightTitle = computed(() => "本学期GPA");
    const leftValue = computed(() => gradeScale.value === "gpa4" ? computedStats.value.totalGpa : computedStats.value.avgScore);
    const rightValue = computed(() => courses.value.length ? gradeToGpa(Number(courses.value[0].grade || 0)).toFixed(2) : "0.00");
    const gpaDisplayValue = computed(() => leftValue.value);
    const gpaDisplayLabel = computed(() => gradeScale.value === "gpa4" ? "GPA" : "平均分");
    const totalCredits = computed(() => courses.value.reduce((sum, course) => sum + Number(course.credit), 0));
    const highestCourse = computed(() => courses.value.reduce((best, course) => (!best || Number(course.grade) > Number(best.grade) ? course : best), null));
    const internshipItems = computed(() => achievements.value.filter((item) => item.type === "实习"));
    const projectItems = computed(() => achievements.value.filter((item) => item.type === "项目"));
    const awardItems = computed(() => achievements.value.filter((item) => item.type === "竞赛" || item.type === "奖项"));
    const certItems = computed(() => achievements.value.filter((item) => item.type === "证书"));
    const sortedAchievements = computed(() => [...achievements.value].sort((a, b) => (b.date || "").localeCompare(a.date || "")));

    const requiredProfileFields = [
        ["name", "姓名"],
        ["phone", "电话"],
        ["email", "邮箱"],
        ["school", "学校名称"],
        ["major", "专业"]
    ];
    const missingFields = computed(() => requiredProfileFields.filter(([key]) => !String(basicInfo[key] || "").trim()).map(([, label]) => label));
    const filledProfileFields = computed(() => requiredProfileFields.length - missingFields.value.length);
    const profileCompletionRate = computed(() => Math.round((filledProfileFields.value / requiredProfileFields.length) * 100));
    const exportFileName = computed(() => `${basicInfo.name || "简历"}_简历.pdf`);

    const studentHomeCards = computed(() => [
        { label: "模块1 · 课程管理", value: `${courses.value.length} 门`, desc: "已录入课程与成绩数据。" },
        { label: "模块2 · 成就管理", value: `${achievements.value.length} 条`, desc: "已沉淀个人成长经历。" },
        { label: "模块3/5 · 输出与分析", value: `${profileCompletionRate.value}%`, desc: "简历资料完整度与分析准备度。" }
    ]);
    const courseOverviewStats = computed(() => [
        { label: "累计课程", value: `${courses.value.length} 门`, desc: "覆盖当前已录入课程记录。" },
        { label: "累计学分", value: `${totalCredits.value}`, desc: "作为 GPA 和成绩统计基础。" },
        { label: "平均成绩", value: `${computedStats.value.avgScore}`, desc: "按当前课程成绩计算均分。" },
        { label: "最高分课程", value: highestCourse.value?.name || "暂无", desc: highestCourse.value ? `${highestCourse.value.grade} 分` : "等待录入成绩" }
    ]);
    const achievementOverviewStats = computed(() => [
        { label: "项目经历", value: `${projectItems.value.length} 项`, desc: "突出项目实践经历。" },
        { label: "实习经历", value: `${internshipItems.value.length} 段`, desc: "用于简历和教师视图展示。" },
        { label: "荣誉奖项", value: `${awardItems.value.length} 项`, desc: "沉淀竞赛和获奖信息。" },
        { label: "证书语言", value: `${certItems.value.length} 项`, desc: "展示技能与资质证明。" }
    ]);
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
    const compareOverviewStats = computed(() => [
        { label: "对比维度", value: `${compareDims.value.length} 项`, desc: "支持多维度组合分析。" },
        { label: "基准数据", value: benchmarkFile.value?.name || "未导入", desc: "导入后可执行群体对比。" },
        { label: "时间范围", value: benchmarkTimeRange.value || timeRange.value, desc: "当前分析时间口径。" },
        { label: "展示粒度", value: granularity.value, desc: "决定图表与结论展示方式。" }
    ]);
    const teacherHomeCards = computed(() => [
        { label: "学生展示", value: `${teacherStudents.value.length} 人`, desc: "快速查看学生画像和简历卡片。", page: "students" },
        { label: "对比分析", value: `${compareDims.value.length} 维`, desc: "执行学生与群体的多维度对比。", page: "compare" }
    ]);
    const teacherStudentStats = computed(() => {
        const avgGpa = teacherStudents.value.length
            ? (teacherStudents.value.reduce((sum, student) => sum + (parseFloat(student.gpa) || 0), 0) / teacherStudents.value.length).toFixed(2)
            : "0.00";
        return [
            { label: "学生总数", value: `${teacherStudents.value.length} 人`, desc: "当前教师可查看的学生档案数。" },
            { label: "平均 GPA", value: avgGpa, desc: "学生群体当前平均绩点。" },
            { label: "高潜学生", value: `${teacherStudents.value.filter((student) => (parseFloat(student.gpa) || 0) >= 3.7).length} 人`, desc: "GPA 较高的学生数量。" },
            { label: "待补充档案", value: `${teacherStudents.value.filter((student) => !student.project || !student.awards).length} 人`, desc: "简历信息仍需完善的学生。" }
        ];
    });
    const teacherCompareStats = computed(() => [
        { label: "已选学生", value: selectedStudent.value?.name || "未选择", desc: "当前对比分析对象。" },
        { label: "对比维度", value: `${compareDims.value.length} 项`, desc: "教师视图下统一查看分析口径。" },
        { label: "基准文件", value: benchmarkFile.value?.name || "未上传", desc: "支持导入统一群体基准。" },
        { label: "分析状态", value: teacherComparisonResult.value ? "已生成" : "待执行", desc: "当前是否已有教师分析结论。" }
    ]);
    const loginHighlights = LOGIN_HIGHLIGHTS;

    async function apiFetch(path, opts = {}) {
        const headers = opts.headers || {};
        if (!headers["Content-Type"] && !(opts.body instanceof FormData)) {
            headers["Content-Type"] = "application/json";
        }
        if (token.value) {
            headers["Authorization"] = `Bearer ${token.value}`;
        }
        const res = await fetch(API_BASE + path, { ...opts, headers });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`${res.status} ${res.statusText}: ${text}`);
        }
        const ct = res.headers.get("content-type") || "";
        return ct.includes("application/json") ? res.json() : res.text();
    }

    async function fetchStudentProfile(studentId) {
        try {
            const profile = await apiFetch(`/api/v1/students/${studentId}`);
            courses.value = profile.courses || [];
            achievements.value = profile.achievements || [];
            basicInfo.name = profile.name || basicInfo.name;
            basicInfo.school = profile.school || basicInfo.school;
            basicInfo.major = profile.major || basicInfo.major;
            return profile;
        } catch (e) {
            console.error("fetchStudentProfile error", e);
            throw e;
        }
    }

    async function handleLogin() {
        if (!loginForm.username || !loginForm.password) {
            alert("请输入用户名和密码");
            return;
        }
        try {
            const data = await apiFetch("/api/v1/auth/login", {
                method: "POST",
                body: JSON.stringify({ username: loginForm.username, password: loginForm.password })
            });
            token.value = data.access_token;
            localStorage.setItem("pdp_token", token.value);
            currentUser.value = { name: loginForm.username, displayName: loginForm.displayName || loginForm.username };
            currentRole.value = loginForm.role;
            if (currentRole.value === "student") {
                const students = await apiFetch("/api/v1/students");
                const target = Array.isArray(students) && students.length
                    ? students.find((student) => student.student_id === loginForm.username) || students[0]
                    : null;
                if (target) {
                    await fetchStudentProfile(target.id);
                }
            }
            isLoggedIn.value = true;
            currentPage.value = "home";
            updateCharts();
        } catch (err) {
            console.error("login error", err);
            alert("登录失败：" + (err.message || err));
        }
    }

    const logout = () => {
        isLoggedIn.value = false;
        token.value = "";
        localStorage.removeItem("pdp_token");
        currentUser.value = { name: "", displayName: "" };
        currentRole.value = "student";
        currentPage.value = "home";
        initData();
    };

    const toggleCourseDetail = (id) => {
        const index = expandedCourses.value.indexOf(id);
        if (index > -1) expandedCourses.value.splice(index, 1);
        else expandedCourses.value.push(id);
    };
    const toggleAchieveDetail = (id) => {
        const index = expandedAchieves.value.indexOf(id);
        if (index > -1) expandedAchieves.value.splice(index, 1);
        else expandedAchieves.value.push(id);
    };
    const getGpaPoint = (course) => gradeToGpa(Number(course.grade)).toFixed(1);
    const updateScale = () => updateCharts();

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
        updateCharts();
    };
    const deleteCourse = (id) => {
        if (confirm("删除？")) {
            courses.value = courses.value.filter((course) => course.id !== id);
            updateCharts();
        }
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
        updateCharts();
    };
    const deleteAchievement = (id) => {
        if (confirm("删除？")) {
            achievements.value = achievements.value.filter((achievement) => achievement.id !== id);
            updateCharts();
        }
    };

    const openBasicInfoModal = () => { showBasicModal.value = true; };
    const saveBasicInfo = () => { showBasicModal.value = false; };
    const handlePhoto = (e) => {
        if (e.target.files[0]) basicInfo.photo = e.target.files[0].name;
    };
    const previewFullResume = () => { showPreviewModal.value = true; };
    const exportResume = (format) => alert(`导出${format}: ${exportFileName.value}`);
    const handleBenchmarkFile = (e) => { benchmarkFile.value = e.target.files[0]; };
    const importBenchmark = () => {
        importStatus.value = {
            success: true,
            successCount: 128,
            failCount: 2,
            errors: [
                { row: "第14行", reason: "GPA字段缺失" },
                { row: "第28行", reason: "学号格式错误" }
            ]
        };
    };
    const getDimName = (dim) => ({ gpa: "GPA排名", course: "课程修读", competition: "竞赛经历", internship: "实习经历", award: "获奖情况", cert: "证书持有" }[dim]);
    const getDimResult = (dim) => dimResults[dim] || "暂无对比数据";
    const runComparison = () => {
        comparisonResult.value = true;
        comparisonMessage.value = "你的GPA处于同专业前20%";
        dimResults.gpa = "个人 3.65，群体均值 3.32，处于前20%";
        dimResults.course = "核心课程修读进度高于群体均值 12%";
        dimResults.competition = "竞赛经历数量与群体均值持平";
        dimResults.internship = "已有 1 段实习经历，高于群体平均";
        dimResults.award = "奖项层级接近同专业前25%";
        dimResults.cert = "证书数量略低于群体均值";
        updateCharts();
    };

    const openAddStudentModal = () => {
        newStudent.name = "";
        newStudent.studentId = "";
        showAddStudentModal.value = true;
    };
    const addNewStudent = () => {
        if (!newStudent.name || !newStudent.studentId) return;
        teacherStudents.value.push({
            id: "s" + Date.now(),
            name: newStudent.name,
            studentId: newStudent.studentId,
            basic: {},
            gpa: "3.0",
            coreCourses: "",
            internship: "",
            project: "",
            awards: ""
        });
        showAddStudentModal.value = false;
    };
    const runTeacherComparison = () => {
        teacherComparisonResult.value = true;
        teacherComparisonMessage.value = `${selectedStudent.value?.name} 的GPA处于前25%`;
        dimResults.gpa = `个人 ${selectedStudent.value?.gpa || "3.50"}，群体均值 3.32`;
        updateTeacherChart();
    };

    function updateCharts() {
        nextTick(() => {
            try {
                const studentChartCanvas = document.getElementById("studentGpaChart");
                if (studentChartCanvas) {
                    const ctx = studentChartCanvas.getContext("2d");
                    if (chartInstances.studentGpa) chartInstances.studentGpa.destroy();
                    const semesters = courses.value.length ? courses.value.map((course) => course.semester || "未标注") : ["暂无数据"];
                    const gpaData = courses.value.length ? courses.value.map((course) => Number(getGpaPoint(course))) : [0];
                    chartInstances.studentGpa = new window.Chart(ctx, {
                        type: "bar",
                        data: { labels: semesters, datasets: [{ label: "学期GPA", data: gpaData, backgroundColor: "#c96442" }] },
                        options: { responsive: true, maintainAspectRatio: false }
                    });
                }

                const compareChartCanvas = document.getElementById("compareChart");
                if (compareChartCanvas && comparisonResult.value) {
                    const ctx = compareChartCanvas.getContext("2d");
                    if (chartInstances.compare) chartInstances.compare.destroy();
                    chartInstances.compare = new window.Chart(ctx, {
                        type: "bar",
                        data: {
                            labels: ["GPA"],
                            datasets: [
                                { label: "个人", data: [Number(computedGPA.value.total || 0)], backgroundColor: "#c96442" },
                                { label: "群体均值", data: [3.32], backgroundColor: "#b9b4a5" }
                            ]
                        },
                        options: { responsive: true, maintainAspectRatio: false }
                    });
                }

                const teacherCompareCanvas = document.getElementById("teacherCompareChart");
                if (teacherCompareCanvas && teacherComparisonResult.value) {
                    const ctx = teacherCompareCanvas.getContext("2d");
                    if (chartInstances.teacherCompare) chartInstances.teacherCompare.destroy();
                    const studentGpa = parseFloat(selectedStudent.value?.gpa) || 3.5;
                    chartInstances.teacherCompare = new window.Chart(ctx, {
                        type: "bar",
                        data: {
                            labels: ["GPA"],
                            datasets: [
                                { label: "个人", data: [studentGpa], backgroundColor: "#c96442" },
                                { label: "群体均值", data: [3.32], backgroundColor: "#b9b4a5" }
                            ]
                        },
                        options: { responsive: true, maintainAspectRatio: false }
                    });
                }
            } catch (e) {
                console.warn("Chart update error", e);
            }
        });
    }

    function updateTeacherChart() {
        updateCharts();
    }

    watch([currentPage, courses, achievements, gradeScale, comparisonResult, teacherComparisonResult], () => updateCharts(), { deep: true });

    return {
        isLoggedIn,
        currentUser,
        currentRole,
        loginForm,
        currentPage,
        menuItems,
        pageTitle,
        roleDisplayName,
        activeModule,
        loginHighlights,
        courses,
        achievements,
        sortedAchievements,
        expandedCourses,
        expandedAchieves,
        gradeScale,
        leftTitle,
        rightTitle,
        leftValue,
        rightValue,
        gpaDisplayValue,
        gpaDisplayLabel,
        totalCredits,
        comparisonResult,
        compareGroup,
        compareDims,
        timeRange,
        granularity,
        benchmarkFile,
        benchmarkGroup,
        benchmarkTimeRange,
        importStatus,
        comparisonMessage,
        comparisonError,
        dimResults,
        studentHomeCards,
        courseOverviewStats,
        achievementOverviewStats,
        resumeChecklist,
        resumeOverviewStats,
        compareOverviewStats,
        teacherHomeCards,
        teacherStudentStats,
        teacherCompareStats,
        showCourseModal,
        editingCourse,
        courseForm,
        showAchieveModal,
        editingAchieve,
        achieveForm,
        errors,
        showBasicModal,
        showPreviewModal,
        resumeTemplate,
        basicInfo,
        skillTags,
        internshipItems,
        projectItems,
        awardItems,
        certItems,
        missingFields,
        profileCompletionRate,
        exportFileName,
        computedGPA,
        teacherStudents,
        selectedStudentId,
        selectedStudent,
        showAddStudentModal,
        newStudent,
        teacherComparisonResult,
        teacherComparisonMessage,
        teacherComparisonError,
        handleLogin,
        logout,
        toggleCourseDetail,
        toggleAchieveDetail,
        getGpaPoint,
        updateScale,
        openAddCourseModal,
        editCourse,
        saveCourse,
        deleteCourse,
        openAddAchievementModal,
        editAchievement,
        saveAchievement,
        deleteAchievement,
        handleAttachment,
        previewAttachment,
        cancelAchieveModal,
        openBasicInfoModal,
        saveBasicInfo,
        handlePhoto,
        previewFullResume,
        exportResume,
        handleBenchmarkFile,
        importBenchmark,
        runComparison,
        getDimName,
        getDimResult,
        openAddStudentModal,
        addNewStudent,
        runTeacherComparison
    };
}
