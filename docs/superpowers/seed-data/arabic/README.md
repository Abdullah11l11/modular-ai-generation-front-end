# Arabic Seed Bundle

Three ready-to-paste Arabic archetypes for the MGF backend seeder.
The Laravel code that wires these in lives in
`01_MGF_BACKEND/database/seeders/Concerns/MgfFileBuilders.php` —
this folder is the **content** side, not the wiring side.

## Why a bundle, not a code change

The user-visible constraint: the backend should stay 100% the
same. So the Laravel `MgfFileBuilders.php` file is **not**
modified in this repo. Instead, every archetype ships here as a
fold of plain files matching the existing layout:

  pitch/    style.css  data.json  slide-01.html  …  slide-08.html
  website/  style.css  data.json  content.html
  summary/  style.css  data.json  slide-01.html  …  slide-05.html

The backend engineer (or the next person who picks this up) can
read each folder, copy the file contents into the equivalent
`MgfFileBuilders::pitchArabicFiles()` etc. methods, and
register the three new templates in `ProjectSeeder.php` +
`TemplateSeeder.php`.

## What the bundle gets you

- 3 new RTL templates
- 3 new seeded projects (one per template)
- Total seeded count after drop-in: 7 + 4 (Tier 5) + 3 (here) = 14
- The frontend `<html dir="rtl" lang="ar">` and Cairo / Noto Naskh
  Arabic fonts from Task 4.1 + 4.2 render these slides correctly
  end-to-end without any further frontend work.

## Drop-in instructions

For each archetype folder:

1. Copy `style.css` and `data.json` into a new
   `MgfFileBuilders::pitchArabicFiles()` /
   `websiteArabicFiles()` / `summaryArabicFiles()` method.
2. In `ProjectSeeder.php`, add three project entries that:
   - Use `direction = 'rtl'`
   - Use `locale = 'ar'`
   - Pull the style / layout / data / slide files from the
     corresponding Arabic helper
3. In `TemplateSeeder.php`, add the matching template rows so
   the user can pick these archetypes from the "New project"
   dropdown.
4. Re-seed and verify with `php artisan db:seed`.

## Acceptance check (frontend, no Laravel required)

To verify the bundle on the frontend only:

1. Open the editor for any existing LTR project.
2. Replace the project's `style.css` with
   `pitch/style.css` (or any archetype).
3. Replace `data.json` with `pitch/data.json`.
4. Add a slide whose `slide-NN.html` matches one of the
   `pitch/slide-*.html` files in this bundle.
5. Toggle the project's `direction` to `rtl` from
   `ProjectSettingsPanel`.
6. Reload. The preview iframe should render Arabic content with
   the Cairo font, correct RTL layout (bullets on the right,
   nav row-reversed, etc.), and the language badge showing
   `lang="ar"`.

If the acceptance check passes, the bundle is correct — the
backend drop-in is purely mechanical.
