const usersData = [
  {
    username: 'admin',
    role: 'admin',
    passwordEnv: 'ADMIN_PASSWORD', // Which env var to read from, fallback to 'admin123'
    defaultPassword: 'admin123'
  },
  {
    username: 'student1',
    role: 'student',
    passwordEnv: 'STUDENT_PASSWORD', 
    defaultPassword: 'student123'
  },
  {
    username: 'student2',
    role: 'student',
    passwordEnv: 'STUDENT_PASSWORD',
    defaultPassword: 'student123'
  }
];

module.exports = usersData;
