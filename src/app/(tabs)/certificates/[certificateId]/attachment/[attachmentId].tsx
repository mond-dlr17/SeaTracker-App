import { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Galeria } from '@nandorojo/galeria';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../../../../../features/auth/AuthProvider';
import { useCertificate } from '../../../../../features/certificates/certificatesHooks';
import {
  attachmentKindFromMime,
  listCertificateAttachments,
} from '../../../../../features/certificates/certificateAttachments';
import { Screen } from '../../../../../shared/components/Screen';
import { Colors } from '../../../../../shared/utils/colors';
import { Spacing, Typography } from '../../../../../shared/utils/theme';

export default function CertificateAttachmentViewerRoute() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ certificateId: string; attachmentId: string }>();
  const certificateId = params.certificateId ?? '';
  const attachmentId = params.attachmentId ?? '';

  const { user } = useAuth();
  const uid = user?.uid ?? '';
  const certQuery = useCertificate(uid, certificateId);
  const cert = certQuery.data ?? null;

  const attachment = useMemo(() => {
    if (!cert) return null;
    return listCertificateAttachments(cert).find((a) => a.id === attachmentId) ?? null;
  }, [cert, attachmentId]);

  const kind = attachment
    ? attachmentKindFromMime(attachment.contentType, attachment.filename)
    : 'unknown';

  const imageGallery = useMemo(() => {
    if (!cert || !attachment || kind !== 'image') return { urls: [] as string[], index: 0 };
    const imgs = listCertificateAttachments(cert).filter(
      (a) => attachmentKindFromMime(a.contentType, a.filename) === 'image',
    );
    const urls = imgs.map((a) => a.url);
    if (urls.length === 0) {
      return { urls: [attachment.url], index: 0 };
    }
    const index = Math.max(0, imgs.findIndex((a) => a.id === attachmentId));
    return { urls, index };
  }, [cert, attachment, kind, attachmentId]);

  const pdfUri = useMemo(() => {
    if (!attachment || kind !== 'pdf') return '';
    const url = attachment.url;
    return Platform.OS === 'android'
      ? `https://docs.google.com/gviewer?embedded=true&url=${encodeURIComponent(url)}`
      : url;
  }, [attachment, kind]);

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

  if (!uid) return null;

  if (certQuery.isLoading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      </Screen>
    );
  }

  if (certQuery.isError || !cert || !attachment) {
    return (
      <Screen>
        <View style={[styles.toolbar, { paddingTop: insets.top + Spacing.sm }]}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.toolbarBtn}>
            <Text style={styles.toolbarText}>← Close</Text>
          </Pressable>
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Couldn’t open this attachment.</Text>
        </View>
      </Screen>
    );
  }

  if (kind === 'image') {
    const { urls: galleryUrls, index: galleryIndex } = imageGallery;
    const activeUri = galleryUrls[galleryIndex] ?? attachment.url;

    return (
      <View style={styles.imageViewerRoot}>
        <View style={[styles.toolbar, styles.toolbarOnMedia, { paddingTop: insets.top + Spacing.sm }]}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.toolbarBtn}>
            <Text style={styles.toolbarTextLight}>← Close</Text>
          </Pressable>
          <Text style={styles.filenameLight} numberOfLines={1}>
            {attachment.filename}
          </Text>
        </View>
        <View style={styles.galeriaWrap}>
          <Galeria urls={galleryUrls} theme="dark">
            <Galeria.Image
              index={galleryIndex}
              style={styles.galeriaImageSlot}
              edgeToEdge={Platform.OS === 'android'}
            >
              <Image source={{ uri: activeUri }} style={styles.galeriaImage} resizeMode="contain" />
            </Galeria.Image>
          </Galeria>
        </View>
        {Platform.OS !== 'web' ? (
          <Text style={styles.galeriaHint}>Tap the image to zoom and pan</Text>
        ) : null}
      </View>
    );
  }

  if (kind === 'pdf') {
    return (
      <View style={styles.pdfRoot}>
        <View style={[styles.toolbar, styles.toolbarDark, { paddingTop: insets.top + Spacing.sm }]}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.toolbarBtn}>
            <Text style={styles.toolbarTextLight}>← Close</Text>
          </Pressable>
          <Text style={styles.filename} numberOfLines={1}>
            {attachment.filename}
          </Text>
        </View>
        <WebView
          source={{ uri: pdfUri }}
          style={styles.webview}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.webviewLoading}>
              <ActivityIndicator color={Colors.accent} size="large" />
            </View>
          )}
          onError={() => undefined}
        />
      </View>
    );
  }

  return (
    <Screen>
      <View style={[styles.toolbar, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.toolbarBtn}>
          <Text style={styles.toolbarText}>← Close</Text>
        </Pressable>
      </View>
      <View style={styles.centered}>
        <Text style={styles.errorText}>This file type can’t be previewed in the app.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  imageViewerRoot: {
    flex: 1,
    backgroundColor: '#000',
  },
  toolbarOnMedia: {
    backgroundColor: '#000',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  filenameLight: {
    flex: 1,
    color: '#888',
    fontSize: Typography.labelSize,
    fontWeight: '700',
    textAlign: 'right',
  },
  galeriaWrap: {
    flex: 1,
    minHeight: 200,
  },
  galeriaImageSlot: {
    flex: 1,
    width: '100%',
  },
  galeriaImage: {
    width: '100%',
    height: '100%',
  },
  galeriaHint: {
    color: '#666',
    fontSize: Typography.labelSize,
    fontWeight: '600',
    textAlign: 'center',
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  pdfRoot: {
    flex: 1,
    backgroundColor: '#111',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.bg,
  },
  toolbarDark: {
    backgroundColor: '#111',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  toolbarBtn: { paddingVertical: Spacing.xs },
  toolbarText: {
    color: Colors.accent,
    fontSize: Typography.bodySize,
    fontWeight: '800',
  },
  toolbarTextLight: {
    color: '#fff',
    fontSize: Typography.bodySize,
    fontWeight: '800',
  },
  filename: {
    flex: 1,
    color: Colors.muted,
    fontSize: Typography.labelSize,
    fontWeight: '700',
    textAlign: 'right',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  errorText: {
    color: Colors.muted,
    fontSize: Typography.bodySize,
    fontWeight: '700',
    textAlign: 'center',
  },
  webview: {
    flex: 1,
    backgroundColor: '#111',
  },
  webviewLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
  },
});
