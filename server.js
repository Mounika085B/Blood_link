require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(express.json());
app.use(cors());

/* =========================
   MYSQL DATABASE
========================= */
const db = mysql.createConnection({
  host: process.env.DB_HOST,

  user: process.env.DB_USER,

  password: process.env.DB_PASSWORD,

  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.log("❌ Database Error:", err);
  } else {
    console.log("✅ MySQL Connected");
  }
});

/* =========================
   HOME
========================= */
app.get("/", (req, res) => {
  res.send("🩸 BloodLink Backend Running");
});

/* =====================================================
   REGISTER API
===================================================== */
app.post("/register", async (req, res) => {

  try {

    const {
      name,
      email,
      username,
      password
    } = req.body;

    const checkSql =
      "SELECT * FROM users WHERE email=? OR username=?";

    db.query(
      checkSql,
      [email, username],
      async (err, result) => {

        if (err) {
          return res.status(500).json({
            success: false,
            message: err.message
          });
        }

        if (result.length > 0) {
          return res.json({
            success: false,
            message: "User already exists"
          });
        }

        const hashedPassword =
          await bcrypt.hash(password, 10);

        const insertSql = `
          INSERT INTO users
          (name, email, username, password)
          VALUES (?, ?, ?, ?)
        `;

        db.query(
          insertSql,
          [
            name,
            email,
            username,
            hashedPassword
          ],
          (err) => {

            if (err) {
              return res.status(500).json({
                success: false,
                message: err.message
              });
            }

            res.json({
              success: true,
              message: "Registration successful"
            });
          }
        );
      }
    );

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
});

/* =====================================================
   LOGIN API
===================================================== */
app.post("/login", (req, res) => {

  const { username, password } = req.body;

  const sql =
    "SELECT * FROM users WHERE username=? OR email=?";

  db.query(
    sql,
    [username, username],
    async (err, result) => {

      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      if (result.length === 0) {
        return res.json({
          success: false,
          message: "User not found"
        });
      }

      const user = result[0];

      const isMatch =
        await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.json({
          success: false,
          message: "Wrong password"
        });
      }

      res.json({
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          username: user.username
        }
      });

    }
  );
});

/* =====================================================
   DONORS API
===================================================== */

// GET donors
app.get("/donors", (req, res) => {

  db.query(
    "SELECT * FROM donors",
    (err, result) => {

      if (err) {
        return res.status(500).send(err);
      }

      res.json(result);
    }
  );
});

// ADD donor
app.post("/donors", (req, res) => {

  const {
    id,
    name,
    age,
    gender,
    blood_group,
    last_donation,
    eligibility
  } = req.body;

  const sql = `
    INSERT INTO donors
    (id, name, age, gender, blood_group, last_donation, eligibility)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      id,
      name,
      age,
      gender,
      blood_group,
      last_donation,
      eligibility
    ],
    (err) => {

      if (err) {
        console.log(err);
        return res.status(500).json({
          error: err.message
        });
      }

      res.json({
        success: true,
        message: "Donor Added"
      });
    }
  );
});

// DELETE donor
app.delete("/donors/:id", (req, res) => {

  db.query(
    "DELETE FROM donors WHERE id=?",
    [req.params.id],
    (err) => {

      if (err) {
        return res.status(500).send(err);
      }

      res.send("Donor Deleted");
    }
  );
});

/* =====================================================
   BLOOD BANKS API
===================================================== */

// GET banks
app.get("/banks", (req, res) => {

  db.query(
    "SELECT * FROM banks",
    (err, result) => {

      if (err) {
        return res.status(500).send(err);
      }

      res.json(result);
    }
  );
});

// ADD bank
app.post("/banks", (req, res) => {

  const {
    id,
    name,
    location,
    contact
  } = req.body;

  const sql = `
    INSERT INTO banks
    (id, name, location, contact)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      id,
      name,
      location,
      contact
    ],
    (err) => {

      if (err) {
        return res.status(500).send(err);
      }

      res.send("Bank Added");
    }
  );
});

/* =====================================================
   PATIENTS API
===================================================== */

// GET patients
app.get("/patients", (req, res) => {

  db.query(
    "SELECT * FROM patients",
    (err, result) => {

      if (err) {
        return res.status(500).send(err);
      }

      res.json(result);
    }
  );
});

// ADD patient
app.post("/patients", (req, res) => {

  const {
    id,
    name,
    age,
    gender,
    blood_group,
    disease
  } = req.body;

  const sql = `
    INSERT INTO patients
    (id, name, age, gender, blood_group, disease)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      id,
      name,
      age,
      gender,
      blood_group,
      disease
    ],
    (err) => {

      if (err) {
        return res.status(500).send(err);
      }

      res.send("Patient Added");
    }
  );
});

/* =====================================================
   BLOOD STOCK API
===================================================== */

// GET stock
app.get("/stock", (req, res) => {

  db.query(
    "SELECT * FROM stock",
    (err, result) => {

      if (err) {
        return res.status(500).send(err);
      }

      res.json(result);
    }
  );
});

// ADD stock
app.post("/stock", (req, res) => {

  const {
    id,
    bank_id,
    blood_group,
    quantity,
    expiry_date
  } = req.body;

  const sql = `
    INSERT INTO stock
    (id, bank_id, blood_group, quantity, expiry_date)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      id,
      bank_id,
      blood_group,
      quantity,
      expiry_date
    ],
    (err) => {

      if (err) {
        return res.status(500).send(err);
      }

      res.send("Stock Added");
    }
  );
});

/* =====================================================
   DONATIONS API
===================================================== */

