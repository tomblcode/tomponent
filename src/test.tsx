import * as t from "./index.js";

t.Component("a-bc", data => {
  const state = data.createState("styledata", {
    bg: "#eeeeee",
    renders: 0
  });
  const renderlessState = data.createState("styledata", {}, false);
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
      Test
      {state.renders}
    </p>
  );
});
