const BD_MOBILE_RE = /^01[3-9]\d{8}$/;

export function isValidBdMobile(phone: string): boolean {
  return BD_MOBILE_RE.test(phone);
}
