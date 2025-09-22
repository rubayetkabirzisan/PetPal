const express = require('express');
const router = express.Router();

// In-memory storage for analytics data (in production, this would be a database)
let analyticsData = new Map();
let reportData = new Map();

// Sample analytics data initialization
const initializeAnalyticsData = () => {
  const baseDate = new Date('2025-01-01');
  
  // Generate sample monthly data for the year
  const monthlyData = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (let i = 0; i < 12; i++) {
    const month = new Date(2025, i, 1);
    monthlyData.push({
      month: monthNames[i],
      monthYear: `${monthNames[i]} 2025`,
      adoptions: Math.floor(Math.random() * 20) + 10, // 10-30 adoptions per month
      applications: Math.floor(Math.random() * 40) + 30, // 30-70 applications
      totalPets: Math.floor(Math.random() * 30) + 120, // 120-150 total pets
      successRate: Math.floor(Math.random() * 20) + 70, // 70-90% success rate
      averageTime: Math.floor(Math.random() * 10) + 10, // 10-20 days average
      returnRate: Math.floor(Math.random() * 5) + 2, // 2-7% return rate
      satisfaction: (Math.random() * 1 + 4).toFixed(1), // 4.0-5.0 satisfaction
    });
  }
  
  // Current month metrics (September 2025)
  const currentMetrics = {
    totalPets: 156,
    adoptionsThisMonth: 23,
    activeApplications: 45,
    successRate: 78,
    averageAdoptionTime: 14,
    applicationResponseRate: 89,
    returnRate: 3,
    customerSatisfaction: 4.8,
    monthlyTrend: {
      adoptions: '+12%',
      applications: '+8%',
      successRate: '+5%',
      satisfaction: '+0.2'
    }
  };
  
  analyticsData.set('currentMetrics', currentMetrics);
  analyticsData.set('monthlyData', monthlyData);
  analyticsData.set('lastUpdated', new Date().toISOString());
  
  console.log('Analytics data initialized');
};

// Initialize data
initializeAnalyticsData();

// Helper function to generate CSV content
const generateCSVContent = (data, type = 'monthly') => {
  let csvContent = '';
  
  if (type === 'monthly') {
    csvContent = 'Month,Adoptions,Applications,Total Pets,Success Rate (%),Avg Adoption Time (days),Return Rate (%),Customer Satisfaction\n';
    data.forEach(row => {
      csvContent += `${row.monthYear},${row.adoptions},${row.applications},${row.totalPets},${row.successRate},${row.averageTime},${row.returnRate},${row.satisfaction}\n`;
    });
  } else if (type === 'summary') {
    const metrics = analyticsData.get('currentMetrics');
    csvContent = 'Metric,Value,Description\n';
    csvContent += `Total Pets,${metrics.totalPets},Current total number of pets in system\n`;
    csvContent += `Adoptions This Month,${metrics.adoptionsThisMonth},Number of successful adoptions in current month\n`;
    csvContent += `Active Applications,${metrics.activeApplications},Currently pending adoption applications\n`;
    csvContent += `Success Rate,${metrics.successRate}%,Overall adoption success rate\n`;
    csvContent += `Average Adoption Time,${metrics.averageAdoptionTime} days,Average time from listing to adoption\n`;
    csvContent += `Application Response Rate,${metrics.applicationResponseRate}%,Rate of responded applications\n`;
    csvContent += `Return Rate,${metrics.returnRate}%,Rate of pets returned after adoption\n`;
    csvContent += `Customer Satisfaction,${metrics.customerSatisfaction}/5,Average customer satisfaction rating\n`;
  }
  
  return csvContent;
};

// Helper function to generate JSON report
const generateJSONReport = () => {
  const currentMetrics = analyticsData.get('currentMetrics');
  const monthlyData = analyticsData.get('monthlyData');
  const lastUpdated = analyticsData.get('lastUpdated');
  
  return {
    generatedAt: new Date().toISOString(),
    reportType: 'Monthly Analytics Report',
    period: 'January 2025 - September 2025',
    summary: currentMetrics,
    monthlyBreakdown: monthlyData,
    insights: {
      bestMonth: monthlyData.reduce((prev, current) => 
        (prev.adoptions > current.adoptions) ? prev : current
      ),
      totalYearAdoptions: monthlyData.reduce((sum, month) => sum + month.adoptions, 0),
      averageMonthlyAdoptions: (monthlyData.reduce((sum, month) => sum + month.adoptions, 0) / monthlyData.length).toFixed(1),
      trends: {
        adoptions: 'Increasing trend observed in recent months',
        applications: 'Steady application flow maintained',
        satisfaction: 'Customer satisfaction remains high'
      }
    },
    lastUpdated: lastUpdated
  };
};

