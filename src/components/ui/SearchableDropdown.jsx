import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, Modal,
} from 'react-native';

export default function SearchableDropdown({
  items = [],          // [{ label, value }]
  value,
  onSelect,
  placeholder = 'Search...',
  allowOther = false,
  otherLabel = 'Other',
  label,
  style,
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const selectedItem = items.find((i) => i.value === value);

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item) => {
    onSelect?.(item.value);
    setQuery('');
    setOpen(false);
  };

  const handleOther = () => {
    if (query.trim()) {
      onSelect?.(query.trim());
      setQuery('');
      setOpen(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)} activeOpacity={0.7}>
        <Text style={[styles.triggerText, !selectedItem && styles.placeholder]}>
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => { setOpen(false); setQuery(''); }}
        >
          <View style={styles.dropdown} onStartShouldSetResponder={() => true}>
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder={placeholder}
              placeholderTextColor="#94a3b8"
              autoFocus
            />
            <FlatList
              data={filtered}
              keyExtractor={(item) => String(item.value)}
              keyboardShouldPersistTaps="handled"
              style={styles.list}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.item, item.value === value && styles.itemActive]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={[styles.itemText, item.value === value && styles.itemTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                allowOther && query.trim() ? (
                  <TouchableOpacity style={styles.item} onPress={handleOther}>
                    <Text style={styles.itemText}>
                      {otherLabel}: "{query.trim()}"
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.emptyText}>No results</Text>
                )
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  label: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  triggerText: {
    color: '#1e293b',
    fontSize: 15,
    flex: 1,
  },
  placeholder: {
    color: '#94a3b8',
  },
  chevron: {
    color: '#64748b',
    fontSize: 14,
    marginLeft: 8,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxHeight: 400,
    overflow: 'hidden',
  },
  searchInput: {
    padding: 14,
    fontSize: 16,
    color: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  list: {
    maxHeight: 320,
  },
  item: {
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f1f5f9',
  },
  itemActive: {
    backgroundColor: '#eef2ff',
  },
  itemText: {
    color: '#1e293b',
    fontSize: 15,
  },
  itemTextActive: {
    color: '#6366f1',
    fontWeight: '600',
  },
  emptyText: {
    padding: 14,
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
  },
});
