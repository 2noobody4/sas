#!/data/data/com.termux/files/usr/bin/bash
# ============================================================
# Fix point 7 — Restreindre les routes par rôle (ex: TransactionsPage)
# À lancer depuis la racine du projet (là où se trouve package.json)
# ============================================================
set -e

if [ ! -f "package.json" ]; then
  echo "❌ Lance ce script depuis la racine du projet (package.json introuvable ici)."
  exit 1
fi

echo "→ Création de src/components/RouteGuard.tsx"
cat > src/components/RouteGuard.tsx << 'EOF'
// ============================================================
// RouteGuard — Bloque le rendu d'une page si le rôle courant
// ne figure pas dans route.roles. Tant que roles est vide/undefined,
// la route reste ouverte à tous (comportement identique à avant).
// ============================================================

import React from 'react';
import type { ComponentType } from 'react';

interface RouteGuardProps {
  roles?: string[];
  currentRole: string;
  component: ComponentType<any>;
  routeProps: any;
}

export function RouteGuard({ roles, currentRole, component: Component, routeProps }: RouteGuardProps) {
  const isAllowed = !roles || roles.length === 0 || roles.includes(currentRole);

  if (!isAllowed) {
    return (
      <div className="p-6 text-center text-[var(--color-textSecondary)]">
        <p className="font-medium">Accès refusé</p>
        <p className="text-sm mt-1">
          Vous n'avez pas les droits nécessaires pour accéder à cette page.
        </p>
      </div>
    );
  }

  return <Component {...routeProps} />;
}
EOF

echo "→ Sauvegarde de src/App.tsx en src/App.tsx.bak"
cp src/App.tsx src/App.tsx.bak

echo "→ Application du patch sur src/App.tsx (via python3)"
python3 << 'PYEOF'
import re
import sys

path = "src/App.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1) Ajout de l'import RouteGuard juste après l'import de ALL_ROUTES
import_marker = "import { ALL_ROUTES, useNavigation } from './utils/navigationIndex';"
import_addition = "import { RouteGuard } from './components/RouteGuard';"

if import_addition in content:
    print("• Import RouteGuard déjà présent, on saute cette étape.")
elif import_marker not in content:
    print("❌ Marqueur d'import introuvable, patch d'import annulé. Vérifie App.tsx manuellement.")
    sys.exit(1)
else:
    content = content.replace(
        import_marker,
        import_marker + "\n" + import_addition,
        1,
    )
    print("• Import RouteGuard ajouté.")

# 2) Remplacement du rendu de route pour passer par RouteGuard
old_block = """            {ALL_ROUTES.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                exact={route.path === '/'}
                component={route.component}
              />
            ))}"""

new_block = """            {ALL_ROUTES.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                exact={route.path === '/'}
                render={(props) => (
                  <RouteGuard
                    roles={route.roles}
                    currentRole={role}
                    component={route.component}
                    routeProps={props}
                  />
                )}
              />
            ))}"""

if new_block in content:
    print("• Bloc de routes déjà patché, on saute cette étape.")
elif old_block not in content:
    print("❌ Bloc de routes introuvable tel quel (le fichier a peut-être déjà été modifié).")
    print("   Aucune modification appliquée sur cette partie — vérifie App.tsx manuellement.")
    sys.exit(1)
else:
    content = content.replace(old_block, new_block, 1)
    print("• Bloc <Switch>/<Route> patché pour utiliser RouteGuard.")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("✅ src/App.tsx mis à jour.")
PYEOF

echo ""
echo "============================================================"
echo "Terminé."
echo "  - Nouveau fichier : src/components/RouteGuard.tsx"
echo "  - Modifié         : src/App.tsx (backup : src/App.tsx.bak)"
echo ""
echo "Vérifie ensuite avec :"
echo "  git diff src/App.tsx"
echo "  npm run build   (ou ton script de type-check habituel)"
echo "============================================================"
