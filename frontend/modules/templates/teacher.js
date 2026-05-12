export const teacherTemplate = `
<div v-else>
    <div v-if="currentPage === 'home'">
        <div class="hero-grid">
            <div class="hero-left"><div class="card"><h1 style="font-size:48px;">教师工作台<br><span style="font-size:18px; font-weight:normal;">数据驱动 · 精准指导</span></h1><div class="desc" style="margin-top:auto;">查看所带学生的成长数据，快速定位学业情况，为个性化辅导提供依据。</div></div></div>
            <div class="hero-right"><div class="card"><h2>📊 今日概览</h2><div class="stats-grid"><div class="stat-mini"><strong>{{ teacherStudents.length }}</strong>学生数</div><div class="stat-mini"><strong>{{ teacherStudentStats[1]?.value || '0.00' }}</strong>平均GPA</div><div class="stat-mini"><strong>{{ teacherStudentStats[2]?.value || '0 人' }}</strong>高潜学生</div><div class="stat-mini"><strong>{{ teacherStudentStats[3]?.value || '0 人' }}</strong>待补充</div></div></div></div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
            <div class="card" style="cursor:pointer;" @click="currentPage='students'"><h3><i class="fas fa-users"></i> 学生展示</h3><p class="text-muted">简历卡片式浏览所有学生档案，快速了解能力画像。</p></div>
            <div class="card" style="cursor:pointer;" @click="currentPage='compare'"><h3><i class="fas fa-chart-line"></i> 对比分析</h3><p class="text-muted">导入基准数据，多维度对比学生与群体水平。</p></div>
        </div>
    </div>

    <div v-if="currentPage === 'students'">
        <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h3 style="margin:0;"><i class="fas fa-users"></i> 学生展示 (简历视图)</h3>
                <button class="btn-small btn-brand" @click="openAddStudentModal"><i class="fas fa-plus"></i> 新增学生</button>
            </div>
            <div class="student-resume-grid">
                <div v-for="student in teacherStudents" :key="student.id" class="student-resume-card"
                     :style="selectedStudentId === student.id ? 'border:2px solid #c96442;box-shadow:0 0 0 3px rgba(201,100,66,0.12);' : ''">
                    <div class="student-card-header" style="display:flex;justify-content:space-between;align-items:flex-start;">
                        <h4 style="margin:0;">{{ student.name }} <span style="font-size:14px; font-weight:normal;">{{ student.studentId }}</span></h4>
                        <span v-if="selectedStudentId === student.id" style="font-size:11px;background:#c96442;color:#fff;border-radius:10px;padding:2px 8px;white-space:nowrap;margin-left:8px;">当前分析对象</span>
                    </div>
                    <div style="font-size:13px;margin-top:8px;">
                        <p><strong>求职意向:</strong> {{ student.basic?.jobTarget || '未填写' }}</p>
                        <p><strong>学校:</strong> {{ student.basic?.school || '—' }} · {{ student.basic?.major || '—' }}</p>
                        <p><strong>GPA:</strong> {{ student.gpa }}<span v-if="student.coreCourses" style="color:#888;"> · 高分课程: {{ student.coreCourses }}</span></p>
                        <p v-if="student.internship"><strong>实习:</strong> {{ student.internship }}</p>
                        <p v-if="student.project"><strong>项目:</strong> {{ student.project }}</p>
                        <p v-if="student.awards"><strong>奖项:</strong> {{ student.awards }}</p>
                        <p v-if="!student.internship && !student.project && !student.awards" style="color:#aaa;">成就信息未填写</p>
                    </div>
                    <div style="margin-top:12px;border-top:1px solid #ede9e0;padding-top:10px;display:flex;gap:8px;">
                        <button v-if="selectedStudentId !== student.id"
                                class="btn-small btn-brand" style="flex:1;"
                                @click="selectedStudentId = student.id; currentPage = 'compare'">
                            <i class="fas fa-chart-bar"></i> 选为分析对象
                        </button>
                        <button v-else
                                class="btn-small" style="flex:1;background:#fdf9f7;color:#c96442;border-color:#c96442;"
                                @click="currentPage = 'compare'">
                            <i class="fas fa-arrow-right"></i> 查看对比分析
                        </button>
                        <button v-if="showRemoveConfirmId !== student.id"
                                class="btn-small" style="color:#b53333;border-color:#e0c0c0;"
                                @click="showRemoveConfirmId = student.id"
                                title="移除学生">
                            <i class="fas fa-user-minus"></i>
                        </button>
                        <div v-else style="display:flex;align-items:center;gap:6px;flex:1;">
                            <span style="font-size:12px;color:#b53333;"><i class="fas fa-exclamation-triangle"></i> 确认移除？</span>
                            <button class="btn-small" style="color:#b53333;border-color:#b53333;" @click="removeStudent(student.id)">是</button>
                            <button class="btn-small" @click="showRemoveConfirmId = null">否</button>
                        </div>
                    </div>
                </div>
                <div v-if="!teacherStudents.length" class="text-muted" style="padding:20px;">暂无学生数据，请先点击右上角「新增学生」。</div>
            </div>
        </div>
    </div>

    <div v-if="currentPage === 'compare'">
        <div class="card" style="padding:14px 20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div style="display:flex;align-items:center;gap:12px;">
                    <i class="fas fa-user-graduate" style="color:#c96442;font-size:16px;"></i>
                    <span style="font-weight:600;">当前分析对象：</span>
                    <template v-if="selectedStudent">
                        <span style="font-size:15px;font-weight:600;color:#c96442;">{{ selectedStudent.name }}</span>
                        <span style="color:#888;font-size:13px;">{{ selectedStudent.studentId }}</span>
                    </template>
                    <span v-else style="color:#aaa;font-size:13px;">未选择学生</span>
                    <button class="btn-small" style="margin-left:4px;" @click="currentPage = 'students'">
                        <i class="fas fa-exchange-alt"></i> 更换学生
                    </button>
                </div>
                <button class="btn-small btn-brand" @click="openAddStudentModal"><i class="fas fa-plus"></i> 新增学生</button>
            </div>
        </div>

        <div class="card">
            <h3><i class="fas fa-database"></i> 大众基准数据导入</h3>
            <p style="color:#888;font-size:13px;margin-bottom:8px;">CSV 格式（首行为表头）：<code>gpa,courses,competitions,internships,awards,certs</code>，每行一名学生数据。与学生端共用同一基准数据库。</p>
            <div class="form-row"><label>数据文件 (CSV)</label><input type="file" @change="handleBenchmarkFile" accept=".csv" style="display:none;" ref="benchmarkFileInput"><button class="btn-small" @click="$refs.benchmarkFileInput.click()"><i class="fas fa-upload"></i> 选择文件</button><span v-if="benchmarkFile" style="margin-left:8px;color:#555;"> {{ benchmarkFile.name }}</span></div>
            <div class="form-row"><label>所属群体</label><select v-model="benchmarkGroup" class="input-field"><option>同校</option><option>同专业</option><option>同年级</option><option>同升学方向</option><option>同就业方向</option></select></div>
            <div class="form-row"><label>统计时间范围</label><input v-model="benchmarkTimeRange" class="input-field" placeholder="填写后与对比时间范围精确匹配，如：全部、2024春"></div>
            <button class="btn-small btn-brand" @click="importBenchmark" :disabled="importRunning">
                <span v-if="importRunning"><i class="fas fa-spinner fa-spin"></i> 导入中…</span>
                <span v-else><i class="fas fa-cloud-upload-alt"></i> 开始导入</span>
            </button>
            <div v-if="importStatus" class="import-preview" style="margin-top:10px;">
                <div v-if="importStatus.success" style="color:#2e7d32;"><i class="fas fa-check-circle"></i> 导入成功！共 {{ importStatus.successCount }} 条有效数据<span v-if="importStatus.failCount">，{{ importStatus.failCount }} 条解析失败</span>。</div>
                <div v-if="!importStatus.success && !importStatus.successCount" style="color:#b53333;"><i class="fas fa-times-circle"></i> 导入失败。</div>
                <div v-if="importStatus.errors && importStatus.errors.length" style="margin-top:6px;"><span class="error-msg"><i class="fas fa-exclamation-triangle"></i> 解析错误：</span><ul style="margin:4px 0 0 16px;padding:0;"><li v-for="(err,idx) in importStatus.errors" :key="idx" style="color:#b53333;font-size:13px;">{{ err.row }}：{{ err.reason }}</li></ul></div>
            </div>
        </div>

        <div class="card">
            <h3><i class="fas fa-chart-bar"></i> 个人 vs 群体多维度对比</h3>
            <div v-if="!selectedStudentId" style="padding:16px 0;text-align:center;">
                <p class="text-muted" style="margin-bottom:12px;">尚未选择分析对象，请先前往学生展示页选择学生。</p>
                <button class="btn-small btn-brand" @click="currentPage = 'students'"><i class="fas fa-users"></i> 前往学生展示</button>
            </div>
            <template v-else>
                <div class="form-row"><label>目标对比群体</label><select v-model="teacherCompareGroup" class="input-field"><option>同校</option><option>同专业</option><option>同年级</option><option>同升学方向</option><option>同就业方向</option></select></div>
                <div class="form-row"><label>对比维度 (多选)</label>
                    <div style="display:flex;flex-wrap:wrap;gap:10px;">
                        <label><input type="checkbox" value="gpa" v-model="compareDims"> GPA</label>
                        <label><input type="checkbox" value="course" v-model="compareDims"> 课程修读</label>
                        <label><input type="checkbox" value="competition" v-model="compareDims"> 竞赛经历</label>
                        <label><input type="checkbox" value="internship" v-model="compareDims"> 实习经历</label>
                        <label><input type="checkbox" value="award" v-model="compareDims"> 获奖情况</label>
                        <label><input type="checkbox" value="cert" v-model="compareDims"> 技能证书</label>
                    </div>
                </div>
                <div class="form-row"><label>对比时间范围</label>
                    <select v-model="teacherTimeRange" class="input-field">
                        <option v-for="s in teacherSemesters" :key="s" :value="s">{{ s }}</option>
                    </select>
                </div>
                <div class="form-row"><label>数据展示粒度</label><select v-model="granularity" class="input-field"><option>按学期</option><option>按学年</option><option>全大学周期</option></select></div>
                <button class="btn btn-brand" style="width:auto;" @click="runTeacherComparison" :disabled="teacherCompareRunning || compareDims.length === 0">
                    <span v-if="teacherCompareRunning"><i class="fas fa-spinner fa-spin"></i> 分析中…</span>
                    <span v-else><i class="fas fa-play-circle"></i> 执行对比分析</span>
                </button>

                <div v-if="teacherComparisonResult" class="compare-result-box" style="margin-top:16px;">
                    <h4><i class="fas fa-poll"></i> 对比结论（学生：{{ selectedStudent?.name }}）</h4>
                    <div style="margin-bottom:12px;padding:10px;background:#faf8f5;border-radius:6px;color:#444;">{{ teacherComparisonMessage }}</div>
                    <div v-for="dim in compareDims" :key="dim" style="margin-top:10px;padding:8px 10px;border-left:3px solid #c96442;background:#fdf9f7;border-radius:0 4px 4px 0;">
                        <strong style="color:#c96442;">{{ getDimName(dim) }}：</strong><span>{{ teacherDimResults[dim] || '暂无对比数据' }}</span>
                    </div>
                    <div class="chart-container" style="margin-top:18px;"><canvas id="teacherCompareChart"></canvas></div>
                </div>
                <div v-if="teacherComparisonError" class="error-msg" style="margin-top:12px;"><i class="fas fa-exclamation-circle"></i> {{ teacherComparisonError }}</div>
            </template>
        </div>
    </div>
</div>
`;
