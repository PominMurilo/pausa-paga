import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

export default function ConfigScreen({ initialConfig, onSave }) {
  const [salarioMensal, setSalarioMensal] = useState(
    initialConfig?.salarioMensal ? String(initialConfig.salarioMensal) : ''
  );
  const [horasPorDia, setHorasPorDia] = useState(
    initialConfig?.horasPorDia ? String(initialConfig.horasPorDia) : ''
  );

  function handleSave() {
    const salario = Number(salarioMensal.replace(',', '.').trim());
    const horas = Number(horasPorDia.replace(',', '.').trim());

    if (!salario || salario <= 0 || isNaN(salario)) {
      Alert.alert('Atenção', 'Informe um salário mensal válido.');
      return;
    }

    if (!horas || horas <= 0 || horas > 24 || isNaN(horas)) {
      Alert.alert('Atenção', 'Informe uma quantidade de horas por dia válida.');
      return;
    }

    const config = {
      salarioMensal: salario,
      horasPorDia: horas,
    };

    onSave(config);
  }

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.title}>Configurações iniciais</Text>
      <Text style={styles.subtitle}>
        Vamos personalizar o app com base no seu salário e na sua jornada diária.
      </Text>

      <View style={{ marginTop: 16 }}>
        <Text style={styles.inputLabel}>Salário mensal bruto (R$)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 3000"
          placeholderTextColor="#666a80"
          keyboardType="numeric"
          value={salarioMensal}
          onChangeText={setSalarioMensal}
        />

        <Text style={[styles.inputLabel, { marginTop: 16 }]}>
          Horas trabalhadas por dia
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 8"
          placeholderTextColor="#666a80"
          keyboardType="numeric"
          value={horasPorDia}
          onChangeText={setHorasPorDia}
        />

        <Text style={[styles.subtitle, { marginTop: 8 }]}>
          * Vamos considerar uma média de 22 dias úteis por mês para os cálculos.
        </Text>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
        <Text style={styles.primaryButtonText}>Salvar e ir para o cronômetro</Text>
      </TouchableOpacity>
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
  inputLabel: {
    fontSize: 13,
    color: '#e0e0ff',
    marginBottom: 4,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#111827',
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#1f2937',
    fontSize: 14,
  },
  primaryButton: {
    marginTop: 24,
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
});
