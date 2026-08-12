import fs from 'fs';

let content = fs.readFileSync('/home/z/my-project/src/lib/store.ts', 'utf-8');

// Find all product blocks and replace their image paths
const pattern = /id: '([^']+)',\s*name: '([^']+)',\s*description: '[^']+',\s*price: [\d.]+,\s*originalPrice: [\d.]+,\s*category: '([^']+)',\s*subcategory: '([^']+)',\s*image: '([^']+)'/g;

let count = 0;
content = content.replace(pattern, (match, id, name, cat, subcat, oldImage) => {
  const newImage = `/products/gen/${id}.png`;
  if (oldImage !== newImage) {
    count++;
    return match.replace(`image: '${oldImage}'`, `image: '${newImage}'`);
  }
  return match;
});

fs.writeFileSync('/home/z/my-project/src/lib/store.ts', content);
console.log(`Updated ${count} image paths in store.ts`);
