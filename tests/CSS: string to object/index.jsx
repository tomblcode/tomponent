/** @jsx t.createElement */
import * as t from "tomponent";
assert(deepEqual(t.css`
background-color: red;
test: thing;
does-not-have-to-be-real: 25px;`, {
  backgroundColor: "red",
  test: "thing",
  doesNotHaveToBeReal: "25px"
}));
