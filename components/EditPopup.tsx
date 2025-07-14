import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import LongButton from "./LongButton";
import InputField from "./InputField";


interface EditModalProps {
  visible: boolean;
  type: "info" | "password";
  values: any;
  onChange: (key: string, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function EditPopup({
  visible,
  type,
  values,
  onChange,
  onClose,
  onSubmit,
}: EditModalProps) {
  const isPassword = type === "password";

  const formatLabel = (key: string) => {
    switch (key) {
      case "current":
        return "Current Password";
      case "new":
        return "New Password";
      case "confirm":
        return "Confirm New Password";
      default:
        return key;
    }
  };

  return (
<Modal visible={visible} transparent animationType="slide">
  <View style={styles.overlay}>
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
        onClose();
      }}
    >
      <View style={styles.backdrop} />
    </TouchableWithoutFeedback>

    <View style={styles.modal}>
      {isPassword ? <Text style={styles.modalTitle}>Change Password</Text> : ""}
      

      {Object.entries(values).map(([key, value]) => (
  <InputField
    key={key}
    label={formatLabel(key)}
    value={value}
    onChange={(text) => onChange(key, text)}
    placeholder={formatLabel(key)}
    secureTextEntry={isPassword}
    icon="key"
  />
))}

      <LongButton label={isPassword ? "Change" : "Save"} onPress={onSubmit} />
    </View>
  </View>
</Modal>

  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.01)",
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 26,
    textAlign: "center",
    color: "#111827",
  },
});
