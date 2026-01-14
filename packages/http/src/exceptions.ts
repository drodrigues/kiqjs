export class KiqError extends Error {
  constructor(public messages: string | string[], public status: number) {
    const arrayMessages = typeof messages == 'string' ? [messages] : messages;
    super(arrayMessages.join(', '));
    this.messages = arrayMessages;
    this.status = status;
  }
}

export const BadRequest = (messages: string | string[]) => new KiqError(messages, 400);

export const Unauthorized = (messages: string | string[]) => new KiqError(messages, 401);

export const PaymentRequired = (messages: string | string[]) => new KiqError(messages, 402);

export const Forbidden = (messages: string | string[]) => new KiqError(messages, 403);

export const NotFound = (messages: string | string[]) => new KiqError(messages, 404);

export const MethodNotAllowed = (messages: string | string[]) => new KiqError(messages, 405);

export const NotAcceptable = (messages: string | string[]) => new KiqError(messages, 406);

export const ProxyAuthenticationRequired = (messages: string | string[]) =>
  new KiqError(messages, 407);

export const RequestTimeout = (messages: string | string[]) => new KiqError(messages, 408);

export const Conflict = (messages: string | string[]) => new KiqError(messages, 409);

export const Gone = (messages: string | string[]) => new KiqError(messages, 410);

export const LengthRequired = (messages: string | string[]) => new KiqError(messages, 411);

export const PreconditionFailed = (messages: string | string[]) => new KiqError(messages, 412);

export const PayloadTooLarge = (messages: string | string[]) => new KiqError(messages, 413);

export const URITooLong = (messages: string | string[]) => new KiqError(messages, 414);

export const UnsupportedMediaType = (messages: string | string[]) => new KiqError(messages, 415);

export const RangeNotSatisfiable = (messages: string | string[]) => new KiqError(messages, 416);

export const ExpectationFailed = (messages: string | string[]) => new KiqError(messages, 417);

export const ImATeapot = (messages: string | string[]) => new KiqError(messages, 418);

export const MisdirectedRequest = (messages: string | string[]) => new KiqError(messages, 421);

export const UnprocessableEntity = (messages: string | string[]) => new KiqError(messages, 422);

export const Locked = (messages: string | string[]) => new KiqError(messages, 423);

export const FailedDependency = (messages: string | string[]) => new KiqError(messages, 424);

export const TooEarly = (messages: string | string[]) => new KiqError(messages, 425);

export const UpgradeRequired = (messages: string | string[]) => new KiqError(messages, 426);

export const PreconditionRequired = (messages: string | string[]) => new KiqError(messages, 428);

export const TooManyRequests = (messages: string | string[]) => new KiqError(messages, 429);

export const RequestHeaderFieldsTooLarge = (messages: string | string[]) =>
  new KiqError(messages, 431);

export const UnavailableForLegalReasons = (messages: string | string[]) =>
  new KiqError(messages, 451);

export const InvalidToken = (messages: string | string[]) => new KiqError(messages, 403);

export const TokenRequired = (messages: string | string[]) => new KiqError(messages, 499);

export const ServerError = (messages: string | string[]) => new KiqError(messages, 500);

export const NotImplemented = (messages: string | string[]) => new KiqError(messages, 501);
