import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';

// Safety utility functions
const SAFETY_KEYWORDS = {
  inappropriate: [
    'hate', 'violence', 'discrimination', 'harassment', 'abuse', 
    'offensive', 'inappropriate', 'explicit', 'harmful'
  ],
  suspicious: [
    'fake', 'scam', 'fraud', 'misleading', 'spam', 'phishing',
    'malicious', 'virus', 'hack', 'illegal'
  ],
  professional: [
    'unprofessional', 'inappropriate', 'vulgar', 'offensive'
  ]
};

const checkContentSafety = (item) => {
  if (!item) return 'safe';

  const textFields = [
    item.title, item.name, item.description, item.content, 
    item.message, item.question, item.answer, item.skills,
    item.technologies, item.bio, item.details
  ].filter(Boolean).join(' ').toLowerCase();

  const hasInappropriate = SAFETY_KEYWORDS.inappropriate.some(keyword => 
    textFields.includes(keyword)
  );
  const hasSuspicious = SAFETY_KEYWORDS.suspicious.some(keyword => 
    textFields.includes(keyword)
  );
  const hasUnprofessional = SAFETY_KEYWORDS.professional.some(keyword => 
    textFields.includes(keyword)
  );

  const hasExcessiveCapitals = textFields.length > 10 && 
    (textFields.match(/[A-Z]/g) || []).length / textFields.length > 0.3;
  const hasExcessivePunctuation = (textFields.match(/[!?]{2,}/g) || []).length > 0;
  const isEmpty = textFields.trim().length < 10;

  if (hasInappropriate || hasSuspicious) return 'flagged';
  if (hasUnprofessional || hasExcessiveCapitals || hasExcessivePunctuation || isEmpty) return 'warning';
  return 'safe';
};

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Invalid date';
  }
};

const SafetyDashboard = () => {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [deleting, setDeleting] = useState(null);

  // Fetch all uploads from different tables
  useEffect(() => {
    fetchAllUploads();
  }, []);

  const fetchAllUploads = async () => {
    setLoading(true);
    try {
      const tables = [
        'project_of', 'organizations', 'profiles', 
        'creative_skills', 'interview_questions', 'feedback',
        'user_activities', 'user_selection'
      ];

      const allUploads = [];

      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .order('created_at', { ascending: false });

        if (data && !error) {
          const formattedData = data.map(item => ({
            ...item,
            table_name: table,
            safety_status: checkContentSafety(item)
          }));
          allUploads.push(...formattedData);
        }
      }

      // Sort by creation date
      allUploads.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setUploads(allUploads);
    } catch (error) {
      console.error('Error fetching uploads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete this ${item.table_name} entry?`)) {
      return;
    }

    setDeleting(item.id);
    try {
      const { error } = await supabase
        .from(item.table_name)
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      // Remove from local state
      setUploads(uploads.filter(upload => 
        !(upload.id === item.id && upload.table_name === item.table_name)
      ));

      alert('Content deleted successfully');
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Error deleting content: ' + error.message);
    } finally {
      setDeleting(null);
    }
  };

  const getDisplayContent = (item) => {
    // Extract meaningful content for display
    const fields = ['title', 'name', 'description', 'content', 'message', 'question', 'answer'];
    for (const field of fields) {
      if (item[field]) {
        return item[field].length > 100 ? item[field].substring(0, 100) + '...' : item[field];
      }
    }
    return 'No content preview available';
  };

  const filteredUploads = uploads.filter(upload => {
    if (activeTab === 'all') return true;
    if (activeTab === 'flagged') return upload.safety_status !== 'safe';
    return upload.table_name === activeTab;
  });

  const getSafetyBadge = (status) => {
    const styles = {
      safe: 'bg-green-100 text-green-800 border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      flagged: 'bg-red-100 text-red-800 border-red-200'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs border ${styles[status] || styles.safe}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading safety dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Safety & Ethics Oversight</h1>
          <p className="text-gray-600">Monitor and manage all user uploads for ethical compliance and safety</p>
          
          <div className="mt-4 bg-white rounded-lg p-4 shadow-sm">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{uploads.length}</div>
                <div className="text-sm text-gray-500">Total Uploads</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {uploads.filter(u => u.safety_status === 'safe').length}
                </div>
                <div className="text-sm text-gray-500">Safe Content</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {uploads.filter(u => u.safety_status === 'warning').length}
                </div>
                <div className="text-sm text-gray-500">Needs Review</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {uploads.filter(u => u.safety_status === 'flagged').length}
                </div>
                <div className="text-sm text-gray-500">Flagged Content</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All Uploads' },
                { key: 'flagged', label: 'Flagged Content' },
                { key: 'project_of', label: 'Projects' },
                { key: 'organizations', label: 'Organizations' },
                { key: 'profiles', label: 'Profiles' },
                { key: 'feedback', label: 'Feedback' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content List */}
        <div className="space-y-4">
          {filteredUploads.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No uploads found for the selected filter.</p>
            </div>
          ) : (
            filteredUploads.map((item, index) => (
              <div key={`${item.table_name}-${item.id}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {item.table_name.replace('_', ' ').toUpperCase()}
                      </span>
                      {getSafetyBadge(item.safety_status)}
                      <span className="text-sm text-gray-500">
                        ID: {item.id}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.title || item.name || `${item.table_name} Entry`}
                    </h3>
                    
                    <p className="text-gray-600 mb-3">
                      {getDisplayContent(item)}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {item.email && (
                        <span>👤 {item.email}</span>
                      )}
                      {item.user_id && (
                        <span>🆔 User: {item.user_id}</span>
                      )}
                      <span>📅 {formatDate(item.created_at)}</span>
                    </div>

                    {/* Safety Warnings */}
                    {item.safety_status !== 'safe' && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-800">
                          <strong>⚠️ Safety Concern:</strong> This content has been flagged for review. 
                          Please verify it meets ethical guidelines before allowing it to remain public.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Delete Button */}
                  <div className="ml-4">
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={deleting === item.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {deleting === item.id ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Deleting...
                        </span>
                      ) : (
                        '🗑️ Delete'
                      )}
                    </button>
                  </div>
                </div>

                {/* Additional Details */}
                {(item.skills || item.technologies || item.category) && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      {item.skills && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Skills: {item.skills}
                        </span>
                      )}
                      {item.technologies && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          Tech: {item.technologies}
                        </span>
                      )}
                      {item.category && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          Category: {item.category}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={fetchAllUploads}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            🔄 Refresh Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default SafetyDashboard;