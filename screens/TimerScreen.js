import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle } from 'react-native-svg';

const PAUSES_KEY = '@pausepay:pauses';
const ACTIVE_PAUSE_KEY = '@pausepay:activePause';

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

export default function TimerScreen({ config, goToHistory, goToConfig }) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [pauseStartTime, setPauseStartTime] = useState(null); // ISO string

  const diasUteisMes = 22;
  const valorHora = config
    ? config.salarioMensal / (diasUteisMes * config.horasPorDia)
    : 0;
  const valorSegundo = valorHora / 3600;
  const valorDescansando = elapsedSeconds * valorSegundo;

  // Dimensões do círculo
  const size = 240;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Progresso: segundos atuais dentro do minuto (0 a 59)
  const secondsWithinMinute = elapsedSeconds % 60;
  const progress = secondsWithinMinute / 60; // 0 a 1
  const strokeDashoffset = circumference * (1 - progress);

  // Ao montar, verifica se existe pausa ativa salva
  useEffect(() => {
    async function loadActivePause() {
      try {
        const stored = await AsyncStorage.getItem(ACTIVE_PAUSE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.startTime) {
            const start = new Date(parsed.startTime).getTime();
            const now = Date.now();
            const seconds = Math.max(0, Math.floor((now - start) / 1000));
            setPauseStartTime(parsed.startTime);
            setElapsedSeconds(seconds);
            setIsRunning(true);
            console.log('Pausa ativa recuperada:', parsed);
          }
        }
      } catch (error) {
        console.log('Erro ao carregar pausa ativa:', error);
      }
    }

    loadActivePause();
  }, []);

  // Intervalo do cronômetro (baseado na diferença de tempo real)
  useEffect(() => {
    let interval = null;

    if (isRunning && pauseStartTime) {
      interval = setInterval(() => {
        const start = new Date(pauseStartTime).getTime();
        const now = Date.now();
        const seconds = Math.max(0, Math.floor((now - start) / 1000));
        setElapsedSeconds(seconds);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, pauseStartTime]);

  if (!config) {
    // fallback de segurança: se não tiver config, manda pra tela de config
    return (
      <View style={styles.screenContainer}>
        <Text style={styles.title}>Cronômetro de Pausa</Text>
        <Text style={styles.subtitle}>
          Não encontramos suas configurações. Volte e preencha seu salário e jornada.
        </Text>

        <TouchableOpacity style={styles.primaryButton} onPress={goToConfig}>
          <Text style={styles.primaryButtonText}>Ir para configurações</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function savePauseRecord(durationSeconds, valueEarned, start, end) {
    try {
      const newRecord = {
        id: String(Date.now()),
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        durationSeconds,
        valueEarned,
        category: null, // será definido depois na tela de histórico
      };

      const stored = await AsyncStorage.getItem(PAUSES_KEY);
      const parsed = stored ? JSON.parse(stored) : [];

      const updated = [newRecord, ...parsed]; // adiciona no topo
      await AsyncStorage.setItem(PAUSES_KEY, JSON.stringify(updated));

      console.log('Pausa salva:', newRecord);
    } catch (error) {
      console.log('Erro ao salvar pausa:', error);
      Alert.alert(
        'Erro',
        'Não foi possível salvar a pausa no histórico.'
      );
    }
  }

  async function handleToggleTimer() {
    if (!isRunning) {
      // Iniciar nova pausa: salva horário de início no AsyncStorage
      const start = new Date();
      const startISO = start.toISOString();

      setPauseStartTime(startISO);
      setElapsedSeconds(0);
      setIsRunning(true);

      try {
        await AsyncStorage.setItem(
          ACTIVE_PAUSE_KEY,
          JSON.stringify({ startTime: startISO })
        );
      } catch (error) {
        console.log('Erro ao salvar pausa ativa:', error);
      }
    } else {
      // Encerrar pausa: calcula duração com base em datas, salva e limpa estado
      setIsRunning(false);

      try {
        if (pauseStartTime) {
          const start = new Date(pauseStartTime);
          const end = new Date();
          const diffMs = end.getTime() - start.getTime();
          const durationSeconds = Math.max(0, Math.floor(diffMs / 1000));
          const valueEarned = durationSeconds * valorSegundo;

          if (durationSeconds > 0) {
            await savePauseRecord(durationSeconds, valueEarned, start, end);
          }
        }

        await AsyncStorage.removeItem(ACTIVE_PAUSE_KEY);
      } catch (error) {
        console.log('Erro ao finalizar pausa ativa:', error);
      } finally {
        setElapsedSeconds(0);
        setPauseStartTime(null);
      }
    }
  }

  const mainButtonLabel = isRunning ? 'Encerrar pausa' : 'Iniciar pausa';

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.title}>Cronômetro de Pausa</Text>
      <Text style={styles.subtitle}>
        Acompanhe quanto tempo você está descansando e quanto está “ganhando” nesse intervalo.
      </Text>

      <View style={styles.circleWrapper}>
        <View style={styles.circleShadow}>
          <Svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
          >
            {/* trilho de fundo */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#1f2937"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* círculo de progresso */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#a78bfa"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              fill="none"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>

          <View style={styles.circleCenter}>
            <Text style={styles.bigNumber}>{formatTime(elapsedSeconds)}</Text>
            <Text style={styles.circleSubtitle}>
              {formatCurrency(valorDescansando)}
            </Text>
            <Text style={styles.circleSubtitleSmall}>descansando</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.mainButton} onPress={handleToggleTimer}>
        <Text style={styles.mainButtonText}>{mainButtonLabel}</Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Salário: R$ {config.salarioMensal.toFixed(2).replace('.', ',')} | Jornada:{' '}
          {config.horasPorDia}h/dia
        </Text>
        <Text style={styles.infoText}>
          Valor aproximado da hora: {formatCurrency(valorHora)}
        </Text>
      </View>

      <View style={styles.row}>
        <TouchableOpacity style={styles.secondaryButton} onPress={goToHistory}>
          <Text style={styles.secondaryButtonText}>Ver histórico</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={goToConfig}>
          <Text style={styles.secondaryButtonText}>Configurações</Text>
        </TouchableOpacity>
      </View>
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
    textAlign: 'center',
  },
  circleWrapper: {
    marginVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleShadow: {
    borderRadius: 999,
    padding: 12,
    backgroundColor: '#050816',
    shadowColor: '#7b61ff',
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  circleCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigNumber: {
    fontSize: 34,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  circleSubtitle: {
    fontSize: 16,
    color: '#a78bfa',
    marginTop: 6,
    fontWeight: '600',
  },
  circleSubtitleSmall: {
    fontSize: 12,
    color: '#9ca3af',
  },
  mainButton: {
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    backgroundColor: '#7b61ff',
    shadowColor: '#7b61ff',
    shadowOpacity: 0.7,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  mainButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  infoBox: {
    marginTop: 24,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#0b1020',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  infoText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    marginTop: 24,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7b61ff',
    marginHorizontal: 4,
  },
  secondaryButtonText: {
    color: '#e0e0ff',
    fontWeight: '500',
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
