# Capytale rich text editor

Capytale rich text editor. Based on Lexical playground.

Last Lexical playground commit taken into account: 9650950 (2023-09-29)

# Build

```bash
bun run build
```

# How to use

## Import

```javascript
import { CapytaleRichTextEditor } from "capytale-rich-text-editor";
import "capytale-rich-text-editor/style.css";
```

## Use

```javascript
<CapytaleRichTextEditor
    onChange={(content: string) =>
        console.log("New JSON:", content)
    }
    isEditable={true}
    initialEditorState="JSON state of the editor saved previously"
    htmlInitialContent="Optional HTML Code to initialize the editor (overrides initialEditorState)"
/>
```
