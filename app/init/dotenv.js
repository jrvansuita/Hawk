//All enviroment variables needs to be declared on the machine OS or config variables panel
//Also, it can be declared on .env file located on root dir.
//If NODE_ENV is defined, we are running on production machine \o/
if (!process.env.NODE_ENV) {
  dotenv = require('dotenv');

  const result = dotenv.config();

  if (result.error) {
    throw result.error;
  }

  //console.log(result.parsed);
}