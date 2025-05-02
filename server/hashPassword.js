// server/hashPassword.js
const bcrypt = require('bcrypt');
require('dotenv').config(); // To get BCRYPT_SALT_ROUNDS

const plainPassword = 'studentpassword'; // The password you want to hash
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || 10);

bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  console.log('Password:', plainPassword);
  console.log('Hashed Password:', hash);
  // Now copy this hash and use it in your INSERT statement
});