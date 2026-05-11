# fb-auto-launch

React + TypeScript компоненти для створення та управління рекламними кампаніями Facebook.

## Встановлення

```bash
npm install fb-auto-launch
```

## Використання

```tsx
import { DynamicForm, TemplateGroup, LaunchGroup } from 'fb-auto-launch';
import 'fb-auto-launch/style.css';
```

## Компоненти

### Level 1 — `DynamicForm`

Динамічна форма, що генерується з масиву `FormField[]` з бекенду. Підтримує типи полів: `VARCHAR`, `TEXT`, `INTEGER`, `BIGINT`, `FLOAT`, `DOUBLE PRECISION`, `BOOLEAN`, `DATETIME`, `ARRAY`.

```tsx
import { DynamicForm } from 'fb-auto-launch';
import type { FormField, TemplateSave } from 'fb-auto-launch';

const fields: FormField[] = await fetchFieldsFromApi();

<DynamicForm
  fields={fields}
  onSave={async (data: TemplateSave) => {
    await api.post('/templates', data);
  }}
  title="Campaign Template"
/>
```

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `fields` | `FormField[]` | Yes | Масив полів з бекенду |
| `onSave` | `(data: TemplateSave) => Promise<void>` | Yes | Callback при збереженні |
| `title` | `string` | No | Заголовок форми |
| `parentValues` | `Record<string, unknown>` | No | Значення батьківських полів для `depend_on` |

### Level 2 — `TemplateGroup`

Створення груп шаблонів: 1 Campaign → N Ad Sets → M Ads.

```tsx
import { TemplateGroup } from 'fb-auto-launch';
import type { TemplateGroupSave } from 'fb-auto-launch';

<TemplateGroup
  fetchTemplates={async () => {
    const res = await api.get('/templates');
    return res.data; // { campaign_templates, adset_templates, ad_templates }
  }}
  onSave={async (data: TemplateGroupSave) => {
    await api.post('/template-groups', data);
  }}
/>
```

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `fetchTemplates` | `() => Promise<TemplateData>` | Yes | Завантаження списку шаблонів |
| `onSave` | `(data: TemplateGroupSave) => Promise<void>` | Yes | Callback при збереженні |

### Level 3 — `LaunchGroup`

Launch групи з `depend_on` логікою, multi-select та bulk edit.

```tsx
import { LaunchGroup } from 'fb-auto-launch';
import type { LaunchGroupSave } from 'fb-auto-launch';

<LaunchGroup
  fetchTemplateGroups={async () => api.get('/template-groups')}
  fetchCampaignFields={async () => api.get('/launch-fields/campaign')}
  fetchAdsetFields={async () => api.get('/launch-fields/adset')}
  fetchAdFields={async () => api.get('/launch-fields/ad')}
  onSave={async (data: LaunchGroupSave[]) => {
    await api.post('/launch-groups', data);
  }}
/>
```

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `fetchTemplateGroups` | `() => Promise<TemplateGroupSave[]>` | Yes | Завантаження template groups |
| `fetchCampaignFields` | `() => Promise<FormField[]>` | Yes | Поля для campaign рівня |
| `fetchAdsetFields` | `() => Promise<FormField[]>` | Yes | Поля для adset рівня |
| `fetchAdFields` | `() => Promise<FormField[]>` | Yes | Поля для ad рівня |
| `onSave` | `(data: LaunchGroupSave[]) => Promise<void>` | Yes | Callback при збереженні |

## Типи

Всі типи експортуються з пакету:

```tsx
import type {
  FormField,
  FieldOptionType,
  PostgresValueType,
  TemplateSave,
  FormValue,
  TemplateInfo,
  TemplateData,
  TemplateGroupSave,
  LaunchGroupSave,
  NodePath,
} from 'fb-auto-launch';
```

## Розробка

```bash
npm install
npm run dev       # Запуск demo
npm run build     # Збірка пакету
```

## Структура

```
src/                        # Бібліотека (потрапляє в npm)
├── index.ts                # Entry point
├── types/                  # TypeScript типи
└── components/
    ├── DynamicForm/        # Level 1
    ├── TemplateGroup/      # Level 2
    └── LaunchGroup/        # Level 3

demo/                       # Demo app (dev only)
├── main.tsx
├── App.tsx
└── data/mockData.ts

dist/                       # Build output
├── index.mjs               # ESM
├── index.cjs               # CommonJS
├── index.d.ts              # TypeScript declarations
└── style.css               # Стилі
```
