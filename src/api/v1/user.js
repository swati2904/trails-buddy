import { requestJson } from './http';

const toIsoDate = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
};

const normalizeVisit = (item) => {
  return {
    ...item,
    visitId: String(item?.visitId || item?.id || ''),
    parkId: String(item?.parkId || ''),
    parkSlug: item?.parkSlug || '',
    parkName: item?.parkName || 'Unnamed Park',
    state: item?.state || '',
    visitDate: toIsoDate(item?.visitDate),
    note: item?.note || '',
    stampCode: item?.stampCode || '',
    createdAt: toIsoDate(item?.createdAt),
    updatedAt: toIsoDate(item?.updatedAt),
  };
};

const normalizeStamp = (item) => {
  return {
    ...item,
    stampCode: item?.stampCode || '',
    parkId: String(item?.parkId || ''),
    parkSlug: item?.parkSlug || '',
    parkName: item?.parkName || 'Unnamed Park',
    visitDate: toIsoDate(item?.visitDate),
    stampedAt: toIsoDate(item?.stampedAt),
    note: item?.note || '',
  };
};

const normalizeItemsEnvelope = (response, itemNormalizer) => {
  const items = Array.isArray(response?.items)
    ? response.items
    : Array.isArray(response?.data?.items)
      ? response.data.items
      : Array.isArray(response)
        ? response
        : [];

  return {
    ...response,
    items: items.map((item) => itemNormalizer(item)),
  };
};

export const getVisitedParks = async (token) => {
  const response = await requestJson({
    path: '/users/me/parks/visited',
    token,
    fallbackMessage: 'Unable to load visited parks',
  });

  return normalizeItemsEnvelope(response, normalizeVisit);
};

export const addVisitedPark = async ({ parkId, visitDate, note }, token) => {
  const response = await requestJson({
    path: '/users/me/parks/visited',
    method: 'POST',
    token,
    body: {
      parkId,
      visitDate: visitDate || new Date().toISOString(),
      note: note || '',
    },
    fallbackMessage: 'Unable to add park visit',
  });

  return normalizeVisit(response);
};

export const updateVisitedPark = async (
  visitId,
  { visitDate, note },
  token,
) => {
  const response = await requestJson({
    path: `/users/me/parks/visited/${visitId}`,
    method: 'PUT',
    token,
    body: {
      ...(visitDate ? { visitDate } : {}),
      ...(note !== undefined ? { note } : {}),
    },
    fallbackMessage: 'Unable to update park visit',
  });

  return normalizeVisit(response);
};

export const removeVisitedPark = async (visitId, token) => {
  return requestJson({
    path: `/users/me/parks/visited/${visitId}`,
    method: 'DELETE',
    token,
    fallbackMessage: 'Unable to remove park visit',
  });
};

export const getPassbookStamps = async (token) => {
  const response = await requestJson({
    path: '/users/me/passbook/stamps',
    token,
    fallbackMessage: 'Unable to load passbook stamps',
  });

  return normalizeItemsEnvelope(response, normalizeStamp);
};
