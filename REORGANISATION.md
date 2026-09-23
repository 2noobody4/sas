# Réorganisation du dossier `src`

## Principe retenu
Les fichiers sont désormais classés **par utilité**, jamais par domaine métier.
Un seul niveau de dossiers : plus aucun sous-dossier `hooks/`, `registres/`, `styles/`
ou `components/` caché à l'intérieur d'un autre dossier.

```
src/
  App.tsx  main.tsx  index.tsx  index.css        (démarrage de l'app)
  pages/        98 fichiers   toutes les pages et écrans racine
  components/   90 fichiers   tous les composants d'interface
  hooks/        41 fichiers   tous les hooks
  registres/    28 fichiers   tous les registres (modules, thème, icônes, navigation…)
  types/        28 fichiers   toutes les définitions de types
  contexts/      8 fichiers   tous les contextes globaux
  lib/           7 fichiers   accès données, stockage, client Supabase, thème par défaut
  utils/         3 fichiers   fonctions utilitaires (PDF, génération de routes)
  i18n/          1 fichier    traductions
```

Tous les liens entre fichiers (211 fichiers déplacés) ont été recalculés automatiquement :
aucun import cassé, hors un import déjà mis en commentaire avant la réorganisation
(`registres/modulesRegistry.ts`, ligne `// ❌ SUPPRIMÉ : … clientModules`).

## Renommages notables
Quand deux fichiers portaient le même nom, le nom du métier a été ajouté devant :

| Avant | Après |
|---|---|
| pages/caisse/RapportsPage.tsx | pages/CaisseRapportsPage.tsx |
| pages/clients/RapportsPage.tsx | pages/ClientsRapportsPage.tsx |
| pages/boutique/CommandesPage.tsx | pages/BoutiqueCommandesPage.tsx |
| pages/client/CommandesPage.tsx | pages/ClientCommandesPage.tsx |
| pages/boutique/ServiceDetailPage.tsx | pages/BoutiqueServiceDetailPage.tsx |
| pages/gestion/services/ServiceDetailPage.tsx | pages/ServicesServiceDetailPage.tsx |
| pages/gestion/ManagementRoot.tsx | pages/GestionManagementRoot.tsx |
| pages/maintenance/MaintenancePage.tsx | pages/MaintenancePageLegacy.tsx |
| src/components/stocks/ProductForm.tsx | components/StocksProductForm.tsx |
| src/navigation/hooks/useNavigation.ts | hooks/useNavigationMenu.ts |
| components/navigation/styles/index.tsx | components/NavbarVariants.tsx |
| components/header/styles/index.tsx | components/HeaderVariants.tsx |

Les anciens fichiers `index.ts` de regroupement sont devenus des fichiers nommés :
`pages/boutique.ts`, `pages/stocks.ts`, `pages/services.ts`, `pages/inventaire.ts`,
`pages/dashboard.ts`, `components/caisse.ts`, `components/header.ts`,
`components/navigation.ts`, `components/homeWidgets.ts`, `components/navbarStyles.ts`,
`registres/managementModules.ts`.

Le détail complet est dans `mapping.md` (211 lignes).

## Ce que l'analyse a révélé (à traiter ensuite)

1. **Doublons réels.** `MaintenancePage` et `ManagementRoot` existaient en deux
   versions légèrement différentes ; `ProductForm` en trois. Une seule version de
   chaque est réellement utilisée, les autres sont conservées avec le suffixe
   `Legacy` / le préfixe du métier pour que rien ne casse. À supprimer après
   vérification.
2. **42 fichiers ne sont jamais utilisés** (pages Contracts, Commande client,
   composants de chargement en triple : `GlobalLoader`, `FullPageLoader`,
   `FullScreenLoader`, `UniversalList`, `DebugConsole`, etc.). Grand ménage
   possible et sans risque une fois validé un par un.
3. **Registre de composants coupé en morceaux** : `componentRegistry_part1/2/3`.
   À fusionner en un seul fichier, la découpe n'a aucune raison technique.
4. **Trois systèmes de données en parallèle** : `@tanstack/react-query` v4,
   `react-query` v3 et `zustand`. Un seul devrait rester (react-query v4).
5. **Base technique très ancienne** : React 16 avec des scripts `react-scripts`
   alors qu'un `vite.config.ts` existe déjà. Le passage à Vite + React 18/19
   est le vrai gain de performance à venir.
6. **Fichiers de travail à la racine du projet** (`fix_part1.sh`, `setup_part2.sh`,
   `1`, `4`, `9`, `68`…`71`, `App.patch`, `struct.txt`) : à sortir du dépôt.
7. **`.env.local` est présent dans l'archive** : à retirer et à changer de clés
   par précaution.
