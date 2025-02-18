import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface BirthDatePickerProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

const BirthDatePicker: React.FC<BirthDatePickerProps> = ({ selectedDate, onSelect }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(selectedDate);

  const handleDateChange = (event: any, date?: Date) => {
    if (date) {
      setTempDate(date);
    }
    if (Platform.OS === 'android') {
      if (event.type === 'set' && date) {
        onSelect(date);
      }
      setShowDatePicker(false);
    }
  };

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleConfirm = () => {
    onSelect(tempDate);
    setShowDatePicker(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.input}
        onPress={() => {
          setTempDate(selectedDate);
          setShowDatePicker(true);
        }}
      >
        <Text style={styles.selectedText}>
          {selectedDate ? formatDate(selectedDate) : 'Selecciona tu fecha'}
        </Text>
        <Ionicons name="calendar-outline" size={24} color="#4F46E5" />
      </TouchableOpacity>

      {showDatePicker && Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                textColor="#333"
                onChange={handleDateChange}
                maximumDate={new Date()}
                minimumDate={new Date(new Date().getFullYear() - 120, 0, 1)}
                style={styles.datePicker}
              />
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: '#ccc', marginTop: 8 }]}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={[styles.confirmButtonText, { color: '#333' }]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="spinner"
          onChange={handleDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(new Date().getFullYear() - 120, 0, 1)}
          style={styles.datePicker}
          locale="es-ES"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    padding: 12,
    fontSize: 16,
  },
  selectedText: {
    fontSize: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmButton: {
    backgroundColor: '#4F46E5',
    marginTop: 16,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  datePicker: {
    width: '100%',
  },
});

export default BirthDatePicker;
