// 编排层 —— 组合所有 composable，处理跨模块逻辑
// 此文件仅做「接线」工作，各业务逻辑请到对应 composable 中修改

import { LOGIN_HIGHLIGHTS, MODULE_METADATA } from "./shared/constants.js";
import { useToasts } from "./composables/useToasts.js";
import { useAuth } from "./composables/useAuth.js";
import { useCourses } from "./composables/useCourses.js";
import { useAchievements } from "./composables/useAchievements.js";
import { useResume } from "./composables/useResume.js";
import { useCompare } from "./composables/useCompare.js";
import { useTeacher } from "./composables/useTeacher.js";
import { useCharts } from "./composables/useCharts.js";

const { ref, computed, watch } = window.Vue;

export function useAppState() {
    // ── 通知 ─────────────────────────────────────────────────
    const { toasts, showToast } = useToasts();

    // ── 认证 ─────────────────────────────────────────────────
    const auth = useAuth({ showToast });
    const {
        apiFetch, token, isLoggedIn, showRegister, currentUser, currentRole,
        loginForm, registerForm, registerError, performLogin, handleRegister, clearAuthState
    } = auth;

    // ── 当前页面（跨模块共享）────────────────────────────────
    const currentPage = ref("home");

    // ── 课程 ─────────────────────────────────────────────────
    const coursesModule = useCourses({
        onDataChanged: () => updateCharts()
    });
    const {
        courses, expandedCourses, gradeScale, showCourseModal, editingCourse, courseForm,
        initCourses, getGpaPoint, computedStats, computedGPA, totalCredits, highestCourse,
        leftTitle, rightTitle, leftValue, rightValue, gpaDisplayValue, gpaDisplayLabel,
        courseOverviewStats, toggleCourseDetail, updateScale, openAddCourseModal,
        editCourse, saveCourse, deleteCourse
    } = coursesModule;

    // ── 成就 ─────────────────────────────────────────────────
    const achievementsModule = useAchievements({
        onDataChanged: () => updateCharts()
    });
    const {
        achievements, expandedAchieves, showAchieveModal, editingAchieve, achieveForm, errors,
        initAchievements, internshipItems, projectItems, awardItems, certItems, sortedAchievements,
        achievementOverviewStats, toggleAchieveDetail, openAddAchievementModal,
        editAchievement, saveAchievement, deleteAchievement, handleAttachment,
        previewAttachment, cancelAchieveModal
    } = achievementsModule;

    // ── 简历 ─────────────────────────────────────────────────
    const resumeModule = useResume({ projectItems, internshipItems, awardItems, certItems });
    const {
        showBasicModal, showPreviewModal, resumeTemplate, basicInfo, skillTags,
        missingFields, filledProfileFields, profileCompletionRate, exportFileName,
        resumeChecklist, resumeOverviewStats, openBasicInfoModal, saveBasicInfo,
        handlePhoto, previewFullResume, exportResume
    } = resumeModule;

    // ── 对比（学生）──────────────────────────────────────────
    const compareModule = useCompare({ computedGPA });
    const {
        comparisonResult, compareGroup, compareDims, timeRange, granularity,
        benchmarkFile, benchmarkGroup, benchmarkTimeRange, importStatus,
        comparisonMessage, comparisonError, dimResults, compareOverviewStats,
        getDimName, getDimResult, handleBenchmarkFile, importBenchmark
    } = compareModule;

    const runComparison = () => compareModule.runComparison({ onComplete: () => updateCharts() });

    // ── 教师 ─────────────────────────────────────────────────
    const teacherModule = useTeacher({ apiFetch, showToast, compareDims, dimResults });
    const {
        teacherStudents, selectedStudentId, selectedStudent, showAddStudentModal,
        newStudent, availableStudents, selectedPickStudentId, studentPickerQuery,
        filteredAvailableStudents, addStudentError, teacherComparisonResult,
        teacherComparisonMessage, teacherComparisonError, teacherHomeCards,
        teacherStudentStats, teacherCompareStats, initTeacher,
        openAddStudentModal, addNewStudent
    } = teacherModule;

    const runTeacherComparison = () => teacherModule.runTeacherComparison({ onComplete: () => updateCharts() });

    // ── 图表 ─────────────────────────────────────────────────
    const { updateCharts, updateTeacherChart } = useCharts({
        courses,
        getGpaPoint,
        computedGPA,
        comparisonResult,
        teacherComparisonResult,
        selectedStudent
    });

    // ── 菜单 / 页面元信息（跨模块 computed）──────────────────
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

    const pageTitle = computed(() => menuItems.value.find(item => item.key === currentPage.value)?.label);
    const roleDisplayName = computed(() => currentRole.value === "student" ? "学生" : "教师");
    const activeModule = computed(() => MODULE_METADATA[currentRole.value]?.[currentPage.value] || {
        module: "模块",
        heading: pageTitle.value || "工作区",
        description: "当前页面已按模块组织。",
        tags: ["模块化", "可维护", "可扩展"]
    });

    // ── 首页卡片（跨模块 computed）────────────────────────────
    const studentHomeCards = computed(() => [
        { label: "模块1 · 课程管理", value: `${courses.value.length} 门`, desc: "已录入课程与成绩数据。" },
        { label: "模块2 · 成就管理", value: `${achievements.value.length} 条`, desc: "已沉淀个人成长经历。" },
        { label: "模块3/5 · 输出与分析", value: `${profileCompletionRate.value}%`, desc: "简历资料完整度与分析准备度。" }
    ]);

    const loginHighlights = LOGIN_HIGHLIGHTS;

    // ── 跨模块操作：登录 / 退出 ───────────────────────────────
    async function handleLogin() {
        try {
            const result = await performLogin();
            if (!result) return;

            if (result.role === "student") {
                try {
                    const students = await apiFetch("/api/v1/students");
                    const target = Array.isArray(students) && students.length
                        ? students.find(s => s.student_id === loginForm.username) || students[0]
                        : null;
                    if (target) {
                        const profile = await apiFetch(`/api/v1/students/${target.id}`);
                        courses.value = profile.courses || [];
                        achievements.value = profile.achievements || [];
                        basicInfo.name = profile.name || basicInfo.name;
                        basicInfo.school = profile.school || basicInfo.school;
                        basicInfo.major = profile.major || basicInfo.major;
                    }
                } catch (e) {
                    console.error("fetchStudentProfile error", e);
                }
            } else if (result.role === "staff") {
                try {
                    const myStudents = await apiFetch("/api/v1/teachers/my-students");
                    teacherStudents.value = myStudents.map(s => ({
                        id: s.id, name: s.name, studentId: s.student_id,
                        basic: { school: s.school, major: s.major },
                        gpa: "3.0", coreCourses: "", internship: "", project: "", awards: ""
                    }));
                } catch (e) {
                    console.warn("Failed to fetch teacher students", e);
                }
            }

            isLoggedIn.value = true;
            currentPage.value = "home";
            updateCharts();
        } catch (err) {
            console.error("login error", err);
            showToast("登录失败：" + (err.message || err), "error");
        }
    }

    function logout() {
        clearAuthState();
        currentPage.value = "home";
        initCourses();
        initAchievements();
        initTeacher();
    }

    // ── 响应式联动 ────────────────────────────────────────────
    watch(
        [currentPage, courses, achievements, gradeScale, comparisonResult, teacherComparisonResult],
        () => updateCharts(),
        { deep: true }
    );

    // ── 统一导出（模板所需的所有绑定）────────────────────────
    return {
        // 通知
        toasts, showToast,
        // 认证
        isLoggedIn, showRegister, currentUser, currentRole,
        loginForm, registerForm, registerError,
        handleLogin, handleRegister, logout,
        // 导航
        currentPage, menuItems, pageTitle, roleDisplayName, activeModule, loginHighlights,
        // 课程
        courses, expandedCourses, gradeScale, showCourseModal, editingCourse, courseForm,
        getGpaPoint, computedGPA, totalCredits,
        leftTitle, rightTitle, leftValue, rightValue, gpaDisplayValue, gpaDisplayLabel,
        courseOverviewStats, toggleCourseDetail, updateScale,
        openAddCourseModal, editCourse, saveCourse, deleteCourse,
        // 成就
        achievements, expandedAchieves, showAchieveModal, editingAchieve, achieveForm, errors,
        internshipItems, projectItems, awardItems, certItems, sortedAchievements,
        achievementOverviewStats, toggleAchieveDetail,
        openAddAchievementModal, editAchievement, saveAchievement, deleteAchievement,
        handleAttachment, previewAttachment, cancelAchieveModal,
        // 简历
        showBasicModal, showPreviewModal, resumeTemplate, basicInfo, skillTags,
        missingFields, profileCompletionRate, exportFileName,
        resumeChecklist, resumeOverviewStats,
        openBasicInfoModal, saveBasicInfo, handlePhoto, previewFullResume, exportResume,
        // 对比（学生）
        comparisonResult, compareGroup, compareDims, timeRange, granularity,
        benchmarkFile, benchmarkGroup, benchmarkTimeRange, importStatus,
        comparisonMessage, comparisonError, dimResults, compareOverviewStats,
        getDimName, getDimResult, handleBenchmarkFile, importBenchmark, runComparison,
        // 首页卡片
        studentHomeCards,
        // 教师
        teacherStudents, selectedStudentId, selectedStudent, showAddStudentModal,
        newStudent, availableStudents, selectedPickStudentId, studentPickerQuery,
        filteredAvailableStudents, addStudentError,
        teacherComparisonResult, teacherComparisonMessage, teacherComparisonError,
        teacherHomeCards, teacherStudentStats, teacherCompareStats,
        openAddStudentModal, addNewStudent, runTeacherComparison
    };
}
