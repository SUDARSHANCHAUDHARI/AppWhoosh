const { test } = require("node:test");
const assert = require("node:assert/strict");
const cp = require("child_process");

// Capture osascript calls instead of running them
const calls = [];
cp.execFileSync = (file, args) => { calls.push({ file, args }); };
cp.execSync = (cmd) => { calls.push({ file: cmd, args: [] }); };

const { notifyMac } = require("../tools/notify");

test("notifyMac passes values as argv, not in the script text", () => {
  const evil = `x" & (do shell script "touch /tmp/pwned") & "' ; touch /tmp/pwned2 ; '`;
  notifyMac(evil, evil, { subtitle: evil });
  assert.equal(calls.length, 1);
  const { file, args } = calls[0];
  assert.equal(file, "osascript");
  const script = args.filter((_, i) => args[i - 1] === "-e").join("\n");
  assert.ok(!script.includes(evil), "user text must not appear in the AppleScript source");
  assert.deepEqual(args.slice(-4), [evil, evil, evil, "Glass"]);
});
