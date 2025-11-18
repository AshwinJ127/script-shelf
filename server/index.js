// Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // For hashing passwords
const jwt = require('jsonwebtoken'); // For creating login tokens
const { Pool } = require('pg'); // For connecting to Postgres
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5050; 

// === Database Connection ===
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// === Middleware ===
app.use(cors());
app.use(express.json()); 


// === Routes ===

app.get('/', (req, res) => {
  res.send('ScriptShelf API is running!');
});

// --- REAL User Registration Route ---
app.post('/api/users/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, password_hash]
    );

    res.status(201).json({
      id: newUser.rows[0].id,
      email: newUser.rows[0].email,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// --- NEW User Login Route ---
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    console.log('Login failed: Email or password missing');
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);

    if (user.rows.length === 0) {
      console.log('Login failed: User not found.');
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const foundUser = user.rows[0];

    const isMatch = await bcrypt.compare(password, foundUser.password_hash);

    if (!isMatch) {
      console.log('Login failed: Passwords do not match.');
      return res.status(400).json({ msg: 'Invalid credentials' });
    }


    const payload = {
      user: {
        id: foundUser.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '365d' }, // Token expires in 1 year
      (err, token) => {
        if (err) {
          console.log('Token signing error:', err);
          throw err;
        }
        console.log('Token created. Sending to client.');
        console.log('--- Login Attempt Successful ---');
        res.json({ token }); // Send the token back to the client
      }
    );
  } catch (err) {
    console.log('--- LOGIN FAILED: SERVER ERROR ---');
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// --- CREATE A NEW SNIPPET ---
app.post('/api/snippets', auth, async (req, res) => {
  const { title, code, language, is_public } = req.body;
  const userId = req.user.id; // <-- We get this from the auth middleware

  if (!title || !code) {
    return res.status(400).json({ msg: 'Please enter a title and code.' });
  }

  // Default to private if not specified
  const publicStatus = is_public === true || is_public === 'true';

  try {
    const newSnippet = await pool.query(
      'INSERT INTO snippets (user_id, title, code, language, is_public) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, title, code, language, publicStatus]
    );
    res.status(201).json(newSnippet.rows[0]);
  } catch (err) {
    console.error(err.message);
    // If column doesn't exist yet, try without is_public
    if (err.message.includes('column "is_public"')) {
      try {
        const newSnippet = await pool.query(
          'INSERT INTO snippets (user_id, title, code, language) VALUES ($1, $2, $3, $4) RETURNING *',
          [userId, title, code, language]
        );
        res.status(201).json(newSnippet.rows[0]);
      } catch (fallbackErr) {
        console.error(fallbackErr.message);
        res.status(500).send('Server error');
      }
    } else {
      res.status(500).send('Server error');
    }
  }
});

// --- GET ALL OF A USER'S SNIPPETS ---
app.get('/api/snippets', auth, async (req, res) => {
  try {
    const snippets = await pool.query(
      'SELECT * FROM snippets WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(snippets.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// --- UPDATE A SNIPPET ---
app.put('/api/snippets/:id', auth, async (req, res) => {
  const { title, code, language, is_public } = req.body;
  const snippetId = req.params.id;
  const userId = req.user.id;

  try {
    // Handle is_public if provided
    let updatedSnippet;
    if (is_public !== undefined) {
      const publicStatus = is_public === true || is_public === 'true';
      updatedSnippet = await pool.query(
        'UPDATE snippets SET title = $1, code = $2, language = $3, is_public = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
        [title, code, language, publicStatus, snippetId, userId]
      );
    } else {
      updatedSnippet = await pool.query(
        'UPDATE snippets SET title = $1, code = $2, language = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
        [title, code, language, snippetId, userId]
      );
    }

    // Fallback if is_public column doesn't exist
    if (updatedSnippet.rows.length === 0 && is_public !== undefined) {
      updatedSnippet = await pool.query(
        'UPDATE snippets SET title = $1, code = $2, language = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
        [title, code, language, snippetId, userId]
      );
    }

    if (updatedSnippet.rows.length === 0) {
      return res.status(404).json({ msg: 'Snippet not found or user not authorized' });
    }
    res.json(updatedSnippet.rows[0]);
  } catch (err) {
    console.error(err.message);
    if (err.message.includes('column "is_public"') && is_public !== undefined) {
      // Try without is_public if column doesn't exist
      try {
        const updatedSnippet = await pool.query(
          'UPDATE snippets SET title = $1, code = $2, language = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
          [title, code, language, snippetId, userId]
        );
        if (updatedSnippet.rows.length === 0) {
          return res.status(404).json({ msg: 'Snippet not found or user not authorized' });
        }
        res.json(updatedSnippet.rows[0]);
      } catch (fallbackErr) {
        console.error(fallbackErr.message);
        res.status(500).send('Server error');
      }
    } else {
      res.status(500).send('Server error');
    }
  }
});

// --- DELETE A SNIPPET ---
app.delete('/api/snippets/:id', auth, async (req, res) => {
  const snippetId = req.params.id;
  const userId = req.user.id;

  try {
    const deleteOp = await pool.query(
      'DELETE FROM snippets WHERE id = $1 AND user_id = $2',
      [snippetId, userId]
    );
    
    if (deleteOp.rowCount === 0) {
      return res.status(404).json({ msg: 'Snippet not found or user not authorized' });
    }
    res.json({ msg: 'Snippet deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// === Server Start ===
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});