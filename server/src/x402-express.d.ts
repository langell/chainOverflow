declare module '@x402/express' {
  import { Request, Response, NextFunction } from 'express'
  import { Chain } from 'viem'

  export interface PaymentMiddlewareOptions {
    payTo: string
    price: string
    chain: Chain
    token?: string
    facilitator?: any
  }

  export class PaymentError extends Error {}

  export function paymentMiddleware(
    options: PaymentMiddlewareOptions
  ): (req: Request, res: Response, next: NextFunction) => Promise<void>
}
