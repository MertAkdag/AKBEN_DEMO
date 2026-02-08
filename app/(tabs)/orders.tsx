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
import { Colors } from '../../src/Constants/Colors';
import { Spacing } from '../../src/Constants/Spacing';

const FILTER_OPTIONS: CariFilterOption[] = ['All', 'Alacakli', 'Borclu'];

export default function CarilerScreen() {
  const router = useRouter();

  const [selectedFilter, setSelectedFilter] = useState<CariFilterOption>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: allCariler } = useCarilerList();
  const { cariler, isLoading, isError, refetch, isRefetching } = useFilteredCariler(
    selectedFilter,
    searchQuery
  );

  const totalCariler = allCariler?.length ?? 0;

  const handleCariPress = useCallback(
    (cari: Cari) => {
      router.push(`/orders/${cari.id}`);
    },
    [router]
  );

  const handleAddCari = useCallback(() => {
    router.push('/orders/add');
  }, [router]);

  const renderCariCard = useCallback(
    ({ item }: { item: Cari }) => (
      <CariCard cari={item} onPress={() => handleCariPress(item)} />
    ),
    [handleCariPress]
  );

  const renderEmptyComponent = useCallback(() => {
    if (isLoading) return null;
    return (
      <EmptyState
        icon="people-outline"
        title="Cari bulunamadı"
        message={
          searchQuery
            ? `"${searchQuery}" için sonuç bulunamadı`
            : 'Henüz cari kaydı bulunmuyor'
        }
      />
    );
  }, [isLoading, searchQuery]);

  const renderSkeletons = () => (
    <View>
      {[1, 2, 3, 4].map((key) => (
        <OrderCardSkeleton key={key} />
      ))}
    </View>
  );

  if (isError && !isRefetching) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          <ScreenHeader
            title="Cariler"
            subtitle={`Toplam ${totalCariler} cari`}
            rightIcon="add"
            onRightPress={handleAddCari}
          />
          <ErrorState onRetry={refetch} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <ScreenHeader
          title="Cariler"
          subtitle={`Toplam ${totalCariler} cari`}
          rightIcon="add"
          onRightPress={handleAddCari}
        />

        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Cari adı, telefon veya e-posta ara..."
        />

        <FilterSegment
          options={FILTER_OPTIONS.map((o) => cariFilterLabel[o])}
          selected={cariFilterLabel[selectedFilter]}
          onSelect={(label) => {
            const entry = Object.entries(cariFilterLabel).find(([, v]) => v === label);
            if (entry) setSelectedFilter(entry[0] as CariFilterOption);
          }}
        />

        {isLoading ? (
          renderSkeletons()
        ) : (
          <FlatList
            data={cariler}
            keyExtractor={(item) => item.id}
            renderItem={renderCariCard}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyComponent}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor={Colors.primary}
                colors={[Colors.primary]}
              />
            }
          />
        )}
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
  listContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
});
