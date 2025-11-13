const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
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
      { expiresIn: '365d' }, 
      (err, token) => {
        if (err) {
          console.log('Token signing error:', err);
          throw err;
        }
        console.log('Token created. Sending to client.');
        console.log('--- Login Attempt Successful ---');
        res.json({ token });
      }
    );
  } catch (err) {
    console.log('--- LOGIN FAILED: SERVER ERROR ---');
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.post('/api/snippets', auth, async (req, res) => {
  const { title, code, language } = req.body;
  const userId = req.user.id;

  if (!title || !code) {
    return res.status(400).json({ msg: 'Please enter a title and code.' });
  }

  try {
    const newSnippet = await pool.query(
      'INSERT INTO snippets (user_id, title, code, language) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, title, code, language]
    );
    res.status(201).json(newSnippet.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

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

app.put('/api/snippets/:id', auth, async (req, res) => {
  const { title, code, language } = req.body;
  const snippetId = req.params.id;
  const userId = req.user.id;

  try {
    const updatedSnippet = await pool.query(
      'UPDATE snippets SET title = $1, code = $2, language = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [title, code, language, snippetId, userId]
    );

    if (updatedSnippet.rows.length === 0) {
      return res.status(404).json({ msg: 'Snippet not found or user not authorized' });
    }
    res.json(updatedSnippet.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

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

app.get('/api/snippets/:id/versions', auth, async (req, res) => {
  const snippetId = req.params.id;
  const userId = req.user.id;
  
  try {
    const versions = await pool.query(
      `SELECT sv.* FROM snippet_versions sv
       JOIN snippets s ON sv.snippet_id = s.id
       WHERE sv.snippet_id = $1 AND s.user_id = $2
       ORDER BY sv.edited_at DESC`,
      [snippetId, userId]
    );
    
    res.json(versions.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.get('/api/folders', auth, async (req, res) => {
  try {
    const folders = await pool.query(
      'SELECT * FROM folders WHERE user_id = $1 ORDER BY name ASC',
      [req.user.id]
    );
    res.json(folders.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.post('/api/folders', auth, async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ msg: 'Folder name is required' });
  }
  
  try {
    const newFolder = await pool.query(
      'INSERT INTO folders (name, user_id) VALUES ($1, $2) RETURNING *',
      [name, req.user.id]
    );
    res.status(201).json(newFolder.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.delete('/api/folders/:id', auth, async (req, res) => {
  const folderId = req.params.id;
  const userId = req.user.id;
  
  try {
    const deleteOp = await pool.query(
      'DELETE FROM folders WHERE id = $1 AND user_id = $2',
      [folderId, userId]
    );
    
    if (deleteOp.rowCount === 0) {
      return res.status(404).json({ msg: 'Folder not found or user not authorized' });
    }
    res.json({ msg: 'Folder deleted. Snippets inside are now un-foldered.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.get('/api/tags', auth, async (req, res) => {
  try {
    const tags = await pool.query(
      'SELECT * FROM tags WHERE user_id = $1 ORDER BY name ASC',
      [req.user.id]
    );
    res.json(tags.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.post('/api/snippets/:id/tags', auth, async (req, res) => {
  const { name } = req.body;
  const snippetId = req.params.id;
  const userId = req.user.id;

  if (!name) {
    return res.status(400).json({ msg: 'Tag name is required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const snippetCheck = await client.query(
      'SELECT id FROM snippets WHERE id = $1 AND user_id = $2',
      [snippetId, userId]
    );
    if (snippetCheck.rows.length === 0) {
      throw new Error('Snippet not found or user not authorized');
    }

    const tag = await client.query(
      `INSERT INTO tags (name, user_id) VALUES ($1, $2)
       ON CONFLICT (user_id, name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [name.toLowerCase(), userId]
    );
    
    const tagId = tag.rows[0].id;

    await client.query(
      'INSERT INTO snippet_tags (snippet_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [snippetId, tagId]
    );

    await client.query('COMMIT');
    res.status(201).json({ snippet_id: snippetId, tag_id: tagId, name: name.toLowerCase() });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.message === 'Snippet not found or user not authorized') {
      return res.status(404).json({ msg: err.message });
    }
    console.error(err.message);
    res.status(500).send('Server error');
  } finally {
    client.release();
  }
});

app.delete('/api/snippets/:id/tags/:tagId', auth, async (req, res) => {
  const { id: snippetId, tagId } = req.params;
  const userId = req.user.id;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const snippetCheck = await client.query(
      'SELECT id FROM snippets WHERE id = $1 AND user_id = $2',
      [snippetId, userId]
    );
    if (snippetCheck.rows.length === 0) {
      throw new Error('Snippet not found or user not authorized');
    }

    const deleteOp = await client.query(
      'DELETE FROM snippet_tags WHERE snippet_id = $1 AND tag_id = $2',
      [snippetId, tagId]
    );
    
    if (deleteOp.rowCount === 0) {
      throw new Error('Tag not found on this snippet');
    }
    
    await client.query('COMMIT');
    res.json({ msg: 'Tag removed from snippet' });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.message.includes('not found')) {
      return res.status(404).json({ msg: err.message });
    }
    console.error(err.message);
    res.status(500).send('Server error');
  } finally {
    client.release();
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});