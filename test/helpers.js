'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

function makeTempDir(prefix = 'claudoist-test-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function withCwd(dir, fn) {
  const prev = process.cwd();
  process.chdir(dir);
  try {
    return fn();
  } finally {
    process.chdir(prev);
  }
}

module.exports = {
  makeTempDir,
  write,
  read,
  withCwd,
};