// GET /api/analytics/overview - Get current analytics overview
router.get('/overview', (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const currentMetrics = analyticsData.get('currentMetrics');
    const monthlyData = analyticsData.get('monthlyData');
    const lastUpdated = analyticsData.get('lastUpdated');
    
    // Get last 6 months for trend chart
    const recentMonths = monthlyData.slice(-6);
    
    res.json({
      success: true,
      message: 'Analytics overview retrieved successfully',
      data: {
        overview: {
          totalPets: currentMetrics.totalPets,
          adoptionsThisMonth: currentMetrics.adoptionsThisMonth,
          activeApplications: currentMetrics.activeApplications,
          successRate: currentMetrics.successRate
        },
        keyMetrics: {
          averageAdoptionTime: currentMetrics.averageAdoptionTime,
          applicationResponseRate: currentMetrics.applicationResponseRate,
          returnRate: currentMetrics.returnRate,
          customerSatisfaction: currentMetrics.customerSatisfaction
        },
        trends: currentMetrics.monthlyTrend,
        chartData: recentMonths,
        lastUpdated: lastUpdated
      }
    });
    
  } catch (error) {
    console.error('Error getting analytics overview:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/analytics/monthly - Get monthly analytics data
router.get('/monthly', (req, res) => {
  try {
    const { userId, year = '2025' } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const monthlyData = analyticsData.get('monthlyData');
    
    res.json({
      success: true,
      message: `Monthly analytics for ${year} retrieved successfully`,
      data: {
        year: year,
        monthlyData: monthlyData,
        totalAdoptions: monthlyData.reduce((sum, month) => sum + month.adoptions, 0),
        totalApplications: monthlyData.reduce((sum, month) => sum + month.applications, 0),
        averageSuccessRate: (monthlyData.reduce((sum, month) => sum + month.successRate, 0) / monthlyData.length).toFixed(1)
      }
    });
    
  } catch (error) {
    console.error('Error getting monthly analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/analytics/generate-report - Generate downloadable report
router.post('/generate-report', (req, res) => {
  try {
    const { userId, format = 'csv', reportType = 'monthly' } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const allowedFormats = ['csv', 'json'];
    const allowedTypes = ['monthly', 'summary', 'full'];
    
    if (!allowedFormats.includes(format)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid format. Supported formats: csv, json'
      });
    }
    
    if (!allowedTypes.includes(reportType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report type. Supported types: monthly, summary, full'
      });
    }
    
    let reportContent;
    let fileName;
    let mimeType;
    
    const timestamp = new Date().toISOString().split('T')[0];
    
    if (format === 'csv') {
      if (reportType === 'monthly') {
        const monthlyData = analyticsData.get('monthlyData');
        reportContent = generateCSVContent(monthlyData, 'monthly');
        fileName = `petpal-monthly-analytics-${timestamp}.csv`;
      } else if (reportType === 'summary') {
        reportContent = generateCSVContent([], 'summary');
        fileName = `petpal-summary-analytics-${timestamp}.csv`;
      } else {
        // Full report combines both
        const monthlyData = analyticsData.get('monthlyData');
        const summaryContent = generateCSVContent([], 'summary');
        const monthlyContent = generateCSVContent(monthlyData, 'monthly');
        reportContent = summaryContent + '\n\n' + monthlyContent;
        fileName = `petpal-full-analytics-${timestamp}.csv`;
      }
      mimeType = 'text/csv';
    } else {
      // JSON format
      const jsonReport = generateJSONReport();
      reportContent = JSON.stringify(jsonReport, null, 2);
      fileName = `petpal-analytics-${timestamp}.json`;
      mimeType = 'application/json';
    }
    
    // Generate report ID for tracking
    const reportId = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store report data (in production, this might be saved to file storage)
    reportData.set(reportId, {
      id: reportId,
      userId: userId,
      fileName: fileName,
      content: reportContent,
      mimeType: mimeType,
      format: format,
      reportType: reportType,
      size: Buffer.byteLength(reportContent, 'utf8'),
      generatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    });
    
    res.json({
      success: true,
      message: 'Report generated successfully',
      data: {
        reportId: reportId,
        fileName: fileName,
        size: Buffer.byteLength(reportContent, 'utf8'),
        format: format,
        reportType: reportType,
        downloadUrl: `/api/analytics/download/${reportId}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/analytics/download/:reportId - Download generated report
router.get('/download/:reportId', (req, res) => {
  try {
    const { reportId } = req.params;
    const { userId } = req.query;
    
    if (!reportId) {
      return res.status(400).json({
        success: false,
        message: 'Report ID is required'
      });
    }
    
    const report = reportData.get(reportId);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found or expired'
      });
    }
    
    // Check if report belongs to user (basic authorization)
    if (report.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to download this report'
      });
    }
    
    // Check if report has expired
    if (new Date() > new Date(report.expiresAt)) {
      reportData.delete(reportId);
      return res.status(410).json({
        success: false,
        message: 'Report has expired'
      });
    }
    
    // Set appropriate headers for file download
    res.setHeader('Content-Type', report.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${report.fileName}"`);
    res.setHeader('Content-Length', report.size);
    
    // Send the file content
    res.send(report.content);
    
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/analytics/share-data - Get shareable analytics data
router.get('/share-data', (req, res) => {
  try {
    const { userId, format = 'summary' } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const currentMetrics = analyticsData.get('currentMetrics');
    const monthlyData = analyticsData.get('monthlyData');
    
    let shareContent;
    
    if (format === 'summary') {
      shareContent = {
        title: 'PetPal Analytics Summary',
        subtitle: `Generated on ${new Date().toLocaleDateString()}`,
        metrics: [
          { label: 'Total Pets', value: currentMetrics.totalPets },
          { label: 'Adoptions This Month', value: currentMetrics.adoptionsThisMonth },
          { label: 'Active Applications', value: currentMetrics.activeApplications },
          { label: 'Success Rate', value: `${currentMetrics.successRate}%` },
          { label: 'Customer Satisfaction', value: `${currentMetrics.customerSatisfaction}/5` }
        ],
        textSummary: `PetPal Analytics Summary (${new Date().toLocaleDateString()}):\n\n` +
                    `🐾 Total Pets: ${currentMetrics.totalPets}\n` +
                    `🏠 Adoptions This Month: ${currentMetrics.adoptionsThisMonth}\n` +
                    `📝 Active Applications: ${currentMetrics.activeApplications}\n` +
                    `📊 Success Rate: ${currentMetrics.successRate}%\n` +
                    `⭐ Customer Satisfaction: ${currentMetrics.customerSatisfaction}/5\n` +
                    `⏱️ Average Adoption Time: ${currentMetrics.averageAdoptionTime} days\n` +
                    `📈 Application Response Rate: ${currentMetrics.applicationResponseRate}%\n\n` +
                    `Generated by PetPal Analytics`
      };
    } else if (format === 'chart') {
      const recentMonths = monthlyData.slice(-6);
      shareContent = {
        title: 'PetPal Adoption Trends',
        subtitle: 'Last 6 Months Performance',
        chartData: recentMonths,
        textSummary: `PetPal Adoption Trends - Last 6 Months:\n\n` +
                    recentMonths.map(month => 
                      `${month.monthYear}: ${month.adoptions} adoptions (${month.successRate}% success rate)`
                    ).join('\n') +
                    `\n\nTotal Adoptions: ${recentMonths.reduce((sum, month) => sum + month.adoptions, 0)}\n` +
                    `Average Success Rate: ${(recentMonths.reduce((sum, month) => sum + month.successRate, 0) / recentMonths.length).toFixed(1)}%\n\n` +
                    `Generated by PetPal Analytics`
      };
    }
    
    res.json({
      success: true,
      message: 'Share data retrieved successfully',
      data: {
        shareContent: shareContent,
        format: format,
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error getting share data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/analytics/reports - Get user's generated reports
router.get('/reports', (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Get all reports for the user
    const userReports = Array.from(reportData.values())
      .filter(report => report.userId === userId)
      .map(report => ({
        id: report.id,
        fileName: report.fileName,
        format: report.format,
        reportType: report.reportType,
        size: report.size,
        generatedAt: report.generatedAt,
        expiresAt: report.expiresAt,
        downloadUrl: `/api/analytics/download/${report.id}`
      }))
      .sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
    
    res.json({
      success: true,
      message: 'User reports retrieved successfully',
      data: {
        reports: userReports,
        totalReports: userReports.length
      }
    });
    
  } catch (error) {
    console.error('Error getting user reports:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// DELETE /api/analytics/reports/:reportId - Delete a generated report
router.delete('/reports/:reportId', (req, res) => {
  try {
    const { reportId } = req.params;
    const { userId } = req.query;
    
    if (!reportId) {
      return res.status(400).json({
        success: false,
        message: 'Report ID is required'
      });
    }
    
    const report = reportData.get(reportId);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    if (report.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this report'
      });
    }
    
    reportData.delete(reportId);
    
    res.json({
      success: true,
      message: 'Report deleted successfully',
      data: {
        deletedReport: {
          id: report.id,
          fileName: report.fileName,
          generatedAt: report.generatedAt
        }
      }
    });
    
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
