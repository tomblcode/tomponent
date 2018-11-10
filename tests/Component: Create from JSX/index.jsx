/** @jsx t.createElement */
import * as t from "tomponent";
t.Component("testcomponent", data => {
  return <p>Example thing</p>;
});
const el = <testcomponent />;
assert(
  el.shadowRoot.innerHTML === "<p>Example thing</p>"
);
