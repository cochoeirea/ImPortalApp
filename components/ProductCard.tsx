import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Product } from '../types';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

interface Props {
  product: Product;
  cardWidth: number;
}

export default function ProductCard({ product, cardWidth }: Props) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      onPress={() => router.push(`/products/${product.id}`)}
      activeOpacity={0.75}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imageContainer: {
    height: 150,
    backgroundColor: COLORS.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.sm,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  info: {
    padding: SPACING.sm,
    gap: SPACING.xs,
  },
  title: {
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 17,
  },
  price: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
