<div dir="">

# المعمارية أحادية التدفق القائمة على المجالات (Feature/Domain-Based Layered Architecture)

هذا المستند يشرح المعمارية البرمجية المستخدمة في الواجهة الأمامية لمشروع MGF. الهدف من المستند هو توضيح **لماذا** بنينا النظام بهذه الطريقة، و**ما هي الطبقات**، و**كيف تتدفق البيانات** بينها، مع أمثلة من الكود الفعلي.

## نظرة سريعة

ما نستخدمه هو **معمارية طبقات قائمة على المجالات**:

```txt
المسار (Route)          →  الصفحة (Page)           →  المكونات (Components)
                                                              ↓
                                        الـ Hooks (TanStack Query)
                                                              ↓
                                        دوال API الخاصة بالميزة
                                                              ↓
                                       عميل Axios المشترك (Client)
                                                              ↓
                                                    Backend API
```

كل تدفق بيانات يبدأ من الأعلى (واجهة المستخدم) وينزل للأسفل نحو الخادم، ولا يسمح بالقفز إلى الطبقة الأعمق مباشرة.

## الفكرة الجوهرية: الملكية (Ownership)

القاعدة الذهبية للمعمارية:

> **كل ملف يعيش داخل مجلد الميزة التي يخدمها.**

مثال، كل ما يخص القوالب:

```txt
src/features/templates/
  api/        # دوال استدعاء الـ backend
  hooks/      # تغليف TanStack Query
  types/      # أنواع الطلبات والاستجابات الخاصة بالقوالب
  components/ # واجهات عرض القوالب
```

## الطبقات بالتفصيل

### 1) الطبقة العليا: صفحات المسارات (`src/pages`)

- صفحة واحدة لكل مسار تقريباً.
- مسؤولة فقط عن: قراءة معاملات المسار، وتركيب المكونات، وتمرير IDs بسيطة.

```tsx
// src/pages/dashboard/DashboardPage.tsx
export function DashboardPage() {
  return <DashboardStats />; // تركيب فقط، لا استدعاء API مباشر
}
```

**ممنوع**: استدعاء Axios أو `fetch` مباشرة، أو إدارة منطق أعمال كبير.

### 2) طبقة العرض: المكونات (`src/components` + `features/*/components`)

- `src/components/` للمكونات المشتركة بين كل التطبيق: layout (Navbar، RootLayout، EditorLayout) ومكونات UI مثل button و card و empty-state.
- `src/features/<feature>/components/` لتركيب الواجهة الخاص بمجال معين.

المكونات تنادي الـ hooks فقط، ولا تعرف شيئاً عن HTTP أو Axios.

### 3) طبقة منطق الطلب: الـ Hooks (`features/*/hooks`)

الـ hook يغلف دالة API داخل TanStack Query ويمنح المكون:

- `data` مع الـ caching والتحديث التلقائي.
- `isLoading` و `isError` و `error`.
- دوال الـ mutation مثل `mutate`.

```ts
// src/features/templates/hooks/useTemplates.ts
export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: listTemplates,
  });
}
```

ملاحظة: حتى العميل يعيد استخدام هذه الطبقات عبر `@tanstack/react-query`.

### 4) طبقة الوصول للبيانات: دوال API (`features/*/api`)

- دالة واحدة لكل عملية، اسمها يبدأ بفعل: `listTemplates`، `getProject`، `createResource`، `deleteComment`.
- تستدعي عميل Axios المشترك فقط.

```ts
// src/features/templates/api/listTemplates.ts
export async function listTemplates(): Promise<Template[]> {
  const { data } = await api.get<Template[]>('/templates');
  return data;
}
```

### 5) الطبقة الأساسية: عميل HTTP المشترك (`src/lib/api/client.ts`)

- نقطة الاتصال الوحيدة مع الـ backend.
- يضيف `Bearer token`، ويحوّل أخطاء Axios إلى `ApiError`.

```txt
src/lib/api/client.ts
```

لا تُستخدم `fetch` الخام ولا Axios مستقل في أي ميزة. كل الطلبات تمر من هنا.

## اتجاه التبعيات (أهم قاعدة)

التبعيات تتجه **للأسفل فقط** ولا تعكس اتجاهها أبداً:

