import { api } from "@/src/api/client";
import { ENDPOINTS } from "@/src/api/endpoints";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useAuth } from "../../auth/hooks";

// Load các icon cho phàn chức năng
const DEFAULT_AVATAR = require("../../../../assets/images/default_avatar.png");
const ICON_CHART = require("../../../../assets/icons/icon_chart.png");
const ICON_CART = require("../../../../assets/icons/icon_cart.png");
const ICON_CATEGORY = require("../../../../assets/icons/icon_category.png");
const ICON_SALE = require("../../../../assets/icons/icon_sale.png");
const ICON_EMPLOYEE = require("../../../../assets/icons/icon_eployee.png");
const ICON_NOTIFICATION = require("../../../../assets/icons/icon_notification.png");
const ICON_ORDER = require("../../../../assets/icons/icon_order.png");
const ICON_PAYMENT = require("../../../../assets/icons/icon_payment.png");
const ICON_REVIEW = require("../../../../assets/icons/icon_review.png");
const ICON_TABLE = require("../../../../assets/icons/icon_table.png");

// Định nghĩa các tính năng cho 1 icon
type FeatureItem = {
  key: string;
  title: string;
  iconType: "image" | "ion";
  icon?: any;
  ionName?: React.ComponentProps<typeof Ionicons>["name"];
  route?: string;
  badgeCount?: number;
};

