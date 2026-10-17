# Rule: No Browser Checking

DO NOT use `browser_subagent` or browser automation/inspection tools to test or verify changes.
The user prefers to test and verify all visual, UI, and interactive changes directly in their own browser.

When completing tasks:
1. Make the requested code changes directly.
2. Validate using static type checks (`npx tsc --noEmit`) or code analysis if necessary.
3. Finish the turn and inform the user without launching or checking the browser.
