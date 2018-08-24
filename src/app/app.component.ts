import { Component } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreDocument
} from 'angularfire2/firestore';

import { map, switchMap, tap } from 'rxjs/operators';
import { combineLatest, pipe, of } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  user;
  joined;
  constructor(private afs: AngularFirestore) {
    this.user = this.afs
      .doc('users/jeff')
      .valueChanges()
      .pipe(join(afs, { pet: 'pets', bff: 'users', car: 'cars' }));

    this.joined = this.afs
      .collection('users')
      .valueChanges()
      .pipe(
        join2(afs, 'pet', 'pets'),
        join2(afs, 'foo', 'bar'),
        tap(console.log)
      );
  }
}

// Usage:
// key = property on parent containing related docID
// val = path to collection with related doc

export const join = (
  afs: AngularFirestore,
  paths: { [key: string]: string }
) => {
  let parent;
  const keys = Object.keys(paths);

  return pipe(
    switchMap(data => {
      // Save the parent data state
      parent = data;

      // Map each path to an Observable
      const docs$ = keys.map(k => {
        const fullPath = `${paths[k]}/${parent[k]}`;
        return afs.doc(fullPath).valueChanges();
      });

      // return combineLatest, it waits for all reads to finish
      return combineLatest(docs$);
    }),
    map(arr => {
      // We now have all the associated douments
      // Reduce them to a single object based on the parent's keys
      const joins = keys.reduce((acc, cur, idx) => {
        return { ...acc, [cur]: arr[idx] };
      }, {});

      // Return the parent doc with the joined objects
      return { ...parent, ...joins };
    })
  );
};

export const join2 = (afs: AngularFirestore, field, collection) => {
  let collectionData;
  const cache = new Map();

  return pipe(
    switchMap(data => {
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
      const final = collectionData.map((v, i) => {
        const joinIdx = cache.get(v[field]);
        return { ...v, [field]: joins[joinIdx] || null };
      });

      console.log(`Query size ${final.length} + joined ${cache.size} docs`);

      return final;
    })
  );
};
