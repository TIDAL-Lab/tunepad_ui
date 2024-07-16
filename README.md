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


# Original Instructions to Create this Project

**For instruction only** to really use this project, clone the repo and run the `npm install` commands listed below.

## Initialize the Project
From the command line, create a new project directory:
```sh
mkdir tunepad_ui
cd tunepad_ui
mkdir src
mkdir src/components
mkdir assets/images
mkdir assets/css
mkdir assets/js
```

Working inside your project folder, run this command.
```sh
npm init
```
This will create the `package.json`. Update your `package.json` to look like this:
```json
{
  "name": "tunepad_ui",
  "version": "0.0.1",
  "description": "Widgets, dials, menus, sliders for TunePad UI",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "rimraf build && rollup --config rollup.config.js",
    "watch": "rollup --config rollup.config.js --watch"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

# Install Rollup and Typescript

Our basic dependencies are Rollup and Typescript with a few Rollup plugins.

```sh
npm install --save-dev typescript tslib
npm install --save-dev rollup
npm install --save-dev @rollup/plugin-typescript
npm install --save-dev rollup-plugin-css-modules
npm install --save-dev rollup-plugin-html
npm install --save-dev rollup-plugin-serve
npm install --save-dev @rollup/plugin-terser
npm install --save-dev rimraf
```

# TypeScript Configuration
For every TypeScript project, we need to create a `tsconfig.json` file. 
```sh
tsc --init
```

Edit your `tsconfig.json` file to look like this:

```json
{
    "compilerOptions": {
        "target": "es2021",
        "lib": [ "es2021", "dom" ],
        "module": "esnext",
        "rootDir": "./",
        "moduleResolution": "node",
        "declaration": true,
        "sourceMap": true,
        "outDir": "./build/js/tso",
        "noEmitOnError": true,
        "allowSyntheticDefaultImports": true,
        "esModuleInterop": true,
        "forceConsistentCasingInFileNames": true,
        "strict": true,
        "noImplicitThis": true,
        "skipLibCheck": true
    },
    "include": [
        "./src/**/*.ts*"
    ]
}
```

# Rollup Configuration
Create a file called `rollup.config.js` in your project directory.
Edit the file to look like this:

```js
// rollup.config.js
import typescript from '@rollup/plugin-typescript'
import {cssModules} from 'rollup-plugin-css-modules'
import html from 'rollup-plugin-html'
import serve from 'rollup-plugin-serve'
import terser from '@rollup/plugin-terser'

export default {
    input: 'src/index.ts',
    output: [
        {
            file : 'assets/js/example.min.js',
            format : 'iife',
            name : 'example',
            sourcemap : true,
            plugins : [ terser() ]
        }
    ],
    plugins: [
        html({include: ['**/*.module.html', '**/*.svg' ]}),
        cssModules(),
        serve('.'),
        typescript({ sourceMap: true })
    ]
};
```

# Adding Typescript Source Files

1. Create `src/typings.d.ts`
```typescript
declare module "*.module.css";
declare module "*.module.html";
declare module "*.svg";
```

2. Create `src/components/dial.module.html`
```html
<div id="dial-container">
    <svg id="dial-svg" version="1.1" viewBox="0 0 100 100">
      <circle class="ring" cx="50" cy="50" r="50" />
      <line id="pointer" x1="50" y1="50" x2="50" y2="100" />
    </svg>
</div>
```

3. Create `src/components/dial.module.css`
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

4. Create `src/components/dial.ts`
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

5. Create `src/components/index.ts`
```typescript
export * from "./dial";
```

6. Create `src/index.ts`
```typescript
import { Dial } from "./components";

customElements.define(Dial.ELEMENT, Dial);
```

7. Create `index.html`
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


