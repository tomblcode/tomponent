# tomponent
An experimental, simple and modolar component library leveraging new technologies like shadow DOM and web components.

## Usage
At the moment, you must build it yourself (with `npm install`, then `tsc`), and import the es6 module file at `lib/index.js`.

### API
#### `Component`
Params: name, and and component function, which returns a HTML element, typically created with JSX, and takes a data object, that, by default, looks like:
```js
{
  props: {/*...all props*/},
  children: [/*...all children*/],
  rerender: function () {},
  on: (name, callback) // for events such as keypress or click // will be moved to plugin later
}
```
But can be extended by using plugins with the next API item, `use`

#### `use`
Use is a function which takes a plugin, and applies it.
See creating a plugin, or the built in plugins below.

#### `css`
The JSX normally takes a `element.style` like object and applies it to the element, but the tagged template literal 
```js
css`
  color: blue;
  background-color: red;
`
``` 
converts a css string to the understood object type.

#### Plugins

##### `state`
This plugin adds a state object to the data object passed to the component function, which contains a set function and a get function. 
```js
data.state.set(storename, {/* new state data */});
// it also adds:
const state = data.state.get(storename, {/* default value */}); // this optionally takes a boolean for whether or not changing this rerenders the element
// This returns an editable object of the state where items in the object can be replaced, but the object itself cannot be, requiring the usage of the set function.
state.foo = 0;
```

##### `globalState`
**coming soon**
Will have same api as `state`, but global for all objects.

##### Writing a plugin
All a plugin is is an object, that has to contain a name property, which is what the data object subobejct for your data is called. It can optionally contain the following:

- **`init`**: A function called with the element data passed, called on usage of every element.
- **`onrender`**: A function passed the return value of the rendered element, that can optionally return a new version the render to replace it.
- **`data`**: An object to be attatched to the `data` object, passed to every component.
