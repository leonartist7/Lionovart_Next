# 🎨 Visual Editor Guide

## Quick Start

### 1. **Activate Inspector Mode**
Press **`Cmd+Shift+I`** (Mac) or **`Ctrl+Shift+I`** (Windows/Linux) to toggle the visual editor overlay.

You'll see a red message at the bottom: **"🎨 Inspector Mode — Click elements to edit"**

### 2. **Click an Element**
Hover over headings, paragraphs, buttons, or text blocks. They'll highlight in red with a semi-transparent background.

Click to select an element.

### 3. **Edit in the Side Panel**
A properties panel appears on the right side with:
- **Text Content** — Edit the text that displays
- **CSS Classes (Tailwind)** — Add/modify Tailwind classes
- **Element Info** — View the HTML tag, ID, and current classes

Changes appear **live on the page instantly** as you type.

### 4. **Save Changes**
Click **"💾 Save Changes"** to persist your edits to the source TSX file.

> ⚠️ **Note**: The save feature currently saves to a temp location. For production, it will update your actual source files directly.

---

## Use Cases

### Change Headline Text
1. Press `Cmd+Shift+I` / `Ctrl+Shift+I`
2. Click the "Innovating in today's digital era..." headline
3. Edit the text in the "Text Content" field
4. See changes live
5. Click "Save Changes"

### Update Colors or Styling
1. Open inspector mode
2. Click any element
3. Modify the "CSS Classes" textarea
4. Example: Change `text-white` to `text-red-500`, or add `opacity-50`
5. Changes apply instantly
6. Save when done

### Edit Button Text or CTA
1. Click the button in inspector mode
2. Change the text in the panel
3. Adjust Tailwind classes (e.g., add `bg-white text-black`)
4. Save

---

## What's Behind the Scenes

### File Structure
```
src/
├── lib/
│   └── visual-editor-context.tsx     # Context + hooks
├── components/
│   ├── VisualEditorOverlay.tsx       # Click detection overlay
│   ├── VisualEditorHotkey.tsx        # Cmd+Shift+I hotkey
│   └── InspectorPanel.tsx            # Properties editor panel
├── app/
│   ├── layout.tsx                    # (Updated) Provider wrapper
│   └── api/visual-editor/save/
│       └── route.ts                  # API to save changes
```

### How It Works

1. **Context**: `useVisualEditor()` manages selected elements and state
2. **Overlay**: Detects clicks on editable elements (headings, text, buttons)
3. **Panel**: Shows editable properties (text, classes)
4. **API**: `/api/visual-editor/save` persists changes to TSX files
5. **Hotkey**: `Cmd+Shift+I` toggles the overlay

### Live Editing
- Text changes: Apply to `element.textContent` immediately
- Class changes: Apply to `element.className` immediately
- No page refresh needed — everything updates in real-time

---

## Tips & Tricks

💡 **Tailwind Classes Only**  
Use Tailwind CSS utility classes in the "CSS Classes" field:
- `text-lg font-bold` ✅
- `bg-red-500 hover:bg-red-600` ✅
- `inline-block opacity-50` ✅

💡 **Preserve Other Classes**  
When editing classes, keep existing ones unless you want to remove them:
- Old: `text-white text-lg`
- New: `text-white text-lg font-bold opacity-75` (added `font-bold opacity-75`)

💡 **Element IDs**  
If an element doesn't have an ID, the visual editor auto-assigns one (`elem-abc123`). You can change this in the HTML later if needed.

💡 **Multiple Edits**  
You can edit multiple elements in one session:
1. Edit element A, save
2. Click element B
3. Edit element B, save

---

## Troubleshooting

### Inspector won't toggle
- Make sure you're pressing the correct hotkey
- **Mac**: `Cmd+Shift+I` (Command key)
- **Windows/Linux**: `Ctrl+Shift+I` (Control key)

### Changes don't appear
- Your element might not be in the editable selectors list
- Current selectors: headings, paragraphs, spans, buttons
- Check the browser console for errors

### Save failed error
- Check the browser console (F12) for error messages
- The API route might have an issue
- Verify the file path is correct

---

## Future Enhancements

- [ ] Advanced selector mapping (map elements to specific TSX lines)
- [ ] Undo/Redo functionality
- [ ] CSS property picker (color, size, spacing without typing)
- [ ] Component preview on save
- [ ] Batch edits across multiple elements

---

Enjoy visual editing! 🎨
