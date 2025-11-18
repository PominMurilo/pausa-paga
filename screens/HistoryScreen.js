import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PAUSES_KEY = '@pausepay:pauses';

const CATEGORIES = [
  'Sem categoria',
  'Almoço',
  'Café',
  'Banheiro',
  'Pausa rápida',
  'Alongamento',
  'Outro',
];

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function formatCurrency(value) {
  if (!value || isNaN(value)) return 'R$ 0,00';
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function formatDateTime(isoString) {
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');

  const datePart = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  const timePart = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  return `${datePart} ${timePart}`;
}

export default function HistoryScreen({ goToTimer, config }) {
  const [pauses, setPauses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedPauseForCategory, setSelectedPauseForCategory] = useState(null); // para o modal

  async function loadPauses() {
    try {
      const stored = await AsyncStorage.getItem(PAUSES_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      setPauses(parsed);
    } catch (error) {
      console.log('Erro ao carregar pausas:', error);
      Alert.alert('Erro', 'Não foi possível carregar o histórico de pausas.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPauses();
  }, []);

  async function handleDeletePause(id) {
    try {
      const updated = pauses.filter((p) => p.id !== id);
      setPauses(updated);
      await AsyncStorage.setItem(PAUSES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.log('Erro ao excluir pausa:', error);
      Alert.alert('Erro', 'Não foi possível excluir essa pausa.');
    }
  }

  function openCategoryModal(pause) {
    setSelectedPauseForCategory(pause);
  }

  function closeCategoryModal() {
    setSelectedPauseForCategory(null);
  }

  async function handleSelectCategory(category) {
    if (!selectedPauseForCategory) return;

    try {
      const updated = pauses.map((p) =>
        p.id === selectedPauseForCategory.id ? { ...p, category } : p
      );
      setPauses(updated);
      await AsyncStorage.setItem(PAUSES_KEY, JSON.stringify(updated));
      closeCategoryModal();
    } catch (error) {
      console.log('Erro ao atualizar categoria:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a categoria.');
    }
  }

  // Estatísticas (hoje / mês)
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const pausesToday = pauses.filter((p) => {
    const d = new Date(p.startTime);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    return key === todayKey;
  });

  const pausesMonth = pauses.filter((p) => {
    const d = new Date(p.startTime);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  const totalSecondsToday = pausesToday.reduce(
    (acc, p) => acc + (p.durationSeconds || 0),
    0
  );
  const totalValueToday = pausesToday.reduce(
    (acc, p) => acc + (p.valueEarned || 0),
    0
  );

  const totalSecondsMonth = pausesMonth.reduce(
    (acc, p) => acc + (p.durationSeconds || 0),
    0
  );
  const totalValueMonth = pausesMonth.reduce(
    (acc, p) => acc + (p.valueEarned || 0),
    0
  );

  let percentRestToday = null;
  if (config && config.horasPorDia > 0) {
    const workSecondsToday = config.horasPorDia * 3600;
    percentRestToday = (totalSecondsToday / workSecondsToday) * 100;
  }

  function renderPause({ item }) {
    const categoryLabel = item.category || 'Sem categoria';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{categoryLabel}</Text>
          <Text style={styles.cardDate}>{formatDateTime(item.startTime)}</Text>
        </View>

        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Duração:</Text>
          <Text style={styles.cardValueHighlight}>{formatTime(item.durationSeconds)}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Valor descansado:</Text>
          <Text style={styles.cardValueHighlight}>{formatCurrency(item.valueEarned)}</Text>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.categoryButton}
            onPress={() => openCategoryModal(item)}
          >
            <Text style={styles.categoryButtonText}>
              Categoria: {categoryLabel}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() =>
              Alert.alert(
                'Excluir pausa',
                'Tem certeza que deseja excluir esta pausa?',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () => handleDeletePause(item.id),
                  },
                ]
              )
            }
          >
            <Text style={styles.deleteButtonText}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const hasPauses = pauses.length > 0;

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.title}>Histórico de Pausas</Text>
      <Text style={styles.subtitle}>
        Veja suas pausas, ajuste categorias e acompanhe seus descansos ao longo do tempo.
      </Text>

      <View style={styles.statsBox}>
        <Text style={styles.statsTitle}>Resumo de hoje</Text>
        <Text style={styles.statsText}>
          Tempo descansado:{' '}
          <Text style={styles.statsValue}>{formatTime(totalSecondsToday)}</Text>
        </Text>
        <Text style={styles.statsText}>
          Valor “ganho” descansando:{' '}
          <Text style={styles.statsValue}>{formatCurrency(totalValueToday)}</Text>
        </Text>
        {percentRestToday !== null && (
          <Text style={styles.statsText}>
            % do expediente em descanso:{' '}
            <Text style={styles.statsValue}>
              {percentRestToday.toFixed(1)}%
            </Text>
          </Text>
        )}
      </View>

      <View style={styles.statsBox}>
        <Text style={styles.statsTitle}>Resumo do mês</Text>
        <Text style={styles.statsText}>
          Tempo descansado:{' '}
          <Text style={styles.statsValue}>
            {formatTime(totalSecondsMonth)}
          </Text>
        </Text>
        <Text style={styles.statsText}>
          Valor “ganho” descansando:{' '}
          <Text style={styles.statsValue}>
            {formatCurrency(totalValueMonth)}
          </Text>
        </Text>
      </View>

      {isLoading ? (
        <Text style={styles.subtitle}>Carregando histórico...</Text>
      ) : !hasPauses ? (
        <Text style={styles.subtitle}>
          Você ainda não registrou nenhuma pausa. Volte para o cronômetro e comece uma.
        </Text>
      ) : (
        <FlatList
          data={pauses}
          keyExtractor={(item) => item.id}
          renderItem={renderPause}
          style={{ marginTop: 12 }}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      )}

      <TouchableOpacity style={styles.primaryButton} onPress={goToTimer}>
        <Text style={styles.primaryButtonText}>Voltar para o cronômetro</Text>
      </TouchableOpacity>

      {/* Modal de seleção de categoria */}
      <Modal
        visible={!!selectedPauseForCategory}
        transparent
        animationType="fade"
        onRequestClose={closeCategoryModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecionar categoria</Text>

            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={styles.modalOption}
                onPress={() => handleSelectCategory(cat)}
              >
                <Text style={styles.modalOptionText}>{cat}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.modalOption, styles.modalCancel]}
              onPress={closeCategoryModal}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    backgroundColor: '#050816',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f5f5f5',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#bbbbbb',
    marginBottom: 8,
  },
  statsBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#0b1020',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 4,
  },
  statsText: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },
  statsValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#a78bfa', // roxinho neon
  },
  primaryButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#7b61ff',
    shadowColor: '#7b61ff',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
  card: {
    marginTop: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#0b1020',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  cardDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  cardLabel: {
    fontSize: 13,
    color: '#9ca3af',
  },
  cardValueHighlight: {
    fontSize: 14,
    color: '#a78bfa',
    fontWeight: '700',
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#7b61ff',
    marginRight: 6,
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#e0e0ff',
  },
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#ef4444',
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 22, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#0b1020',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 8,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginTop: 4,
    backgroundColor: '#111827',
  },
  modalOptionText: {
    fontSize: 14,
    color: '#e5e7eb',
  },
  modalCancel: {
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  modalCancelText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
