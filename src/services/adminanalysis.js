// services/adminanalysis.js - Ultra minimal analytics using your existing tables

import { supabase } from '../config/supabaseClient'

class AdminAnalyticsService {
  
  // Login Analytics - Use existing users table
  async getLoginAnalytics() {
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
      
      if (error) throw error;

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const newUsersThisWeek = users.filter(user => 
        new Date(user.created_at) >= oneWeekAgo
      ).length;

      const newUsersThisMonth = users.filter(user => 
        new Date(user.created_at) >= oneMonthAgo
      ).length;

      return {
        totalUsers: users.length,
        newUsersThisWeek,
        newUsersThisMonth,
        dailySignups: this.groupByDate(users, 'created_at'),
        summary: `${users.length} total users, ${newUsersThisWeek} new this week`
      };
    } catch (error) {
      console.error('Error fetching login analytics:', error);
      return { totalUsers: 0, newUsersThisWeek: 0, newUsersThisMonth: 0, summary: 'Error loading data' };
    }
  }

  // Usage Analytics - Use existing tables
  async getUsageAnalytics() {
    try {
      const { data: projects } = await supabase.from('career_path').select('*');
      const { data: groups } = await supabase.from('interview_questions').select('*');
      const { data: feedback } = await supabase.from('feedback').select('*');

      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const recentProjects = projects?.filter(p => new Date(p.created_at) >= oneWeekAgo).length || 0;
      const recentQuestions = groups?.filter(q => new Date(q.created_at) >= oneWeekAgo).length || 0;
      const recentFeedback = feedback?.filter(f => new Date(f.created_at) >= oneWeekAgo).length || 0;

      return {
        totalProjects: projects?.length || 0,
        totalQuestions: groups?.length || 0,
        totalFeedback: feedback?.length || 0,
        recentActivity: recentProjects + recentQuestions + recentFeedback,
        weeklyActivity: {
          projects: recentProjects,
          questions: recentQuestions,
          feedback: recentFeedback
        },
        summary: `${projects?.length || 0} career paths, ${groups?.length || 0} questions, ${feedback?.length || 0} feedback`
      };
    } catch (error) {
      console.error('Error fetching usage analytics:', error);
      return { totalProjects: 0, totalQuestions: 0, totalFeedback: 0, summary: 'Error loading data' };
    }
  }

  // Popularity Analytics - Use existing tables
  async getPopularityAnalytics() {
    try {
      const { data: users } = await supabase.from('profiles').select('*');
      const { data: feedback } = await supabase.from('feedback').select('*');
      const { data: userActivities } = await supabase.from('user_activities').select('*');

      // Most active users (based on feedback)
      const userFeedbackCount = {};
      feedback?.forEach(f => {
        if (f.user_id) {
          userFeedbackCount[f.user_id] = (userFeedbackCount[f.user_id] || 0) + 1;
        }
      });

      const topActiveUsers = Object.entries(userFeedbackCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([userId, count]) => ({
          userId,
          activityCount: count,
          user: users?.find(u => u.id === userId)
        }));

      // Recent activity trends
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentActivities = userActivities?.filter(a => new Date(a.created_at) >= oneWeekAgo) || [];

      return {
        topActiveUsers,
        recentActivitiesCount: recentActivities.length,
        totalActivities: userActivities?.length || 0,
        feedbackTrend: this.groupByDate(feedback || [], 'created_at'),
        summary: `${topActiveUsers.length} active users, ${recentActivities.length} recent activities`
      };
    } catch (error) {
      console.error('Error fetching popularity analytics:', error);
      return { topActiveUsers: [], recentActivitiesCount: 0, summary: 'Error loading data' };
    }
  }

  // Combined Dashboard Data
  async getDashboardData() {
    try {
      const [loginData, usageData, popularityData] = await Promise.all([
        this.getLoginAnalytics(),
        this.getUsageAnalytics(),
        this.getPopularityAnalytics()
      ]);

      return {
        login: loginData,
        usage: usageData,
        popularity: popularityData,
        overview: {
          totalUsers: loginData.totalUsers,
          totalProjects: usageData.totalProjects,
          totalFeedback: usageData.totalFeedback,
          recentActivity: usageData.recentActivity,
          growthThisWeek: loginData.newUsersThisWeek
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return {
        login: { totalUsers: 0 },
        usage: { totalProjects: 0 },
        popularity: { topActiveUsers: [] },
        overview: { totalUsers: 0, totalProjects: 0, totalFeedback: 0 }
      };
    }
  }

  // Utility function to group data by date
  groupByDate(data, dateField) {
    if (!data || data.length === 0) return [];
    
    const grouped = {};
    data.forEach(item => {
      if (item[dateField]) {
        const date = new Date(item[dateField]).toDateString();
        grouped[date] = (grouped[date] || 0) + 1;
      }
    });

    return Object.entries(grouped)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 30); // Last 30 days
  }
}

export default new AdminAnalyticsService();