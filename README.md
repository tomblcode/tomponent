# tomponent [![Build Status](https://travis-ci.com/tomblcode/tomponent.svg?branch=master)](https://travis-ci.com/tomblcode/tomponent)

An experimental, simple and modular component library leveraging new technologies like shadow DOM and web components.

## Setup
1. Insert `import * as t from "tomponent"` to the top of your bundled js file.
2. If using [babel](https://babeljs.io), add this to your `.babelrc`:
```json
"plugins": {
  ["@babel/plugin-transform-react-jsx", {
    "pragma": "t.createElement"
    }]
  ]
}
```
Or if using [TypeScript](https://typescriptlang.org), add this to your `tsconfig.json`
```json
"jsx": "react",
"jsxFactory": "t.createElement"
```
3. Done!

## API
### `Component(`*`name, data => <element />`*`)`
***Note: component names follow a strict set of rules, so the creation of elements as well as JSX usage are automatically fixed, but usage from the DOM may not work 100% as expected***

The component function returns a HTML element, typically created with JSX, and takes a data object that is extendible by plugins, but contains the following by default:

#### `rerender()`
A function that rerenders the component.

#### `once(`*`func`*`)`
A function that takes a function to call on first render of the component.

#### `props`
An object with the props of the component.

#### `children`
An array with the children of the component.



### `use(`*`[plugin]`*`)`
Use is a function which takes a plugin, and applies it.

If not passed a plugin, it applies all the built-in plugins.

See creating a plugin, or the built-in plugins below.

### `css`
The JSX normally takes a `HTMLElement.style` like object and applies it to the element, but the tagged template literal 
```js
css`
  color: blue;
  background-color: red;
`
``` 
converts a css string to the understood object type.

### Plugins

#### Default Plugins
These are availible on the `t.plugins` object can can either be used individualy with `t.use(t.plugins.NAME)` or they can all be loaded at once with `t.use()`.

**`state`**

This plugin adds a state object to the data object passed to the component function, which contains a set function and a get function. 
```js
data.state.set(storename, {/* new state data */});
const state = data.state.get(storename, {/* default value */}); // this optionally takes a boolean for whether or not changing this rerenders the element
// This returns an editable object of the state where items in the object can be replaced, but the object itself cannot be, requiring the usage of the set function.
state.foo = 0;
```

**`globalState`**

**coming soon**

Will have same api as `state`, but global for all objects.

**`events`**

This plugin allows you to subscribe to events on your main dom element. It also has an optional special parameter used for `KeyboardEvent`s and `MouseEvent`s used for the keyboard key and mouse button respectively. The first parameter is the event name, and the last is the function called when the event is fired.
```js
data.on("click", (e) => {
  console.log(e);
});
data.on("keydown", "Backspace", (e) => {
  console.log("Backspace key pressed.");
});
```

#### Writing a plugin
A plugin is just an object that contains the following properties:

- **`name`**: A string used for `plugin.data`.
- **`oncreate`** *(optional)*: A function called with the element data passed, called on usage of every element.
- **`onrender`** *(optional)*: A function passed the return value of the rendered element, that can optionally return a new version the rendered elements to replace them.
- **`data`** *(optional)*: A function that returns an item to be attatched to the `data` object, passed to every component, named `plugin.name`.

If written in TypeScript, the plugin should be of the exported type `IPlugin`.