// =============================================================================
// KantaSwara — Email Event Bus Index
// Registers all handlers and exports the singleton bus.
// =============================================================================

import { EmailEventBus } from './EventBus';
import { registerAuthHandlers } from './handlers/auth.handlers';
import { registerOrganizationHandlers } from './handlers/organization.handlers';
import { registerBillingHandlers } from './handlers/billing.handlers';
import { registerDeliveryHandlers } from './handlers/delivery.handlers';
import { registerSecurityHandlers } from './handlers/security.handlers';
import { registerNotificationHandlers } from './handlers/notification.handlers';
import { registerAiBuilderHandlers } from './handlers/aiBuilder.handlers';
import { registerDemoHandlers } from './handlers/demo.handlers';
import { registerSupportHandlers } from './handlers/support.handlers';

// Singleton event bus
const emailEventBus = new EmailEventBus();

// Register all domain handlers
registerAuthHandlers(emailEventBus);
registerOrganizationHandlers(emailEventBus);
registerBillingHandlers(emailEventBus);
registerDeliveryHandlers(emailEventBus);
registerSecurityHandlers(emailEventBus);
registerNotificationHandlers(emailEventBus);
registerAiBuilderHandlers(emailEventBus);
registerDemoHandlers(emailEventBus);
registerSupportHandlers(emailEventBus);

export { emailEventBus };
export type { EmailEventBus };
