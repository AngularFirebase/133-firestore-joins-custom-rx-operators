import { AngularFirestore } from 'angularfire2/firestore';

import { combineLatest, pipe, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

export const collectionJoin = (afs: AngularFirestore, field, collection) => {
  let collectionData;
  const cache = new Map();

  return pipe(
    switchMap(data => {
      // Clear mapping on each emitted val ;
      cache.clear();

      // Save the parent data state
      collectionData = data as any[];

      const reads$ = [];
      let i = 0;
      for (const doc of collectionData) {
        // Skip if doc field does not exist or is already in cache
        if (!doc[field] || cache.get(doc[field])) {
          continue;
        }

        // Push doc read to Array
        reads$.push(
          afs
            .collection(collection)
            .doc(doc[field])
            .valueChanges()
        );
        cache.set(doc[field], i);
        i++;
      }

      return reads$.length ? combineLatest(reads$) : of([]);
    }),
    map(joins => {
      return collectionData.map((v, i) => {
        const joinIdx = cache.get(v[field]);
        return { ...v, [field]: joins[joinIdx] || null };
      });
    }),
    tap(final =>
      console.log(`Queried ${final.length} and Joined ${cache.size}`)
    )
  );
};
