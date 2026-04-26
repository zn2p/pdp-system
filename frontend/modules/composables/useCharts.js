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
export function useCharts({ courses, getGpaPoint, computedGPA, comparisonResult, teacherComparisonResult, selectedStudent }) {
    const chartInstances = {};

    function updateCharts() {
        nextTick(() => {
            try {
                // 学生 GPA 趋势图
                const studentChartCanvas = document.getElementById("studentGpaChart");
                if (studentChartCanvas) {
                    const ctx = studentChartCanvas.getContext("2d");
                    if (chartInstances.studentGpa) chartInstances.studentGpa.destroy();
                    const semesters = courses.value.length
                        ? courses.value.map(c => c.semester || "未标注")
                        : ["暂无数据"];
                    const gpaData = courses.value.length
                        ? courses.value.map(c => Number(getGpaPoint(c)))
                        : [0];
                    chartInstances.studentGpa = new window.Chart(ctx, {
                        type: "bar",
                        data: { labels: semesters, datasets: [{ label: "学期GPA", data: gpaData, backgroundColor: "#c96442" }] },
                        options: { responsive: true, maintainAspectRatio: false }
                    });
                }

                // 学生对比图
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

                // 教师对比图
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

    // updateTeacherChart 目前与 updateCharts 行为一致，保留独立入口方便后续扩展
    const updateTeacherChart = () => updateCharts();

    return { updateCharts, updateTeacherChart };
}
