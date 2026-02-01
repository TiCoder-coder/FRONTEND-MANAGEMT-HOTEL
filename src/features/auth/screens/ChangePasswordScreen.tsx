import { api } from "@/src/api/client";
import { ENDPOINTS } from "@/src/api/endpoints";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

export default function ChangePasswordScreen() {
  const router = useRouter(); // Dùng để quay về màn hình trước khi bấm callback

  // Nhập các password
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Quyết định xem các password đó show/hide
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Tránh bấm nhiều lần gửi request liên tục
  const [submitting, setSubmitting] = useState(false);

  // Chuẩn hoá kích thước giữa các thiết bị
  const { width } = useWindowDimensions();

  const pageMaxWidth = React.useMemo(() => {
    if (width >= 1200) return 720; // desktop (web/mac)
    if (width >= 992) return 640; // tablet lớn / ipad ngang
    if (width >= 768) return 560; // tablet thường
    return 520; // phone
  }, [width]);

  const pageWidth = Math.max(320, Math.min(width - 36, pageMaxWidth)); // 36 = padding ngoài (18*2)
  const isTablet = width >= 768;

  // scale nhẹ cho font/padding (optional nhưng rất hữu ích)
  const scale = Math.min(Math.max(width / 375, 0.95), 1.15);
  const s = (n: number) => Math.round(n * scale);

  useFocusEffect(
    useCallback(() => {
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      setShowOld(false);
      setShowNew(false);
      setShowConfirm(false);

      setSubmitting(false);

      return () => {};
    }, []),
  );

  // Kết nối tới endpoint change password
  const CHANGE_PASSWORD_PATH = ENDPOINTS.AUTH_CHANGE_PASSWORD;

  // Kiểm tra thông tin của request
  const validate = () => {
    const o = oldPassword.trim();
    const n = newPassword.trim();
    const c = confirmNewPassword.trim();

    if (!o) {
      Alert.alert("Insufficient information", "Please enter the old password.");
      return false;
    }
    if (!n) {
      Alert.alert("Incomplete information", "Please enter a new password.");
      return false;
    }
    if (!c) {
      Alert.alert(
        "Information missing",
        "Please enter the new password for confirmation.",
      );
      return false;
    }
    if (n !== c) {
      Alert.alert(
        "Doesn't match",
        "New password and password confirmation don't match.",
      );
      return false;
    }
    if (o === n) {
      Alert.alert(
        "Invalid",
        "New password must not be the same as the old password.",
      );
      return false;
    }
    if (n.length < 6) {
      Alert.alert("Invalid", "New password must have at least 6 characters.");
      return false;
    }
    return true;
  };

  // Gửi request lên server
  const onSubmit = async () => {
    if (submitting) {
      return;
    }
    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);

      await api.patch(CHANGE_PASSWORD_PATH, {
        old_password: oldPassword.trim(),
        new_password: newPassword.trim(),
        confirm_password: confirmNewPassword.trim(),
      });

      Alert.alert("Success", "Password changed successfully.", [
        {
          text: "OK",
          onPress: () => {
            setOldPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            router.back();
          },
        },
      ]);
    } catch (err: any) {
      Alert.alert("Failure", err?.message ?? "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={["#050B1C", "#071A2F", "#0B1F3B", "#06122A"]}
        locations={[0, 0.35, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { justifyContent: width >= 992 ? "center" : "flex-start" },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={[styles.header, { width: pageWidth }]}>
            <View style={styles.logoBadge}>
              <Ionicons name="key-outline" size={20} color="#0A1630" />
            </View>

            <Text
              style={[
                styles.title,
                {
                  fontSize: isTablet ? s(26) : s(22),
                  lineHeight: isTablet ? s(30) : s(26),
                },
              ]}
            >
              CHANGE PASSWORD
            </Text>

            <Text style={styles.sub}>
              Update your password to secure your account
            </Text>
          </View>

          {/* Card */}
          <View
            style={[
              styles.card,
              { width: pageWidth, padding: s(16), borderRadius: s(24) },
            ]}
          >
            {/* Old password */}
            <View
              style={[styles.inputWrap, { height: s(54), borderRadius: s(16) }]}
            >
              <View style={styles.inputIcon}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="#E7C06B"
                />
              </View>

              <TextInput
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholder="Old password"
                placeholderTextColor="rgba(255,255,255,0.55)"
                secureTextEntry={!showOld}
                style={[styles.input, { paddingRight: 44 }]}
              />

              <Pressable
                onPress={() => setShowOld((v) => !v)}
                style={({ pressed }) => [
                  styles.eyeBtn,
                  pressed && { opacity: 0.75 },
                ]}
                hitSlop={10}
              >
                <Ionicons
                  name={showOld ? "eye-outline" : "eye-off-outline"}
                  size={18}
                  color="rgba(255,255,255,0.70)"
                />
              </Pressable>
            </View>

            {/* New password */}
            <View style={styles.inputWrap}>
              <View
                style={[
                  styles.inputIcon,
                  { width: s(34), height: s(34), borderRadius: s(12) },
                ]}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color="#E7C06B"
                />
              </View>

              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New password"
                placeholderTextColor="rgba(255,255,255,0.55)"
                secureTextEntry={!showNew}
                style={[styles.input, { paddingRight: 44 }]}
              />

              <Pressable
                onPress={() => setShowNew((v) => !v)}
                style={({ pressed }) => [
                  styles.eyeBtn,
                  pressed && { opacity: 0.75 },
                ]}
                hitSlop={10}
              >
                <Ionicons
                  name={showNew ? "eye-outline" : "eye-off-outline"}
                  size={18}
                  color="rgba(255,255,255,0.70)"
                />
              </Pressable>
            </View>

            {/* Confirm new password */}
            <View style={styles.inputWrap}>
              <View style={styles.inputIcon}>
                <Ionicons
                  name="checkmark-done-outline"
                  size={18}
                  color="#E7C06B"
                />
              </View>

              <TextInput
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                placeholder="Confirm new password"
                placeholderTextColor="rgba(255,255,255,0.55)"
                secureTextEntry={!showConfirm}
                style={[styles.input, { paddingRight: 44 }]}
              />

              <Pressable
                onPress={() => setShowConfirm((v) => !v)}
                style={({ pressed }) => [
                  styles.eyeBtn,
                  pressed && { opacity: 0.75 },
                ]}
                hitSlop={10}
              >
                <Ionicons
                  name={showConfirm ? "eye-outline" : "eye-off-outline"}
                  size={18}
                  color="rgba(255,255,255,0.70)"
                />
              </Pressable>
            </View>

            {/* Buttons */}
            <Pressable
              onPress={onSubmit}
              disabled={submitting}
              style={({ pressed }) => [
                styles.primaryBtn,
                submitting && { opacity: 0.6 },
                pressed &&
                  !submitting && {
                    transform: [{ scale: 0.99 }],
                    opacity: 0.95,
                  },
              ]}
            >
              <Ionicons name="save-outline" size={18} color="#0A1630" />
              <Text style={styles.primaryText}>
                {submitting ? "Saving..." : "Save changes"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.back()}
              disabled={submitting}
              style={({ pressed }) => [
                styles.secondaryBtn,
                pressed && !submitting && { opacity: 0.9 },
                submitting && { opacity: 0.6 },
              ]}
            >
              <Ionicons name="arrow-back-outline" size={18} color="#E7C06B" />
              <Text style={styles.secondaryText}>Come back</Text>
            </Pressable>

            <Text style={styles.hint}>
              Tip: A new password should include uppercase letters, lowercase
              letters, and numbers to make it stronger.
            </Text>
          </View>

          <View style={{ height: 28 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: "#0A1630" },

  container: {
    minHeight: undefined,
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 28,
    alignItems: "center",
  },

  header: {
    width: "100%",
    alignItems: "center",
    marginTop: 130,
    marginBottom: 14,
  },

  logoBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#E7C06B",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  title: {
    color: "#E7C06B",
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  sub: {
    marginTop: 8,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "700",
    fontSize: 13.5,
    textAlign: "center",
  },

  card: {
    width: "100%",
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 24,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
  },

  inputWrap: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#0E2B58",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 12,
  },

  inputIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(231,192,107,0.16)",
    borderWidth: 1,
    borderColor: "rgba(231,192,107,0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  input: {
    flex: 1,
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14.5,
  },

  eyeBtn: {
    position: "absolute",
    right: 12,
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },

  primaryBtn: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#E7C06B",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: "#E7C06B",
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    marginTop: 6,
  },
  primaryText: {
    color: "#0A1630",
    fontWeight: "900",
    fontSize: 16,
  },

  secondaryBtn: {
    marginTop: 10,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#0E2B58",
    borderWidth: 1,
    borderColor: "rgba(231,192,107,0.35)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  secondaryText: {
    color: "#E7C06B",
    fontWeight: "900",
    fontSize: 15,
  },

  hint: {
    marginTop: 12,
    color: "rgba(15,23,42,0.55)",
    fontWeight: "800",
    fontSize: 12,
    textAlign: "center",
  },
});
