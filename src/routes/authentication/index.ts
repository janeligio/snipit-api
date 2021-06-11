import express from 'express';
import { validateLogin, validateSignup } from '../../util/validation';
const router = express.Router();

/**
 * @route POST /auth/login
 * @description Validates user and returns JWT token
 * @access Public
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const valid = validateLogin(email, password);
});

/**
 * @route POST /auth/signup
 * @description Validates user, password, and pushes new User to database
 * @access Public
 */
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const valid = validateSignup(email, password);
});

export default router;
