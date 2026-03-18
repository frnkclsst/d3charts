import { ESLint } from "eslint";
import path from "path";

const ROOT   = process.cwd();
const eslint = new ESLint();

const files  = await eslint.lintFiles(["src/**/*.ts"]);
const formatter = await eslint.loadFormatter("stylish");

let errorCount   = 0;
let warningCount = 0;

for (const result of files) {
  const rel    = path.relative(ROOT, result.filePath).replaceAll("\\", "/");
  const errors = result.errorCount;
  const warns  = result.warningCount;

  if (errors === 0 && warns === 0) {
    console.log(`  \x1b[32m✓\x1b[0m  ${rel}`);
  } else if (errors === 0) {
    console.log(`  \x1b[33m⚠\x1b[0m  ${rel}  (${warns} warning${warns > 1 ? "s" : ""})`);
  } else {
    console.log(`  \x1b[31m✗\x1b[0m  ${rel}  (${errors} error${errors > 1 ? "s" : ""})`);
    // Print the individual messages indented
    for (const msg of result.messages) {
      const severity = msg.severity === 2 ? "\x1b[31merror\x1b[0m" : "\x1b[33mwarn\x1b[0m ";
      console.log(`       ${severity}  line ${msg.line}:${msg.column}  ${msg.message}  \x1b[90m(${msg.ruleId})\x1b[0m`);
    }
  }

  errorCount   += errors;
  warningCount += warns;
}

console.log("");
if (errorCount === 0 && warningCount === 0) {
  console.log(`\x1b[32m✓ Lint passed\x1b[0m  — ${files.length} files checked, no issues found`);
} else if (errorCount === 0) {
  console.log(`\x1b[33m⚠ Lint passed with warnings\x1b[0m  — ${warningCount} warning${warningCount > 1 ? "s" : ""}`);
  process.exit(0);
} else {
  console.log(`\x1b[31m✗ Lint failed\x1b[0m  — ${errorCount} error${errorCount > 1 ? "s" : ""}, ${warningCount} warning${warningCount > 1 ? "s" : ""}`);
  process.exit(1);
}
