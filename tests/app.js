/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import '@topher_pedersen/analytics';
import firebase from '@topher_pedersen/app';
import NativeEventEmitter from '@topher_pedersen/app/lib/internal/RNFBNativeEventEmitter';
import '@topher_pedersen/app/lib/utils';
import '@topher_pedersen/app-check';
import '@topher_pedersen/app-distribution';
import '@topher_pedersen/auth';
import '@topher_pedersen/crashlytics';
import '@topher_pedersen/database';
import '@topher_pedersen/dynamic-links';
import '@topher_pedersen/firestore';
import '@topher_pedersen/functions';
import '@topher_pedersen/in-app-messaging';
import '@topher_pedersen/installations';
import '@topher_pedersen/messaging';
import '@topher_pedersen/ml';
import '@topher_pedersen/perf';
import '@topher_pedersen/remote-config';
import '@topher_pedersen/storage';
import jet from 'jet/platform/react-native';
import React from 'react';
import { AppRegistry, Button, NativeModules, Text, View } from 'react-native';
import { Platform } from 'react-native';

jet.exposeContextProperty('NativeModules', NativeModules);
jet.exposeContextProperty('NativeEventEmitter', NativeEventEmitter);
jet.exposeContextProperty('module', firebase);

// Database emulator cannot handle App Check on Android yet
// https://github.com/firebase/firebase-tools/issues/3663
if (Platform.OS === 'ios') {
  firebase.database().useEmulator('localhost', 9000);
}
firebase.auth().useEmulator('http://localhost:9099');
firebase.firestore().useEmulator('localhost', 8080);
firebase.storage().useEmulator('localhost', 9199);
firebase.functions().useFunctionsEmulator('http://localhost:5001');

function Root() {
  return (
    <View
      testID="welcome"
      style={{ flex: 1, paddingTop: 20, justifyContent: 'center', alignItems: 'center' }}
    >
      <Text style={{ fontSize: 25, marginBottom: 30 }}>React Native Firebase</Text>
      <Text style={{ fontSize: 25, marginBottom: 30 }}>End-to-End Testing App</Text>
      <Button
        style={{ flex: 1, marginTop: 20 }}
        title={'Test Native Crash Now.'}
        onPress={() => {
          firebase.crashlytics().crash();
        }}
      />
      <View testId="spacer" style={{ height: 20 }} />
      <Button
        style={{ flex: 1, marginTop: 20 }}
        title={'Test Javascript Crash Now.'}
        onPress={() => {
          undefinedVariable.notAFunction();
        }}
      />
    </View>
  );
}

AppRegistry.registerComponent('testing', () => Root);
