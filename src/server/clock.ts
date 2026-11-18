let override: (() => Date) | undefined;
export const now = (): Date => (override ? override() : new Date());
/** Tests only. */
export function setClockForTests(fn: (() => Date) | undefined) {
  override = fn;
}
