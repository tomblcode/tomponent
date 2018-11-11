/** @jsx t.createElement */
import * as t from "tomponent";
t.use(t.plugins.state);
asserts = 2;
t.Component("abc", data => {
  assert(data.hasOwnProperty("state"));
  assert(!data.hasOwnProperty("on"));
  return [];
});
<abc />;
