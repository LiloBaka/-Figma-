# PROGRESS — единственная короткая память между сессиями Codex

Текущий этап: 7 (завершён)

| Этап | Статус | Результат |
|---|---|---|
| 0 Аудит | ☑ | Манифесты и контракты задокументированы; 48 путей существуют. |
| 1 Каркас | ☑ | Созданы Figma manifest, TypeScript main/UI entrypoints и сборка; ping/pong реализован в коде. |
| 2 Каталог | ☑ | Каталог из 10 объектов с SVG-превью, поиском и выбором вариантов. |
| 3 Вставка | ☑ | Выбранный исходный SVG безопасно передаётся из UI, преобразуется в Figma vector frame и центрируется в viewport. |
| 4 Редактор | ☑ | Сцена с редактируемым списком объектов, хранением и синхронизацией с контролируемой группой Figma. |
| 5 Шаблоны | ☑ | Три детерминированных композиционных пресета на холсте 1200×630, с переключением L/S и main/background. |
| 6 Метафора | ☑ | Офлайн RU/EN picker выбирает существующие asset IDs, роли и допустимый template ID; есть fallback. |
| 7 Экспорт/приемка | ☑ | Экспорт управляемого frame в SVG, download из UI, три demo-scenes, README и итоговые проверки. |

## Принятые решения
- Исходные SVG неизменны.
- Точная семантическая палитра и часть правил L/S не подтверждены.
- AI backend не входит в MVP; используется offline keyword mapping.

## Последняя итерация
- Реализовано: аудит `assets.json`, `templates.json`, `scene.schema.json`; созданы допущения и минимальный контракт сообщений.
- Изменённые файлы: `docs/ASSUMPTIONS.md`, `docs/MESSAGES.md`, `docs/PROGRESS.md`.
- Проверки: PowerShell сверил 48 путей из обоих манифестов — 0 отсутствующих. `python3 scripts/validate_assets.py` не запущен: `python3` и `py` недоступны.
- Блокеры: для проверки hash/XML/raster нужен Python; неподтверждённые сопоставления и правила перечислены в `docs/ASSUMPTIONS.md`.
- Следующий шаг: STAGE_01.md (только по новому запросу).

## Итерация Stage 1
- Реализовано: `manifest.json`, `package.json`, `scripts/build.mjs`, `src/code.ts`, `src/ui.html`, `README_DEV.md` и `.gitignore`. Main code открывает UI; UI показывает заголовок, пустую сцену и статус связи; ping получает pong с тем же `requestId`.
- Изменённые файлы: `.gitignore`, `manifest.json`, `package.json`, `package-lock.json`, `scripts/build.mjs`, `src/code.ts`, `src/ui.html`, `README_DEV.md`, `docs/PROGRESS.md`.
- Проверки: `npm.cmd run build` — успешно; статическая проверка entrypoints из `manifest.json` и наличия ping/pong handler — успешно. `npm install` сообщил об одной низкоприоритетной уязвимости; исправление не запускалось.
- Блокеры: запуск Development plugin в Figma не выполнен, поэтому реальное открытие UI в Figma не проверено.
- Следующий шаг: `STAGE_02.md` (только по новому запросу).

## Итерация Stage 2
- Реализовано: каталог читает 10 ID из `spec/assets.json`; UI показывает оригинальные SVG-превью, фильтрует по имени, ID и тегам, позволяет выбрать объект и каждый из вариантов `large/small` и `main/background`. При сборке исходные SVG без изменений копируются в `dist/assets`, а манифест встраивается в UI.
- Изменённые файлы: `src/ui.html`, `src/code.ts`, `scripts/build.mjs`, `scripts/check_catalog.mjs`, `package.json`, `docs/PROGRESS.md`.
- Проверки: `npm.cmd run check:catalog` — успешно (10 объектов, 40 файлов вариантов, поиск); `npm.cmd run build` — успешно; проверка результата сборки — 42 SVG-файла скопированы, манифест встроен; `git diff --check` — успешно.
- Блокеры: Development plugin в Figma не запускался, поэтому интерактивная проверка UI в Figma не выполнялась.
- Следующий шаг: `STAGE_03.md` (только по новому запросу).

## Итерация Stage 3
- Реализовано: UI читает выбранный исходный SVG и отправляет `insertAsset` с `requestId`; main code проверяет ID/вариант каталога и отсутствие raster/image embedding, создаёт parent vector frame через `figma.createNodeFromSvg()`, добавляет его на страницу и центрирует относительно viewport. UI показывает состояние вставки и ошибки.
- Изменённые файлы: `src/code.ts`, `src/ui.html`, `docs/MESSAGES.md`, `scripts/check_insert.mjs`, `package.json`, `docs/PROGRESS.md`.
- Проверки: `npm.cmd run check:insert` — успешно (40 SVG без raster/image embedding); `npm.cmd run build` — успешно; `npm.cmd run check:catalog` — успешно; `git diff --check` — успешно.
- Блокеры: Development plugin в Figma не запускался, поэтому фактическая вставка и отображение на canvas в Figma не проверялись.
- Следующий шаг: `STAGE_04.md` (только по новому запросу).

