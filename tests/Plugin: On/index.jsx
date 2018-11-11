/** @jsx t.createElement */
import * as t from "tomponent";
t.use(t.plugins.state);
t.use(t.plugins.events);
asserts = 2;
t.Component("abc", data => {
  const state = data.state.get("state", { value: 0 }, false);
  state.renders++;
  data.on("click", () => {
    assert(true);
  });
  return [];
});
document.body.appendChild(<abc />);
document.body.lastElementChild.click();
document.body.lastElementChild.click();
