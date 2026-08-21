# Email Development Mode (Gmail SMTP)

During development, Resend restricts sending emails to non-verified addresses. To work around this and test emails locally without domain verification, you can switch the email provider to **Gmail SMTP**.

## How to Switch to Gmail SMTP

1. **Create an App Password in your Google Account**
   - Go to your [Google Account Manage page](https://myaccount.google.com/).
   - Navigate to **Security** > **2-Step Verification**.
   - Scroll down to **App passwords**.
   - Create a new app password (e.g., name it "KantaSwara Dev").
   - Copy the 16-character password generated.

2. **Update your `.env.local`**
   - Set the email provider to `gmail`.
   - Provide your Gmail address and the app password.

   ```env
   # Set the provider to gmail for development
   EMAIL_PROVIDER=gmail

   # Your Gmail credentials
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx
   ```

3. **Restart the Server**
   - The application will now use the `GmailSMTPProvider` for all outgoing emails.
   - The "from" address will automatically be set to `KantaSwara <your-email@gmail.com>`.

## Switching back to Production (Resend)

To test production behavior or when deploying, simply switch the provider back to `resend` and ensure your `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are properly configured.

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=KantaSwara <noreply@kantaswara.com>
```

## Troubleshooting

- **Authentication Failed**: Ensure you have 2-Step Verification enabled on your Google account and are using an App Password, not your actual Google password.
- **Connection Timeout**: Gmail SMTP operates on port `465`. Ensure your firewall isn't blocking outbound connections on this port.
- **Provider Not Switching**: Verify that `EMAIL_PROVIDER` is set exactly to `gmail` or `resend` in your `.env.local` and that you restarted your dev server.
