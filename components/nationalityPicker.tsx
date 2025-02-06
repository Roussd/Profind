import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Platform,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import countries from 'world-countries';

const nationalityData = countries.map(country => ({
  code: country.cca2,
  name: country.name.common,
}));

interface NationalityPickerProps {
  selectedNationality: string;
  onSelect: (nationality: string) => void;
}

const NationalityPicker: React.FC<NationalityPickerProps> = ({ selectedNationality, onSelect }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNationalities, setFilteredNationalities] = useState(nationalityData);

  useEffect(() => {
    if (searchQuery) {
      const filtered = nationalityData.filter(nation =>
        nation.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredNationalities(filtered);
    } else {
      setFilteredNationalities(nationalityData);
    }
  }, [searchQuery]);

  const getEmojiFlag = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const handleSelect = (nation: { code: string; name: string }) => {
    onSelect(nation.name);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setModalVisible(true)}
        accessibilityLabel="Seleccionar nacionalidad"
      >
        <Text style={styles.selectedText}>
          {selectedNationality 
            ? `${getEmojiFlag(nationalityData.find(n => n.name === selectedNationality)?.code || '')} ${selectedNationality}` 
            : 'Nacionalidad'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>
      
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Seleccionar Nacionalidad</Text>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar nacionalidad..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
          />
          <FlatList
            data={filteredNationalities}
            keyExtractor={(item) => item.code}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={styles.emptyText}>No se encontraron nacionalidades</Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.item,
                  selectedNationality === item.name && styles.selectedItem,
                ]}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.itemText}>
                  {getEmojiFlag(item.code)} {item.name}
                </Text>
              </TouchableOpacity>
            )}
            getItemLayout={(data, index) => ({ length: 50, offset: 50 * index, index })}
            initialNumToRender={20}
            maxToRenderPerBatch={10}
            windowSize={10}
            nestedScrollEnabled={true}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
  },
  input: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 50,
  },
  selectedText: {
    fontSize: 16,
    color: '#333',
    flexShrink: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
    color: '#333',
  },
  searchInput: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    fontSize: 16,
    margin: 16,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  selectedItem: {
    backgroundColor: '#F5F5F5',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  emptyText: {
    padding: 15,
    textAlign: 'center',
    color: '#666',
  },
});

export default NationalityPicker;
