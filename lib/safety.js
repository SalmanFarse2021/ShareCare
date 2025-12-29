/**
 * Secure Communication Safety Filters
 * Blocks Phone Numbers, Emails, and Links to prevent platform leakage and protects privacy.
 */

export const SAFETY_PATTERNS = {
    // Broad email regex
    email: /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/gi,

    // Phone: Matches various formats like +1-555-555-5555, (555) 555-5555, 555 555 5555
    // Requires at least 7 digits to prevent false positives on item quantities
    phone: /(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?/g,

    // Simpler aggressive phone check for digits > 9 in sequence (with spaces/dashes)
    phoneAggressive: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,

    // Links: http, https, www, .com, .net, .org, social handles
    links: /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(\b\w+\.(com|net|org|io|me)\b)/gi,

    // Social Keywords
    socials: /\b(whatsapp|telegram|instagram|facebook|twitter|tiktok|snapchat)\b/gi
};

export function checkMessageSafety(text) {
    const violations = [];

    if (SAFETY_PATTERNS.email.test(text)) violations.push("Email Address");
    if (SAFETY_PATTERNS.phoneAggressive.test(text)) violations.push("Phone Number");
    if (SAFETY_PATTERNS.links.test(text)) violations.push("External Link");
    // if (SAFETY_PATTERNS.socials.test(text)) violations.push("Social Platform Reference");

    const isSafe = violations.length === 0;

    return {
        isSafe,
        violations,
        reason: isSafe ? null : `Message blocked: Contains hidden ${violations.join(', ')}.`
    };
}
