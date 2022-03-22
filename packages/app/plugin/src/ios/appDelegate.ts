import { ConfigPlugin, IOSConfig, WarningAggregator, withDangerousMod } from '@expo/config-plugins';
import { mergeContents } from '@expo/config-plugins/build/utils/generateCode';
import fs from 'fs';

const methodInvocationBlock = `[FIRApp configure];`;
// https://regex101.com/r/mPgaq6/1
const methodInvocationLineMatcher =
  /(?:(self\.|_)(\w+)\s?=\s?\[\[UMModuleRegistryAdapter alloc\])|(?:RCTBridge\s?\*\s?(\w+)\s?=\s?\[(\[RCTBridge alloc\]|self\.reactDelegate))/g;

// https://regex101.com/r/nHrTa9/1/
// if the above regex fails, we can use this one as a fallback:
const fallbackInvocationLineMatcher =
  /-\s*\(BOOL\)\s*application:\s*\(UIApplication\s*\*\s*\)\s*\w+\s+didFinishLaunchingWithOptions:/g;

export function modifyObjcAppDelegate(contents: string): string {
  // Add import
  if (!contents.includes('@import Firebase;')) {
    contents = contents.replace(
      /#import "AppDelegate.h"/g,
      `#import "AppDelegate.h"
@import Firebase;`,
    );
  }

  // To avoid potential issues with existing changes from older plugin versions
  if (contents.includes(methodInvocationBlock)) {
    return contents;
  }

  if (
    !methodInvocationLineMatcher.test(contents) &&
    !fallbackInvocationLineMatcher.test(contents)
  ) {
    WarningAggregator.addWarningIOS(
      '@topher_pedersen/app',
      'Unable to determine correct Firebase insertion point in AppDelegate.m. Skipping Firebase addition.',
    );
    return contents;
  }

  // Add invocation
  try {
    return mergeContents({
      tag: '@topher_pedersen/app-didFinishLaunchingWithOptions',
      src: contents,
      newSrc: methodInvocationBlock,
      anchor: methodInvocationLineMatcher,
      offset: 0, // new line will be inserted right above matched anchor
      comment: '//',
    }).contents;
  } catch (e: any) {
    // tests if the opening `{` is in the new line
    const multilineMatcher = new RegExp(fallbackInvocationLineMatcher.source + '.+\\n*{');
    const isHeaderMultiline = multilineMatcher.test(contents);

    // we fallback to another regex if the first one fails
    return mergeContents({
      tag: '@topher_pedersen/app-didFinishLaunchingWithOptions-fallback',
      src: contents,
      newSrc: methodInvocationBlock,
      anchor: fallbackInvocationLineMatcher,
      // new line will be inserted right below matched anchor
      // or two lines, if the `{` is in the new line
      offset: isHeaderMultiline ? 2 : 1,
      comment: '//',
    }).contents;
  }
}

export const withFirebaseAppDelegate: ConfigPlugin = config => {
  return withDangerousMod(config, [
    'ios',
    async config => {
      const fileInfo = IOSConfig.Paths.getAppDelegate(config.modRequest.projectRoot);
      let contents = await fs.promises.readFile(fileInfo.path, 'utf-8');
      if (fileInfo.language === 'objc') {
        contents = modifyObjcAppDelegate(contents);
      } else {
        // TODO: Support Swift
        throw new Error(
          `Cannot add Firebase code to AppDelegate of language "${fileInfo.language}"`,
        );
      }
      await fs.promises.writeFile(fileInfo.path, contents);

      return config;
    },
  ]);
};
