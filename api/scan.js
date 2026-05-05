export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const response = await fetch(url);
    const html = await response.text();

    const violations = [];

    // Check 1: Images missing alt text
    const imgMatches = html.match(/<img[^>]*>/gi) || [];
    const imgsWithoutAlt = imgMatches.filter(img => !img.includes('alt='));
    if (imgsWithoutAlt.length > 0) {
      violations.push({
        id: 'image-alt',
        impact: 'critical',
        description: 'Images must have alternate text',
        help: 'Add an alt attribute to all <img> tags',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content',
        count: imgsWithoutAlt.length
      });
    }

    // Check 2: Missing page language
    if (!html.match(/<html[^>]*lang=/i)) {
      violations.push({
        id: 'html-lang',
        impact: 'serious',
        description: 'Page language not declared',
        help: 'Add a lang attribute to the <html> element (e.g. lang="en")',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/language-of-page',
        count: 1
      });
    }

    // Check 3: Missing page title
    if (!html.match(/<title[^>]*>[^<]+<\/title>/i)) {
      violations.push({
        id: 'document-title',
        impact: 'serious',
        description: 'Page is missing a title',
        help: 'Add a descriptive <title> tag inside <head>',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/page-titled',
        count: 1
      });
    }

    // Check 4: Form inputs missing labels
    const inputMatches = html.match(/<input[^>]*>/gi) || [];
    const inputsWithoutLabel = inputMatches.filter(input =>
      !input.includes('type="hidden"') &&
      !input.includes('type="submit"') &&
      !input.includes('type="button"') &&
      !input.includes('aria-label=') &&
      !input.includes('aria-labelledby=')
    );
    if (inputsWithoutLabel.length > 0) {
      violations.push({
        id: 'label',
        impact: 'critical',
        description: 'Form inputs are missing labels',
        help: 'Add <label> elements or aria-label attributes to all form inputs',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions',
        count: inputsWithoutLabel.length
      });
    }

    // Check 5: Empty links
    const linkMatches = html.match(/<a[^>]*>[\s]*<\/a>/gi) || [];
    if (linkMatches.length > 0) {
      violations.push({
        id: 'link-name',
        impact: 'serious',
        description: 'Links do not have discernible text',
        help: 'Add descriptive text inside all <a> tags',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context',
        count: linkMatches.length
      });
    }

    // Check 6: Missing meta viewport
    if (!html.match(/<meta[^>]*name=["']viewport["'][^>]*>/i)) {
      violations.push({
        id: 'meta-viewport',
        impact: 'serious',
        description: 'Missing or misconfigured viewport meta tag',
        help: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/reflow',
        count: 1
      });
    }

    // Check 7: Heading hierarchy
    const hasH1 = html.match(/<h1[^>]*>/i);
    if (!hasH1) {
      violations.push({
        id: 'heading-order',
        impact: 'moderate',
        description: 'Page is missing an H1 heading',
        help: 'Add a single H1 heading that describes the main content of the page',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships',
        count: 1
      });
    }

    // Check 8: iframes missing title
    const iframeMatches = html.match(/<iframe[^>]*>/gi) || [];
    const iframesWithoutTitle = iframeMatches.filter(iframe => !iframe.includes('title='));
    if (iframesWithoutTitle.length > 0) {
      violations.push({
        id: 'frame-title',
        impact: 'serious',
        description: 'Iframes are missing title attributes',
        help: 'Add a title attribute to all <iframe> elements',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks',
        count: iframesWithoutTitle.length
      });
    }

    // Check 9: Buttons missing accessible text
    const buttonMatches = html.match(/<button[^>]*>[\s]*<\/button>/gi) || [];
    if (buttonMatches.length > 0) {
      violations.push({
        id: 'button-name',
        impact: 'critical',
        description: 'Buttons do not have accessible names',
        help: 'Add descriptive text or aria-label to all <button> elements',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value',
        count: buttonMatches.length
      });
    }

    // Check 10: Missing skip navigation link
    if (!html.match(/skip.*nav|skip.*content|skip.*main/i)) {
      violations.push({
        id: 'skip-link',
        impact: 'moderate',
        description: 'No skip navigation link found',
        help: 'Add a "Skip to main content" link as the first focusable element',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks',
        count: 1
      });
    }

    const report = {
      url,
      scannedAt: new Date().toISOString(),
      summary: {
        totalViolations: violations.length,
        critical: violations.filter(v => v.impact === 'critical').length,
        serious: violations.filter(v => v.impact === 'serious').length,
        moderate: violations.filter(v => v.impact === 'moderate').length,
      },
      violations
    };

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to scan URL: ' + error.message });
  }
}