// GET donations
app.get("/donations", (req, res) => {

  db.query(
    "SELECT * FROM donations",
    (err, result) => {

      if (err) {
        return res.status(500).send(err);
      }

      res.json(result);
    }
  );
});

// ADD donation
app.post("/donations", (req, res) => {

  const {
    id,
    donor_id,
    bank_id,
    quantity,
    donation_date
  } = req.body;

  const sql = `
    INSERT INTO donations
    (id, donor_id, bank_id, quantity, donation_date)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      id,
      donor_id,
      bank_id,
      quantity,
      donation_date
    ],
    (err) => {

      if (err) {
        return res.status(500).send(err);
      }

      res.send("Donation Added");
    }
  );
});

/* =====================================================
   REQUESTS API
===================================================== */

// GET requests
app.get("/requests", (req, res) => {

  db.query(
    "SELECT * FROM requests",
    (err, result) => {

      if (err) {
        return res.status(500).send(err);
      }

      res.json(result);
    }
  );
});

// ADD request
// ADD request
app.post("/requests", (req, res) => {

  const {
    id,
    patient_id,
    blood_group,
    quantity,
    bank_id,
    priority,
    status
  } = req.body;

  const sql = `
    INSERT INTO requests
    (id, patient_id, blood_group, quantity, bank_id, priority, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      id,
      patient_id,
      blood_group,
      quantity,
      bank_id,
      priority,
      status
    ],
    (err) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      /* =========================
         SAVE NOTIFICATION
      ========================= */

      const message =
        `🩸 ${blood_group} blood request added`;

      db.query(
        "INSERT INTO notifications (message) VALUES (?)",
        [message]
      );

      res.json({
        success: true,
        message: "Request Added Successfully"
      });

    }
  );
});

// APPROVE request
app.put("/requests/:id/approve", (req, res) => {

  db.query(
    "UPDATE requests SET status='Approved' WHERE id=?",
    [req.params.id],
    (err) => {

      if (err) {
        return res.status(500).send(err);
      }

      res.send("Request Approved");
    }
  );
});

// REJECT request
app.put("/requests/:id/reject", (req, res) => {

  db.query(
    "UPDATE requests SET status='Rejected' WHERE id=?",
    [req.params.id],
    (err) => {

      if (err) {
        return res.status(500).send(err);
      }

      res.send("Request Rejected");
    }
  );
});


/* =========================
   🚨 EMERGENCY TIMER API
========================= */

/* =========================
   🚨 EMERGENCY TIMER API
========================= */

// Get all emergency requests
app.get("/emergency", (req, res) => {

  const sql = `
    SELECT *,
    TIMESTAMPDIFF(SECOND, NOW(), deadline) AS remaining_seconds
    FROM emergency_requests
    ORDER BY deadline ASC
  `;

  db.query(sql, (err, result) => {

    if (err) {
      console.log(err);
      res.status(500).json(err);
    }
    else {
      res.json(result);
    }

  });

});


// Add emergency request
app.post("/emergency", (req, res) => {

  const {
    patient_name,
    blood_group,
    hospital,
    units,
    deadline,
    notes
  } = req.body;

  const sql = `
    INSERT INTO emergency_requests
    (patient_name, blood_group, hospital, units, deadline, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      patient_name,
      blood_group,
      hospital,
      units,
      deadline,
      notes
    ],
    (err, result) => {

      if (err) {
        console.log(err);
        res.status(500).json(err);
      }
      else {
        res.json({
          success: true,
          message: "Emergency request added"
        });
      }

    }
  );

});


// Delete emergency request
app.delete("/emergency/:id", (req, res) => {

  const sql =
    "DELETE FROM emergency_requests WHERE id=?";

  db.query(
    sql,
    [req.params.id],
    (err, result) => {

      if (err) {
        console.log(err);
        res.status(500).json(err);
      }
      else {
        res.json({
          success: true,
          message: "Emergency request deleted"
        });
      }

    }
  );

});

/* =========================
   📊 DASHBOARD STATS API
========================= */

app.get("/dashboard", async (req, res) => {

  const dashboard = {};

  db.query(
    "SELECT COUNT(*) AS total FROM donors",
    (err, donors) => {

      if (err) return res.status(500).json(err);

      dashboard.donors = donors[0].total;

      db.query(
        "SELECT COUNT(*) AS total FROM blood_banks",
        (err, banks) => {

          dashboard.banks = banks[0].total;

          db.query(
            "SELECT COUNT(*) AS total FROM blood_stock",
            (err, stock) => {

              dashboard.stock = stock[0].total;

              db.query(
                "SELECT COUNT(*) AS total FROM donations",
                (err, donations) => {

                  dashboard.donations =
                    donations[0].total;

                  db.query(
                    "SELECT COUNT(*) AS total FROM requests",
                    (err, requests) => {

                      dashboard.requests =
                        requests[0].total;

                      db.query(
                        "SELECT COUNT(*) AS total FROM patients",
                        (err, patients) => {

                          dashboard.patients =
                            patients[0].total;

                          db.query(
                            "SELECT COUNT(*) AS total FROM emergency_requests",
                            (err, emergency) => {

                              dashboard.emergency =
                                emergency[0].total;

                              res.json(dashboard);

                            }
                          );

                        }
                      );

                    }
                  );

                }
              );

            }
          );

        }
      );

    }
  );

});

/* =========================
   🔔 NOTIFICATIONS API
========================= */

app.get("/notifications", (req, res) => {

  db.query(
    "SELECT * FROM notifications ORDER BY id DESC",
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json(result);

    }
  );

});




/* =====================================================
   START SERVER
===================================================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});