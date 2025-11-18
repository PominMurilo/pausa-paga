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

Para rodar o projeto, você precisa ter instalado:

- [Node.js](https://nodejs.org/) (versão LTS recomendada)
- `npm` (vem junto com o Node) ou `yarn`
- App **Expo Go** no celular (se for testar em dispositivo físico)

Opcional (mas ajuda bastante):

- **Expo CLI** instalada globalmente:

```bash
npm install -g expo-cli
📦 Como clonar e rodar o projeto
1. Clonar este repositório
bash
Copiar código
git clone https://github.com/PominMurilo/pausa-paga.git
cd pausa-paga
2. Instalar dependências
Usando npm:

bash
Copiar código
npm install
ou, se preferir, yarn:

bash
Copiar código
yarn
3. Garantir instalação das libs usadas (em projetos novos)
bash
Copiar código
npx expo install @react-native-async-storage/async-storage
npx expo install react-native-svg
No projeto atual essas dependências já estão no package.json, então o npm install normalmente já resolve.

4. Rodar o projeto
Usando npm:

bash
Copiar código
npm start
ou:

bash
Copiar código
npx expo start
Isso vai abrir o Expo Dev Tools (Metro Bundler) no navegador.

Você pode então:

Pressionar w para abrir no navegador (Expo Web);

Pressionar a para abrir em um emulador Android (se configurado);

Pressionar i para abrir em um simulador iOS (no macOS);

Ou escanear o QR Code com o app Expo Go no celular.

🧱 Estrutura básica do projeto
text
Copiar código
.
├── App.js
├── app.json
├── package.json
├── package-lock.json
├── screens/
│   ├── ConfigScreen.js
│   ├── TimerScreen.js
│   └── HistoryScreen.js
└── assets/
    └── (imagens e ícones, se houver)
App.js
Controla a “navegação” simples entre as telas:

ConfigScreen (configurações iniciais)

TimerScreen (cronômetro)

HistoryScreen (histórico de pausas)

Carrega e salva a configuração do usuário (salarioMensal, horasPorDia) usando AsyncStorage.

screens/ConfigScreen.js
Tela de configurações iniciais:

Salário mensal bruto (R$);

Horas trabalhadas por dia.

Funções principais:

Valida os campos e salva as informações no armazenamento local;

Depois de salvar, redireciona para o cronômetro.

screens/TimerScreen.js
Tela principal do app, com:

Cronômetro circular animado (usando react-native-svg);

Tempo da pausa em HH:MM:SS;

Cálculo em tempo real do valor “ganho descansando`.

Comportamento:

Ao clicar em Iniciar pausa:

A data/hora de início é salva em AsyncStorage (@pausepay:activePause);

O tempo continua contando mesmo se o app for para segundo plano.

Ao clicar em Encerrar pausa:

Roda uma pequena animação destacando o círculo e o botão de histórico;

Calcula a duração exata com base em startTime e endTime;

Calcula o valor ganho nessa pausa;

Salva um registro no histórico (@pausepay:pauses);

Zera o cronômetro.

screens/HistoryScreen.js
Lista todas as pausas registradas, com:

Data/hora da pausa;

Duração;

Valor ganho descansando;

Categoria.

Funcionalidades:

Alterar categoria de uma pausa via modal (dropdown);

Excluir pausas individualmente.

Também exibe:

Resumo de hoje:

Tempo total descansado;

Valor total ganho descansando;

% do expediente que foi descanso.

Resumo do mês:

Tempo total descansado;

Valor total ganho descansando.

🧮 Lógica de cálculo
Para estimar o valor ganho por segundo de descanso, o app usa:

Consideração padrão de 22 dias úteis por mês.

Fórmulas:

text
Copiar código
valorHora = salarioMensal / (22 * horasPorDia)
valorSegundo = valorHora / 3600
valorDescansando = segundosDePausa * valorSegundo
Esses valores são usados tanto na tela de cronômetro quanto no resumo diário/mensal.

🧪 Scripts disponíveis
No package.json há scripts como:

json
Copiar código
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  }
}
Você pode rodar:

npm start – abre o Expo Dev Tools;

npm run android – tenta abrir direto no emulador Android;

npm run ios – tenta abrir direto no simulador iOS (macOS);

npm run web – abre a versão web (para testes rápidos da UI).

🧩 Possíveis melhorias futuras
Sistema de conquistas/medalhas baseado em horas totais de descanso;

Exportar histórico em CSV/JSON;

Backup/restore em nuvem;

Suporte a diferentes moedas e formatos de data/hora;

Internacionalização (PT-BR / EN / etc.);

Notificações para lembrar de fazer pausas.

👨‍💻 Autor
Nome: Pomin Murilo

Projeto: Aplicativo Pausa Paga (gestão de pausas no trabalho)

Stack: React Native + Expo + AsyncStorage + react-native-svg

⚠️ Observações
O projeto foi pensado para rodar localmente com AsyncStorage (sem backend).

Os cálculos são estimativas com base em 22 dias úteis e não substituem controles formais de ponto ou folha de pagamento.