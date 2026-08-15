# Git Workflow Guide for Beginners

## English

This guide explains a common professional Git workflow used by many technology companies and open-source projects. It is not only a naming style. It is a shared language between developers, tools, CI systems, release automation, and future maintainers.

The workflow has two connected parts:

1. Conventional Commit messages
2. Git branch naming strategy

Together, they make project history easier to read, review, automate, and maintain.

## 1. Conventional Commits

Conventional Commits define a clear format for `git commit` messages.

Instead of writing vague messages like:

```bash
git commit -m "changes"
git commit -m "update stuff"
```

you write messages that explain the type of change:

```bash
git commit -m "feat: add login form"
git commit -m "fix: resolve token refresh issue"
git commit -m "docs: update setup instructions"
```

### Basic Format

```txt
<type>[optional scope]: <description>
```

Examples:

```txt
feat(auth): add login form
fix(api): handle expired access token
docs: update README setup steps
```

The `scope` is optional. It describes the area of the project affected by the change, such as `auth`, `api`, `dashboard`, or `editor`.

### Common Commit Types

| Type       | Meaning                                                          | Example                                    |
| ---------- | ---------------------------------------------------------------- | ------------------------------------------ |
| `feat`     | Adds a new feature                                               | `feat: add project creation flow`          |
| `fix`      | Fixes a bug                                                      | `fix: prevent crash on empty project list` |
| `docs`     | Documentation-only change                                        | `docs: add Git workflow guide`             |
| `style`    | Formatting-only change that does not affect behavior             | `style: format sidebar component`          |
| `refactor` | Improves code structure without adding a feature or fixing a bug | `refactor: simplify project query hooks`   |
| `chore`    | Tooling, dependency, or maintenance work                         | `chore: update npm dependencies`           |
| `test`     | Adds or updates tests                                            | `test: add auth hook tests`                |

### Why It Matters

Conventional Commits help both people and tools.

For people:

- The project history becomes easier to understand.
- Pull requests are easier to review.
- Teammates can quickly see why a change was made.

For tools:

- Changelogs can be generated automatically.
- Version numbers can be updated automatically.
- Release tools can detect whether a change is a feature, bug fix, or maintenance update.

For example:

- `fix` usually means a patch release, such as `v1.0.1`.
- `feat` usually means a minor release, such as `v1.1.0`.
- A breaking change may trigger a major release, such as `v2.0.0`.

## 2. Git Branch Naming Strategy

Branch names describe the purpose of the work before anyone opens the code.

Instead of using unclear names like:

```txt
new-work
my-branch
updates
```

use names with clear prefixes:

```txt
feature/login-page
bugfix/form-validation
hotfix/payment-crash
release/v1.2.0
```

### Common Branch Prefixes

| Prefix     | Use Case                          | Example                       |
| ---------- | --------------------------------- | ----------------------------- |
| `feature/` | Building a new feature            | `feature/payment-integration` |
| `bugfix/`  | Fixing a bug in development       | `bugfix/currency-conversion`  |
| `hotfix/`  | Fixing an urgent production issue | `hotfix/login-outage`         |
| `release/` | Preparing a release               | `release/v1.2.0`              |
| `chore/`   | Maintenance or tooling work       | `chore/update-eslint-config`  |
| `docs/`    | Documentation work                | `docs/git-workflow-guide`     |

### Practical Example

Imagine you are adding payment integration to an app.

Create a feature branch:

```bash
git checkout -b feature/payment-integration
```

After adding the first version of the feature:

```bash
git commit -m "feat: add stripe payment gateway"
```

If you fix a bug while working on the same branch:

```bash
git commit -m "fix: resolve currency conversion issue"
```

The branch name explains the goal of the work. The commit messages explain the specific changes made along the way.

## Recommended Beginner Rules

Use these simple rules when starting:

- Use `feature/` for new features.
- Use `bugfix/` for normal bug fixes.
- Use `hotfix/` only for urgent production bugs.
- Start commit messages with a clear type such as `feat`, `fix`, `docs`, or `chore`.
- Keep commit descriptions short and direct.
- Write commit messages in the imperative style when possible, such as `add login form` instead of `added login form`.

Good examples:

```txt
feat: add dashboard page
fix: handle missing user avatar
docs: explain environment variables
chore: update vite config
```

Weak examples:

```txt
update
fixes
changes
final version
```

## Automation

Teams often connect this workflow with tools such as:

- `Husky` to run checks before commits.
- `commitlint` to reject invalid commit messages.
- `semantic-release` to generate changelogs and publish versions automatically.

This means the naming system is not just for organization. It can directly control testing, releases, deployment, and versioning.

---

<div dir='rtl'>

# دليل سير عمل Git للمبتدئين

## العربية

هذا الدليل يشرح أسلوبا احترافيا شائعا في استخدام Git، تتبعه كثير من الشركات التقنية والمشاريع مفتوحة المصدر. هذا النظام ليس مجرد طريقة لتسمية الملفات أو الفروع، بل هو لغة مشتركة بين المطورين، وأدوات الفحص، وأنظمة CI، وأدوات النشر، ومن سيقرأ الكود مستقبلا.

يتكون النظام من جزأين متكاملين:

1. رسائل الالتزام التقليدية Conventional Commits
2. استراتيجية تسمية فروع Git

عندما يعمل الجزآن معا، يصبح تاريخ المشروع أوضح وأسهل في المراجعة والأتمتة والصيانة.

## 1. رسائل الالتزام التقليدية

نظام Conventional Commits يحدد شكلا واضحا لرسائل `git commit`.

بدلا من كتابة رسائل غامضة مثل:

