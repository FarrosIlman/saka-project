const usersData = [
  {
    username: 'admin',
    role: 'admin',
    passwordEnv: 'ADMIN_PASSWORD' // Which env var to read from
  },
  {
    username: 'student1',
    role: 'student',
    passwordEnv: 'STUDENT_PASSWORD'
  },
  {
    username: 'student2',
    role: 'student',
    passwordEnv: 'STUDENT_PASSWORD'
  }
];

module.exports = usersData;
