#!/data/data/com.termux/files/usr/bin/bash
# ============================================================
# fix_build.sh — Corrige les erreurs de build / warnings npm
#
# Problèmes trouvés dans package.json :
#
# 1) ERREUR BLOQUANTE (EOVERRIDE) :
#    "overrides": { "ajv": "^8.12.0", "ajv-keywords": "^5.1.0" }
#    entre en conflit avec les dependencies directes du même nom
#    ("ajv": "^8.20.0", "ajv-keywords": "^5.1.0"). npm refuse
#    l'install avec :
#      npm error code EOVERRIDE
#      npm error Override for ajv@^8.20.0 conflicts with direct dependency
#    → Comme les versions directes suffisent déjà, le bloc
#      "overrides" est supprimé.
#
# 2) WARNING (ERESOLVE peer dependency) :
#    "vite-plugin-pwa" est dans devDependencies alors que le
#    projet est un React 16 / react-scripts (Create React App),
#    sans Vite nulle part (aucun vite.config, aucun import
#    "vite-plugin-pwa" ou "VitePWA" dans src/). Ce paquet réclame
#    un peer "vite" absent → warnings ERESOLVE en cascade
#    (fdir, picomatch, postcss-load-config, yaml...) à chaque
#    install. → Dépendance inutilisée, supprimée.
#
# 3) NETTOYAGE :
#    "deps": "^1.0.0" dans dependencies n'est importé nulle part
#    dans src/ (paquet npm sans rapport avec le projet, ajouté
#    par erreur). → Supprimé.
#
# Ce script :
#   - sauvegarde package.json en package.json.bak
#   - réécrit package.json corrigé avec `cat >`
#   - valide le JSON généré avec `python3`
#
# À lancer depuis la racine du projet (là où se trouve package.json)
# ============================================================
set -e

if [ ! -f "package.json" ]; then
  echo "❌ Lance ce script depuis la racine du projet (package.json introuvable ici)."
  exit 1
fi

echo "→ Sauvegarde de package.json → package.json.bak"
cp package.json package.json.bak

echo "→ Écriture du package.json corrigé"
cat > package.json << 'PKGEOF'
{
  "name": "app-pme",
  "version": "3.0.0",
  "private": true,
  "dependencies": {
    "@dnd-kit/core": "6.0.8",
    "@dnd-kit/sortable": "7.0.2",
    "@dnd-kit/utilities": "3.2.1",
    "@hookform/resolvers": "2.9.11",
    "@stripe/react-stripe-js": "1.16.5",
    "@stripe/stripe-js": "1.54.2",
    "@supabase/supabase-js": "2.38.4",
    "@testing-library/jest-dom": "5.17.0",
    "@testing-library/react": "12.1.5",
    "@testing-library/user-event": "13.5.0",
    "@types/jest": "27.5.2",
    "@types/node": "16.18.68",
    "@types/react": "16.14.46",
    "@types/react-dom": "16.9.14",
    "@types/react-router-dom": "5.3.3",
    "@yudiel/react-qr-scanner": "1.0.0",
    "ajv": "^8.20.0",
    "ajv-keywords": "^5.1.0",
    "date-fns": "2.30.0",
    "framer-motion": "6.5.1",
    "html5-qrcode": "^2.3.8",
    "i18next": "23.10.0",
    "i18next-browser-languagedetector": "7.2.0",
    "jspdf": "^4.2.1",
    "localforage": "^1.10.0",
    "lucide-react": "0.263.1",
    "react": "16.14.0",
    "react-dom": "16.14.0",
    "react-ga": "3.3.1",
    "react-hook-form": "7.48.0",
    "react-hot-toast": "2.4.1",
    "react-i18next": "13.5.0",
    "react-mic": "12.4.6",
    "react-qr-code": "2.0.11",
    "react-query": "^3.39.3",
    "react-router-dom": "5.3.4",
    "react-scripts": "5.0.1",
    "recharts": "2.10.3",
    "typescript": "4.9.5",
    "uuid": "9.0.1",
    "web-vitals": "2.1.4",
    "xlsx": "^0.18.5",
    "zod": "3.22.4",
    "zustand": "^4.4.7"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
PKGEOF

echo "→ Validation du JSON avec python3"
python3 << 'PYEOF'
import json
import sys

with open("package.json", encoding="utf-8") as f:
    data = json.load(f)  # lève une exception si le JSON est invalide

problems = []
if "overrides" in data:
    problems.append("le bloc 'overrides' est encore présent")
if "deps" in data.get("dependencies", {}):
    problems.append("'deps' est encore dans dependencies")
if "vite-plugin-pwa" in data.get("devDependencies", {}):
    problems.append("'vite-plugin-pwa' est encore dans devDependencies")

if problems:
    print("❌ package.json invalide :")
    for p in problems:
        print("   -", p)
    sys.exit(1)

print("✅ package.json valide (JSON correct, overrides/deps/vite-plugin-pwa absents)")
print(f"   {len(data['dependencies'])} dependencies, "
      f"{len(data.get('devDependencies', {}))} devDependencies")
PYEOF

echo ""
echo "→ Fait. Prochaine étape :"
echo "   rm -rf node_modules package-lock.json"
echo "   npm install"
echo "   npm run build"
echo ""
echo "   (package.json original conservé dans package.json.bak)"
