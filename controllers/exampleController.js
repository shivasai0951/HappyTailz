// Example controller - you can modify this as needed
const exampleController = {
  // GET /api/example
  getExample: (req, res) => {
    try {
      res.json({
        message: 'This is an example controller',
        data: {
          timestamp: new Date().toISOString(),
          method: req.method,
          path: req.path
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  },

  // POST /api/example
  createExample: (req, res) => {
    try {
      const { body } = req;
      res.status(201).json({
        message: 'Example created successfully',
        data: body,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }
};

module.exports = exampleController;
