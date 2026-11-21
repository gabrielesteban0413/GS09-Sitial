import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import type { AnalysisHistoryItem } from "../lib/api";
import { businessLabel, colors } from "../theme";

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Fecha no disponible"
    : new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function HistoryCard({
  item,
  index,
  itemWidth,
  cardWidth,
  scrollX,
}: {
  item: AnalysisHistoryItem;
  index: number;
  itemWidth: number;
  cardWidth: number;
  scrollX: SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const center = index * itemWidth;
    const inputRange = [center - itemWidth, center, center + itemWidth];
    return {
      transform: [
        { scale: interpolate(scrollX.get(), inputRange, [0.92, 1, 0.92], Extrapolation.CLAMP) },
        {
          rotateZ: `${interpolate(scrollX.get(), inputRange, [3, 0, -3], Extrapolation.CLAMP)}deg`,
        },
      ],
    };
  });

  return (
    <Animated.View style={[styles.card, { width: cardWidth }, animatedStyle]}>
      <View style={styles.cardTop}>
        <View style={styles.locationMark}>
          <Text style={styles.locationGlyph}>⌖</Text>
        </View>
        <View style={styles.badge}><Text style={styles.badgeText}>HISTORIAL</Text></View>
      </View>
      <Text numberOfLines={2} style={styles.name}>{item.label || "Ubicación"}</Text>
      <Text style={styles.meta}>{businessLabel(item.businessType)}</Text>
      <View style={styles.divider} />
      <View style={styles.cardBottom}>
        <View style={styles.cardDetails}>
          <Text style={styles.coordinates}>{item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}</Text>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
        </View>
        <Text style={styles.score}>N/D</Text>
      </View>
    </Animated.View>
  );
}

export function AnalysisHistoryCarousel({ items }: { items: AnalysisHistoryItem[] }) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - 40, 320);
  const gap = 12;
  const itemWidth = cardWidth + gap;
  const sidePadding = Math.max(20, (width - cardWidth) / 2);
  const scrollX = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.set(event.contentOffset.x);
  });

  return (
    <View>
      <Text style={styles.hint}>Desliza para recorrer tus análisis guardados</Text>
      <Animated.FlatList
        data={items}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <HistoryCard
            item={item}
            index={index}
            itemWidth={itemWidth}
            cardWidth={cardWidth}
            scrollX={scrollX}
          />
        )}
        onScroll={onScroll}
        scrollEventThrottle={16}
        snapToInterval={itemWidth}
        snapToAlignment="start"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: sidePadding, gap }}
        getItemLayout={(_, index) => ({ length: itemWidth, offset: itemWidth * index, index })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hint: { color: colors.muted, fontSize: 9, marginBottom: 8 },
  card: {
    minHeight: 148,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 17,
    padding: 14,
    backgroundColor: colors.white,
  },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  locationMark: { width: 30, height: 30, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: colors.mint },
  locationGlyph: { color: colors.tealDeep, fontSize: 21, lineHeight: 25 },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: colors.plumSoft },
  badgeText: { color: colors.plum, fontSize: 7, fontWeight: "900", letterSpacing: 0.9 },
  name: { color: colors.ink, fontSize: 13, fontWeight: "800", marginTop: 11 },
  meta: { color: colors.inkSoft, fontSize: 9, marginTop: 4 },
  divider: { height: 1, marginTop: 12, backgroundColor: "#edf2f1" },
  cardBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 9 },
  cardDetails: { flex: 1 },
  coordinates: { color: colors.inkSoft, fontSize: 9, fontWeight: "700" },
  date: { color: colors.muted, fontSize: 8, marginTop: 3 },
  score: { color: colors.muted, fontSize: 10, fontWeight: "900" },
});
