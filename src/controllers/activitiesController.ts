// @ts-nocheck
import _uniq from 'lodash/uniq';

import {
  PER_PAGE,
} from '@config/config';
import ApiError from '@utilities/apiError';
import errorCodes from '@config/errorCodes';
import { parseSearchQuery, fillRelationshipsClubsByIdForActivity } from '@utilities/helpers';
import Activity from '@models/activity';
import Club from '@models/club';

class ActivitiesController {
  get = async (ctx) => {
    const { params } = ctx;
    const { activityId } = params;

    const activity = await Activity.findById(activityId)
      .populate('user'); // Cannot populate as before & after are simple objects

    const { objectType, actionType } = activity;

    if (objectType === 'club' && actionType !== 'remove') {
      const {
        before,
        after: {
          friendships: afterFriendships = [],
          agreements: afterAgreements = [],
          positives: afterPositives = [],
          enemies: afterEnemies = [],
          derbyRivalries: afterDerbyRivalries = [],
          satellites: afterSatellites = [],
          satelliteOf: afterSatelliteOf,
        },
      } = activity;

      const allRelationshipsIds = [...afterFriendships, ...afterAgreements, ...afterPositives, ...afterEnemies, ...afterDerbyRivalries, ...afterSatellites];

      if (afterSatelliteOf) allRelationshipsIds.push(afterSatelliteOf);

      if (before) {
        const {
          friendships: beforeFriendships = [],
          agreements: beforeAgreements = [],
          positives: beforePositives = [],
          enemies: beforeEnemies = [],
          derbyRivalries: beforeDerbyRivalries = [],
          satellites: beforeSatellites = [],
          satelliteOf: beforeSatelliteOf,
        } = before;

        allRelationshipsIds.push(...beforeFriendships, ...beforeAgreements, ...beforePositives, ...beforeEnemies, ...beforeDerbyRivalries, ...beforeSatellites);
        if (beforeSatelliteOf) allRelationshipsIds.push(beforeSatelliteOf);
      }

      const uniqRelationshipsIds = _uniq(allRelationshipsIds);

      const clubs = await Club.find({
        _id: { $in: uniqRelationshipsIds },
      });

      fillRelationshipsClubsByIdForActivity(activity, clubs);
    }

    ctx.body = {
      data: activity,
    };
  }

  getPaginated = async (ctx) => {
    const { queryParsed } = ctx;
    const {
      page,
      search = {},
    } = queryParsed;

    const parsedSearch = parseSearchQuery(search);

    const activities = await Activity.find(
      parsedSearch,
      null,
      {
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
      },
    )
      .sort({ createdAt: 'descending' })
      .populate('user');

    const enhancedActivities = await Promise.all(activities.map(activity => new Promise(async (resolve, reject) => {
      try {
        const { objectType, originalObject, actionType } = activity;

        if (actionType === 'remove') resolve(activity);

        switch (objectType) {
          case 'club': {
            const club = await Club.findById(originalObject);

            if (!club) resolve(activity);

            Object.assign(activity, {
              originalObjectName: club.name,
            });

            break;
          }

          // TODO: for users etc.
          default:
            break;
        }

        resolve(activity);
      } catch (error) {
        reject(new ApiError(errorCodes.Internal, error));
      }
    })));

    const allCount = await Activity.countDocuments(parsedSearch);

    ctx.body = {
      data: enhancedActivities,
      allCount,
    };
  }
}

export default new ActivitiesController();
