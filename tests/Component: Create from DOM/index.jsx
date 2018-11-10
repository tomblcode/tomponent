/** @jsx t.createElement */
import * as t from "tomponent";
t.Component("test-component", data => {
  return <p>Example thing</p>;
});
onload = () => {
  assert(
    document.body.children[2].shadowRoot.innerHTML === "<p>Example thing</p>"
  );
};
