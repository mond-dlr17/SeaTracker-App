import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

import { firestore } from '../../shared/services/firebase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensurePushToken(uid: string) {
  const current = await getDoc(doc(firestore, 'users', uid));
  const existing = current.exists() ? (current.data() as { expoPushToken?: string }).expoPushToken : undefined;

  const perms = await Notifications.getPermissionsAsync();
  const finalStatus =
    perms.status === 'granted' ? perms.status : (await Notifications.requestPermissionsAsync()).status;
  if (finalStatus !== 'granted') return;

  const projectId =
    (Constants.expoConfig?.extra as any)?.eas?.projectId ?? (Constants.easConfig?.projectId as string | undefined);

  const token = (await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)).data;
  if (existing === token) return;
  await updateDoc(doc(firestore, 'users', uid), { expoPushToken: token, updatedAt: Date.now() });
}

