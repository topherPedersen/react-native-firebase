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

import { isAndroid, isNumber } from '@topher_pedersen/app/lib/common';
import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@topher_pedersen/app/lib/internal';
import HttpsError from './HttpsError';
import version from './version';

const namespace = 'functions';
const nativeModuleName = 'RNFBFunctionsModule';

// import { HttpsErrorCode } from '@topher_pedersen/functions';
export const HttpsErrorCode = {
  OK: 'ok',
  CANCELLED: 'cancelled',
  UNKNOWN: 'unknown',
  INVALID_ARGUMENT: 'invalid-argument',
  DEADLINE_EXCEEDED: 'deadline-exceeded',
  NOT_FOUND: 'not-found',
  ALREADY_EXISTS: 'already-exists',
  PERMISSION_DENIED: 'permission-denied',
  UNAUTHENTICATED: 'unauthenticated',
  RESOURCE_EXHAUSTED: 'resource-exhausted',
  FAILED_PRECONDITION: 'failed-precondition',
  ABORTED: 'aborted',
  OUT_OF_RANGE: 'out-of-range',
  UNIMPLEMENTED: 'unimplemented',
  INTERNAL: 'internal',
  UNAVAILABLE: 'unavailable',
  DATA_LOSS: 'data-loss',
};

const statics = {
  HttpsErrorCode,
};

class FirebaseFunctionsModule extends FirebaseModule {
  constructor(...args) {
    super(...args);
    this._customUrlOrRegion = this._customUrlOrRegion || 'us-central1';
    this._useFunctionsEmulatorHost = null;
    this._useFunctionsEmulatorPort = -1;
  }

  httpsCallable(name, options = {}) {
    if (options.timeout) {
      if (isNumber(options.timeout)) {
        options.timeout = options.timeout / 1000;
      } else {
        throw new Error('HttpsCallableOptions.timeout expected a Number in milliseconds');
      }
    }

    return data => {
      const nativePromise = this.native.httpsCallable(
        this._useFunctionsEmulatorHost,
        this._useFunctionsEmulatorPort,
        name,
        {
          data,
        },
        options,
      );
      return nativePromise.catch(nativeError => {
        const { code, message, details } = nativeError.userInfo || {};
        return Promise.reject(
          new HttpsError(
            HttpsErrorCode[code] || HttpsErrorCode.UNKNOWN,
            message || nativeError.message,
            details || null,
            nativeError,
          ),
        );
      });
    };
  }

  useFunctionsEmulator(origin) {
    [_, host, port] = /https?\:.*\/\/([^:]+):?(\d+)?/.exec(origin);
    if (!port) {
      port = 5001;
    }
    this.useEmulator(host, parseInt(port));
  }

  useEmulator(host, port) {
    if (!isNumber(port)) {
      throw new Error('useEmulator port parameter must be a number');
    }

    let _host = host;

    const androidBypassEmulatorUrlRemap =
      typeof this.firebaseJson.android_bypass_emulator_url_remap === 'boolean' &&
      this.firebaseJson.android_bypass_emulator_url_remap;
    if (!androidBypassEmulatorUrlRemap && isAndroid && _host) {
      if (_host.startsWith('localhost')) {
        _host = _host.replace('localhost', '10.0.2.2');
        // eslint-disable-next-line no-console
        console.log(
          'Mapping functions host "localhost" to "10.0.2.2" for android emulators. Use real IP on real devices. You can bypass this behaviour with "android_bypass_emulator_url_remap" flag.',
        );
      }
      if (_host.startsWith('127.0.0.1')) {
        _host = _host.replace('127.0.0.1', '10.0.2.2');
        // eslint-disable-next-line no-console
        console.log(
          'Mapping functions host "127.0.0.1" to "10.0.2.2" for android emulators. Use real IP on real devices. You can bypass this behaviour with "android_bypass_emulator_url_remap" flag.',
        );
      }
    }
    this._useFunctionsEmulatorHost = _host || null;
    this._useFunctionsEmulatorPort = port || -1;
  }
}

// import { SDK_VERSION } from '@topher_pedersen/functions';
export const SDK_VERSION = version;

// import functions from '@topher_pedersen/functions';
// functions().logEvent(...);
export default createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: false,
  hasMultiAppSupport: true,
  hasCustomUrlOrRegionSupport: true,
  ModuleClass: FirebaseFunctionsModule,
});

// import functions, { firebase } from '@topher_pedersen/functions';
// functions().logEvent(...);
// firebase.functions().logEvent(...);
export const firebase = getFirebaseRoot();
