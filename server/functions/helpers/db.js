const getQuery = async (db, collection, queryParams, fields) => {
  const tableRef = db.collection(collection);
  let response = [];

  return tableRef
    .where(queryParams[0].field, '==', queryParams[0].value)
    .get().then(snapshot => {
      if (snapshot.empty) {
        return response;
      }

      snapshot.forEach(doc => {
        let auxObj = { };
        
        fields.forEach(f => {
          if (doc.data()[f]) {
            auxObj[f] = doc.data()[f];
          }
        });

        if (Object.keys(auxObj).length > 0) {
          response.push(auxObj);
        }
      });

      for (let i = 1, c = queryParams.length; i < c; i += 1) {
        response =
          response.filter(e => e[queryParams[i].field] === queryParams[i].value);
      }

      return response;
  }).catch(err => {
    console.error('Error: ', err);
    return response;
  });
}

const insert = async (db, collection, id, object) => {
  try {
    const dbRef = db.collection(collection).doc(id);

    await dbRef.set(object);
    
    return object;
  } catch (err) {
    console.error(err);
  }

  return false;
}

const deleteCollection = async (db, collection, id) => {
  try {
    await db.collection(collection).doc(id).delete();

    return id;
  } catch (err) {
    console.error(err);
  }

  return false;
}

module.exports = {
  insert,
  deleteCollection,
  getQuery,
}