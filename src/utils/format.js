const formatMoney = (value) => `${value.toFixed(2)} RUB`;

const padRight = (value, width) => {
  const text = String(value);
  return text.length >= width ? text.slice(0, width) : text + ' '.repeat(width - text.length);
};

const padLeft = (value, width) => {
  const text = String(value);
  return text.length >= width ? text.slice(0, width) : ' '.repeat(width - text.length) + text;
};

const padCenter = (value, width) => {
  const text = String(value);
  if (text.length >= width) return text.slice(0, width);
  const total = width - text.length;
  const left = Math.ceil(total / 2);
  const right = total - left;
  return ' '.repeat(left) + text + ' '.repeat(right);
};

module.exports = {
  formatMoney,
  padRight,
  padLeft,
  padCenter,
};
