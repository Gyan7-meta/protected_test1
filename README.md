# ProctorEd - Web-Based Proctored Testing Application

A comprehensive web-based proctored testing platform similar to HackerEarth or HackerRank for educational institutions to conduct secure online assessments.

## Features

### User Registration System
- Collects candidate information including full name, email, phone number, university, student ID, and course enrollment
- Secure authentication system
- Photo ID upload for identity verification

### Proctoring Security Features
- Full-screen lockdown mode that prevents users from exiting during the test
- Camera access functionality that takes periodic snapshots to verify candidate's identity
- Microphone monitoring to detect suspicious conversations
- Tab/window switching detection and logging
- Copy-paste restrictions for all test content
- Keyboard shortcut blocking for common cheating methods
- Suspicious activity logging with timestamps

### Test Administration
- Intuitive test creator interface for instructors
- Support for multiple question types (multiple choice, coding, short answer)
- Time-tracking system with configurable test duration
- Auto-submission function when time expires
- Randomized question bank feature

### Technical Implementation
- Built using React for the frontend with responsive design
- Uses WebRTC for camera and microphone access
- Comprehensive consent screens for privacy permissions

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/proctored-test-app.git
```

2. Install dependencies:
```
cd proctored-test-app
npm install
```

3. Start the development server:
```
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## Demo Accounts

For demo purposes, you can use the following accounts:

### Student Account
- Email: student@example.com
- Password: password

### Instructor Account
- Email: instructor@example.com
- Password: password

## Security Features Explanation

### Full-screen Enforcement
The application uses the Fullscreen API to force the test window into full-screen mode. If the user exits full-screen mode, it's logged as a violation and can be configured to automatically submit the test.

### Camera/Microphone Monitoring
- Uses WebRTC to access the user's camera and microphone
- Takes periodic snapshots (every 30 seconds by default) to verify the student's identity
- Monitors audio levels to detect conversations or unusual sounds
- All media is processed with proper consent from the user

### Tab-switching Detection
Uses the Document Visibility API (document.visibilitychange event) to detect when the user switches to another tab or window, logging it as a potential violation.

## License
MIT License
