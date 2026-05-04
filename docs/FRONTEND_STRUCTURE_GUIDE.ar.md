<div dir="rtl">

# دليل بنية الواجهة الأمامية في MGF

هذا المستند يصف البنية الحالية للواجهة الأمامية بعد تفريغ واجهات العرض، بحيث يكون المشروع جاهزا للبدء بالتطوير الفعلي.

التقنيات المستخدمة:

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- TanStack Query
- Axios
- shadcn MCP مع registry باسم `@shadcn` لمكونات UI الأساسية
- Laravel API اعتمادا على `docs/openapi_api_contract.yaml`

المشروع مجهز كبنية بداية فارغة: المسارات، والـ providers، والإعدادات، وعميل API، وملفات API الخاصة بالميزات، والـ hooks، والأنواع موجودة. أما الصفحات ومكونات UI المؤقتة فقد تم حذفها.

## المكتبات المثبتة

الإصدارات مأخوذة من `package.json`.

اعتماديات التشغيل:

| المكتبة | الإصدار | الاستخدام |
| --- | --- | --- |
| `react` | `^19.2.5` | تشغيل واجهات React |
| `react-dom` | `^19.2.5` | ربط React مع DOM |
| `react-router-dom` | `^7.14.2` | التوجيه داخل التطبيق |
| `@tanstack/react-query` | `^5.100.9` | إدارة server state وتخزين نتائج API |
| `axios` | `^1.16.0` | عميل HTTP المستخدم في `src/lib/api/client.ts` |
| `tailwindcss` | `^4.2.4` | إطار CSS utility |
| `@tailwindcss/vite` | `^4.2.4` | دمج Tailwind مع Vite |

اعتماديات التطوير والأدوات:

| المكتبة | الإصدار | الاستخدام |
| --- | --- | --- |
| `vite` | `^8.0.10` | خادم التطوير والبناء |
| `typescript` | `~6.0.2` | مترجم TypeScript |
| `@vitejs/plugin-react` | `^6.0.1` | إضافة React لـ Vite |
| `eslint` | `^10.2.1` | فحص جودة الكود |
| `@eslint/js` | `^10.0.1` | قواعد JavaScript لـ ESLint |
| `typescript-eslint` | `^8.58.2` | دمج TypeScript مع ESLint |
| `eslint-plugin-react-hooks` | `^7.1.1` | قواعد React Hooks |
| `eslint-plugin-react-refresh` | `^0.5.2` | قواعد React Refresh |
| `globals` | `^17.5.0` | تعريفات globals لـ ESLint |
| `shadcn` | `^4.6.0` | أدوات shadcn لمكونات UI |
| `@types/node` | `^24.12.2` | تعريفات Node.js |
| `@types/react` | `^19.2.14` | تعريفات React |
| `@types/react-dom` | `^19.2.3` | تعريفات React DOM |

## البنية العامة الحالية

```txt
src/
  app/
  assets/
  components/
  config/
  features/
  hooks/
  lib/
  pages/
  routes/
  styles/
  types/
  App.tsx
  index.css
  main.tsx
```

ملاحظات:

- `pages/` فارغ حاليا. أضف صفحات المسارات هنا عند تنفيذ الشاشات الحقيقية.
- `components/` فارغ حاليا. أضف مكونات UI والتخطيط المشتركة هنا عند الحاجة، ويفضل عبر shadcn.
- تم حذف مكونات placeholder من `features/*/components`.
- `routes/router.tsx` يحتوي المسارات المطلوبة، لكن كل مسار يعرض fragment فارغ.
- shadcn MCP يوضح أن registry باسم `@shadcn` متاح، لكن لا توجد مكونات UI مولدة حاليا.

## الملفات الحالية المنفذة

