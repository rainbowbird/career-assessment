// 前端API集成补丁
// 这个文件包含所有需要修改的函数，用于支持后端API

// 覆盖原有的saveAssessmentResult函数
async function saveAssessmentResult(scores) {
    // 创建新的测评结果
    const assessmentId = Date.now().toString();
    const assessment = {
        id: assessmentId,
        userInfo,
        scores,
        answers: selectedOptions,
        optionMaps: questionOptionMaps,
        date: new Date().toLocaleDateString(),
        time: secondsElapsed
    };
    
    // 同时保存到localStorage（作为本地缓存）
    let assessments = JSON.parse(localStorage.getItem('careerAssessments')) || [];
    assessments.push(assessment);
    localStorage.setItem('careerAssessments', JSON.stringify(assessments));
    
    // 保存到后端数据库
    if (typeof AssessmentAPI !== 'undefined') {
        try {
            await AssessmentAPI.create({
                assessmentId: assessmentId,
                userInfo: userInfo,
                answers: selectedOptions,
                optionMaps: questionOptionMaps,
                scores: scores,
                timeElapsed: secondsElapsed
            });
            console.log('✓ 测评结果已保存到数据库');
        } catch (error) {
            console.warn('保存到数据库失败（离线模式）:', error.message);
        }
    }
}

// 覆盖原有的handleAdminLogin函数
async function handleAdminLogin() {
    const password = document.getElementById('admin-password').value;
    
    try {
        if (typeof AdminAPI !== 'undefined') {
            await AdminAPI.login(password);
            isLoggedIn = true;
            hideAdminLogin();
            buttons.viewText.textContent = '管理员视图';
            showAdminDashboard();
        } else {
            // API未加载时回退到本地验证
            if (password === 'Lonlink789') {
                isLoggedIn = true;
                hideAdminLogin();
                buttons.viewText.textContent = '管理员视图';
                showAdminDashboard();
            } else {
                alert('密码错误，请重试。');
            }
        }
    } catch (error) {
        alert('登录失败: ' + error.message);
    }
}

// 覆盖原有的handleAdminLogout函数
async function handleAdminLogout() {
    try {
        if (typeof AdminAPI !== 'undefined') {
            await AdminAPI.logout();
        }
    } catch (error) {
        console.warn('登出API调用失败:', error);
    }
    
    isLoggedIn = false;
    buttons.viewText.textContent = '管理员登录';
    showSection(sections.welcome);
}

// 覆盖原有的updateAdminStats函数
async function updateAdminStats() {
    try {
        if (typeof AssessmentAPI !== 'undefined') {
            const response = await AssessmentAPI.getStatistics();
            const stats = response.data;
            
            document.getElementById('total-assessments').textContent = stats.totalCount;
            document.getElementById('average-total-score').textContent = stats.averageScore;
            document.getElementById('average-completion-time').textContent = formatTime(stats.averageTime);
            return;
        }
    } catch (error) {
        console.warn('从API获取统计数据失败:', error);
    }
    
    // 回退到localStorage
    const assessments = JSON.parse(localStorage.getItem('careerAssessments')) || [];
    
    document.getElementById('total-assessments').textContent = assessments.length;
    
    if (assessments.length > 0) {
        const totalScores = assessments.reduce((sum, a) => sum + a.scores.totalScore, 0);
        const averageScore = Math.round(totalScores / assessments.length);
        document.getElementById('average-total-score').textContent = averageScore;
        
        const totalTime = assessments.reduce((sum, a) => sum + a.time, 0);
        const averageTime = Math.round(totalTime / assessments.length);
        document.getElementById('average-completion-time').textContent = formatTime(averageTime);
    } else {
        document.getElementById('average-total-score').textContent = 0;
        document.getElementById('average-completion-time').textContent = '00:00';
    }
}

