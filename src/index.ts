import "@webcomponents/webcomponentsjs/webcomponents-bundle";
const declaredComponents: string[] = [];
export interface IPlugin {
  name: string;
  data?: (plugin: IPlugin, element: HTMLElement) => any;
  oncreate?(elementData: IComponentDataType): void;
  onrender?(
    element: HTMLElement | HTMLElement[]
  ): HTMLElement | HTMLElement[] | void;
  [name: string]: any;
}
const usedPlugins: IPlugin[] = [];
function handleProp(name: string, prop: any, element: HTMLElement) {
  if (name.slice(0, 2) === "on" && typeof prop === "function") {
    element.addEventListener(name.slice(2), prop);
  } else if (name === "style" && typeof prop === "object") {
    Object.keys(prop).forEach(styleName => {
      (element.style as any)[styleName] = prop[styleName];
    });
  } else {
    element.setAttribute(name, prop);
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

function encodeElementName(name: string): string {
  name = name.replace(/\//g, "-slash-");
  name = name.replace(/\?/g, "-question-");
  name = name.replace(/\!/g, "-exclamation-");
  name = name.replace(/\@/g, "-at-");
  name = name.replace(/\#/g, "-hash-");
  name = name.replace(/\$/g, "-dollar-");
  name = name.replace(/\%/g, "-percent-");
  name = name.replace(/\^/g, "-caret-");
  name = name.replace(/\&/g, "-ampersand-");
  name = name.replace(/\(/g, "-bracket-open-");
  name = name.replace(/\)/g, "-bracket-close-");
  name = name.replace(/\*/g, "-asterisk-");
  name = name.replace(/\=/g, "-equals-");
  name = name.replace(/\+/g, "-plus-");
  if (name.indexOf("-") === -1) {
    name = "component-" + name;
  }
  return name;
}

export function use(plugin?: IPlugin): void {
  if (plugin === undefined) {
    Object.keys(plugins).forEach(name => {
      use(plugins[name]);
    });
  } else {
    usedPlugins.push(plugin);
  }
}

export function createElement(
  name: string,
  props: { [name: string]: any } | null,
  ...children: Array<Node | string>
): HTMLElement {
  let element: HTMLElement;
  if (props == null) {
    props = {};
  }
  if (declaredComponents.includes(name)) {
    name = encodeElementName(name);
    element = new (customElements.get(name))(props);
  } else {
    element = document.createElement(name);
    Object.keys(props).forEach(propName => {
      handleProp(propName, props![propName], element);
    });
  }
  children.forEach(child => {
    if (!child) {
      return;
    }
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

export interface IComponentDataType {
  props: { [name: string]: any };
  rerender: () => void;
  children: Node[];
  once: <Return>(run: () => Return) => Return;
  [name: string]: any;
}

export function Component(
  name: string,
  component: (data: IComponentDataType) => HTMLElement | HTMLElement[]
): string {
  declaredComponents.push(name);
  name = encodeElementName(name);
  customElements.define(
    name,
    class extends HTMLElement {
      protected rerender: () => void;
      constructor(props: { [name: string]: any }) {
        const self: HTMLElement = super() as any;
        const shadow = this.attachShadow({ mode: "open" });
        const thisPlugins: IPlugin[] = [];
        const runOnce: string[] = [];
        const runOnceReturns: any[] = [];
        let element: HTMLElement | HTMLElement[];
        let data: IComponentDataType = {
          children: [...self.childNodes] as Node[],
          props: {},
          once(run) {
            if (!runOnce.includes(run.toString())) {
              const returned = run();
              runOnce.push(run.toString());
              runOnceReturns.push(returned);
              return returned;
            } else {
              return runOnceReturns[runOnce.indexOf(run.toString())];
            }
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
            if (props === undefined) {
              [...self.attributes].forEach(attribute => {
                data.props[attribute.name] = attribute.value;
              });
            } else {
              data.props = props;
            }
            element = component(data);
            thisPlugins.forEach(plugin => {
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
          if (typeof plugin.oncreate === "function") {
            thisPlugins[i].oncreate!(data);
          }
        });
        thisPlugins.forEach(plugin => {
          if (plugin.data !== undefined) {
            data = { [plugin.name]: plugin.data(plugin, self), ...data };
          }
        });
        this.rerender = data.rerender;
        data.rerender();
      }
    }
  );
  return name;
}

export const plugins: { [name: string]: IPlugin } = {
  events: {
    data(plugin, element) {
      return (
        eventName: string,
        specialOrCallback: string | number,
        callback?: (event: Event) => void
      ) => {
        if (
          plugin.events.includes(
            [
              eventName,
              specialOrCallback.toString(),
              (callback == null ? "" : callback).toString()
            ].join(",HOPEFULLY_UNIQUE_SEPARATOR,")
          )
        ) {
          return;
        } else {
          plugin.events.push(
            [
              eventName,
              specialOrCallback.toString(),
              (callback == null ? "" : callback).toString()
            ].join(",HOPEFULLY_UNIQUE_SEPARATOR,")
          );
        }
        let special: string | number | undefined;
        if (typeof specialOrCallback === "function") {
          callback = specialOrCallback;
        } else {
          special = specialOrCallback;
        }
        if (special !== undefined) {
          element.addEventListener(eventName, event => {
            if (event instanceof KeyboardEvent) {
              // tslint:disable-next-line:triple-equals // so that you can specify type number for number key
              if (event.key == special) {
                callback!(event);
              }
            } else if (event instanceof MouseEvent) {
              if (event.button === special) {
                callback!(event);
              }
            } else {
              throw new Error(
                `No known special action for event type ${event
                  .toString()
                  .slice(8, -1)}`
              );
            }
          });
        } else {
          element.addEventListener(eventName, callback!);
        }
      };
    },
    events: [],
    name: "on"
  },
  state: {
    oncreate({ rerender }) {
      this.states = {};
      this.rerender = rerender;
    },
    data(plugin) {
      return {
        get(
          storeName: string,
          defaultValue: { [name: string]: any },
          causesRerender = true
        ): { [name: string]: any } {
          if (plugin.states[storeName] === undefined) {
            plugin.states[storeName] = defaultValue;
          }
          return new Proxy(plugin.states[storeName], {
            get(target, prop) {
              return target[prop];
            },
            set(target, prop: string, value) {
              if (target[prop] === value) {
                return true;
              }
              target[prop] = value;
              if (causesRerender) {
                plugin.rerender();
              }
              return true;
            }
          });
        },
        set(storeName: string, newState: { [name: string]: any }) {
          plugin.states[storeName] = newState;
          plugin.rerender();
          return plugin.states[storeName];
        }
      };
    },
    name: "state",
    rerender: undefined,
    states: {}
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
