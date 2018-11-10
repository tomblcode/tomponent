/** @jsx t.createElement */
import * as t from "tomponent";
const el = <p class="testing">Example Content</p>;
assert(el.outerHTML === '<p class="testing">Example Content</p>');