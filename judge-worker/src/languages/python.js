module.exports = {
  filename: 'solution.py',
  image: 'python:3.11',
  
  compile: async () => {
    // Python doesn't need compilation
    return 'solution.py';
  },

  runCommand: (executable) => {
    return `python3 ${executable}`;
  }
};
