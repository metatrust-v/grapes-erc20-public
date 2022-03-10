
const { exec } = require('child_process');

module.exports.buildVerifyScript = function(name, artifact, address, network) {
    return { 
      script: `truffle run verify ${artifact}@${address} --network ${network}`,
      name
    };
  };
  
module.exports.logVerifyScript = function({ name, script }) {
    console.log(`VERIFY SCRIPT(${name}): ${script}`);
}

module.exports.verifyContract = function({ name, script }, attempts) {
    console.log(`Verifying Contract: ${name}`);
 
    return new Promise((resolve) => {
 
       function go(attempt) {
          if (attempt > attempts) {
             console.log(`Verify script (${name}) failed after ${attempts} attempts: ${script}`)
             return resolve();
          }
 
          exec(script, (error, stdout, stderr) => {
             if (error) {
                console.log(`Attempt ${attempt} failed.  Retrying...`);
                console.log(error);
                console.log(stderr);
 
                // Recursively try again
                return go(attempt + 1);
             }
 
             // Verification successful
             console.log(stdout);
             console.log(`Verifying Contract: ${name} - SUCCESS`);
             resolve();
          });
       }
 
       // Kick off the first try
       go(1);
    });
 }