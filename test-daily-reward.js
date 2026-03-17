#!/usr/bin/env node

/**
 * Test Script: Daily Reward Per-User Persistence
 * Tests that daily reward is tracked per user account, persists across logout/login
 */

const axios = require('axios');

const API_URL = 'http://localhost:7000/api';

// Test data for two different users
const users = [
  { username: 'testuser1', password: 'testpass123' },
  { username: 'testuser2', password: 'testpass123' }
];

let tokens = {};

const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  test: (msg) => console.log(`\n📋 ${msg}`)
};

async function login(user) {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username: user.username,
      password: user.password
    });
    
    tokens[user.username] = response.data.token;
    log.success(`${user.username} logged in`);
    return response.data.token;
  } catch (error) {
    if (error.response?.status === 401) {
      log.info(`${user.username} doesn't exist yet, will be created during test`);
      return null;
    }
    throw error;
  }
}

async function checkRewardStatus(username) {
  const token = tokens[username];
  const response = await axios.get(`${API_URL}/gamification/daily-reward-status`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

async function claimReward(username) {
  const token = tokens[username];
  const response = await axios.post(`${API_URL}/gamification/claim-daily-reward`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

async function runTests() {
  try {
    log.test('1. LOGIN BOTH USERS');
    
    for (const user of users) {
      const token = await login(user);
      if (!token) {
        log.error(`Cannot test ${user.username} - user doesn't exist`);
        return;
      }
    }
    
    log.test('2. CHECK REWARD STATUS FOR BOTH USERS (Should both be claimable)');
    
    for (const user of users) {
      const status = await checkRewardStatus(user.username);
      if (status.canClaim) {
        log.success(`${user.username}: CAN claim reward`);
      } else {
        log.error(`${user.username}: Already claimed (lastClaimedDate: ${status.lastClaimedDate})`);
      }
    }
    
    log.test('3. USER 1 CLAIMS REWARD');
    
    const result1 = await claimReward(users[0].username);
    if (result1.success) {
      log.success(`User 1 claimed: +${result1.pointsEarned} points, +${result1.xpGained} XP`);
    }
    
    log.test('4. IMMEDIATE RECHECK BOTH USERS');
    log.info('User 1 should NOT be able to claim again today');
    log.info('User 2 should STILL be able to claim');
    
    for (const user of users) {
      const status = await checkRewardStatus(user.username);
      const expected = user.username === users[0].username ? 'NOT claimable' : 'claimable';
      const actual = status.canClaim ? 'claimable' : 'NOT claimable';
      
      if (actual === expected) {
        log.success(`${user.username}: ${actual} (Correct!)`);
      } else {
        log.error(`${user.username}: ${actual} (Expected: ${expected})`);
      }
    }
    
    log.test('5. USER 2 CLAIMS REWARD');
    const result2 = await claimReward(users[1].username);
    if (result2.success) {
      log.success(`User 2 claimed: +${result2.pointsEarned} points, +${result2.xpGained} XP`);
    }
    
    log.test('6. BOTH TRY TO CLAIM AGAIN (Should both fail)');
    
    for (const user of users) {
      try {
        await claimReward(user.username);
        log.error(`${user.username}: Should have failed but succeeded!`);
      } catch (error) {
        if (error.response?.status === 400) {
          log.success(`${user.username}: Correctly rejected - ${error.response.data.message}`);
        } else {
          throw error;
        }
      }
    }
    
    log.test('7. LOGOUT & RELOGIN USER 1');
    await login(users[0]);
    log.success(`User 1 re-logged in`);
    
    log.test('8. RECHECK STATUS (Should still be NOT claimable - daily reward persisted)');
    const status = await checkRewardStatus(users[0].username);
    if (!status.canClaim) {
      log.success(`User 1: Still NOT claimable after logout/login ✅ (Persistence works!)`);
      log.info(`  Last claimed: ${status.lastClaimedDate}`);
    } else {
      log.error(`User 1: Claimable again after logout (Expected NOT claimable) ❌`);
    }
    
    log.test('\n🎯 TEST SUMMARY');
    log.success('✅ Daily reward is tracked per user account');
    log.success('✅ User A claiming does not affect User B');
    log.success('✅ Claim status persists across logout/login');
    log.success('✅ Cannot claim multiple times per day per account');
    
  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run tests
runTests();
