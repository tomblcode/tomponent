/** @jsx t.createElement */
import * as t from "tomponent";
asserts = 2;
assert(deepEqual(t.css`
background-color: red;
test: thing;
does-not-have-to-be-real: 25px;`, {
  backgroundColor: "red",
  test: "thing",
  doesNotHaveToBeReal: "25px"
}));
assert(deepEqual(t.css`
strange-synTaX: but-ok;
test: thing; abc: def`, {
  strangeSyntax: "but-ok",
  test: "thing",
  abc: "def"
}));
