/** @jsx t.createElement */
import * as t from "tomponent";
t.use();
asserts = Object.keys(t.plugins).length;
t.Component("abc", data => {
  Object.keys(t.plugins)
    .map(key => t.plugins[key])
    .map(value => value.name)
    .forEach(name => {
      assert(data.hasOwnProperty(name));
    });
  return [];
});
<abc />;
