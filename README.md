# Firestore Join Queries with Custom RxJS Operators

Advanced RxJS Techniques to perform SQL-inspired joins with Firestore.

### Document Joins

`docJoin` - Joins multiple docs together into a single unified object. Useful when you have multiple has-one relationships.

```
+users
    docId=jeff {
      car: 'subaru'
      pet: 'humphrey'
    }

+pets
    docId=humphrey {
        type: 'dog'
        food: 'kibble'
    }

+cars
    docId=subaru {
        model: 'Legacy'
        doors: 4
    }
```

```ts
afs.collection('users')
      .valueChanges()
      .pipe(
        docJoin(afs, { car: 'cars', pet: 'pets' } )
      )


// result

{
    ...userData
    pet: { type: 'dog', food: 'kibble' },
    car: { model: 'Legacy', doors: 4 }
}
```

### Collection Joins

`innerJoin` - Joins two collections by a shared document field. Useful when you have a many-to-many relationship. ie `FROM users INNER JOIN orders ON users.userId`

```
+users
    docId=jeff {
        userId: 'jeff'
        ...data
    }

+orders
    docId=a {
        orderNo: 'A'
        userId: 'jeff'
    }

    docId=b {
        orderNo: 'B'
        userId: 'jeff'
    }
```

```ts
afs.collection('users')
      .valueChanges()
      .pipe(
        innerJoin(afs, 'userId', 'orders')
      )


// result

{
    ...userData
    orders: [{ orderNo: 'A', userId: 'jeff' }, { orderNo: 'B', userId: 'jeff' }]
}
```

`innerJoinDocument` - Joins a related doc to each item in a collection. Useful when the documents each have a has-one relationship to some other document. i, e. user has_one country.

```
+users
    docId=jeff {
        ...data
        location: usa
    }

+countries
    docId=usa {
        name: 'USA'
        capital: 'Washington D.C.'
    }
```

```ts
afs.collection('users')
      .valueChanges()
      .pipe(
        innerJoinDocument(afs, 'location', 'countries')
      )


// result

{
    ...userData
    location: { name: 'USA', capital: 'Washington D.C.' }
}
```
