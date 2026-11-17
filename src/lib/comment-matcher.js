/**
 * Comment Matcher and Template Renderer
 * Pure functional utilities for Instagram comment trigger matching and DM message generation.
 */

export const DEFAULT_PUBLIC_REPLIES = [
  "Check your DMs! 📩",
  "Sent you the direct link in your DMs ✨",
  "Just sent you the details! Check your message requests 🚀",
];

/**
 * Normalizes text for matching by lowercasing, removing emojis, punctuation,
 * and collapsing whitespace.
 */
export function normalizeText(text = "") {
  return String(text || "")
    .toLowerCase()
    // Remove emojis and miscellaneous symbols
    .replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ""
    )
    // Replace punctuation with spaces
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, " ")
    // Collapse whitespace
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Checks if a comment matches a Reel's trigger configuration.
 *
 * @param {string} commentText - Raw comment string from user
 * @param {Object} triggerConfig - Configuration object
 * @param {string[]} [triggerConfig.triggerKeywords] - List of trigger keywords (e.g. ['LINK', 'PRICE'])
 * @param {string} [triggerConfig.triggerKeyword] - Fallback single keyword
 * @param {'contains'|'exact'|'any'} [triggerConfig.matchType='contains'] - Matching mode
 * @returns {{ matched: boolean, matchedKeyword: string | null }}
 */
export function matchComment(commentText = "", triggerConfig = {}) {
  const { matchType = "contains" } = triggerConfig;

  // "any": Every comment triggers the DM (as long as it is not empty)
  if (matchType === "any") {
    const isNotEmpty = String(commentText || "").trim().length > 0;
    return {
      matched: isNotEmpty,
      matchedKeyword: isNotEmpty ? "ANY_COMMENT" : null,
    };
  }

  const cleanComment = normalizeText(commentText);
  if (!cleanComment) {
    return { matched: false, matchedKeyword: null };
  }

  // Gather keywords from array or single fallback
  const rawKeywords = Array.isArray(triggerConfig.triggerKeywords) && triggerConfig.triggerKeywords.length > 0
    ? triggerConfig.triggerKeywords
    : triggerConfig.triggerKeyword
    ? [triggerConfig.triggerKeyword]
    : [];

  const validKeywords = rawKeywords
    .map((k) => normalizeText(k))
    .filter(Boolean);

  if (validKeywords.length === 0) {
    return { matched: false, matchedKeyword: null };
  }

  const commentWords = cleanComment.split(" ").filter(Boolean);

  for (const keyword of validKeywords) {
    if (matchType === "exact") {
      // Entire comment must equal the keyword (after punctuation & emoji strip)
      if (cleanComment === keyword) {
        return { matched: true, matchedKeyword: keyword.toUpperCase() };
      }
    } else {
      // "contains" mode: matches if the keyword appears as a standalone word OR inside the text
      if (commentWords.includes(keyword) || cleanComment.includes(keyword)) {
        return { matched: true, matchedKeyword: keyword.toUpperCase() };
      }
    }
  }

  return { matched: false, matchedKeyword: null };
}

/**
 * Renders a message template by substituting variable tokens:
 * {{username}}, {{product_name}}, {{product_price}}, {{product_url}}
 *
 * @param {string} template - Raw message template string
 * @param {Object} variables - Dictionary of variable values
 * @returns {string} - Rendered string
 */
export function renderTemplate(template = "", variables = {}) {
  const {
    username = "shopper",
    product_name = "Product",
    product_price = "₹999",
    product_url = "https://urbanstyle.in",
  } = variables;

  const formattedUsername = username.startsWith("@") ? username : `@${username}`;

  return String(template || "")
    .replace(/\{\{username\}\}/g, formattedUsername)
    .replace(/\{\{product_name\}\}/g, product_name)
    .replace(/\{\{product_price\}\}/g, product_price)
    .replace(/\{\{product_url\}\}/g, product_url);
}
