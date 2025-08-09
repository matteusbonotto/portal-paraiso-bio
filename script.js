// Variáveis globais
let dadosCondominio = null;
let deferredPrompt = null;

// Exibir toast de dica de instalação ao carregar a página
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        const toastDica = document.getElementById('toast-dica-pwa');
        if (toastDica) {
            const toast = new bootstrap.Toast(toastDica, { delay: 7000 });
            toast.show();
        }
        // Toast de divulgação
        const toastDivulgacao = document.getElementById('toast-divulgacao');
        if (toastDivulgacao) {
            setTimeout(() => {
                const toast = new bootstrap.Toast(toastDivulgacao, { delay: 12000 });
                toast.show();
            }, 3500);
        }
    }, 1000);
});

// Inicialização
document.addEventListener('DOMContentLoaded', function () {
    carregarDados();
    configurarPWA();
    configurarFormulario();
    configurarScrollSuave();
    adicionarAnimacoes();
    configurarPWAInstall();

    // Forçar limpeza de cache na inicialização
    limparCacheSeNecessario();
});

// Função para limpar cache quando necessário
async function limparCacheSeNecessario() {
    try {
        // Verificar se precisamos forçar atualização baseado na versão
        const versaoAtual = '5.1';
        const versaoArmazenada = localStorage.getItem('versaoApp');

        if (versaoArmazenada !== versaoAtual) {
            console.log('PWA: Nova versão detectada, limpando cache...');
            await limparTodoCache();
            localStorage.setItem('versaoApp', versaoAtual);
            console.log('PWA: Cache limpo e versão atualizada');
        }
    } catch (error) {
        console.error('PWA: Erro ao verificar/limpar cache:', error);
    }
}

// Função para limpar todo o cache
async function limparTodoCache() {
    try {
        // Limpar cache do service worker
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(cacheName => {
                    console.log('PWA: Removendo cache:', cacheName);
                    return caches.delete(cacheName);
                })
            );
        }

        // Limpar localStorage (mantendo apenas configurações importantes)
        const versaoApp = localStorage.getItem('versaoApp');
        localStorage.clear();
        if (versaoApp) {
            localStorage.setItem('versaoApp', versaoApp);
        }

        // Limpar sessionStorage
        sessionStorage.clear();

        console.log('PWA: Todo o cache foi limpo');
        return true;
    } catch (error) {
        console.error('PWA: Erro ao limpar cache:', error);
        return false;
    }
}

// Configurar instalação PWA
function configurarPWAInstall() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        console.log('PWA Install: Evento beforeinstallprompt capturado');
        document.getElementById('pwa-install-banner').style.display = 'block';
    });

    const btnInstall = document.getElementById('btn-install-pwa');
    if (btnInstall) {
        btnInstall.addEventListener('click', async () => {
            if (deferredPrompt) {
                console.log('PWA Install: Iniciando instalação via banner...');
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log('PWA Install: Resultado via banner:', outcome);
                if (outcome === 'accepted') {
                    document.getElementById('pwa-install-banner').style.display = 'none';
                }
                deferredPrompt = null;
            } else {
                console.log('PWA Install: deferredPrompt não está disponível');
            }
        });
    }

    window.addEventListener('appinstalled', () => {
        console.log('PWA Install: App instalado via banner');
        document.getElementById('pwa-install-banner').style.display = 'none';
    });
}

// Carregar dados do JSON
async function carregarDados() {
    try {
        const resposta = await fetch('assets/data.json');
        dadosCondominio = await resposta.json();

        carregarGrupoWhatsApp();
        carregarContatos();
        carregarDelivery();
        carregarDivulgacoes();
        carregarEnderecos();
        carregarRegras();
        carregarLinksUteis();
        configurarBotaoVerMais();
    } catch (erro) {
        console.error('Erro ao carregar dados:', erro);
    }
}

