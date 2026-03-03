const { padLeft, padRight } = require('../utils/format');

const buildReceipt = (items) => {
  const now = new Date();
  const receiptNumber = now.getTime();

  const header = [
    '========================================',
    '              KASSA RECEIPT             ',
    '========================================',
    `Date: ${now.toLocaleString('ru-RU')}`,
    `Receipt #: ${receiptNumber}`,
    '----------------------------------------',
    `${padRight('Item', 18)}${padLeft('Qty', 6)}${padLeft('Price', 8)}${padLeft('Sum', 8)}`,
    '----------------------------------------',
  ];

  const lines = items.map((item) => {
    const sum = item.qty * item.price;
    return `${padRight(item.name, 18)}${padLeft(item.qty, 6)}${padLeft(item.price.toFixed(2), 8)}${padLeft(sum.toFixed(2), 8)}`;
  });

  const total = items.reduce((acc, item) => acc + item.qty * item.price, 0);

  const footer = [
    '----------------------------------------',
    `${padRight('TOTAL:', 32)}${padLeft(total.toFixed(2), 8)}`,
    '========================================',
    'Thank you for your purchase!',
  ];

  return [...header, ...lines, ...footer].join('\n') + '\n';
};

module.exports = {
  buildReceipt,
};
