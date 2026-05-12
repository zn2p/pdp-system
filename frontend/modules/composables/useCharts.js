// 图表模块 —— 由负责数据可视化的成员维护
// 负责：Chart.js 实例生命周期管理、图表更新逻辑

const { nextTick } = window.Vue;

/**
 * @param {{
 *   courses: import('vue').Ref,
 *   getGpaPoint: Function,
 *   computedGPA: import('vue').ComputedRef,
 *   comparisonResult: import('vue').Ref,
 *   teacherComparisonResult: import('vue').Ref,
 *   selectedStudent: import('vue').ComputedRef
 * }} deps
 */
export function useCharts({ courses, getGpaPoint, computedGPA, comparisonResult, teacherComparisonResult, selectedStudent, compareDims, dimResultsData, teacherDimResultsData }) {
    const chartInstances = {};

    function updateCharts() {
        nextTick(() => {
            try {
                // 学生 GPA 趋势图
                const studentChartCanvas = document.getElementById("studentGpaChart");
                if (studentChartCanvas) {
                    const ctx = studentChartCanvas.getContext("2d");
                    if (chartInstances.studentGpa) chartInstances.studentGpa.destroy();

                    // 按学期聚合并排序
                    const semMap = {};
                    courses.value.forEach(c => {
                        const sem = c.semester || "未标注";
                        if (!semMap[sem]) semMap[sem] = [];
                        semMap[sem].push(Number(getGpaPoint(c)));
                    });
                    // 排序：第N学期按N升序，其他保持字母序
                    const sortedSems = Object.keys(semMap).sort((a, b) => {
                        const na = parseInt(a.match(/\d+/)?.[0] ?? "0");
                        const nb = parseInt(b.match(/\d+/)?.[0] ?? "0");
                        return na !== nb ? na - nb : a.localeCompare(b);
                    });
                    const semesters = sortedSems.length ? sortedSems : ["暂无数据"];
                    const gpaData = sortedSems.length
                        ? sortedSems.map(s => {
                            const vals = semMap[s];
                            return parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
                        })
                        : [0];

                    chartInstances.studentGpa = new window.Chart(ctx, {
                        type: "bar",
                        data: {
                            labels: semesters,
                            datasets: [{
                                label: "学期平均GPA",
                                data: gpaData,
                                backgroundColor: "rgba(201, 100, 66, 0.75)",
                                borderColor: "#c96442",
                                borderWidth: 1.5,
                                borderRadius: 6,
                                maxBarThickness: 36
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false },
                                tooltip: { callbacks: { label: ctx => ` GPA: ${ctx.parsed.y}` } }
                            },
                            scales: {
                                x: { grid: { display: false }, ticks: { color: "#7a7068" } },
                                y: {
                                    beginAtZero: false,
                                    min: 1.0,
                                    max: 4.0,
                                    ticks: { color: "#7a7068", stepSize: 0.5 },
                                    grid: { color: "rgba(0,0,0,0.06)" }
                                }
                            }
                        }
                    });
                }

                // 学生对比图 —— 所有选中维度，个人 vs 群体均值
                const compareChartCanvas = document.getElementById("compareChart");
                if (compareChartCanvas && comparisonResult.value) {
                    const ctx = compareChartCanvas.getContext("2d");
                    if (chartInstances.compare) chartInstances.compare.destroy();

                    const dims = compareDims?.value || ["gpa"];
                    const labels = dims.map(d => (dimResultsData?.[d]?.label) || d);
                    const personalData = dims.map(d => dimResultsData?.[d]?.personal ?? 0);
                    const benchmarkData = dims.map(d => dimResultsData?.[d]?.benchmark ?? 0);
                    const hasBenchmark = benchmarkData.some(v => v > 0);

                    const datasets = [
                        { label: "个人", data: personalData, backgroundColor: "#c96442", maxBarThickness: 80 },
                    ];
                    if (hasBenchmark) {
                        datasets.push({ label: "群体均值", data: benchmarkData, backgroundColor: "#b9b4a5", maxBarThickness: 80 });
                    }

                    chartInstances.compare = new window.Chart(ctx, {
                        type: dims.length > 1 ? "bar" : "bar",
                        data: { labels, datasets },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: "top" } },
                            scales: {
                                y: { beginAtZero: true, ticks: { color: "#7a7068" }, grid: { color: "rgba(0,0,0,0.06)" } }
                            }
                        }
                    });
                }

                // 教师对比图 —— 所有选中维度，个人 vs 群体均值
                const teacherCompareCanvas = document.getElementById("teacherCompareChart");
                if (teacherCompareCanvas && teacherComparisonResult.value) {
                    const ctx = teacherCompareCanvas.getContext("2d");
                    if (chartInstances.teacherCompare) chartInstances.teacherCompare.destroy();

                    const dims = compareDims?.value || ["gpa"];
                    const labels = dims.map(d => (teacherDimResultsData?.[d]?.label) || d);
                    const personalData = dims.map(d => teacherDimResultsData?.[d]?.personal ?? 0);
                    const benchmarkData = dims.map(d => teacherDimResultsData?.[d]?.benchmark ?? 0);
                    const hasBenchmark = benchmarkData.some(v => v > 0);

                    const datasets = [
                        { label: "个人", data: personalData, backgroundColor: "#c96442", maxBarThickness: 80 },
                    ];
                    if (hasBenchmark) {
                        datasets.push({ label: "群体均值", data: benchmarkData, backgroundColor: "#b9b4a5", maxBarThickness: 80 });
                    }

                    chartInstances.teacherCompare = new window.Chart(ctx, {
                        type: "bar",
                        data: { labels, datasets },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: "top" } },
                            scales: {
                                y: { beginAtZero: true, ticks: { color: "#7a7068" }, grid: { color: "rgba(0,0,0,0.06)" } }
                            }
                        }
                    });
                }
            } catch (e) {
                console.warn("Chart update error", e);
            }
        });
    }

    // updateTeacherChart 目前与 updateCharts 行为一致，保留独立入口方便后续扩展
    const updateTeacherChart = () => updateCharts();

    return { updateCharts, updateTeacherChart };
}