```txt
src/
  app/
    providers/
      AppProviders.tsx

  config/
    env.ts

  features/
    admin/
      api/
      hooks/

    auth/
      api/
      hooks/
      types/

    export/
      api/
      hooks/
      types/

    files/
      api/
      hooks/
      types/

    generation/
      api/
      hooks/
      types/

    me/
      api/
      hooks/
      types/

    projects/
      api/
      hooks/
      types/

    resources/
      api/
      hooks/
      types/

    social/
      api/
      hooks/
      types/

    templates/
      api/
      hooks/
      types/

    types/
      api/
      hooks/

    users/
      api/
      hooks/

  lib/
    api/
      client.ts

  routes/
    router.tsx

  styles/
    theme.css

  types/
    api.ts
```

## حالة المسارات الحالية

المسارات معرفة في `src/routes/router.tsx`.

```txt
/                         fragment فارغ
/login                    fragment فارغ
/register                 fragment فارغ
/templates                fragment فارغ
/templates/:templateId    fragment فارغ
/dashboard                fragment فارغ
/editor/projects/:projectId
/settings                 fragment فارغ
/resources                fragment فارغ
/resources/new            fragment فارغ
/resources/:resourceId    fragment فارغ
/users/:userId            fragment فارغ
/admin/*                  fragment فارغ
/*                        fragment فارغ
```

العنصر الحالي لكل مسار هو:

```tsx
<></>
```

هذا يحافظ على جاهزية المسارات بدون عرض أي واجهة مؤقتة.

## ربط النطاقات

| وسم API | مجلد الميزة | المسؤولية |
| --- | --- | --- |
| Auth | `features/auth` | التسجيل، تسجيل الدخول، تسجيل الخروج، وتحديث token |
| Me | `features/me` | بيانات المستخدم الحالي وإعدادات مزودي الذكاء الاصطناعي |
| Types | `features/types` | قائمة أنواع المخرجات |
| Templates | `features/templates` | API و hooks الخاصة بالقوالب |
| Projects | `features/projects` | API و hooks الخاصة بالمشاريع |
| Files | `features/files` | API و hooks الخاصة بملفات المشاريع والقوالب |
| Generation | `features/generation` | API و hooks الخاصة بالتوليد |
| Export | `features/export` | API و hooks الخاصة بالتصدير |
| Resources | `features/resources` | API و hooks الخاصة بالموارد |
| Social | `features/social` | API و hooks الخاصة بالتصويت والحفظ والتعليقات |
| Users | `features/users` | API و hooks الخاصة بملف المستخدم العام |
| Admin | `features/admin` | API و hooks الخاصة بالإدارة |
| Editor | `features/editor` | محجوز لاحقا لتنسيق المحرر وواجهته |

## قواعد طبقة API

يوجد عميل Axios واحد مشترك:

```txt
src/lib/api/client.ts
```

مسؤولياته:

- قراءة base URL من `VITE_API_BASE_URL`.
- استخدام `http://localhost:8000/api/v1` كقيمة افتراضية.
- إضافة `Authorization: Bearer <token>` عند وجود token.
- إرجاع بيانات typed.
- تحويل أخطاء Axios إلى `ApiError`.

لا يجب على الصفحات أو المكونات استدعاء Axios أو `fetch` مباشرة. عند إضافة الواجهة، يجب أن تستخدم مكونات الميزات الـ hooks الخاصة بها، والـ hooks تستدعي دوال API الخاصة بالميزة.

كل عملية API لها ملف مستقل:

```txt
features/templates/api/listTemplates.ts
features/templates/api/getTemplate.ts
features/templates/api/createTemplate.ts
features/templates/api/updateTemplate.ts
features/templates/api/deleteTemplate.ts
features/templates/api/forkTemplate.ts
```

## قواعد Hooks

كل hook له ملف مستقل داخل الميزة المالكة له، ويغلف دالة API باستخدام TanStack Query.

```txt
features/templates/hooks/useTemplates.ts
features/templates/hooks/useTemplate.ts
features/templates/hooks/useCreateTemplate.ts
features/templates/hooks/useUpdateTemplate.ts
features/templates/hooks/useForkTemplate.ts
```

## قواعد الأنواع

الأنواع المشتركة تعيش في:

```txt
src/types/api.ts
```

أما أنواع الطلبات والاستجابات والبارامترات الخاصة بميزة معينة فتعيش داخل الميزة:

