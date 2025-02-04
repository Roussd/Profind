import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import countries from 'country-list';

const countryData = countries.getData();

interface CountryPickerProps {
  selectedCountry: string;
  onSelect: (country: string) => void;
}

const CountryPicker: React.FC<CountryPickerProps> = ({ selectedCountry, onSelect }) => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCountries, setFilteredCountries] = useState(countryData);

  useEffect(() => {
    if (searchQuery) {
      const filtered = countryData.filter(country =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCountries(filtered);
    } else {
      setFilteredCountries(countryData);
    }
  }, [searchQuery]);

  const getEmojiFlag = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const handleSelect = (country: { code: string; name: string }) => {
    onSelect(country.name);
    setDropdownVisible(false);
    setSearchQuery('');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setDropdownVisible((prev) => !prev)}
        accessibilityLabel="Seleccionar país"
      >
        <Text style={styles.selectedText}>
          {selectedCountry ? 
            `${getEmojiFlag(countryData.find(c => c.name === selectedCountry)?.code || '')} ${selectedCountry}` 
            : 'Seleccione un país'}
        </Text>
        <Ionicons
          name={isDropdownVisible ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#666"
        />
      </TouchableOpacity>

      {isDropdownVisible && (
        <View style={styles.dropdown}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar país..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={Platform.OS === 'web'}
          />
          
          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.code}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={styles.emptyText}>No se encontraron países</Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.item,
                  selectedCountry === item.name && styles.selectedItem
                ]}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.itemText}>
                  {getEmojiFlag(item.code)} {item.name}
                </Text>
              </TouchableOpacity>
            )}
            getItemLayout={(data, index) => (
              {length: 50, offset: 50 * index, index}
            )}
            initialNumToRender={20}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
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
  dropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    maxHeight: 300,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    fontSize: 16,
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

export default CountryPicker;