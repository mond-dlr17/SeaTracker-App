import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import TextRecognition from '@react-native-ml-kit/text-recognition';

import { extractCertificateFieldsFromOcr } from '../../../features/documentScan/extractCertificateFields';
import { setPendingCertificateScan } from '../../../features/documentScan/pendingCertificateScan';
import { Button } from '../../../shared/components/Button';
import { Colors } from '../../../shared/utils/colors';
import { Spacing, Typography } from '../../../shared/utils/theme';

function toFileUri(path: string) {
  return path.startsWith('file://') ? path : `file://${path}`;
}

export default function ScanCertificateRoute() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  const [busy, setBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent?.();
      parent?.setOptions?.({ tabBarStyle: { display: 'none' } });
      return () => {
        parent?.setOptions?.({
          tabBarStyle: {
            display: 'flex',
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
          },
        });
      };
    }, [navigation]),
  );

  const onCapture = async () => {
    if (!cameraRef.current || busy) return;
    setBusy(true);
    try {
      const photo = await cameraRef.current.takePhoto({ flash: 'off', enableShutterSound: true });
      const uri = toFileUri(photo.path);
      const result = await TextRecognition.recognize(uri);
      const extracted = extractCertificateFieldsFromOcr(result.text);
      const filename = `scan-${Date.now()}.jpg`;

      setPendingCertificateScan({
        localUri: uri,
        filename,
        contentType: 'image/jpeg',
        name: extracted.name,
        issueDate: extracted.issueDate,
        expiryDate: extracted.expiryDate,
      });

      const filled = [extracted.name, extracted.issueDate, extracted.expiryDate].filter(Boolean).length;
      if (filled === 0) {
        Alert.alert(
          'No fields detected',
          'We saved the photo — please enter the certificate name and dates manually.',
          [{ text: 'OK', onPress: () => router.back() }],
        );
      } else {
        router.back();
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('scan failed', e);
      Alert.alert('Scan failed', 'Could not capture or read the document. Try again with more light.');
    } finally {
      setBusy(false);
    }
  };

  if (!hasPermission) {
    return (
      <View style={[styles.permissionRoot, { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.lg }]}>
        <Text style={styles.permissionTitle}>Camera access</Text>
        <Text style={styles.permissionBody}>
          Allow camera access to scan certificates and government IDs. Text is processed on your device.
        </Text>
        <Button title="Continue" onPress={() => void requestPermission()} />
        <Button title="Cancel" variant="secondary" onPress={() => router.back()} />
      </View>
    );
  }

  if (!device) {
    return (
      <View style={[styles.permissionRoot, { paddingTop: insets.top + Spacing.lg }]}>
        <Text style={styles.permissionTitle}>No camera</Text>
        <Text style={styles.permissionBody}>This device does not have an available back camera.</Text>
        <Button title="Go back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Camera ref={cameraRef} style={StyleSheet.absoluteFill} device={device} isActive photo />

      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.sm }]} pointerEvents="box-none">
        <Pressable onPress={() => router.back()} style={styles.closeBtn} hitSlop={12}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
        <Text style={styles.topTitle}>Scan document</Text>
        <View style={styles.topSpacer} />
      </View>

      <View style={styles.frameGuide} pointerEvents="none">
        <View style={styles.frameInner} />
        <Text style={styles.frameHint}>Position the document flat inside the frame</Text>
      </View>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.lg }]}>
        {busy ? (
          <View style={styles.busyRow}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.busyText}>Reading text…</Text>
          </View>
        ) : (
          <Pressable
            onPress={() => void onCapture()}
            style={styles.shutterOuter}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Capture document"
          >
            <View style={styles.shutterInner} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionRoot: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: Spacing.screenPaddingHorizontal,
    gap: Spacing.md,
    justifyContent: 'center',
  },
  permissionTitle: {
    color: Colors.text,
    fontSize: Typography.headingSize,
    fontWeight: Typography.titleWeight,
  },
  permissionBody: {
    color: Colors.muted,
    fontSize: Typography.bodySize,
    marginBottom: Spacing.sm,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  topTitle: {
    color: '#fff',
    fontSize: Typography.bodySize,
    fontWeight: '700',
  },
  topSpacer: { width: 40 },
  frameGuide: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameInner: {
    width: '86%',
    maxWidth: 360,
    aspectRatio: 1.4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  frameHint: {
    marginTop: Spacing.lg,
    color: 'rgba(255,255,255,0.9)',
    fontSize: Typography.bodySize,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingTop: Spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  shutterOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },
  busyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  busyText: {
    color: '#fff',
    fontSize: Typography.bodySize,
    fontWeight: '600',
  },
});
