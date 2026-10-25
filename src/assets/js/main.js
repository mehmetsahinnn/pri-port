// Entry point. Each concern lives in its own module under ./modules.
import { initUi } from './modules/ui.js';
import { initTheme } from './modules/theme.js';
import { initI18n } from './modules/i18n.js';
import { initAdmin } from './modules/admin.js';

initUi();
initTheme();
initI18n();
initAdmin();
