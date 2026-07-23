export const PAYMENT_METHODS = {
  CASH: 'cash',
  REK: 'rek',
} as const;

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];
