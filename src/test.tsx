import * as t from "./index.js";

t.use(t.plugins.state);

t.Component("a-bc", data => {
  const state = data.state.get("styledata", {
    bg: "#eeeeee",
    renders: 0
  });
  const renderlessState = data.state.get("styledata", {}, false);
  (window as any).bg = (newBg: string) => {
    state.bg = newBg;
  };
  renderlessState.renders++;
  return (
    <p
      style={t.css`
    background-color: ${state.bg};
    border: 1px solid black;
    padding: 10px;
    box-sizing: border-box;
    user-select: none;`}
      onclick={() => data.rerender()}
    >
      {data.props.prefix}
      {state.renders}
      <div style={{backgroundColor: "white", border: "1px dashed gray"}}>{data.children}</div>
    </p>
  );
});
