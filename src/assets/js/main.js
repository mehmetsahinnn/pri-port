// Entry point. Each concern lives in its own module under ./modules.
import { initUi } from './modules/ui.js?v=20261026';
import { initTheme } from './modules/theme.js?v=20261026';
import { initI18n } from './modules/i18n.js?v=20261026';
import { initAdmin } from './modules/admin.js?v=20261026';
import { initQualifications } from './modules/qualifications.js?v=20261026';

initUi();
initTheme();
initI18n();
initAdmin();
initQualifications();
