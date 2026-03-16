import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const ResendService = {
  /**
   * Send a welcome email to a new explorer
   */
  sendWelcomeEmail: async (email: string, displayName: string) => {
    try {
      const { data, error } = await resend.emails.send({
        from: 'Wandra <onboarding@resend.dev>',
        to: [email],
        subject: 'Welcome to Wandra, ' + displayName + '!',
        html: `
          <h1>Welcome to Wandra</h1>
          <p>Hi ${displayName},</p>
          <p>Your journey is just beginning. Wandra is ready to help you capture every moment, the weather, and the essence of your adventures.</p>
          <p>Get out there and start exploring!</p>
          <p>Best,<br/>The Wandra Team</p>
        `,
      });

      if (error) {
        console.error('RESEND_ERROR:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('RESEND_EXCEPTION:', error);
      return { success: false, error };
    }
  },

  /**
   * Send a journey summary after completion
   */
  sendJourneySummary: async (email: string, journeyTitle: string, journalPreview: string) => {
    try {
      const { data, error } = await resend.emails.send({
        from: 'Wandra <journeys@resend.dev>',
        to: [email],
        subject: `Your adventure: ${journeyTitle}`,
        html: `
          <h1>Your Adventure Summary</h1>
          <p>You've returned from a beautiful journey!</p>
          <blockquote>${journalPreview}...</blockquote>
          <p>View the full story in your Wandra Library.</p>
        `,
      });

      if (error) {
        console.error('RESEND_ERROR:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('RESEND_EXCEPTION:', error);
      return { success: false, error };
    }
  },
};
