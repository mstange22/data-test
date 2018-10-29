module.exports = (app, watchStatsConnection, dbConnection) => {

  app.get('/watch', (req, res) => {
    watchStatsConnection.query('SELECT * FROM watch_day', (err, data) => {
      if (err) throw(err);
      else res.json(data);
    });
  });

  app.get('/emotion', (req, res) => {
    const queryString = 'SELECT * FROM emotion_day';
    watchStatsConnection.query(queryString, (err, data) => {
      if (err) throw(err);
      else res.json(data);
    });
  });

  app.get('/accounts/watchers', (req, res) => {
    const queryString = (
      'SELECT \
        a.patient_account_id, \
        a.read_write_share_code, \
        a.album_id \
      FROM \
        album a \
        JOIN customer_order co \
        ON a.album_id = co.album_id AND (co.status = \'active\' or co.status = \'trialing\')'
    );
    dbConnection.query(queryString, (err, data) => {
      if (err) throw(err);
      else res.json(data);
    });
  });

  app.get('/accounts/all', (req, res) => {
    const queryString = (
      'SELECT \
        patient_account_id, \
        a.read_write_share_code, \
        a.album_id \
      FROM \
        album a \
      WHERE \
        patient_account_id IS NOT NULL'
    );
    dbConnection.query(queryString, (err, data) => {
      if (err) throw(err);
      else res.json(data);
    });
  });

  app.get('/accounts/sms', (req, res) => {
    const queryString = 'SELECT * FROM account WHERE is_patient = \'0\' AND phone_number is not null';
    dbConnection.query(queryString, (err, data) => {
      if (err) throw(err);
      else res.json(data);
    });
  });

  app.get('/device', (req, res) => {
    const queryString = 'SELECT * FROM status';
    watchStatsConnection.query(queryString, (err, data) => {
      if (err) throw(err);
      else res.json(data);
    });
  });

  app.get('/music', (req, res) => {
    const queryString = 'SELECT * FROM music';
    watchStatsConnection.query(queryString, (err, data) => {
      if (err) throw(err);
      else res.json(data);
    });
  });

  app.get('/media/uploads', (req, res) => {
    const queryString = (
      'SELECT * FROM media m \
      JOIN customer_order co \
      ON m.album_id = co.album_id \
        AND (co.status = \'active\' or co.status = \'trialing\') \
        AND (m.type = \'video\' or m.type = \'image\')'
    );

    dbConnection.query(queryString, (err, data) => {
      if (err) throw(err);
      else res.json(data);
    });
  });

  app.get('/media/buckets', (req, res) => {
    const queryString = (
      'SELECT \
        x.media_count, \
        count(x.album_id) \
      FROM ( \
        SELECT \
          a.album_id, \
          co.order_id, \
          co.create_date, \
          co.update_date, \
          a.create_date as album_create_date, \
          co.chargify_sub_id, \
          a.name, \
          a.rachel_number, \
          co.sub_sku, \
          co.shipping_city, \
          co.status, \
          ceil(count(m.media_id) /10.00)*10 AS media_count, \
          count(m.media_id) AS raw_media_count \
        FROM album a \
        LEFT JOIN media m \
        ON m.album_id = a.album_id \
        LEFT JOIN customer_order co \
        ON co.album_id = a.album_id \
        WHERE a.rachel_number IS NOT NULL AND co.order_id IS NOT NULL AND (co.status = \'active\') \
        GROUP BY a.album_Id \
        ORDER BY media_count ASC) x \
      GROUP BY x.media_count \
      ORDER BY x.media_count ASC'
    );

    dbConnection.query(queryString, (err, data) => {
      if (err) throw(err);
      else res.json(data);
    });
  });

  app.get('/sms', (req, res) => {
    const queryString = ('SELECT * FROM sms_message');
    dbConnection.query(queryString, (err, data) => {
      if (err) throw(err);
      else res.json(data);
    });
  });

  app.get('/sales', (req, res) => {
    const queryString = ('SELECT * FROM customer_order WHERE create_date IS NOT NULL AND status <> \'unpaid\'');
    dbConnection.query(queryString, (err, data) => {
      if (err) throw(err);
      else res.json(data);
    });
  });
};