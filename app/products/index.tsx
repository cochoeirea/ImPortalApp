import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  View,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRouter } from 'expo-router';
import { fetchProducts } from '../../services/api';
import { Product } from '../../types';
import ProductCard from '../../components/ProductCard';
import CategoryModal from '../../components/CategoryModal';
import CartButton from '../../components/CartButton';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function ProductsScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { logout } = useAuth();
  const { clearCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category))];
    if (cats.length >= 4) {
      const [fifth] = cats.splice(3, 1);
      cats.splice(0, 0, fifth);
    }
    return cats;
  }, [products]);

  const { width: windowWidth } = useWindowDimensions();
  const numColumns = Platform.OS === 'web' ? 4 : 2;
  const cardWidth = (windowWidth - SPACING.md * 2 - SPACING.sm * (numColumns - 1)) / numColumns;

  const searchWidth = useRef(new Animated.Value(200)).current;

  const handleLogout = useCallback(() => {
    setShowLogoutConfirm(true);
  }, []);

  const doLogout = useCallback(() => {
    setShowLogoutConfirm(false);
    clearCart();
    logout();
    router.replace('/login');
  }, [clearCart, logout, router]);

  useLayoutEffect(() => {
    if (Platform.OS === 'web') {
      navigation.setOptions({
        headerTitle: () => (
          <View style={styles.webNavLeft}>
            <View style={styles.brandRow}>
              <Image source={require('../../assets/images/icon.png')} style={styles.navLogo} />
              <Text style={styles.webNavBrand}>ImPortal</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
              contentContainerStyle={styles.categoryScrollContent}
            >
              {[null, ...categories].map((cat) => {
                const label = cat
                  ? cat.charAt(0).toUpperCase() + cat.slice(1)
                  : 'All';
                const isSelected = cat === selectedCategory;
                return (
                  <TouchableOpacity
                    key={cat ?? 'all'}
                    style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                    onPress={() => setSelectedCategory(cat)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextSelected]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ),
        headerTitleAlign: 'left',
        headerLeftContainerStyle: { paddingLeft: 0 },
        headerTitleContainerStyle: { flex: 1, paddingLeft: SPACING.xs },
        headerRight: () => (
          <View style={styles.headerRight}>
            <Animated.View style={[styles.navSearchBar, { width: searchWidth }]}>
              <Ionicons name="search-outline" size={16} color={COLORS.textMuted} />
              <TextInput
                style={styles.navSearchInput}
                placeholder="Search products..."
                placeholderTextColor={COLORS.textMuted}
                onChangeText={setSearchText}
                onFocus={() =>
                  Animated.timing(searchWidth, {
                    toValue: 340,
                    duration: 220,
                    useNativeDriver: false,
                  }).start()
                }
                onBlur={() =>
                  Animated.timing(searchWidth, {
                    toValue: 200,
                    duration: 180,
                    useNativeDriver: false,
                  }).start()
                }
                autoCorrect={false}
              />
            </Animated.View>
            <CartButton />
            <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
              <Ionicons name="log-out-outline" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        ),
      });
    } else {
      navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => setShowCategoryModal(true)}
            style={styles.hamburger}
          >
            <Ionicons
              name="menu-outline"
              size={26}
              color={selectedCategory ? COLORS.primary : COLORS.text}
            />
          </TouchableOpacity>
        ),
        headerTitle: () => (
          <View style={styles.brandRow}>
            <Image source={require('../../assets/images/icon.png')} style={styles.navLogo} />
            <Text style={styles.mobileBrand}>ImPortal</Text>
          </View>
        ),
        headerTitleAlign: 'center',
        headerRight: () => (
          <View style={styles.headerRight}>
            <CartButton />
            <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
              <Ionicons name="log-out-outline" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        ),
      });
    }
  }, [navigation, selectedCategory, categories, handleLogout]);

  const loadProducts = useCallback(async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const matchesSearch =
          searchText.length < 2 ||
          p.title.toLowerCase().includes(searchText.toLowerCase());
        const matchesCategory =
          !selectedCategory || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
      }),
    [products, searchText, selectedCategory]
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ProductCard product={item} cardWidth={cardWidth} />}
        numColumns={numColumns}
        key={numColumns}
        contentContainerStyle={styles.list}
        columnWrapperStyle={Platform.OS === 'web' ? styles.rowWeb : styles.row}
        showsVerticalScrollIndicator={Platform.OS === 'web'}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={
          <View>
            {/* Mobile: barra de búsqueda siempre visible (en web vive en el navbar) */}
            {Platform.OS !== 'web' && (
              <View style={styles.searchWrapper}>
                <Ionicons
                  name="search-outline"
                  size={18}
                  color={COLORS.textMuted}
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search products..."
                  placeholderTextColor={COLORS.textMuted}
                  value={searchText}
                  onChangeText={setSearchText}
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                />
              </View>
            )}
            {Platform.OS !== 'web' && selectedCategory && (
              <TouchableOpacity
                style={styles.activeFilter}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={styles.activeFilterText}>
                  {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                </Text>
                <Ionicons name="close-circle" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              No products found
              {searchText.length >= 2 ? ` for "${searchText}"` : ''}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadProducts();
            }}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      />

      <CategoryModal
        visible={showCategoryModal}
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
        onClose={() => setShowCategoryModal(false)}
      />

      <Modal visible={showLogoutConfirm} transparent animationType="fade" onRequestClose={() => setShowLogoutConfirm(false)}>
        <TouchableWithoutFeedback onPress={() => setShowLogoutConfirm(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.confirmBox}>
                <Text style={styles.confirmTitle}>Log out</Text>
                <Text style={styles.confirmMessage}>Are you sure you want to log out?</Text>
                <View style={styles.confirmButtons}>
                  <TouchableOpacity style={styles.btnCancel} onPress={() => setShowLogoutConfirm(false)}>
                    <Text style={styles.btnCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnLogout} onPress={doLogout}>
                    <Text style={styles.btnLogoutText}>Log out</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    gap: SPACING.sm,
  },
  hamburger: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navLogo: {
    width: 26,
    height: 26,
    borderRadius: RADIUS.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mobileBrand: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  webNavLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.xl,
  },
  webNavBrand: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  categoryScroll: {
    alignSelf: 'center',
  },
  categoryScrollContent: {
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.xs,
  },
  categoryChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginHorizontal: 2,
  },
  categoryChipSelected: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  navSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    height: 36,
    gap: SPACING.xs,
  },
  navSearchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    paddingVertical: 0,
    outlineStyle: 'none',
  } as any,
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  row: {
    justifyContent: 'space-between',
  },
  rowWeb: {
    justifyContent: 'flex-start',
    gap: SPACING.sm,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  searchIcon: {
    marginRight: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    color: COLORS.text,
    fontSize: 15,
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  activeFilterText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  empty: {
    paddingTop: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  error: {
    color: COLORS.error,
    fontSize: 16,
    textAlign: 'center',
    padding: SPACING.lg,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  confirmBox: {
    width: 300,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  confirmTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  confirmMessage: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    gap: SPACING.md,
  },
  btnCancel: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  btnCancelText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  btnLogout: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.error,
    alignItems: 'center',
  },
  btnLogoutText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
