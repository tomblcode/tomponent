export interface IPlugin {
  name: string;
  data?: { [name: string]: any };
  init?(elementData: IComponentDataType): void;
  onrender?(
    element: HTMLElement | HTMLElement[]
  ): HTMLElement | HTMLElement[] | void;
  [name: string]: any;
}
const usedPlugins: IPlugin[] = [];
function handleProp(name: string, prop: any, element: HTMLElement) {
  if (name.slice(0, 2) === "on" && typeof prop === "function") {
    element.addEventListener(name.slice(2), prop);
  } else if (name === "style") {
    Object.keys(prop).forEach(styleName => {
      (element.style as any)[styleName] = prop[styleName];
    });
  }
}

// @ts-ignore tslint:disable-next-line:no-namespace
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export function use(plugin: IPlugin): void {
  usedPlugins.push(plugin);
}

export function createElement(
  elementName: string,
  props: { [name: string]: any } | null,
  ...children: Array<Node | string>
): HTMLElement {
  if (props == null) {
    props = {};
  }
  const element = document.createElement(elementName);
  Object.keys(props).forEach(propName => {
    handleProp(propName, props![propName], element);
  });
  children.forEach(child => {
    if (typeof child !== "object") {
      child = document.createTextNode(child);
    }
    if (Array.isArray(child)) {
      child.forEach(deepChild => {
        element.appendChild(deepChild);
      });
    } else {
      element.appendChild(child);
    }
  });
  return element;
}

interface IComponentDataType {
  props: { [name: string]: any };
  on: (event: string, callback: (event: Event) => void) => void;
  rerender: () => void;
  children: Node[];
  [name: string]: any;
}

export function Component(
  name: string,
  component: (data: IComponentDataType) => HTMLElement | HTMLElement[]
) {
  customElements.define(
    name,
    class extends HTMLElement {
      constructor() {
        const self: HTMLElement = super() as any;
        const shadow = this.attachShadow({ mode: "open" });
        const thisPlugins: IPlugin[] = [];
        let element: HTMLElement | HTMLElement[];
        let data: IComponentDataType = {
          children: [...self.childNodes] as Node[],
          props: {},
          on(event, callback) {
            self.addEventListener(event, callback);
          },
          rerender() {
            if (element !== undefined) {
              if (Array.isArray(element)) {
                element.forEach(child => {
                  shadow.removeChild(child);
                });
              } else {
                shadow.removeChild(element);
              }
            }
            element = component(data);
            usedPlugins.forEach(plugin => {
              if (typeof plugin.onrender === "function") {
                const returned = plugin.onrender!(element);
                if (
                  returned instanceof HTMLElement ||
                  (Array.isArray(returned) &&
                    returned
                      .map(child => child instanceof HTMLElement)
                      .every(child => child))
                ) {
                  element = returned;
                }
              }
            });
            if (Array.isArray(element)) {
              element.forEach(child => {
                shadow.appendChild(child);
              });
            } else {
              shadow.appendChild(element);
            }
          }
        };
        usedPlugins.forEach((plugin, i) => {
          thisPlugins[i] = { ...plugin };
          if (typeof plugin.init === "function") {
            thisPlugins[i].init!(data);
          }
        });
        [...self.attributes].forEach(attribute => {
          data.props[attribute.name] = attribute.value;
        });
        usedPlugins.forEach(plugin => {
          if (plugin.data !== undefined) {
            data = { [plugin.name]: plugin.data, ...data };
          }
        });
        data.rerender();
      }
    }
  );
}

export const plugins: { [name: string]: IPlugin } = {
  state: {
    init({ rerender }) {
      this.data!.states = {};
      this.data!.rerender = rerender;
    },
    data: {
      get(
        storeName: string,
        defaultValue: { [name: string]: any },
        causesRerender = true
      ): { [name: string]: any } {
        const rerender = this.rerender;
        if (this.states[storeName] === undefined) {
          this.states[storeName] = defaultValue;
        }
        return new Proxy(this.states[storeName], {
          get(target, prop) {
            return target[prop];
          },
          set(target, prop: string, value) {
            if (target[prop] === value) {
              return true;
            }
            target[prop] = value;
            if (causesRerender) {
              rerender();
            }
            return true;
          }
        });
      },
      set(storeName: string, newState: { [name: string]: any }) {
        this.states[storeName] = newState;
        this.rerender();
        return this.states[storeName];
      }
    },
    name: "state"
  }
};

export function css(strings: TemplateStringsArray, ...inlines: any[]) {
  let str: any = "";
  inlines.push("");
  strings.forEach((part, i) => {
    str += part + inlines[i];
  });
  const style: { [name: string]: string } = {};
  str
    .split(";")
    .map((s: string) => [
      s.split(":")[0].trim(),
      s
        .split(":")
        .slice(1)
        .join(":")
        .trim()
    ])
    .map((s: string[]) => {
      s[0] = s[0].replace(/(\-\w)/g, matches => {
        return matches[1].toUpperCase();
      });
      return s;
    })
    .forEach((tuple: string[]) => {
      style[tuple[0]] = tuple[1];
    });
  delete style[""];
  return style;
}
