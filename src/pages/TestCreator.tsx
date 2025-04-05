import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Define question types
type QuestionType = 'multiple-choice' | 'coding' | 'short-answer';

// Define question interface
interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
}

const TestCreator: React.FC = () => {
  const navigate = useNavigate();
  
  // Test settings state
  const [testSettings, setTestSettings] = useState({
    title: '',
    description: '',
    course: '',
    startDate: '',
    startTime: '',
    duration: 60,
    passingScore: 70,
    webcamRequired: true,
    microphoneRequired: true,
    fullScreenRequired: true,
    allowedAttempts: 1,
    randomizeQuestions: true
  });
  
  // Questions state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: Date.now().toString(),
    type: 'multiple-choice',
    text: '',
    options: ['', '', '', ''],
    correctAnswer: [],
    points: 10
  });
  
  // Handle test settings change
  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setTestSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) : value
    }));
  };
  
  // Handle question change
  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setCurrentQuestion(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle question type change
  const handleQuestionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as QuestionType;
    
    setCurrentQuestion(prev => ({
      ...prev,
      type,
      options: type === 'multiple-choice' ? ['', '', '', ''] : undefined,
      correctAnswer: type === 'multiple-choice' ? [] : ''
    }));
  };
  
  // Handle option change for multiple choice
  const handleOptionChange = (index: number, value: string) => {
    if (currentQuestion.options) {
      const newOptions = [...currentQuestion.options];
      newOptions[index] = value;
      
      setCurrentQuestion(prev => ({
        ...prev,
        options: newOptions
      }));
    }
  };
  
  // Handle correct answer change for multiple choice
  const handleCorrectAnswerChange = (index: number) => {
    if (currentQuestion.type === 'multiple-choice' && Array.isArray(currentQuestion.correctAnswer)) {
      let newCorrectAnswer = [...currentQuestion.correctAnswer];
      
      if (newCorrectAnswer.includes(index.toString())) {
        newCorrectAnswer = newCorrectAnswer.filter(a => a !== index.toString());
      } else {
        newCorrectAnswer.push(index.toString());
      }
      
      setCurrentQuestion(prev => ({
        ...prev,
        correctAnswer: newCorrectAnswer
      }));
    }
  };
  
  // Add question to the list
  const addQuestion = () => {
    if (!currentQuestion.text) {
      alert('Please enter a question text');
      return;
    }
    
    if (currentQuestion.type === 'multiple-choice' && 
        (!currentQuestion.options || currentQuestion.options.some(opt => !opt))) {
      alert('Please fill in all options');
      return;
    }
    
    if (currentQuestion.type === 'multiple-choice' && 
        Array.isArray(currentQuestion.correctAnswer) && 
        currentQuestion.correctAnswer.length === 0) {
      alert('Please select at least one correct answer');
      return;
    }
    
    setQuestions(prev => [...prev, currentQuestion]);
    
    // Reset for next question
    setCurrentQuestion({
      id: Date.now().toString(),
      type: 'multiple-choice',
      text: '',
      options: ['', '', '', ''],
      correctAnswer: [],
      points: 10
    });
  };
  
  // Remove a question
  const removeQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!testSettings.title || !testSettings.course) {
      alert('Please fill in all required test settings');
      return;
    }
    
    if (questions.length === 0) {
      alert('Please add at least one question');
      return;
    }
    
    // In a real app, we would send this to an API
    console.log('Test created:', {
      ...testSettings,
      questions,
      createdAt: new Date().toISOString()
    });
    
    alert('Test created successfully!');
    navigate('/');
  };
  
  return (
    <div className="test-creator-container">
      <h1>Create New Test</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-header">
            <h2>Test Settings</h2>
          </div>
          
          <div className="card-body">
            <div className="form-group">
              <label htmlFor="title">Test Title*</label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-control"
                value={testSettings.title}
                onChange={handleSettingsChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                value={testSettings.description}
                onChange={handleSettingsChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="course">Course/Subject*</label>
              <input
                type="text"
                id="course"
                name="course"
                className="form-control"
                value={testSettings.course}
                onChange={handleSettingsChange}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Start Date*</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  className="form-control"
                  value={testSettings.startDate}
                  onChange={handleSettingsChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="startTime">Start Time*</label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  className="form-control"
                  value={testSettings.startTime}
                  onChange={handleSettingsChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="duration">Duration (minutes)*</label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  className="form-control"
                  min="1"
                  value={testSettings.duration}
                  onChange={handleSettingsChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="passingScore">Passing Score (%)*</label>
                <input
                  type="number"
                  id="passingScore"
                  name="passingScore"
                  className="form-control"
                  min="0"
                  max="100"
                  value={testSettings.passingScore}
                  onChange={handleSettingsChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="allowedAttempts">Allowed Attempts*</label>
                <input
                  type="number"
                  id="allowedAttempts"
                  name="allowedAttempts"
                  className="form-control"
                  min="1"
                  value={testSettings.allowedAttempts}
                  onChange={handleSettingsChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row checkboxes">
              <div className="form-group check-group">
                <input
                  type="checkbox"
                  id="webcamRequired"
                  name="webcamRequired"
                  checked={testSettings.webcamRequired}
                  onChange={handleSettingsChange}
                />
                <label htmlFor="webcamRequired">Require Webcam</label>
              </div>
              
              <div className="form-group check-group">
                <input
                  type="checkbox"
                  id="microphoneRequired"
                  name="microphoneRequired"
                  checked={testSettings.microphoneRequired}
                  onChange={handleSettingsChange}
                />
                <label htmlFor="microphoneRequired">Require Microphone</label>
              </div>
              
              <div className="form-group check-group">
                <input
                  type="checkbox"
                  id="fullScreenRequired"
                  name="fullScreenRequired"
                  checked={testSettings.fullScreenRequired}
                  onChange={handleSettingsChange}
                />
                <label htmlFor="fullScreenRequired">Require Full Screen Mode</label>
              </div>
              
              <div className="form-group check-group">
                <input
                  type="checkbox"
                  id="randomizeQuestions"
                  name="randomizeQuestions"
                  checked={testSettings.randomizeQuestions}
                  onChange={handleSettingsChange}
                />
                <label htmlFor="randomizeQuestions">Randomize Questions</label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2>Questions</h2>
          </div>
          
          <div className="card-body">
            <div className="question-list">
              {questions.map((question, index) => (
                <div key={question.id} className="question-item">
                  <div className="question-header">
                    <h3>Question {index + 1}</h3>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => removeQuestion(question.id)}
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="question-body">
                    <p><strong>Type:</strong> {question.type}</p>
                    <p><strong>Text:</strong> {question.text}</p>
                    <p><strong>Points:</strong> {question.points}</p>
                    
                    {question.type === 'multiple-choice' && question.options && (
                      <div className="question-options">
                        <p><strong>Options:</strong></p>
                        <ul>
                          {question.options.map((option, i) => (
                            <li key={i} className={
                              Array.isArray(question.correctAnswer) && 
                              question.correctAnswer.includes(i.toString()) ? 'correct' : ''
                            }>
                              {option}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="add-question-form">
              <h3>Add New Question</h3>
              
              <div className="form-group">
                <label htmlFor="questionType">Question Type*</label>
                <select
                  id="questionType"
                  name="type"
                  className="form-control"
                  value={currentQuestion.type}
                  onChange={handleQuestionTypeChange}
                  required
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="coding">Coding</option>
                  <option value="short-answer">Short Answer</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="questionText">Question Text*</label>
                <textarea
                  id="questionText"
                  name="text"
                  className="form-control"
                  value={currentQuestion.text}
                  onChange={handleQuestionChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="questionPoints">Points*</label>
                <input
                  type="number"
                  id="questionPoints"
                  name="points"
                  className="form-control"
                  min="1"
                  value={currentQuestion.points}
                  onChange={handleQuestionChange}
                  required
                />
              </div>
              
              {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
                <div className="options-container">
                  <label>Options*</label>
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="option-row">
                      <input
                        type="text"
                        className="form-control"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        required
                      />
                      <div className="option-correct">
                        <input
                          type="checkbox"
                          id={`option-correct-${index}`}
                          checked={
                            Array.isArray(currentQuestion.correctAnswer) && 
                            currentQuestion.correctAnswer.includes(index.toString())
                          }
                          onChange={() => handleCorrectAnswerChange(index)}
                        />
                        <label htmlFor={`option-correct-${index}`}>Correct</label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {currentQuestion.type === 'coding' && (
                <div className="form-group">
                  <label htmlFor="codingSolution">Expected Solution (Optional)</label>
                  <textarea
                    id="codingSolution"
                    name="correctAnswer"
                    className="form-control code-editor"
                    value={currentQuestion.correctAnswer as string}
                    onChange={handleQuestionChange}
                    placeholder="Expected solution or test cases"
                  />
                </div>
              )}
              
              {currentQuestion.type === 'short-answer' && (
                <div className="form-group">
                  <label htmlFor="shortAnswerSolution">Correct Answer (Optional)</label>
                  <input
                    type="text"
                    id="shortAnswerSolution"
                    name="correctAnswer"
                    className="form-control"
                    value={currentQuestion.correctAnswer as string}
                    onChange={handleQuestionChange}
                    placeholder="Correct answer for auto-grading"
                  />
                </div>
              )}
              
              <button
                type="button"
                className="btn btn-primary"
                onClick={addQuestion}
              >
                Add Question
              </button>
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Create Test
          </button>
        </div>
      </form>
    </div>
  );
};

export default TestCreator; 