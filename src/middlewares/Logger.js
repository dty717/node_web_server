const fs = require('fs');
const path = require('path');
const { Console } = require('console');
const {spawn} = require('child_process');
const { router } = require('../routing/Router');
const { _time_ } = require('./Common');

const outputPath = path.resolve(router.getBasePath(), 'src', './user/stdout.log');
const errorOutputPath = path.resolve(router.getBasePath(), 'src', './user/stderr.log');

const output = fs.createWriteStream(outputPath, {flags:'a'});
const errorOutput = fs.createWriteStream(errorOutputPath, {flags:'a'});

// Custom simple logger
const logger = new Console({ stdout: output, stderr: errorOutput });
process.env.TZ = 'Asia/Shanghai';
var index= 0;

//TODO mysql connect error
process.on('uncaughtException',function(err) {
  logger.log(_time_(new Date()),"uncaughtException",index++);
  logger.log(_time_(new Date()),err.stack);
  logger.log(_time_(new Date()),"exit");

  setTimeout(() => {
    const subprocess = spawn(process.argv[1], process.argv.slice(2), { detached: true, stdio: ['ignore', output, errorOutput] });
    subprocess.unref();
  }, 2000)
});

module.exports = {logger}