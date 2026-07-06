const { exec } = require('child_process');

/**
 * Execute a docker command.
 * @param {string} command - The part after 'docker '
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
const runDocker = (command) => {
  return new Promise((resolve, reject) => {
    exec(`docker ${command}`, (error, stdout, stderr) => {
      if (error) {
        // We reject with stdout/stderr too, as they contain compilation errors or test failures
        reject({ error, stdout, stderr });
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
};

/**
 * Cleanup container and temporary directory.
 */
const cleanup = async (containerName, tempDirPath = null) => {
  try {
    await runDocker(`rm -f ${containerName}`);
  } catch (err) {
    // Ignore cleanup errors
  }
  
  if (tempDirPath) {
    try {
      // In Windows powershell we'd use Remove-Item, but node's fs is safer
      const fs = require('fs');
      if (fs.existsSync(tempDirPath)) {
        fs.rmSync(tempDirPath, { recursive: true, force: true });
      }
    } catch (err) {
      console.error(`Failed to delete temp dir ${tempDirPath}`, err);
    }
  }
};

module.exports = {
  runDocker,
  cleanup
};
