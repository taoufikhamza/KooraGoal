# Guide pour lancer l'application KooraGoal sur le Web

## 🚀 Comment lancer le projet sur le web

### Pour quelqu'un qui clone le projet pour la première fois :

#### 1. Cloner le projet depuis GitHub
```bash
git clone https://github.com/taoufikhamza/KooraGoal.git
cd KooraGoal
```

#### 2. Installer les dépendances
```bash
npm install
```

#### 3. Configurer les variables d'environnement
Créez un fichier `.env` à la racine du projet avec vos clés Firebase :
```env
EXPO_PUBLIC_FIREBASE_API_KEY=votre_clé_api
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_domaine_auth
EXPO_PUBLIC_FIREBASE_PROJECT_ID=votre_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=votre_app_id
EXPO_PUBLIC_RAPIDAPI_KEY=votre_rapidapi_key
EXPO_PUBLIC_API_KEY=votre_api_key
```

#### 4. Installer les dépendances web (si nécessaire)
```bash
npx expo install react-native-web react-dom @expo/metro-runtime
```

#### 5. Lancer l'application sur le web
```bash
npm run web
```

ou

```bash
npx expo start --web
```

### L'application s'ouvrira automatiquement dans votre navigateur

- Par défaut, elle s'ouvre sur `http://localhost:8081`
- Vous pouvez partager votre écran ou projeter cette URL sur le datashow

---

## 📋 Instructions rapides (si vous avez déjà le projet)

### Lancer directement :
```bash
npm run web
```

C'est tout ! L'application va s'ouvrir dans votre navigateur.

---

## 🎯 Pour une meilleure expérience de démonstration

- **Mode plein écran** : Appuyez sur F11 dans le navigateur
- **Taille optimale** : L'application s'adapte automatiquement à la taille de l'écran
- **Rafraîchissement** : Si besoin, appuyez sur Ctrl+R (ou Cmd+R sur Mac)

---

## ✅ Fonctionnalités disponibles sur le web

- ✅ Authentification Firebase (connexion/inscription)
- ✅ Navigation entre les écrans
- ✅ Affichage des matchs et actualités
- ✅ Favoris (équipes et joueurs)
- ✅ Profil utilisateur
- ✅ Thème clair/sombre
- ✅ Multilingue (FR/AR)

---

## ⚠️ Notes importantes

- Le sélecteur d'image utilise le sélecteur de fichiers du navigateur (fonctionne mais interface différente)
- Certaines animations peuvent être légèrement différentes par rapport à la version mobile

---

## 🔧 En cas de problème

Si l'application ne se lance pas :

1. **Vérifiez que vous êtes dans le dossier du projet**
   ```bash
   cd KooraGoal
   ```

2. **Réinstallez les dépendances**
   ```bash
   npm install
   ```

3. **Vérifiez que votre fichier `.env` existe et contient toutes les variables nécessaires**

4. **Vérifiez que les dépendances web sont installées**
   ```bash
   npx expo install react-native-web react-dom @expo/metro-runtime
   ```

5. **Nettoyez le cache si nécessaire**
   ```bash
   npx expo start --web --clear
   ```

---

## 📝 Résumé rapide pour partager

**Pour lancer KooraGoal sur le web :**

1. `git clone https://github.com/taoufikhamza/KooraGoal.git`
2. `cd KooraGoal`
3. `npm install`
4. Créer un fichier `.env` avec vos clés Firebase
5. `npm run web`

C'est tout ! 🎉

---

Bonne chance pour votre démonstration ! 🎉
