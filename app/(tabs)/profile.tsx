import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/Constants/Colors';
import { Spacing } from '../../src/Constants/Spacing';
import { Button } from '../../src/Components/Ui/Button';
import { ScreenHeader } from '../../src/Shared/Header';
import { SectionHeader } from '../../src/Components/Ui/SectionHeader';
import { useAuth } from '../../src/Context/AuthContext';

function getInitials(name?: string) {
  if (!name || !name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const getRoleText = (role?: string) => {
    switch (role) {
      case 'ADMIN': return 'Yönetici';
      case 'TECHNICIAN': return 'Teknisyen';
      default: return role || '-';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <ScreenHeader title="Profil" subtitle="Hesabınız ve ayarlar" />

        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || '-'}</Text>
          <Text style={styles.userRole}>{getRoleText(user?.role)}</Text>
        </View>

        <SectionHeader title="Hesap bilgileri" />
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>İsim</Text>
            <Text style={styles.value}>{user?.name || '-'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user?.email || '-'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.label}>Rol</Text>
            <Text style={styles.value}>{getRoleText(user?.role)}</Text>
          </View>
        </View>

        <Button
          title="Çıkış Yap"
          variant="danger"
          onPress={logout}
          fullWidth
          style={{ marginTop: Spacing.xxl }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary + '28',
    borderWidth: 2,
    borderColor: Colors.primary + '66',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: Colors.primary,
    fontSize: 24,
    fontWeight: '700',
  },
  userName: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  userRole: {
    color: Colors.subtext,
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusXl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: {
    paddingVertical: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  label: {
    color: Colors.subtext,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  value: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

