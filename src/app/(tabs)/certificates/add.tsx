import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../../features/auth/AuthProvider';
import { useAddCertificate, useCertificates } from '../../../features/certificates/certificatesHooks';
import {
  CERTIFICATE_ATTACHMENT_PICKER_TYPES,
  isAllowedCertificateAttachment,
  normalizeAttachmentContentType,
  resolveLocalFileSizeBytes,
  validateCertificateAttachmentSize,
} from '../../../features/certificates/certificateAttachments';
import { removeCertificate, uploadCertificateFile } from '../../../features/certificates/certificatesService';
import { CERT_ICONS, getCertificateIoniconsName } from '../../../features/certificates/certificateIcons';
import { consumePendingCertificateScan } from '../../../features/documentScan/pendingCertificateScan';
import { Screen } from '../../../shared/components/Screen';
import { Button } from '../../../shared/components/Button';
import { Colors } from '../../../shared/utils/colors';
import { Radius, Spacing, Typography } from '../../../shared/utils/theme';
import { isValidISODate } from '../../../shared/utils/validation';

// ─── Types ────────────────────────────────────────────────────────────────────

type PickedFile = { localUri: string; filename: string; contentType?: string };

type FormErrors = {
  name?: string;
  issueDate?: string;
  expiryDate?: string;
};

// ─── Cert type suggestions ────────────────────────────────────────────────────

const CERT_SUGGESTIONS = Object.keys(CERT_ICONS);

// ─── DateField ────────────────────────────────────────────────────────────────

function DateField({
  label,
  value,
  onChangeText,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
}) {
  const [focused, setFocused] = useState(false);

  // Auto-insert dashes as user types (YYYY-MM-DD)
  const handleChange = (raw: string) => {
    // Strip non-digits
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 4) formatted = digits.slice(0, 4) + '-' + digits.slice(4);
    if (digits.length > 6) formatted = digits.slice(0, 4) + '-' + digits.slice(4, 6) + '-' + digits.slice(6);
    onChangeText(formatted);
  };

  return (
    <View style={dateStyles.wrap}>
      <Text style={dateStyles.label}>{label.toUpperCase()}</Text>
      <View
        style={[
          dateStyles.inputRow,
          focused && dateStyles.inputRowFocused,
          !!error && dateStyles.inputRowError,
        ]}
      >
        <Ionicons name="calendar-outline" size={18} color={error ? Colors.expired : focused ? Colors.accent : Colors.muted} style={dateStyles.icon} />
        <TextInput
          value={value}
          onChangeText={handleChange}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={Colors.muted}
          keyboardType="numeric"
          style={dateStyles.input}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          maxLength={10}
        />
      </View>
      {!!error && <Text style={dateStyles.errorText}>{error}</Text>}
    </View>
  );
}

