import supabase from '../db/supabase'

class AdminAnalyticsService {
  
  // Get comprehensive overview statistics
  async getOverviewStats() {
    try {
      console.log('Fetching overview statistics...');

      const [
        { count: totalUsers },
        { count: totalCareerPaths },
        { count: totalQuestions },
        { count: totalFeedback }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('career_path').select('*', { count: 'exact', head: true }),
        supabase.from('interview_questions').select('*', { count: 'exact', head: true }),
        supabase.from('feedback').select('*', { count: 'exact', head: true })
      ]);

      return {
        totalUsers: totalUsers || 0,
        totalCareerPaths: totalCareerPaths || 0,
        totalQuestions: totalQuestions || 0,
        totalFeedback: totalFeedback || 0
      };
    } catch (error) {
      console.error('Error fetching overview stats:', error);
      return { totalUsers: 0, totalCareerPaths: 0, totalQuestions: 0, totalFeedback: 0 };
    }
  }

  // Get new members joined (last 30 days)
  async getNewMembersInfo() {
    try {
      console.log('Fetching new members info...');
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: newMembers, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (error) {
        console.error('Error fetching new members:', error);
        return 0;
      }

      return newMembers || 0;
    } catch (error) {
      console.error('Error fetching new members info:', error);
      return 0;
    }
  }

  // Get user role distribution
  async getUserRoleDistribution() {
    try {
      console.log('Fetching user role distribution...');
      
      const { data: users, error } = await supabase
        .from('profiles')
        .select('role');

      if (error) throw error;

      // Count by role
      const roleCount = {};
      users?.forEach(user => {
        const role = user.role || 'user';
        roleCount[role] = (roleCount[role] || 0) + 1;
      });

      // Convert to chart format
      const distribution = Object.entries(roleCount).map(([role, count]) => ({
        name: role.charAt(0).toUpperCase() + role.slice(1),
        count: count
      }));

      return distribution;
    } catch (error) {
      console.error('Error fetching user role distribution:', error);
      return [];
    }
  }

  // Get user engagement metrics
  async getUserEngagement() {
    try {
      console.log('Fetching user engagement metrics...');

      // Get users who have created career paths
      const { data: pathCreators, error: pathError } = await supabase
        .from('career_path')
        .select('user_id')
        .not('user_id', 'is', null);

      if (pathError) console.error('Error fetching path creators:', pathError);
      console.log('Path creators data:', pathCreators);

      const uniquePathCreators = [...new Set(pathCreators?.map(p => p.user_id) || [])];

      // Get users who provided feedback - using email as identifier since feedback table uses email
      const { data: feedbackUsers, error: feedbackError } = await supabase
        .from('feedback')
        .select('email')
        .not('email', 'is', null);

      if (feedbackError) console.error('Error fetching feedback users:', feedbackError);
      console.log('Feedback users data:', feedbackUsers);

      const uniqueFeedbackUsers = [...new Set(feedbackUsers?.map(f => f.email) || [])];

      // Get total groups from group_desc table
      const { count: totalGroups, error: groupsError } = await supabase
        .from('group_desc')
        .select('*', { count: 'exact', head: true });

      if (groupsError) console.error('Error fetching groups:', groupsError);
      console.log('Total groups count:', totalGroups);

      // Get question contributors from interview_questions table - using submitted_by column
      const { data: questionContributors, error: contributorsError } = await supabase
        .from('interview_questions')
        .select('submitted_by')
        .not('submitted_by', 'is', null);

      if (contributorsError) console.error('Error fetching question contributors:', contributorsError);
      console.log('Question contributors data:', questionContributors);

      const uniqueQuestionContributors = [...new Set(questionContributors?.map(q => q.submitted_by) || [])];

      // Get total users for percentage calculation
      const totalUsers = await this.getOverviewStats().then(stats => stats.totalUsers);
      const careerPathEngagementRate = totalUsers > 0 ? Math.round((uniquePathCreators.length / totalUsers) * 100) : 0;

      const engagementData = {
        usersWithCareerPaths: uniquePathCreators.length,
        feedbackContributors: uniqueFeedbackUsers.length,
        existingGroupNumber: totalGroups || 0,
        questionContributors: uniqueQuestionContributors.length,
        careerPathEngagementRate: careerPathEngagementRate
      };

      console.log('Final engagement data:', engagementData);
      return engagementData;
    } catch (error) {
      console.error('Error fetching user engagement:', error);
      return {
        usersWithCareerPaths: 0,
        feedbackContributors: 0,
        existingGroupNumber: 0,
        questionContributors: 0,
        careerPathEngagementRate: 0
      };
    }
  }

  // Main function to get all analytics data
  async getComprehensiveAnalytics() {
    try {
      console.log('Fetching comprehensive analytics...');

      const [
        overview,
        newMembers,
        userRoleDistribution,
        engagement
      ] = await Promise.all([
        this.getOverviewStats(),
        this.getNewMembersInfo(),
        this.getUserRoleDistribution(),
        this.getUserEngagement()
      ]);

      const analyticsData = {
        overview,
        newMembers,
        userRoleDistribution,
        engagement
      };

      console.log('Complete analytics data:', analyticsData);
      return analyticsData;

    } catch (error) {
      console.error('Error in getComprehensiveAnalytics:', error);
      return {
        overview: { totalUsers: 0, totalCareerPaths: 0, totalQuestions: 0, totalFeedback: 0 },
        newMembers: 0,
        userRoleDistribution: [],
        engagement: { 
          usersWithCareerPaths: 0, 
          feedbackContributors: 0, 
          existingGroupNumber: 0, 
          questionContributors: 0,
          careerPathEngagementRate: 0 
        }
      };
    }
  }
}

export default new AdminAnalyticsService();