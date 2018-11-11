/** @jsx t.createElement */
import * as t from "tomponent";
asserts = 2;
t.Component("testcomponent", data => {
  assert(data.props.test === "123");
  assert(deepEqual(data.props.test2, { complexType: 123 }));
  return [];
});
<testcomponent test="123" test2={{ complexType: 123 }} />;

