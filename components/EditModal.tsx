import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

interface EditModalProps {
  visible: boolean;
  type: "info" | "password";
  values: any;
  onChange: (key: string, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function EditModal({
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
   <Modal visible={visible} transparent animationType="fade">
  <View style={styles.overlay}>
    {/* Backdrop closes modal and dismisses keyboard */}
    <TouchableWithoutFeedback onPress={() => {
      Keyboard.dismiss();
      onClose();
    }}>
      <View style={styles.backdrop} />
    </TouchableWithoutFeedback>

    {/* Modal content without TouchableWithoutFeedback */}
    <View style={styles.modal}>
      <Text style={styles.modalTitle}>
        {isPassword ? "Change Password" : "Edit User Info"}
      </Text>

      {Object.entries(values).map(([key, value]) => (
        <TextInput
          key={key}
          placeholder={formatLabel(key)}
          secureTextEntry={isPassword}
          style={styles.input}
          value={value}
          onChangeText={(text) => onChange(key, text)}
        />
      ))}

      <TouchableOpacity style={styles.saveButton} onPress={onSubmit}>
        <Text style={styles.saveButtonText}>
          {isPassword ? "Change" : "Save"}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.01)",
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
    color: "#111827",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#f9fafb",
  },
  saveButton: {
    backgroundColor: "#008080",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
