import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Mock data for test participants
const mockParticipants = [
  {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active',
    progress: 8, // completed 8 out of 10 questions
    totalQuestions: 10,
    startTime: '2023-06-10T10:05:23',
    timeRemaining: 42 * 60, // 42 minutes in seconds
    violations: [
      { 
        id: 'v1', 
        timestamp: '2023-06-10T10:15:45', 
        type: 'tab_switch', 
        details: 'Switched to another tab/window' 
      },
      { 
        id: 'v2', 
        timestamp: '2023-06-10T10:22:18', 
        type: 'copy_attempt', 
        details: 'Attempted to copy content' 
      }
    ],
    snapshots: [
      {
        id: 's1',
        timestamp: '2023-06-10T10:05:23',
        imageUrl: 'https://example.com/snapshots/user1/s1.jpg'
      },
      {
        id: 's2',
        timestamp: '2023-06-10T10:10:23',
        imageUrl: 'https://example.com/snapshots/user1/s2.jpg'
      }
    ]
  },
  {
    id: 'user2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    status: 'active',
    progress: 5, // completed 5 out of 10 questions
    totalQuestions: 10,
    startTime: '2023-06-10T10:03:12',
    timeRemaining: 45 * 60, // 45 minutes in seconds
    violations: [],
    snapshots: [
      {
        id: 's1',
        timestamp: '2023-06-10T10:03:12',
        imageUrl: 'https://example.com/snapshots/user2/s1.jpg'
      },
      {
        id: 's2',
        timestamp: '2023-06-10T10:08:12',
        imageUrl: 'https://example.com/snapshots/user2/s2.jpg'
      }
    ]
  },
  {
    id: 'user3',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    status: 'disconnected',
    progress: 3, // completed 3 out of 10 questions
    totalQuestions: 10,
    startTime: '2023-06-10T10:01:45',
    timeRemaining: 48 * 60, // 48 minutes in seconds
    violations: [
      { 
        id: 'v1', 
        timestamp: '2023-06-10T10:08:32', 
        type: 'fullscreen_exit', 
        details: 'Exited fullscreen mode' 
      }
    ],
    snapshots: [
      {
        id: 's1',
        timestamp: '2023-06-10T10:01:45',
        imageUrl: 'https://example.com/snapshots/user3/s1.jpg'
      }
    ]
  }
];

// Mock test data
const mockTestData = {
  id: '1',
  title: 'Introduction to Programming',
  course: 'CS101',
  startTime: '2023-06-10T10:00:00',
  duration: 120, // minutes
  status: 'in-progress',
  totalParticipants: 25,
  activeParticipants: 22,
  violations: 8
};

