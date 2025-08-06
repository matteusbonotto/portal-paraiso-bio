# 🔄 Guia de Atualização e Cache

## ✅ Implementações Realizadas

### 1. **Atualização Automática do PWA**
- ✅ Service Worker atualizado para versão `5.1`
- ✅ Detecção automática de novas versões
- ✅ Atualização automática sem desinstalar o app
- ✅ Verificação de updates a cada 30 segundos

### 2. **Limpeza Automática de Cache**
- ✅ Cache limpo automaticamente quando nova versão é detectada
- ✅ Versionamento local para controle de atualizações
- ✅ Remoção de caches antigos do service worker

### 3. **Headers de Cache Control**
- ✅ Meta tags para evitar cache do navegador
- ✅ Parâmetros de versão nos arquivos CSS e JS (`?v=5.1`)
- ✅ Controle fino sobre cache do navegador

### 4. **Ferramentas para Desenvolvedores**

#### Comandos do Console:
```javascript
// Limpar cache manualmente
limparCacheManual()

// Forçar atualização completa (remove SW + cache)
forcarAtualizacao()
```

## 🚀 Como Funciona

### Fluxo Automático:
1. **Usuário acessa o site**
2. **Sistema verifica versão local vs atual**
3. **Se versões diferentes:** limpa cache automaticamente
4. **Service Worker detecta mudanças:** atualiza em background
5. **Quando pronto:** recarrega automaticamente

### Para Desenvolvedores:
- **Console:** Use `limparCacheManual()` para limpeza imediata
- **Console:** Use `forcarAtualizacao()` para reset completo
- **Toast:** Notificações visuais de atualizações

## 🔧 Versionamento

### Quando atualizar a versão:
1. **Edite `service-worker.js`**: `CACHE_NAME = 'paraisobio-vX.X'`
2. **Edite `script.js`**: `versaoAtual = 'X.X'`
3. **Edite `index.html`**: `?v=X.X` nos arquivos CSS/JS

### Versão Atual: **5.1**
- Service Worker: `paraisobio-v5.1`
- Assets: `?v=5.1`
- Controle local: `versaoAtual = '5.1'`

## 📱 Testando PWA

### Para testar atualizações:
1. **Mude a versão** nos arquivos mencionados
2. **Acesse o site** - deve limpar cache automaticamente
3. **Console mostra:** logs de limpeza e atualização
4. **Toast aparece:** "Nova versão disponível! Atualizando..."

### Resultado esperado:
- ✅ Cache limpo
- ✅ PWA atualizado
- ✅ Sem necessidade de desinstalar
- ✅ Funcionamento offline mantido
