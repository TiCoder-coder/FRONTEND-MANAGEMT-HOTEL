import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  ImageSourcePropType,
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { PHONE_COUNTRIES, PhoneCountry } from "../constants/phoneCountries";

// Định nghĩa một component
type Props = {
  country: PhoneCountry; // Quốc gia đang chọn
  onChangeCountry: (c: PhoneCountry) => void; // Callback khi gọi quốc gia mới

  nationalNumber: string; // Sốđầu điện thoại mà người dùng chọn
  onChangeNationalNumber: (v: string) => void; // Callback khi gọi một số đầu mới

  placeholder?: string; // Khii người dùng nhập gì vào thì ví dụ hiển thị trong đó sẽ biến mất
  autoStripLeadingZero?: boolean; // Tự động bỏ số 0 ở đầu

  containerStyle?: StyleProp<ViewStyle>;
  selectorStyle?: StyleProp<ViewStyle>; // Ô chọn quốc gia
  inputStyle?: StyleProp<TextStyle>; // Ô nhập số
};

// Định nghĩa một component con của flag images -> xử lí load ảnh
function FlagImage({
  // Khi có một là cờ bị lỗi thì nó sẽ tự tạo một lá cờ dự bị để nó không bị fail và nó sẽ log ra để người dùng biết
  source,
  name,
  style,
}: {
  source: ImageSourcePropType;
  name: string;
  style: any;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <View style={[style, styles.flagFallback]}>
        <Ionicons name="flag" size={12} color="#64748B" />
      </View>
    );
  }

  return (
    <Image
      source={source}
      style={style}
      resizeMode="cover"
      onError={(e) => {
        console.log("FLAG ERROR:", name, e?.nativeEvent);
        setFailed(true);
      }}
    />
  );
}

// Compnent chính của một phone number input
export function PhoneNumberInput({
  country,
  onChangeCountry,
  nationalNumber,
  onChangeNationalNumber,
  placeholder = "Phone number",
  autoStripLeadingZero = true,
  containerStyle,
  selectorStyle,
  inputStyle,
}: Props) {
  const [open, setOpen] = useState(false); // Mở/ đóng modal chọn quốc gia
  const [q, setQ] = useState(""); // Query search --- người dùng tìm kiếm quốc gia của mình

  // Danh sách các quốc gia có keys trùng với keys mà người dùng tìm kiếm
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return PHONE_COUNTRIES;
    return PHONE_COUNTRIES.filter((c) => c.name.toLowerCase().includes(s));
  }, [q]);

  // Clean số điện thoại
  const onChangeText = (txt: string) => {
    let digits = txt.replace(/[^\d]/g, ""); // Chỉ giữ lại số
    if (autoStripLeadingZero) digits = digits.replace(/^0+/, ""); // Bỏ hết số 0 ở đầu
    onChangeNationalNumber(digits); // Cập nhập state cho component cha
  };

  // UI dùng để hiển thị các lá cờ
  return (
    <>
      {/* Row nhập số */}
      <View style={[styles.row, containerStyle]}>
        <Pressable
          onPress={() => setOpen(true)}
          style={[styles.selector, selectorStyle]}
        >
          {/* Cụm chọn quốc gia */}
          <FlagImage
            source={country.flag}
            name={country.name}
            style={styles.flag}
          />

          {/* Đầu số điện thoại của các quốc gia */}
          <Text style={styles.codeText}>+{country.callingCode}</Text>
          {/* Icon lên xuống báo cho user biết đây là dropdown */}
          <Ionicons
            name="chevron-down"
            size={16}
            color="rgba(255,255,255,0.85)"
          />
        </Pressable>

        {/* Ô nhập số điện thoại */}
        <TextInput
          value={nationalNumber}
          onChangeText={onChangeText}
          keyboardType="phone-pad"
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.55)"
          style={[styles.input, inputStyle]}
        />
      </View>

      {/* Modal chọn quốc gia: mở/ đóng theo state, mở/ đóng dần dần ( không mở cùng một lúc ) */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        {/* Lớp ngoài (backdrrop) */}
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            {/* Nội dunng trong sheet: hiển thị tiêu dề + nut close để đóng modal */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select country</Text>
              <Pressable onPress={() => setOpen(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={18} color="#0F172A" />
              </Pressable>
            </View>

            <View style={styles.searchWrap}>
              <Ionicons name="search" size={16} color="#64748B" />
              <TextInput
                value={q}
                onChangeText={setQ}
                placeholder="Search country..."
                placeholderTextColor="#94A3B8"
                style={styles.searchInput}
              />
            </View>

            {/* Danh sách quốc gia */}
            <FlatList
              style={{ maxHeight: 420 }}
              data={list}
              keyExtractor={(c) => `${c.name}-${c.callingCode}`}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={20}
              maxToRenderPerBatch={20}
              windowSize={7}
              removeClippedSubviews
              renderItem={({ item: c }) => (
                <Pressable
                  onPress={() => {
                    onChangeCountry(c);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.item,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Image
                    source={c.flag}
                    style={styles.itemFlag}
                    resizeMode="cover"
                    resizeMethod="resize"
                    onError={(e) =>
                      console.log("FLAG ERROR:", c.name, e.nativeEvent)
                    }
                  />
                  <Text style={styles.itemName}>{c.name}</Text>
                  <Text style={styles.itemCode}>+{c.callingCode}</Text>
                </Pressable>
              )}
              ListFooterComponent={<View style={{ height: 10 }} />}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Row nhập số
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(231,192,107,0.35)",
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0,0,0,0.12)",
  },

  // Cụm chọn quốc giâ
  selector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingRight: 10,
    marginRight: 10,
    borderRightWidth: 1,
    borderRightColor: "rgba(231,192,107,0.25)",
  },

  // Icon cờ trên UII
  flag: {
    width: 26,
    height: 18,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F1F5F9",
    overflow: "hidden",
  },

  // Số đầu của quốc gia
  codeText: { color: "#FFFFFF", fontWeight: "900", fontSize: 13.5 },

  // Text input (phone number)
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14.5,
  },

  // CSS cho lớp ngoài - backdrop
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 16,
  },

  // CSS cho ô hiển thị (nền trắng + bo góc + khoảng cách giữa chữ và viền)
  sheet: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 12,
  },

  // CSS cho header: tiêu đề và nút close đẻ đóng model
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 10,
  },

  // CSS cho tiêu đề
  sheetTitle: { fontSize: 16, fontWeight: "900", color: "#0F172A" },

  // CSS cho close button
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(15,23,42,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  // CSS cho thanh tìm kiếm
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
    backgroundColor: "rgba(15,23,42,0.04)",
    paddingHorizontal: 10,
    height: 44,
    marginBottom: 10,
  },

  // CSS cho những value và input vào search
  searchInput: { flex: 1, fontWeight: "700", color: "#0F172A" },

  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
  },

  // CSS cho lá cờ
  itemFlag: {
    width: 26,
    height: 18,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F1F5F9",
    overflow: "hidden",
  },

  // CSS cho tên lá cờ
  itemName: { flex: 1, fontWeight: "800", color: "#0F172A" },

  // CSS cho số đẩu của lá cờ
  itemCode: { fontWeight: "900", color: "#334155" },

  // CSS cho lá cờ dự phòng
  flagFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
});
