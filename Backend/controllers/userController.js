import { User } from '../model/user_model.js';
import httpStatus from 'http-status';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: "Username and password are required"
    });
  }

  try {
    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: "Invalid username or password"
      });
    }

    // Generate token
    const token = crypto.randomBytes(20).toString('hex');

    user.token = token;
    await user.save();

    const userData = {
      _id: user._id,
      name: user.name,
      username: user.username,
      token: token
    };

    return res.status(httpStatus.OK).json({
      message: "Login successful",
      user: userData
    });

  } catch (err) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Error logging in user",
      error: err.message
    });
  }
};

const register = async (req, res) => {
  const { name, username, password } = req.body;

  if (!name || !username || !password) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: "All fields are required"
    });
  }

  try {
    const existingUser = await User.findOne({ username: username.toLowerCase() });

    if (existingUser) {
      return res.status(httpStatus.CONFLICT).json({
        message: "Username already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      username: username.toLowerCase(),
      password: hashedPassword
    });

    await newUser.save();

    return res.status(httpStatus.CREATED).json({
      message: "User registered successfully"
    });
  } catch (err) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Error registering user",
      error: err.message
    });
  }
};

export { login, register };
