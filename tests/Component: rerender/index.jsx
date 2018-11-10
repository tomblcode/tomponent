/** @jsx t.createElement */
import * as t from "tomponent";
t.Component("test", data => {
  data.rerender();
});
try {
  const el = <test />;
  assert(false);
} catch (e) {
  if (e instanceof RangeError) {
    assert(true);
  } else {
    assert(false);
  }
}
