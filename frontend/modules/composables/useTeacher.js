// 教师模块 —— 由负责模块4/5（教师视图与教师对比分析）的成员维护
// 负责：学生清单管理、学生选择、教师视角对比分析

const { ref, reactive, computed } = window.Vue;

function createInitialTeacherStudents() {
    return [
        {
            id: "s1", name: "王语涵", studentId: "2024001",
            basic: { jobTarget: "Java开发", school: "杭州电子科技大学", major: "计算机科学与技术" },
            gpa: "3.65", coreCourses: "数据结构, 数据库", internship: "阿里巴巴实习",
            project: "智能推荐系统", awards: "算法大赛二等奖"
        },
        {
            id: "s2", name: "李思睿", studentId: "2024002",
            basic: { jobTarget: "前端开发", school: "某某大学", major: "软件工程" },
            gpa: "3.82", coreCourses: "Web开发, 操作系统", internship: "腾讯前端",
            project: "电商后台", awards: "数学建模省一"
        }
    ];
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
    const selectedStudentId = ref("s1");
    const showAddStudentModal = ref(false);
    const newStudent = reactive({ name: "", studentId: "" });
    const availableStudents = ref([]);
    const selectedPickStudentId = ref(null);
    const studentPickerQuery = ref("");
    const addStudentError = ref("");
    const teacherComparisonResult = ref(false);
    const teacherComparisonMessage = ref("");
    const teacherComparisonError = ref("");

    function initTeacher() {
        teacherStudents.value = createInitialTeacherStudents();
    }
    initTeacher();

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
        { label: "基准文件", value: "未上传", desc: "支持导入统一群体基准。" },
        { label: "分析状态", value: teacherComparisonResult.value ? "已生成" : "待执行", desc: "当前是否已有教师分析结论。" }
    ]);

    // ── 操作函数 ──────────────────────────────────────────────
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
            teacherStudents.value.push({
                id: s.id,
                name: s.name,
                studentId: s.student_id,
                basic: { school: s.school, major: s.major },
                gpa: "3.0",
                coreCourses: "",
                internship: "",
                project: "",
                awards: ""
            });
            showAddStudentModal.value = false;
            showToast(`已将 ${s.name} 添加到学生清单`);
        } catch (e) {
            const msg = e.message || "";
            addStudentError.value = msg.includes("409") ? "该学生已在您的清单中" : "添加失败: " + msg;
        }
    };

    const runTeacherComparison = ({ onComplete } = {}) => {
        teacherComparisonResult.value = true;
        teacherComparisonMessage.value = `${selectedStudent.value?.name} 的GPA处于前25%`;
        dimResults.gpa = `个人 ${selectedStudent.value?.gpa || "3.50"}，群体均值 3.32`;
        onComplete?.();
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
        teacherHomeCards,
        teacherStudentStats,
        teacherCompareStats,
        initTeacher,
        openAddStudentModal,
        addNewStudent,
        runTeacherComparison
    };
}
