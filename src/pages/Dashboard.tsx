import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Mock test data
const mockTests = [
  {
    id: '1',
    title: 'Introduction to Programming',
    course: 'CS101',
    startTime: '2023-06-10T10:00:00',
    duration: 120, // minutes
    status: 'upcoming'
  },
  {
    id: '2',
    title: 'Data Structures Midterm',
    course: 'CS202',
    startTime: '2023-06-15T14:00:00',
    duration: 90,
    status: 'upcoming'
  },
  {
    id: '3',
    title: 'Database Systems Quiz',
    course: 'CS305',
    startTime: '2023-05-20T09:00:00',
    duration: 60,
    status: 'completed',
    score: 85
  }
];

// Mock submissions for instructors
const mockSubmissions = [
  {
    id: '101',
    testId: '3',
    testTitle: 'Database Systems Quiz',
    studentName: 'John Doe',
    studentEmail: 'john@example.com',
    submitTime: '2023-05-20T10:00:00',
    score: 85,
    status: 'graded'
  },
  {
    id: '102',
    testId: '3',
    testTitle: 'Database Systems Quiz',
    studentName: 'Jane Smith',
    studentEmail: 'jane@example.com',
    submitTime: '2023-05-20T09:55:00',
    score: 92,
    status: 'graded'
  },
  {
    id: '103',
    testId: '3',
    testTitle: 'Database Systems Quiz',
    studentName: 'Bob Wilson',
    studentEmail: 'bob@example.com',
    submitTime: '2023-05-20T10:01:00',
    score: 78,
    status: 'graded'
  }
];

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [tests, setTests] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  
  useEffect(() => {
    // In a real app, we would fetch this data from an API
    if (currentUser?.role === 'student') {
      setTests(mockTests);
    } else if (currentUser?.role === 'instructor' || currentUser?.role === 'admin') {
      setTests(mockTests);
      setSubmissions(mockSubmissions);
    }
  }, [currentUser]);
  
  const filteredTests = tests.filter(test => {
    if (activeTab === 'upcoming') {
      return test.status === 'upcoming';
    } else if (activeTab === 'completed') {
      return test.status === 'completed';
    }
    return true;
  });

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {currentUser?.name}</p>
      </div>
      
      {currentUser?.role === 'student' && (
        <div className="student-dashboard">
          <div className="card">
            <div className="card-header">
              <div className="tabs">
                <button 
                  className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
                  onClick={() => setActiveTab('upcoming')}
                >
                  Upcoming Tests
                </button>
                <button 
                  className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
                  onClick={() => setActiveTab('completed')}
                >
                  Completed Tests
                </button>
              </div>
            </div>
            
            <div className="card-body">
              {filteredTests.length === 0 ? (
                <p>No {activeTab} tests found.</p>
              ) : (
                <div className="test-list">
                  {filteredTests.map(test => (
                    <div className="test-item" key={test.id}>
                      <div className="test-details">
                        <h3>{test.title}</h3>
                        <p>Course: {test.course}</p>
                        <p>Start Time: {formatDate(test.startTime)}</p>
                        <p>Duration: {test.duration} minutes</p>
                        {test.status === 'completed' && (
                          <p>Score: {test.score}/100</p>
                        )}
                      </div>
                      
                      <div className="test-actions">
                        {test.status === 'upcoming' && (
                          <Link to={`/take-test/${test.id}`} className="btn btn-primary">
                            Start Test
                          </Link>
                        )}
                        {test.status === 'completed' && (
                          <Link to={`/results/${test.id}`} className="btn btn-primary">
                            View Results
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {(currentUser?.role === 'instructor' || currentUser?.role === 'admin') && (
        <div className="instructor-dashboard">
          <div className="dashboard-grid">
            <div className="card">
              <div className="card-header">
                <h2>Your Tests</h2>
                <Link to="/create-test" className="btn btn-primary">
                  Create New Test
                </Link>
              </div>
              
              <div className="card-body">
                {tests.length === 0 ? (
                  <p>No tests created yet.</p>
                ) : (
                  <div className="test-list">
                    {tests.map(test => (
                      <div className="test-item" key={test.id}>
                        <div className="test-details">
                          <h3>{test.title}</h3>
                          <p>Course: {test.course}</p>
                          <p>Start Time: {formatDate(test.startTime)}</p>
                          <p>Duration: {test.duration} minutes</p>
                          <p>Status: {test.status}</p>
                        </div>
                        
                        <div className="test-actions">
                          <Link to={`/monitor/${test.id}`} className="btn btn-primary">
                            Monitor
                          </Link>
                          
                          <Link to={`/results/${test.id}`} className="btn">
                            Results
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="card">
              <div className="card-header">
                <h2>Recent Submissions</h2>
              </div>
              
              <div className="card-body">
                {submissions.length === 0 ? (
                  <p>No submissions yet.</p>
                ) : (
                  <div className="submission-list">
                    {submissions.map(submission => (
                      <div className="submission-item" key={submission.id}>
                        <div className="submission-details">
                          <h3>{submission.studentName}</h3>
                          <p>Test: {submission.testTitle}</p>
                          <p>Submitted: {formatDate(submission.submitTime)}</p>
                          <p>Score: {submission.score}/100</p>
                        </div>
                        
                        <div className="submission-actions">
                          <Link to={`/results/${submission.testId}?student=${submission.id}`} className="btn">
                            View Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 