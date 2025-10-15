import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { XMarkIcon } from 'react-native-heroicons/outline';

type MenuItem = {
  name: string;
  description: string;
  price: string;
  rating: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onAdd: () => void;
  item: MenuItem | null;
};

const CustomAlertModal = ({ visible, onClose, onAdd, item }: Props) => {
  if (!item) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{item.name}</Text>
            <TouchableOpacity onPress={onClose}>
              <XMarkIcon size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.price}>Price: {item.price}</Text>
          <Text style={styles.rating}>Rating: {item.rating}⭐</Text>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
              <Text style={styles.addText}>Add to Trip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlertModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  description: {
    marginTop: 10,
    fontSize: 14,
    color: '#555',
  },
  price: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '500',
  },
  rating: {
    fontSize: 14,
    color: '#999',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  cancelBtn: {
    marginRight: 15,
  },
  cancelText: {
    color: '#f44336',
    fontWeight: '500',
  },
  addBtn: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addText: {
    color: 'white',
    fontWeight: '600',
  },
});
