import assert from "node:assert/strict";
import { safeHttpUrl } from "./safe-url.ts";

assert.equal(safeHttpUrl("https://shop.example.com/promo?id=1"), "https://shop.example.com/promo?id=1");
assert.equal(safeHttpUrl("  http://a.co  "), "http://a.co/");
assert.equal(safeHttpUrl("javascript:alert(1)"), "");
assert.equal(safeHttpUrl("JavaScript:alert(1)"), "");
assert.equal(safeHttpUrl("data:text/html,<script>x</script>"), "");
assert.equal(safeHttpUrl("//evil.com/x"), "");
assert.equal(safeHttpUrl("/relative/path"), "");
assert.equal(safeHttpUrl(""), "");
assert.equal(safeHttpUrl(undefined), "");
assert.equal(safeHttpUrl(42), "");
console.log("safeHttpUrl ok");
