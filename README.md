# 📱 Pausa Paga

Aplicativo desenvolvido em **React Native com Expo** para registrar pausas durante o expediente de trabalho e calcular quanto a pessoa “ganhou descansando”, com base no salário mensal e na jornada diária.

O app permite:

- Configurar **salário mensal bruto** e **horas trabalhadas por dia**;
- Iniciar e encerrar **pausas de descanso** com um cronômetro circular;
- Calcular em tempo real o valor “ganho descansando”;
- Salvar cada pausa em um **histórico local** (sem backend);
- Ver **resumo diário e mensal** de tempo descansado e valor ganho;
- Atribuir **categorias** às pausas (almoço, café, pausa rápida, etc.);
- Excluir pausas individualmente.

---

## 🧰 Tecnologias utilizadas

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [AsyncStorage](https://github.com/react-native-async-storage/async-storage) para armazenamento local
- [react-native-svg](https://github.com/software-mansion/react-native-svg) para o cronômetro circular

---

## ✅ Pré-requisitos

1.  Node.js (versão LTS)
    
    -   Baixa em: nodejs.org
        
    -   Vem junto com o `npm`.
        
2.  npm (já vem com o Node) ou yarn (opcional).
    
3.  (Opcional, mas ajuda) Expo CLI
    
    -   Instala com:
        
        -   `npm install -g expo-cli`
            
4.  Se for testar no celular físico: app **Expo Go** (na Play Store / App Store).
    

----------

### ❓ Como rodar o projeto depois de baixar

Passo a passo:

1.  **Clonar o repositório**
    
    -   `git clone https://github.com/PominMurilo/pausa-paga.git`
        
    -   `cd pausa-paga`
        
2.  **Instalar as dependências**
    
    -   Usando npm:
        
        -   `npm install`
            
    -   (ou, se preferir yarn: `yarn`)
        
3.  **Rodar o app**
    
    -   `npm start`
        
    -   (ou `npx expo start`)
        
    
    Isso abre no navegador o Expo Dev Tools.
    
4.  **Abrir o app**
    
    A partir dessa tela do Expo:
    
    -   Apertar `w` para abrir no navegador (versão web), **ou**
        
    -   Scanner o QR Code com o app **Expo Go** no celular, **ou**
        
    -   Apertar `a` (emulador Android configurado),
        
    -   Apertar `i` (simulador iOS no macOS).
