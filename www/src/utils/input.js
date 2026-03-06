const readline = require('readline');

const createInput = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = (question) =>
    new Promise((resolve) => rl.question(question, (answer) => resolve(answer.trim())));

  const readPositiveNumber = async (question) => {
    while (true) {
      const raw = await ask(question);
      const value = Number(raw.replace(',', '.'));
      if (Number.isFinite(value) && value > 0) {
        return value;
      }
      console.log('Введите число больше 0.');
    }
  };

  return {
    ask,
    readPositiveNumber,
    close: () => rl.close(),
  };
};

module.exports = {
  createInput,
};
