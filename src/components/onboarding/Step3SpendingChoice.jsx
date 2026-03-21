import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

export default function Step3SpendingChoice({ onChoose }) {
  const [showGmailModal, setShowGmailModal] = useState(false);

  return (
    <View>
      <Text style={styles.stepTitle}>How do you want to enter spending?</Text>
      <Text style={styles.stepDesc}>
        We need your monthly spending to find the best reward cards for you.
      </Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => setShowGmailModal(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.cardIcon}>📧</Text>
        <Text style={styles.cardTitle}>Connect Gmail</Text>
        <Text style={styles.cardDesc}>
          We'll scan receipts and statements to auto-detect your spending categories.
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Fastest</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => onChoose('manual')}
        activeOpacity={0.7}
      >
        <Text style={styles.cardIcon}>✏️</Text>
        <Text style={styles.cardTitle}>Enter Manually</Text>
        <Text style={styles.cardDesc}>
          Use sliders to estimate your monthly spending in each category.
        </Text>
        <View style={[styles.badge, styles.badgeAlt]}>
          <Text style={[styles.badgeText, styles.badgeTextAlt]}>2 min</Text>
        </View>
      </TouchableOpacity>

      {/* Coming Soon Modal */}
      <Modal visible={showGmailModal} transparent animationType="fade">
        <View style={styles.backdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalIcon}>🚧</Text>
            <Text style={styles.modalTitle}>Coming Soon!</Text>
            <Text style={styles.modalDesc}>
              Gmail integration is being built and will be available in a future update.
              For now, please enter your spending manually — it only takes a couple of minutes!
            </Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                setShowGmailModal(false);
                onChoose('manual');
              }}
            >
              <Text style={styles.modalBtnText}>Enter Manually</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowGmailModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  stepTitle: {
    color: '#1e293b',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  stepDesc: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    position: 'relative',
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  cardTitle: {
    color: '#1e293b',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardDesc: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
  },
  badge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeAlt: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextAlt: {
    color: '#64748b',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  modalIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  modalTitle: {
    color: '#1e293b',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalDesc: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalClose: {
    paddingVertical: 10,
  },
  modalCloseText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
});
