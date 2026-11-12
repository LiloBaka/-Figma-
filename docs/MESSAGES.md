# Контракт сообщений UI ↔ плагин

Это минимальный контракт для будущей реализации; на этапе 0 код не создаётся.

| Направление | Тип | Полезная нагрузка |
|---|---|---|
| UI → plugin | `initialize` | `requestId` |
| UI → plugin | `getCatalog` | `requestId` |
| UI → plugin | `applyScene` | `requestId`, `scene` по `spec/scene.schema.json` |
| UI → plugin | `insertAsset` | `requestId`, `assetId`, `variant`, исходная строка `svg` выбранного ресурса |
| plugin → UI | `catalog` | `requestId`, `assets`, `templates`, доступные palette IDs |
| plugin → UI | `sceneApplied` | `requestId`, нормализованная `scene` |
| plugin → UI | `assetInserted` | `requestId`, `assetId`, `variant` после создания векторного узла |
| plugin → UI | `error` | `requestId`, стабильный `code`, понятный `message` |

Правила: каждое асинхронное сообщение содержит `requestId`; UI не считает сцену
применённой до `sceneApplied`; плагин проверяет требуемые поля, `assetId`, роль,
формат, допустимость template ID и рабочие safe-area bounds до мутации
документа. Ошибки валидации не изменяют документ. Bounds — документированное
MVP-допущение, а не извлечённые slot geometry reference-шаблонов.
