/**
 * Registering a value with the Actions runner so it is masked in logs.
 *
 * Without this a signing key echoed back by a tool, or included in an error
 * message, would land in the workflow log in clear text.
 */

/** Writes the register-command workflow line GitHub uses to mask a value. */
export function setSecret(value: string): void {
  if (!value) return;
  process.stdout.write(`::add-mask::${value}\n`);
}
