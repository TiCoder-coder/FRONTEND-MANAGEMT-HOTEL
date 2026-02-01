import { api } from "@/src/api/client";
import { ENDPOINTS } from "@/src/api/endpoints";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
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
  View,
  useWindowDimensions,
} from "react-native";

import { PhoneNumberInput } from "../../../components/PhoneNumberInput";
import {
  PHONE_COUNTRIES,
  PhoneCountry,
} from "../../../constants/phoneCountries";

function toMessage(err: any) {
  const data = err?.response?.data;

  const msg =
    data?.message ??
    data?.error ??
    data?.detail ??
    data?.errors ??
    err?.message;

  if (typeof msg === "string") return msg;

  if (Array.isArray(msg)) {
    return msg.map(String).join("\n");
  }

  if (msg && typeof msg === "object") {
    try {
      return Object.entries(msg)
        .map(([k, v]) =>
          Array.isArray(v)
            ? `${k}: ${v.map(String).join(", ")}`
            : `${k}: ${String(v)}`,
        )
        .join("\n");
    } catch {
      return JSON.stringify(msg);
    }
  }

  return "An error occurred.";
}

export default function ResetPasswordScreen() {
  const router = useRouter();

  // Tinh chỉnh kích thước
  const { width } = useWindowDimensions();

  const pageMaxWidth = useMemo(() => {
    if (width >= 1200) return 720; // desktop/web/mac
    if (width >= 992) return 640; // tablet ngang
    if (width >= 768) return 560; // tablet
    return 520; // phone
  }, [width]);

  const pageWidth = Math.max(320, Math.min(width - 36, pageMaxWidth));
  const isWide = width >= 992;

  const [email, setEmail] = useState("");
  const [phoneCountry, setPhoneCountry] = useState<PhoneCountry>(() => {
    const vn = PHONE_COUNTRIES.find((c) => c.callingCode === "84");
    return vn ?? PHONE_COUNTRIES[0];
  });
  const [phoneNational, setPhoneNational] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [sendingOtp, setSendingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setEmail("");
      setPhoneNational("");
      setOtp("");
      setNewPassword("");
      setShowPw(false);

      setSendingOtp(false);
      setSubmitting(false);

      return () => {
        setSendingOtp(false);
        setSubmitting(false);
      };
    }, []),
  );

  const fullPhone = useMemo(() => {
    const national = (phoneNational || "").trim();
    if (!national) return "";
    return `+${phoneCountry.callingCode}${national}`;
  }, [phoneCountry.callingCode, phoneNational]);

  const sendOtp = async () => {
    const e = email.trim();
    if (!e) {
      Alert.alert(
        "Incomplete information",
        "Please enter your email address to receive the OTP.",
      );
      return;
    }

    setSendingOtp(true);
    try {
      const params = { email: e, type: "RESET_PASSWORD" as const };

      try {
        await api.post(ENDPOINTS.AUTH_OTP, undefined, { params });
        Alert.alert("Success", "OTP has been sent. Please check your email.");
        return;
      } catch {
        try {
          await api.post(ENDPOINTS.AUTH_OTP, params);
          Alert.alert("Success", "OTP has been sent. Please check your email.");
          return;
        } catch {
          await api.get(ENDPOINTS.AUTH_OTP, { params });
          Alert.alert("Success", "OTP has been sent. Please check your email.");
          return;
        }
      }
    } catch (err: any) {
      Alert.alert("OTP delivery failed ", toMessage(err));
    } finally {
      setSendingOtp(false);
    }
  };

  const onReset = async () => {
    const e = email.trim();
    const p = fullPhone;
    const o = otp.replace(/\D/g, "").trim(); // sạch 100%
    const otpNumber = Number(o);

    const np = newPassword;

    if (!e) {
      Alert.alert("Information missing", "Please enter the email address.");
      return;
    }
    if (!p) {
      Alert.alert("Missing information", "Please enter the phone number.");
      return;
    }

    if (!Number.isFinite(otpNumber)) {
      Alert.alert("Incomplete information", "Please enter the OTP.");
      return;
    }
    if (!np.trim()) {
      Alert.alert("Incomplete information", "Please enter a new password.");
      return;
    }
    if (np.trim().length < 6) {
      Alert.alert(
        "The password is too short",
        "The new password must be at least 6 characters long.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        email: e,
        phone: p,
        otp: otpNumber,
        new_password: np,
      };

      await api.post(ENDPOINTS.AUTH_RESET_PASSWORD, payload);

      Alert.alert(
        "Success",
        "Password changed successfully. Please log in again",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)/login"),
          },
        ],
      );
    } catch (err: any) {
      Alert.alert("Password reset failed", toMessage(err));
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
            { justifyContent: isWide ? "center" : "flex-start" },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={[styles.header, { width: pageWidth }]}>
            <View style={styles.logoBadge}>
              <Ionicons name="key-outline" size={20} color="#0A1630" />
            </View>

            <Text style={styles.title}>RESET</Text>
            <Text style={styles.title}>PASSWORD</Text>

            <Text style={styles.welcome}>Forgot your password?</Text>
            <Text style={styles.sub}>Enter info to reset</Text>
          </View>

          {/* Card */}
          <View style={[styles.card, { width: pageWidth }]}>
            {/* Email */}
            <View style={styles.inputWrap}>
              <View style={styles.inputIcon}>
                <Ionicons name="mail-outline" size={18} color="#E7C06B" />
              </View>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="rgba(255,255,255,0.55)"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            {/* Phone */}
            <PhoneNumberInput
              containerStyle={styles.inputWrap}
              inputStyle={styles.input}
              country={phoneCountry}
              onChangeCountry={setPhoneCountry}
              nationalNumber={phoneNational}
              onChangeNationalNumber={setPhoneNational}
              placeholder="Phone number"
            />

            {/* OTP row */}
            <View style={styles.otpRow}>
              <View style={[styles.inputWrap, styles.otpInputWrap]}>
                <View style={styles.inputIcon}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={18}
                    color="#E7C06B"
                  />
                </View>
                <TextInput
                  value={otp}
                  onChangeText={(t) => setOtp(t.replace(/\D/g, ""))} // chỉ giữ 0-9
                  placeholder="OTP"
                  placeholderTextColor="rgba(255,255,255,0.55)"
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>

              <Pressable
                onPress={sendOtp}
                disabled={sendingOtp}
                style={({ pressed }) => [
                  styles.sendOtpBtn,
                  sendingOtp && { opacity: 0.6 },
                  pressed &&
                    !sendingOtp && {
                      opacity: 0.9,
                      transform: [{ scale: 0.99 }],
                    },
                ]}
              >
                <Ionicons
                  name="paper-plane-outline"
                  size={16}
                  color="#0A1630"
                />
                <Text style={styles.sendOtpText}>
                  {sendingOtp ? "Sending..." : "Send OTP"}
                </Text>
              </Pressable>
            </View>

            {/* New password */}
            <View style={styles.inputWrap}>
              <View style={styles.inputIcon}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="#E7C06B"
                />
              </View>

              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New password"
                placeholderTextColor="rgba(255,255,255,0.55)"
                secureTextEntry={!showPw}
                style={[styles.input, { paddingRight: 44 }]}
              />

              <Pressable
                onPress={() => setShowPw((v) => !v)}
                style={({ pressed }) => [
                  styles.eyeBtn,
                  pressed && { opacity: 0.75 },
                ]}
                hitSlop={10}
              >
                <Ionicons
                  name={showPw ? "eye-outline" : "eye-off-outline"}
                  size={18}
                  color="rgba(255,255,255,0.70)"
                />
              </Pressable>
            </View>

            {/* Submit */}
            <Pressable
              onPress={onReset}
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
              <Ionicons name="refresh-outline" size={18} color="#0A1630" />
              <Text style={styles.primaryText}>
                {submitting ? "Processing..." : "Reset Password"}
              </Text>
            </Pressable>

            {/* Back */}
            <Pressable
              onPress={() => router.replace("/(auth)/login")}
              style={({ pressed }) => [
                styles.backBtn,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Ionicons name="arrow-back-outline" size={16} color="#8B5A00" />
              <Text style={styles.backText}>Back to Login</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: "#0A1630" },

  container: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "android" ? 42 : 26,
    paddingBottom: 26,
    alignItems: "center",
  },

  header: {
    width: "100%",
    alignItems: "center",
    marginTop: 72,
    marginBottom: 16,
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
    fontSize: 22,
    letterSpacing: 0.5,
    lineHeight: 26,
  },

  welcome: {
    marginTop: 10,
    color: "rgba(255,255,255,0.92)",
    fontWeight: "900",
    fontSize: 20,
  },
  sub: {
    marginTop: 4,
    color: "rgba(255,255,255,0.70)",
    fontWeight: "700",
    fontSize: 14,
  },

  card: {
    width: "100%",
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

  otpRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  otpInputWrap: {
    flex: 1,
    marginBottom: 0,
  },
  sendOtpBtn: {
    height: 54,
    borderRadius: 16,
    minWidth: 140,
    backgroundColor: "#E7C06B",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    shadowColor: "#E7C06B",
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  sendOtpText: {
    color: "#0A1630",
    fontWeight: "900",
    fontSize: 13,
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
    marginTop: 4,
  },
  primaryText: {
    color: "#0A1630",
    fontWeight: "900",
    fontSize: 16,
  },

  backBtn: {
    marginTop: 12,
    alignSelf: "center",
    flexDirection: "row",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  backText: {
    color: "#8B5A00",
    fontWeight: "900",
    fontSize: 13.5,
  },
});