// 覆盖原有的updateAdminDimensionsChart函数
async function updateAdminDimensionsChart() {
    let dimensionAverages = {};
    
    try {
        if (typeof AssessmentAPI !== 'undefined') {
            const response = await AssessmentAPI.getStatistics();
            const stats = response.data;
            
            if (stats.dimensionAverages && stats.dimensionAverages.length > 0) {
                stats.dimensionAverages.forEach(dim => {
                    dimensionAverages[dim.name] = dim.average;
                });
            }
        }
    } catch (error) {
        console.warn('从API获取维度数据失败:', error);
    }
    
    // 如果API数据为空，回退到localStorage
    if (Object.keys(dimensionAverages).length === 0) {
        const assessments = JSON.parse(localStorage.getItem('careerAssessments')) || [];
        const dimensionCount = {};
        
        if (assessments.length > 0) {
            assessments[0].scores.dimensionScores.forEach(dimension => {
                dimensionAverages[dimension.name] = 0;
                dimensionCount[dimension.name] = 0;
            });
            
            assessments.forEach(assessment => {
                assessment.scores.dimensionScores.forEach(dimension => {
                    dimensionAverages[dimension.name] += dimension.score;
                    dimensionCount[dimension.name]++;
                });
            });
            
            Object.keys(dimensionAverages).forEach(dimension => {
                if (dimensionCount[dimension] > 0) {
                    dimensionAverages[dimension] = Math.round(dimensionAverages[dimension] / dimensionCount[dimension]);
                }
            });
        }
    }
    
    const ctx = document.getElementById('admin-dimensions-chart').getContext('2d');
    
    if (window.adminDimensionsChart) {
        window.adminDimensionsChart.destroy();
    }
    
    window.adminDimensionsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(dimensionAverages),
            datasets: [{
                label: '平均分',
                data: Object.values(dimensionAverages),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(239, 68, 68, 0.7)',
                    'rgba(139, 92, 246, 0.7)',
                    'rgba(245, 158, 11, 0.7)'
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(245, 158, 11, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// 覆盖原有的updateAdminScoresDistributionChart函数
async function updateAdminScoresDistributionChart() {
    let distribution = [];
    
    try {
        if (typeof AssessmentAPI !== 'undefined') {
            const response = await AssessmentAPI.getStatistics();
            const stats = response.data;
            
            if (stats.scoreDistribution) {
                distribution = stats.scoreDistribution;
            }
        }
    } catch (error) {
        console.warn('从API获取分数分布失败:', error);
    }
    
    // 如果API数据为空，回退到localStorage
    if (distribution.length === 0) {
        const assessments = JSON.parse(localStorage.getItem('careerAssessments')) || [];
        
        const scoreRanges = [
            { min: 0, max: 59, label: '0-59分' },
            { min: 60, max: 69, label: '60-69分' },
            { min: 70, max: 79, label: '70-79分' },
            { min: 80, max: 89, label: '80-89分' },
            { min: 90, max: 100, label: '90-100分' }
        ];
        
        distribution = scoreRanges.map(range => {
            const count = assessments.filter(a => 
                a.scores.totalScore >= range.min && 
                a.scores.totalScore <= range.max
            ).length;
            return { label: range.label, count };
        });
    }
    
    const ctx = document.getElementById('admin-scores-distribution-chart').getContext('2d');
    
    if (window.adminScoresDistributionChart) {
        window.adminScoresDistributionChart.destroy();
    }
    
    window.adminScoresDistributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: distribution.map(item => item.label),
            datasets: [{
                data: distribution.map(item => item.count),
                backgroundColor: [
                    'rgba(239, 68, 68, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(139, 92, 246, 0.7)'
                ],
                borderColor: [
                    'rgba(239, 68, 68, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(139, 92, 246, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// 覆盖原有的updateMajorDistributionChart函数
async function updateMajorDistributionChart() {
    let majorDistribution = {};
    
    try {
        if (typeof AssessmentAPI !== 'undefined') {
            const response = await AssessmentAPI.getStatistics();
            const stats = response.data;
            
            if (stats.majorDistribution) {
                stats.majorDistribution.forEach(item => {
                    majorDistribution[item.major] = item.count;
                });
            }
        }
    } catch (error) {
        console.warn('从API获取专业分布失败:', error);
    }
    
    // 如果API数据为空，回退到localStorage
    if (Object.keys(majorDistribution).length === 0) {
        const assessments = JSON.parse(localStorage.getItem('careerAssessments')) || [];
        
        assessments.forEach(assessment => {
            const major = assessment.userInfo.major;
            if (major in majorDistribution) {
                majorDistribution[major]++;
            } else {
                majorDistribution[major] = 1;
            }
        });
    }
    
    const labels = Object.keys(majorDistribution);
    const data = Object.values(majorDistribution);
    
    const ctx = document.getElementById('major-distribution-chart').getContext('2d');
    
    if (window.majorDistributionChart) {
        window.majorDistributionChart.destroy();
    }
    
    window.majorDistributionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(239, 68, 68, 0.7)',
                    'rgba(139, 92, 246, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(236, 72, 153, 0.7)'
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(236, 72, 153, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        maxWidth: 150,
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

// 覆盖原有的updateAssessmentsList函数
async function updateAssessmentsList() {
    const assessmentsList = document.getElementById('assessments-list');
    assessmentsList.innerHTML = '';
    
    let assessments = [];
    
    try {
        if (typeof AssessmentAPI !== 'undefined') {
            const response = await AssessmentAPI.getAll({ limit: 100 });
            assessments = response.data.assessments.map(a => ({
                id: a.id,
                userInfo: {
                    name: a.name,
                    major: a.major,
                    class: a.className,
                    email: a.email,
                    education: a.education
                },
                scores: a.scores,
                date: a.createdAt,
                time: a.timeElapsed
            }));
        }
    } catch (error) {
        console.warn('从API获取测评列表失败:', error);
    }
    
    // 如果API数据为空，回退到localStorage
    if (assessments.length === 0) {
        assessments = JSON.parse(localStorage.getItem('careerAssessments')) || [];
    }
    
    if (assessments.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="6" class="py-8 text-center text-neutral">
                <i class="fa fa-folder-open-o text-3xl mb-2"></i>
                <p>暂无测评记录</p>
            </td>
        `;
        assessmentsList.appendChild(emptyRow);
        return;
    }
    
    const sortedAssessments = [...assessments].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedAssessments.forEach(assessment => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50 transition-colors';
        
        const formattedTime = formatTime(assessment.time);
        const scoreClass = getScoreClass(assessment.scores.totalScore);
        
        tr.innerHTML = `
            <td class="py-3 px-4">${assessment.userInfo.name}</td>
            <td class="py-3 px-4">${assessment.userInfo.major}</td>
            <td class="py-3 px-4">${assessment.userInfo.class}</td>
            <td class="py-3 px-4">
                <span class="px-2 py-1 rounded-full text-xs ${scoreClass}">
                    ${assessment.scores.totalScore}
                </span>
            </td>
            <td class="py-3 px-4">
                <div>${assessment.date}</div>
                <div class="text-xs text-neutral">用时: ${formattedTime}</div>
            </td>
            <td class="py-3 px-4">
                <div class="flex space-x-2">
                    <button class="view-simple-report-btn px-3 py-1 border border-green-500 text-green-500 rounded-lg text-xs hover:bg-green-50 transition-all" data-id="${assessment.id}">
                        查看简易报告
                    </button>
                    <button class="view-details-btn px-3 py-1 border border-primary text-primary rounded-lg text-xs hover:bg-primary/5 transition-all" data-id="${assessment.id}">
                        查看详情
                    </button>
                    <button class="delete-assessment-btn px-3 py-1 border border-red-500 text-red-500 rounded-lg text-xs hover:bg-red-50 transition-all" data-id="${assessment.id}">
                        删除
                    </button>
                </div>
            </td>
        `;
        
        assessmentsList.appendChild(tr);
    });
    
    // 绑定事件
    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const assessmentId = btn.getAttribute('data-id');
            showDetailedReport(assessmentId);
        });
    });
    
    document.querySelectorAll('.view-simple-report-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const assessmentId = btn.getAttribute('data-id');
            showSimpleReport(assessmentId);
        });
    });
    
    document.querySelectorAll('.delete-assessment-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const assessmentId = btn.getAttribute('data-id');
            
            if (confirm('确定要删除这条测评记录吗？此操作不可恢复。')) {
                try {
                    if (typeof AssessmentAPI !== 'undefined') {
                        await AssessmentAPI.delete(assessmentId);
                    }
                } catch (error) {
                    console.warn('从API删除失败:', error);
                }
                
                // 同时从localStorage删除
                let assessments = JSON.parse(localStorage.getItem('careerAssessments')) || [];
                assessments = assessments.filter(a => a.id !== assessmentId);
                localStorage.setItem('careerAssessments', JSON.stringify(assessments));
                
                // 刷新列表
                updateAssessmentsList();
                updateAdminStats();
                updateAdminDimensionsChart();
                updateAdminScoresDistributionChart();
                updateMajorDistributionChart();
            }
        });
    });
}

// 添加导出Excel功能
async function exportToExcel() {
    try {
        if (typeof AdminAPI !== 'undefined') {
            await AdminAPI.exportExcel();
            console.log('✓ Excel导出成功');
        } else {
            alert('导出功能暂不可用');
        }
    } catch (error) {
        console.error('导出Excel失败:', error);
        alert('导出失败: ' + error.message);
    }
}

// 修改showAdminDashboard函数以支持异步
async function showAdminDashboard() {
    await updateAdminStats();
    await updateAdminDimensionsChart();
    await updateAdminScoresDistributionChart();
    await updateMajorDistributionChart();
    await updateAssessmentsList();
    showSection(sections.adminDashboard);
}

// 添加Excel导出按钮（在页面加载后）
document.addEventListener('DOMContentLoaded', function() {
    // 在管理员仪表板添加导出按钮
    const adminDashboard = document.getElementById('admin-dashboard-section');
    if (adminDashboard) {
        const header = adminDashboard.querySelector('h2');
        if (header && header.parentElement) {
            const exportBtn = document.createElement('button');
            exportBtn.id = 'export-excel-btn';
            exportBtn.className = 'px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200';
            exportBtn.innerHTML = '<i class="fa fa-file-excel-o mr-1"></i> 导出Excel';
            exportBtn.onclick = exportToExcel;
            
            header.parentElement.insertBefore(exportBtn, header.nextSibling);
        }
    }
});

console.log('✓ API集成补丁已加载');