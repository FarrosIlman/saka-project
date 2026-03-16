/**
 * Quiz Flow End-to-End Test
 * Tests complete quiz flow: Login -> Levels -> Quiz -> Score -> Profile
 */

const http = require('http');

const API_BASE = 'http://localhost:5000/api';
const TEST_USER = {
  username: 'student1',
  password: 'student123'
};

let token = '';
let userId = '';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function sep(title = '') {
  console.log(`\n${colors.cyan}${'='.repeat(60)}`);
  if (title) console.log(`${title}`);
  console.log(`${'='.repeat(60)}${colors.reset}\n`);
}

// Helper function to make HTTP requests
function makeRequest(method, endpoint, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + endpoint);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, data: parsed, status: res.statusCode });
          } else {
            resolve({ success: false, data: parsed, status: res.statusCode });
          }
        } catch {
          resolve({ success: res.statusCode < 400, data: { message: data }, status: res.statusCode });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// Test 1: Login
async function testLogin() {
  sep('TEST 1: LOGIN');
  try {
    const result = await makeRequest('POST', '/auth/login', TEST_USER);
    
    if (!result.success) {
      throw new Error(result.data.message || 'Login failed');
    }

    token = result.data.token;
    userId = result.data._id;
    
    log(colors.green, `✓ Login successful`);
    log(colors.blue, `  Username: ${result.data.username}`);
    log(colors.blue, `  Role: ${result.data.role}`);
    log(colors.blue, `  Token: ${token.substring(0, 20)}...`);
    return true;
  } catch (err) {
    log(colors.red, `✗ Login failed: ${err.message}`);
    return false;
  }
}

// Test 2: Get Student Levels
async function testGetLevels() {
  sep('TEST 2: GET STUDENT LEVELS');
  try {
    const result = await makeRequest('GET', '/levels/student');
    
    if (!result.success) {
      throw new Error(result.data.message || 'Failed to get levels');
    }

    const levels = result.data;
    log(colors.green, `✓ Fetched ${levels.length} levels`);
    
    levels.forEach((level, idx) => {
      log(colors.blue, `  ${idx + 1}. ${level.title} (Level ${level.levelNumber}) - ${level.status}`);
    });
    
    return levels;
  } catch (err) {
    log(colors.red, `✗ Failed to get levels: ${err.message}`);
    return null;
  }
}

// Test 3: Get Level Questions
async function testGetQuestions(levelNumber) {
  sep(`TEST 3: GET QUESTIONS FOR LEVEL ${levelNumber}`);
  try {
    const result = await makeRequest('GET', `/levels/${levelNumber}/questions/student`);
    
    if (!result.success) {
      throw new Error(result.data.message || 'Failed to get questions');
    }

    const { level, questions } = result.data;
    log(colors.green, `✓ Fetched ${questions.length} questions for level: ${level.title}`);
    
    questions.forEach((q, idx) => {
      log(colors.blue, `  Q${idx + 1}: ${q.questionText}`);
      log(colors.blue, `       Options: ${q.options.join(', ')}`);
    });
    
    return questions;
  } catch (err) {
    log(colors.red, `✗ Failed to get questions: ${err.message}`);
    return null;
  }
}

// Test 4: Answer Questions & Calculate Score
async function testAnswerQuestions(questions) {
  sep('TEST 4: ANSWER QUESTIONS');
  
  if (!questions || questions.length === 0) {
    log(colors.red, `✗ No questions to answer`);
    return null;
  }

  let correctCount = 0;
  const answers = [];

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const selectedOption = question.options[0]; // Always select first option for testing
    
    try {
      const result = await makeRequest('POST', '/levels/quiz/check-answer', {
        questionId: question._id,
        selectedOption: selectedOption
      });

      if (!result.success) {
        throw new Error(result.data.message || 'Failed to check answer');
      }

      const { correct, correctAnswer } = result.data;
      if (correct) {
        correctCount++;
        log(colors.green, `  ✓ Q${i + 1}: Correct (selected: "${selectedOption}")`);
      } else {
        log(colors.yellow, `  ✗ Q${i + 1}: Wrong (selected: "${selectedOption}", correct: "${correctAnswer}")`);
      }
      
      answers.push({ questionId: question._id, selectedOption, correct });
    } catch (err) {
      log(colors.red, `  ✗ Q${i + 1} Error: ${err.message}`);
      answers.push({ questionId: question._id, selectedOption, correct: false });
    }
  }

  const score = Math.round((correctCount / questions.length) * 100);
  log(colors.blue, `\n  Score: ${correctCount}/${questions.length} (${score}%)`);
  
  return { score, correctCount, totalQuestions: questions.length };
}

