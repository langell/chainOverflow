declare module '@x402/express' {
  import { Request, Response, NextFunction } from 'express'

  export interface RouteConfig {
    price: string | { amount: string; decimals?: number; symbol?: string }
    payTo: string
    network: string
    scheme?: string
  }

  export class x402ResourceServer {
    constructor(facilitatorClients: any[])
    register(network: string, scheme: any): void
  }

  export function paymentMiddleware(
    routes: Record<string, RouteConfig | string>,
    server: x402ResourceServer,
    paywallConfig?: any,
    paywall?: any,
    syncFacilitatorOnStart?: boolean
  ): (req: Request, res: Response, next: NextFunction) => Promise<void>

  export function paymentMiddlewareFromConfig(
    routes: Record<string, RouteConfig | string>,
    facilitatorClients: any[],
    schemes: Array<{ network: string; server: any }>,
    paywallConfig?: any,
    paywall?: any,
    syncFacilitatorOnStart?: boolean
  ): (req: Request, res: Response, next: NextFunction) => Promise<void>
}