```txt
features/auth/types/loginRequest.ts
features/templates/types/templateListParams.ts
features/resources/types/createResourceRequest.ts
```

القاعدة الحالية: نوع واحد أو شكل طلب واحد في كل ملف. تجنب الملفات الكبيرة مثل `template.types.ts` إلا إذا أصبح هناك توليد تلقائي من OpenAPI لاحقا.

## قواعد الصفحات والمكونات

المشروع حاليا فارغ من واجهات العرض. عند إضافة الشاشات:

- ضع ملفات صفحات المسارات داخل `src/pages`.
- أبق الصفحات خفيفة.
- ضع مكونات UI والتخطيط المشتركة داخل `src/components`.
- ضع مكونات shadcn الأساسية داخل `src/components/ui`.
- ضع مكونات كل ميزة داخل `src/features/<feature>/components`.
- لا تضع استدعاءات API مباشرة داخل الصفحات.
- لا تضف منطق أعمال وهمي داخل الصفحات.

## قواعد shadcn

استخدم shadcn كمصدر افتراضي لمكونات UI المشتركة عند بدء تطوير الواجهات.

القواعد:

- استخدم shadcn MCP لفحص الأمثلة وتفاصيل المكونات قبل إضافة أي مكون.
- أضف فقط المكونات المطلوبة للميزة التي تعمل عليها.
- ضع مكونات shadcn المولدة داخل `src/components/ui`.
- ضع مكونات التخطيط العامة و app shells داخل `src/components/layout` عند الحاجة.
- ضع تركيب الواجهة الخاص بكل نطاق داخل `src/features/<feature>/components`.
- لا تعيد بناء مكونات شائعة يدويا مثل buttons و inputs و dialogs و tabs و dropdowns و tables و tooltips و badges و cards و skeletons و forms إذا كان shadcn يوفر مكونا مناسبا.
- لا تضف UI مؤقت فقط لملء المسارات. المسارات تعرض fragment فارغ حاليا بشكل مقصود.

مكونات مقترحة كبداية عند تنفيذ الشاشات:

```txt
button
input
label
textarea
select
dialog
dropdown-menu
tabs
badge
card
table
tooltip
skeleton
form
```

## قواعد المحرر

`features/editor` محجوز لتنسيق المحرر وواجهته. لا يجب أن يحتوي استدعاءات API الخاصة بالمشاريع أو الملفات أو التوليد أو التصدير.

مصادر بيانات المحرر يجب أن تبقى منفصلة:

- بيانات المشروع من `features/projects`.
- ملفات المشروع من `features/files`.
- التوليد من `features/generation`.
- التصدير من `features/export`.

## قواعد التسمية

- ملفات مكونات React: `PascalCase.tsx`
- ملفات الصفحات: `PascalCase.tsx`
- ملفات hooks: `useThing.ts`
- ملفات API: `verbNoun.ts`
- ملفات الأنواع: `camelCaseTypeName.ts`
- أسماء المكونات: `PascalCase`
- أسماء hooks: `useCamelCase`
- أسماء دوال API تبدأ بفعل مثل `listTemplates` و `createProject` و `updateProjectFile`
- استخدم alias `@/*` للاستيراد بين الميزات أو من الملفات المشتركة.

## Alias

`@/*` يشير إلى `src/*`.

## TODO

- إضافة صفحات حقيقية داخل `src/pages`.
- إضافة مكونات shadcn المطلوبة داخل `src/components/ui`.
- إضافة مكونات التخطيط المشتركة داخل `src/components/layout`.
- إضافة مكونات خاصة بكل ميزة عند بدء تنفيذها.
- إضافة route guards للمستخدمين، والضيوف، والإدارة عند تثبيت سلوك auth.
- مطابقة endpoints الخاصة بالإدارة مع العقد النهائي للـ backend إذا تغيرت.
- توسيع `features/editor` بإدارة الحالة، autosave، preview rendering، واختيار الملفات عند بدء تطوير المحرر.

</div>
