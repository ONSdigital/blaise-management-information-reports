/**
 * Normalizes and validates a URL from an environment variable.
 * @param envVarName - The name of the environment variable
 * @param defaultValue - Optional default value if env var is not set
 * @param defaultProtocol - The protocol to use if not present in the URL (default: 'https')
 * @returns The normalized and validated URL
 * @throws Error if the URL is invalid or required env var is missing
 */
export function normalizeUrl(
    envVarName: string,
    defaultValue?: string,
    defaultProtocol: 'http' | 'https' = 'https',
): string {
    const rawValue = (process.env[envVarName] ?? defaultValue)?.trim();

    if (!rawValue) {
        throw new Error(
            `${envVarName} environment variable is required and must not be empty`,
        );
    }

    const protocol = `${defaultProtocol}://`;
    const normalized = /^https?:\/\//i.test(rawValue) ? rawValue : `${protocol}${rawValue}`;

    try {
        return new URL(normalized).toString();
    } catch {
        throw new Error(
            `${envVarName} is invalid. Received "${rawValue}". Provide a full URL, for example "${protocol}localhost".`,
        );
    }
}