```bash
git commit -m "changes"
git commit -m "update stuff"
```

نكتب رسائل توضّح نوع التغيير:

```bash
git commit -m "feat: add login form"
git commit -m "fix: resolve token refresh issue"
git commit -m "docs: update setup instructions"
```

### الشكل الأساسي

```txt
<type>[optional scope]: <description>
```

أمثلة:

```txt
feat(auth): add login form
fix(api): handle expired access token
docs: update README setup steps
```

جزء `scope` اختياري. يستخدم لتوضيح المنطقة التي تأثرت في المشروع، مثل `auth` أو `api` أو `dashboard` أو `editor`.

### أشهر أنواع الالتزامات

| النوع      | المعنى                                        | مثال                                       |
| ---------- | --------------------------------------------- | ------------------------------------------ |
| `feat`     | إضافة ميزة جديدة                              | `feat: add project creation flow`          |
| `fix`      | إصلاح خطأ برمجي                               | `fix: prevent crash on empty project list` |
| `docs`     | تعديل في الوثائق فقط                          | `docs: add Git workflow guide`             |
| `style`    | تعديل تنسيق لا يغير سلوك الكود                | `style: format sidebar component`          |
| `refactor` | تحسين بنية الكود بدون إضافة ميزة أو إصلاح خطأ | `refactor: simplify project query hooks`   |
| `chore`    | صيانة، إعدادات، أو تحديث أدوات ومكتبات        | `chore: update npm dependencies`           |
| `test`     | إضافة أو تعديل اختبارات                       | `test: add auth hook tests`                |

### لماذا هذا مهم؟

هذا النظام يساعد البشر والأدوات الآلية في نفس الوقت.

بالنسبة للمطورين:

- يصبح تاريخ المشروع أسهل في القراءة.
- تصبح مراجعة Pull Requests أوضح.
- يستطيع أعضاء الفريق فهم سبب التغيير بسرعة.

بالنسبة للأدوات:

- يمكن إنشاء Changelog تلقائيا.
- يمكن تحديث رقم الإصدار تلقائيا.
- تستطيع أدوات النشر معرفة هل التغيير ميزة جديدة أم إصلاح خطأ أم صيانة.

مثلا:

- `fix` غالبا يعني إصدار تصحيحي مثل `v1.0.1`.
- `feat` غالبا يعني إصدارا فرعيا مثل `v1.1.0`.
- التغيير الكاسر للتوافق قد يؤدي إلى إصدار رئيسي مثل `v2.0.0`.

## 2. استراتيجية تسمية فروع Git

اسم الفرع يجب أن يشرح هدف العمل قبل أن يفتح أي شخص الكود.

بدلا من أسماء غير واضحة مثل:

```txt
new-work
my-branch
updates
```

استخدم بادئات واضحة:

```txt
feature/login-page
bugfix/form-validation
hotfix/payment-crash
release/v1.2.0
```

### أشهر بادئات الفروع

| البادئة    | متى تستخدم؟                | مثال                          |
| ---------- | -------------------------- | ----------------------------- |
| `feature/` | لتطوير ميزة جديدة          | `feature/payment-integration` |
| `bugfix/`  | لإصلاح خطأ في نسخة التطوير | `bugfix/currency-conversion`  |
| `hotfix/`  | لإصلاح خطأ عاجل في الإنتاج | `hotfix/login-outage`         |
| `release/` | للتحضير لإصدار جديد        | `release/v1.2.0`              |
| `chore/`   | للصيانة أو إعدادات الأدوات | `chore/update-eslint-config`  |
| `docs/`    | للعمل على الوثائق          | `docs/git-workflow-guide`     |

### مثال عملي

تخيل أنك تعمل على إضافة نظام دفع في تطبيق.

أنشئ فرعا جديدا:

```bash
git checkout -b feature/payment-integration
```

بعد إضافة النسخة الأولى من الميزة:

```bash
git commit -m "feat: add stripe payment gateway"
```

إذا اكتشفت خطأ أثناء العمل على نفس الفرع:

```bash
git commit -m "fix: resolve currency conversion issue"
```

اسم الفرع يشرح هدف العمل العام. رسائل الالتزام تشرح التغييرات المحددة التي حدثت أثناء التنفيذ.

## قواعد بسيطة للمبتدئين

ابدأ بهذه القواعد:

- استخدم `feature/` للميزات الجديدة.
- استخدم `bugfix/` لإصلاح الأخطاء العادية.
- استخدم `hotfix/` فقط للأخطاء العاجلة في بيئة الإنتاج.
- ابدأ رسالة الالتزام بنوع واضح مثل `feat` أو `fix` أو `docs` أو `chore`.
- اجعل الوصف قصيرا ومباشرا.
- اكتب الرسالة بصيغة الأمر عندما يكون ذلك مناسبا، مثل `add login form` بدلا من `added login form`.

أمثلة جيدة:

```txt
feat: add dashboard page
fix: handle missing user avatar
docs: explain environment variables
chore: update vite config
```

أمثلة ضعيفة:

```txt
update
fixes
changes
final version
```

## الأتمتة

تربط الفرق غالبا هذا النظام بأدوات مثل:

- `Husky` لتشغيل فحوصات قبل تنفيذ الالتزام.
- `commitlint` لرفض رسائل الالتزام المخالفة.
- `semantic-release` لإنشاء Changelog ونشر الإصدارات تلقائيا.

لذلك، هذا النظام ليس مجرد تنظيم شكلي. يمكنه التحكم مباشرة في الاختبارات، والإصدارات، والنشر، وترقيم النسخ.

<div>
