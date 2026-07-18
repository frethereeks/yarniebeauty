/**
 * Shared email shell — gold/black branding, table-based layout for maximum
 * email client compatibility (Outlook still needs tables, not flexbox).
 */
export function emailShell(opts: {
  preheader?: string;
  heading: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): string {
  const { preheader = "", heading, bodyHtml, ctaLabel, ctaUrl } = opts;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${heading}</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF6EE;font-family:Georgia,'Times New Roman',serif;">
  <span style="display:none;font-size:1px;color:#FAF6EE;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF6EE;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#FFFFFF;border:1px solid #E3D9C4;">
          <tr>
            <td style="background-color:#171411;padding:28px 32px;text-align:center;">
              <span style="font-family:Georgia,serif;font-size:22px;font-weight:600;letter-spacing:0.08em;color:#E3C567;">YARNIEBEAUTY</span>
            </td>
          </tr>
          <tr>
            <td style="padding:4px 0;background-color:#C9A227;height:3px;line-height:3px;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:36px 32px 12px;">
              <h1 style="font-family:Georgia,serif;font-size:24px;font-weight:600;color:#171411;margin:0 0 16px;">${heading}</h1>
              <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.6;color:#3D3530;">
                ${bodyHtml}
              </div>
              ${
                ctaLabel && ctaUrl
                  ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
                      <tr>
                        <td style="background-color:#171411;border-radius:2px;">
                          <a href="${ctaUrl}" style="display:inline-block;padding:14px 28px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:600;letter-spacing:0.04em;color:#E3C567;text-decoration:none;">${ctaLabel}</a>
                        </td>
                      </tr>
                    </table>`
                  : ""
              }
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 32px;border-top:1px solid #E3D9C4;">
              <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#A89A85;margin:0;">
                Yarniebeauty — handcrafted yarn &amp; crochet, made with care.<br/>
                You're receiving this because you have an account with us. Manage your notification preferences from your dashboard settings.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
