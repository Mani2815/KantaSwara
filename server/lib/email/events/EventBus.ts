// =============================================================================
// KantaSwara — Email Event Bus
// =============================================================================
// Simple pub/sub bus for email events.
// Business modules emit events; handlers send emails.
// Replace with BullMQ/RabbitMQ worker by changing the emit() implementation.

import type { EmailEventMap, EmailEventName, EmailEventPayload } from '../types';

type EventHandler<T extends EmailEventName> = (
  payload: EmailEventPayload<T>
) => Promise<void>;

type AnyHandler = (payload: unknown) => Promise<void>;

export class EmailEventBus {
  private handlers: Map<string, AnyHandler[]> = new Map();

  /**
   * Register a handler for an email event.
   */
  on<T extends EmailEventName>(event: T, handler: EventHandler<T>): void {
    const existing = this.handlers.get(event) ?? [];
    existing.push(handler as AnyHandler);
    this.handlers.set(event, existing);
  }

  /**
   * Emit an event. All registered handlers run async but errors are caught
   * and logged so one failing handler doesn't block the others.
   */
  async emit<T extends EmailEventName>(
    event: T,
    payload: EmailEventPayload<T>
  ): Promise<void> {
    const eventHandlers = this.handlers.get(event);
    if (!eventHandlers || eventHandlers.length === 0) {
      // No handlers registered — log in development
      if (process.env.NODE_ENV === 'development') {
        console.debug(`[EmailEventBus] No handlers for event: ${event}`);
      }
      return;
    }

    await Promise.allSettled(
      eventHandlers.map(async (handler) => {
        try {
          await handler(payload);
        } catch (err) {
          console.error(
            `[EmailEventBus] Handler for "${event}" threw an error:`,
            err
          );
        }
      })
    );
  }

  /**
   * Remove all handlers (useful for testing).
   */
  clear(): void {
    this.handlers.clear();
  }
}
