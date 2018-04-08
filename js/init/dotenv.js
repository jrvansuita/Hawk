//Load enviroment variable into node process.env. See any *.env files on root dir.
dotenv = require('dotenv');

const result = dotenv.config();

if (result.error) {
  throw result.error;
}

//console.log(result.parsed);