# AI Playbook Summary

`ai-playbook-summary.md` (conceptual reference) и `ai-playbook-summary.json`
(machine-readable hard rules) — компактный свод правил разработки
виджетов для использования в контексте ИИ-ассистентов (Kilo Code,
Claude Code, любой другой инструмент с ограниченным контекстным окном).

Пересекается с `widget.mdc` и `WIDGET_REFACTORING_SPEC.md`
почти полностью — большинство правил дублируют друг друга в разных
формулировках. Не дублирует, а дополняет:

- регистрацию переменных датасета и синхронизацию фильтров между
  виджетами (`registerDescriptorVariable` → `$storeCommit` →
  `$storeWatchHandler`, `updateDescriptorVars()`);
- `$storeMeta.setVar()` вместо прямого доступа к `props.varAliases`.

Оба паттерна реально используются в проекте (`ElemWowMap`, `ElemFilter`,
`ElemDremioTable`), но раньше не были задокументированы в `widget.mdc`.

Правило про импорт только с корня пакета (`Module Federation`) в этом
файле присутствует, но в репозитории явно не закреплено (нет
`no-restricted-imports` в eslint, конфигурация сборки — во внешнем
пакете `@goodt/webpack`) — перед тем, как считать его обязательным,
стоит уточнить у источника.

`session_policy` в JSON ссылается на `docs/ai-playbook/0N-*.md` как на
источники более глубоких деталей — таких файлов в репозитории пока нет.
