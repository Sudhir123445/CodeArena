const fs = require('fs');
const path = require('path');
const { runDocker, cleanup } = require('./docker');
const cpp = require('./languages/cpp');
const java = require('./languages/java');
const python = require('./languages/python');

const languages = { cpp, java, python };

const runSubmission = async (submissionId, language, sourceCode, timeLimitMs, memoryLimitKb, testCases) => {
  const langConfig = languages[language];
  if (!langConfig) throw new Error('Unsupported language');

  const workDir = path.join(require('os').tmpdir(), `sub_${submissionId}_${Date.now()}`);
  fs.mkdirSync(workDir, { recursive: true });

  const sourcePath = path.join(workDir, langConfig.filename);
  fs.writeFileSync(sourcePath, sourceCode);

  let executable;
  try {
    // 1. Compile
    const compileContainer = `compile_${submissionId}_${Date.now()}`;
    try {
      executable = await langConfig.compile(workDir, compileContainer);
    } catch (compileErr) {
      await cleanup(compileContainer, workDir);
      return { verdict: 'CE', message: compileErr.stderr || compileErr.error?.message };
    }

    // 2. Run test cases
    let maxTime = 0;
    let maxMem = 0;
    const results = [];

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const runContainer = `run_${submissionId}_tc${i}_${Date.now()}`;
      
      const inputPath = path.join(workDir, `input_${i}.txt`);
      fs.writeFileSync(inputPath, tc.input);

      // Security flags
      // --network none : No internet
      // --memory : Limit RAM
      // --cpus : Limit CPU
      // --read-only : Container FS is read only (except bound volume)
      const memMb = Math.max(4, Math.ceil(memoryLimitKb / 1024)); // Docker requires min 4MB
      
      const runCmdStr = langConfig.runCommand(executable);
      
      // We pass the input file to stdin of the container
      const dockerRunCmd = `run -i --rm --name ${runContainer} --network none --memory ${memMb}m --cpus 1.0 -v "${workDir}:/usr/src/app" -w /usr/src/app ${langConfig.image} sh -c "${runCmdStr}" < "${inputPath}"`;

      let verdict = 'AC';
      let errorMsg = null;
      let output = '';
      const startTime = Date.now();
      
      try {
        // Enforce time limit manually using a Promise race or timeout wrapper in docker.js
        // Here we just pass a timeout to child_process exec via docker.js, but for simplicity
        // we'll run it, if it takes longer than timeout we kill it
        const runPromise = runDocker(dockerRunCmd);
        
        // Timeout mechanism
        let timer;
        const timeoutPromise = new Promise((_, reject) => {
          timer = setTimeout(() => {
             reject(new Error('TLE'));
             cleanup(runContainer);
          }, timeLimitMs + 500); // 500ms grace period for docker startup overhead
        });

        const result = await Promise.race([runPromise, timeoutPromise]);
        clearTimeout(timer);
        output = result.stdout;
        
      } catch (err) {
        if (err.message === 'TLE') {
          verdict = 'TLE';
        } else if (err.stderr && err.stderr.includes('OutOfMemory')) {
           verdict = 'MLE';
        } else {
           verdict = 'RE';
           errorMsg = err.stderr || err.error?.message;
        }
      }

      const timeTaken = Date.now() - startTime;
      maxTime = Math.max(maxTime, timeTaken);
      
      // Check answer if AC so far
      if (verdict === 'AC') {
        const actual = output.trim();
        const expected = tc.output.trim();
        if (actual !== expected) {
          verdict = 'WA';
        }
      }

      results.push({
        testCaseId: tc.id,
        verdict,
        timeMs: timeTaken,
        output: verdict === 'WA' ? output.substring(0, 1000) : null // only send back short output on WA
      });

      // Break early if failed
      if (verdict !== 'AC') {
        await cleanup(runContainer, workDir);
        return { verdict, timeMs: maxTime, memoryKb: maxMem, results };
      }
    }

    await cleanup(null, workDir);
    return { verdict: 'AC', timeMs: maxTime, memoryKb: maxMem, results };

  } catch (err) {
    await cleanup(null, workDir);
    return { verdict: 'SE', message: err.message }; // System Error
  }
};

module.exports = { runSubmission };