// Carregar Divulgações (Carrossel)
function carregarDivulgacoes() {
    const container = document.getElementById('carousel-divulgacoes-inner');
    const indicators = document.getElementById('carousel-indicators');
    if (!container || !dadosCondominio.divulgacoes) return;

    const ativos = dadosCondominio.divulgacoes.filter(d => d.ativo);
    if (ativos.length === 0) {
        container.innerHTML = `<div class="carousel-item active"><div class="text-center p-5">Nenhuma divulgação ativa no momento.</div></div>`;
        return;
    }

    // Criar indicadores
    indicators.innerHTML = ativos.map((_, idx) =>
        `<button type="button" data-bs-target="#carousel-divulgacoes" data-bs-slide-to="${idx}" ${idx === 0 ? 'class="active"' : ''}></button>`
    ).join('');

    // Suporte a vídeo/mp4 e imagem
    container.innerHTML = ativos.map((div, idx) => {
        const isVideo = div.imagem && div.imagem.toLowerCase().endsWith('.mp4');
        // Mobile
        let mobileMedia;
        if (isVideo) {
            mobileMedia = `
                <div class=\"video-wrapper d-flex justify-content-center align-items-center\" style=\"position:relative;width:100%;height:100%;min-height:180px;\">
                    <video src=\"${div.imagem}\" class=\"d-block carousel-image-mobile\" style=\"max-width:100%;max-height:220px;\" autoplay loop muted playsinline preload=\"auto\"></video>
                    <button class=\"btn btn-light btn-sm btn-unmute\" style=\"position:absolute;top:10px;right:10px;z-index:2;\" onclick=\"toggleMute(this)\"><i class=\"bi bi-volume-mute\"></i></button>
                </div>
            `;
        } else {
            mobileMedia = `<img src=\"${div.imagem}\" class=\"d-block w-100 carousel-image-mobile\" alt=\"${div.titulo}\">`;
        }
        // Desktop
        let desktopMedia;
        if (isVideo) {
            desktopMedia = `
                <div class=\"video-wrapper d-flex justify-content-center align-items-center\" style=\"position:relative;width:100%;height:100%;min-height:220px;\">
                    <video src=\"${div.imagem}\" class=\"carousel-image-desktop\" style=\"max-width:100%;max-height:220px;\" autoplay loop muted playsinline preload=\"auto\"></video>
                    <button class=\"btn btn-light btn-sm btn-unmute\" style=\"position:absolute;top:10px;right:10px;z-index:2;\" onclick=\"toggleMute(this)\"><i class=\"bi bi-volume-mute\"></i></button>
                </div>
            `;
        } else {
            desktopMedia = `<img src=\"${div.imagem}\" class=\"carousel-image-desktop\" alt=\"${div.titulo}\">`;
        }
        return `
        <div class=\"carousel-item${idx === 0 ? ' active' : ''}\">
            <!-- Layout Mobile: Imagem ou vídeo com caption sobreposta -->
            <div class=\"d-md-none mobile-layout\" style=\"background-color: ${div['theme-color'] || '#ffffff'};position:relative;\">
                ${mobileMedia}
                <div class=\"carousel-caption-mobile\">
                    <div class=\"caption-content\">
                        <h6>
                            <i class=\"bi bi-${div.icone || 'megaphone'} me-2\"></i>
                            ${div.titulo}
                        </h6>
                        ${div.subtitulo ? `<small class=\"subtitle\">${div.subtitulo}</small>` : ''}
                        <p class=\"small\">${div.descricao || ''}</p>
                        ${div.url ? `<a href=\"${div.url}\" target=\"_blank\" class=\"btn btn-sm btn-${div['button-color'] || 'primary'} btn-customizado\">
                            <i class=\"bi bi-box-arrow-up-right me-1\"></i>Saiba mais
                        </a>` : ''}
                    </div>
                </div>
            </div>
            <!-- Layout Desktop: Card com imagem/vídeo quadrada à esquerda e conteúdo à direita -->
            <div class=\"d-none d-md-block desktop-layout\" style=\"position:relative;\">
                <div class=\"carousel-card\" style=\"background-color: ${div['theme-color'] || '#ffffff'};\">
                    <div class=\"image-container\" style=\"position:relative;\">
                        ${desktopMedia}
                    </div>
                    <div class=\"content-container\">
                        <h5>
                            <i class=\"bi bi-${div.icone || 'megaphone'} me-2\"></i>
                            ${div.titulo}
                        </h5>
                        ${div.subtitulo ? `<p class=\"subtitle\">${div.subtitulo}</p>` : ''}
                        <p class=\"m-2\">${div.descricao || ''}</p>
                        ${div.url ? `<a href=\"${div.url}\" target=\"_blank\" class=\"btn btn-${div['button-color'] || 'primary'} btn-divulgacao mt-2\">
                            <i class=\"bi bi-box-arrow-up-right me-1\"></i>Saiba mais
                        </a>` : ''}
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');

    // Função global para toggle mute
    window.toggleMute = function (btn) {
        const video = btn.parentElement.querySelector('video');
        if (video) {
            video.muted = !video.muted;
            btn.innerHTML = video.muted
                ? '<i class="bi bi-volume-mute"></i>'
                : '<i class="bi bi-volume-up"></i>';
        }
    };
}
// Carregar Delivery
function carregarDelivery() {
    const containerDelivery = document.getElementById('lista-delivery');
    if (!dadosCondominio.Delivery || !containerDelivery) return;

    dadosCondominio.Delivery.forEach(delivery => {
        const telefoneNumeros = delivery.telefone ? delivery.telefone.replace(/\D/g, '') : '';
        let botoes = '';
        if (delivery.telefone) {
            botoes += `
                <a href="tel:${delivery.telefone}" class="btn btn-primary btn-customizado mb-1">
                    <i class="bi bi-telephone"></i>
                    <span class="d-none d-sm-inline ms-1">Ligar</span>
                </a>
                <a href="https://wa.me/55${telefoneNumeros}" target="_blank" class="btn btn-whatsapp btn-customizado mb-1">
                    <i class="bi bi-whatsapp"></i>
                    <span class="d-none d-sm-inline ms-1">WhatsApp</span>
                </a>
            `;
        }
        if (delivery.menu) {
            botoes += `
                <a href="${delivery.menu}" target="_blank" class="btn btn-outline-secondary btn-customizado mb-1">
                    <i class="bi bi-card-list"></i>
                    <span class="d-none d-sm-inline ms-1">Menu</span>
                </a>
            `;
        }
        containerDelivery.innerHTML += `
            <div class="col-md-4 mb-3 fade-in">
                <div class="cartao-contato cartao-contato-compacto">
                    <h5 class="text-primary mb-2">
                        <i class="bi bi-bag me-2"></i>
                        ${delivery.nome}
                    </h5>
                    <p class="text-muted mb-1">${delivery.tipo || ''}</p>
                    <p class="text-muted mb-1">${delivery.telefone || ''}</p>
                    <div class="btn-grupo">
                        ${botoes}
                    </div>
                </div>
            </div>
        `;
    });
}

// Carregar grupo do WhatsApp
function carregarGrupoWhatsApp() {
    const containerGrupo = document.getElementById('grupo-whatsapp');

    if (dadosCondominio.grupos_whatsapp) {
        dadosCondominio.grupos_whatsapp.forEach(grupo => {
            containerGrupo.innerHTML += `
                        <div class="col-12 mb-3">
                            <div class="card cartao-personalizado">
                                <div class="card-body text-center py-3">
                                    <h6 class="card-title text-success mb-2">
                                        <i class="bi bi-${grupo.icone} me-2"></i>
                                        ${grupo.nome}
                                    </h6>
                                    <a href="${grupo.url}" target="_blank" class="btn btn-whatsapp btn-customizado">
                                        <i class="bi bi-whatsapp me-2"></i>Entrar no Grupo
                                    </a>
                                </div>
                            </div>
                        </div>
                    `;
        });
    }
}

// Carregar contatos
function carregarContatos() {
    const containerPrincipais = document.getElementById('contatos-principais');
    const containerSecundarios = document.getElementById('contatos-secundarios');

    dadosCondominio.contatos.forEach(contato => {
        const cartaoContato = criarCartaoContato(contato);

        if (contato.prioridade === 'alta') {
            containerPrincipais.innerHTML += cartaoContato;
        } else {
            containerSecundarios.innerHTML += cartaoContato;
        }
    });
}

// Criar cartão de contato unificado
function criarCartaoContato(contato) {
    const telefoneNumeros = contato.telefone ? contato.telefone.replace(/\D/g, '') : '';
    const temTelefone = !!contato.telefone;
    const temEmail = !!contato.email;

    let botoesContato = '';

    if (temTelefone) {
        botoesContato += `
                    <a href="tel:${contato.telefone}" class="btn btn-primary btn-customizado">
                        <i class="bi bi-telephone"></i>
                        <span class="d-none d-sm-inline ms-1">Ligar</span>
                    </a>
                    <a href="https://wa.me/55${telefoneNumeros}" target="_blank" 
                       class="btn btn-whatsapp btn-customizado">
                        <i class="bi bi-whatsapp"></i>
                        <span class="d-none d-sm-inline ms-1">WhatsApp</span>
                    </a>
                `;
    }

    if (temEmail) {
        botoesContato += `
                    <a href="mailto:${contato.email}" class="btn btn-success btn-customizado">
                        <i class="bi bi-envelope"></i>
                        <span class="d-none d-sm-inline ms-1">Email</span>
                    </a>
                `;
    }

    const informacoesContato = `
                ${temTelefone ? `<p class="text-muted mb-1">${contato.telefone}</p>` : ''}
                ${temEmail ? `<p class="text-muted mb-1">${contato.email}</p>` : ''}
            `;

    return `
                <div class="col-md-4 mb-3 fade-in">
                    <div class="cartao-contato cartao-contato-compacto">
                        <h5 class="text-primary mb-2">
                            <i class="bi bi-person-circle me-2"></i>
                            ${contato.nome}
                        </h5>
                        ${informacoesContato}
                        <div class="btn-grupo">
                            ${botoesContato}
                        </div>
                    </div>
                </div>
            `;
}

// Configurar botão Ver Mais
function configurarBotaoVerMais() {
    const btnVerMais = document.getElementById('btn-ver-mais');
    const contatosSecundarios = document.getElementById('contatos-secundarios');
    let mostrandoMais = false;

    btnVerMais.addEventListener('click', function () {
        if (mostrandoMais) {
            contatosSecundarios.style.display = 'none';
            btnVerMais.innerHTML = '<i class="bi bi-plus-circle me-2"></i>Ver Mais Contatos';
            mostrandoMais = false;
        } else {
            contatosSecundarios.style.display = 'flex';
            btnVerMais.innerHTML = '<i class="bi bi-dash-circle me-2"></i>Ver Menos Contatos';
            mostrandoMais = true;
        }
    });
}

// Carregar endereços
function carregarEnderecos() {
    const enderecoCondominio = document.getElementById('endereco-condominio');
    const enderecoInstalacoes = document.getElementById('endereco-instalacoes');

    const endCondominio = dadosCondominio.enderecos.condominio;
    const endInstalacoes = dadosCondominio.enderecos.instalacoes;

    enderecoCondominio.innerHTML = criarBadgeEndereco(endCondominio, 'condominio');
    enderecoInstalacoes.innerHTML = criarBadgeEndereco(endInstalacoes, 'instalacoes');
}

// Criar badge de endereço copiável
function criarBadgeEndereco(endereco, tipo) {
    const enderecoCompleto = `${endereco.logradouro}, ${endereco.numero} - ${endereco.complemento}, CEP: ${endereco.cep}`;

    return `
                <div class="mb-2">
                    <p class="mb-2">${endereco.logradouro}, ${endereco.numero}</p>
                    <p class="mb-2">${endereco.complemento}</p>
                    <span class="badge bg-primary badge-endereco" 
                          onclick="copiarEndereco('${enderecoCompleto}')"
                          title="Clique para copiar">
                        <i class="bi bi-copy me-1"></i>
                        CEP: ${endereco.cep}
                    </span>
                </div>
            `;
}

// Carregar regras
function carregarRegras() {
    const containerRegras = document.getElementById('lista-regras');

    dadosCondominio.regras.forEach(categoria => {
        containerRegras.innerHTML += `
                    <div class="col-lg-3 mb-4 fade-in">
                        <div class="card cartao-personalizado h-100">
                            <div class="card-body">
                                <h5 class="card-title text-primary">
                                    <i class="bi bi-check-circle me-2"></i>
                                    ${categoria.categoria}
                                </h5>
                                <ul class="lista-regras">
                                    ${categoria.itens.map(item => `<li>${item}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                `;
    });
}

// Carregar links úteis
function carregarLinksUteis() {
    const containerLinks = document.getElementById('lista-links');

    dadosCondominio.links_uteis.forEach(link => {
        containerLinks.innerHTML += `
                    <div class="col-md-6 col-lg-4 mb-4 fade-in">
                        <div class="card cartao-personalizado h-100 text-center">
                            <div class="card-body">
                                <i class="bi bi-${link.icone} text-primary mb-3" style="font-size: 2.5rem;"></i>
                                <h6 class="card-title">${link.nome}</h6>
                                <a href="${link.url}" target="_blank" class="btn btn-outline-primary btn-customizado">
                                    <i class="bi bi-box-arrow-up-right me-1"></i>
                                    Acessar
                                </a>
                            </div>
                        </div>
                    </div>
                `;
    });
}

// Copiar endereço para área de transferência
async function copiarEndereco(endereco) {
    try {
        await navigator.clipboard.writeText(endereco);
        mostrarToast('Endereço copiado para a área de transferência!');
    } catch (erro) {
        console.error('Erro ao copiar:', erro);
        // Fallback para navegadores mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = endereco;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        mostrarToast('Endereço copiado para a área de transferência!');
    }
}

// Copiar email para área de transferência
async function copiarEmail(email) {
    try {
        await navigator.clipboard.writeText(email);
        mostrarToast('Email copiado para a área de transferência!');
    } catch (erro) {
        console.error('Erro ao copiar:', erro);
        // Fallback para navegadores mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = email;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        mostrarToast('Email copiado para a área de transferência!');
    }
}

// Mostrar toast de feedback
function mostrarToast(mensagem = 'Endereço copiado para a área de transferência!') {
    const toastElement = document.getElementById('toast-feedback');
    const toastBody = toastElement.querySelector('.toast-body');
    toastBody.textContent = mensagem;

    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}

// Configurar PWA
function configurarPWA() {
    // Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('PWA: Service Worker registrado com sucesso:', registration);

                // Verificar se há atualizações
                registration.addEventListener('updatefound', () => {
                    console.log('PWA: Nova versão do Service Worker encontrada');
                    const installingWorker = registration.installing;

                    installingWorker.addEventListener('statechange', () => {
                        if (installingWorker.state === 'installed') {
                            if (navigator.serviceWorker.controller) {
                                // Há uma nova versão disponível
                                console.log('PWA: Nova versão disponível. Atualizando...');
                                mostrarToast('Nova versão disponível! Atualizando...');
                                setTimeout(() => {
                                    window.location.reload();
                                }, 2000);
                            }
                        }
                    });
                });

                // Forçar verificação de atualizações a cada 30 segundos
                setInterval(() => {
                    registration.update();
                }, 30000);
            })
            .catch(error => {
                console.error('PWA: Erro ao registrar Service Worker:', error);
            });
    } else {
        console.log('PWA: Service Worker não é suportado neste navegador');
    }

    // Botão de instalação
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        console.log('PWA: Evento beforeinstallprompt disparado');
        document.getElementById('botao-instalar').classList.remove('d-none');
    });

    document.getElementById('botao-instalar').addEventListener('click', async () => {
        if (deferredPrompt) {
            console.log('PWA: Solicitando instalação...');
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log('PWA: Resultado da instalação:', outcome);
            deferredPrompt = null;
            document.getElementById('botao-instalar').classList.add('d-none');
        }
    });

    // Verificar se já está instalado
    window.addEventListener('appinstalled', () => {
        console.log('PWA: App foi instalado com sucesso');
    });
}

// Configurar formulário
function configurarFormulario() {
    document.getElementById('formulario-contato').addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = new FormData(this);
        const dados = Object.fromEntries(formData);

        console.log('Dados do formulário:', dados);

        // Aqui você pode enviar os dados para um servidor
        alert('Formulário enviado com sucesso! Entraremos em contato em breve.');

        // Fechar modal e limpar formulário
        bootstrap.Modal.getInstance(document.getElementById('modal-formulario')).hide();
        this.reset();
    });
}

// Scroll suave para âncoras
function configurarScrollSuave() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Adicionar animações de entrada
function adicionarAnimacoes() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.1 });

    // Observar todas as seções
    document.querySelectorAll('.secao-principal').forEach(section => {
        observer.observe(section);
    });
}

// Função especial para desenvolvedores - limpar cache manualmente
// Para usar: abra o console e digite: limparCacheManual()
window.limparCacheManual = async function () {
    try {
        console.log('PWA: Iniciando limpeza manual de cache...');
        mostrarToast('Limpando cache... Aguarde...');

        const sucesso = await limparTodoCache();

        if (sucesso) {
            mostrarToast('Cache limpo com sucesso! Recarregando página...');
            setTimeout(() => {
                window.location.reload(true);
            }, 2000);
        } else {
            mostrarToast('Erro ao limpar cache. Tente novamente.');
        }
    } catch (error) {
        console.error('PWA: Erro na limpeza manual:', error);
        mostrarToast('Erro ao limpar cache.');
    }
}

// Função para forçar atualização completa
window.forcarAtualizacao = async function () {
    try {
        console.log('PWA: Forçando atualização completa...');
        mostrarToast('Forçando atualização completa...');

        // Limpar cache
        await limparTodoCache();

        // Atualizar service worker
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (let registration of registrations) {
                await registration.unregister();
            }
        }

        // Recarregar página
        window.location.reload(true);
    } catch (error) {
        console.error('PWA: Erro ao forçar atualização:', error);
        mostrarToast('Erro ao forçar atualização.');
    }
}