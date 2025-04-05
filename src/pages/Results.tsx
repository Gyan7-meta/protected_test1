import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Mock test result data
const mockTestResults = {
  id: '1',
  title: 'Introduction to Programming',
  course: 'CS101',
  totalQuestions: 10,
  totalPoints: 100,
  passingScore: 70,
  date: '2023-06-10',
  studentResults: [
    {
      studentId: 'user1',
      studentName: 'John Doe',
      studentEmail: 'john@example.com',
      score: 85,
      startTime: '2023-06-10T10:05:23',
      endTime: '2023-06-10T11:35:45',
      timeTaken: 90, // minutes
      violations: 2,
      answers: [
        { questionId: '1', answer: ['1'], correct: true, points: 10 },
        { questionId: '2', answer: 'function sum(a, b) { return a + b; }', correct: true, points: 15 },
        { questionId: '3', answer: 'Hypertext Markup Language', correct: true, points: 5 }
      ]
    },
    {
      studentId: 'user2',
      studentName: 'Jane Smith',
      studentEmail: 'jane@example.com',
      score: 92,
      startTime: '2023-06-10T10:03:12',
      endTime: '2023-06-10T11:25:30',
      timeTaken: 82, // minutes
      violations: 0,
      answers: [
        { questionId: '1', answer: ['1'], correct: true, points: 10 },
        { questionId: '2', answer: 'function add(a, b) { return a + b; }', correct: true, points: 15 },
        { questionId: '3', answer: 'Hypertext Markup Language', correct: true, points: 5 }
      ]
    },
    {
      studentId: 'user3',
      studentName: 'Bob Wilson',
      studentEmail: 'bob@example.com',
      score: 78,
      startTime: '2023-06-10T10:01:45',
      endTime: '2023-06-10T11:15:22',
      timeTaken: 74, // minutes
      violations: 1,
      answers: [
        { questionId: '1', answer: ['1'], correct: true, points: 10 },
        { questionId: '2', answer: 'function sum(a, b) { return a + b; }', correct: true, points: 15 },
        { questionId: '3', answer: 'HyperText Markup Language', correct: true, points: 5 }
      ]
    }
  ],
  questions: [
    {
      id: '1',
      type: 'multiple-choice',
      text: 'Which of the following is not a programming language?',
      options: ['JavaScript', 'HTML', 'Python', 'C++'],
      correctAnswer: ['1'], // HTML is not a programming language
      points: 10
    },
    {
      id: '2',
      type: 'coding',
      text: 'Write a function that returns the sum of two numbers.',
      correctAnswer: '', // This would have test cases in a real app
      points: 15
    },
    {
      id: '3',
      type: 'short-answer',
      text: 'What does HTML stand for?',
      correctAnswer: 'Hypertext Markup Language',
      points: 5
    }
  ]
};

