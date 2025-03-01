import { Router, Request, Response } from 'express';
import { UnitUser } from './user.interface';
import { StatusCodes } from 'http-status-codes';
import * as database from './user.database';

export const userRouter = Router();

userRouter.get('/users', async (req: Request, res: Response): Promise<void> => {
    try {
        const allUsers: UnitUser[] = await database.findAll();
        if (!allUsers) {    
            res.status(500).json({ msg: 'No users at this time..' });
            return;
        }
        res.status(StatusCodes.OK).json({ total_user: allUsers.length, allUsers });
    } catch (err) {
        res.status(500).json({ err });
    }
});

userRouter.get('/user/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const user: UnitUser = await database.findOne(req.params.id);
        if (!user) {
            res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' });
            return;
        }
        res.status(StatusCodes.OK).json({ user });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err });
    }
});

userRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: 'Please provide all required parameters.' });
            return;
        }

        const user = await database.findByEmail(email);
        if (user) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: 'This email has already been registered.' });
            return;
        }

        const newUser = await database.create(req.body);
        res.status(StatusCodes.CREATED).json({ newUser });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err });
    }
});

userRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: 'Please provide all required parameters.' });
            return;
        }

        const user = await database.findByEmail(email);
        if (!user) {
            res.status(StatusCodes.NOT_FOUND).json({ error: 'No user exists with the provided email.' });
            return;
        }

        const comparePassword = await database.comparePassword(email, password);
        if (!comparePassword) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: 'Incorrect password!' });
            return;
        }

        res.status(StatusCodes.OK).json({ user });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err });
    }
});

userRouter.put('/user/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password } = req.body;

        const getUser = await database.findOne(req.params.id);
        if (!getUser) {
            res.status(StatusCodes.NOT_FOUND).json({ error: `No user with ID ${req.params.id}` });
            return;
        }

        if (!username || !email || !password) {
            res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Please provide all required parameters.' });
            return;
        }

        const updateUser = await database.update(req.params.id, req.body);
        res.status(StatusCodes.OK).json({ updateUser });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err });
    }
});

userRouter.delete('/user/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id;

        const user = await database.findOne(id);
        if (!user) {
            res.status(StatusCodes.NOT_FOUND).json({ error: 'User does not exist' });
            return;
        }

        await database.remove(id);
        res.status(StatusCodes.OK).json({ msg: 'User deleted' });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err });
    }
});
