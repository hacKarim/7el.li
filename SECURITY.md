# Security policy

This app handles payments, file delivery behind a paywall, and session auth,
so a bug in any of those three is worth reporting privately rather than in a
public issue.

## Reporting a vulnerability

Open a private security advisory through the Security tab. Things that matter
most here:

- Anything that serves a locked file to someone who has not paid.
- Anything that lets an order be marked paid without a valid provider
  callback, or that accepts a callback without verifying it.
- Session fixation, or a path that leaks another seller's data.
- An amount that can be changed between the order being created and the
  payment being taken.

Please include the request you sent and what came back. A proof of concept
against a local instance is better than one against the live site.

## What is not a vulnerability

- A missing security header that does not lead anywhere.
- Rate limiting on an endpoint that costs nothing to call.
- Anything that needs the seller's own password to start.

## Secrets

Do not test against the live site with real cards. If you find a credential in
the repository or in the history, report it privately and do not use it.

I will acknowledge within a week.

## Supported versions

Whatever is deployed from `main`.
