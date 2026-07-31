// locales/fr.js
window.translations = window.translations || {};
window.appMessages = window.appMessages || {};

window.translations.fr = {
    'html':{lang:'fr', dir:'ltr'},
    '[data-label="file"]': { textContent: 'Fichier' },
    '[data-action="new-sketch"] span:first-child': { textContent: 'Nouveau Croquis' },
    '[data-action="new-cloud-sketch"] span:first-child': { textContent: 'Nouveau Croquis Cloud' },
    '[data-action="open"] span:first-child': { textContent: 'Ouvrir...' },
    '[data-label="open-recent"]': { textContent: 'Fichiers Récents' },
    '[data-label="sketchbook"]': { textContent: 'Carnet de Croquis' },
    '[data-label="examples"]': { textContent: 'Exemples' },
    '[data-action="close-sketch"] span:first-child': { textContent: 'Fermer' },
    '[data-action="save"] span:first-child': { textContent: 'Enregistrer' },
    '[data-action="save-as"] span:first-child': { textContent: 'Enregistrer sous...' },
    '[data-action="preferences"] span:first-child': { textContent: 'Préférences...' },
    '[data-label="advanced"]': { textContent: 'Avancé' },
    '[data-action="adv-keyboard"]': { textContent: 'Raccourcis Clavier' },
    '[data-action="exit"] span:first-child': { textContent: 'Quitter' },

    '[data-label="edit"]': { textContent: 'Édition' },
    '[data-action="undo"] span:first-child': { textContent: 'Annuler' },
    '[data-action="redo"] span:first-child': { textContent: 'Rétablir' },
    '[data-action="cut"] span:first-child': { textContent: 'Couper' },
    '[data-action="copy"] span:first-child': { textContent: 'Copier' },
    '[data-action="copy-markdown"] span:first-child': { textContent: 'Copier pour le Forum (Markdown)' },
    '[data-action="paste"] span:first-child': { textContent: 'Coller' },
    '[data-action="select-all"] span:first-child': { textContent: 'Tout Sélectionner' },
    '[data-action="goto-line"] span:first-child': { textContent: 'Aller à la ligne/colonne...' },
    '[data-action="toggle-comment"] span:first-child': { textContent: 'Activer/Désactiver le commentaire' },
    '[data-action="increase-indent"] span:first-child': { textContent: 'Augmenter le retrait' },
    '[data-action="decrease-indent"] span:first-child': { textContent: 'Diminuer le retrait' },
    '[data-action="auto-format"] span:first-child': { textContent: 'Formatage Automatique' },
    '[data-action="find-replace"] span:first-child': { textContent: 'Remplacer dans les fichiers' },
    '[data-action="zoom-in"] span:first-child': { textContent: 'Augmenter la taille de police' },
    '[data-action="zoom-out"] span:first-child': { textContent: 'Diminuer la taille de police' },
    '[data-action="find"] span:first-child': { textContent: 'Rechercher' },
    '[data-action="find-next"] span:first-child': { textContent: 'Rechercher le suivant' },
    '[data-action="find-prev"] span:first-child': { textContent: 'Rechercher le précédent' },
    '[data-action="find-selection"] span:first-child': { textContent: 'Rechercher la sélection' },

    '[data-label="sketch"]': { textContent: 'Croquis' },
    '[data-action="verify"] span:first-child': { textContent: 'Vérifier / Compiler' },
    '[data-action="upload"] span:first-child': { textContent: 'Téléverser' },
    '[data-action="upload-programmer"] span:first-child': { textContent: 'Téléverser avec un programmateur' },
    '[data-action="export-compiled"] span:first-child': { textContent: 'Exporter le binaire compilé' },

    '[data-label="tools"]': { textContent: 'Outils' },
    '[data-action="archive-sketch"] span:first-child': { textContent: 'Archiver le croquis' },
    '[data-action="manage-libraries"] span:first-child': { textContent: 'Gérer les bibliothèques...' },
    '[data-action="serial-monitor"] span:first-child': { textContent: 'Moniteur Série' },
    '[data-action="serial-plotter"] span:first-child': { textContent: 'Traceur Série' },
    '#menuBoardSubmenu .no-boards': { textContent: 'Veuillez installer un paquet de cartes depuis le Gestionnaire de cartes.' },
    '#btnSelectWebPort': { textContent: 'Sélectionner un port via navigateur (WebUSB/Serial)' },
    '[data-action="reload-board"] span:first-child': { textContent: 'Recharger les infos de la carte' },
    '[data-action="get-board-info"] span:first-child': { textContent: 'Obtenir les infos de la carte' },

    '[data-label="help"]': { textContent: 'Aide' },
    '[data-action="help-getting-started"]': { textContent: 'Démarrage' },
    '[data-action="help-ref"]': { textContent: 'Référence' },
    '[data-action="help-about"]': { textContent: 'À propos d\'Arduino IDE' },

    '#btnVerify': { title: 'Vérifier' },
    '#btnUpload': { title: 'Téléverser' },
    '#btnToolbarSerial': { title: 'Moniteur Série' },
    '#boardSearchInput': { placeholder: 'Rechercher une carte...' },

    '[data-panel="panel-sketchbook"]': { title: 'Carnet de Croquis' },
    '[data-panel="panel-boards"]': { title: 'Gestionnaire de cartes' },
    '[data-panel="panel-libraries"]': { title: 'Gestionnaire de bibliothèques' },
    '[data-panel="panel-debug"]': { title: 'Débogage' },
    '[data-panel="panel-ai"]': { title: 'Assistant IA' },
    '[data-panel="panel-search"]': { title: 'Rechercher' },
    '#btnSettings': { title: 'Paramètres utilisateur' },

    '#panel-sketchbook .panel-title': { textContent: 'FICHIERS DU PROJET' },
    '#btnNewFile': { title: 'Nouveau Fichier' },
    '#btnNewFolder': { title: 'Nouveau Dossier' },
    '#btnRefreshTree': { title: 'Actualiser' },

    '#panel-boards .panel-title': { textContent: 'GESTIONNAIRE DE CARTES' },
    '#panelBoardSearch': { placeholder: 'Filtrer la recherche...' },
    '#panel-boards .panel-filter-bar label': { textContent: 'Type:' },
    '#boardTypeFilter option[value="all"]': { textContent: 'Tous' },
    '#boardTypeFilter option[value="installed"]': { textContent: 'Installés' },
    '#boardTypeFilter option[value="not-installed"]': { textContent: 'Non installés' },

    '#panel-libraries .panel-title': { textContent: 'GESTIONNAIRE DE BIBLIOTHÈQUES' },
    '#panelLibSearch': { placeholder: 'Rechercher une bibliothèque...' },
    '#panel-libraries .panel-filter-bar label': { textContent: 'Type:' },
    '#libTypeFilter option[value="all"]': { textContent: 'Toutes' },
    '#libTypeFilter option[value="installed"]': { textContent: 'Installées' },
    '#libTypeFilter option[value="not-installed"]': { textContent: 'Non installées' },

    '#panel-debug .panel-title': { textContent: 'DÉBOGAGE' },
    '#panel-debug .debug-placeholder p': { textContent: 'Sélectionnez une carte prise en charge pour utiliser le débugueur.' },
    '#panel-debug .debug-start-btn': { textContent: 'Démarrer le débogage' },

    '#panel-ai .panel-title': { textContent: '✨ ASSISTANT IA' },
    '#btnAiHistory': { title: 'Historique des discussions' },
    '#btnNewAiChat': { title: 'Nouvelle Discussion' },
    '#btnAiSettings': { title: 'Paramètres IA' },
    '#btnAiClear': { title: 'Effacer la discussion' },
    '#panel-ai .ai-history-header': { textContent: 'Discussions Précédentes' },
    '#panel-ai .ai-bubble': {
      fn: (el) => {
        el.innerHTML = `Bonjour ! Je suis l'assistant GaziDuino IA. Je peux vous aider avec la programmation Arduino, la conception de circuits et le débogage. 🤖<br><br><small style="opacity:0.7">Entrez votre clé API dans les paramètres pour commencer.</small>`;
      }
    },
    '#aiInput': { placeholder: 'Posez une question sur Arduino...' },
    '#btnAiSend': { title: 'Envoyer' },
    '#panel-ai .ai-context-toggle': {
      fn: (el) => {
        const checkbox = el.querySelector('input');
        el.innerHTML = '';
        el.appendChild(checkbox);
        el.appendChild(document.createTextNode(' Envoyer le code à l\'IA'));
      }
    },

    '#panel-search .panel-title': { textContent: 'RECHERCHER' },
    '#searchQueryInput': { placeholder: 'Terme recherché...' },
    '#panel-search .search-options label': {
      fn: (el) => {
        const checkbox = el.querySelector('input');
        el.innerHTML = '';
        el.appendChild(checkbox);
        el.appendChild(document.createTextNode(' Respecter la casse'));
      }
    },
    '#btnSearchTrigger': { textContent: 'Trouver' },

    '#tabOutputBtn': { textContent: 'Sortie' },
    '#tabSerialBtn': {
      fn: (el) => {
        const span = el.querySelector('.close-serial-tab');
        el.innerHTML = 'Moniteur Série ';
        if (span) el.appendChild(span);
      }
    },
    '#copyConsoleBtn': { title: 'Copier' },
    '#clearConsoleBtn': { title: 'Effacer' },
    '#toggleConsoleHeight': { title: 'Plein Écran / Restaurer' },
    '#closeConsoleBtn': { title: 'Fermer' },

    '#serialWarningBanner': { textContent: 'Non connecté. Sélectionnez une carte et un port pour vous connecter automatiquement.' },
    '#btnWebSerial': {
      fn: (el) => {
        el.innerHTML = '🌐 Connexion Web Serial';
        el.title = 'Se connecte directement via le navigateur OTG Android ou USB de bureau';
      }
    },
    '#serialMessageInput': { placeholder: 'Appuyez sur Entrée pour envoyer' },
    '#serialLineEnding option[value="nl"]': { textContent: 'Nouvelle Ligne' },
    '#serialLineEnding option[value="none"]': { textContent: 'Pas de fin de ligne' },
    '#serialLineEnding option[value="cr"]': { textContent: 'Retour Chariot' },
    '#serialLineEnding option[value="both"]': { textContent: 'Les deux (NL & CR)' },
    '#paneSerial label[for="chkAutoscroll"]': { textContent: 'Défilement automatique' },
    '#paneSerial label[for="chkTimestamp"]': { textContent: 'Afficher l\'horodatage' },

    '#cursorPosition': { textContent: 'Ligne 1, Colonne 1' },
    '#progressMessage': { textContent: 'Compilation du croquis...' },
    '#btnCancelProgress': { textContent: 'ANNULER' },

    '[data-action="ctx-new-file"]': { textContent: '📄 Nouveau Fichier' },
    '[data-action="ctx-new-folder"]': { textContent: '📁 Nouveau Dossier' },
    '[data-action="ctx-rename"]': { textContent: '✏️ Renommer' },
    '[data-action="ctx-delete"]': { textContent: '🗑 Supprimer' },

    '#aiSettingsOverlay .ai-settings-header h3': { textContent: '✨ Paramètres de l\'Assistant IA' },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(1) label': { textContent: 'Clé API (Google AI Studio)' },
    '#aiSettingsOverlay .ai-setting-hint': {
      fn: (el) => {
        el.innerHTML = `Obtenez une clé API gratuite sur <a href="https://aistudio.google.com/apikey" target="_blank" style="color:#00979d">Google AI Studio</a>.`;
      }
    },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(2) label': { textContent: 'Modèle' },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(3) label': {
      fn: (el) => {
        const span = el.querySelector('#aiTempVal');
        el.textContent = 'Température (Temperature): ';
        if (span) el.appendChild(span);
      }
    },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(3) .ai-setting-hint': {
      textContent: 'Basse = réponses cohérentes, Haute = réponses créatives'
    },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(4) label': { textContent: 'Nombre maximum de jetons' },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(5) label': { textContent: 'Langue de réponse' },
    '#aiLanguage option[value="tr"]': { textContent: 'Turc' },
    '#aiLanguage option[value="en"]': { textContent: 'Anglais' },
    '#aiLanguage option[value="auto"]': { textContent: 'Automatique' },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(6) span': { textContent: 'Écriture et exécution automatique (Auto Run)' },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(6) .ai-setting-hint': {
      textContent: 'Lorsqu\'elle est activée, l\'IA applique automatiquement le code généré au croquis et l\'exécute.'
    },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(7) label': { textContent: 'Invite Système (Optionnel)' },
    '#aiSystemPrompt': { placeholder: 'Instructions supplémentaires... (ex: "Toujours ajouter des commentaires")' },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(8) label': { textContent: 'Historique' },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(8) .ai-setting-hint': { textContent: 'L\'historique est conservé dans le navigateur' },
    '#btnClearHistory': { textContent: 'Effacer l\'historique' },
    '#aiSettingsCancel': { textContent: 'Annuler' },
    '#aiSettingsSave': { textContent: 'Enregistrer' }
};

