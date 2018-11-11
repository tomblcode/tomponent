/** @jsx t.createElement */
import * as t from "tomponent";
t.Component("test-component", data => {
  console.log(data.props);
  assert(data.props.test === "123");
  return [];
});