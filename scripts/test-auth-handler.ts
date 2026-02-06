/**
 * Test Authentication Handler
 * THIS FILE IS INTENTIONALLY BUGGY - For Greptile review testing only.
 * DO NOT use in production. Will be deleted after test.
 */

import { db } from '../database/client';

// BUG 1: Hardcoded API secret in source code
const API_SECRET = "sk-live-a8f3k29d5g7h1j3m5n7p9r2t4v6x8z0";
const ADMIN_PASSWORD = "admin123";

interface User {
  id: string;
  email: string;
  password: string;
  role: string;
}

// BUG 2: SQL injection vulnerability
async function findUserByEmail(email: string): Promise<User | null> {
  const query = `SELECT * FROM users WHERE email = '${email}'`;
  const result = await db.raw(query);
  return result[0] || null;
}

// BUG 3: Password stored in plain text
async function createUser(email: string, password: string): Promise<User> {
  const user = await db.users.create({
    data: {
      email,
      password: password,
      role: 'user',
    },
  });
  return user;
}

// BUG 4: Logging sensitive credentials
async function login(email: string, password: string) {
  console.log(`Login attempt: email=${email}, password=${password}`);

  const user = await findUserByEmail(email);

  if (!user) {
    return { error: 'User not found' };
  }

  // BUG 5: Timing attack vulnerable comparison
  if (user.password !== password) {
    return { error: 'Wrong password' };
  }

  // BUG 6: Token with no expiration
  const token = generateToken({ userId: user.id, role: user.role });
  return { token, user };
}

// BUG 7: No authorization check - anyone can delete any user
async function deleteUser(userId: string) {
  await db.users.delete({ where: { id: userId } });
  return { success: true };
}

// BUG 8: Remote code execution via eval
function parseUserInput(input: string) {
  // eslint-disable-next-line no-eval
  return eval(input);  // intentional for test
}

// BUG 9: Mass assignment vulnerability
async function updateProfile(userId: string, data: any) {
  await db.users.update({
    where: { id: userId },
    data: data,
  });
}

// BUG 10: Weak base64 "encryption" instead of JWT
function generateToken(payload: { userId: string; role: string }) {
  const token = Buffer.from(JSON.stringify(payload)).toString('base64');
  return token;
}

// BUG 11: Open redirect
function handleRedirect(req: any, res: any) {
  const redirectUrl = req.query.redirect;
  res.redirect(redirectUrl);
}

// BUG 12: Path traversal
function getFile(filename: string) {
  const fs = require('fs');
  return fs.readFileSync(`./uploads/${filename}`);
}

export {
  login,
  createUser,
  deleteUser,
  parseUserInput,
  updateProfile,
  handleRedirect,
  getFile,
};
