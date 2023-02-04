import mongoose from 'mongoose';
import { config } from './config'

import '@models/activity';
import '@models/club';
import '@models/role';
import '@models/suggestion';
import '@models/user';
import '@models/match';
import '@models/league';
import '@models/country';

const { mongoConnection } = config;

mongoose.set('strictQuery', false);
mongoose.connect(mongoConnection);

export default mongoose.connection;