const MonitorTest: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  
  const [test, setTest] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Load test and participant data
  useEffect(() => {
    // In a real app, we would fetch this from an API
    setTest(mockTestData);
    setParticipants(mockParticipants);
    setLoading(false);
  }, [testId]);
  
  // Filter and sort participants
  const filteredParticipants = participants.filter(participant => {
    // Filter by status
    if (filterStatus !== 'all' && participant.status !== filterStatus) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !participant.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !participant.email.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    // Sort by selected field
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'status') {
      return a.status.localeCompare(b.status);
    } else if (sortBy === 'progress') {
      return b.progress - a.progress;
    } else if (sortBy === 'violations') {
      return b.violations.length - a.violations.length;
    }
    return 0;
  });
  
  // Get selected participant data
  const selectedParticipantData = selectedParticipant 
    ? participants.find(p => p.id === selectedParticipant) 
    : null;
  
  // Format time remaining
  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };
  
  // Flag participant for review
  const flagParticipant = (participantId: string) => {
    // In a real app, we would send this to an API
    console.log('Flagging participant for review:', participantId);
    alert('Participant flagged for review');
  };
  
  // Send message to participant
  const sendMessage = (participantId: string, message: string) => {
    // In a real app, we would send this to an API
    console.log('Sending message to participant:', participantId, message);
    alert(`Message sent to participant: ${message}`);
  };
  
  // Force end test for a participant
  const forceEndTest = (participantId: string) => {
    if (window.confirm('Are you sure you want to end the test for this participant?')) {
      // In a real app, we would send this to an API
      console.log('Forcing end of test for participant:', participantId);
      alert('Test ended for participant');
    }
  };
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return (
    <div className="monitor-test-container">
      <div className="monitor-header">
        <h1>Monitoring: {test.title}</h1>
        <div className="test-info">
          <span className="test-course">{test.course}</span>
          <span className="test-status">Status: <span className="status-badge">{test.status}</span></span>
          <span className="test-participants">Participants: {test.activeParticipants}/{test.totalParticipants}</span>
        </div>
      </div>
      
      <div className="monitor-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'participants' ? 'active' : ''}`}
          onClick={() => setActiveTab('participants')}
        >
          Participants
        </button>
        <button 
          className={`tab ${activeTab === 'violations' ? 'active' : ''}`}
          onClick={() => setActiveTab('violations')}
        >
          Violations ({test.violations})
        </button>
      </div>
      
      <div className="monitor-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="overview-stats">
              <div className="stat-card">
                <div className="stat-title">Active Participants</div>
                <div className="stat-value">{test.activeParticipants}/{test.totalParticipants}</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Test Duration</div>
                <div className="stat-value">{test.duration} minutes</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Total Violations</div>
                <div className="stat-value">{test.violations}</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Start Time</div>
                <div className="stat-value">{new Date(test.startTime).toLocaleString()}</div>
              </div>
            </div>
            
            <div className="overview-participants">
              <h3>Participant Status</h3>
              <div className="participant-status-list">
                {participants.map(participant => (
                  <div 
                    key={participant.id} 
                    className={`participant-status-item ${participant.status}`}
                    onClick={() => setSelectedParticipant(participant.id)}
                  >
                    <div className="participant-info">
                      <div className="participant-name">{participant.name}</div>
                      <div className="participant-email">{participant.email}</div>
                    </div>
                    <div className="participant-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{width: `${(participant.progress / participant.totalQuestions) * 100}%`}}
                        ></div>
                      </div>
                      <div className="progress-text">
                        {participant.progress}/{participant.totalQuestions} completed
                      </div>
                    </div>
                    <div className="participant-status">
                      <span className={`status-indicator ${participant.status}`}></span>
                      {participant.status}
                    </div>
                    <div className="participant-time">
                      {formatTimeRemaining(participant.timeRemaining)} left
                    </div>
                    <div className="participant-violations">
                      {participant.violations.length > 0 && (
                        <span className="violation-badge">{participant.violations.length}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'participants' && (
          <div className="participants-tab">
            <div className="participants-filters">
              <div className="search-filter">
                <input
                  type="text"
                  placeholder="Search by name or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="status-filter">
                <label>Filter by status:</label>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="disconnected">Disconnected</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div className="sort-filter">
                <label>Sort by:</label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name">Name</option>
                  <option value="status">Status</option>
                  <option value="progress">Progress</option>
                  <option value="violations">Violations</option>
                </select>
              </div>
            </div>
            
            <div className="participants-grid">
              {filteredParticipants.map(participant => (
                <div 
                  key={participant.id} 
                  className={`participant-card ${selectedParticipant === participant.id ? 'selected' : ''}`}
                  onClick={() => setSelectedParticipant(participant.id)}
                >
                  <div className="participant-header">
                    <h3>{participant.name}</h3>
                    <span className={`status-badge ${participant.status}`}>
                      {participant.status}
                    </span>
                  </div>
                  
                  <div className="participant-body">
                    <div className="participant-detail">
                      <strong>Email:</strong> {participant.email}
                    </div>
                    <div className="participant-detail">
                      <strong>Progress:</strong> {participant.progress}/{participant.totalQuestions}
                    </div>
                    <div className="participant-detail">
                      <strong>Time Left:</strong> {formatTimeRemaining(participant.timeRemaining)}
                    </div>
                    <div className="participant-detail">
                      <strong>Violations:</strong> {participant.violations.length}
                    </div>
                  </div>
                  
                  <div className="participant-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedParticipant(participant.id);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'violations' && (
          <div className="violations-tab">
            <h3>All Violations</h3>
            <div className="violations-list">
              {participants.flatMap(participant => 
                participant.violations.map((violation: any) => (
                  <div key={`${participant.id}-${violation.id}`} className="violation-item">
                    <div className="violation-header">
                      <h4>{participant.name}</h4>
                      <span className="violation-time">{formatDate(violation.timestamp)}</span>
                    </div>
                    <div className="violation-type">
                      <span className={`violation-badge ${violation.type}`}>{violation.type}</span>
                    </div>
                    <div className="violation-details">
                      {violation.details}
                    </div>
                    <button 
                      className="btn"
                      onClick={() => setSelectedParticipant(participant.id)}
                    >
                      View Participant
                    </button>
                  </div>
                ))
              )}
              
              {participants.flatMap(p => p.violations).length === 0 && (
                <div className="no-violations">
                  No violations recorded yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {selectedParticipant && selectedParticipantData && (
        <div className="participant-details-panel">
          <div className="panel-header">
            <h2>{selectedParticipantData.name}</h2>
            <button 
              className="close-btn"
              onClick={() => setSelectedParticipant(null)}
            >
              &times;
            </button>
          </div>
          
          <div className="panel-content">
            <div className="participant-info-section">
              <div className="info-row">
                <div className="info-label">Email:</div>
                <div className="info-value">{selectedParticipantData.email}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Status:</div>
                <div className="info-value">
                  <span className={`status-badge ${selectedParticipantData.status}`}>
                    {selectedParticipantData.status}
                  </span>
                </div>
              </div>
              <div className="info-row">
                <div className="info-label">Start Time:</div>
                <div className="info-value">
                  {new Date(selectedParticipantData.startTime).toLocaleString()}
                </div>
              </div>
              <div className="info-row">
                <div className="info-label">Progress:</div>
                <div className="info-value">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{width: `${(selectedParticipantData.progress / selectedParticipantData.totalQuestions) * 100}%`}}
                    ></div>
                  </div>
                  <div className="progress-text">
                    {selectedParticipantData.progress}/{selectedParticipantData.totalQuestions} completed
                  </div>
                </div>
              </div>
              <div className="info-row">
                <div className="info-label">Time Remaining:</div>
                <div className="info-value">
                  {formatTimeRemaining(selectedParticipantData.timeRemaining)}
                </div>
              </div>
            </div>
            
            <div className="snapshots-section">
              <h3>Webcam Snapshots</h3>
              <div className="snapshot-grid">
                {selectedParticipantData.snapshots.map((snapshot: any) => (
                  <div key={snapshot.id} className="snapshot-item">
                    <div className="snapshot-time">{formatDate(snapshot.timestamp)}</div>
                    <div className="snapshot-image">
                      {/* In a real app, we would display the actual image */}
                      <div className="placeholder-image">Webcam Snapshot</div>
                    </div>
                  </div>
                ))}
                
                {selectedParticipantData.snapshots.length === 0 && (
                  <div className="no-snapshots">No snapshots available</div>
                )}
              </div>
            </div>
            
            <div className="violations-section">
              <h3>Violations</h3>
              <div className="violations-list">
                {selectedParticipantData.violations.map((violation: any) => (
                  <div key={violation.id} className="violation-item">
                    <div className="violation-time">{formatDate(violation.timestamp)}</div>
                    <div className="violation-type">
                      <span className={`violation-badge ${violation.type}`}>{violation.type}</span>
                    </div>
                    <div className="violation-details">{violation.details}</div>
                  </div>
                ))}
                
                {selectedParticipantData.violations.length === 0 && (
                  <div className="no-violations">No violations recorded</div>
                )}
              </div>
            </div>
            
            <div className="actions-section">
              <h3>Actions</h3>
              <div className="action-buttons">
                <button 
                  className="btn"
                  onClick={() => flagParticipant(selectedParticipantData.id)}
                >
                  Flag for Review
                </button>
                
                <button 
                  className="btn"
                  onClick={() => {
                    const message = prompt('Enter message to send to participant:');
                    if (message) {
                      sendMessage(selectedParticipantData.id, message);
                    }
                  }}
                >
                  Send Message
                </button>
                
                <button 
                  className="btn btn-danger"
                  onClick={() => forceEndTest(selectedParticipantData.id)}
                >
                  Force End Test
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitorTest; 