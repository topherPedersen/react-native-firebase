import { ConfigPlugin, withPlugins, createRunOncePlugin } from '@expo/config-plugins';

import { withApplyPerfPlugin, withBuildscriptDependency } from './android';

/**
 * A config plugin for configuring `@topher_pedersen/perf`
 */
const withRnFirebasePerf: ConfigPlugin = config => {
  return withPlugins(config, [withBuildscriptDependency, withApplyPerfPlugin]);
};

const pak = require('@topher_pedersen/perf/package.json');
export default createRunOncePlugin(withRnFirebasePerf, pak.name, pak.version);
