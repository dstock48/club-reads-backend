const express = require('express');
const bodyParser = require('body-parser');
// const path = require('path');
const app = express();
const port = (process.env.PORT || 3000);

const environment = process.env.NODE_ENV || 'development'
const configuration = require('./knexfile')[environment]
const database = require('knex')(configuration)

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, 'public')));

// ENDPOINTS

// Get the clubs so a new user can select which club to join
app.get('/api/v1/club', (request, response) => {
  database('club').select()
    .then((clubs) => {
      response.status(200).json(clubs);
    })
    .catch((error) => {
      response.status(500).json({ error });
    });
});

// Login a user
// Sign up a new user
app.post('/api/v1/user/:action', (request, response) => {
  const newUser = request.body;
  const { email } = newUser;
  const { action } = request.params;

  if (action === 'login') {
    database('user').where({ email }).select()
      .then((user) => {
        if (!user.length) {
          throw new Error('User not found');
        }
        response.status(200).json({ user: user[0], message: 'login sucessful!' });
      })
      .catch((error) => {
        response.status(404).json({ error: error.message });
      });
  } else if (action === 'signup') {
    database('user').insert(newUser, '*')
      .then((user) => {
        response.status(201).json({ user, message: 'new user created!' });
      })
      .catch((error) => {
        response.status(500).json({ error: error.detail });
      });
  } else {
    response.status(500).json({ error: 'no endpoint found.' });
  }
});

// View all club books
app.get('/api/v1/book', (request, response) => {
  database('book').select()
    .then((books) => {
      response.status(200).json(books);
    })
    .catch((error) => {
      response.status(500).json({ error });
    });
});

// Add a new club
app.post('/api/v1/club', (request, response) => {
  const newClub = request.body;

  for (const requiredParamater of ['name']) {
    if (!newClub[requiredParamater]) {
      return response.status(422).json({
        error: `Missing required ${requiredParamater} parameter`,
      });
    }
  }

  database('club').insert(newClub, '*')
    .then((club) => {
      response.status(201).json(club[0]);
    })
    .catch((error) => {
      response.status(500).json({ error });
    });
});

// Add a new book to club books
app.post('/api/v1/book', (request, response) => {
  const newBook = request.body;

  for (const requiredParamater of ['title', 'author', 'ISBN', 'description', 'image', 'upvotes', 'downvotes', 'status', 'user_id']) {
    if (!newBook[requiredParamater]) {
      return response.status(422).json({
        error: `Missing required ${requiredParamater} parameter`,
      });
    }
  }

  database('book').insert(newBook, '*')
    .then((book) => {
      response.status(201).json(book[0]);
    })
    .catch((error) => {
      response.status(500).json({ error });
    });
});

// Add a vote
app.post('/api/v1/vote', (request, response) => {
  const newVote = request.body;

  for (const requiredParamater of ['direction', 'user_id', 'book_id']) {
    if (!newVote[requiredParamater]) {
      return response.status(422).json({
        error: `Missing required ${requiredParamater} parameter`
      });
    }
  }

  database('vote').insert(newVote, '*')
    .then((vote) => {
      response.status(201).json(vote[0]);
    })
    .catch((error) => {
      response.status(500).json({ error });
    });
});

// Delete a vote
app.delete('/api/v1/vote/:id', (request, response) => {
  database('vote')
    .where('id', request.params.id)
    .del('*')
    .then((vote) => {
      if (vote.length) {
        response.status(200).json({ vote });
      } else {
        response.status(404).json({
          error: 'No vote data exists for that id'
        });
      }
    })
    .catch((error) => {
      response.status(500).json({ error });
    });
});

// Edit vote
app.patch('/api/v1/vote/:id', (request, response) => {
  const newVote = request.body;
  
  for (const requiredParamater of ['direction']) {
    if (!newVote[requiredParamater]) {
      return response.status(422).json({
        error: `Missing required ${requiredParamater} parameter`,
      });
    }
  }

  database('vote')
    .where('id', request.params.id)
    .update(newVote, '*')
    .then((vote) => {
      if (vote.length) {
        response.status(201).json({ vote });
      } else {
        response.status(404).json({
          error: 'No vote data exists for that id'
        });
      }
    })
    .catch((error) => {
      response.status(500).json({ error });
    });
});

app.listen(port, () => {
  console.log(`App is listening on http://localhost:${port}`);
});

module.exports = app;