const dateStyles = StyleSheet.create({
  wrap: { gap: Spacing.fieldGap },
  label: {
    color: Colors.primary,
    fontWeight: Typography.labelWeight,
    fontSize: 12,
    letterSpacing: 0.6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: Radius.button,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  inputRowFocused: {
    borderColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  inputRowError: {
    borderColor: Colors.expired,
  },
  icon: { marginTop: 1 },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  errorText: {
    color: Colors.expired,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});

// ─── NameField with suggestion chips ──────────────────────────────────────────

function NameField({
  value,
  onChangeText,
  error,
}: {
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const iconName = getCertificateIoniconsName(value);

  const filtered = useMemo(() => {
    if (!value.trim()) return CERT_SUGGESTIONS.slice(0, 12);
    const q = value.toLowerCase();
    return CERT_SUGGESTIONS.filter((s) => s.toLowerCase().includes(q)).slice(0, 12);
  }, [value]);

  return (
    <View style={nameStyles.wrap}>
      <Text style={nameStyles.label}>CERTIFICATE NAME</Text>
      <View
        style={[
          nameStyles.inputRow,
          focused && nameStyles.inputRowFocused,
          !!error && nameStyles.inputRowError,
        ]}
      >
        <View style={nameStyles.iconBadge}>
          <Ionicons name={iconName} size={16} color={Colors.accent} />
        </View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="e.g. STCW Basic Safety"
          placeholderTextColor={Colors.muted}
          style={nameStyles.input}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCorrect={false}
        />
        <Pressable onPress={() => setShowPicker(true)} style={nameStyles.browseBtn} hitSlop={8}>
          <Text style={nameStyles.browseBtnText}>Browse</Text>
        </Pressable>
      </View>
      {!!error && <Text style={nameStyles.errorText}>{error}</Text>}

      {/* Inline suggestion chips */}
      {focused && filtered.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={nameStyles.chipsScroll}
          contentContainerStyle={nameStyles.chipsContent}
          keyboardShouldPersistTaps="always"
        >
          {filtered.map((s) => (
            <Pressable key={s} style={nameStyles.chip} onPress={() => onChangeText(s)}>
              <Ionicons name={(CERT_ICONS as any)[s]} size={13} color={Colors.accent} />
              <Text style={nameStyles.chipText} numberOfLines={1}>{s}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Full picker modal */}
      <Modal visible={showPicker} transparent animationType="slide" onRequestClose={() => setShowPicker(false)}>
        <View style={pickerStyles.overlay}>
          <View style={pickerStyles.sheet}>
            <View style={pickerStyles.handle} />
            <Text style={pickerStyles.title}>Choose Certificate Type</Text>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={pickerStyles.grid}>
              {CERT_SUGGESTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[pickerStyles.gridItem, value === s && pickerStyles.gridItemSelected]}
                  onPress={() => {
                    onChangeText(s);
                    setShowPicker(false);
                  }}
                >
                  <View style={[pickerStyles.gridIcon, value === s && pickerStyles.gridIconSelected]}>
                    <Ionicons name={(CERT_ICONS as any)[s]} size={22} color={value === s ? Colors.surface : Colors.accent} />
                  </View>
                  <Text style={[pickerStyles.gridLabel, value === s && pickerStyles.gridLabelSelected]} numberOfLines={2}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={pickerStyles.closeRow}>
              <Button title="Cancel" variant="secondary" onPress={() => setShowPicker(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const nameStyles = StyleSheet.create({
  wrap: { gap: Spacing.fieldGap },
  label: {
    color: Colors.primary,
    fontWeight: Typography.labelWeight,
    fontSize: 12,
    letterSpacing: 0.6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: Radius.button,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    gap: Spacing.xs,
  },
  inputRowFocused: {
    borderColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  inputRowError: { borderColor: Colors.expired },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  browseBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    backgroundColor: Colors.surface2,
    marginRight: Spacing.xs,
  },
  browseBtnText: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  errorText: {
    color: Colors.expired,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  chipsScroll: { marginTop: Spacing.xs },
  chipsContent: { gap: Spacing.xs, paddingHorizontal: 2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
    maxWidth: 140,
  },
});

const pickerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    color: Colors.text,
    fontSize: Typography.titleSize,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  gridItem: {
    width: '30%',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: 14,
    backgroundColor: Colors.bg,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  gridItemSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '12',
  },
  gridIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridIconSelected: {
    backgroundColor: Colors.accent,
  },
  gridLabel: {
    color: Colors.muted,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  gridLabelSelected: {
    color: Colors.accent,
  },
  closeRow: {
    paddingTop: Spacing.sm,
  },
});

// ─── UploadZone ────────────────────────────────────────────────────────────────

function UploadZone({ file, onPress }: { file: PickedFile | null; onPress: () => void }) {
  if (file) {
    return (
      <Pressable onPress={onPress} style={uploadStyles.zone}>
        {file.contentType?.includes('pdf') ? (
          <View style={uploadStyles.pdfPreview}>
            <Ionicons name="document-text" size={32} color={Colors.accent} />
            <Text style={uploadStyles.pdfName} numberOfLines={2}>{file.filename}</Text>
            <Text style={uploadStyles.pdfHint}>PDF — tap to replace</Text>
          </View>
        ) : (
          <View style={uploadStyles.imagePreview}>
            <Image source={{ uri: file.localUri }} style={uploadStyles.previewImg} />
            <View style={uploadStyles.imageOverlay}>
              <Ionicons name="camera-reverse-outline" size={18} color={Colors.surface} />
              <Text style={uploadStyles.imageOverlayText}>Tap to replace</Text>
            </View>
          </View>
        )}
        <Text style={uploadStyles.filenamePill} numberOfLines={1}>{file.filename}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} style={uploadStyles.emptyZone}>
      <View style={uploadStyles.uploadIconWrap}>
        <Ionicons name="cloud-upload-outline" size={28} color={Colors.accent} />
      </View>
      <Text style={uploadStyles.uploadTitle}>Attach a document</Text>
      <Text style={uploadStyles.uploadHint}>PDF, PNG, JPG, JPEG or HEIC — up to 3 MB</Text>
    </Pressable>
  );
}

const uploadStyles = StyleSheet.create({
  zone: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.accent + '60',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Colors.accent + '06',
    alignItems: 'center',
  },
  emptyZone: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.bg,
  },
  uploadIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.accent + '14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTitle: {
    color: Colors.text,
    fontSize: Typography.bodySize,
    fontWeight: '700',
  },
  uploadHint: {
    color: Colors.muted,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  pdfPreview: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.xs,
    width: '100%',
  },
  pdfName: {
    color: Colors.text,
    fontSize: Typography.bodySize,
    fontWeight: '700',
    textAlign: 'center',
  },
  pdfHint: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  imagePreview: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  previewImg: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  imageOverlayText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '700',
  },
  filenamePill: {
    color: Colors.muted,
    fontSize: 11,
    fontWeight: '600',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    maxWidth: '90%',
  },
});

// ─── Main screen ───────────────────────────────────────────────────────────────

export default function AddCertificateRoute() {
  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent?.();

      parent?.setOptions?.({
        tabBarStyle: { display: 'none' },
      });

      const pending = consumePendingCertificateScan();
      if (pending) {
        if (pending.name) setName(pending.name);
        if (pending.issueDate) setIssueDate(pending.issueDate);
        if (pending.expiryDate) setExpiryDate(pending.expiryDate);
        setPickedFile({
          localUri: pending.localUri,
          filename: pending.filename,
          contentType: pending.contentType,
        });
      }

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

  const { user, profile } = useAuth();
  const uid = user?.uid ?? '';
  const certsQuery = useCertificates(uid);
  const addMut = useAddCertificate(uid);

  const [name, setName] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [pickedFile, setPickedFile] = useState<PickedFile | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const isPremium = !!profile?.isPremium;
  const certCount = certsQuery.data?.length ?? 0;
  const blocked = !isPremium && certCount >= 3;

  if (!uid) return null;

  const pickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: [...CERTIFICATE_ATTACHMENT_PICKER_TYPES],
      copyToCacheDirectory: true,
    });
    if (res.canceled) return;
    const file = res.assets[0];
    if (!file?.uri) return;

    const pickerSize = (file as { size?: number }).size;
    const sizeBytes = await resolveLocalFileSizeBytes(file.uri, pickerSize);
    if (sizeBytes == null) {
      Alert.alert("Couldn't read file size", 'Try saving the file to your device or pick another file.');
      return;
    }
    const sizeErr = validateCertificateAttachmentSize(sizeBytes);
    if (sizeErr) {
      Alert.alert('File too large', sizeErr);
      return;
    }

    const mimeType = file.mimeType ?? '';
    const filename = file.name ?? 'attachment';
    if (!isAllowedCertificateAttachment(mimeType, filename)) {
      Alert.alert('Unsupported file', 'Only PDF, PNG, JPG, JPEG, and HEIC files are allowed.');
      return;
    }

    const contentType = normalizeAttachmentContentType(mimeType, filename);
    setPickedFile({ localUri: file.uri, filename, contentType });
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!name.trim()) next.name = 'Certificate name is required.';
    if (!issueDate) next.issueDate = 'Required.';
    else if (!isValidISODate(issueDate)) next.issueDate = 'Use format YYYY-MM-DD.';
    if (!expiryDate) next.expiryDate = 'Required.';
    else if (!isValidISODate(expiryDate)) next.expiryDate = 'Use format YYYY-MM-DD.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (blocked) {
      router.push('/upgrade-premium');
      return;
    }
    if (!validate()) return;

    addMut.mutate(
      { name, issueDate, expiryDate },
      {
        onSuccess: async (certificateId) => {
          if (pickedFile) {
            setImageUploading(true);
            try {
              const sizeBytes = await resolveLocalFileSizeBytes(pickedFile.localUri);
              await uploadCertificateFile({
                uid,
                certificateId,
                localUri: pickedFile.localUri,
                filename: pickedFile.filename,
                contentType: pickedFile.contentType,
                sizeBytes: sizeBytes ?? undefined,
              });
            } catch (e) {
              console.error('uploadCertificateFile failed:', e);
              try {
                await removeCertificate(uid, certificateId);
              } catch {
                console.warn('removeCertificate cleanup failed; keeping orphan cert.', e);
              }
              Alert.alert("Couldn't upload file", 'Please try again and make sure the file is accessible on your device.');
              return;
            } finally {
              setImageUploading(false);
            }
          }
          router.replace(`/(tabs)/certificates/${certificateId}`);
        },
        onError: (e) => {
          console.error('addCertificate failed:', e);
          Alert.alert("Couldn't save certificate", String((e as any)?.message ?? 'Please try again.'));
        },
      },
    );
  };

  const isLoading = addMut.isPending || imageUploading;
  const certIcon = getCertificateIoniconsName(name);

  return (
    <Screen>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.screenTitle}>New Certificate</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero cert preview */}
        <View style={styles.heroCard}>
          <View style={styles.heroBg} />
          <View style={styles.heroIconWrap}>
            <Ionicons name={certIcon} size={36} color={Colors.surface} />
          </View>
          <Text style={styles.heroName} numberOfLines={2}>
            {name.trim() || 'Certificate Name'}
          </Text>
          <View style={styles.heroMeta}>
            <View style={styles.heroMetaItem}>
              <Ionicons name="calendar-outline" size={13} color={Colors.surface + 'AA'} />
              <Text style={styles.heroMetaText}>{issueDate || 'Issue date'}</Text>
            </View>
            <View style={styles.heroMetaDot} />
            <View style={styles.heroMetaItem}>
              <Ionicons name="time-outline" size={13} color={Colors.surface + 'AA'} />
              <Text style={styles.heroMetaText}>{expiryDate || 'Expiry date'}</Text>
            </View>
          </View>
        </View>

        {/* Premium limit banner */}
        {!isPremium && (
          <View style={[styles.bannerRow, blocked && styles.bannerRowBlocked]}>
            <Ionicons
              name={blocked ? 'lock-closed' : 'information-circle-outline'}
              size={16}
              color={blocked ? Colors.warning : Colors.muted}
            />
            <Text style={[styles.bannerText, blocked && styles.bannerTextBlocked]}>
              {blocked
                ? `You've reached the free plan limit (3/3). Upgrade to add more.`
                : `Free plan: ${certCount}/3 certificates used.`}
            </Text>
            {blocked && (
              <Pressable onPress={() => router.push('/upgrade-premium')}>
                <Text style={styles.bannerUpgrade}>Upgrade</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Form */}
        <View style={styles.formCard}>
          <NameField value={name} onChangeText={(v) => { setName(v); setErrors((e) => ({ ...e, name: undefined })); }} error={errors.name} />

          <View style={styles.divider} />

          <View style={styles.dateRow}>
            <View style={styles.dateCol}>
              <DateField
                label="Issue date"
                value={issueDate}
                onChangeText={(v) => { setIssueDate(v); setErrors((e) => ({ ...e, issueDate: undefined })); }}
                error={errors.issueDate}
              />
            </View>
            <View style={styles.dateCol}>
              <DateField
                label="Expiry date"
                value={expiryDate}
                onChangeText={(v) => { setExpiryDate(v); setErrors((e) => ({ ...e, expiryDate: undefined })); }}
                error={errors.expiryDate}
              />
            </View>
          </View>

          <View style={styles.divider} />

          {/* Scan button (native only) */}
          {Platform.OS !== 'web' && (
            <Pressable
              style={[styles.scanBtn, blocked && styles.scanBtnDisabled]}
              onPress={() => !blocked && router.push('/(tabs)/certificates/scan')}
              disabled={blocked}
            >
              <Ionicons name="scan-outline" size={20} color={blocked ? Colors.muted : Colors.accent} />
              <View style={styles.scanBtnText}>
                <Text style={[styles.scanTitle, blocked && styles.scanTitleDisabled]}>Scan with camera</Text>
                <Text style={styles.scanHint}>Auto-fill fields from your document</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.muted} />
            </Pressable>
          )}

          {/* Upload zone */}
          <UploadZone file={pickedFile} onPress={pickFile} />
        </View>

        {/* Save button */}
        <View style={styles.saveSection}>
          <Button
            title={blocked ? 'Upgrade to Add More' : 'Save Certificate'}
            disabled={isLoading}
            loading={isLoading}
            onPress={handleSave}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  screenTitle: {
    color: Colors.text,
    fontSize: Typography.headingSize,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },

  // Hero preview card
  heroCard: {
    borderRadius: 20,
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  heroBg: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.accent,
    opacity: 0.12,
  },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  heroName: {
    color: Colors.surface,
    fontSize: Typography.titleSize,
    fontWeight: '700',
    textAlign: 'center',
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 2,
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroMetaText: {
    color: Colors.surface + 'BB',
    fontSize: 12,
    fontWeight: '500',
  },
  heroMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.surface + '55',
  },

  // Banner
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    backgroundColor: Colors.surface2,
  },
  bannerRowBlocked: {
    backgroundColor: Colors.warning + '18',
  },
  bannerText: {
    flex: 1,
    color: Colors.muted,
    fontSize: 12,
    fontWeight: '500',
  },
  bannerTextBlocked: {
    color: Colors.warning,
    fontWeight: '600',
  },
  bannerUpgrade: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  // Form card
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.lg,
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: -Spacing.lg,
  },
  dateRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  dateCol: {
    flex: 1,
  },

  // Scan button
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.accent + '40',
    backgroundColor: Colors.accent + '08',
  },
  scanBtnDisabled: {
    borderColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  scanBtnText: { flex: 1 },
  scanTitle: {
    color: Colors.accent,
    fontSize: Typography.bodySize,
    fontWeight: '700',
  },
  scanTitleDisabled: { color: Colors.muted },
  scanHint: {
    color: Colors.muted,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },

  // Save section
  saveSection: {
    gap: Spacing.sm,
  },
});
