import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchProduct } from '../../services/api';
import { Product } from '../../types';
import Toast from '../../components/Toast';
import { useCart } from '../../context/CartContext';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchProduct(Number(id))
      .then(setProduct)
      .catch((e: any) => setError(e.message))
      .finally(() => setLoading(false));

    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastVisible(true);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2500);
  };

  const cartMessage =
    quantity === 1 ? 'Product added to cart' : 'Products added to cart';

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Product not found'}</Text>
      </View>
    );
  }

  const quantityControls = (
    <View style={styles.quantityRow}>
      <Text style={styles.sectionTitle}>Quantity</Text>
      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => setQuantity((q) => Math.max(1, q - 1))}
        >
          <Text style={styles.quantitySymbol}>−</Text>
        </TouchableOpacity>
        <Text style={styles.quantityValue}>{quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => setQuantity((q) => q + 1)}
        >
          <Text style={styles.quantitySymbol}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const addToCartButton = (
    <TouchableOpacity style={styles.cartButton} onPress={handleAddToCart}>
      <Text style={styles.cartButtonText}>Add to Cart</Text>
    </TouchableOpacity>
  );

  const categoryBadge = (
    <View style={styles.categoryBadge}>
      <Text style={styles.categoryText}>{product.category.toUpperCase()}</Text>
    </View>
  );

  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.wrapper} edges={['bottom']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.webTopRow}>
            <View style={styles.webImageContainer}>
              <Image
                source={{ uri: product.image }}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
            <View style={styles.webInfo}>
              <View>
                {categoryBadge}
                <Text style={styles.title}>{product.title}</Text>
                <Text style={styles.price}>${product.price.toFixed(2)}</Text>
                <Text style={styles.descriptionWeb}>{product.description}</Text>
              </View>
              <View>
                <View style={styles.divider} />
                {quantityControls}
                {addToCartButton}
              </View>
            </View>
          </View>
        </ScrollView>
        <Toast message={cartMessage} visible={toastVisible} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.wrapper} edges={['bottom']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <View style={styles.content}>
          {categoryBadge}
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
          <View style={styles.divider} />
          {quantityControls}
          {addToCartButton}
        </View>
      </ScrollView>
      <Toast message={cartMessage} visible={toastVisible} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  // Mobile image
  imageContainer: {
    height: 280,
    backgroundColor: COLORS.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  // Mobile content
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  // Web layout
  webTopRow: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  webImageContainer: {
    flex: 1,
    height: 480,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  webInfo: {
    flex: 1,
    height: 480,
    justifyContent: 'space-between',
  },
  descriptionWeb: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginTop: SPACING.md,
  },
  // Shared
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryDark,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.md,
  },
  categoryText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    lineHeight: 28,
    marginBottom: SPACING.sm,
  },
  price: {
    fontSize: 30,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  quantityButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantitySymbol: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '300',
    lineHeight: 26,
  },
  quantityValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center',
  },
  cartButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.xl,
    height: 52,
    justifyContent: 'center',
  },
  cartButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
    textAlign: 'center',
    padding: SPACING.lg,
  },
});