```txt
pages          → components, hooks
components     → hooks
hooks          → feature api functions
feature api    → shared client (src/lib/api/client.ts)
```

- الصفحة لا تستدعي دالة API مباشرة.
- المكوّن لا يستدعي دالة API مباشرة.
- لا أحد غير عميل API يستدعي Axios/fetch.

بهذا يسهل اختبار كل طبقة واستبدالها (مثل استبدال الـ backend أو التنقل بين query libraries) دون كسر باقي التطبيق.

## القرارات بالتفصيل: أين يقع ماذا؟

| السؤال                               | الجواب في هذه المعمارية                                   |
| ------------------------------------ | --------------------------------------------------------- |
| استدعاء الشبكة؟                      | فقط في `features/*/api/` عن طريق `src/lib/api/client.ts`  |
| تحويل البيانات/التخزين المؤقت؟       | في `features/*/hooks/` عبر TanStack Query                 |
| تكوين الشاشة؟                        | في `features/*/components/`                               |
| سبيكة الصفحة؟                        | في `src/pages/`                                           |
| أنواع مشتركة لكل المجالات؟           | في `src/types/api.ts`                                     |
| أنواع خاصة بمجال (request/response)؟ | في `features/*/types/`، نوع واحد في ملف واحد              |
| إعدادات التطبيق والبيئة؟             | `src/config/env.ts`                                       |
| تهيئة التطبيق الـ providers؟         | `src/app/providers/AppProviders.tsx`                      |
| تكوين المسارات والحارس عليها؟        | `src/routes/router.tsx` + `ProtectedRoute` / `AdminRoute` |

## التوجيه (Routing) كطبقة مستقلة

الراوتر يستخدم **layout routes** مع `<Outlet />`:

```tsx
{
  element: <RootLayout />,        // التخطيط
  children: [
    { path: '/', element: <HomeRedirect /> },
    { path: '/templates', element: <TemplatesPage /> },
  ],
}
```

كل Layout يعرض `<Outlet />` داخل `ErrorBoundary` + `Suspense`، فيكون التعامل مع الخطأ والتحميل مركزيّاً على مستوى التخطيط لا في كل صفحة.

الحماية:

- `/login` و `/register`: عامة.
- `/dashboard` و `/settings` و `/resources/*`: `ProtectedRoute`.
- `/editor/projects/:projectId`: `ProtectedRoute` + `EditorLayout`.
- `/admin/*`: `AdminRoute` (يتطلب `role === 'admin'`).

## مثال متكامل: تدفق "قائمة القوالب"

```txt
1. المستخدم يفتح /templates
2. RouterLayout يرسم RootLayout
3. TemplatesPage يرسم <TemplatesList />
4. TemplatesList يستدعي useTemplates()
5. useTemplates() يستدعي listTemplates()
6. listTemplates() يطلب GET /templates عبر client.ts
7. الـ data ترجع وتُخزّن في كاش TanStack Query
8. TemplatesList يعرض البطاقات
```

## أين تقع "الميزة Editor"؟

المحرر حالة خاصة: مجلده `features/editor` للنوتي فقط (orchestration + UI). بياناته تُجلب من ميزات أخرى:

- بيانات المشروع: `features/projects`
- ملفات المشروع: `features/files`
- التوليد: `features/generation`
- التصدير: `features/export`

فهذا يحافظ على مبدأ الملكية: كل نوع من البيانات يبقى معرفاً بمصدر واحد.

## فوائد هذه المعمارية

- **قابلية الاكتشاف**: كل كود القوالب في مكان واحد.
- **سهولة الحذف**: حذف ميزة = حذف مجلد.
- **تناسق القواعد**: إجبارية طبقة API الواحدة تمنع تسرّب منطق الشبكة.
- **اختبار أسهل**: يمكن mock دوال API أو hooks دون لمس المكونات.
- **قابلية الاستبدال**: استبدال عميل HTTP أو مكتبة query لا يؤثر على الصفحات.
- **قابلية التوسع**: إضافة مجال جديد = إضافة مجلد جديد بنفس الهيكل.

## مراجع

- `docs/FRONTEND_STRUCTURE_GUIDE.ar.md` — البنية الحالية بالتفصيل.
- `docs/PRD.ar.md` — أهداف المنتج ونطاق MVP.
- `docs/openapi_api_contract.yaml` — عقد الـ backend.

</div>
