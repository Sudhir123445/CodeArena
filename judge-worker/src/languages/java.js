module.exports = {
  filename: 'Main.java',
  image: 'openjdk:21', // java 21
  
  compile: async (dir, containerName) => {
    const { runDocker } = require('../docker');
    const cmd = `run --rm --name ${containerName} -v "${dir}:/usr/src/app" -w /usr/src/app openjdk:21 javac Main.java`;
    await runDocker(cmd);
    return 'Main'; // class name
  },

  runCommand: (executable) => {
    return `java ${executable}`;
  }
};
