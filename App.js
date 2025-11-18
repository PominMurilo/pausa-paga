import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ConfigScreen from './screens/ConfigScreen';
import TimerScreen from './screens/TimerScreen';
import HistoryScreen from './screens/HistoryScreen';

const CONFIG_KEY = '@pausepay:config';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('config'); // 'config' | 'timer' | 'history'
  const [config, setConfig] = useState(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  useEffect(() => {
    async function loadConfig() {
      try {
        const stored = await AsyncStorage.getItem(CONFIG_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log('Config carregada do AsyncStorage:', parsed);
          setConfig(parsed);
          setCurrentScreen('timer'); // se já tem config, vai direto pro cronômetro
        } else {
          console.log('Nenhuma config encontrada, fica na tela de config.');
          setCurrentScreen('config');
        }
      } catch (error) {
        console.log('Erro ao carregar config:', error);
        setCurrentScreen('config');
      } finally {
        setIsLoadingConfig(false);
      }
    }

    loadConfig();
  }, []);

  async function handleSaveConfig(newConfig) {
    try {
      await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
      console.log('Config salva no AsyncStorage:', newConfig);
      setConfig(newConfig);
      setCurrentScreen('timer');
    } catch (error) {
      console.log('Erro ao salvar config:', error);
      Alert.alert(
        'Erro',
        'Não foi possível salvar as configurações. Tente novamente.'
      );
    }
  }

  let content = null;

  if (isLoadingConfig) {
    content = (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={[styles.loadingText, { marginTop: 8 }]}>Carregando...</Text>
      </View>
    );
  } else if (currentScreen === 'config') {
    content = (
      <ConfigScreen
        initialConfig={config}
        onSave={handleSaveConfig}
      />
    );
  } else if (currentScreen === 'timer') {
    content = (
      <TimerScreen
        config={config}
        goToHistory={() => setCurrentScreen('history')}
        goToConfig={() => setCurrentScreen('config')}
      />
    );
  } else if (currentScreen === 'history') {
    content = (
      <HistoryScreen
        goToTimer={() => setCurrentScreen('timer')}
        config={config}
      />
    );
  }


  return (
    <SafeAreaView style={styles.appContainer}>
      <StatusBar barStyle="light-content" />
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#050816', // fundo escuro vibe neon
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#bbbbbb',
  },
});
