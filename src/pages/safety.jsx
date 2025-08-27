import React, { useState, useEffect } from 'react';
import supabase from '../db/supabase'

import { Button } from '@/components/ui/button';

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
  const [selectedItem, setSelectedItem] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Fetch uploads from relevant tables only
  useEffect(() => {
    fetchAllUploads();
  }, []);

  const fetchAllUploads = async () => {
    setLoading(true);
    try {
      const tables = [
        'beginner_project_ideas', 'career_path', 'interview_questions', 
        'feedback'
      ];

      const allUploads = [];

      for (const table of tables) {
        try {
          console.log(`Fetching from table: ${table}`);
          
          // Handle beginner_project_ideas table differently (no created_at column)
          let query = supabase.from(table).select('*');
          
          if (table === 'beginner_project_ideas') {
            // Don't try to order by created_at for this table
            query = query.order('id', { ascending: false });
          } else {
            query = query.order('created_at', { ascending: false });
          }

          const { data, error } = await query;

          console.log(`Table ${table}:`, { data, error, count: data?.length });

          if (error) {
            console.error(`Error fetching from ${table}:`, error);
            continue;
          }

          if (data) {
            const formattedData = data.map(item => ({
              ...item,
              table_name: table,
              // Add a fallback created_at for beginner_project_ideas
              created_at: item.created_at || new Date().toISOString()
            }));
            allUploads.push(...formattedData);
            console.log(`Added ${formattedData.length} items from ${table}`);
          }
        } catch (tableError) {
          console.error(`Error fetching from ${table}:`, tableError);
        }
      }

      console.log('Total uploads fetched:', allUploads.length);
      console.log('Project ideas count:', allUploads.filter(u => u.table_name === 'beginner_project_ideas').length);

      // Sort by creation date
      allUploads.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setUploads(allUploads);
    } catch (error) {
      console.error('Error fetching uploads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setSheetOpen(true);
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
    // Extract meaningful content for display - updated for actual DB schema
    const fields = ['title', 'name', 'description', 'content', 'message', 'question', 'answer', 'idea_title', 'path_name'];
    for (const field of fields) {
      if (item[field]) {
        return item[field].length > 100 ? item[field].substring(0, 100) + '...' : item[field];
      }
    }
    return 'No content preview available';
  };

  // Helper function to get email field based on table
  const getEmailField = (item) => {
    if (item.table_name === 'beginner_project_ideas') {
      return item.submitted_by; // Your DB uses submitted_by for project ideas
    }
    return item.email; // Other tables use email
  };

  const filteredUploads = uploads.filter(upload => {
    if (activeTab === 'all') return true;
    return upload.table_name === activeTab;
  });

  const renderDetailsModal = () => {
    if (!selectedItem) return null;

    // Filter out unwanted fields and format properly
    const excludeFields = ['id', 'user_id', 'table_name', 'created_at', 'updated_at', 'email', 'submitted_by'];
    const detailsData = Object.entries(selectedItem)
      .filter(([key, value]) => {
        return !excludeFields.includes(key) && 
               value !== null && 
               value !== undefined && 
               value !== '';
      })
      .map(([key, value]) => ({ key, value }));

    return (
      <div className={`fixed inset-0 z-50 ${sheetOpen ? 'block' : 'hidden'}`}>
        {/* Dark backdrop overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-60" 
          onClick={() => setSheetOpen(false)}
        />
        
        {/* Centered Modal */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedItem.title || selectedItem.name || selectedItem.idea_title || selectedItem.path_name || 'Entry Details'}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full mr-2">
                      {selectedItem.table_name.replace('_', ' ').toUpperCase()}
                    </span>
                    {selectedItem.created_at && (
                      <span>Created: {formatDate(selectedItem.created_at)}</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setSheetOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* Scrollable Content */}
            <div className="overflow-y-auto max-h-[60vh] p-6">
              <div className="space-y-6">
                {/* Show email prominently if available */}
                {(selectedItem.email || selectedItem.submitted_by) && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 uppercase tracking-wide mb-2">
                      Submitted By
                    </h4>
                    <div className="text-sm bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-blue-900 font-medium">📧 {getEmailField(selectedItem)}</p>
                    </div>
                  </div>
                )}

                {detailsData.map(({ key, value }, index) => (
                  <div key={index}>
                    <h4 className="font-medium text-sm text-gray-600 uppercase tracking-wide mb-2">
                      {key.replace(/_/g, ' ')}
                    </h4>
                    <div className="text-sm bg-gray-50 p-4 rounded-lg border">
                      {typeof value === 'object' ? (
                        <pre className="whitespace-pre-wrap text-xs font-mono text-gray-800">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      ) : (
                        <p className="text-gray-900">{String(value)}</p>
                      )}
                    </div>
                    {index < detailsData.length - 1 && (
                      <hr className="border-gray-200 mt-4" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Management Dashboard</h1>
          <p className="text-gray-600">Monitor and manage all user uploads</p>
          
          <div className="mt-4 bg-white rounded-lg p-4 shadow-sm">
            <div className="grid grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{uploads.length}</div>
                <div className="text-sm text-gray-500">Total Uploads</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {uploads.filter(u => u.table_name === 'beginner_project_ideas').length}
                </div>
                <div className="text-sm text-gray-500">Project Ideas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {uploads.filter(u => u.table_name === 'career_path').length}
                </div>
                <div className="text-sm text-gray-500">Career Paths</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {uploads.filter(u => u.table_name === 'interview_questions').length}
                </div>
                <div className="text-sm text-gray-500">Questions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {uploads.filter(u => u.table_name === 'feedback').length}
                </div>
                <div className="text-sm text-gray-500">Feedback</div>
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
                { key: 'beginner_project_ideas', label: 'Project Ideas' },
                { key: 'career_path', label: 'Career Paths' },
                { key: 'interview_questions', label: 'Questions' },
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
            filteredUploads.map((item) => (
              <div key={`${item.table_name}-${item.id}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {item.table_name.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.title || item.name || item.idea_title || item.path_name || `${item.table_name} Entry`}
                    </h3>
                    
                    <p className="text-gray-600 mb-3">
                      {getDisplayContent(item)}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {(item.email || item.submitted_by) && (
                        <span>👤 {getEmailField(item)}</span>
                      )}
                      <span>📅 {formatDate(item.created_at)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="ml-4 flex gap-2">
                    <Button 
                      onClick={() => handleViewDetails(item)}
                      variant="outline"
                    >
                      View Details
                    </Button>
                    <Button
                      onClick={() => handleDelete(item)}
                      disabled={deleting === item.id}
                      variant="destructive"
                    >
                      {deleting === item.id ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Deleting...
                        </span>
                      ) : (
                        'Delete'
                      )}
                    </Button>
                  </div>
                </div>

                {/* Additional Details */}
                {(item.technologies || item.category || item.difficulty_level) && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      {item.technologies && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                          Tech: {item.technologies}
                        </span>
                      )}
                      {item.category && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                          Category: {item.category}
                        </span>
                      )}
                      {item.difficulty_level && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                          Difficulty: {item.difficulty_level}
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
          <Button onClick={fetchAllUploads} size="lg">
            🔄 Refresh Dashboard
          </Button>
        </div>
      </div>

      {/* Details Modal/Sheet */}
      {renderDetailsModal()}
    </div>
  );
};

export default SafetyDashboard;