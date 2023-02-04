// @ts-nocheck
import fs from 'fs';
import moment from 'moment';

import EmailSender from '@services/emailSender';
import Club from '@models/club';
import User from '@models/user';
import Role from '@models/role';
import Suggestion from '@models/suggestion';
import League from '@models/league';

import ApiError from '@utilities/apiError';
import { config } from '@config/config';
import errorCodes from '@config/errorCodes';

class Backup {
  create = async () => {
    try {
      const users = await User.find({});
      const clubs = await Club.find({});
      const roles = await Role.find({});
      const suggestions = await Suggestion.find({});
      const leagues = await League.find({});

      const finalJson = {
        clubs,
        users,
        roles,
        suggestions,
        leagues,
      };

      const fileName = `${moment().format('YYYY-MM-DD HH-mm-ss')}.json`;

      await fs.promises.writeFile(`backups/${fileName}`, JSON.stringify(finalJson), 'utf8');

      await EmailSender.sendEmail({
        to: config.mainEmail,
        subject: `UltrasMap: Backup (${config.adminUrl})`,
        html: 'Został utworzony nowy backup.',
        attachments: [{
          filename: fileName,
          path: `backups/${fileName}`,
        }],
      });

      return fileName;
    } catch (error) {
      throw new ApiError(errorCodes.Internal, error);
    }
  };

  restore = async (fileName, collectionsToRetore = []) => {
    try {
      const fileData = await fs.promises.readFile(`backups/${fileName}`, 'utf-8');

      const {
        users,
        clubs,
        roles,
        suggestions,
        leagues,
      } = JSON.parse(fileData);

      if (collectionsToRetore.includes('roles')) {
        await Role.deleteMany({});
        await Role.insertMany(roles);
      }
      
      if (collectionsToRetore.includes('users')) {
        await User.deleteMany({});
        await User.insertMany(users);
      }

      if (collectionsToRetore.includes('clubs')) {
        await Club.deleteMany({});
        await Club.insertMany(clubs);
      }

      if (collectionsToRetore.includes('suggestions')) {
        await Suggestion.deleteMany({});
        await Suggestion.insertMany(suggestions);
      }

      if (collectionsToRetore.includes('leagues')) {
        await League.deleteMany({});
        await League.insertMany(leagues);
      }
    } catch (error) {
      throw new ApiError(errorCodes.Internal, error);
    }
  }
}

export default new Backup();
