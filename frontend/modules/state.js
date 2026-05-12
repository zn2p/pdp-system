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

    // ── 当前学生数据库 ID（登录后赋值）────────────────────────
    const currentStudentId = ref(null);

    // ── 课程 ─────────────────────────────────────────────────
    const coursesModule = useCourses({
        apiFetch,
        currentStudentId,
        onDataChanged: () => updateCharts()
    });
    const {
        courses, expandedCourses, gradeScale, showCourseModal, editingCourse, courseForm, courseFormError,
        showDeleteConfirm, pendingDeleteCourseId, deleteError,
        initCourses, getGpaPoint, computedStats, computedGPA, totalCredits, highestCourse,
        leftTitle, rightTitle, leftValue, rightValue, gpaDisplayValue, gpaDisplayLabel, classRankDisplay,
        courseOverviewStats, toggleCourseDetail, updateScale, openAddCourseModal,
        editCourse, saveCourse, deleteCourse, cancelDeleteCourse, confirmDeleteCourse
    } = coursesModule;

    // ── 成就 ─────────────────────────────────────────────────
    const achievementsModule = useAchievements({
        apiFetch,
        currentStudentId,
        onDataChanged: () => updateCharts()
    });
    const {
        achievements, expandedAchieves, showAchieveModal, editingAchieve, achieveForm, errors,
        initAchievements, internshipItems, projectItems, awardItems, certItems, sortedAchievements,
        achievementOverviewStats, toggleAchieveDetail, openAddAchievementModal,
        editAchievement, saveAchievement, deleteAchievement, handleAttachment,
        cancelDeleteAchievement, confirmDeleteAchievement,
        showDeleteAchieveConfirm, pendingDeleteAchieveId, deleteAchieveError,
        previewAttachment, cancelAchieveModal
    } = achievementsModule;

    // ── 简历 ─────────────────────────────────────────────────
    const resumeModule = useResume({ apiFetch, currentStudentId, projectItems, internshipItems, awardItems, certItems });
    const {
        showBasicModal, showPreviewModal, resumeTemplate, basicInfo, skillTags,
        skillTagInput, basicInfoSaving, basicInfoError,
        missingFields, filledProfileFields, profileCompletionRate, exportFileName,
        resumeChecklist, resumeOverviewStats, loadProfile,
        openBasicInfoModal, saveBasicInfo, addSkillTag, removeSkillTag,
        handlePhoto, previewFullResume, exportResume
    } = resumeModule;

    // ── 对比（学生）──────────────────────────────────────────
    const compareModule = useCompare({ computedGPA, apiFetch, currentStudentId, courses, achievements });
    const {
        comparisonResult, compareRunning, compareGroup, compareDims, timeRange, granularity,
        benchmarkFile, benchmarkGroup, benchmarkTimeRange, importStatus, importRunning,
        comparisonMessage, comparisonError, dimResults, dimResultsData, availableSemesters,
        compareOverviewStats, getDimName, getDimResult, handleBenchmarkFile, importBenchmark
    } = compareModule;

    const runComparison = () => compareModule.runComparison({ onComplete: () => updateCharts() });

    // ── 教师 ─────────────────────────────────────────────────
    const teacherModule = useTeacher({ apiFetch, showToast, compareDims, dimResults });
    const {
        teacherStudents, selectedStudentId, selectedStudent, showAddStudentModal,
        newStudent, availableStudents, selectedPickStudentId, studentPickerQuery,
        filteredAvailableStudents, addStudentError, teacherComparisonResult,
        teacherComparisonMessage, teacherComparisonError,
        teacherDimResults, teacherDimResultsData, teacherCompareRunning,
        teacherCompareGroup, teacherTimeRange, teacherSemesters,
        showRemoveConfirmId,
        teacherHomeCards, teacherStudentStats, teacherCompareStats, initTeacher,
        openAddStudentModal, addNewStudent, removeStudent, loadTeacherStudentSemesters
    } = teacherModule;

    const runTeacherComparison = () => teacherModule.runTeacherComparison({ onComplete: () => updateCharts() });

    // ── 图表 ─────────────────────────────────────────────────
    const { updateCharts, updateTeacherChart } = useCharts({
        courses,
        getGpaPoint,
        computedGPA,
        comparisonResult,
        teacherComparisonResult,
        selectedStudent,
        compareDims,
        dimResultsData,
        teacherDimResultsData,
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
                        currentStudentId.value = target.id;
                        const profile = await apiFetch(`/api/v1/students/${target.id}`);
                        courses.value = profile.courses || [];
                        achievements.value = profile.achievements || [];
                        loadProfile(profile);
                    }
                } catch (e) {
                    console.error("fetchStudentProfile error", e);
                }
            } else if (result.role === "staff") {
                try {
                    initTeacher();
                    await teacherModule.loadMyStudents();
                } catch (e) {
                    console.warn("Failed to load teacher students", e);
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
        currentStudentId.value = null;
        currentPage.value = "home";
        initCourses();
        initAchievements();
        loadProfile({});
        initTeacher();    }

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
        courses, expandedCourses, gradeScale, showCourseModal, editingCourse, courseForm, courseFormError,
        showDeleteConfirm, pendingDeleteCourseId, deleteError,
        getGpaPoint, computedGPA, totalCredits,
        leftTitle, rightTitle, leftValue, rightValue, gpaDisplayValue, gpaDisplayLabel, classRankDisplay,
        courseOverviewStats, toggleCourseDetail, updateScale,
        openAddCourseModal, editCourse, saveCourse, deleteCourse, cancelDeleteCourse, confirmDeleteCourse,
        // 成就
        achievements, expandedAchieves, showAchieveModal, editingAchieve, achieveForm, errors,
        internshipItems, projectItems, awardItems, certItems, sortedAchievements,
        achievementOverviewStats, toggleAchieveDetail,
        openAddAchievementModal, editAchievement, saveAchievement, deleteAchievement,
        handleAttachment, previewAttachment, cancelAchieveModal,
        cancelDeleteAchievement, confirmDeleteAchievement,
        showDeleteAchieveConfirm, deleteAchieveError,
        // 简历
        showBasicModal, showPreviewModal, resumeTemplate, basicInfo, skillTags,
        skillTagInput, basicInfoSaving, basicInfoError,
        missingFields, profileCompletionRate, exportFileName,
        resumeChecklist, resumeOverviewStats,
        openBasicInfoModal, saveBasicInfo, addSkillTag, removeSkillTag, handlePhoto, previewFullResume, exportResume,
        // 对比（学生）
        comparisonResult, compareRunning, compareGroup, compareDims, timeRange, granularity,
        benchmarkFile, benchmarkGroup, benchmarkTimeRange, importStatus, importRunning,
        comparisonMessage, comparisonError, dimResults, dimResultsData, availableSemesters, compareOverviewStats,
        getDimName, getDimResult, handleBenchmarkFile, importBenchmark, runComparison,
        // 首页卡片
        studentHomeCards,
        // 教师
        teacherStudents, selectedStudentId, selectedStudent, showAddStudentModal,
        newStudent, availableStudents, selectedPickStudentId, studentPickerQuery,
        filteredAvailableStudents, addStudentError,
        teacherComparisonResult, teacherComparisonMessage, teacherComparisonError,
        teacherDimResults, teacherDimResultsData, teacherCompareRunning,
        teacherCompareGroup, teacherTimeRange, teacherSemesters,
        showRemoveConfirmId,
        teacherHomeCards, teacherStudentStats, teacherCompareStats,
        openAddStudentModal, addNewStudent, removeStudent, loadTeacherStudentSemesters, runTeacherComparison
    };
}
