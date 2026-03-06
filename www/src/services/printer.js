const { spawnSync } = require('child_process');

const printViaSystem = (filePath, printerName) => {
  const command = process.platform === 'darwin' ? 'lp' : 'lpr';
  const args = [];

  if (printerName) {
    if (command === 'lp') {
      args.push('-d', printerName);
    } else {
      args.push('-P', printerName);
    }
  }

  args.push(filePath);

  const result = spawnSync(command, args, { encoding: 'utf8' });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(result.stderr || `Print command failed with code ${result.status}`);
  }
};

module.exports = {
  printViaSystem,
};
