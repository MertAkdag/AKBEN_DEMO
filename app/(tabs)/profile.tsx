import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/Constants/Colors';
import { Spacing } from '../../src/Constants/Spacing';
import { Button } from '../../src/Components/Ui/Button';
import { ScreenHeader } from '../../src/Shared/Header';
import { useAuth } from '../../src/Context/AuthContext';

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
        <ScreenHeader title="Profil" subtitle="Kullanıcı bilgileri" />

        <View style={styles.infoCard}>
          <Text style={styles.label}>İsim</Text>
          <Text style={styles.value}>{user?.name || '-'}</Text>
          
          <Text style={[styles.label, { marginTop: Spacing.lg }]}>Email</Text>
          <Text style={styles.value}>{user?.email || '-'}</Text>
          
          <Text style={[styles.label, { marginTop: Spacing.lg }]}>Rol</Text>
          <Text style={styles.value}>{getRoleText(user?.role)}</Text>
        </View>

        <Button
          title="Çıkış Yap"
          variant="danger"
          onPress={logout}
          style={{ marginTop: Spacing.xxl, width: '100%' }}
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
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusLg,
    padding: Spacing.screenPadding,
  },
  label: {
    color: Colors.subtext,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  value: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

