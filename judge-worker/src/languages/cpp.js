const fs = require('fs');
const path = require('path');
const { runDocker } = require('../docker');

module.exports = {
  filename: 'Solution.cpp',
  image: 'gcc:12', // using gcc 12 docker image
  
  compile: async (dir, containerName) => {
    // Compile using docker to ensure environment consistency
    // Bind mount the temp directory containing Solution.cpp
    const cmd = `run --rm --name ${containerName} -v "${dir}:/usr/src/app" -w /usr/src/app gcc:12 g++ -O2 -std=c++17 Solution.cpp -o Solution`;
    await runDocker(cmd);
    return 'Solution'; // the executable name
  },

  runCommand: (executable) => {
    return `./${executable}`;
  }
};
