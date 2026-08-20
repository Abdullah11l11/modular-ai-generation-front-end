# Task: Generate the Content Layer

Generate the `data.json` for an MGF project. This file holds all slide
content. Preserve the exact schema. Only emit content — do not
generate HTML, CSS, or any other file.

## Input

Read the project's `context` first. It contains the brief, audience,
brand voice, and AI instructions that shape the content.

## Output

A JSON object whose only top-level key is `data.json`. The value is
the full JSON content schema as a string (no markdown fences, no
preamble). The top-level structure of the value:

```json
{
  "_meta": {
    "project": "string",
    "version": "string",
    "output_target": "string",
    "format": "string",
    "total_slides": number
  },
  "slides": [
    {
      "id": number,
      "component": "string",
      "data": { /* varies by component — see below */ }
    }
  ]
}
```

## Component data reference

### cover

```json
{ "title": "string", "subtitle": "string", "label": "string", "author": "string", "date": "string" }
```

### chapter

```json
{ "number": "string", "title": "string", "subtitle": "string" }
```

### problem

```json
{ "title": "string", "body": "string", "points": ["string"] }
```

### stats

```json
{ "title": "string", "stats": [{ "value": "string", "label": "string" }], "caption": "string" }
```

### image-text

```json
{ "title": "string", "body": "string", "image_placeholder": "string", "image_alt": "string", "layout": "text-left|text-right" }
```

### closing

```json
{ "title": "string", "body": "string", "cta": "string", "cta_url": "string" }
```

### quote

```json
{ "quote": "string", "author": "string", "title": "string", "avatar": "string" }
```

### timeline

```json
{ "title": "string", "label": "string", "items": [{ "date": "string", "headline": "string", "desc": "string" }] }
```

### comparison

```json
{ "title": "string", "left_header": "string", "right_header": "string", "left_items": ["string"], "right_items": ["string"] }
```

### process

```json
{ "title": "string", "steps": [{ "num": "string", "title": "string", "desc": "string" }] }
```

### features

```json
{ "title": "string", "subtitle": "string", "features": [{ "icon": "string", "title": "string", "desc": "string" }] }
```

### team

```json
{ "title": "string", "members": [{ "name": "string", "role": "string", "bio": "string", "avatar": "string" }] }
```

### testimonial

```json
{ "quote": "string", "author": "string", "role": "string", "company": "string", "avatar": "string" }
```

### faq

```json
{ "title": "string", "items": [{ "q": "string", "a": "string" }] }
```

### pricing

```json
{ "title": "string", "plans": [{ "name": "string", "price": "string", "period": "string", "features": ["string"], "cta": "string" }] }
```

### gallery

```json
{ "title": "string", "images": [{ "src": "string", "alt": "string", "caption": "string" }] }
```

### callout

```json
{ "type": "info|success|warning", "icon": "string", "title": "string", "body": "string" }
```

### table

```json
{ "title": "string", "headers": ["string"], "rows": [["string"]] }
```

### chart

```json
{ "title": "string", "type": "bar", "labels": ["string"], "values": [number] }
```

### contact

```json
{ "title": "string", "email": "string", "phone": "string", "website": "string", "address": "string" }
```

### newsletter

```json
{ "title": "string", "subtitle": "string", "placeholder": "string", "cta": "string" }
```

### video

```json
{ "title": "string", "video_url": "string", "thumbnail": "string", "duration": "string" }
```

### announcement

```json
{ "badge": "string", "title": "string", "body": "string", "cta": "string", "cta_url": "string" }
```

## Rules

- Slide IDs sequential starting at 1.
- Slide titles under 8 words.
- Body text under 40 words per slide.
- Use the component that best fits the content — don't force content into the wrong structure.
- For `image_placeholder` fields, use a descriptive path like `assets/diagram.png`.
- `avatar` fields can be empty strings if no photo.
- Array items under 12 words each.
- `_meta.total_slides` must match the number of slides in the array.
- Output ONLY the JSON content. No markdown fences. No preamble.