## Итерация Stage 4
- Реализовано: типизированные `Scene`/`SceneItem`, reducer для add/duplicate/delete/move/rotate/reorder/select и сериализация; UI-редактор списка и координат без scale; владелец состояния — main code, который сохраняет сцену в `figma.clientStorage` и восстанавливает её при `initialize`.
- Синхронизация: `applyScene` валидирует Scene и каталог, пересоздаёт только помеченную plugin data группу `Illustration Builder scene`, не затрагивая посторонние узлы Figma. SVG передаются UI для item ID и проверяются как векторные.
- Изменённые файлы: `src/scene.ts`, `src/code.ts`, `src/ui.html`, `scripts/check_scene.mjs`, `package.json`, `docs/PROGRESS.md`.
- Проверки: `npm.cmd run check:scene` — успешно (reducer и roundtrip); `npm.cmd run build` — успешно; `git diff --check` — успешно.
- Блокеры: Development plugin в Figma не запускался, поэтому интерактивная проверка canvas/clientStorage в Figma не выполнена.
- Следующий шаг: `STAGE_05.md` (только по новому запросу).

## Итерация Stage 5
- Реализовано: `compact`, `offset` и `headline` как детерминированные пресеты
  для L/S; сцена создаётся в каноническом frame 1200×630. UI переключает
  формат, шаблон и роль, выбирая только существующие варианты
  `large/small` + `main/background`; координаты ограничены safe area. Main code
  до мутации проверяет соответствие template/формата и safe area.
- Изменённые файлы: `src/templates.ts`, `src/scene.ts`, `src/code.ts`,
  `src/ui.html`, `scripts/build.mjs`, `scripts/check_templates.mjs`,
  `package.json`, `docs/ASSUMPTIONS.md`, `docs/MESSAGES.md`,
  `docs/PROGRESS.md`.
- Проверки: статическая Node-проверка `spec/templates.json` — успешно (3 вида
  шаблонов × L/S); `git diff --check` — успешно. `npm.cmd run check:templates`,
  `npm.cmd run check:scene` и `npm.cmd run build` не запущены успешно:
  esbuild получает `Cannot read directory "../../../..": Access is denied` и
  не разрешает существующие entrypoints в sandbox. Figma Development plugin не
  запускался, поэтому интерактивная проверка в Figma не выполнена.
- Блокеры: точные native dimensions L/S, slot bounds и safe area не
  подтверждены; применены явно документированные MVP-допущения. Ограничение
  sandbox/esbuild требует среды с доступом к файловому дереву для сборки.
- Следующий шаг: `STAGE_06.md` (только по новому запросу).

## Итерация Stage 6
- Реализовано: детерминированный офлайн-словарь RU/EN в `src/metaphor.ts` для обучения,
  фокуса, решения задач и совместной работы. Picker возвращает 1–4 существующих asset ID,
  роли и template ID выбранного формата; неизвестный текст создаёт понятную нейтральную
  композицию. В UI добавлены поле «Метафора или заголовок», «Собрать» и объяснение выбора.
- Изменённые файлы: `src/metaphor.ts`, `src/ui.html`, `scripts/build.mjs`,
  `scripts/check_metaphor.mjs`, `package.json`, `docs/PROGRESS.md`.
- Проверки: `npm.cmd run check:metaphor` — успешно (RU/EN сценарии и fallback);
  `npm.cmd run build` — успешно; `git diff --check` — успешно.
- Блокеры: Development plugin в Figma не запускался, поэтому интерактивная проверка UI
  в Figma не выполнена. Словарь — намеренно ограниченный offline MVP, без API и сети.
- Следующий шаг: `STAGE_07.md` (только по новому запросу).

## Итерация Stage 7
- Реализовано: `exportScene` экспортирует только управляемый frame через
  `exportAsync({ format: "SVG" })`, проверяет отсутствие `<image>`/`data:image`
  и наличие векторного SVG, затем передаёт байты UI для скачивания. В UI добавлены
  три фиксированные demo-scenes: только main, main + background и другой
  формат/шаблон. Создан итоговый `README.md` с установкой, сценариями,
  архитектурой, ограничениями и реально использованным AI-инструментом.
- Изменённые файлы: `src/code.ts`, `src/ui.html`, `scripts/check_export.mjs`,
  `scripts/check_insert.mjs`, `package.json`, `docs/MESSAGES.md`, `README.md`,
  `docs/PROGRESS.md`.
- Проверено кодом/тестами: `npm.cmd run check:catalog`, `check:insert`,
  `check:scene`, `check:templates`, `check:metaphor`, `check:export` и
  `npm.cmd run build` — успешно. `python3 scripts/validate_assets.py` не
  запущен: команда `python3` отсутствует в окружении.
- Проверено в Figma: не выполнено. Development plugin не запускался, поэтому
  интерактивная редактируемость, скачивание и фактический SVG-экспорт в Figma
  не подтверждены.
- Блокеры: для полной валидации исходных SVG нужен Python 3; для ручной
  проверки нужен запуск Development plugin в Figma.
- Следующий шаг: этапов не осталось; остановлено по завершении `STAGE_07.md`.
