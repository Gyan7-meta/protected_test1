import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Define mock test data for demonstration
const mockTestData = {
  id: '1',
  title: 'Introduction to Programming',
  course: 'CS101',
  duration: 120, // minutes
  webcamRequired: true,
  microphoneRequired: true,
  fullScreenRequired: true,
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

const TakeTest: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  
  // State for test data and user responses
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // State for proctoring features
  const [webcamActive, setWebcamActive] = useState(false);
  const [microphoneActive, setMicrophoneActive] = useState(false);
  const [securityViolations, setSecurityViolations] = useState<string[]>([]);
  const [consentGiven, setConsentGiven] = useState(false);
  
  // Refs for media streams
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const fullScreenIntervalRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const webcamIntervalRef = useRef<number | null>(null);
  const tabFocusTimeoutRef = useRef<number | null>(null);
  
  // Load test data
  useEffect(() => {
    // In a real app, we would fetch this from an API
    setTest(mockTestData);
    setTimeLeft(mockTestData.duration * 60); // Convert to seconds
    setLoading(false);
  }, [testId]);
  
  // Define handleSubmit function before it's used in the useEffect
  const handleSubmit = useCallback(() => {
    // Stop all monitoring
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Clear intervals
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    if (fullScreenIntervalRef.current) {
      clearInterval(fullScreenIntervalRef.current);
    }
    
    if (webcamIntervalRef.current) {
      clearInterval(webcamIntervalRef.current);
    }
    
    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => {
        console.error('Error exiting fullscreen:', err);
      });
    }
    
    // In a real app, we would send the responses and violations to the server
    console.log('Test submitted with responses:', responses);
    console.log('Security violations:', securityViolations);
    
    // Navigate to results page
    navigate(`/results/${testId}`);
  }, [testId, navigate, responses, securityViolations]);
  
  // Set initial time when test loads
  useEffect(() => {
    if (test && consentGiven) {
      setTimeLeft(test.duration * 60);
    }
  }, [test, consentGiven]);
  
  // Setup timer
  useEffect(() => {
    if (test && consentGiven && timeLeft > 0) {
      // Start timer
      const timerInterval = window.setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            console.log("Time's up! Submitting test...");
            handleSubmit();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      timerIntervalRef.current = timerInterval;
      
      return () => {
        clearInterval(timerInterval);
      };
    }
  }, [test, consentGiven, timeLeft, handleSubmit]);
  
  // Format time function
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Initialize webcam
  const initializeWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        mediaStreamRef.current = stream;
      }
      setWebcamActive(true);
      
      // Setup periodic snapshots
      webcamIntervalRef.current = window.setInterval(() => {
        captureSnapshot();
      }, 30000); // Every 30 seconds
      
    } catch (err) {
      console.error('Failed to access webcam:', err);
      logSecurityViolation('Webcam access denied or unavailable');
    }
  };
  
  // Capture snapshot from webcam
  const captureSnapshot = () => {
    if (videoRef.current && mediaStreamRef.current && mediaStreamRef.current.active) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        // In a real app, we would send this image to the server
        // canvas.toDataURL('image/jpeg')
        console.log('Snapshot captured at:', new Date().toISOString());
      }
    } else {
      logSecurityViolation('Webcam disabled or not available during snapshot');
    }
  };
  
  // Initialize microphone
  const initializeMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      setMicrophoneActive(true);
      
      // In a real app, we might analyze audio levels or send audio samples
      // For demo, we'll just log that it's active
      console.log('Microphone monitoring active');
      
    } catch (err) {
      console.error('Failed to access microphone:', err);
      logSecurityViolation('Microphone access denied or unavailable');
    }
  };
  
  // Request full screen
  const requestFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen()
        .then(() => {
          setIsFullScreen(true);
          
          // Monitor full screen state
          fullScreenIntervalRef.current = window.setInterval(() => {
            if (!document.fullscreenElement) {
              setIsFullScreen(false);
              logSecurityViolation('Exited full screen mode');
            }
          }, 1000);
        })
        .catch(err => {
          console.error('Error attempting to enable full-screen mode:', err);
          logSecurityViolation('Failed to enter full screen mode');
        });
    }
  };
  
  // Log security violation
  const logSecurityViolation = (violation: string) => {
    const timestamp = new Date().toISOString();
    setSecurityViolations(prev => [...prev, `${timestamp}: ${violation}`]);
    
    // In a real app, we would send this to the server
    console.log('Security violation:', violation, 'at', timestamp);
  };
  
  // Handle tab/window focus events
  useEffect(() => {
    if (consentGiven) {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          logSecurityViolation('Tab/window lost focus');
          
          // If the user is away for more than 5 seconds, log additional violation
          tabFocusTimeoutRef.current = window.setTimeout(() => {
            logSecurityViolation('Extended time away from test window');
          }, 5000);
        } else {
          if (tabFocusTimeoutRef.current) {
            clearTimeout(tabFocusTimeoutRef.current);
          }
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        if (tabFocusTimeoutRef.current) {
          clearTimeout(tabFocusTimeoutRef.current);
        }
      };
    }
  }, [consentGiven]);
  
  // Handle copy-paste restrictions
  useEffect(() => {
    if (consentGiven) {
      const handleCopy = (e: ClipboardEvent) => {
        e.preventDefault();
        logSecurityViolation('Attempted to copy content');
      };
      
      const handlePaste = (e: ClipboardEvent) => {
        e.preventDefault();
        logSecurityViolation('Attempted to paste content');
      };
      
      document.addEventListener('copy', handleCopy);
      document.addEventListener('paste', handlePaste);
      
      return () => {
        document.removeEventListener('copy', handleCopy);
        document.removeEventListener('paste', handlePaste);
      };
    }
  }, [consentGiven]);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    if (consentGiven) {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Block common shortcuts
        if (
          (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'a' || e.key === 'f')) ||
          (e.altKey && e.key === 'Tab') ||
          e.key === 'F12' ||
          e.key === 'PrintScreen'
        ) {
          e.preventDefault();
          logSecurityViolation(`Attempted to use restricted keyboard shortcut: ${e.ctrlKey ? 'Ctrl+' : ''}${e.altKey ? 'Alt+' : ''}${e.key}`);
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [consentGiven]);
  
  // Handle right-click prevention
  useEffect(() => {
    if (consentGiven) {
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        logSecurityViolation('Attempted to open context menu');
      };
      
      document.addEventListener('contextmenu', handleContextMenu);
      
      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, [consentGiven]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Stop media streams
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Clear intervals
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      
      if (fullScreenIntervalRef.current) {
        clearInterval(fullScreenIntervalRef.current);
      }
      
      if (webcamIntervalRef.current) {
        clearInterval(webcamIntervalRef.current);
      }
      
      // Exit fullscreen if active
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => {
          console.error('Error exiting fullscreen:', err);
        });
      }
    };
  }, []);
  
  // Start the test with all security features
  const startTest = async () => {
    setConsentGiven(true);
    
    // Initialize security features
    if (test.webcamRequired) {
      await initializeWebcam();
    }
    
    if (test.microphoneRequired) {
      await initializeMicrophone();
    }
    
    if (test.fullScreenRequired) {
      requestFullScreen();
    }
  };
  
  // Handle response change
  const handleResponseChange = (value: any) => {
    if (!test) return;
    
    const questionId = test.questions[currentQuestion].id;
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  
  // Handle multiple choice response
  const handleMultipleChoiceChange = (optionIndex: string) => {
    if (!test) return;
    
    const questionId = test.questions[currentQuestion].id;
    const currentResponse = responses[questionId] || [];
    
    // Toggle the selected option
    if (currentResponse.includes(optionIndex)) {
      handleResponseChange(currentResponse.filter((idx: string) => idx !== optionIndex));
    } else {
      handleResponseChange([...currentResponse, optionIndex]);
    }
  };
  
  // Navigate to next question
  const handleNextQuestion = () => {
    if (!test) return;
    
    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };
  
  // Navigate to previous question
  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };
  
  if (loading || !test) {
    return <div className="loading">Loading test...</div>;
  }
  
  return (
    <div className={`take-test-container ${isFullScreen ? 'fullscreen-mode' : ''}`}>
      {!consentGiven ? (
        <div className="consent-screen">
          <h1>{test.title}</h1>
          <h2>Privacy and Permission Consent</h2>
          
          <div className="requirements-list">
            <h3>This test requires the following:</h3>
            <ul>
              {test.webcamRequired && (
                <li>
                  <strong>Webcam access:</strong> Your camera will be used to verify your identity and 
                  monitor for potential cheating during the test.
                </li>
              )}
              
              {test.microphoneRequired && (
                <li>
                  <strong>Microphone access:</strong> Your microphone will be used to detect conversations 
                  or other audio that could indicate cheating.
                </li>
              )}
              
              {test.fullScreenRequired && (
                <li>
                  <strong>Full screen mode:</strong> You will be required to keep this window in full screen 
                  mode during the entire test.
                </li>
              )}
              
              <li>
                <strong>Activity monitoring:</strong> The system will log if you attempt to:
                <ul>
                  <li>Switch tabs or windows</li>
                  <li>Copy or paste content</li>
                  <li>Use keyboard shortcuts</li>
                  <li>Open right-click menus</li>
                </ul>
              </li>
            </ul>
            
            <h3>System Requirements:</h3>
            <ul>
              <li>A modern browser (Chrome, Firefox, Edge, or Safari)</li>
              <li>Working webcam and microphone</li>
              <li>Stable internet connection</li>
            </ul>
          </div>
          
          <div className="consent-actions">
            <button 
              className="btn btn-primary"
              onClick={startTest}
            >
              I Consent and I'm Ready to Begin
            </button>
            
            <button 
              className="btn"
              onClick={() => navigate('/')}
            >
              Cancel and Return to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="test-header">
            <h1>{test.title}</h1>
            <div className="test-timer">
              Time Remaining: {formatTime(timeLeft)}
            </div>
          </div>
          
          <div className="test-content">
            <div className="question-nav">
              <div className="question-indicators">
                {test.questions.map((question: any, index: number) => (
                  <button 
                    key={index}
                    className={`question-indicator ${index === currentQuestion ? 'active' : ''} ${responses[test.questions[index].id] ? 'answered' : ''}`}
                    onClick={() => setCurrentQuestion(index)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="question-container">
              <div className="question-number">
                Question {currentQuestion + 1} of {test.questions.length}
              </div>
              
              <div className="question-text">
                <h3>{test.questions[currentQuestion].text}</h3>
                <div className="question-points">
                  {test.questions[currentQuestion].points} points
                </div>
              </div>
              
              <div className="question-response">
                {test.questions[currentQuestion].type === 'multiple-choice' && (
                  <div className="multiple-choice-options">
                    {test.questions[currentQuestion].options.map((option: string, index: number) => (
                      <div className="option" key={index}>
                        <input
                          type="checkbox"
                          id={`option-${index}`}
                          checked={(responses[test.questions[currentQuestion].id] || []).includes(index.toString())}
                          onChange={() => handleMultipleChoiceChange(index.toString())}
                        />
                        <label htmlFor={`option-${index}`}>{option}</label>
                      </div>
                    ))}
                  </div>
                )}
                
                {test.questions[currentQuestion].type === 'coding' && (
                  <div className="coding-response">
                    <textarea
                      className="code-editor"
                      value={responses[test.questions[currentQuestion].id] || ''}
                      onChange={(e) => handleResponseChange(e.target.value)}
                      placeholder="Write your code here..."
                      rows={10}
                    />
                  </div>
                )}
                
                {test.questions[currentQuestion].type === 'short-answer' && (
                  <div className="short-answer-response">
                    <textarea
                      className="form-control"
                      value={responses[test.questions[currentQuestion].id] || ''}
                      onChange={(e) => handleResponseChange(e.target.value)}
                      placeholder="Your answer..."
                      rows={5}
                    />
                  </div>
                )}
              </div>
              
              <div className="question-actions">
                <button
                  className="btn"
                  onClick={handlePrevQuestion}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </button>
                
                {currentQuestion < test.questions.length - 1 ? (
                  <button
                    className="btn btn-primary"
                    onClick={handleNextQuestion}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                  >
                    Submit Test
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="proctoring-panel">
            {test.webcamRequired && (
              <div className="webcam-container">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                />
                <div className={`webcam-status ${webcamActive ? 'active' : 'inactive'}`}>
                  {webcamActive ? 'Webcam Active' : 'Webcam Inactive'}
                </div>
              </div>
            )}
            
            {test.microphoneRequired && (
              <div className={`microphone-status ${microphoneActive ? 'active' : 'inactive'}`}>
                {microphoneActive ? 'Microphone Active' : 'Microphone Inactive'}
              </div>
            )}
            
            {securityViolations.length > 0 && (
              <div className="violations-counter">
                <div className="violation-count">{securityViolations.length}</div>
                <div className="violation-label">Security Violations</div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TakeTest; 