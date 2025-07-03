# Introduction 
What this module is

# Examples
```typescript
import { PianoKeyboard } from "./instruments";
customElements.define(PianoKeyboard.ELEMENT, PianoKeyboard);
```

# List of Components
* Piano keyboard (instruments/keyboard)

# Install



# Example TypeScript + Rollup + Custom Web Components

* To get started, you'll need to install **Node.js** on your computer.
* You should also have a Code Editor like **Visual Studio Code**.
* Finally, make sure you can access your terminal or command line.

* Clone the repo and run the `npm install` commands listed below.



1. Create `src/components/dial.module.html`
```html
<div id="dial-container">
    <svg id="dial-svg" version="1.1" viewBox="0 0 100 100">
      <circle class="ring" cx="50" cy="50" r="50" />
      <line id="pointer" x1="50" y1="50" x2="50" y2="100" />
    </svg>
</div>
```

2. Create `src/components/dial.module.css`
```css
.ring {
    fill: #555;
    stroke: none;
}
#pointer {
    stroke: black;
    stroke-width: 7;
    stroke-linecap: round;
}
#dial-container {
    max-width: 100px;
}
```

3. Create `src/components/dial.ts`
```typescript
import styles from './dial.module.css' with {type: 'css'};
import html from './dial.module.html';

export class Dial extends HTMLElement {

    static readonly ELEMENT = "example-dial";

    static observedAttributes = [
        'min-value',
        'max-value',
        'value'
    ];

    /// all of the HTML elements are contained in a shadow DOM
    root : ShadowRoot;

    constructor() {
        super();
        this.root = this.attachShadow({ mode: 'open' });
        this.root.adoptedStyleSheets.push(styles);
        this.root.innerHTML = html;
    }

    connectedCallback() {
    }

    disconnectedCallback() {
    }

    attributeChangedCallback(name : string, oldValue : string, newValue : string) {
    }
}
```

4. Create `src/components/index.ts`
```typescript
export * from "./dial";
```

5. Create `src/index.ts`
```typescript
import { Dial } from "./components";

customElements.define(Dial.ELEMENT, Dial);
```

6. Create `index.html`
```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="/assets/css/main.css">
    <title>Example</title>
    <script src="/assets/js/example.min.js"></script>
</head>
<body>
    Hello There!
    <example-dial></example-dial>
</body>
</html>
```

# Compile your TypeScript Project
```sh
npm run watch
```

# Open the project in a browser

* Go to `http://localhost:10001/`


