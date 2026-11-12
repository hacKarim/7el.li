## What this changes

<!-- One or two sentences. What was wrong, what is different now. -->

## How it was checked

<!-- What you ran. "It builds" is not checking. -->

- [ ] `npx prettier@3.3.3 --check .` passes
- [ ] Ran locally against a real database

## If this touches the schema

- [ ] New migration, no edits to existing ones
- [ ] Stated what happens to rows that already exist

## If this touches money

- [ ] The arithmetic is in the description, with an example order
- [ ] Checked what happens when the payment provider callback never arrives