const Results: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const studentParam = searchParams.get('student');
  
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  
  // Load test results
  useEffect(() => {
    // In a real app, we would fetch this from an API
    setTestResults(mockTestResults);
    
    // If student parameter is provided, select that student
    if (studentParam) {
      setSelectedStudent(studentParam);
    } else if (currentUser?.role === 'student') {
      // If user is a student, find their results
      const studentResult = mockTestResults.studentResults.find(
        sr => sr.studentEmail === currentUser.email
      );
      if (studentResult) {
        setSelectedStudent(studentResult.studentId);
      }
    }
    
    setLoading(false);
  }, [testId, currentUser, studentParam]);
  
  // Get the selected student's results
  const selectedStudentResults = selectedStudent
    ? testResults?.studentResults.find((sr: any) => sr.studentId === selectedStudent)
    : null;
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Calculate class average
  const calculateAverage = () => {
    if (!testResults) return 0;
    
    const sum = testResults.studentResults.reduce((acc: number, sr: any) => acc + sr.score, 0);
    return Math.round(sum / testResults.studentResults.length);
  };
  
  if (loading || !testResults) {
    return <div className="loading">Loading results...</div>;
  }
  
  return (
    <div className="results-container">
      <div className="results-header">
        <h1>Results: {testResults.title}</h1>
        <div className="test-info">
          <span className="test-course">{testResults.course}</span>
          <span className="test-date">Date: {testResults.date}</span>
        </div>
      </div>
      
      {currentUser?.role === 'student' ? (
        // Student view
        <div className="student-results">
          {selectedStudentResults ? (
            <>
              <div className="score-overview">
                <div className="score-card">
                  <div className="score-value">{selectedStudentResults.score}%</div>
                  <div className="score-label">Your Score</div>
                  <div className={`pass-indicator ${selectedStudentResults.score >= testResults.passingScore ? 'pass' : 'fail'}`}>
                    {selectedStudentResults.score >= testResults.passingScore ? 'PASSED' : 'FAILED'}
                  </div>
                </div>
                
                <div className="score-details">
                  <div className="detail-item">
                    <span className="detail-label">Class Average:</span>
                    <span className="detail-value">{calculateAverage()}%</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Passing Score:</span>
                    <span className="detail-value">{testResults.passingScore}%</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Time Taken:</span>
                    <span className="detail-value">{selectedStudentResults.timeTaken} minutes</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Violations:</span>
                    <span className="detail-value">{selectedStudentResults.violations}</span>
                  </div>
                </div>
              </div>
              
              <div className="answers-section">
                <h2>Your Answers</h2>
                {selectedStudentResults.answers.map((answer: any, index: number) => {
                  const question = testResults.questions.find((q: any) => q.id === answer.questionId);
                  return (
                    <div key={answer.questionId} className="answer-item">
                      <div className="question-text">
                        <h3>Question {index + 1}: {question.text}</h3>
                        <div className="question-points">
                          {answer.points}/{question.points} points
                        </div>
                      </div>
                      
                      <div className="student-answer">
                        <div className="answer-label">Your Answer:</div>
                        <div className="answer-content">
                          {question.type === 'multiple-choice' ? (
                            <div className="multiple-choice-answer">
                              {Array.isArray(answer.answer) && question.options && 
                                answer.answer.map((optionIndex: string) => (
                                  <div key={optionIndex} className="selected-option">
                                    {question.options[parseInt(optionIndex)]}
                                  </div>
                                ))
                              }
                            </div>
                          ) : question.type === 'coding' ? (
                            <pre className="code-answer">{answer.answer}</pre>
                          ) : (
                            <div className="text-answer">{answer.answer}</div>
                          )}
                        </div>
                      </div>
                      
                      {question.type !== 'coding' && (
                        <div className="correct-answer">
                          <div className="answer-label">Correct Answer:</div>
                          <div className="answer-content">
                            {question.type === 'multiple-choice' ? (
                              <div className="multiple-choice-answer">
                                {Array.isArray(question.correctAnswer) && question.options && 
                                  question.correctAnswer.map((optionIndex: string) => (
                                    <div key={optionIndex} className="selected-option">
                                      {question.options[parseInt(optionIndex)]}
                                    </div>
                                  ))
                                }
                              </div>
                            ) : (
                              <div className="text-answer">{question.correctAnswer}</div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className={`answer-status ${answer.correct ? 'correct' : 'incorrect'}`}>
                        {answer.correct ? 'Correct' : 'Incorrect'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="no-results">
              <p>No results found for this test. If you believe this is an error, please contact your instructor.</p>
            </div>
          )}
        </div>
      ) : (
        // Instructor view
        <div className="instructor-results">
          <div className="results-tabs">
            <div className="tab-header">
              <button 
                className={`tab-btn ${!selectedStudent ? 'active' : ''}`}
                onClick={() => setSelectedStudent(null)}
              >
                Class Overview
              </button>
              
              {selectedStudent && selectedStudentResults && (
                <button className="tab-btn active">
                  {selectedStudentResults.studentName}
                </button>
              )}
            </div>
            
            <div className="tab-content">
              {!selectedStudent ? (
                // Class overview tab
                <div className="class-overview">
                  <div className="stats-cards">
                    <div className="stat-card">
                      <div className="stat-value">{calculateAverage()}%</div>
                      <div className="stat-label">Class Average</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">
                        {testResults.studentResults.filter((sr: any) => sr.score >= testResults.passingScore).length}
                      </div>
                      <div className="stat-label">Passed</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">
                        {testResults.studentResults.filter((sr: any) => sr.score < testResults.passingScore).length}
                      </div>
                      <div className="stat-label">Failed</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{testResults.studentResults.length}</div>
                      <div className="stat-label">Total Students</div>
                    </div>
                  </div>
                  
                  <div className="student-list">
                    <h2>Student Results</h2>
                    <table className="results-table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Score</th>
                          <th>Time Taken</th>
                          <th>Violations</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testResults.studentResults.map((sr: any) => (
                          <tr key={sr.studentId}>
                            <td>{sr.studentName}</td>
                            <td>{sr.score}%</td>
                            <td>{sr.timeTaken} min</td>
                            <td>{sr.violations}</td>
                            <td>
                              <span className={`status-badge ${sr.score >= testResults.passingScore ? 'pass' : 'fail'}`}>
                                {sr.score >= testResults.passingScore ? 'PASS' : 'FAIL'}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="btn btn-primary"
                                onClick={() => setSelectedStudent(sr.studentId)}
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : selectedStudentResults ? (
                // Student detail tab
                <div className="student-detail">
                  <button 
                    className="back-btn"
                    onClick={() => setSelectedStudent(null)}
                  >
                    &laquo; Back to Class Overview
                  </button>
                  
                  <div className="student-header">
                    <h2>{selectedStudentResults.studentName}</h2>
                    <div className="student-meta">
                      <div className="meta-item">
                        <span className="meta-label">Email:</span>
                        <span className="meta-value">{selectedStudentResults.studentEmail}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Start Time:</span>
                        <span className="meta-value">{formatDate(selectedStudentResults.startTime)}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">End Time:</span>
                        <span className="meta-value">{formatDate(selectedStudentResults.endTime)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="score-overview">
                    <div className="score-card">
                      <div className="score-value">{selectedStudentResults.score}%</div>
                      <div className="score-label">Score</div>
                      <div className={`pass-indicator ${selectedStudentResults.score >= testResults.passingScore ? 'pass' : 'fail'}`}>
                        {selectedStudentResults.score >= testResults.passingScore ? 'PASSED' : 'FAILED'}
                      </div>
                    </div>
                    
                    <div className="score-details">
                      <div className="detail-item">
                        <span className="detail-label">Class Average:</span>
                        <span className="detail-value">{calculateAverage()}%</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Time Taken:</span>
                        <span className="detail-value">{selectedStudentResults.timeTaken} minutes</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Violations:</span>
                        <span className="detail-value">{selectedStudentResults.violations}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="answers-section">
                    <h2>Student Answers</h2>
                    {selectedStudentResults.answers.map((answer: any, index: number) => {
                      const question = testResults.questions.find((q: any) => q.id === answer.questionId);
                      return (
                        <div key={answer.questionId} className="answer-item">
                          <div className="question-text">
                            <h3>Question {index + 1}: {question.text}</h3>
                            <div className="question-points">
                              {answer.points}/{question.points} points
                            </div>
                          </div>
                          
                          <div className="student-answer">
                            <div className="answer-label">Student Answer:</div>
                            <div className="answer-content">
                              {question.type === 'multiple-choice' ? (
                                <div className="multiple-choice-answer">
                                  {Array.isArray(answer.answer) && question.options && 
                                    answer.answer.map((optionIndex: string) => (
                                      <div key={optionIndex} className="selected-option">
                                        {question.options[parseInt(optionIndex)]}
                                      </div>
                                    ))
                                  }
                                </div>
                              ) : question.type === 'coding' ? (
                                <pre className="code-answer">{answer.answer}</pre>
                              ) : (
                                <div className="text-answer">{answer.answer}</div>
                              )}
                            </div>
                          </div>
                          
                          {question.type !== 'coding' && (
                            <div className="correct-answer">
                              <div className="answer-label">Correct Answer:</div>
                              <div className="answer-content">
                                {question.type === 'multiple-choice' ? (
                                  <div className="multiple-choice-answer">
                                    {Array.isArray(question.correctAnswer) && question.options && 
                                      question.correctAnswer.map((optionIndex: string) => (
                                        <div key={optionIndex} className="selected-option">
                                          {question.options[parseInt(optionIndex)]}
                                        </div>
                                      ))
                                    }
                                  </div>
                                ) : (
                                  <div className="text-answer">{question.correctAnswer}</div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <div className={`answer-status ${answer.correct ? 'correct' : 'incorrect'}`}>
                            {answer.correct ? 'Correct' : 'Incorrect'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results; 