window.appMessages.fr = {
    exit_confirm: "Êtes-vous sûr de vouloir quitter ?",
    cloud_sketch_notice: "Note : La fonctionnalité de croquis cloud n'est pas prise en charge localement, un nouveau croquis local a été créé.",
    file_opened: "Fichier ouvert : {file}",
    close_sketch_confirm: "Êtes-vous sûr de vouloir fermer le croquis ?",
    sketch_saved: "Croquis enregistré.",
    modal_shortcuts_title: "Raccourcis Clavier",
    sc_new_sketch: "Nouveau Croquis",
    sc_open_file: "Ouvrir un Fichier",
    sc_save: "Enregistrer",
    sc_save_as: "Enregistrer Sous",
    sc_undo: "Annuler",
    sc_redo: "Rétablir",
    sc_verify_compile: "Vérifier / Compiler",
    sc_upload_board: "Téléverser sur la Carte",
    sc_auto_format: "Formatage Automatique",
    sc_find: "Rechercher",
    sc_go_to_line: "Aller à la Ligne",
    sc_serial_monitor: "Moniteur Série",
    sc_font_size: "Agrandir/Réduire la Taille du Texte",
    btn_close: "Fermer",
    firmware_checking: "Mise à jour du micrologiciel : Vérification des informations du micrologiciel...",
    ssl_unsupported: "Le chargeur de certificat SSL n'est pas pris en charge dans cet environnement.",
    board_info_reloaded: "Informations sur la carte rechargées.",
    about_clone_info: "Clone Arduino IDE 2.3.11-nightly-20260629",
    about_web_env: "Environnement de développement Arduino basé sur le Web",
    btn_ok: "OK",
    replace_code_confirm: "Le code actuel sera remplacé par cet exemple. Continuer ?",
    recent_searching: "Fichier récent : {file} (recherche dans le carnet de croquis local...)",
    sketchbook_already_open: "Carnet de croquis : {file} est déjà ouvert.",
    err_file_tree_failed: "Échec du chargement de l'arborescence des fichiers.",
    err_file_read_failed: "Impossible de lire le fichier : {err}",
    err_file_open_failed: "Impossible d'ouvrir le fichier : {err}",
    err_unknown: "Erreur inconnue",
    prompt_new_file: "Nouveau nom de fichier (extension incluse) :",
    err_file_create_failed: "Impossible de créer le fichier : {err}",
    err_generic: "Erreur : {err}",
    prompt_new_folder: "Nouveau nom de dossier :",
    err_folder_create_failed: "Impossible de créer le dossier : {err}",
    prompt_rename: "Nouveau nom :",
    err_rename_failed: "Impossible de renommer : {err}",
    confirm_delete: 'Supprimer "{name}" ? Cette action est irréversible.',
    err_delete_failed: "Impossible de supprimer : {err}",
};
