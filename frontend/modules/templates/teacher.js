export const teacherTemplate = `
<div v-else>
    <div v-if="currentPage === 'home'">
        <div class="hero-grid">
            <div class="hero-left"><div class="card"><h1 style="font-size:48px;">教师工作台<br><span style="font-size:18px; font-weight:normal;">数据驱动 · 精准指导</span></h1><div class="desc" style="margin-top:auto;">查看所带学生的成长数据，快速定位学业情况，为个性化辅导提供依据。</div></div></div>
            <div class="hero-right"><div class="card"><h2>📊 今日概览</h2><div class="stats-grid"><div class="stat-mini"><strong>{{ teacherStudents.length }}</strong>学生数</div><div class="stat-mini"><strong>3.48</strong>平均GPA</div><div class="stat-mini"><strong>12</strong>预警</div><div class="stat-mini"><strong>5</strong>优秀</div></div></div></div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
            <div class="card" style="cursor:pointer;" @click="currentPage='students'"><h3><i class="fas fa-users"></i> 学生展示</h3><p class="text-muted">简历卡片式浏览所有学生档案，快速了解能力画像。</p></div>
            <div class="card" style="cursor:pointer;" @click="currentPage='compare'"><h3><i class="fas fa-chart-line"></i> 对比分析</h3><p class="text-muted">导入基准数据，多维度对比学生与群体水平。</p></div>
        </div>
    </div>

    <div v-if="currentPage === 'students'">
        <div class="card">
            <h3><i class="fas fa-users"></i> 学生展示 (简历视图)</h3>
            <div class="student-resume-grid">
                <div v-for="student in teacherStudents" :key="student.id" class="student-resume-card">
                    <div class="student-card-header">
                        <h4>{{ student.name }} <span style="font-size:14px; font-weight:normal;">{{ student.studentId }}</span></h4>
                    </div>
                    <div style="font-size:13px;">
                        <p><strong>求职意向:</strong> {{ student.basic?.jobTarget || '开发工程师' }}</p>
                        <p><strong>学校:</strong> {{ student.basic?.school || '某某大学' }} · {{ student.basic?.major || '计算机' }}</p>
                        <p><strong>GPA:</strong> {{ student.gpa || '3.5' }} · 核心课程: {{ student.coreCourses || '数据结构, 数据库' }}</p>
                        <p><strong>实习:</strong> {{ student.internship || '阿里巴巴 (2024.07-2024.09)' }}</p>
                        <p><strong>项目:</strong> {{ student.project || '智能推荐系统' }}</p>
                        <p><strong>奖项:</strong> {{ student.awards || '算法大赛省级二等奖' }}</p>
                    </div>
                </div>
                <div v-if="!teacherStudents.length" class="text-muted" style="padding:20px;">暂无学生数据，请先添加学生。</div>
            </div>
        </div>
    </div>

    <div v-if="currentPage === 'compare'">
        <div class="card">
            <div class="flex-row" style="justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <label style="font-weight:600;"><i class="fas fa-user-graduate"></i> 选择学生:</label>
                    <select v-model="selectedStudentId" class="input-field" style="width:200px;">
                        <option v-for="s in teacherStudents" :key="s.id" :value="s.id">{{ s.name }} ({{ s.studentId }})</option>
                    </select>
                </div>
                <button class="btn-small btn-brand" @click="openAddStudentModal"><i class="fas fa-plus"></i> 新增学生</button>
            </div>
        </div>

        <div class="card">
            <h3><i class="fas fa-database"></i> 大众基准数据导入</h3>
            <div class="form-row"><label>数据文件 (Excel/CSV)</label><input type="file" @change="handleBenchmarkFile" accept=".csv,.xlsx,.xls" style="display:none;" ref="benchmarkFileInput"><button class="btn-small" @click="$refs.benchmarkFileInput.click()"><i class="fas fa-upload"></i> 选择文件</button><span v-if="benchmarkFile"> {{ benchmarkFile.name }}</span></div>
            <div class="form-row"><label>所属群体</label><select v-model="benchmarkGroup" class="input-field"><option>同校</option><option>同专业</option><option>同年级</option><option>同升学方向</option><option>同就业方向</option></select></div>
            <div class="form-row"><label>统计时间范围</label><input v-model="benchmarkTimeRange" class="input-field" placeholder="如 2024-2025"></div>
            <button class="btn-small btn-brand" @click="importBenchmark">开始导入</button>
            <div v-if="importStatus" class="import-preview">
                <div v-if="importStatus.success"><i class="fas fa-check-circle" style="color:#2e7d32;"></i> 导入成功！成功 {{ importStatus.successCount }} 条，失败 {{ importStatus.failCount }} 条。</div>
                <div v-if="importStatus.errors.length"><div class="error-msg"><i class="fas fa-exclamation-triangle"></i> 错误详情:</div><ul><li v-for="(err,idx) in importStatus.errors" :key="idx" style="color:#b53333;">{{ err.row }}: {{ err.reason }}</li></ul></div>
            </div>
        </div>

        <div class="card">
            <h3><i class="fas fa-chart-bar"></i> 个人 vs 群体多维度对比</h3>
            <div v-if="!selectedStudentId" class="text-muted">请先在上方选择学生</div>
            <template v-else>
                <div class="form-row"><label>目标对比群体</label><select v-model="compareGroup" class="input-field"><option>同校</option><option>同专业</option><option>同年级</option><option>同升学方向</option><option>同就业方向</option></select></div>
                <div class="form-row"><label>对比维度 (多选)</label>
                    <div><label><input type="checkbox" value="gpa" v-model="compareDims"> GPA排名</label> <label><input type="checkbox" value="course" v-model="compareDims"> 课程修读进度</label> <label><input type="checkbox" value="competition" v-model="compareDims"> 竞赛经历</label> <label><input type="checkbox" value="internship" v-model="compareDims"> 实习经历</label> <label><input type="checkbox" value="award" v-model="compareDims"> 获奖情况</label> <label><input type="checkbox" value="cert" v-model="compareDims"> 技能证书持有</label></div>
                </div>
                <div class="form-row"><label>对比时间范围</label><select v-model="timeRange" class="input-field"><option>全部</option><option>2024春</option><option>2024秋</option></select></div>
                <div class="form-row"><label>数据展示粒度</label><select v-model="granularity" class="input-field"><option>按学期</option><option>按学年</option><option>全大学周期</option></select></div>
                <button class="btn btn-brand" style="width:auto;" @click="runTeacherComparison">执行对比分析</button>

                <div v-if="teacherComparisonResult" class="compare-result-box">
                    <h4>📊 对比结论 (学生: {{ selectedStudent?.name }})</h4>
                    <div v-if="teacherComparisonMessage">{{ teacherComparisonMessage }}</div>
                    <div v-for="dim in compareDims" :key="dim" style="margin-top:12px;">
                        <strong>{{ getDimName(dim) }}:</strong> {{ getDimResult(dim) }}
                    </div>
                    <div class="chart-container"><canvas id="teacherCompareChart"></canvas></div>
                </div>
                <div v-if="teacherComparisonError" class="error-msg mt-4">{{ teacherComparisonError }}</div>
            </template>
        </div>
    </div>
</div>
`;
