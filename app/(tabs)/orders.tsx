import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../../src/Shared/Header';
import { SearchInput } from '../../src/Components/Ui/SearchInput';
import { FilterSegment } from '../../src/Components/Ui/FilterSegmented';
import { CariCard } from '../../src/Components/Cards/CariCard';
import { OrderCardSkeleton } from '../../src/Components/Ui/Skeleton';
import { EmptyState } from '../../src/Components/Ui/EmptyState';
import { ErrorState } from '../../src/Components/Ui/ErrorState';

import { useFilteredCariler, useCarilerList } from '../../src/Hooks/useCariler';
import { Cari, CariFilterOption, cariFilterLabel } from '../../src/Types/cari';
import { Spacing } from '../../src/Constants/Spacing';
import { useTheme } from '../../src/Context/ThemeContext';

const TAB_BAR_HEIGHT = 100;
const FILTER_OPTIONS: CariFilterOption[] = ['All', 'Alacakli', 'Borclu'];

export default function CarilerScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState<CariFilterOption>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: allCariler } = useCarilerList();
  const { cariler, isLoading, isError, refetch, isRefetching } = useFilteredCariler(selectedFilter, searchQuery);
  const total = allCariler?.length ?? 0;

  const handleCariPress = useCallback((cari: Cari) => { router.push(`/orders/${cari.id}`); }, [router]);
  const handleAddCari = useCallback(() => { router.push('/orders/add'); }, [router]);

  if (isError && !isRefetching) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={s.content}>
          <ScreenHeader title="Cariler" subtitle={`${total} cari`} rightIcon="add" onRightPress={handleAddCari} />
          <ErrorState onRetry={refetch} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={s.content}>
        <ScreenHeader title="Cariler" subtitle={`${total} cari`} rightIcon="add" onRightPress={handleAddCari} />

        <SearchInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Cari adı, telefon veya e-posta ara..." />

        <FilterSegment
          options={FILTER_OPTIONS.map((o) => cariFilterLabel[o])}
          selected={cariFilterLabel[selectedFilter]}
          onSelect={(label) => {
            const entry = Object.entries(cariFilterLabel).find(([, v]) => v === label);
            if (entry) setSelectedFilter(entry[0] as CariFilterOption);
          }}
        />

        {isLoading ? (
          <View>{[1, 2, 3, 4].map((k) => <OrderCardSkeleton key={k} />)}</View>
        ) : (
          <FlatList
            data={cariler}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => <CariCard cari={item} onPress={() => handleCariPress(item)} index={index} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.listContent}
            ListEmptyComponent={
              <EmptyState
                icon="people-outline"
                title="Cari bulunamadı"
                message={searchQuery ? `"${searchQuery}" için sonuç yok` : 'Henüz cari kaydı bulunmuyor'}
                actionLabel={searchQuery ? undefined : 'Cari ekle'}
                onAction={searchQuery ? undefined : handleAddCari}
              />
            }
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} colors={[colors.primary]} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Spacing.screenPadding },
  listContent: { flexGrow: 1, paddingBottom: TAB_BAR_HEIGHT },
});
