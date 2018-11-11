/** @jsx t.createElement */
import * as t from "tomponent";
t.use(t.plugins.state);
t.use(t.plugins.events);
asserts = 2;
t.Component("abc", data => {
  const state = data.state.get("state", { value: 0, renders: 0 }, false);
  state.renders++;
  data.on("click", data.rerender);
  data.once(() => {
    assert(state.value === 0);
    state.value = 1;
  });
  if (state.renders === 2) {
    assert(true);
  }
  return [];
});
document.body.appendChild(<abc />);
document.body.lastElementChild.click();