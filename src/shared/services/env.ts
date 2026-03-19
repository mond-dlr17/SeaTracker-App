import Constants from 'expo-constants';

type Extra = {
  apiBaseUrl?: string;
  firebase?: {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
  };
};

function getExtra(): Extra {
  const extra = (Constants.expoConfig?.extra ?? {}) as Extra;
  return extra;
}

export const Env = {
  apiBaseUrl: getExtra().apiBaseUrl ?? '',
  firebase: {
    apiKey: getExtra().firebase?.apiKey ?? '',
    authDomain: getExtra().firebase?.authDomain ?? '',
    projectId: getExtra().firebase?.projectId ?? '',
    storageBucket: getExtra().firebase?.storageBucket ?? '',
    messagingSenderId: getExtra().firebase?.messagingSenderId ?? '',
    appId: getExtra().firebase?.appId ?? '',
  },
} as const;

