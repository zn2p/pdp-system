export const studentTemplate = `
<div v-if="currentRole === 'student'">
    <div v-if="currentPage === 'home'">
        <div class="hero-grid">
            <div class="hero-left"><div class="card"><h1 style="font-size:48px;">成长数据<br>可视化</h1><div class="desc" style="margin-top:auto;">围绕大学生个人成长与发展需求，帮助用户管理并分析自己的成绩与成就，与大众进行对比从而更清晰地了解自己的水平并规划未来的发展。</div></div></div>
            <div class="hero-right"><div class="card"><h2>📊 学业概览</h2><div class="stats-grid"><div class="stat-mini"><strong>{{ gpaDisplayValue }}</strong>{{ gpaDisplayLabel }}</div><div class="stat-mini"><strong>{{ courses.length }}</strong>课程</div><div class="stat-mini"><strong>{{ achievements.length }}</strong>成就</div><div class="stat-mini"><strong>{{ classRankDisplay }}</strong>班级排名</div></div></div></div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3,1fr); gap: 18px;">
            <div class="card"><h3>课程管理</h3><p class="text-muted">记录成绩并自动计算 GPA。</p></div>
            <div class="card"><h3>大众对比</h3><p class="text-muted">查看与同专业学生的能力差距。</p></div>
            <div class="card"><h3>展示视图</h3><p class="text-muted">为教师快速呈现重点。</p></div>
        </div>
    </div>

    <div v-if="currentPage === 'courses'">
        <div class="gpa-card">
            <div style="display: flex; justify-content: space-between;">
                <div><div>{{ leftTitle }}</div><div style="font-family: var(--font-serif); font-size: 54px;">{{ leftValue }}</div><div>总学分 {{ totalCredits }} · 课程 {{ courses.length }}</div></div>
                <div style="text-align:right;"><div>{{ rightTitle }}</div><div style="font-family: var(--font-serif); font-size: 32px;">{{ rightValue }}</div></div>
            </div>
            <div style="margin-top: 16px; display: flex; gap: 20px; align-items: center;">
                <label style="color: #e0d7cf;">📐 评分机制:</label>
                <select v-model="gradeScale" class="input-field" style="width:auto; background:transparent; color:white; border-color:#5e5d59;" @change="updateScale">
                    <option value="gpa4" style="color:#141413;">4.0 绩点制 (A=4.0)</option>
                    <option value="percent" style="color:#141413;">百分制 (平均成绩)</option>
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
        <!-- 概览统计 -->
        <div class="kpi-grid" style="grid-template-columns: repeat(5,1fr); margin-bottom:20px;">
            <div v-for="item in resumeOverviewStats" :key="item.label" class="kpi-card">
                <span>{{ item.label }}</span><strong>{{ item.value }}</strong>
            </div>
        </div>
        <!-- 配置栏 -->
        <div class="card" style="margin-bottom:20px;">
            <div style="display:flex; flex-wrap:wrap; align-items:center; gap:12px; margin-bottom:14px;">
                <label style="color:#141413; font-weight:600; white-space:nowrap;">模板:</label>
                <select v-model="resumeTemplate" class="input-field" style="width:auto; color:#141413; flex-shrink:0;">
                    <option value="single">简约单栏 (经典上下)</option>
                    <option value="double">双栏现代 (左侧信息/技能)</option>
                </select>
                <button class="btn-small btn-brand" @click="openBasicInfoModal"><i class="fas fa-user-edit"></i> 编辑基本信息</button>
                <div style="margin-left:auto; display:flex; gap:8px; flex-shrink:0;">
                    <button class="btn-small" style="background:var(--color-terracotta); color:white; border:none;" @click="exportResume"><i class="fas fa-file-pdf"></i> 导出/打印PDF</button>
                </div>
            </div>
            <div v-if="missingFields.length" class="error-msg" style="margin-bottom:12px;"><i class="fas fa-exclamation-triangle"></i> 请补充信息: {{ missingFields.join('、') }}</div>
            <!-- 技能标签展示 -->
            <div style="display:flex; align-items:center; flex-wrap:wrap; gap:6px; font-size:14px;">
                <span style="color:#7a7068; flex-shrink:0;">技能标签:</span>
                <span v-for="tag in skillTags" :key="tag" class="tag">{{ tag }}</span>
                <span v-if="!skillTags.length" class="text-muted" style="font-size:13px;">暂无技能标签，点击「编辑基本信息」添加</span>
            </div>
        </div>
        <!-- 简历纸张预览 -->
        <div class="card resume-paper">
            <div id="resume-print-area">
                <!-- 单栏模板 -->
                <div v-if="resumeTemplate === 'single'" class="resume-single">
                    <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; padding-bottom:16px; border-bottom:2px solid #e0dbd2; gap:16px;">
                        <div style="flex:1; text-align:center;">
                            <h2 style="margin:0 0 6px; color:#141413; font-size:24px;">{{ basicInfo.name || '未填写姓名' }}</h2>
                            <p style="margin:4px 0; color:#5e5d59; font-size:13px;">{{ basicInfo.jobTarget }}</p>
                            <p v-if="basicInfo.phone" style="margin:3px 0; color:#9e9894; font-size:12px;"><span style="font-weight:normal;">联系电话：</span><strong>{{ basicInfo.phone }}</strong></p>
                            <p v-if="basicInfo.email" style="margin:3px 0; color:#9e9894; font-size:12px;"><span style="font-weight:normal;">邮箱：</span><strong>{{ basicInfo.email }}</strong></p>
                        </div>
                        <img v-if="basicInfo.photo && basicInfo.photo.startsWith('data:')" :src="basicInfo.photo" style="width:80px; height:100px; object-fit:cover; border-radius:4px; border:1px solid #e0dbd2; flex-shrink:0;">
                    </div>
                    <div class="resume-section">
                        <h3>教育背景</h3>
                        <table style="border-collapse:collapse; width:100%; font-size:14px; color:#141413; line-height:1.8;">
                            <tr><td style="width:72px; color:#5e5d59; white-space:nowrap; font-weight:normal;">学校</td><td><strong>{{ basicInfo.school || '待填写' }}</strong></td><td style="width:72px; color:#5e5d59; font-weight:normal;">专业</td><td><strong>{{ basicInfo.major || '待填写' }}</strong></td></tr>
                            <tr v-if="basicInfo.degree || basicInfo.gradYear"><td style="color:#5e5d59; white-space:nowrap; font-weight:normal;">学历</td><td><strong>{{ basicInfo.degree || '—' }}</strong></td><td style="color:#5e5d59; font-weight:normal;">在校时间</td><td><strong>{{ basicInfo.gradYear || '—' }}</strong></td></tr>
                            <tr><td style="color:#5e5d59; font-weight:normal;">GPA</td><td colspan="3"><strong>{{ computedGPA.total }}</strong></td></tr>
                        </table>
                    </div>
                    <div class="resume-section" v-if="skillTags.length">
                        <h3>专业技能</h3>
                        <p style="color:#141413; line-height:2;">
                            <span v-for="tag in skillTags" :key="tag" class="tag" style="margin:2px;">{{ tag }}</span>
                        </p>
                    </div>
                    <div class="resume-section" v-if="internshipItems.length">
                        <h3>实习经历</h3>
                        <div v-for="i in internshipItems" :key="i.id" style="margin-bottom:12px;">
                            <div style="display:flex; justify-content:space-between; align-items:baseline;">
                                <strong class="resume-item-title">{{ i.name }}</strong><span v-if="i.org" style="color:#5e5d59; font-size:13px;"> · {{ i.org }}</span>
                                <span class="resume-date">{{ i.date }}</span>
                            </div>
                            <div v-if="i.description" style="color:#141413; font-size:14px; margin-top:4px; line-height:1.6;">{{ i.description }}</div>
                        </div>
                    </div>
                    <div class="resume-section" v-if="projectItems.length">
                        <h3>项目经历</h3>
                        <div v-for="p in projectItems" :key="p.id" style="margin-bottom:12px;">
                            <div style="display:flex; justify-content:space-between; align-items:baseline;">
                                <strong class="resume-item-title">{{ p.name }}</strong>
                                <span class="resume-date">{{ p.date }}</span>
                            </div>
                            <div v-if="p.description" style="color:#141413; font-size:14px; margin-top:4px; line-height:1.6;">{{ p.description }}</div>
                        </div>
                    </div>
                    <div class="resume-section" v-if="awardItems.length">
                        <h3>荣誉奖项</h3>
                        <div v-for="a in awardItems" :key="a.id" style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:6px;">
                            <span style="color:#141413;"><strong>{{ a.name }}</strong><span v-if="a.org"> · {{ a.org }}</span><span v-if="a.level"> · {{ a.level }}</span></span>
                            <span class="resume-date">{{ a.date }}</span>
                        </div>
                    </div>
                    <div class="resume-section" v-if="certItems.length">
                        <h3>证书/资质</h3>
                        <div v-for="c in certItems" :key="c.id" style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:6px;">
                            <span style="color:#141413;"><strong>{{ c.name }}</strong><span v-if="c.level"> · {{ c.level }}</span></span>
                            <span class="resume-date">{{ c.date }}</span>
                        </div>
                    </div>
                </div>
                <!-- 双栏模板 -->
                <div v-else class="resume-double">
                    <div style="padding-right:16px; border-right:2px solid #e0dbd2;">
                        <div style="margin-bottom:20px; text-align:center;">
                            <img v-if="basicInfo.photo && basicInfo.photo.startsWith('data:')" :src="basicInfo.photo" style="width:80px; height:100px; object-fit:cover; border-radius:6px; border:1px solid #e0dbd2; margin-bottom:10px; display:block; margin-left:auto; margin-right:auto;">
                            <h2 style="margin:0 0 4px; color:#141413; font-size:20px;">{{ basicInfo.name || '未填写' }}</h2>
                            <p style="color:#5e5d59; font-size:13px; margin:3px 0;">{{ basicInfo.jobTarget }}</p>
                            <p v-if="basicInfo.phone" style="color:#9e9894; font-size:12px; margin:3px 0;"><span style="font-weight:normal;">联系电话：</span><strong>{{ basicInfo.phone }}</strong></p>
                            <p v-if="basicInfo.email" style="color:#9e9894; font-size:12px; margin:3px 0;"><span style="font-weight:normal;">邮箱：</span><strong>{{ basicInfo.email }}</strong></p>
                        </div>
                        <div class="resume-section" v-if="skillTags.length">
                            <h3>专业技能</h3>
                            <div style="display:flex; flex-wrap:wrap; gap:4px;">
                                <span v-for="tag in skillTags" :key="tag" class="tag">{{ tag }}</span>
                            </div>
                        </div>
                        <div class="resume-section" v-if="certItems.length">
                            <h3>证书/资质</h3>
                            <div v-for="c in certItems" :key="c.id" style="font-size:13px; color:#141413; margin-bottom:4px;">
                                {{ c.name }}<span v-if="c.level"> · {{ c.level }}</span> <span class="resume-date">{{ c.date }}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div class="resume-section">
                            <h3>教育背景</h3>
                            <table style="border-collapse:collapse; width:100%; font-size:13px; color:#141413; line-height:1.8;">
                                <tr><td style="width:60px; color:#5e5d59; white-space:nowrap; font-weight:normal;">学校</td><td><strong>{{ basicInfo.school || '待填写' }}</strong></td></tr>
                                <tr><td style="color:#5e5d59; white-space:nowrap; font-weight:normal;">专业</td><td><strong>{{ basicInfo.major || '待填写' }}</strong></td></tr>
                                <tr v-if="basicInfo.degree"><td style="color:#5e5d59; font-weight:normal;">学历</td><td><strong>{{ basicInfo.degree }}</strong></td></tr>
                                <tr v-if="basicInfo.gradYear"><td style="color:#5e5d59; font-weight:normal;">在校时间</td><td><strong>{{ basicInfo.gradYear }}</strong></td></tr>
                                <tr><td style="color:#5e5d59; font-weight:normal;">GPA</td><td><strong>{{ computedGPA.total }}</strong></td></tr>
                            </table>
                        </div>
                        <div class="resume-section" v-if="internshipItems.length">
                            <h3>实习经历</h3>
                            <div v-for="i in internshipItems" :key="i.id" style="margin-bottom:10px;">
                                <div style="display:flex; justify-content:space-between;">
                                    <strong class="resume-item-title">{{ i.name }}</strong><span v-if="i.org" style="color:#5e5d59; font-size:13px;"> · {{ i.org }}</span>
                                    <span class="resume-date">{{ i.date }}</span>
                                </div>
                                <div v-if="i.description" style="color:#141413; font-size:14px; margin-top:3px;">{{ i.description }}</div>
                            </div>
                        </div>
                        <div class="resume-section" v-if="projectItems.length">
                            <h3>项目经历</h3>
                            <div v-for="p in projectItems" :key="p.id" style="margin-bottom:10px;">
                                <div style="display:flex; justify-content:space-between;">
                                    <strong class="resume-item-title">{{ p.name }}</strong>
                                    <span class="resume-date">{{ p.date }}</span>
                                </div>
                                <div v-if="p.description" style="color:#141413; font-size:14px; margin-top:3px;">{{ p.description }}</div>
                            </div>
                        </div>
                        <div class="resume-section" v-if="awardItems.length">
                            <h3>荣誉奖项</h3>
                            <div v-for="a in awardItems" :key="a.id" style="display:flex; justify-content:space-between; margin-bottom:5px;">
                                <span style="color:#141413;"><strong>{{ a.name }}</strong><span v-if="a.org"> · {{ a.org }}</span></span>
                                <span class="resume-date">{{ a.date }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
            <h3><i class="fas fa-database"></i> 大众基准数据导入</h3>
            <p style="color:#888;font-size:13px;margin-bottom:8px;">CSV 格式（首行为表头）：<code>gpa,courses,competitions,internships,awards,certs</code>，每行一名学生数据。</p>
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
            <div class="form-row"><label>目标对比群体</label><select v-model="compareGroup" class="input-field"><option>同校</option><option>同专业</option><option>同年级</option><option>同升学方向</option><option>同就业方向</option></select></div>
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
                <select v-model="timeRange" class="input-field">
                    <option v-for="s in availableSemesters" :key="s" :value="s">{{ s }}</option>
                </select>
            </div>
            <div class="form-row"><label>数据展示粒度</label><select v-model="granularity" class="input-field"><option>按学期</option><option>按学年</option><option>全大学周期</option></select></div>
            <button class="btn btn-brand" style="width:auto;" @click="runComparison" :disabled="compareRunning || compareDims.length === 0">
                <span v-if="compareRunning"><i class="fas fa-spinner fa-spin"></i> 分析中…</span>
                <span v-else><i class="fas fa-play-circle"></i> 执行对比分析</span>
            </button>

            <div v-if="comparisonResult" class="compare-result-box" style="margin-top:16px;">
                <h4><i class="fas fa-poll"></i> 对比结论</h4>
                <div style="margin-bottom:12px;padding:10px;background:#faf8f5;border-radius:6px;color:#444;">{{ comparisonMessage }}</div>
                <div v-for="dim in compareDims" :key="dim" style="margin-top:10px;padding:8px 10px;border-left:3px solid #c96442;background:#fdf9f7;border-radius:0 4px 4px 0;">
                    <strong style="color:#c96442;">{{ getDimName(dim) }}：</strong><span>{{ getDimResult(dim) }}</span>
                </div>
                <div class="chart-container" style="margin-top:18px;"><canvas id="compareChart"></canvas></div>
            </div>
            <div v-if="comparisonError" class="error-msg" style="margin-top:12px;"><i class="fas fa-exclamation-circle"></i> {{ comparisonError }}</div>
        </div>
    </div>
</div>
`;
