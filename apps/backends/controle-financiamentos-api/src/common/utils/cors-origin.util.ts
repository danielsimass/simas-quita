type CorsOriginCallback = (error: Error | null, allow?: boolean | string) => void;

type CreateCorsOriginValidatorInput = {
  allowedDomain: string;
  extraOrigins: string[];
  production: boolean;
};

function isAllowedDomainHostname(hostname: string, allowedDomain: string): boolean {
  return hostname === allowedDomain || hostname.endsWith(`.${allowedDomain}`);
}

export function isAllowedCorsOrigin(
  origin: string,
  input: Pick<CreateCorsOriginValidatorInput, 'allowedDomain' | 'production'>,
): boolean {
  try {
    const url = new URL(origin);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }

    if (input.production && url.protocol !== 'https:') {
      return false;
    }

    return isAllowedDomainHostname(url.hostname, input.allowedDomain);
  } catch {
    return false;
  }
}

export function createCorsOriginValidator(
  input: CreateCorsOriginValidatorInput,
): (origin: string | undefined, callback: CorsOriginCallback) => void {
  const extraOrigins = new Set(input.extraOrigins.filter(Boolean));

  return (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (extraOrigins.has(origin)) {
      callback(null, origin);
      return;
    }

    if (isAllowedCorsOrigin(origin, input)) {
      callback(null, origin);
      return;
    }

    callback(new Error(`Origin ${origin} not allowed by CORS`));
  };
}
