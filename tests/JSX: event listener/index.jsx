/** @jsx t.createElement */
import * as t from "tomponent";
const listeners = {};
HTMLElement.prototype.addEventListener = (event, callback) =>
  (listeners[event] = callback);
const func = e => console.log(e);
const el = <button value="test button" onclick={func} />;
assert(listeners.click === func);
