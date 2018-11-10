/** @jsx t.createElement */
import * as t from "tomponent";
const el = <div style={{ backgroundColor: "red", color: "blue" }} />;
assert(el.attributes.style.value === "background-color: red; color: blue;");
