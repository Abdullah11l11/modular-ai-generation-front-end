/** Generate or update the content layer (slides data) for an MGF project. */
export const TASK_GENERATE_CONTENT_PROMPT = `Generate the content layer for an MGF project. This file holds all slide content as JSON. Preserve the exact schema. Only output the content — do not generate HTML, CSS, or any other file.

## Input

Read the project's \`context\` first. It contains the brief, audience, brand voice, and AI instructions that shape the content.

## JSON Schema (MUST preserve exactly)

\`\`\`json
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
      "data": {
        // varies by component — see component data reference below
      }
    }
  ]
}
\`\`\`

## Component Data Reference

### cover
\`\`\`json
{ "title": "string", "subtitle": "string", "label": "string", "author": "string", "date": "string" }
\`\`\`

### chapter
\`\`\`json
{ "number": "string", "title": "string", "subtitle": "string" }
\`\`\`

### problem
\`\`\`json
{ "title": "string", "body": "string", "points": ["string"] }
\`\`\`

### stats
\`\`\`json
{ "title": "string", "stats": [{ "value": "string", "label": "string" }], "caption": "string" }
\`\`\`

### image-text
\`\`\`json
{ "title": "string", "body": "string", "image_placeholder": "string", "image_alt": "string", "layout": "text-left|text-right" }
\`\`\`

### closing
\`\`\`json
{ "title": "string", "body": "string", "cta": "string", "cta_url": "string" }
\`\`\`

### quote
\`\`\`json
{ "quote": "string", "author": "string", "title": "string", "avatar": "string" }
\`\`\`

### timeline
\`\`\`json
{ "title": "string", "label": "string", "items": [{ "date": "string", "headline": "string", "desc": "string" }] }
\`\`\`

### comparison
\`\`\`json
{ "title": "string", "left_header": "string", "right_header": "string", "left_items": ["string"], "right_items": ["string"] }
\`\`\`

### process
\`\`\`json
{ "title": "string", "steps": [{ "num": "string", "title": "string", "desc": "string" }] }
\`\`\`

### features
\`\`\`json
{ "title": "string", "subtitle": "string", "features": [{ "icon": "string", "title": "string", "desc": "string" }] }
\`\`\`

### team
\`\`\`json
{ "title": "string", "members": [{ "name": "string", "role": "string", "bio": "string", "avatar": "string" }] }
\`\`\`

### testimonial
\`\`\`json
{ "quote": "string", "author": "string", "role": "string", "company": "string", "avatar": "string" }
\`\`\`

### faq
\`\`\`json
{ "title": "string", "items": [{ "q": "string", "a": "string" }] }
\`\`\`

### pricing
\`\`\`json
{ "title": "string", "plans": [{ "name": "string", "price": "string", "period": "string", "features": ["string"], "cta": "string" }] }
\`\`\`

### gallery
\`\`\`json
{ "title": "string", "images": [{ "src": "string", "alt": "string", "caption": "string" }] }
\`\`\`

### callout
\`\`\`json
{ "type": "info|success|warning", "icon": "string", "title": "string", "body": "string" }
\`\`\`

### table
\`\`\`json
{ "title": "string", "headers": ["string"], "rows": [["string"]] }
\`\`\`

### chart
\`\`\`json
{ "title": "string", "type": "bar", "labels": ["string"], "values": [number] }
\`\`\`

### contact
\`\`\`json
{ "title": "string", "email": "string", "phone": "string", "website": "string", "address": "string" }
\`\`\`

### newsletter
\`\`\`json
{ "title": "string", "subtitle": "string", "placeholder": "string", "cta": "string" }
\`\`\`

### video
\`\`\`json
{ "title": "string", "video_url": "string", "thumbnail": "string", "duration": "string" }
\`\`\`

### announcement
\`\`\`json
{ "badge": "string", "title": "string", "body": "string", "cta": "string", "cta_url": "string" }
\`\`\`

## Rules

- Slide IDs must be sequential starting at 1: 1, 2, 3...
- Slide titles must be under 8 words
- Body text should be under 40 words per slide
- Use the component that best fits the content — don't force content into the wrong structure
- For image_placeholder fields, use a descriptive placeholder path like "assets/diagram.png" or "assets/photo.jpg"
- avatar fields can be empty strings if no photo
- All points/items array elements should be concise (under 12 words each)
- \`id\` in data is NOT needed — it's injected by the renderer from slide.id
- Output ONLY the content layer JSON. No markdown code fences. No preamble.`;
