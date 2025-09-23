const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'HappyTailz API',
    routes: {
      public: ['POST /auth/register', 'POST /auth/login', 'GET /health'],
      user: ['GET/POST /pets', 'GET /userplans', 'POST /userplans', 'POST /walkingrequests', 'GET /walkingrequests/me'],
      admin: ['CRUD /admin/breeding', 'CRUD /admin/hospitals', 'CRUD /admin/grooming', 'CRUD /admin/plans', 'GET /walkingrequests'],
      driver: ['POST /walkingrequests/:id/complete']
    }
  });
});

module.exports = router;
