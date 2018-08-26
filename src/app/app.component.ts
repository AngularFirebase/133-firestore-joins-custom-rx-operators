import { Component } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';

import { innerJoin, innerJoinDocument } from './collectionJoin';
import { docJoin } from './docJoin';

import { shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  user;
  joined;
  joined2;
  constructor(private afs: AngularFirestore) {
    this.user = this.afs
      .doc('users/jeff')
      .valueChanges()
      .pipe(
        docJoin(afs, { pet: 'pets', bff: 'users', car: 'cars' }),
        shareReplay(1)
      );

    this.joined = this.afs
      .collection('users')
      .valueChanges()
      .pipe(
        innerJoin(afs, 'userId', 'orders', 5),
        shareReplay(1)
      );

    this.joined2 = this.afs
      .collection('users')
      .valueChanges()
      .pipe(
        innerJoinDocument(afs, 'pet', 'pets'),
        shareReplay(1)
      );
  }
}
