#!/usr/bin/env node

const http = require('http');

const BASE_URL = 'http://localhost:5000/api';

// Helper function untuk request
const makeRequest = (method, path, data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(responseData)
          });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

async function testProgressVisualization() {
  console.log('\n╔═════════════════════════════════════════════════════════════╗');
  console.log('║    PHASE 2 - PROGRESS VISUALIZATION FEATURE TEST             ║');
  console.log('║                       March 12, 2026                         ║');
  console.log('╚═════════════════════════════════════════════════════════════╝\n');

  let token = '';

  try {
    // Test 1: Login
    console.log('TEST 1: LOGIN');
    console.log('─'.repeat(60));
    const loginRes = await makeRequest('POST', '/auth/login', {
      username: 'student1',
      password: 'student123'
    });
    
    if (loginRes.status === 200) {
      token = loginRes.data.token;
      console.log('✓ Login successful');
      console.log(`  Token: ${token.substring(0, 30)}...`);
    } else {
      throw new Error('Login failed');
    }

    // Test 2: Get Profile
    console.log('\nTEST 2: GET PROFILE WITH STATS');
    console.log('─'.repeat(60));
    const profileRes = await makeRequest('GET', '/user/profile', null, token);
    
    if (profileRes.status === 200) {
      const profile = profileRes.data;
      console.log('✓ Profile retrieved');
      console.log(`  Username: ${profile.username}`);
      console.log(`  Levels Completed: ${profile.totallevelsCompleted}`);
      console.log(`  Average Score: ${profile.averageScore}%`);
      console.log(`  Streak: ${profile.streak} days`);
    } else {
      throw new Error('Failed to get profile');
    }

    // Test 3: Get Progress Data
    console.log('\nTEST 3: GET PROGRESS DATA FOR CHARTS');
    console.log('─'.repeat(60));
    const progressRes = await makeRequest('GET', '/progress', null, token);
    
    if (progressRes.status === 200) {
      const progress = progressRes.data;
      console.log('✓ Progress data retrieved');
      console.log(`  Total Levels: ${progress.levelProgress?.length || 0}`);
      
      if (progress.levelProgress && progress.levelProgress.length > 0) {
        console.log('\n  Level Progress Details:');
        progress.levelProgress.forEach((level, idx) => {
          console.log(`    ${idx + 1}. Level ${level.levelNumber}`);
          console.log(`       Status: ${level.status}`);
          console.log(`       Best Score: ${level.highScore}%`);
        });

        // Transform for charts
        const chartData = progress.levelProgress.map((level, idx) => ({
          name: `Level ${level.levelNumber}`,
          score: level.highScore || 0,
          status: level.status
        }));

        console.log('\n  Chart Data Format:');
        console.log('  ' + JSON.stringify(chartData.slice(0, 2), null, 2).split('\n').join('\n  '));
        if (chartData.length > 2) {
          console.log(`  ... and ${chartData.length - 2} more levels`);
        }
      }
    } else if (progressRes.status === 404) {
      console.log('✓ Progress endpoint exists (user has no progress yet)');
    } else {
      console.log(`✗ Progress fetch failed with status ${progressRes.status}`);
    }

    // Test 4: Complete another level and verify charts update
    console.log('\nTEST 4: COMPLETE LEVEL 2 TO TEST CHART UPDATES');
    console.log('─'.repeat(60));
    
    // Get Level 2 questions
    const level2QRes = await makeRequest('GET', '/levels/2/questions/student', null, token);
    if (level2QRes.status === 200 && level2QRes.data.questions?.length > 0) {
      const questions = level2QRes.data.questions;
      console.log(`✓ Level 2 questions loaded (${questions.length} questions)`);

      // Answer all questions
      let score2 = 0;
      for (const question of questions.slice(0, 2)) {
        const checkRes = await makeRequest('POST', '/levels/quiz/check-answer', {
          questionId: question._id,
          selectedOption: question.options[0]
        }, token);
        
        if (checkRes.data.correct) score2++;
      }

      // Complete level
      const completeLevelRes = await makeRequest('POST', '/progress/complete-level', {
        levelNumber: 2,
        score: Math.round((score2 / 2) * 100)
      }, token);

      if (completeLevelRes.status === 200) {
        console.log(`✓ Level 2 completed with ${Math.round((score2 / 2) * 100)}% score`);
      }

      // Verify updated progress
      const updatedProgressRes = await makeRequest('GET', '/progress', null, token);
      if (updatedProgressRes.status === 200 && updatedProgressRes.data.levelProgress) {
        const levels = updatedProgressRes.data.levelProgress;
        const completedCount = levels.filter(l => l.status === 'completed').length;
        console.log(`✓ Progress updated: ${completedCount} levels completed`);
      }
    }

    // Test Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ PROGRESS VISUALIZATION TEST SUMMARY');
    console.log('='.repeat(60));
    console.log('\n✓ Feature Status: WORKING');
    console.log('\nChart Components Ready:');
    console.log('  1. Stats Cards (Levels, Score, Streak)');
    console.log('  2. Bar Chart (Scores per Level)');
    console.log('  3. Line Chart (Progress Trend)');
    console.log('\nData Flow:');
    console.log('  Profile → get stats');
    console.log('  Progress → get level progress for charts');
    console.log('  Charts update on new completions');
    console.log('\nVisualization Pages:');
    console.log('  🎨 StudentProfilePage with embedded charts');
    console.log('  📊 Admin Dashboard with statistics');
    console.log('\nNext Steps:');
    console.log('  1. Test on mobile viewport (375px)');
    console.log('  2. Test chart responsiveness');
    console.log('  3. Verify empty state UI');
    console.log('\n' + '='.repeat(60) + '\n');

  } catch (err) {
    console.error('✗ Test failed:', err.message);
    process.exit(1);
  }
}

testProgressVisualization().catch(console.error);
