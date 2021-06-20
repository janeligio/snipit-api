import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../mongoose/models/User';
import { validateLogin, validateSignup } from '../util/validation';
import { jwtSecret } from '../config/keys';

const authRoutes = express.Router();

// The bigger the number, the more computations to generate salt for hashed password
const saltRounds = 10;

authRoutes.post('/register', (req, res) => { });

authRoutes.post('/login', (req, res) => { });

export default authRoutes;