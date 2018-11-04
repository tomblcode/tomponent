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

export function createElement(
  elementName: string,
  props: { [name: string]: any },
  ...children: Array<Node | string>
): HTMLElement {
  if (!props) {
    props = {};
  }
  const element = document.createElement(elementName);
  Object.keys(props).forEach(propName => {
    handleProp(propName, props[propName], element);
  });
  children.forEach(child => {
    if (typeof child !== "object") {
      child = document.createTextNode(child);
    }
    element.appendChild(child);
  });
  return element;
}

interface IComponentDataType {
  props: { [name: string]: any };
  on: (event: string, callback: (event: Event) => void) => void;
  createState: (
    name: string,
    defaultValue: { [name: string]: any },
    causesRerender?: boolean
  ) => { [name: string]: any };
  rerender: () => void;
  setState: (
    name: string,
    value: { [name: string]: any }
  ) => { [name: string]: any };
}

export function Component(
  name: string,
  component: (data: IComponentDataType) => HTMLElement
) {
  customElements.define(
    name,
    class extends HTMLElement {
      constructor() {
        const self: HTMLElement = super() as any;
        const shadow = this.attachShadow({ mode: "open" });
        const states: { [name: string]: { [name: string]: any } } = {};
        let element: HTMLElement;
        const data: IComponentDataType = {
          props: {},
          on(event, callback) {
            self.addEventListener(event, callback);
          },
          createState(
            storeName,
            defaultValue,
            causesRerender = true
          ): { [name: string]: any } {
            if (states[storeName] === undefined) {
              states[storeName] = defaultValue;
            }
            return new Proxy(states[storeName], {
              get(target, prop) {
                // @ts-ignore
                return target[prop];
              },
              set(target, prop: string, value) {
                if (target[prop] === value) {
                  return true;
                }
                target[prop] = value;
                if (causesRerender) {
                  data.rerender();
                }
                return true;
              }
            });
          },
          rerender() {
            if (element !== undefined) {
              shadow.removeChild(element);
            }
            element = component(data);
            shadow.appendChild(element);
          },
          setState(storeName, newState) {
            states[storeName] = newState;
            data.rerender();
            return states[storeName];
          }
        };
        [...self.attributes].forEach(attribute => {
          data.props[attribute.name] = attribute.value;
        });
        data.rerender();
      }
    }
  );
}

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
