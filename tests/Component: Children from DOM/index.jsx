/** @jsx t.createElement */
import * as t from "tomponent";
asserts = 3;
t.Component("test-component", data => {
  console.log(data.children);
  assert(data.children.length === 2);
  assert(data.children[0].innerText === "text");
  assert(data.children[1].outerHTML === "<p>Other element</p>");
  return [];
});