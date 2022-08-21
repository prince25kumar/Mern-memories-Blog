import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../models/user.js';

export const signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({ message: "User does not exist" });
        }

        const isPasswordCorrect = await bcrypt.compare(password.toString(), existingUser.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, 'SECRETKEY', { expiresIn: "1h" });

        res.status(200).json({ result: existingUser, token });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const signup = async (req, res) => {
    const { email, password, confirmPassword, firstName, lastName } = req.body;

    try {
        const oldUser = await User.findOne({ email });

        if (oldUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        if (password.toString() != confirmPassword.toString()) {
            return res.status(400).json({ message: "Password not match" });
        }
        const hashedPassword = await bcrypt.hash(password.toString(), 12);
        const result = await User.create({ name: `${firstName} ${lastName}`, email: email.toString(), password: hashedPassword });

        const token = jwt.sign({ email: result.email, id: result._id }, 'SECRETKEY', { expiresIn: "1h" });

        res.status(201).json({ result, token });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });

        console.log(error);
    }
};