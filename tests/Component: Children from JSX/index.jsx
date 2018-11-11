/** @jsx t.createElement */
import * as t from "tomponent";
asserts = 3;
t.Component("testcomponent", data => {
  assert(data.children[0] === "text");
  assert(deepEqual(data.children[1], ["complex type"]));
  assert(data.children[2].outerHTML === "<p>Other element</p>");
  return [];
});
<testcomponent>
  text
  {["complex type"]}
  <p>Other element</p>
</testcomponent>;