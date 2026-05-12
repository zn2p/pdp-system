// 对比分析模块（学生视角）—— 由负责模块5（大众对比分析）的成员维护
// 负责：基准文件导入、维度选择、执行对比、结果展示

const { ref, reactive, computed } = window.Vue;

/**
 * @param {{
 *   computedGPA: import('vue').ComputedRef,
 *   apiFetch: Function,
 *   currentStudentId: import('vue').Ref,
 *   courses: import('vue').Ref,
 *   achievements: import('vue').Ref,
 * }} deps
 */
export function useCompare({ computedGPA, apiFetch, currentStudentId, courses, achievements }) {
    const comparisonResult = ref(false);
    const compareRunning = ref(false);
    const compareGroup = ref("同专业");
    const compareDims = ref(["gpa"]);
    const timeRange = ref("全部");
    const granularity = ref("按学期");
    const benchmarkFile = ref(null);
    const benchmarkGroup = ref("同专业");
    const benchmarkTimeRange = ref("");
    const importStatus = ref(null);
    const importRunning = ref(false);
    const comparisonMessage = ref("");
    const comparisonError = ref("");
    // dimResults[dim] = text description (for template display)
    const dimResults = reactive({});
    // dimResultsData[dim] = { personal, benchmark, label, unit } (for chart)
    const dimResultsData = reactive({});

    // Unique semesters from user's courses (for time range selector)
    const availableSemesters = computed(() => {
        const sems = new Set();
        (courses?.value || []).forEach(c => { if (c.semester) sems.add(c.semester); });
        return ["全部", ...Array.from(sems).sort()];
    });

    const compareOverviewStats = computed(() => [
        { label: "对比维度", value: `${compareDims.value.length} 项`, desc: "支持多维度组合分析。" },
        { label: "基准数据", value: benchmarkFile.value?.name || "未导入", desc: "导入后可执行群体对比。" },
        { label: "时间范围", value: timeRange.value, desc: "当前分析时间口径。" },
        { label: "展示粒度", value: granularity.value, desc: "决定图表与结论展示方式。" }
    ]);

    const getDimName = (dim) => ({
        gpa: "GPA",
        course: "课程修读",
        competition: "竞赛经历",
        internship: "实习经历",
        award: "获奖情况",
        cert: "证书持有"
    }[dim] || dim);

    const getDimResult = (dim) => dimResults[dim] || "暂无对比数据";

    const handleBenchmarkFile = (e) => { benchmarkFile.value = e.target.files[0]; };

    // ── CSV 解析工具 ────────────────────────────────────────────
    function parseCSV(text) {
        const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) return { rows: [], errors: [] };
        const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
        const required = ["gpa", "courses", "competitions", "internships", "awards", "certs"];
        const errors = [];
        const rows = [];
        for (let i = 1; i < lines.length; i++) {
            const vals = lines[i].split(",").map(v => v.trim());
            const row = {};
            let rowOk = true;
            required.forEach((field, fi) => {
                const idx = headers.indexOf(field);
                const raw = idx >= 0 ? vals[idx] : vals[fi];
                if (raw === undefined || raw === "" || isNaN(Number(raw))) {
                    errors.push({ row: `第${i + 1}行`, reason: `字段 ${field} 缺失或非数字` });
                    rowOk = false;
                } else {
                    row[field] = Number(raw);
                }
            });
            if (rowOk) rows.push(row);
        }
        return { rows, errors };
    }

    // ── 导入基准数据 ────────────────────────────────────────────
    const importBenchmark = async () => {
        if (!benchmarkFile.value) {
            importStatus.value = { success: false, errors: [{ row: "-", reason: "请先选择 CSV 文件" }] };
            return;
        }
        importRunning.value = true;
        importStatus.value = null;
        try {
            const text = await benchmarkFile.value.text();
            const { rows, errors } = parseCSV(text);
            if (rows.length === 0) {
                importStatus.value = { success: false, successCount: 0, failCount: errors.length, errors };
                return;
            }
            const res = await apiFetch("/api/v1/compare/import-benchmark", {
                method: "POST",
                body: JSON.stringify({
                    group_name: benchmarkGroup.value,
                    time_range: benchmarkTimeRange.value || "全部",
                    rows,
                }),
            });
            importStatus.value = {
                success: true,
                successCount: res.sample_size,
                failCount: errors.length,
                errors,
            };
        } catch (e) {
            importStatus.value = { success: false, successCount: 0, failCount: 1, errors: [{ row: "-", reason: e.message || "导入失败" }] };
        } finally {
            importRunning.value = false;
        }
    };

    // ── 执行对比分析 ────────────────────────────────────────────
    const runComparison = async ({ onComplete } = {}) => {
        if (!currentStudentId?.value) {
            comparisonError.value = "请先登录";
            return;
        }
        compareRunning.value = true;
        comparisonError.value = "";
        try {
            const res = await apiFetch("/api/v1/compare/run", {
                method: "POST",
                body: JSON.stringify({
                    student_id: currentStudentId.value,
                    group: compareGroup.value,
                    time_range: timeRange.value,
                    dims: compareDims.value,
                }),
            });
            comparisonMessage.value = res.message;
            // Populate dimResults (text) and dimResultsData (chart numbers)
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
                dimResults[dim] = text;
                dimResultsData[dim] = { personal, benchmark: bm !== null && bm !== undefined ? bm : 0, label: d.label, unit };
            });
            comparisonResult.value = true;
            onComplete?.();
        } catch (e) {
            comparisonError.value = e.message || "对比分析失败，请稍后重试";
        } finally {
            compareRunning.value = false;
        }
    };

    return {
        comparisonResult,
        compareRunning,
        compareGroup,
        compareDims,
        timeRange,
        granularity,
        benchmarkFile,
        benchmarkGroup,
        benchmarkTimeRange,
        importStatus,
        importRunning,
        comparisonMessage,
        comparisonError,
        dimResults,
        dimResultsData,
        availableSemesters,
        compareOverviewStats,
        getDimName,
        getDimResult,
        handleBenchmarkFile,
        importBenchmark,
        runComparison,
    };
}
