# Print Cashier (macOS)

Приложение для ввода позиций и печати чеков.

## Установка готового приложения

1. Скачайте `Print Cashier-1.0.0-arm64.dmg` (или `x64`) из релизов.
2. Откройте `.dmg` и перетащите `Print Cashier.app` в `Applications`.
3. Запустите приложение из `Applications`.

## Сборка `.dmg` локально (на Mac)

```bash
npm install
npm run dist:mac
```

Готовые файлы будут в папке `dist/`.

## Печать Bluetooth

Рекомендуемый способ на macOS:
1. Спарьте принтер в `System Settings -> Bluetooth`.
2. Нажмите `Печать` в приложении и выберите ваш принтер в системном окне печати.

Кнопки Web Bluetooth в интерфейсе зависят от поддержки принтера BLE/GATT и браузерного API.
