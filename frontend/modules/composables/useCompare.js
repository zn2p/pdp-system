// 对比分析模块（学生视角）—— 由负责模块5（大众对比分析）的成员维护
// 负责：基准文件导入、维度选择、执行对比、结果展示

const { ref, reactive, computed } = window.Vue;

/**
 * @param {{ computedGPA: import('vue').ComputedRef }} coursesRefs - 来自 useCourses
 */
export function useCompare({ computedGPA }) {
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

    const compareOverviewStats = computed(() => [
        { label: "对比维度", value: `${compareDims.value.length} 项`, desc: "支持多维度组合分析。" },
        { label: "基准数据", value: benchmarkFile.value?.name || "未导入", desc: "导入后可执行群体对比。" },
        { label: "时间范围", value: benchmarkTimeRange.value || timeRange.value, desc: "当前分析时间口径。" },
        { label: "展示粒度", value: granularity.value, desc: "决定图表与结论展示方式。" }
    ]);

    const getDimName = (dim) => ({
        gpa: "GPA排名",
        course: "课程修读",
        competition: "竞赛经历",
        internship: "实习经历",
        award: "获奖情况",
        cert: "证书持有"
    }[dim]);

    const getDimResult = (dim) => dimResults[dim] || "暂无对比数据";

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

    const runComparison = ({ onComplete } = {}) => {
        comparisonResult.value = true;
        comparisonMessage.value = "你的GPA处于同专业前20%";
        dimResults.gpa = `个人 ${computedGPA.value.total}，群体均值 3.32，处于前20%`;
        dimResults.course = "核心课程修读进度高于群体均值 12%";
        dimResults.competition = "竞赛经历数量与群体均值持平";
        dimResults.internship = "已有 1 段实习经历，高于群体平均";
        dimResults.award = "奖项层级接近同专业前25%";
        dimResults.cert = "证书数量略低于群体均值";
        onComplete?.();
    };

    return {
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
        compareOverviewStats,
        getDimName,
        getDimResult,
        handleBenchmarkFile,
        importBenchmark,
        runComparison
    };
}
