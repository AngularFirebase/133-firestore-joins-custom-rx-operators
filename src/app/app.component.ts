import { Component } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';

import { collectionJoin } from './collectionJoin';
import { docJoin } from './docJoin';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  user;
  joined;
  constructor(private afs: AngularFirestore) {
    // Usage docJoin:
    // key = property on parent containing related docID
    // val = path to collection

    this.user = this.afs
      .doc('users/jeff')
      .valueChanges()
      .pipe(docJoin(afs, { pet: 'pets', bff: 'users', car: 'cars' }));

    this.joined = this.afs
      .collection('users')
      .valueChanges()
      .pipe(collectionJoin(afs, 'pet', 'pets'));
  }
}
