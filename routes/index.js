const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'HappyTailz API',
    routes: {
      public: ['POST /auth/register', 'POST /auth/login', 'GET /health', 'GET /plans'],
      user: ['GET/POST /pets', 'POST /walkingrequests', 'GET /walkingrequests/me'],
      admin: ['CRUD /admin/breeding', 'CRUD /admin/hospitals', 'CRUD /admin/grooming', 'CRUD /admin/plans', 'GET /walkingrequests', 'POST /walkingrequests/:id/complete', 'DELETE /walkingrequests/:id'],
      driver: ['POST /walkingrequests/:id/complete']
    }
  });
});

module.exports = router;
