/**
 * Transforme la liste plate des emplacements d'un espace en liste ordonnée « en arbre » :
 * chaque parent est suivi de ses enfants, triés par nom, avec leur profondeur et leur chemin.
 *
 * Entrée  : [{ id, parentId, name }, …]
 * Sortie  : [{ id, name, depth, path }, …]   path = noms des ancêtres, ex. « Garage › Étagère haute »
 */
export function buildLocationTree(locations) {
  const childrenByParent = new Map();
  for (const location of locations) {
    const key = location.parentId ?? null;
    if (!childrenByParent.has(key)) childrenByParent.set(key, []);
    childrenByParent.get(key).push(location);
  }
  for (const children of childrenByParent.values()) {
    children.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  }

  const result = [];
  const visited = new Set(); // garde-fou si les données contenaient un cycle

  function visit(parentId, depth, path) {
    for (const location of childrenByParent.get(parentId) ?? []) {
      if (visited.has(location.id)) continue;
      visited.add(location.id);
      result.push({ id: location.id, name: location.name, depth, path });
      visit(location.id, depth + 1, path ? `${path} › ${location.name}` : location.name);
    }
  }

  visit(null, 0, '');
  return result;
}