// UI của một ô chức năng
function FeatureTile({
  item,
  onPress,
  tileWidth,
  mr,
  mb,
}: {
  item: FeatureItem;
  onPress: () => void;
  tileWidth: number;
  mr: number;
  mb: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { width: tileWidth, marginRight: mr, marginBottom: mb },
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.95 },
      ]}
    >
      <View style={styles.tileIconWrap}>
        {item.iconType === "image" ? (
          <Image source={item.icon} style={styles.tileIconImg} />
        ) : (
          <Ionicons name={item.ionName!} size={28} color="#2A3A59" />
        )}

        {!!item.badgeCount && item.badgeCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {item.badgeCount > 99 ? "99+" : item.badgeCount}
            </Text>
          </View>
        )}
      </View>

      <Text numberOfLines={2} style={styles.tileTitle}>
        {item.title}
      </Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();

  const btnAnim = React.useRef(new Animated.Value(0)).current;

  const { isLoggedIn } = useAuth();

  const [notifCount, setNotifCount] = useState<number>(0);
  const [cartCount, setCartCount] = useState<number>(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Hover button
  const [hoverBtn, setHoverBtn] = useState<
    null | "login" | "register" | "logout"
  >(null);

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(btnAnim, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [btnAnim]);

  const go = (path: string) => {
    setMenuOpen(false);
    router.push(path as any);
  };

  const revenueText = "....";
  const reservationText = "No data available";
  const menuText = "No data available";
  const stockText = "No data available";
  const appStatusText = "Currently operating";

  // Đồng bộ kích thước giữa macbook, tablet, và iphone,...
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768 && width < 1024;
  const isLandscape = width > height;
  const shortestSide = Math.min(width, height);

  // Tablet native (Android/iOS): thường shortestSide >= 600 là tablet
  const isNativeTablet = Platform.OS !== "web" && shortestSide >= 600;
  const pageMaxWidth = useMemo(() => {
    return width >= 1024 ? 980 : width >= 768 ? 720 : 520;
  }, [width]);

  const pageWidth = Math.min(width - 32, pageMaxWidth);
  const innerWidth = pageWidth - 28;

  const gap = 12;
  const MIN_TILE = 86;
  const MAX_TILE = 160;

  const tileCols = useMemo(() => {
    let cols = Math.floor((innerWidth + gap) / (MIN_TILE + gap));
    cols = Math.max(3, Math.min(cols, 6));
    if (isLandscape) cols = Math.min(6, cols + 1);
    return cols;
  }, [innerWidth, isLandscape]);

  const tileWidth = useMemo(() => {
    const w = Math.floor((innerWidth - gap * (tileCols - 1)) / tileCols);
    return Math.max(MIN_TILE, Math.min(w, MAX_TILE));
  }, [innerWidth, tileCols]);

  const bigCols = useMemo(() => {
    // Android/iOS tablet: LUÔN 2 cột
    if (isNativeTablet) return 2;

    // Web/desktop: màn hình rộng thì 3 cột
    if (Platform.OS === "web" && width >= 1024) return 3;

    // còn lại (phone): 2 cột
    return 2;
  }, [isNativeTablet, width]);

  const bigCardWidth = useMemo(() => {
    return Math.floor((innerWidth - gap * (bigCols - 1)) / bigCols);
  }, [innerWidth, bigCols]);

  const loadBadges = useCallback(async () => {
    if (!isLoggedIn) {
      setNotifCount(0);
      setCartCount(0);
      return;
    }

    try {
      const [notifs, cart] = await Promise.allSettled([
        api.get(ENDPOINTS.NOTIFICATION_RECEIVED),
        api.get(ENDPOINTS.CART_ME),
      ]);

      if (notifs.status === "fulfilled") {
        const d = notifs.value.data;
        const count =
          typeof d?.total === "number"
            ? d.total
            : Array.isArray(d?.data)
              ? d.data.length
              : Array.isArray(d)
                ? d.length
                : 0;
        setNotifCount(count);
      }

      if (cart.status === "fulfilled") {
        const c = cart.value.data;
        const items =
          c?.items ?? c?.data?.items ?? c?.data?.cartItems ?? c?.cartItems;
        setCartCount(Array.isArray(items) ? items.length : 0);
      }
    } catch {}
  }, [isLoggedIn]);

  useFocusEffect(
    useCallback(() => {
      loadBadges();
      return () => {
        setMenuOpen(false);
      };
    }, [loadBadges]),
  );

  const features: FeatureItem[] = useMemo(
    () => [
      {
        key: "cart",
        title: "Cart",
        iconType: "image",
        icon: ICON_CART,
        badgeCount: cartCount,
      },
      {
        key: "category",
        title: "Category",
        iconType: "image",
        icon: ICON_CATEGORY,
      },
      {
        key: "discount",
        title: "Discount",
        iconType: "image",
        icon: ICON_SALE,
      },
      {
        key: "employee",
        title: "Employee",
        iconType: "image",
        icon: ICON_EMPLOYEE,
      },

      {
        key: "member_level",
        title: "Member Level",
        iconType: "ion",
        ionName: "ribbon-outline",
      },
      {
        key: "news",
        title: "News",
        iconType: "ion",
        ionName: "newspaper-outline",
      },
      {
        key: "notification",
        title: "Notification",
        iconType: "image",
        icon: ICON_NOTIFICATION,
        badgeCount: notifCount,
      },
      { key: "order", title: "Order", iconType: "image", icon: ICON_ORDER },

      {
        key: "payment",
        title: "Payment",
        iconType: "image",
        icon: ICON_PAYMENT,
      },
      {
        key: "reservation",
        title: "Reservation",
        iconType: "ion",
        ionName: "calendar-outline",
      },
      { key: "review", title: "Review", iconType: "image", icon: ICON_REVIEW },
      {
        key: "site_section",
        title: "Site Section",
        iconType: "ion",
        ionName: "location-outline",
      },

      { key: "table", title: "Table", iconType: "image", icon: ICON_TABLE },
      {
        key: "upload",
        title: "Upload",
        iconType: "ion",
        ionName: "cloud-upload-outline",
      },
      {
        key: "work_experience",
        title: "Work Experience",
        iconType: "ion",
        ionName: "briefcase-outline",
      },
      {
        key: "working_time",
        title: "Working Time",
        iconType: "ion",
        ionName: "time-outline",
      },

      {
        key: "health_check",
        title: "Health Check",
        iconType: "ion",
        ionName: "heart-outline",
      },
    ],
    [notifCount, cartCount],
  );

  const onPressFeature = (key: string) => {
    console.log("Feature:", key);
  };
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.bgWrap}>
        {/* nền base */}
        <LinearGradient
          colors={["#050B1C", "#071A2F", "#0B1F3B", "#06122A"]}
          locations={[0, 0.35, 0.7, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar */}
          <View style={[styles.page, { width: pageWidth }, styles.topBar]}>
            <View style={{ flex: 1 }}>
              <Text> </Text>
              <Text style={styles.helloText} numberOfLines={2}>
                🏨 RESTAURANT MANAGEMENT APP
              </Text>
              <Text style={styles.subText} numberOfLines={2}>
                Welcome to the restaurant management app!
              </Text>

              <Text> </Text>
            </View>

            <View style={styles.userArea}>
              <View style={styles.avatarWrap}>
                <Image
                  source={DEFAULT_AVATAR}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              </View>

              {/* dấu "v" */}
              <Pressable
                onPress={() => setMenuOpen((v) => !v)}
                style={({ pressed }) => [
                  styles.chevBtn,
                  pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                ]}
                hitSlop={10}
              >
                <Ionicons
                  name={menuOpen ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#E7C06B"
                />
              </Pressable>
            </View>
          </View>

          {menuOpen && (
            <Pressable
              style={styles.menuOverlay}
              onPress={() => setMenuOpen(false)}
            >
              <Pressable style={styles.menuBox} onPress={() => {}}>
                <Pressable
                  onPress={() => go("/(auth)/profile")}
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Ionicons name="person-outline" size={18} color="#0F172A" />
                  <Text style={styles.menuText}>View profile</Text>
                </Pressable>

                <View style={styles.menuDivider} />

                <Pressable
                  onPress={() => go("/(auth)/update_profile")}
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Ionicons name="person-outline" size={18} color="#0F172A" />
                  <Text style={styles.menuText}>Update profile</Text>
                </Pressable>

                <View style={styles.menuDivider} />

                <Pressable
                  onPress={() => go("/(auth)/change_password")}
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Ionicons name="key-outline" size={18} color="#0F172A" />
                  <Text style={styles.menuText}>Change password</Text>
                </Pressable>

                <View style={styles.menuDivider} />

                <Pressable
                  onPress={() => go("/(auth)/logout")}
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                  <Text style={[styles.menuText, { color: "#EF4444" }]}>
                    Logout
                  </Text>
                </Pressable>
              </Pressable>
            </Pressable>
          )}

          {!isLoggedIn && (
            <View style={[styles.page, { width: pageWidth }]}>
              <View style={[styles.authRow, isTablet && styles.authRowTablet]}>
                {/* LOGIN */}
                <View style={styles.neonOuterGold}>
                  <Pressable
                    onPress={() => router.push("/(auth)/login")}
                    onHoverIn={() => setHoverBtn("login")}
                    onHoverOut={() => setHoverBtn(null)}
                    style={({ pressed }) => [
                      styles.neonInner,
                      styles.neonInnerGold,
                      pressed && styles.neonPressed,
                    ]}
                  >
                    <Ionicons name="log-in-outline" size={18} color="#0A1630" />
                    <Text style={styles.neonTextDark}>Login</Text>
                  </Pressable>
                </View>

                <Pressable
                  onPress={() => router.push("/(auth)/register")}
                  style={({ pressed }) => [
                    styles.authBtn,
                    styles.authBtnGhost,
                    pressed && { opacity: 0.92 },
                  ]}
                >
                  <Ionicons
                    name="person-add-outline"
                    size={18}
                    color="#E7C06B"
                  />
                  <Text style={styles.authBtnGhostText}>Register</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Main Card Container */}
          <View style={[styles.cardContainer, { width: pageWidth }]}>
            {/* Overview Cards */}
            <View style={styles.cardGrid}>
              <Pressable
                onPress={() => {
                  console.log("Revenue card -> connect API later");
                }}
                style={({ pressed }) => [
                  styles.bigCard,
                  { width: bigCardWidth },
                  pressed && { opacity: 0.95 },
                ]}
              >
                <View style={styles.bigCardHeader}>
                  <Ionicons name="wallet-outline" size={18} color="#E7C06B" />
                  <Text style={styles.bigCardTitle}>REVENUE OVERVIEW</Text>
                </View>

                <View style={styles.bigCardBody}>
                  <Text style={styles.bigCardValue}>VND {revenueText}</Text>
                  <Image source={ICON_CHART} style={styles.chartIcon} />
                </View>
              </Pressable>

              <Pressable
                onPress={() => console.log("Reservation & Guests")}
                style={({ pressed }) => [
                  styles.bigCard,
                  styles.bigCardBlue,
                  { width: bigCardWidth },
                  pressed && { opacity: 0.95 },
                ]}
              >
                <View style={styles.bigCardHeader}>
                  <Ionicons name="people-outline" size={18} color="#E7C06B" />
                  <Text style={styles.bigCardTitle}>
                    RESERVATIONS & CUSTOMERS
                  </Text>
                </View>

                <View style={styles.bigCardBodyCol}>
                  <View style={styles.rowGap}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color="#D8E6FF"
                    />
                    <Text style={styles.bigCardSubText}>{reservationText}</Text>
                  </View>
                </View>
              </Pressable>

              <Pressable
                onPress={() => console.log("Menu Management")}
                style={({ pressed }) => [
                  styles.bigCard,
                  styles.bigCardGold,
                  { width: bigCardWidth },
                  pressed && { opacity: 0.95 },
                ]}
              >
                <View style={styles.bigCardHeader}>
                  <Ionicons
                    name="restaurant-outline"
                    size={18}
                    color="#2B2B2B"
                  />
                  <Text style={[styles.bigCardTitle, { color: "#2B2B2B" }]}>
                    MENU MANAGEMENT
                  </Text>
                </View>

                <View style={styles.bigCardBodyCol}>
                  <Text style={[styles.bigCardSubText, { color: "#2B2B2B" }]}>
                    {menuText}
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => console.log("Stock / Inventory")}
                style={({ pressed }) => [
                  styles.bigCard,
                  { width: bigCardWidth },
                  pressed && { opacity: 0.95 },
                ]}
              >
                <View style={styles.bigCardHeader}>
                  <Ionicons name="cube-outline" size={18} color="#E7C06B" />
                  <Text style={styles.bigCardTitle}>
                    WAREHOUSE & RAW MATERIALS
                  </Text>
                </View>

                <View style={styles.bigCardBodyCol}>
                  <Text style={styles.bigCardSubText}>{stockText}</Text>
                </View>
              </Pressable>
            </View>

            {/* Small status*/}
            <View style={styles.statusRow}>
              <View style={styles.statusPill}>
                <View style={styles.dotGreen} />
                <Text style={styles.statusText}>{appStatusText}</Text>
              </View>

              <View style={styles.shiftPill}>
                <Text style={styles.shiftText}>On Shift</Text>
              </View>
            </View>

            {/* Feature Grid */}
            <Text style={styles.sectionTitle}>Function</Text>
            <View style={styles.featureGrid}>
              {features.map((it, idx) => (
                <FeatureTile
                  key={it.key}
                  item={it}
                  onPress={() => onPressFeature(it.key)}
                  tileWidth={tileWidth}
                  mr={idx % tileCols === tileCols - 1 ? 0 : gap}
                  mb={gap}
                />
              ))}
            </View>

            {/* Recent Notifications */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Recent announcements</Text>
              <Pressable
                onPress={() => onPressFeature("notification")}
                style={({ pressed }) => [
                  styles.linkBtn,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={styles.linkText}>View all</Text>
                <Ionicons name="chevron-forward" size={16} color="#2A3A59" />
              </Pressable>
            </View>

            <View style={styles.noticeList}>
              <NoticeItem
                icon="checkmark-circle-outline"
                title="Order #1057 was completed"
                subtitle="No data available"
              />
              <NoticeItem
                icon="calendar-outline"
                title="New table reservation"
                subtitle="No data available"
              />
              <NoticeItem
                icon="alert-circle-outline"
                title="Ingredients are running out"
                subtitle="No data available"
              />
            </View>

            {/* Logout*/}
            <View style={styles.neonOuterGold}>
              <Pressable
                onPress={() => router.push("/(auth)/logout")}
                onHoverIn={() => setHoverBtn("logout")}
                onHoverOut={() => setHoverBtn(null)}
                style={({ pressed }) => [
                  styles.neonInner,
                  styles.neonInnerBlueDark,
                  hoverBtn === "logout" && styles.neonInnerHover,
                  pressed && styles.neonPressed,
                ]}
              >
                <Ionicons name="log-out-outline" size={18} color="#E7C06B" />
                <Text style={styles.neonTextGold}>Logout</Text>
                <Ionicons name="chevron-forward" size={18} color="#E7C06B" />
              </Pressable>
            </View>
          </View>

          <View style={{ height: 28 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function NoticeItem({
  icon,
  title,
  subtitle,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.noticeItem}>
      <View style={styles.noticeIconWrap}>
        <Ionicons name={icon} size={18} color="#2A3A59" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.noticeTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.noticeSub} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0A1630" },
  bg: { flex: 1 },

  content: {
    padding: 16,
    paddingTop: Platform.OS === "android" ? 10 : 0,
    alignItems: "center",
  },

  page: { width: "100%" },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginBottom: 12,
    paddingTop: 34,
  },

  dateText: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    gap: 12,
    marginBottom: 6,
  },
  helloText: {
    color: "#E7C06B",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0.3,
    lineHeight: 30,
  },
  subText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 6,
    lineHeight: 20,
  },

  avatarWrap: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "rgba(231,192,107,0.15)",
    borderWidth: 1,
    borderColor: "rgba(231,192,107,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },

  authRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
    marginBottom: 14,
  },
  authBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,

    overflow: "hidden",
    position: "relative",
  },
  authBtnPrimary: {
    backgroundColor: "#E7C06B",

    shadowColor: "#E7C06B",
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },

  authBtnPrimaryText: {
    color: "#0A1630",
    fontWeight: "900",
    fontSize: 15,
  },
  authBtnGhost: {
    borderWidth: 1,
    borderColor: "rgba(231,192,107,0.45)",
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  authBtnGhostText: {
    color: "#E7C06B",
    fontWeight: "900",
    fontSize: 15,
  },

  cardContainer: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 24,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },

  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  bigCard: {
    minHeight: 118,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "#0E2B58",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    justifyContent: "space-between",
  },
  bigCardBlue: {
    backgroundColor: "#29507E",
  },
  bigCardGold: {
    backgroundColor: "#E7C06B",
    borderColor: "rgba(0,0,0,0.10)",
  },
  bigCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  bigCardTitle: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.2,
    flex: 1,
  },
  bigCardBody: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 10,
  },
  bigCardBodyCol: {
    flex: 1,
    justifyContent: "flex-end",
  },
  bigCardValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },
  bigCardSubText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "700",
  },
  rowGap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chartIcon: { width: 22, height: 22, opacity: 0.95 },

  statusRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(16, 185, 129, 0.10)",
    borderColor: "rgba(16, 185, 129, 0.25)",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    flex: 1,
  },
  dotGreen: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  statusText: {
    color: "#0F172A",
    fontWeight: "900",
    fontSize: 12,
  },
  shiftPill: {
    backgroundColor: "rgba(231,192,107,0.18)",
    borderColor: "rgba(231,192,107,0.35)",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  shiftText: {
    color: "#8B5A00",
    fontWeight: "900",
    fontSize: 12,
  },

  sectionTitle: {
    marginTop: 14,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
  },

  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  tile: {
    backgroundColor: "#F4F6FA",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  tileIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#F6F0DD",
    borderWidth: 1,
    borderColor: "rgba(231,192,107,0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  tileIconImg: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },

  tileTitle: {
    fontSize: 12.5,
    textAlign: "center",
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: 0.2,
  },

  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },

  sectionHeaderRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "rgba(15, 23, 42, 0.04)",
  },
  linkText: {
    color: "#2A3A59",
    fontWeight: "900",
    fontSize: 12,
  },

  noticeList: {
    marginTop: 8,
    gap: 10,
  },
  noticeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
  },
  noticeIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#F4F6FA",
    alignItems: "center",
    justifyContent: "center",
  },
  noticeTitle: {
    fontSize: 13.5,
    fontWeight: "900",
    color: "#0F172A",
  },
  noticeSub: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },

  logoutBtn: {
    marginTop: 14,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#0E2B58",
    borderWidth: 1,
    borderColor: "rgba(231,192,107,0.30)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  logoutText: {
    color: "#E7C06B",
    fontSize: 16,
    fontWeight: "900",
    flex: 0,
  },
  bgWrap: { flex: 1 },

  userArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },

  chevBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(231,192,107,0.12)",
    borderWidth: 1,
    borderColor: "rgba(231,192,107,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },

  menuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },

  menuBox: {
    position: "absolute",
    top: 76, // chỉnh theo UI của sếp (nếu lệch thì tăng/giảm chút)
    right: 16,
    width: 200,
    backgroundColor: "rgba(255,255,255,0.98)",
    borderRadius: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  menuText: {
    fontWeight: "900",
    color: "#0F172A",
    fontSize: 13.5,
  },

  menuDivider: {
    height: 1,
    backgroundColor: "rgba(15, 23, 42, 0.08)",
    marginHorizontal: 12,
  },

  neonOuterGold: {
    flex: 1,
    borderRadius: 16,
    padding: 2,
    backgroundColor: "rgba(231,192,107,0.28)",
    borderWidth: 1,
    borderColor: "rgba(231,192,107,0.85)",
    shadowColor: "#E7C06B",
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
  },

  neonOuterCyan: {
    flex: 1,
    borderRadius: 16,
    padding: 2,
    backgroundColor: "rgba(0,255,245,0.20)",
    borderWidth: 1,
    borderColor: "rgba(0,255,245,0.75)",
    shadowColor: "#00FFF5",
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
  },

  neonOuterHover: {
    shadowOpacity: 0.6,
    shadowRadius: 22,
  },

  neonInner: {
    height: 48,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
  },

  neonInnerGold: {
    backgroundColor: "#E7C06B",
    borderColor: "rgba(255,255,255,0.25)",
  },

  neonInnerCyan: {
    backgroundColor: "rgba(0,0,0,0.14)",
    borderColor: "rgba(0,255,245,0.65)",
  },

  neonInnerBlueDark: {
    height: 54,
    backgroundColor: "#0E2B58",
    borderColor: "rgba(231,192,107,0.35)",
  },

  neonInnerHover: {
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  neonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },

  neonTextDark: {
    color: "#0A1630",
    fontWeight: "900",
    fontSize: 15,
  },

  neonTextLight: {
    color: "#EAFBFF",
    fontWeight: "900",
    fontSize: 15,
  },

  neonTextGold: {
    color: "#E7C06B",
    fontWeight: "900",
    fontSize: 16,
  },
  authRowTablet: {
    width: "100%",
    paddingHorizontal: 14,
  },
});
