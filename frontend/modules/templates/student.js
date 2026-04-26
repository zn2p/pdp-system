export const studentTemplate = `
<div v-if="currentRole === 'student'">
    <div v-if="currentPage === 'home'">
        <div class="hero-grid">
            <div class="hero-left"><div class="card"><h1 style="font-size:48px;">成长数据<br>可视化</h1><div class="desc" style="margin-top:auto;">围绕大学生个人成长与发展需求，帮助用户管理并分析自己的成绩与成就，与大众进行对比从而更清晰地了解自己的水平并规划未来的发展。</div></div></div>
            <div class="hero-right"><div class="card"><h2>📊 学业概览</h2><div class="stats-grid"><div class="stat-mini"><strong>{{ gpaDisplayValue }}</strong>{{ gpaDisplayLabel }}</div><div class="stat-mini"><strong>{{ courses.length }}</strong>课程</div><div class="stat-mini"><strong>{{ achievements.length }}</strong>成就</div><div class="stat-mini"><strong>Top 15%</strong>排名</div></div></div></div>
        </div>
        <div class="kpi-grid">
            <div v-for="item in studentHomeCards" :key="item.label" class="kpi-card">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
                <p>{{ item.desc }}</p>
            </div>
        </div>
    </div>

    <div v-if="currentPage === 'courses'">
        <div class="kpi-grid">
            <div v-for="item in courseOverviewStats" :key="item.label" class="kpi-card">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
                <p>{{ item.desc }}</p>
            </div>
        </div>
        <div class="gpa-card">
            <div style="display: flex; justify-content: space-between;">
                <div><div>{{ leftTitle }}</div><div style="font-family: var(--font-serif); font-size: 54px;">{{ leftValue }}</div><div>总学分 {{ totalCredits }} · 课程 {{ courses.length }}</div></div>
                <div style="text-align:right;"><div>{{ rightTitle }}</div><div style="font-family: var(--font-serif); font-size: 32px;">{{ rightValue }}</div></div>
            </div>
            <div style="margin-top: 16px; display: flex; gap: 20px; align-items: center;">
                <label style="color: #e0d7cf;">📐 评分机制:</label>
                <select v-model="gradeScale" class="input-field" style="width:auto; background:transparent; color:white; border-color:#5e5d59;" @change="updateScale">
                    <option value="gpa4">4.0 绩点制 (A=4.0)</option>
                    <option value="percent">百分制 (平均成绩)</option>
                </select>
            </div>
        </div>
        <div class="card">
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;"><h3><i class="fas fa-book-open"></i> 课程列表</h3></div>
            <div v-if="courses.length===0" class="text-muted" style="text-align:center; padding:40px;">暂无课程</div>
            <div v-for="c in courses" :key="c.id" class="course-item" @click="toggleCourseDetail(c.id)">
                <div style="display: flex; justify-content: space-between;"><span>{{ c.name }} <span class="tag">{{ c.semester }}</span></span><span>{{ c.grade }}分 · {{ c.credit }}学分</span></div>
                <div v-if="expandedCourses.includes(c.id)" style="margin-top:16px; padding-top:16px; border-top:1px solid var(--border-color); display:grid; grid-template-columns:1fr 1fr; gap:8px 16px;" @click.stop>
                    <span>📌 编号: {{ c.code }}</span><span>👨‍🏫 教师: {{ c.teacher }}</span>
                    <span>📊 绩点: {{ getGpaPoint(c) }}</span><span>📝 备注: {{ c.note || '无' }}</span>
                    <span>🏆 排名: {{ c.rank || 'N/A' }}</span>
                    <div style="grid-column:span 2; display:flex; gap:8px;"><button class="btn-small" @click="editCourse(c)">编辑</button><button class="btn-small" @click="deleteCourse(c.id)">删除</button></div>
                </div>
            </div>
            <div style="margin-top: 24px; text-align: center;">
                <button class="btn-small" style="background:var(--color-terracotta); color:white; border:none; padding:12px 24px;" @click="openAddCourseModal"><i class="fas fa-plus"></i> 添加新课程</button>
            </div>
        </div>
        <div class="card"><h3>📈 各学期趋势</h3><div class="chart-container"><canvas id="studentGpaChart"></canvas></div></div>
    </div>

    <div v-if="currentPage === 'achievements'">
        <div class="kpi-grid">
            <div v-for="item in achievementOverviewStats" :key="item.label" class="kpi-card">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
                <p>{{ item.desc }}</p>
            </div>
        </div>
        <div class="card">
            <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
                <h3><i class="fas fa-medal"></i> 成就与经历</h3>
                <button class="btn-small" style="background:var(--color-terracotta); color:white;" @click="openAddAchievementModal"><i class="fas fa-plus"></i> 新增成就</button>
            </div>
            <div v-if="sortedAchievements.length===0" class="text-muted" style="text-align:center; padding:40px;">暂无成就，点击新增记录</div>
            <div v-for="ach in sortedAchievements" :key="ach.id" class="achievement-item" @click="toggleAchieveDetail(ach.id)">
                <div style="display:flex; justify-content:space-between;">
                    <span><strong>{{ ach.name }}</strong> <span class="tag">{{ ach.type }}</span></span>
                    <span style="color: var(--text-secondary);">{{ ach.date }}</span>
                </div>
                <div style="font-size:14px; margin-top:6px;" v-if="ach.org">{{ ach.org }} · {{ ach.level || '' }}</div>
                <div v-if="expandedAchieves.includes(ach.id)" style="margin-top:16px; padding-top:16px; border-top:1px solid var(--border-color);" @click.stop>
                    <div><strong>描述：</strong>{{ ach.description || '无' }}</div>
                    <div><strong>标签：</strong>{{ ach.tags || '无' }}</div>
                    <div class="flex-row" style="margin-top:12px;">
                        <span v-if="ach.attachment" class="attachment-preview"><i class="fas fa-paperclip"></i> {{ ach.attachment }} <i class="fas fa-eye" style="margin-left:8px; cursor:pointer;" @click="previewAttachment(ach)"></i></span>
                    </div>
                    <div style="display:flex; gap:8px; margin-top:16px;">
                        <button class="btn-small" @click="editAchievement(ach)"><i class="fas fa-pen"></i> 编辑</button>
                        <button class="btn-small" @click="deleteAchievement(ach.id)"><i class="fas fa-trash"></i> 删除</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-if="currentPage === 'resume'">
        <div class="workbench-grid">
            <div class="aside-panel">
                <div class="section-header">
                    <h3>模块完成度</h3>
                    <span class="module-badge">{{ profileCompletionRate }}%</span>
                </div>
                <ul class="summary-list">
                    <li v-for="field in resumeChecklist" :key="field.label">
                        <span>{{ field.label }}</span>
                        <strong>{{ field.value }}</strong>
                    </li>
                </ul>
            </div>
            <div class="aside-panel">
                <div class="section-header">
                    <h3>已纳入简历模块</h3>
                    <span class="module-badge">{{ resumeOverviewStats.length }}项</span>
                </div>
                <div class="chip-list">
                    <span v-for="item in resumeOverviewStats" :key="item.label" class="chip">{{ item.label }} · {{ item.value }}</span>
                </div>
            </div>
        </div>
        <div class="card">
            <h3 style="color: #141413;"><i class="fas fa-file-alt"></i> 简历配置与生成</h3>
            <div class="flex-row" style="margin-bottom:20px;">
                <label style="color: #141413;"><strong>选择模板:</strong></label>
                <select v-model="resumeTemplate" class="input-field" style="width:auto; color: #141413;">
                    <option value="single">简约单栏 (经典上下)</option>
                    <option value="double">双栏现代 (左侧信息/技能)</option>
                </select>
                <button class="btn-small btn-brand" @click="openBasicInfoModal" style="color: #141413 !important;"><i class="fas fa-user-edit" style="color: #141413;"></i> 编辑基本信息</button>
            </div>
            <div v-if="missingFields.length" class="error-msg" style="margin-bottom:16px; color: #141413;"><i class="fas fa-exclamation-triangle"></i> 基本信息缺失: {{ missingFields.join('、') }}</div>
            <div class="resume-preview">
                <div v-if="resumeTemplate === 'single'" class="resume-single">
                    <h2 style="text-align:center; color: #141413;">{{ basicInfo.name || '未填写' }}</h2>
                    <p style="text-align:center; color: #141413;">{{ basicInfo.jobTarget || '求职意向' }} · {{ basicInfo.phone }} · {{ basicInfo.email }}</p>
                    <div class="resume-section"><h3>教育背景</h3><p style="color: #141413;"><strong>{{ basicInfo.school || '学校' }}</strong> · {{ basicInfo.major || '专业' }} · {{ basicInfo.gradYear || '' }} · GPA {{ computedGPA.total }}</p></div>
                    <div class="resume-section"><h3>专业技能</h3> <p style="color: #141413;">{{ skillTags.join(' · ') || 'Python · SQL' }}</p> </div>
                    <div class="resume-section"><h3>实习经历</h3><div v-for="i in internshipItems"><strong style="color: #141413;">{{ i.name }}</strong> <span class="resume-date">{{ i.date }}</span><br><span style="color: #141413;">{{ i.description }}</span></div><div v-if="!internshipItems.length" class="text-muted">暂无实习经历</div></div>
                    <div class="resume-section"><h3>项目经历</h3><div v-for="p in projectItems"><strong style="color: #141413;">{{ p.name }}</strong> <span class="resume-date">{{ p.date }}</span><br><span style="color: #141413;">{{ p.description }}</span></div><div v-if="!projectItems.length" class="text-muted">暂无项目经历</div></div>
                    <div class="resume-section"><h3>荣誉奖项</h3><div v-for="a in awardItems" style="color: #141413;">{{ a.name }} · {{ a.org }} ({{ a.date }})</div><div v-if="!awardItems.length" class="text-muted">暂无荣誉奖项</div></div>
                    <div class="resume-section"><h3>证书/语言</h3><div v-for="c in certItems" style="color: #141413;">{{ c.name }} · {{ c.level }} ({{ c.date }})</div><div v-if="!certItems.length" class="text-muted">暂无证书</div></div>
                </div>
                <div v-else class="resume-double">
                    <div><h3 style="color: #141413;">{{ basicInfo.name || '未填写' }}</h3><p style="color: #141413;">{{ basicInfo.jobTarget }}<br>{{ basicInfo.phone }}<br>{{ basicInfo.email }}</p><div class="resume-section"><h3>专业技能</h3><p style="color: #141413;">{{ skillTags.join(' · ') }}</p></div><div class="resume-section"><h3>证书/语言</h3><div v-for="c in certItems" style="color: #141413;">{{ c.name }} ({{ c.date }})</div></div></div>
                    <div><div class="resume-section"><h3>教育背景</h3><p style="color: #141413;"><strong>{{ basicInfo.school }}</strong> · {{ basicInfo.major }} · GPA {{ computedGPA.total }}</p></div><div class="resume-section"><h3>实习经历</h3><div v-for="i in internshipItems"><strong style="color: #141413;">{{ i.name }}</strong><br><span style="color: #141413;">{{ i.description }}</span></div></div><div class="resume-section"><h3>项目经历</h3><div v-for="p in projectItems"><strong style="color: #141413;">{{ p.name }}</strong><br><span style="color: #141413;">{{ p.description }}</span></div></div><div class="resume-section"><h3>荣誉奖项</h3><div v-for="a in awardItems" style="color: #141413;">{{ a.name }} · {{ a.date }}</div></div></div>
                </div>
            </div>
            <div class="flex-row"><button class="btn btn-brand" style="width:auto;" @click="previewFullResume"><i class="fas fa-eye"></i> 完整预览</button><button class="btn-small btn-secondary" @click="exportResume('pdf')"><i class="fas fa-file-pdf"></i> 导出PDF</button><button class="btn-small btn-secondary" @click="exportResume('word')"><i class="fas fa-file-word"></i> 导出Word</button></div>
            <p class="text-muted" style="margin-top:12px; color: #141413;">文件名: {{ exportFileName }}</p>
        </div>
    </div>

    <div v-if="currentPage === 'compare'">
        <div class="kpi-grid">
            <div v-for="item in compareOverviewStats" :key="item.label" class="kpi-card">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
                <p>{{ item.desc }}</p>
            </div>
        </div>
        <div class="card">
            <h3><i class="fas fa-database"></i> 大众基准数据导入 (管理员)</h3>
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
            <div class="form-row"><label>目标对比群体</label><select v-model="compareGroup" class="input-field"><option>同校</option><option>同专业</option><option>同年级</option><option>同升学方向</option><option>同就业方向</option></select></div>
            <div class="form-row"><label>对比维度 (多选)</label>
                <div><label><input type="checkbox" value="gpa" v-model="compareDims"> GPA排名</label> <label><input type="checkbox" value="course" v-model="compareDims"> 课程修读进度</label> <label><input type="checkbox" value="competition" v-model="compareDims"> 竞赛经历</label> <label><input type="checkbox" value="internship" v-model="compareDims"> 实习经历</label> <label><input type="checkbox" value="award" v-model="compareDims"> 获奖情况</label> <label><input type="checkbox" value="cert" v-model="compareDims"> 技能证书持有</label></div>
            </div>
            <div class="form-row"><label>对比时间范围</label><select v-model="timeRange" class="input-field"><option>全部</option><option>2024春</option><option>2024秋</option></select></div>
            <div class="form-row"><label>数据展示粒度</label><select v-model="granularity" class="input-field"><option>按学期</option><option>按学年</option><option>全大学周期</option></select></div>
            <button class="btn btn-brand" style="width:auto;" @click="runComparison">执行对比分析</button>

            <div v-if="comparisonResult" class="compare-result-box">
                <h4>📊 对比结论</h4>
                <div v-if="comparisonMessage">{{ comparisonMessage }}</div>
                <div v-for="dim in compareDims" :key="dim" style="margin-top:12px;">
                    <strong>{{ getDimName(dim) }}:</strong> {{ getDimResult(dim) }}
                </div>
                <div class="chart-container"><canvas id="compareChart"></canvas></div>
            </div>
            <div v-if="comparisonError" class="error-msg mt-4">{{ comparisonError }}</div>
        </div>
    </div>
</div>
`;
