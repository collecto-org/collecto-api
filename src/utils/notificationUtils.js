export const createNotificationMessage = (template, data) => {

  return template.replace(/{(\w+)}/g, (_, key) => data[key] || '');
};
