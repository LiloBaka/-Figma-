# PROGRESS — единственная короткая память между сессиями Codex

Текущий этап: 1 (завершён)

| Этап | Статус | Результат |
|---|---|---|
| 0 Аудит | ☑ | Манифесты и контракты задокументированы; 48 путей существуют. |
| 1 Каркас | ☑ | Созданы Figma manifest, TypeScript main/UI entrypoints и сборка; ping/pong реализован в коде. |
| 2 Каталог | ☐ | |
| 3 Вставка | ☐ | |
| 4 Редактор | ☐ | |
| 5 Шаблоны | ☐ | |
| 6 Метафора | ☐ | |
| 7 Экспорт/приемка | ☐ | |

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
