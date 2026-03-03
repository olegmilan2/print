const fs = require('fs');
const path = require('path');

const { printViaSystem } = require('./src/services/printer');
const { buildReceipt } = require('./src/services/receipt');
const { formatMoney } = require('./src/utils/format');
const { createInput } = require('./src/utils/input');

async function main() {
  const input = createInput();
  const { ask, readPositiveNumber, close } = input;

  try {
    console.log('Введите позиции для чека. Чтобы завершить, оставьте название пустым.');

    const items = [];

    while (true) {
      const name = await ask('Название товара: ');
      if (!name) {
        break;
      }

      const qty = await readPositiveNumber('Количество: ');
      const price = await readPositiveNumber('Цена за 1 шт: ');

      items.push({ name, qty, price });

      const lineSum = qty * price;
      console.log(`Добавлено: ${name}, ${qty} x ${formatMoney(price)} = ${formatMoney(lineSum)}`);
    }

    if (items.length === 0) {
      console.log('Нет позиций. Чек не сформирован.');
      return;
    }

    const receipt = buildReceipt(items);
    console.log('\nСформированный чек:\n');
    console.log(receipt);

    const outputDir = path.join(process.cwd(), 'receipts');
    fs.mkdirSync(outputDir, { recursive: true });

    const fileName = `receipt-${Date.now()}.txt`;
    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, receipt, 'utf8');

    console.log(`Чек сохранен: ${filePath}`);

    const shouldPrint = (await ask('Печатать сейчас? (y/n): ')).toLowerCase();

    if (['y', 'yes', 'д', 'да'].includes(shouldPrint)) {
      const printerName = await ask('Имя принтера (Enter для принтера по умолчанию): ');

      try {
        printViaSystem(filePath, printerName || undefined);
        console.log('Чек отправлен на печать.');
      } catch (error) {
        console.log('Не удалось отправить чек на печать.');
        console.log('Проверьте, что установлен и настроен lp/lpr в системе.');
        console.log(`Ошибка: ${error.message}`);
      }
    }
  } finally {
    close();
  }
}

main().catch((error) => {
  console.error('Ошибка:', error);
  process.exit(1);
});
