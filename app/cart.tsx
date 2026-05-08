import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

export default function CartScreen() {
  const { items, removeItem, totalItems } = useCart();

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.empty} edges={['bottom']}>
        <Ionicons name="cart-outline" size={72} color={COLORS.textMuted} />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>
          Add products from the catalog to see them here
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={Platform.OS === 'web'}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <View style={styles.imageBox}>
              <Image
                source={{ uri: item.product.image }}
                style={styles.itemImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle} numberOfLines={2}>
                {item.product.title}
              </Text>
              <Text style={styles.itemMeta}>
                {item.quantity} × ${item.product.price.toFixed(2)}
              </Text>
              <Text style={styles.itemSubtotal}>
                ${(item.quantity * item.product.price).toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeItem(item.product.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Text style={styles.footerLabel}>
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </Text>
          <Text style={styles.footerTotal}>${total.toFixed(2)}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
    gap: SPACING.sm,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  list: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xs,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  imageBox: {
    width: 72,
    height: 72,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xs,
    flexShrink: 0,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
  itemMeta: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  itemSubtotal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 4,
  },
  removeButton: {
    padding: SPACING.xs,
    flexShrink: 0,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  footerTotal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});
