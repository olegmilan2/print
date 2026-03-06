const formatMoney = (value) => `${value.toFixed(2)} RUB`;

const padRight = (value, width) => {
  const text = String(value);
  return text.length >= width ? text.slice(0, width) : text + ' '.repeat(width - text.length);
};

const padLeft = (value, width) => {
  const text = String(value);
  return text.length >= width ? text.slice(0, width) : ' '.repeat(width - text.length) + text;
};

module.exports = {
  formatMoney,
  padRight,
  padLeft,
};
