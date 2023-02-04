// @ts-nocheck
import $ from 'cheerio';
import { promisify } from 'util';
import _uniqBy from 'lodash/uniqBy';
import request from 'request';
import iconv from 'iconv-lite';
import moment from 'moment';
import 'moment/locale/pl';

import { getUpcomingRoundHeader, getMatchesFromHeader } from './90minutHelpers';

moment.locale('pl');
const requestPromisify = promisify(request);

/* --------------- */
/* Clubs */
/* --------------- */
const clubs = async (url, additional = {}) => {

  const { body } = await requestPromisify(url, {
    encoding: null,
  });

  const html = iconv.decode(Buffer.from(body), 'ISO-8859-2');

  const base$ = $.load(html);

  const rows = base$('.main2').first().find('tbody tr').not(':nth-child(1), :nth-child(2), :nth-child(3), :nth-child(4)');

  const clubsNames = rows.map((_, row) => $(row)
    .find('td')
    .eq(1)
    .find('a')
    .text()).get();

  return clubsNames;
};


/* --------------- */
/* Matches */
/* --------------- */
const matches = async (url, additional = {}) => {
  const { date, seasonStartYear, seasonEndYear, seasonMonthUntil } = additional;

  const { body } = await requestPromisify(url, {
    encoding: null,
  });

  const html = iconv.decode(Buffer.from(body), 'ISO-8859-2');

  const base$ = $.load(html);

  const containers = base$('td.main');

  const container = containers.filter((_, singleContainer) => $(singleContainer).find('#90minut_tabelawyniki_belka_gora').length)[0];

  const paragraphs = $(container).find('p');

  const roundHeaders = paragraphs.filter((_, paragraph) => {
    const headerText = $(paragraph).find('table > tbody > tr:first-child > td:first-child b u').text();

    if (headerText.includes('Kolejka')) {
      const parts = headerText.split(' - '); // Split between (Kolejka X - Date)

      if (parts.length > 1) return true;
    }

    return false;
  });

  const upcomingRoundHeader = getUpcomingRoundHeader(roundHeaders, date, seasonStartYear, seasonEndYear, seasonMonthUntil); // Next Round
  const nextUpcomingRoundHeader = getUpcomingRoundHeader(roundHeaders, moment(date).add(7, 'days').toDate(), seasonStartYear, seasonEndYear, seasonMonthUntil); // One after next round

  const roundMatchesForFirst = getMatchesFromHeader(upcomingRoundHeader, seasonStartYear, seasonEndYear, seasonMonthUntil);
  const roundMatchesForSecond = getMatchesFromHeader(nextUpcomingRoundHeader, seasonStartYear, seasonEndYear, seasonMonthUntil);

  const roundMatches = $(upcomingRoundHeader).text().trim() === $(nextUpcomingRoundHeader).text().trim()
    ? roundMatchesForFirst
    : [...roundMatchesForFirst, ...roundMatchesForSecond];

  return _uniqBy(roundMatches.filter(match => !!match), ({ homeClubName, awayClubName, date: matchDate }) => [homeClubName, awayClubName, matchDate].join());
};

export default {
  clubs,
  matches,
};
