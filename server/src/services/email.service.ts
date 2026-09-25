export const sendVerificationEmail = async (email: string, name: string, token: string, verificationUrl: string) => {
  console.log(`[Email Service] Sending verification email to ${name} <${email}>`);
  console.log(`[Email Service] URL: ${verificationUrl}`);
};

export const sendPasswordResetEmail = async (email: string, name: string, token: string, resetUrl: string) => {
  console.log(`[Email Service] Sending password reset email to ${name} <${email}>`);
  console.log(`[Email Service] URL: ${resetUrl}`);
};
