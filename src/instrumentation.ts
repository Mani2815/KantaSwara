export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Dynamically import to ensure it only runs on the Node.js server side
    const { initializeWorkers } = await import('@server/lib/queue/index');
    await initializeWorkers();

    const { validateProviderCredentials } = await import('@server/services/providers/validator.service');
    // We don't await this so it doesn't block startup, but it will log errors asynchronously
    validateProviderCredentials().catch(console.error);
  }
}
