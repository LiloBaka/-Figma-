# Illustration Builder

Figma-плагин для сборки векторных иллюстраций из неизменяемой локальной
библиотеки SVG. Плагин не создаёт новые path и не использует raster/image
embeds: сцена создаётся через `figma.createNodeFromSvg()`, а экспортируется
управляемый frame как SVG.

## Установка в Figma

1. Установите зависимости: `npm install`.
2. Соберите плагин: `npm run build`.
3. В Figma откройте **Plugins → Development → Import plugin from manifest…**
   и выберите `manifest.json` в корне проекта.
4. Запустите **Illustration Builder** из Development plugins.

После изменения исходников повторите `npm run build`, затем перезапустите
Development plugin в Figma.

## Сценарии

- Выберите ассет, роль `main`/`background` и добавьте его в сцену; координаты,
  поворот, порядок и дублирование редактируются в списке сцены.
- Введите RU/EN метафору и нажмите «Собрать»: локальный детерминированный
  словарь выбирает только допустимые asset ID, роли и шаблон. Сети, API-ключа
  и AI backend нет.
- Используйте три воспроизводимые demo-scenes: только `main`, `main +
  background`, и альтернативные формат/шаблон.
- Нажмите «Скачать SVG». Плагин экспортирует только свой frame, проверяет
  отсутствие `<image>` и `data:image`, а UI скачивает полученные SVG-байты.

## Архитектура

`src/ui.html` — интерфейс и загрузка SVG вариантов; `src/code.ts` — владелец
сцены в Figma, импорт, сохранение в `clientStorage` и экспорт; `src/scene.ts`
— модель и reducer; `src/templates.ts` — детерминированные пресеты и safe area;
`src/metaphor.ts` — offline picker. Манифесты в `spec/` являются источником
разрешённых ассетов и шаблонов. Схема сообщений описана в `docs/MESSAGES.md`.

## Проверки

```powershell
python3 scripts/validate_assets.py
npm run check:catalog
npm run check:insert
npm run check:scene
npm run check:templates
npm run check:metaphor
npm run check:export
npm run build
```

## Ограничения

- Оригинальные `assets/**/*.svg` не изменяются; отсутствуют свободный scale и
  генерация геометрии.
- Размер холста 1200×630, safe area и позиции шаблонов — документированные MVP
  допущения, а не извлечённые slot bounds.
- Редактируемость и фактический SVG-экспорт в Figma требуют ручного запуска
  Development plugin; они не могут быть подтверждены только Node-тестами.
- Подтверждённые палитры и точные native dimensions L/S в материалах отсутствуют.

## Использованные AI-инструменты

При подготовке этого проекта использовался Codex для реализации и проверок.
В самом плагине AI-инструменты, сетевые API и внешние сервисы не используются.
