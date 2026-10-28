# waterfall-calendar-frontend

Фронтенд учебного веб-календаря «Календарик» для маленькой компании. Методология Waterfall.

- SRS: [tec-doc-waterfall](https://github.com/1378-TRPO/tec-doc-waterfall) (docs/01-srs.md)
- Бэкенд: [waterfall-calendar-backend](https://github.com/1378-TRPO/waterfall-calendar-backend)

## Стек

React 19, TypeScript, Vite 8, React Router 7, TanStack Query 5, Axios, Tabler Icons.

## Запуск

Нужен Node 22+ и работающий бэкенд на `localhost:5067` (см. README бэкенда).

```
npm install
npm run dev
```

Приложение открывается на `http://localhost:5173`, запросы к `/api` проксируются на бэкенд.

## Скрипты

| Команда             | Что делает              |
| ------------------- | ----------------------- |
| `npm run dev`       | дев-сервер Vite         |
| `npm run build`     | проверка типов и сборка |
| `npm run lint`      | ESLint                  |
| `npm run typecheck` | только проверка типов   |
| `npm run format`    | Prettier по всем файлам |

## Известные ограничения

- Мобильная верстка, часовые пояса и drag-and-drop вне scope MVP (см. SRS, раздел 5).
