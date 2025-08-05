# Portal Paraíso Bio - PWA

Portal Progressive Web App (PWA) do Condomínio Paraíso Bio com informações, contatos e serviços para moradores.

## 🚀 Como executar

### Pré-requisitos
- Navegador moderno (Chrome, Firefox, Safari, Edge)

### No Chrome (Mobile):
1. Acesse a URL no navegador mobile
2. Após carregar, aparecerá uma notificação ou botão "Instalar app"
3. Toque para instalar na tela inicial

### Verificando funcionalidade offline:
1. Carregue a página normalmente
2. Desative a internet/wifi
3. Recarregue a página - deve funcionar offline

## 🔧 Funcionalidades PWA

- ✅ **Service Worker**: Cache de recursos e funcionamento offline
- ✅ **Web App Manifest**: Ícones, nome, cores e configurações de instalação
- ✅ **Instalável**: Pode ser instalado na tela inicial do dispositivo
- ✅ **Offline First**: Funciona sem internet após primeira visita
- ✅ **Responsivo**: Adapta-se a diferentes tamanhos de tela

## 📁 Estrutura do projeto

```
├── index.html          # Página principal
├── manifest.json       # Configurações do PWA
├── service-worker.js   # Service Worker para cache e offline
├── style.css          # Estilos personalizados
├── package.json       # Dependências e scripts
└── assets/
    ├── data.json      # Dados do condomínio
    ├── favicon.png    # Ícone do app
    └── ...           # Outras imagens
```

## 🛠 Tecnologias utilizadas

- **HTML5** + **CSS3** + **JavaScript**
- **Bootstrap 5** - Framework CSS
- **Service Workers** - Cache e offline
- **Web App Manifest** - Configurações PWA
- **Intersection Observer** - Animações de entrada
- **Clipboard API** - Copiar endereços/emails

## 📲 Como instalar no dispositivo

### Android (Chrome):
1. Acesse a URL no Chrome
2. Toque no menu (3 pontos) > "Instalar app" ou "Adicionar à tela inicial"
3. Confirme a instalação

### iOS (Safari):
1. Acesse a URL no Safari
2. Toque no botão "Compartilhar" (quadrado com seta)
3. Selecione "Adicionar à Tela de Início"

### Desktop (Chrome/Edge):
1. Acesse a URL no navegador
2. Clique no ícone de instalação na barra de endereços
3. Ou use o botão "Instalar App" na página

## 🐛 Resolução de problemas

### Service Worker não carrega:
- Verifique se está acessando via HTTPS ou localhost
- Limpe o cache do navegador
- Verifique o console para erros

### App não instala:
- Certifique-se que o manifest.json está carregando corretamente
- Verifique se os ícones existem e estão no tamanho correto
- Use um servidor HTTP (não arquivo local)

### Não funciona offline:
- Verifique se o Service Worker está ativo
- Confirme que os arquivos estão sendo cached
- Recarregue a página online primeiro

## 👨‍💻 Desenvolvedor

**Matheus Bonotto** - squidev  
© 2025 - Todos os direitos reservados
