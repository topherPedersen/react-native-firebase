import { ConfigPlugin, withPlugins, createRunOncePlugin } from '@expo/config-plugins';

import { withApplyCrashlyticsPlugin, withBuildscriptDependency } from './android';

/**
 * A config plugin for configuring `@topher_pedersen/crashlytics`
 */
const withRnFirebaseCrashlytics: ConfigPlugin = config => {
  return withPlugins(config, [withBuildscriptDependency, withApplyCrashlyticsPlugin]);
};

const pak = require('@topher_pedersen/crashlytics/package.json');
export default createRunOncePlugin(withRnFirebaseCrashlytics, pak.name, pak.version);