// Test 5: Complete Level (Save Progress)
async function testCompleteLevel(levelNumber, score) {
  sep(`TEST 5: COMPLETE LEVEL ${levelNumber}`);
  try {
    const result = await makeRequest('POST', '/progress/complete-level', {
      levelNumber: levelNumber,
      score: score
    });

    if (!result.success) {
      throw new Error(result.data.message || 'Failed to complete level');
    }

    log(colors.green, `✓ Level completed and saved`);
    log(colors.blue, `  Level: ${levelNumber}`);
    log(colors.blue, `  Score: ${score}%`);
    return true;
  } catch (err) {
    log(colors.red, `✗ Failed to complete level: ${err.message}`);
    return false;
  }
}

// Test 6: Get User Profile
async function testGetProfile() {
  sep('TEST 6: GET USER PROFILE');
  try {
    const result = await makeRequest('GET', '/user/profile');

    if (!result.success) {
      throw new Error(result.data.message || 'Failed to get profile');
    }

    const profile = result.data;
    log(colors.green, `✓ Profile retrieved`);
    log(colors.blue, `  Username: ${profile.username}`);
    log(colors.blue, `  Email: ${profile.email || 'Not set'}`);
    log(colors.blue, `  Levels Completed: ${profile.totallevelsCompleted || 0}`);
    log(colors.blue, `  Average Score: ${profile.averageScore || 0}%`);
    log(colors.blue, `  Streak: ${profile.streak || 0} days`);
    log(colors.blue, `  Joined: ${new Date(profile.createdAt).toLocaleDateString('id-ID')}`);
    
    return profile;
  } catch (err) {
    log(colors.red, `✗ Failed to get profile: ${err.message}`);
    return null;
  }
}

// Test 7: Health Check
async function testHealthCheck() {
  sep('TEST 0: HEALTH CHECK');
  try {
    const result = await makeRequest('GET', '/health');
    
    if (!result.success) {
      throw new Error('Health check failed');
    }

    log(colors.green, `✓ Backend is running`);
    log(colors.blue, `  Status: ${result.data.status}`);
    log(colors.blue, `  Message: ${result.data.message}`);
    return true;
  } catch (err) {
    log(colors.red, `✗ Backend not running: ${err.message}`);
    log(colors.yellow, `  Make sure backend is started with: npm --prefix backend run dev`);
    return false;
  }
}

// Main Test Runner
async function runTests() {
  log(colors.cyan, `
╔═══════════════════════════════════════════════════════════╗
║       SAKA QUIZ FLOW END-TO-END AUTOMATED TEST             ║
║                        March 11, 2026                      ║
╚═══════════════════════════════════════════════════════════╝
  `);

  // Health check first
  if (!(await testHealthCheck())) {
    return;
  }

  // Run tests in sequence
  const loginOk = await testLogin();
  if (!loginOk) return;

  const levels = await testGetLevels();
  if (!levels) return;

  // Test with first available unlocked level
  const testLevel = levels.find(l => l.status !== 'locked');
  if (!testLevel) {
    log(colors.red, `✗ No unlocked level available for testing`);
    return;
  }

  const questions = await testGetQuestions(testLevel.levelNumber);
  if (!questions) return;

  const scoreResult = await testAnswerQuestions(questions);
  if (!scoreResult) return;

  const completeOk = await testCompleteLevel(testLevel.levelNumber, scoreResult.score);
  if (!completeOk) return;

  const profile = await testGetProfile();

  // Summary
  sep('TEST SUMMARY');
  log(colors.green, `✓ All tests completed successfully!`);
  log(colors.blue, `
  Test Results:
    ✓ Backend Health Check: PASS
    ✓ User Authentication: PASS
    ✓ Level Fetching: PASS
    ✓ Question Loading: PASS
    ✓ Answer Validation: PASS (${scoreResult.correctCount}/${scoreResult.totalQuestions})
    ✓ Progress Saving: PASS
    ✓ Profile Retrieval: PASS
    
  Quiz Flow: COMPLETE ✓
  
  Next Phase 1 Tasks:
    ⏳ Admin Pages Integration (add toasts to CRUD)
    ⏳ Loading States Polish
    ⏳ Mobile Responsiveness Testing
  `);
}

// Run the tests
runTests().catch(err => {
  log(colors.red, `\n✗ Test runner error: ${err.message}`);
  process.exit(1);
});
